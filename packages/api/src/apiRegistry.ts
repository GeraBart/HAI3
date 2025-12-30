/**
 * API Registry - Central registry for API services
 *
 * Manages service registration, instantiation, and mock mode.
 * Services self-register via module augmentation.
 *
 * SDK Layer: L1 (Zero @hai3 dependencies)
 */

import type {
  ApiRegistry as IApiRegistry,
  ApiServicesConfig,
  ApiPluginBase,
  PluginClass,
} from './types';
import { BaseApiService } from './BaseApiService';

/**
 * Default API configuration.
 */
const DEFAULT_CONFIG: ApiServicesConfig = {
  // Empty - mock config removed (OCP/DIP - now in MockPluginConfig)
};

/**
 * ApiRegistry Implementation
 *
 * Central registry for all API service instances.
 * Type-safe via class-based registration.
 *
 * @example
 * ```typescript
 * // Register a service by class
 * apiRegistry.register(AccountsApiService);
 *
 * // Initialize
 * apiRegistry.initialize();
 *
 * // Get service (type-safe)
 * const accounts = apiRegistry.getService(AccountsApiService);
 * ```
 */
class ApiRegistryImpl implements IApiRegistry {
  /** Service instances by class constructor */
  private services: Map<new () => BaseApiService, BaseApiService> = new Map();

  /** Configuration */
  private config: ApiServicesConfig = { ...DEFAULT_CONFIG };

  /** Global plugins storage (FIFO order) */
  private globalPlugins: ApiPluginBase[] = [];

  /** Namespaced plugin API */
  readonly plugins = {
    /**
     * Add one or more global plugins.
     * Plugins are executed in FIFO order (first added executes first).
     * Throws if a plugin of the same class is already registered.
     */
    add: (...plugins: ApiPluginBase[]): void => {
      for (const plugin of plugins) {
        // Check for duplicate plugin class via instanceof
        const isDuplicate = this.globalPlugins.some(
          (existing) => plugin.constructor === existing.constructor
        );

        if (isDuplicate) {
          throw new Error(
            `Plugin class ${plugin.constructor.name} is already registered. ` +
            `Global plugins do not allow duplicate classes.`
          );
        }

        // Append to array (FIFO order)
        this.globalPlugins.push(plugin);
      }
    },

    /**
     * Get all registered plugins in execution order.
     * Returns readonly array to prevent external modification.
     */
    getAll: (): readonly ApiPluginBase[] => {
      return this.globalPlugins;
    },

    /**
     * Check if a plugin class is registered.
     * Uses instanceof to match plugin class.
     */
    has: <T extends ApiPluginBase>(pluginClass: PluginClass<T>): boolean => {
      return this.globalPlugins.some((plugin) => plugin instanceof pluginClass);
    },

    /**
     * Get a plugin instance by class reference.
     * Returns undefined if plugin is not registered.
     */
    getPlugin: <T extends ApiPluginBase>(
      pluginClass: new (...args: never[]) => T
    ): T | undefined => {
      const plugin = this.globalPlugins.find((p) => p instanceof pluginClass);
      return plugin as T | undefined;
    },

    /**
     * Add a plugin before another plugin by class reference.
     * Throws if target plugin class is not found.
     * Throws if plugin class is already registered (duplicate).
     */
    addBefore: <T extends ApiPluginBase>(
      plugin: ApiPluginBase,
      before: PluginClass<T>
    ): void => {
      // Check for duplicate plugin class
      const isDuplicate = this.globalPlugins.some(
        (existing) => plugin.constructor === existing.constructor
      );

      if (isDuplicate) {
        throw new Error(
          `Plugin class ${plugin.constructor.name} is already registered. ` +
          `Global plugins do not allow duplicate classes.`
        );
      }

      // Find target plugin index by class (using instanceof)
      const targetIndex = this.globalPlugins.findIndex(
        (p) => p instanceof before
      );

      if (targetIndex === -1) {
        throw new Error(
          `Target plugin class ${before.name} not found. ` +
          `Cannot insert ${plugin.constructor.name} before a non-existent plugin.`
        );
      }

      // Insert before target
      this.globalPlugins.splice(targetIndex, 0, plugin);
    },

    /**
     * Add a plugin after another plugin by class reference.
     * Throws if target plugin class is not found.
     * Throws if plugin class is already registered (duplicate).
     */
    addAfter: <T extends ApiPluginBase>(
      plugin: ApiPluginBase,
      after: PluginClass<T>
    ): void => {
      // Check for duplicate plugin class
      const isDuplicate = this.globalPlugins.some(
        (existing) => plugin.constructor === existing.constructor
      );

      if (isDuplicate) {
        throw new Error(
          `Plugin class ${plugin.constructor.name} is already registered. ` +
          `Global plugins do not allow duplicate classes.`
        );
      }

      // Find target plugin index by class (using instanceof)
      const targetIndex = this.globalPlugins.findIndex(
        (p) => p instanceof after
      );

      if (targetIndex === -1) {
        throw new Error(
          `Target plugin class ${after.name} not found. ` +
          `Cannot insert ${plugin.constructor.name} after a non-existent plugin.`
        );
      }

      // Insert after target (targetIndex + 1)
      this.globalPlugins.splice(targetIndex + 1, 0, plugin);
    },

    /**
     * Remove a plugin by class reference.
     * Calls destroy() if the plugin has that method.
     * Throws if plugin is not registered.
     */
    remove: <T extends ApiPluginBase>(pluginClass: PluginClass<T>): void => {
      // Find plugin by class (using instanceof)
      const pluginIndex = this.globalPlugins.findIndex(
        (p) => p instanceof pluginClass
      );

      if (pluginIndex === -1) {
        throw new Error(
          `Plugin class ${pluginClass.name} is not registered. ` +
          `Cannot remove a non-existent plugin.`
        );
      }

      // Get the plugin instance
      const plugin = this.globalPlugins[pluginIndex];

      // Call destroy() if available
      if (plugin?.destroy) {
        plugin.destroy();
      }

      // Remove from globalPlugins array
      this.globalPlugins.splice(pluginIndex, 1);
    },
  };

  // ============================================================================
  // Registration
  // ============================================================================

  /**
   * Register an API service by class reference.
   * Service is instantiated immediately.
   */
  register<T extends BaseApiService>(serviceClass: new () => T): void {
    // Instantiate service
    const service = new serviceClass();

    // Inject global plugins provider (Task 11: OCP/DIP compliant)
    service._setGlobalPluginsProvider(() => this.plugins.getAll());

    // Store with class as key
    this.services.set(serviceClass, service);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the registry with configuration.
   * Services are already instantiated during register().
   */
  initialize(config?: ApiServicesConfig): void {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }
  }

  // ============================================================================
  // Service Access
  // ============================================================================

  /**
   * Get service by class reference.
   * Returns typed service instance.
   * Throws if service is not registered.
   */
  getService<T extends BaseApiService>(serviceClass: new () => T): T {
    const service = this.services.get(serviceClass);

    if (!service) {
      throw new Error(
        `Service not found. Did you forget to call apiRegistry.register(${serviceClass.name})?`
      );
    }

    return service as T;
  }

  /**
   * Check if service is registered.
   */
  has<T extends BaseApiService>(serviceClass: new () => T): boolean {
    return this.services.has(serviceClass);
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Get current configuration.
   */
  getConfig(): Readonly<ApiServicesConfig> {
    return { ...this.config };
  }

  // ============================================================================
  // Reset (for testing)
  // ============================================================================

  /**
   * Reset the registry to initial state.
   * Primarily used for testing.
   *
   * @internal
   */
  reset(): void {
    // Cleanup all services
    this.services.forEach((service) => {
      if (service instanceof BaseApiService) {
        service.cleanup();
      }
    });

    this.services.clear();

    // Call destroy() on each global plugin
    this.globalPlugins.forEach((plugin) => {
      if (plugin?.destroy) {
        plugin.destroy();
      }
    });

    // Clear globalPlugins array
    this.globalPlugins = [];

    this.config = { ...DEFAULT_CONFIG };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Default API registry instance.
 * Use this instance throughout the application.
 */
export const apiRegistry = new ApiRegistryImpl();

/**
 * Create a new API registry for isolated testing.
 *
 * @returns New ApiRegistry instance
 */
export function createApiRegistry(): IApiRegistry {
  return new ApiRegistryImpl();
}

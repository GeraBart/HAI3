/**
 * BaseApiService - Abstract base class for API services
 *
 * Manages protocol registration and plugin lifecycle.
 * Services extend this class to implement domain-specific API methods.
 *
 * SDK Layer: L1 (Only peer dependency on axios)
 */

import type {
  ApiService,
  ApiServiceConfig,
  ApiProtocol,
  ApiPlugin,
  MockMap,
} from './types';

/**
 * BaseApiService Implementation
 *
 * Abstract base class for all API services.
 * Manages protocols and plugins with priority-based execution.
 *
 * @example
 * ```typescript
 * class AccountsApiService extends BaseApiService {
 *   constructor() {
 *     super(
 *       { baseURL: '/api/accounts' },
 *       new RestProtocol()
 *     );
 *   }
 *
 *   async getCurrentUser(): Promise<User> {
 *     return this.protocol(RestProtocol).get('/user/current');
 *   }
 * }
 * ```
 */
export abstract class BaseApiService implements ApiService {
  /** Base configuration for all requests */
  protected readonly config: Readonly<ApiServiceConfig>;

  /** Registered protocols by constructor name */
  protected readonly protocols: Map<string, ApiProtocol> = new Map();

  /** Registered plugins sorted by priority */
  protected plugins: ApiPlugin[] = [];

  constructor(config: ApiServiceConfig, ...protocols: ApiProtocol[]) {
    this.config = Object.freeze({ ...config });

    // Initialize each protocol with callbacks
    protocols.forEach((protocol) => {
      protocol.initialize(
        this.config,
        () => this.getMockMap(),
        () => this.getPluginsInOrder()
      );
      this.protocols.set(protocol.constructor.name, protocol);
    });
  }

  // ============================================================================
  // Plugin Management
  // ============================================================================

  /**
   * Register a plugin.
   * Plugins are auto-sorted by priority (descending).
   *
   * @param plugin - Plugin instance
   */
  registerPlugin(plugin: ApiPlugin): void {
    // Check if plugin already registered
    if (this.hasPlugin(plugin.constructor as new (...args: unknown[]) => ApiPlugin)) {
      console.warn(`Plugin "${plugin.name}" is already registered. Skipping.`);
      return;
    }

    this.plugins.push(plugin);
    this.sortPluginsByPriority();
  }

  /**
   * Unregister a plugin by class.
   *
   * @param pluginClass - Plugin class constructor
   */
  unregisterPlugin<T extends ApiPlugin>(pluginClass: new (...args: any[]) => T): void {
    const index = this.plugins.findIndex(
      (p) => p.constructor.name === pluginClass.name
    );

    if (index !== -1) {
      const plugin = this.plugins[index];
      // Call destroy if available
      if ('destroy' in plugin && typeof plugin.destroy === 'function') {
        (plugin as { destroy: () => void }).destroy();
      }
      this.plugins.splice(index, 1);
    }
  }

  /**
   * Check if a plugin is registered.
   *
   * @param pluginClass - Plugin class constructor
   * @returns True if registered
   */
  hasPlugin<T extends ApiPlugin>(pluginClass: new (...args: any[]) => T): boolean {
    return this.plugins.some((p) => p.constructor.name === pluginClass.name);
  }

  /**
   * Get plugins sorted by priority (high to low).
   * Used for request handling.
   */
  getPluginsInOrder(): readonly ApiPlugin[] {
    return [...this.plugins];
  }

  /**
   * Get plugins in reverse priority order (low to high).
   * Used for response handling.
   */
  getPluginsReversed(): readonly ApiPlugin[] {
    return [...this.plugins].reverse();
  }

  /**
   * Sort plugins by priority (descending).
   */
  private sortPluginsByPriority(): void {
    this.plugins.sort((a, b) => {
      const priorityA = 'priority' in a ? (a as { priority: number }).priority : 0;
      const priorityB = 'priority' in b ? (b as { priority: number }).priority : 0;
      return priorityB - priorityA;
    });
  }

  // ============================================================================
  // Protocol Access
  // ============================================================================

  /**
   * Get a registered protocol by class.
   * Type-safe: Returns correctly typed protocol.
   *
   * @param type - Protocol class constructor
   * @returns The protocol instance
   * @throws Error if protocol not registered
   */
  protected protocol<T extends ApiProtocol>(
    type: new (...args: unknown[]) => T
  ): T {
    const protocol = this.protocols.get(type.name);

    if (!protocol) {
      throw new Error(
        `Protocol "${type.name}" is not registered on this service.`
      );
    }

    return protocol as T;
  }

  // ============================================================================
  // Mock Map (Override in subclass)
  // ============================================================================

  /**
   * Get mock data map for this service.
   * Override in subclass to provide mock responses.
   *
   * @returns Mock response map
   */
  protected getMockMap(): Readonly<MockMap> {
    return {};
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Cleanup service resources.
   * Called when service is destroyed.
   */
  cleanup(): void {
    // Cleanup all protocols
    this.protocols.forEach((protocol) => protocol.cleanup());
    this.protocols.clear();

    // Unregister all plugins
    [...this.plugins].forEach((plugin) => {
      if ('destroy' in plugin && typeof plugin.destroy === 'function') {
        (plugin as { destroy: () => void }).destroy();
      }
    });
    this.plugins = [];
  }

  // ============================================================================
  // ApiService Interface (Abstract - must be implemented by protocols)
  // ============================================================================

  /**
   * Perform GET request.
   * Must be implemented by subclass using a protocol.
   */
  abstract get<T>(url: string, params?: Record<string, string>): Promise<T>;

  /**
   * Perform POST request.
   * Must be implemented by subclass using a protocol.
   */
  abstract post<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform PUT request.
   * Must be implemented by subclass using a protocol.
   */
  abstract put<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform PATCH request.
   * Must be implemented by subclass using a protocol.
   */
  abstract patch<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform DELETE request.
   * Must be implemented by subclass using a protocol.
   */
  abstract delete<T>(url: string): Promise<T>;
}

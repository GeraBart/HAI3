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

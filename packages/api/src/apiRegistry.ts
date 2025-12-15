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
  ApiService,
  ApiServicesMap,
  ApiServicesConfig,
  MockMap,
  ServiceConstructor,
} from './types';
import { BaseApiService } from './BaseApiService';
import { MockPlugin } from './plugins/MockPlugin';

/**
 * Default API configuration.
 */
const DEFAULT_CONFIG: ApiServicesConfig = {
  useMockApi: false,
  mockDelay: 100,
};

/**
 * ApiRegistry Implementation
 *
 * Central registry for all API service instances.
 * Type-safe via module augmentation of ApiServicesMap.
 *
 * @example
 * ```typescript
 * // Register a service
 * apiRegistry.register('accounts', AccountsApiService);
 *
 * // Initialize with mock mode
 * apiRegistry.initialize({ useMockApi: true });
 *
 * // Get service (type-safe)
 * const accounts = apiRegistry.getService('accounts');
 * ```
 */
class ApiRegistryImpl implements IApiRegistry {
  /** Service classes (not instances) */
  private serviceClasses: Map<string, ServiceConstructor> = new Map();

  /** Service instances */
  private services: Map<string, ApiService> = new Map();

  /** Mock data maps by domain */
  private mockMaps: Map<string, Readonly<MockMap>> = new Map();

  /** Configuration */
  private config: ApiServicesConfig = { ...DEFAULT_CONFIG };

  /** Initialization state */
  private initialized = false;

  // ============================================================================
  // Registration
  // ============================================================================

  /**
   * Register an API service class.
   * Service is instantiated on initialize().
   */
  register<K extends string & keyof ApiServicesMap>(
    domain: K,
    serviceClass: ServiceConstructor<ApiServicesMap[K]>
  ): void {
    this.serviceClasses.set(domain, serviceClass as ServiceConstructor);

    // If already initialized, instantiate immediately
    if (this.initialized) {
      this.instantiateService(domain);
    }
  }

  /**
   * Register mock data for a service domain.
   */
  registerMocks<K extends string & keyof ApiServicesMap>(
    domain: K,
    mockMap: Readonly<MockMap>
  ): void {
    this.mockMaps.set(domain, mockMap);

    // If mock mode is active, update the service's mock plugin
    if (this.initialized && this.config.useMockApi) {
      this.updateServiceMockPlugin(domain);
    }
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize all registered services.
   */
  initialize(config?: ApiServicesConfig): void {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // Instantiate all registered services
    this.serviceClasses.forEach((_serviceClass, domain) => {
      this.instantiateService(domain);
    });

    this.initialized = true;

    // Enable mock mode if configured
    if (this.config.useMockApi) {
      this.enableMockMode();
    }
  }

  /**
   * Instantiate a service by domain.
   */
  private instantiateService(domain: string): void {
    const ServiceClass = this.serviceClasses.get(domain);
    if (!ServiceClass) {
      return;
    }

    // Check if already instantiated
    if (this.services.has(domain)) {
      return;
    }

    const service = new ServiceClass();
    this.services.set(domain, service);

    // If mock mode is active, register mock plugin
    if (this.config.useMockApi) {
      this.updateServiceMockPlugin(domain);
    }
  }

  // ============================================================================
  // Service Access
  // ============================================================================

  /**
   * Get service by domain.
   * Type is automatically inferred from ApiServicesMap.
   */
  getService<K extends string & keyof ApiServicesMap>(domain: K): ApiServicesMap[K] {
    const service = this.services.get(domain);

    if (!service) {
      throw new Error(
        `Service "${domain}" not found. Did you forget to call apiRegistry.register() and apiRegistry.initialize()?`
      );
    }

    return service as ApiServicesMap[K];
  }

  /**
   * Check if service is registered.
   */
  has<K extends string & keyof ApiServicesMap>(domain: K): boolean {
    return this.services.has(domain);
  }

  /**
   * Get all registered service domains.
   */
  getDomains(): string[] {
    return Array.from(this.services.keys());
  }

  // ============================================================================
  // Mock Mode
  // ============================================================================

  /**
   * Set mock mode dynamically.
   */
  setMockMode(useMockApi: boolean): void {
    const wasEnabled = this.config.useMockApi;
    this.config.useMockApi = useMockApi;

    if (useMockApi && !wasEnabled) {
      this.enableMockMode();
    } else if (!useMockApi && wasEnabled) {
      this.disableMockMode();
    }
  }

  /**
   * Enable mock mode on all services.
   */
  private enableMockMode(): void {
    this.services.forEach((_service, domain) => {
      this.updateServiceMockPlugin(domain);
    });
  }

  /**
   * Disable mock mode on all services.
   */
  private disableMockMode(): void {
    this.services.forEach((service) => {
      if (service instanceof BaseApiService) {
        service.unregisterPlugin(MockPlugin);
      }
    });
  }

  /**
   * Update mock plugin on a service.
   */
  private updateServiceMockPlugin(domain: string): void {
    const service = this.services.get(domain);
    if (!(service instanceof BaseApiService)) {
      return;
    }

    const mockMap = this.mockMaps.get(domain) ?? {};

    // Remove existing mock plugin if present
    service.unregisterPlugin(MockPlugin);

    // Register new mock plugin with current mock map
    service.registerPlugin(
      new MockPlugin({
        mockMap,
        delay: this.config.mockDelay,
      })
    );
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

  /**
   * Get mock map for a domain.
   * Used by services to access their mock data.
   */
  getMockMap(domain: string): Readonly<MockMap> {
    return this.mockMaps.get(domain) ?? {};
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
    this.serviceClasses.clear();
    this.mockMaps.clear();
    this.config = { ...DEFAULT_CONFIG };
    this.initialized = false;
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

/**
 * @hai3/api - Type Definitions
 *
 * Core types for HAI3 API communication.
 * Supports REST, SSE, and mock protocols.
 */

// ============================================================================
// JSON Types
// ============================================================================

/**
 * JSON-serializable primitive value
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON-serializable value (recursive)
 */
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * JSON object type
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * JSON-compatible type
 * Broader than JsonValue to accept objects without index signatures.
 * Intentionally permissive to avoid type errors while maintaining runtime JSON-serializability.
 */
export type JsonCompatible = JsonValue | object;

// ============================================================================
// Mock Types
// ============================================================================

/**
 * Mock Response Factory Function
 * Generic function that accepts a request and returns a response.
 *
 * @template TRequest - The request data type
 * @template TResponse - The response data type
 */
export type MockResponseFactory<TRequest = JsonValue, TResponse = JsonValue> = (
  requestData?: TRequest
) => TResponse;

/**
 * Mock Map
 * Maps endpoint keys to response factories.
 *
 * @example
 * ```typescript
 * const mockMap: MockMap = {
 *   'GET /users': () => [{ id: '1', name: 'John' }],
 *   'POST /users': (data) => ({ id: '2', ...data }),
 * };
 * ```
 */
export type MockMap = Record<string, MockResponseFactory<JsonValue, JsonCompatible>>;

// ============================================================================
// API Service Configuration
// ============================================================================

/**
 * API Service Configuration
 * Configuration options for an API service.
 */
export interface ApiServiceConfig {
  /** Base URL for API requests */
  baseURL: string;
  /** Default headers for all requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * API Services Global Configuration
 * Global configuration for all API services.
 */
export interface ApiServicesConfig {
  /** Whether to use mock API */
  useMockApi: boolean;
  /** Simulated delay for mock responses (ms) */
  mockDelay?: number;
}

// ============================================================================
// API Protocol Interface
// ============================================================================

/**
 * API Protocol Interface
 * Base interface for all API communication protocols.
 */
export interface ApiProtocol {
  /**
   * Initialize the protocol with configuration.
   *
   * @param config - Base service configuration
   * @param getMockMap - Function to access mock response map
   * @param getPlugins - Function to access registered plugins
   */
  initialize(
    config: Readonly<ApiServiceConfig>,
    getMockMap: () => Readonly<MockMap>,
    getPlugins: () => ReadonlyArray<ApiPlugin>
  ): void;

  /**
   * Cleanup protocol resources.
   */
  cleanup(): void;
}

/**
 * REST Protocol Configuration
 * Configuration options for REST protocol.
 */
export interface RestProtocolConfig {
  /** Whether to include credentials */
  withCredentials?: boolean;
  /** Content type header */
  contentType?: string;
}

/**
 * SSE Protocol Configuration
 * Configuration options for Server-Sent Events protocol.
 */
export interface SseProtocolConfig {
  /** Retry interval on connection loss (ms) */
  retryInterval?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
}

// ============================================================================
// API Plugin Interface
// ============================================================================

/**
 * API Plugin Request Context
 * Context passed to plugins during request lifecycle.
 */
export interface ApiPluginRequestContext {
  /** HTTP method */
  method: string;
  /** Request URL */
  url: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Request body */
  body?: unknown;
}

/**
 * API Plugin Response Context
 * Context passed to plugins during response lifecycle.
 */
export interface ApiPluginResponseContext {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response data */
  data: unknown;
}

/**
 * API Plugin Interface
 * Interface for plugins that modify API behavior.
 *
 * @example
 * ```typescript
 * class LoggingPlugin implements ApiPlugin {
 *   name = 'logging';
 *
 *   onRequest(ctx) {
 *     console.log(`Request: ${ctx.method} ${ctx.url}`);
 *     return ctx;
 *   }
 *
 *   onResponse(ctx) {
 *     console.log(`Response: ${ctx.status}`);
 *     return ctx;
 *   }
 * }
 * ```
 */
export interface ApiPlugin {
  /** Unique plugin name */
  name: string;

  /**
   * Called before request is sent.
   * Can modify the request context.
   *
   * @param context - Request context
   * @returns Modified request context (or Promise)
   */
  onRequest?(
    context: ApiPluginRequestContext
  ): ApiPluginRequestContext | Promise<ApiPluginRequestContext>;

  /**
   * Called after response is received.
   * Can modify the response context.
   *
   * @param context - Response context
   * @returns Modified response context (or Promise)
   */
  onResponse?(
    context: ApiPluginResponseContext
  ): ApiPluginResponseContext | Promise<ApiPluginResponseContext>;

  /**
   * Called when an error occurs.
   *
   * @param error - The error that occurred
   * @param context - Request context at time of error
   * @returns Modified error (or Promise)
   */
  onError?(error: Error, context: ApiPluginRequestContext): Error | Promise<Error>;
}

// ============================================================================
// API Service Interface
// ============================================================================

/**
 * API Service Interface
 * Base interface for all API services.
 * Follows Liskov Substitution Principle - any implementation can substitute.
 *
 * @example
 * ```typescript
 * class AccountsApiService implements ApiService {
 *   async get<T>(url: string): Promise<T> { ... }
 *   async post<T>(url: string, data: unknown): Promise<T> { ... }
 * }
 * ```
 */
export interface ApiService {
  /**
   * Perform GET request.
   *
   * @template T - Response type
   * @param url - Request URL
   * @param params - Optional query parameters
   * @returns Promise resolving to response data
   */
  get<T>(url: string, params?: Record<string, string>): Promise<T>;

  /**
   * Perform POST request.
   *
   * @template T - Response type
   * @param url - Request URL
   * @param data - Request body
   * @returns Promise resolving to response data
   */
  post<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform PUT request.
   *
   * @template T - Response type
   * @param url - Request URL
   * @param data - Request body
   * @returns Promise resolving to response data
   */
  put<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform PATCH request.
   *
   * @template T - Response type
   * @param url - Request URL
   * @param data - Request body
   * @returns Promise resolving to response data
   */
  patch<T>(url: string, data?: unknown): Promise<T>;

  /**
   * Perform DELETE request.
   *
   * @template T - Response type
   * @param url - Request URL
   * @returns Promise resolving to response data
   */
  delete<T>(url: string): Promise<T>;
}

// ============================================================================
// API Registry Interface
// ============================================================================

/**
 * API Services Map
 * Maps domain string constants to service types.
 * Services extend this interface via module augmentation.
 *
 * @example
 * ```typescript
 * declare module '@hai3/api' {
 *   interface ApiServicesMap {
 *     accounts: AccountsApiService;
 *     billing: BillingApiService;
 *   }
 * }
 * ```
 */
export interface ApiServicesMap {
  // Services add their types via module augmentation
  [key: string]: ApiService;
}

/**
 * Service Constructor Type
 * Constructor for API service classes.
 */
export type ServiceConstructor<T extends ApiService = ApiService> = new () => T;

/**
 * API Registry Interface
 * Central registry for all API service instances.
 *
 * @example
 * ```typescript
 * // Register a service
 * apiRegistry.register('accounts', AccountsApiService);
 *
 * // Get a service (type-safe)
 * const accounts = apiRegistry.getService('accounts');
 * const user = await accounts.getCurrentUser();
 * ```
 */
export interface ApiRegistry {
  /**
   * Register an API service.
   * Type-safe: domain must be in ApiServicesMap.
   *
   * @param domain - Service domain identifier
   * @param serviceClass - Service constructor
   */
  register<K extends string & keyof ApiServicesMap>(
    domain: K,
    serviceClass: ServiceConstructor<ApiServicesMap[K]>
  ): void;

  /**
   * Register mock data for a service.
   *
   * @param domain - Service domain identifier
   * @param mockMap - Mock response map
   */
  registerMocks<K extends string & keyof ApiServicesMap>(
    domain: K,
    mockMap: Readonly<MockMap>
  ): void;

  /**
   * Initialize all registered services.
   *
   * @param config - Global API configuration
   */
  initialize(config?: ApiServicesConfig): void;

  /**
   * Get service by domain.
   * Type is automatically inferred from ApiServicesMap.
   *
   * @param domain - Service domain identifier
   * @returns The service instance
   */
  getService<K extends string & keyof ApiServicesMap>(domain: K): ApiServicesMap[K];

  /**
   * Check if service is registered.
   *
   * @param domain - Service domain identifier
   * @returns True if service exists
   */
  has<K extends string & keyof ApiServicesMap>(domain: K): boolean;

  /**
   * Get all registered service domains.
   *
   * @returns Array of domain identifiers
   */
  getDomains(): string[];

  /**
   * Set mock mode dynamically.
   *
   * @param useMockApi - Whether to use mock API
   */
  setMockMode(useMockApi: boolean): void;

  /**
   * Get current configuration.
   *
   * @returns Current API configuration
   */
  getConfig(): Readonly<ApiServicesConfig>;
}

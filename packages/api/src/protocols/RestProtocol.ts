/**
 * RestProtocol - REST API communication protocol
 *
 * Implements REST API calls using axios.
 * Supports plugin chain for request/response interception.
 *
 * SDK Layer: L1 (Only peer dependency on axios)
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  ApiProtocol,
  ApiServiceConfig,
  ApiPlugin,
  ApiPluginRequestContext,
  ApiPluginResponseContext,
  MockMap,
  RestProtocolConfig,
} from '../types';

/**
 * Default REST protocol configuration.
 */
const DEFAULT_REST_CONFIG: RestProtocolConfig = {
  withCredentials: false,
  contentType: 'application/json',
};

/**
 * RestProtocol Implementation
 *
 * Handles REST API communication with plugin support.
 *
 * @example
 * ```typescript
 * const restProtocol = new RestProtocol({ timeout: 30000 });
 *
 * // Use in a service
 * const data = await restProtocol.get('/users');
 * ```
 */
export class RestProtocol implements ApiProtocol {
  /** Axios instance */
  private client: AxiosInstance | null = null;

  /** Base service config */
  private config: Readonly<ApiServiceConfig> | null = null;

  /** REST-specific config */
  private restConfig: RestProtocolConfig;

  /** Callback to get plugins */
  private getPlugins: () => ReadonlyArray<ApiPlugin> = () => [];

  constructor(restConfig: RestProtocolConfig = {}) {
    this.restConfig = { ...DEFAULT_REST_CONFIG, ...restConfig };
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the protocol with service configuration.
   */
  initialize(
    config: Readonly<ApiServiceConfig>,
    _getMockMap: () => Readonly<MockMap>,
    getPlugins: () => ReadonlyArray<ApiPlugin>
  ): void {
    this.config = config;
    // _getMockMap is part of the interface but not used by RestProtocol
    // MockPlugin handles its own mock map via constructor
    this.getPlugins = getPlugins;

    // Create axios instance
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': this.restConfig.contentType,
        ...config.headers,
      },
      timeout: config.timeout,
      withCredentials: this.restConfig.withCredentials,
    });
  }

  /**
   * Cleanup protocol resources.
   */
  cleanup(): void {
    this.client = null;
    this.config = null;
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  /**
   * Perform GET request.
   */
  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', url, undefined, params);
  }

  /**
   * Perform POST request.
   */
  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  /**
   * Perform PUT request.
   */
  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  /**
   * Perform PATCH request.
   */
  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }

  /**
   * Perform DELETE request.
   */
  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  // ============================================================================
  // Request Execution
  // ============================================================================

  /**
   * Execute an HTTP request with plugin chain.
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    if (!this.client) {
      throw new Error('RestProtocol not initialized. Call initialize() first.');
    }

    // Build request context for plugins
    const requestContext: ApiPluginRequestContext = {
      method,
      url,
      headers: { ...this.config?.headers },
      body: data,
    };

    try {
      // Execute onRequest plugin chain
      const processedContext = await this.executeOnRequest(requestContext);

      // Check if a plugin short-circuited with mock response
      if ('__mockResponse' in processedContext) {
        const mockData = (processedContext as { __mockResponse: T }).__mockResponse;
        return mockData;
      }

      // Build axios config
      const axiosConfig: AxiosRequestConfig = {
        method,
        url: processedContext.url,
        headers: processedContext.headers,
        data: processedContext.body,
        params,
      };

      // Execute actual HTTP request
      const response = await this.client.request(axiosConfig);

      // Build response context
      const responseContext: ApiPluginResponseContext = {
        status: response.status,
        headers: response.headers as Record<string, string>,
        data: response.data,
      };

      // Execute onResponse plugin chain (reverse order)
      const processedResponse = await this.executeOnResponse(responseContext);

      return processedResponse.data as T;
    } catch (error) {
      // Execute onError plugin chain
      const processedError = await this.executeOnError(
        error instanceof Error ? error : new Error(String(error)),
        requestContext
      );

      throw processedError;
    }
  }

  // ============================================================================
  // Plugin Chain Execution
  // ============================================================================

  /**
   * Execute onRequest plugin chain.
   * High priority plugins execute first.
   * Any plugin can short-circuit by adding __mockResponse.
   */
  private async executeOnRequest(
    context: ApiPluginRequestContext
  ): Promise<ApiPluginRequestContext & { __mockResponse?: unknown }> {
    let currentContext: ApiPluginRequestContext & { __mockResponse?: unknown } = { ...context };

    for (const plugin of this.getPlugins()) {
      if (plugin.onRequest) {
        const result = await plugin.onRequest(currentContext);
        currentContext = result as typeof currentContext;

        // Check if plugin short-circuited
        if ('__mockResponse' in currentContext) {
          break;
        }
      }
    }

    return currentContext;
  }

  /**
   * Execute onResponse plugin chain.
   * Low priority plugins execute first (reverse order).
   */
  private async executeOnResponse(
    context: ApiPluginResponseContext
  ): Promise<ApiPluginResponseContext> {
    let currentContext = { ...context };
    const plugins = [...this.getPlugins()].reverse();

    for (const plugin of plugins) {
      if (plugin.onResponse) {
        currentContext = await plugin.onResponse(currentContext);
      }
    }

    return currentContext;
  }

  /**
   * Execute onError plugin chain.
   */
  private async executeOnError(
    error: Error,
    context: ApiPluginRequestContext
  ): Promise<Error> {
    let currentError = error;
    const plugins = [...this.getPlugins()].reverse();

    for (const plugin of plugins) {
      if (plugin.onError) {
        currentError = await plugin.onError(currentError, context);
      }
    }

    return currentError;
  }
}

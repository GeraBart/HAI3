/**
 * SSE Protocol
 * Handles Server-Sent Events communication using EventSource API
 *
 * SDK Layer: L1 (Zero @hai3 dependencies)
 */

import { assign } from 'lodash';
import type {
  ApiProtocol,
  ApiServiceConfig,
  SseProtocolConfig,
  ApiPluginBase,
  SsePluginHooks,
  SseConnectContext,
  EventSourceLike,
} from '../types';
import { isSseShortCircuit } from '../types';

/**
 * SSE Protocol Implementation
 * Manages Server-Sent Events connections using EventSource API
 */
export class SseProtocol implements ApiProtocol {
  private baseConfig!: Readonly<ApiServiceConfig>;
  private connections: Map<string, EventSource> = new Map();
  private readonly config: SseProtocolConfig;
  private _getPlugins!: () => ReadonlyArray<ApiPluginBase>;
  // Class-based plugins used for generic plugin chain execution
  private _getClassPlugins!: () => ReadonlyArray<ApiPluginBase>;

  /** Global plugins shared across all SseProtocol instances */
  private static _globalPlugins: Set<SsePluginHooks> = new Set();

  /** Instance-specific plugins */
  private _instancePlugins: Set<SsePluginHooks> = new Set();

  /**
   * Global plugin management namespace
   * Plugins registered here apply to all SseProtocol instances
   */
  public static readonly globalPlugins = {
    /**
     * Add a global SSE plugin
     * @param plugin - Plugin instance implementing SsePluginHooks
     */
    add(plugin: SsePluginHooks): void {
      SseProtocol._globalPlugins.add(plugin);
    },

    /**
     * Remove a global SSE plugin
     * Calls destroy() if available
     * @param plugin - Plugin instance to remove
     */
    remove(plugin: SsePluginHooks): void {
      if (SseProtocol._globalPlugins.has(plugin)) {
        SseProtocol._globalPlugins.delete(plugin);
        plugin.destroy();
      }
    },

    /**
     * Check if a global plugin is registered
     * @param plugin - Plugin instance to check
     */
    has(plugin: SsePluginHooks): boolean {
      return SseProtocol._globalPlugins.has(plugin);
    },

    /**
     * Get all global plugins
     */
    getAll(): readonly SsePluginHooks[] {
      return Array.from(SseProtocol._globalPlugins);
    },

    /**
     * Clear all global plugins
     * Calls destroy() on each plugin if available
     */
    clear(): void {
      SseProtocol._globalPlugins.forEach((plugin) => plugin.destroy());
      SseProtocol._globalPlugins.clear();
    },
  };

  /**
   * Instance plugin management namespace
   * Plugins registered here apply only to this SseProtocol instance
   */
  public readonly plugins = {
    /**
     * Add an instance SSE plugin
     * @param plugin - Plugin instance implementing SsePluginHooks
     */
    add: (plugin: SsePluginHooks): void => {
      this._instancePlugins.add(plugin);
    },

    /**
     * Remove an instance SSE plugin
     * Calls destroy() if available
     * @param plugin - Plugin instance to remove
     */
    remove: (plugin: SsePluginHooks): void => {
      if (this._instancePlugins.has(plugin)) {
        this._instancePlugins.delete(plugin);
        plugin.destroy();
      }
    },

    /**
     * Get all instance plugins
     */
    getAll: (): readonly SsePluginHooks[] => {
      return Array.from(this._instancePlugins);
    },
  };

  constructor(config: Readonly<SseProtocolConfig> = {}) {
    this.config = assign({}, config);
  }

  /**
   * Initialize protocol with base config and plugin accessor
   */
  initialize(
    baseConfig: Readonly<ApiServiceConfig>,
    getPlugins: () => ReadonlyArray<ApiPluginBase>,
    _getClassPlugins: () => ReadonlyArray<ApiPluginBase>
  ): void {
    this.baseConfig = baseConfig;
    this._getPlugins = getPlugins;
    // Class-based plugins not yet used in SSE - will be implemented when needed
    this._getClassPlugins = _getClassPlugins;
  }

  /**
   * Get plugins (for future use).
   * @internal
   */
  getPlugins(): ReadonlyArray<ApiPluginBase> {
    return this._getPlugins?.() ?? [];
  }

  /**
   * Get class-based plugins (for future use).
   * @internal
   */
  getClassBasedPlugins(): ReadonlyArray<ApiPluginBase> {
    return this._getClassPlugins?.() ?? [];
  }

  /**
   * Cleanup protocol resources
   */
  cleanup(): void {
    // Close all active connections
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();

    // Cleanup instance plugins
    this._instancePlugins.forEach((plugin) => plugin.destroy());
    this._instancePlugins.clear();
  }

  /**
   * Get all plugins in execution order (global first, then instance).
   * @private
   */
  private getPluginsInOrder(): SsePluginHooks[] {
    return [
      ...Array.from(SseProtocol._globalPlugins),
      ...Array.from(this._instancePlugins),
    ];
  }

  /**
   * Execute SSE plugin chain for connection lifecycle
   * Iterates through all SSE-specific plugins and calls onConnect hooks
   *
   * @param context - SSE connection context
   * @returns Modified context or short-circuit response
   */
  private async executePluginChainAsync(
    context: SseConnectContext
  ): Promise<SseConnectContext | { shortCircuit: EventSourceLike }> {
    let currentContext = context;

    for (const plugin of this.getPluginsInOrder()) {
      if (plugin.onConnect) {
        const result = await plugin.onConnect(currentContext);

        if (isSseShortCircuit(result)) {
          return result;
        }

        currentContext = result;
      }
    }

    return currentContext;
  }

  /**
   * Connect to SSE stream
   * Pure implementation - uses plugin-provided EventSource or creates real one
   *
   * @param url - SSE endpoint URL (relative to baseURL)
   * @param onMessage - Callback for each SSE message
   * @param onComplete - Optional callback when stream completes
   * @returns Connection ID for disconnecting
   */
  async connect(
    url: string,
    onMessage: (event: MessageEvent) => void,
    onComplete?: () => void
  ): Promise<string> {
    const connectionId = this.generateId();

    // Build full URL for plugins (baseURL + relative url)
    const fullUrl = this.baseConfig?.baseURL
      ? `${this.baseConfig.baseURL}${url}`.replace(/\/+/g, '/').replace(':/', '://')
      : url;

    // 1. Build SSE connection context for plugin chain
    const context: SseConnectContext = {
      url: fullUrl,
      headers: {},
    };

    // 2. Execute plugin chain - allows plugins to short-circuit with mock EventSource
    const result = await this.executePluginChainAsync(context);

    // 3. Determine which EventSource to use
    let eventSource: EventSourceLike;

    if (isSseShortCircuit(result)) {
      // Plugin provided mock EventSource
      eventSource = result.shortCircuit;
    } else {
      // Create real EventSource
      const withCredentials = this.config.withCredentials ?? true;
      eventSource = new EventSource(fullUrl, { withCredentials });
    }

    // 4. Attach handlers - same code path for both mock and real
    this.attachHandlers(connectionId, eventSource, onMessage, onComplete);

    return connectionId;
  }

  /**
   * Attach event handlers to EventSource (mock or real)
   * Same implementation for both paths - ensures consistency
   *
   * @param connectionId - Generated connection ID
   * @param eventSource - EventSource to attach handlers to (mock or real)
   * @param onMessage - Callback for each SSE message
   * @param onComplete - Optional callback when stream completes
   */
  private attachHandlers(
    connectionId: string,
    eventSource: EventSourceLike,
    onMessage: (event: MessageEvent) => void,
    onComplete?: () => void
  ): void {
    // Store connection
    this.connections.set(connectionId, eventSource as EventSource);

    // Attach message handler
    eventSource.onmessage = onMessage;

    // Attach error handler
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.disconnect(connectionId);
    };

    // Listen for completion signal
    eventSource.addEventListener('done', () => {
      if (onComplete) onComplete();
      this.disconnect(connectionId);
    });
  }

  /**
   * Disconnect SSE stream
   *
   * @param connectionId - Connection ID returned from connect()
   */
  disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.close();
      this.connections.delete(connectionId);
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateId(): string {
    return `sse-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

}

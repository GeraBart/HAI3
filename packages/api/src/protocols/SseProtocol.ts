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
  ApiPlugin,
  MockMap,
  SseProtocolConfig,
} from '../types';
import { MockPlugin } from '../plugins/MockPlugin';

/**
 * SSE Protocol Implementation
 * Manages Server-Sent Events connections using EventSource API
 */
export class SseProtocol implements ApiProtocol {
  private baseConfig!: Readonly<ApiServiceConfig>;
  private connections: Map<string, EventSource | 'mock'> = new Map();
  private readonly config: SseProtocolConfig;
  private getPlugins!: () => ReadonlyArray<ApiPlugin>;

  constructor(config: Readonly<SseProtocolConfig> = {}) {
    this.config = assign({}, config);
  }

  /**
   * Initialize protocol with base config and plugin accessor
   */
  initialize(
    baseConfig: Readonly<ApiServiceConfig>,
    _getMockMap: () => Readonly<MockMap>,
    getPlugins: () => ReadonlyArray<ApiPlugin>
  ): void {
    this.baseConfig = baseConfig;
    this.getPlugins = getPlugins;
  }

  /**
   * Cleanup protocol resources
   */
  cleanup(): void {
    // Close all active connections (skip 'mock' entries)
    this.connections.forEach((conn) => {
      if (conn !== 'mock') {
        conn.close();
      }
    });
    this.connections.clear();
  }

  /**
   * Connect to SSE stream
   * Returns connection ID for cleanup
   *
   * @param url - SSE endpoint URL (relative to baseURL)
   * @param onMessage - Callback for each SSE message
   * @param onComplete - Optional callback when stream completes
   * @returns Connection ID for disconnecting
   */
  connect(
    url: string,
    onMessage: (event: MessageEvent) => void,
    onComplete?: () => void
  ): string {
    const connectionId = this.generateId();

    // Check if MockPlugin should intercept this SSE connection
    const mockPlugin = this.getPlugins().find((p) => p instanceof MockPlugin) as MockPlugin | undefined;

    if (mockPlugin) {
      // Simulate SSE streaming with mock data
      this.simulateMockStream(connectionId, url, onMessage, onComplete);
      return connectionId;
    }

    // Real SSE connection
    const withCredentials = this.config.withCredentials ?? true;
    const fullUrl = `${this.baseConfig.baseURL}${url}`;

    const eventSource = new EventSource(fullUrl, {
      withCredentials,
    });

    eventSource.onmessage = onMessage;

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.disconnect(connectionId);
    };

    // Listen for completion signal
    eventSource.addEventListener('done', () => {
      if (onComplete) onComplete();
      this.disconnect(connectionId);
    });

    this.connections.set(connectionId, eventSource);
    return connectionId;
  }

  /**
   * Simulate SSE streaming with mock data
   * Breaks response content into word-by-word chunks
   */
  private async simulateMockStream(
    connectionId: string,
    url: string,
    onMessage: (event: MessageEvent) => void,
    onComplete?: () => void
  ): Promise<void> {
    // Mark as mock connection
    this.connections.set(connectionId, 'mock');

    // Get mock plugin to access mock data
    const mockPlugin = this.getPlugins().find((p) => p instanceof MockPlugin) as MockPlugin;

    // Create a RequestConfig to get mock response
    const mockResponse = await mockPlugin.onRequest({
      url,
      method: 'GET',
      headers: {},
    });

    // If no mock or passthrough, skip
    if (!mockResponse || !('__mockResponse' in mockResponse)) {
      if (onComplete) onComplete();
      return;
    }

    // Parse the mock completion response
    const mockData = (mockResponse as { __mockResponse: { choices: Array<{ message: { content: string } }> } }).__mockResponse;
    const content = mockData.choices?.[0]?.message?.content || '';

    // Split content into words for streaming simulation
    const words = content.split(' ');

    // Stream word by word with delays
    for (let i = 0; i < words.length; i++) {
      // Check if connection was disconnected
      if (!this.connections.has(connectionId)) {
        return;
      }

      // Create SSE-style chunk
      const chunk = {
        id: `chatcmpl-mock-${Date.now()}-${i}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            delta: {
              content: words[i] + (i < words.length - 1 ? ' ' : ''),
            },
            finish_reason: i === words.length - 1 ? 'stop' : null,
          },
        ],
      };

      // Create MessageEvent
      const event = new MessageEvent('message', {
        data: JSON.stringify(chunk),
      });

      onMessage(event);

      // Add delay between chunks (50ms per word)
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Stream complete
    if (onComplete) onComplete();
    this.disconnect(connectionId);
  }

  /**
   * Disconnect SSE stream
   *
   * @param connectionId - Connection ID returned from connect()
   */
  disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Only close if it's a real EventSource (not 'mock')
      if (connection !== 'mock') {
        connection.close();
      }
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

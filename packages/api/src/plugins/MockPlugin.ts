/**
 * MockPlugin - Intercepts API requests and returns mock data
 *
 * High priority plugin (100) that short-circuits the request chain
 * when a matching mock is found.
 *
 * SDK Layer: L1 (Zero dependencies)
 */

import type {
  ApiPlugin,
  ApiPluginRequestContext,
  MockMap,
  MockResponseFactory,
} from '../types';

/**
 * MockPlugin Configuration
 */
export interface MockPluginConfig {
  /** Mock response map */
  mockMap: Readonly<MockMap>;
  /** Simulated network delay in ms */
  delay?: number;
}

/**
 * MockPlugin Implementation
 *
 * Intercepts requests and returns mock data.
 * Supports exact matches and URL patterns with :params.
 *
 * @example
 * ```typescript
 * const mockPlugin = new MockPlugin({
 *   mockMap: {
 *     'GET /users': () => [{ id: '1', name: 'John' }],
 *     'GET /users/:id': () => ({ id: '1', name: 'John' }),
 *   },
 *   delay: 100,
 * });
 * ```
 */
export class MockPlugin implements ApiPlugin {
  /** Plugin name */
  readonly name = 'MockPlugin';

  /** Priority (high = executes first) */
  readonly priority = 100;

  /** Mock response map */
  private mockMap: Readonly<MockMap>;

  /** Simulated network delay */
  private delay: number;

  constructor(config: MockPluginConfig) {
    this.mockMap = config.mockMap;
    this.delay = config.delay ?? 0;
  }

  /**
   * Update mock map.
   */
  setMockMap(mockMap: Readonly<MockMap>): void {
    this.mockMap = mockMap;
  }

  /**
   * Intercept request and return mock if available.
   */
  async onRequest(
    context: ApiPluginRequestContext
  ): Promise<ApiPluginRequestContext & { __mockResponse?: unknown }> {
    const mockFactory = this.findMockFactory(context.method, context.url);

    if (mockFactory) {
      // Simulate network delay
      if (this.delay > 0) {
        await this.simulateDelay();
      }

      // Get mock data from factory
      const mockData = mockFactory(context.body as any);

      // Return context with mock response (short-circuits chain)
      return {
        ...context,
        __mockResponse: mockData,
      };
    }

    // No mock found, pass through
    return context;
  }

  /**
   * Find a mock factory for the given method and URL.
   */
  private findMockFactory(
    method: string,
    url: string
  ): MockResponseFactory<unknown, unknown> | undefined {
    const mockKey = `${method.toUpperCase()} ${url}`;

    // Try exact match first
    const exactMatch = this.mockMap[mockKey];
    if (exactMatch) {
      return exactMatch as MockResponseFactory<unknown, unknown>;
    }

    // Try pattern matching (:param replacement)
    for (const [key, factory] of Object.entries(this.mockMap)) {
      const [keyMethod, keyUrl] = key.split(' ', 2);

      if (
        keyMethod.toUpperCase() === method.toUpperCase() &&
        this.matchUrlPattern(keyUrl, url)
      ) {
        return factory as MockResponseFactory<unknown, unknown>;
      }
    }

    return undefined;
  }

  /**
   * Match URL against pattern with :params.
   */
  private matchUrlPattern(pattern: string, url: string): boolean {
    if (!pattern.includes(':')) {
      return pattern === url;
    }

    // Convert pattern to regex
    const regexPattern = pattern
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          return '[^/]+'; // Match any segment
        }
        return segment;
      })
      .join('/');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }

  /**
   * Simulate network delay.
   */
  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Cleanup plugin resources.
   */
  destroy(): void {
    // Nothing to cleanup
  }
}

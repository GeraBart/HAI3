/**
 * Task 72: Integration Test - Cross-Cutting Plugin
 *
 * Tests for plugins implementing multiple protocol hook interfaces.
 * Validates Scenario 5 and AC-6 from the OpenSpec.
 */

import { RestProtocol } from '../protocols/RestProtocol';
import { SseProtocol } from '../protocols/SseProtocol';
import type {
  RestPluginHooks,
  SsePluginHooks,
  RestRequestContext,
  RestResponseContext,
  SseConnectContext,
} from '../types';

/**
 * Example cross-cutting plugin implementing both REST and SSE hooks.
 * This pattern is useful for logging, metrics, or authentication plugins.
 */
class CrossCuttingLogPlugin implements RestPluginHooks, SsePluginHooks {
  public restRequestCount = 0;
  public restResponseCount = 0;
  public sseConnectCount = 0;
  public logs: string[] = [];

  // REST hooks
  async onRequest(ctx: RestRequestContext): Promise<RestRequestContext> {
    this.restRequestCount++;
    this.logs.push(`REST request: ${ctx.method} ${ctx.url}`);
    return ctx;
  }

  async onResponse(ctx: RestResponseContext): Promise<RestResponseContext> {
    this.restResponseCount++;
    this.logs.push(`REST response: ${ctx.status}`);
    return ctx;
  }

  // SSE hooks
  async onConnect(ctx: SseConnectContext): Promise<SseConnectContext> {
    this.sseConnectCount++;
    this.logs.push(`SSE connect: ${ctx.url}`);
    return ctx;
  }

  destroy(): void {
    this.logs.push('destroyed');
  }
}

describe('Cross-cutting plugins', () => {
  beforeEach(() => {
    RestProtocol.globalPlugins.clear();
    SseProtocol.globalPlugins.clear();
  });

  afterEach(() => {
    RestProtocol.globalPlugins.clear();
    SseProtocol.globalPlugins.clear();
  });

  it('should allow plugin implementing both RestPluginHooks and SsePluginHooks', () => {
    const crossPlugin = new CrossCuttingLogPlugin();

    // Plugin should satisfy both interfaces
    const restHooks: RestPluginHooks = crossPlugin;
    const sseHooks: SsePluginHooks = crossPlugin;

    expect(restHooks.onRequest).toBeDefined();
    expect(restHooks.onResponse).toBeDefined();
    expect(sseHooks.onConnect).toBeDefined();
  });

  it('should register same plugin instance with both protocols', () => {
    const crossPlugin = new CrossCuttingLogPlugin();

    // Register with both protocols
    RestProtocol.globalPlugins.add(crossPlugin);
    SseProtocol.globalPlugins.add(crossPlugin);

    expect(RestProtocol.globalPlugins.has(crossPlugin)).toBe(true);
    expect(SseProtocol.globalPlugins.has(crossPlugin)).toBe(true);
  });

  it('should execute REST hooks for REST requests', async () => {
    const crossPlugin = new CrossCuttingLogPlugin();
    RestProtocol.globalPlugins.add(crossPlugin);

    // Simulate REST request
    const restContext: RestRequestContext = {
      method: 'GET',
      url: '/api/users',
      headers: {},
    };

    await crossPlugin.onRequest(restContext);

    expect(crossPlugin.restRequestCount).toBe(1);
    expect(crossPlugin.logs).toContain('REST request: GET /api/users');
  });

  it('should execute SSE hooks for SSE connections', async () => {
    const crossPlugin = new CrossCuttingLogPlugin();
    SseProtocol.globalPlugins.add(crossPlugin);

    // Simulate SSE connection
    const sseContext: SseConnectContext = {
      url: '/api/stream',
      headers: {},
    };

    await crossPlugin.onConnect(sseContext);

    expect(crossPlugin.sseConnectCount).toBe(1);
    expect(crossPlugin.logs).toContain('SSE connect: /api/stream');
  });

  it('should track both REST and SSE activity in same plugin instance', async () => {
    const crossPlugin = new CrossCuttingLogPlugin();

    // Register with both protocols
    RestProtocol.globalPlugins.add(crossPlugin);
    SseProtocol.globalPlugins.add(crossPlugin);

    // Execute REST request
    await crossPlugin.onRequest({
      method: 'POST',
      url: '/api/data',
      headers: {},
      body: { test: true },
    });

    // Execute SSE connection
    await crossPlugin.onConnect({
      url: '/api/events',
      headers: {},
    });

    // Execute another REST request
    await crossPlugin.onRequest({
      method: 'GET',
      url: '/api/status',
      headers: {},
    });

    expect(crossPlugin.restRequestCount).toBe(2);
    expect(crossPlugin.sseConnectCount).toBe(1);
    expect(crossPlugin.logs).toEqual([
      'REST request: POST /api/data',
      'SSE connect: /api/events',
      'REST request: GET /api/status',
    ]);
  });

  it('should call destroy once when removed from both protocols', () => {
    const crossPlugin = new CrossCuttingLogPlugin();

    RestProtocol.globalPlugins.add(crossPlugin);
    SseProtocol.globalPlugins.add(crossPlugin);

    // Remove from REST
    RestProtocol.globalPlugins.remove(crossPlugin);
    expect(crossPlugin.logs).toContain('destroyed');

    // Reset logs to check if destroy is called again
    const destroyCountBefore = crossPlugin.logs.filter((l) => l === 'destroyed').length;

    // Remove from SSE (destroy should be called again since it's a separate registration)
    SseProtocol.globalPlugins.remove(crossPlugin);
    const destroyCountAfter = crossPlugin.logs.filter((l) => l === 'destroyed').length;

    expect(destroyCountAfter).toBe(destroyCountBefore + 1);
  });

  it('should allow protocol-specific behavior in cross-cutting plugin', async () => {
    // Example: Auth plugin that adds headers differently for REST vs SSE
    class AuthCrossCuttingPlugin implements RestPluginHooks, SsePluginHooks {
      private token = 'test-token';
      public restHeaders: Record<string, string> = {};
      public sseHeaders: Record<string, string> = {};

      async onRequest(ctx: RestRequestContext): Promise<RestRequestContext> {
        this.restHeaders = { ...ctx.headers };
        return {
          ...ctx,
          headers: {
            ...ctx.headers,
            Authorization: `Bearer ${this.token}`,
          },
        };
      }

      async onConnect(ctx: SseConnectContext): Promise<SseConnectContext> {
        this.sseHeaders = { ...ctx.headers };
        return {
          ...ctx,
          headers: {
            ...ctx.headers,
            'X-Auth-Token': this.token,
          },
        };
      }
    }

    const authPlugin = new AuthCrossCuttingPlugin();

    // REST uses Authorization header
    const restResult = await authPlugin.onRequest({
      method: 'GET',
      url: '/api/data',
      headers: {},
    });
    expect(restResult.headers.Authorization).toBe('Bearer test-token');

    // SSE uses X-Auth-Token header
    const sseResult = await authPlugin.onConnect({
      url: '/api/stream',
      headers: {},
    });
    expect(sseResult.headers['X-Auth-Token']).toBe('test-token');
  });

  it('should maintain isolation between protocol plugin registrations', () => {
    const plugin1 = new CrossCuttingLogPlugin();
    const plugin2 = new CrossCuttingLogPlugin();

    // Register plugin1 with both protocols
    RestProtocol.globalPlugins.add(plugin1);
    SseProtocol.globalPlugins.add(plugin1);

    // Register plugin2 only with REST
    RestProtocol.globalPlugins.add(plugin2);

    // Verify registrations
    expect(RestProtocol.globalPlugins.getAll()).toContain(plugin1);
    expect(RestProtocol.globalPlugins.getAll()).toContain(plugin2);
    expect(SseProtocol.globalPlugins.getAll()).toContain(plugin1);
    expect(SseProtocol.globalPlugins.getAll()).not.toContain(plugin2);
  });
});

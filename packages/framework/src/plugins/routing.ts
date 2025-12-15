/**
 * Routing Plugin - Provides route registry auto-synced from screensets
 *
 * Framework Layer: L2
 */

import type { HAI3Plugin, RouteRegistry } from '../types';
import { createRouteRegistry } from '../registries/routeRegistry';

/**
 * Routing plugin factory.
 *
 * @returns Routing plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(routing())
 *   .build();
 *
 * // Check if a screen exists
 * const exists = app.routeRegistry.hasScreen('demo', 'home');
 * ```
 */
export function routing(): HAI3Plugin {
  return {
    name: 'routing',
    dependencies: ['screensets'],

    onRegister(_app) {
      // Route registry is created lazily during build
      // because it needs access to the screenset registry
    },

    onInit(app) {
      // Create route registry from screenset registry
      const routeRegistry = createRouteRegistry(app.screensetRegistry);

      // Attach to app (overwriting the placeholder)
      (app as { routeRegistry: RouteRegistry }).routeRegistry = routeRegistry;
    },
  };
}

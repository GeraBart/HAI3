/**
 * Screensets Plugin - Provides screenset registry and screen slice
 *
 * This is the minimal plugin for screenset orchestration.
 * It does NOT include navigation actions - those are in the navigation plugin.
 *
 * Framework Layer: L2
 */

import { screenSlice, screenActions } from '@hai3/layout';
import type { HAI3Plugin, ScreensetsConfig } from '../types';
import { createScreensetRegistry } from '../registries/screensetRegistry';

/**
 * Screensets plugin factory.
 *
 * @param config - Plugin configuration
 * @returns Screensets plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets({ autoDiscover: true }))
 *   .build();
 * ```
 */
export function screensets(config?: ScreensetsConfig): HAI3Plugin<ScreensetsConfig> {
  const screensetRegistry = createScreensetRegistry();

  return {
    name: 'screensets',
    dependencies: [],

    provides: {
      registries: {
        screensetRegistry,
      },
      slices: [screenSlice],
      actions: {
        setActiveScreen: screenActions.navigateTo,
        setScreenLoading: screenActions.setLoading,
      },
    },

    onInit(_app) {
      // Auto-discover screensets if configured
      // Note: In Vite apps, this is handled by glob imports in user code
      if (config?.autoDiscover) {
        console.log(
          '[HAI3] Auto-discover is enabled. ' +
          'Screensets should be registered via screensetRegistry.register() in your app.'
        );
      }
    },
  };
}

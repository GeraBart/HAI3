/**
 * Screensets Plugin - Provides screenset registry and screen slice
 *
 * This is the minimal plugin for screenset orchestration.
 * It does NOT include navigation actions - those are in the navigation plugin.
 *
 * Framework Layer: L2
 *
 * NOTE: Translations are NOT handled by this plugin. Screensets register
 * their translations directly with i18nRegistry via framework re-exports.
 * This maintains clean separation: @hai3/screensets has zero knowledge of i18n.
 */

import type { UnknownAction } from '@reduxjs/toolkit';
import { screensetRegistry as sdkScreensetRegistry } from '@hai3/screensets';
import { screenSlice as screenSliceImport, screenActions as screenActionsImport } from '../slices';
import type { HAI3Plugin, ScreensetsConfig, RegisterableSlice, ScreensetRegistry } from '../types';

// Type assertions for slice imports (needed for plugin system compatibility)
const screenSlice = screenSliceImport as unknown as RegisterableSlice;
type ActionCreators = Record<string, (payload?: unknown) => UnknownAction>;
const screenActions = screenActionsImport as unknown as ActionCreators;

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
  // Use the singleton SDK registry - user screensets register to this
  const screensetRegistry = sdkScreensetRegistry as ScreensetRegistry;

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
        setScreenLoading: screenActions.setScreenLoading,
      },
    },

    onInit() {
      // Auto-discover screensets if configured
      // Note: In Vite apps, this is handled by glob imports in user code
      if (config?.autoDiscover) {
        console.log(
          '[HAI3] Auto-discover is enabled. ' +
          'Screensets should be registered via screensetRegistry.register() in your app.'
        );
      }

      // NOTE: Translation wiring is NOT done here.
      // Screensets register translations directly with i18nRegistry.
      // This keeps @hai3/screensets free of i18n dependencies.
    },
  };
}

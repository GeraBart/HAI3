/**
 * Themes Plugin - Provides theme registry and changeTheme action
 *
 * Framework Layer: L2
 */

import { createAction, eventBus } from '@hai3/events';
import type { HAI3Plugin, ChangeThemePayload } from '../types';
import { createThemeRegistry } from '../registries/themeRegistry';

// Define theme events for module augmentation
declare module '@hai3/events' {
  interface EventPayloadMap {
    'theme/changed': ChangeThemePayload;
  }
}

/**
 * Themes plugin factory.
 *
 * @returns Themes plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(themes())
 *   .build();
 *
 * app.actions.changeTheme({ themeId: 'dark' });
 * ```
 */
export function themes(): HAI3Plugin {
  const themeRegistry = createThemeRegistry();
  const changeTheme = createAction<'theme/changed'>('theme/changed');

  return {
    name: 'themes',
    dependencies: [],

    provides: {
      registries: {
        themeRegistry,
      },
      actions: {
        changeTheme,
      },
    },

    onInit(_app) {
      // Subscribe to theme changes
      eventBus.on('theme/changed', (payload: ChangeThemePayload) => {
        themeRegistry.apply(payload.themeId);
      });
    },
  };
}

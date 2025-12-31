/**
 * Themes Plugin - Provides theme registry and changeTheme action
 *
 * Framework Layer: L2
 */

import { eventBus } from '@hai3/state';
import type { HAI3Plugin, ChangeThemePayload, ThemesConfig } from '../types';
import { createThemeRegistry } from '../registries/themeRegistry';

// Define theme events for module augmentation
declare module '@hai3/state' {
  interface EventPayloadMap {
    'theme/changed': ChangeThemePayload;
  }
}

/**
 * Change theme action.
 * Emits 'theme/changed' event to trigger theme application.
 *
 * @param payload - The theme change payload
 */
function changeTheme(payload: ChangeThemePayload): void {
  eventBus.emit('theme/changed', payload);
}

/**
 * Themes plugin factory.
 *
 * @param config - Optional themes configuration
 * @returns Themes plugin
 *
 * @example
 * ```typescript
 * import { applyTheme } from '@hai3/uikit';
 *
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(themes({ applyFn: applyTheme }))
 *   .build();
 *
 * app.actions.changeTheme({ themeId: 'dark' });
 * ```
 */
export function themes(config?: ThemesConfig): HAI3Plugin {
  // Create a new theme registry instance for this plugin
  const themeRegistry = createThemeRegistry(config);

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

      // Bootstrap: Apply the first registered theme (or default)
      const themes = themeRegistry.getAll();
      if (themes.length > 0) {
        themeRegistry.apply(themes[0].id);
      }
    },
  };
}

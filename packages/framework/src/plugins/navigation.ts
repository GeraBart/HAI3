/**
 * Navigation Plugin - Provides navigation actions and URL sync
 *
 * Framework Layer: L2
 *
 * NOTE: Uses layout slices from @hai3/framework (not @hai3/uicore which is deprecated)
 */

import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { eventBus } from '@hai3/state';
import { i18nRegistry } from '@hai3/i18n';
import { screenActions as screenActionsImport, menuActions as menuActionsImport } from '../slices';
import type { HAI3Plugin, NavigateToScreenPayload, NavigateToScreensetPayload } from '../types';
import type { MenuItem } from '../layoutTypes';
import type { ScreensetDefinition } from '@hai3/screensets';

// Type assertion for slice imports (needed for plugin system compatibility)
type ActionCreators = Record<string, (payload?: unknown) => UnknownAction>;
const screenActions = screenActionsImport as unknown as ActionCreators;
const menuActions = menuActionsImport as unknown as ActionCreators;

/**
 * Convert screenset menu configuration to MenuItem[] for the menu slice.
 */
function buildMenuItems(screenset: ScreensetDefinition): MenuItem[] {
  return screenset.menu.map((item) => ({
    id: item.menuItem.screenId ?? item.menuItem.id,
    label: item.menuItem.label,
    icon: item.menuItem.icon,
  }));
}

// Define navigation events for module augmentation
declare module '@hai3/state' {
  interface EventPayloadMap {
    'navigation/screen/navigated': NavigateToScreenPayload;
    'navigation/screenset/navigated': NavigateToScreensetPayload;
  }
}

/**
 * Navigate to screen action.
 * Emits 'navigation/screen/navigated' event.
 *
 * @param payload - The navigation payload
 */
function navigateToScreen(payload: NavigateToScreenPayload): void {
  eventBus.emit('navigation/screen/navigated', payload);
}

/**
 * Navigate to screenset action.
 * Emits 'navigation/screenset/navigated' event.
 *
 * @param payload - The navigation payload
 */
function navigateToScreenset(payload: NavigateToScreensetPayload): void {
  eventBus.emit('navigation/screenset/navigated', payload);
}

/**
 * Navigation plugin factory.
 *
 * @returns Navigation plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(navigation())
 *   .build();
 *
 * app.actions.navigateToScreen({ screensetId: 'demo', screenId: 'home' });
 * ```
 */
export function navigation(): HAI3Plugin {

  return {
    name: 'navigation',
    dependencies: ['screensets'],

    provides: {
      actions: {
        navigateToScreen,
        navigateToScreenset,
      },
    },

    onInit(app) {
      const dispatch = app.store.dispatch as Dispatch<UnknownAction>;
      let currentScreensetId: string | null = null;

      /**
       * Load translations for a screenset (lazy loading).
       * @param screensetId - The screenset ID
       * @param language - Optional language to load (uses current language if not specified)
       */
      async function loadScreensetTranslations(screensetId: string, language?: string): Promise<void> {
        await i18nRegistry.loadScreensetTranslations(screensetId, language as Parameters<typeof i18nRegistry.loadScreensetTranslations>[1]);
      }

      /**
       * Update menu items for the active screenset.
       * Also loads screenset translations lazily.
       */
      function updateMenuForScreenset(screensetId: string): void {
        if (screensetId === currentScreensetId) return;

        const screenset = app.screensetRegistry.get(screensetId);
        if (!screenset) return;

        currentScreensetId = screensetId;

        // Load screenset translations lazily (non-blocking)
        loadScreensetTranslations(screensetId).catch((err) => {
          console.warn(`[HAI3] Failed to load translations for screenset ${screensetId}:`, err);
        });

        const menuItems = buildMenuItems(screenset);
        dispatch(menuActions.setMenuItems(menuItems));
      }

      // Navigation to screen effect
      eventBus.on('navigation/screen/navigated', (payload: NavigateToScreenPayload) => {
        // Validate screen exists (optional in non-strict mode)
        if (app.routeRegistry && !app.routeRegistry.hasScreen(payload.screensetId, payload.screenId)) {
          console.warn(
            `Screen "${payload.screenId}" in screenset "${payload.screensetId}" not found.`
          );
          return;
        }

        // Update menu items for this screenset
        updateMenuForScreenset(payload.screensetId);

        // Update screen state
        dispatch(screenActions.navigateTo(payload.screenId));

        // Update URL if in browser environment
        // URL format: /{screenId} (screen IDs are globally unique)
        if (typeof window !== 'undefined') {
          const url = `/${payload.screenId}`;
          window.history.pushState(null, '', url);
        }
      });

      // Navigation to screenset effect (navigates to default screen)
      eventBus.on('navigation/screenset/navigated', (payload: NavigateToScreensetPayload) => {
        const screenset = app.screensetRegistry.get(payload.screensetId);

        if (!screenset) {
          console.warn(`Screenset "${payload.screensetId}" not found.`);
          return;
        }

        // Navigate to default screen of the screenset
        navigateToScreen({
          screensetId: payload.screensetId,
          screenId: screenset.defaultScreen,
        });
      });

      // Track last loaded language to detect language changes
      let lastLoadedLanguage: string | null = null;

      // Subscribe to i18nRegistry changes to reload screenset translations after language changes
      // This runs AFTER setLanguage() completes, ensuring currentLanguage is updated
      i18nRegistry.subscribe(() => {
        const currentLanguage = i18nRegistry.getLanguage();
        if (!currentLanguage || currentLanguage === lastLoadedLanguage) return;
        if (!currentScreensetId) return;

        const screenset = app.screensetRegistry.get(currentScreensetId);
        if (!screenset) return;

        lastLoadedLanguage = currentLanguage;

        // Load screenset translations for the new language
        loadScreensetTranslations(currentScreensetId, currentLanguage).then(() => {
          // Re-dispatch menu items to trigger re-render with new translations
          const menuItems = buildMenuItems(screenset);
          dispatch(menuActions.setMenuItems(menuItems));
        }).catch((err) => {
          console.warn(
            `[HAI3] Failed to reload translations for screenset ${currentScreensetId}:`,
            err
          );
        });
      });

      // Listen for browser back/forward navigation
      if (typeof window !== 'undefined') {
        window.addEventListener('popstate', () => {
          const path = window.location.pathname;
          const parts = path.split('/').filter(Boolean);

          if (parts.length >= 1) {
            // URL format: /{screenId}
            const screenId = parts[0];
            const screensetId = app.routeRegistry?.getScreensetForScreen(screenId);
            if (screensetId) {
              updateMenuForScreenset(screensetId);
              dispatch(screenActions.navigateTo(screenId));
            }
          }
        });

        // Initial navigation based on current URL or first screenset
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length >= 1) {
          // URL has screen - find its screenset and navigate
          const screenId = parts[0];
          const screensetId = app.routeRegistry?.getScreensetForScreen(screenId);
          if (screensetId) {
            navigateToScreen({ screensetId, screenId });
          } else {
            // Screen not found - navigate to first available screenset
            const screensets = app.screensetRegistry.getAll();
            if (screensets.length > 0) {
              navigateToScreenset({ screensetId: screensets[0].id });
            }
          }
        } else {
          // No URL path - navigate to first available screenset
          const screensets = app.screensetRegistry.getAll();
          if (screensets.length > 0) {
            navigateToScreenset({ screensetId: screensets[0].id });
          }
        }
      }
    },
  };
}

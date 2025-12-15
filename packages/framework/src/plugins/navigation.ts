/**
 * Navigation Plugin - Provides navigation actions and URL sync
 *
 * Framework Layer: L2
 */

import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { createAction, eventBus } from '@hai3/events';
import { screenActions } from '@hai3/layout';
import type { HAI3Plugin, NavigateToScreenPayload, NavigateToScreensetPayload } from '../types';

// Define navigation events for module augmentation
declare module '@hai3/events' {
  interface EventPayloadMap {
    'navigation/screen/navigated': NavigateToScreenPayload;
    'navigation/screenset/navigated': NavigateToScreensetPayload;
  }
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
  // Create actions
  const navigateToScreen = createAction<'navigation/screen/navigated'>('navigation/screen/navigated');
  const navigateToScreenset = createAction<'navigation/screenset/navigated'>('navigation/screenset/navigated');

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

      // Navigation to screen effect
      eventBus.on('navigation/screen/navigated', (payload: NavigateToScreenPayload) => {
        // Validate screen exists (optional in non-strict mode)
        if (app.routeRegistry && !app.routeRegistry.hasScreen(payload.screensetId, payload.screenId)) {
          console.warn(
            `Screen "${payload.screenId}" in screenset "${payload.screensetId}" not found.`
          );
          return;
        }

        // Update screen state
        dispatch(screenActions.navigateTo(payload.screenId));

        // Update URL if in browser environment
        if (typeof window !== 'undefined') {
          const url = `/${payload.screensetId}/${payload.screenId}`;
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

      // Listen for browser back/forward navigation
      if (typeof window !== 'undefined') {
        window.addEventListener('popstate', () => {
          const path = window.location.pathname;
          const parts = path.split('/').filter(Boolean);

          if (parts.length >= 2) {
            const [_screensetId, screenId] = parts;
            dispatch(screenActions.navigateTo(screenId));
          }
        });
      }
    },
  };
}

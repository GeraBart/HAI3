/**
 * Layout Plugin - Provides all layout domain slices and effects
 *
 * Framework Layer: L2
 *
 * NOTE: Layout slices are owned by @hai3/framework (not @hai3/uicore which is deprecated)
 */

import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { eventBus } from '@hai3/state';
import type { HAI3Plugin, ShowPopupPayload, RegisterableSlice } from '../types';
import {
  headerSlice as headerSliceImport,
  footerSlice as footerSliceImport,
  menuSlice as menuSliceImport,
  sidebarSlice as sidebarSliceImport,
  popupSlice as popupSliceImport,
  overlaySlice as overlaySliceImport,
  headerActions as headerActionsImport,
  footerActions as footerActionsImport,
  menuActions as menuActionsImport,
  sidebarActions as sidebarActionsImport,
  popupActions as popupActionsImport,
  overlayActions as overlayActionsImport,
} from '../slices';

// Type assertions for slice imports (needed for plugin system compatibility)
const headerSlice = headerSliceImport as unknown as RegisterableSlice;
const footerSlice = footerSliceImport as unknown as RegisterableSlice;
const menuSlice = menuSliceImport as unknown as RegisterableSlice;
const sidebarSlice = sidebarSliceImport as unknown as RegisterableSlice;
const popupSlice = popupSliceImport as unknown as RegisterableSlice;
const overlaySlice = overlaySliceImport as unknown as RegisterableSlice;

type ActionCreators = Record<string, (payload?: unknown) => UnknownAction>;
const headerActions = headerActionsImport as unknown as ActionCreators;
const footerActions = footerActionsImport as unknown as ActionCreators;
const menuActions = menuActionsImport as unknown as ActionCreators;
const sidebarActions = sidebarActionsImport as unknown as ActionCreators;
const popupActions = popupActionsImport as unknown as ActionCreators;
const overlayActions = overlayActionsImport as unknown as ActionCreators;

// Define layout events for module augmentation
declare module '@hai3/state' {
  interface EventPayloadMap {
    'layout/popup/requested': ShowPopupPayload;
    'layout/popup/hidden': void;
    'layout/overlay/requested': { id: string };
    'layout/overlay/hidden': void;
    'layout/menu/collapsed': { collapsed: boolean };
    'layout/sidebar/collapsed': { collapsed: boolean };
  }
}

/**
 * Show popup action.
 */
function showPopup(payload: ShowPopupPayload): void {
  eventBus.emit('layout/popup/requested', payload);
}

/**
 * Hide popup action.
 */
function hidePopup(): void {
  eventBus.emit('layout/popup/hidden');
}

/**
 * Show overlay action.
 */
function showOverlay(payload: { id: string }): void {
  eventBus.emit('layout/overlay/requested', payload);
}

/**
 * Hide overlay action.
 */
function hideOverlay(): void {
  eventBus.emit('layout/overlay/hidden');
}

/**
 * Toggle menu collapsed action.
 */
function toggleMenuCollapsed(payload: { collapsed: boolean }): void {
  eventBus.emit('layout/menu/collapsed', payload);
}

/**
 * Toggle sidebar collapsed action.
 */
function toggleSidebarCollapsed(payload: { collapsed: boolean }): void {
  eventBus.emit('layout/sidebar/collapsed', payload);
}

/**
 * Layout plugin factory.
 *
 * @returns Layout plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(layout())
 *   .build();
 * ```
 */
export function layout(): HAI3Plugin {

  return {
    name: 'layout',
    dependencies: ['screensets'],

    provides: {
      slices: [
        headerSlice,
        footerSlice,
        menuSlice,
        sidebarSlice,
        popupSlice,
        overlaySlice,
      ],
      actions: {
        showPopup,
        hidePopup,
        showOverlay,
        hideOverlay,
        toggleMenuCollapsed,
        toggleSidebarCollapsed,
        // Direct slice actions for backward compatibility
        setHeaderVisible: headerActions.setVisible,
        setFooterVisible: footerActions.setVisible,
        setMenuCollapsed: menuActions.setCollapsed,
        setSidebarCollapsed: sidebarActions.setCollapsed,
      },
    },

    onInit(app) {
      const dispatch = app.store.dispatch as Dispatch<UnknownAction>;

      // Popup effects
      eventBus.on('layout/popup/requested', (payload: ShowPopupPayload) => {
        dispatch(popupActions.open({
          id: payload.id,
          title: payload.title,
          content: payload.content,
          size: payload.size,
        }));
      });

      eventBus.on('layout/popup/hidden', () => {
        dispatch(popupActions.close());
      });

      // Overlay effects
      eventBus.on('layout/overlay/requested', (payload: { id: string }) => {
        dispatch(overlayActions.show({ id: payload.id }));
      });

      eventBus.on('layout/overlay/hidden', () => {
        dispatch(overlayActions.hide());
      });

      // Menu effects
      eventBus.on('layout/menu/collapsed', (payload: { collapsed: boolean }) => {
        dispatch(menuActions.setCollapsed(payload.collapsed));
      });

      // Sidebar effects
      eventBus.on('layout/sidebar/collapsed', (payload: { collapsed: boolean }) => {
        dispatch(sidebarActions.setCollapsed(payload.collapsed));
      });
    },
  };
}

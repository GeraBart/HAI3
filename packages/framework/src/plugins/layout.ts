/**
 * Layout Plugin - Provides all layout domain slices and effects
 *
 * Framework Layer: L2
 */

import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import {
  headerSlice,
  footerSlice,
  menuSlice,
  sidebarSlice,
  popupSlice,
  overlaySlice,
  headerActions,
  footerActions,
  menuActions,
  sidebarActions,
  popupActions,
  overlayActions,
} from '@hai3/layout';
import { createAction, eventBus } from '@hai3/events';
import type { HAI3Plugin, ShowPopupPayload } from '../types';

// Define layout events for module augmentation
declare module '@hai3/events' {
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
  // Create actions
  const showPopup = createAction<'layout/popup/requested'>('layout/popup/requested');
  const hidePopup = createAction<'layout/popup/hidden'>('layout/popup/hidden');
  const showOverlay = createAction<'layout/overlay/requested'>('layout/overlay/requested');
  const hideOverlay = createAction<'layout/overlay/hidden'>('layout/overlay/hidden');
  const toggleMenuCollapsed = createAction<'layout/menu/collapsed'>('layout/menu/collapsed');
  const toggleSidebarCollapsed = createAction<'layout/sidebar/collapsed'>('layout/sidebar/collapsed');

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

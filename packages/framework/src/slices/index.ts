/**
 * Layout Slices
 *
 * @hai3/framework owns all layout domain slices.
 * These slices manage header, footer, menu, sidebar, screen, popup, and overlay state.
 *
 * State access: Components use `useAppSelector` hook from @hai3/react.
 */

import { combineReducers } from '@reduxjs/toolkit';

// Import slice reducers
import headerReducer, { headerSlice, headerActions, setUser, setLoading as setHeaderLoading, clearUser } from './headerSlice';
import footerReducer, { footerSlice, footerActions, setFooterVisible, setFooterConfig } from './footerSlice';
import menuReducer, {
  menuSlice,
  menuActions,
  toggleMenu,
  setMenuCollapsed,
  setMenuItems,
  setMenuVisible,
  setMenuConfig,
} from './menuSlice';
import sidebarReducer, {
  sidebarSlice,
  sidebarActions,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarPosition,
  setSidebarTitle,
  setSidebarContent,
  setSidebarVisible,
  setSidebarWidth,
  setSidebarConfig,
} from './sidebarSlice';
import screenReducer, {
  screenSlice,
  screenActions,
  setActiveScreen,
  setScreenLoading,
  navigateTo,
  clearActiveScreen,
} from './screenSlice';
import popupReducer, {
  popupSlice,
  popupActions,
  openPopup,
  closePopup,
  closeTopPopup,
  closeAllPopups,
  type PopupSliceState,
} from './popupSlice';
import overlayReducer, {
  overlaySlice,
  overlayActions,
  showOverlay,
  hideOverlay,
  setOverlayVisible,
} from './overlaySlice';

// ============================================================================
// Constants
// ============================================================================

export const LAYOUT_SLICE_NAME = 'layout' as const;

// ============================================================================
// Combined Layout Reducer
// ============================================================================

export const layoutDomainReducers = {
  header: headerReducer,
  footer: footerReducer,
  menu: menuReducer,
  sidebar: sidebarReducer,
  screen: screenReducer,
  popup: popupReducer,
  overlay: overlayReducer,
};

export const layoutReducer = combineReducers(layoutDomainReducers);

// ============================================================================
// Slice Exports
// ============================================================================

export {
  // Slices
  headerSlice,
  footerSlice,
  menuSlice,
  sidebarSlice,
  screenSlice,
  popupSlice,
  overlaySlice,
  // Action groups
  headerActions,
  // Individual actions - header
  setUser,
  setHeaderLoading,
  clearUser,
  footerActions,
  menuActions,
  sidebarActions,
  screenActions,
  popupActions,
  overlayActions,
  // Individual actions - footer
  setFooterVisible,
  setFooterConfig,
  // Individual actions - menu
  toggleMenu,
  setMenuCollapsed,
  setMenuItems,
  setMenuVisible,
  setMenuConfig,
  // Individual actions - sidebar
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarPosition,
  setSidebarTitle,
  setSidebarContent,
  setSidebarVisible,
  setSidebarWidth,
  setSidebarConfig,
  // Individual actions - screen
  setActiveScreen,
  setScreenLoading,
  navigateTo,
  clearActiveScreen,
  // Individual actions - popup
  openPopup,
  closePopup,
  closeTopPopup,
  closeAllPopups,
  // Individual actions - overlay
  showOverlay,
  hideOverlay,
  setOverlayVisible,
};

// Type exports
export type { PopupSliceState };

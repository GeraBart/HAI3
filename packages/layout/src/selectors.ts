/**
 * Layout Selectors - State selectors for layout domains
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSelector } from '@reduxjs/toolkit';
import type {
  LayoutState,
  HeaderState,
  FooterState,
  MenuState,
  SidebarState,
  ScreenState,
  PopupState,
  OverlayState,
  MenuItemConfig,
} from './types';
import { LAYOUT_SLICE_NAME } from './slices/layoutReducer';

// ============================================================================
// Root Selector Type
// ============================================================================

/**
 * Root state type that includes layout state.
 * Applications should extend this interface.
 */
export interface RootStateWithLayout {
  [LAYOUT_SLICE_NAME]: LayoutState;
}

// ============================================================================
// Base Layout Selector
// ============================================================================

/**
 * Select the entire layout state
 */
export const selectLayout = (state: RootStateWithLayout): LayoutState =>
  state[LAYOUT_SLICE_NAME];

// ============================================================================
// Header Selectors
// ============================================================================

/**
 * Select header state
 */
export const selectHeader = createSelector(
  selectLayout,
  (layout): HeaderState => layout.header
);

/**
 * Select header visibility
 */
export const selectHeaderVisible = createSelector(
  selectHeader,
  (header): boolean => header.visible
);

/**
 * Select header user
 */
export const selectHeaderUser = createSelector(
  selectHeader,
  (header): HeaderState['user'] => header.user
);

/**
 * Select header config
 */
export const selectHeaderConfig = createSelector(
  selectHeader,
  (header) => header.config
);

// ============================================================================
// Footer Selectors
// ============================================================================

/**
 * Select footer state
 */
export const selectFooter = createSelector(
  selectLayout,
  (layout): FooterState => layout.footer
);

/**
 * Select footer visibility
 */
export const selectFooterVisible = createSelector(
  selectFooter,
  (footer): boolean => footer.visible
);

/**
 * Select footer config
 */
export const selectFooterConfig = createSelector(
  selectFooter,
  (footer) => footer.config
);

// ============================================================================
// Menu Selectors
// ============================================================================

/**
 * Select menu state
 */
export const selectMenu = createSelector(
  selectLayout,
  (layout): MenuState => layout.menu
);

/**
 * Select menu collapsed state
 */
export const selectMenuCollapsed = createSelector(
  selectMenu,
  (menu): boolean => menu.collapsed
);

/**
 * Select menu visibility
 */
export const selectMenuVisible = createSelector(
  selectMenu,
  (menu): boolean => menu.visible
);

/**
 * Select menu items
 */
export const selectMenuItems = createSelector(
  selectMenu,
  (menu): MenuItemConfig[] => menu.items
);

/**
 * Select menu item by ID
 */
export const selectMenuItemById = (id: string) =>
  createSelector(selectMenuItems, (items): MenuItemConfig | undefined =>
    items.find(item => item.id === id)
  );

// ============================================================================
// Sidebar Selectors
// ============================================================================

/**
 * Select sidebar state
 */
export const selectSidebar = createSelector(
  selectLayout,
  (layout): SidebarState => layout.sidebar
);

/**
 * Select sidebar visibility
 */
export const selectSidebarVisible = createSelector(
  selectSidebar,
  (sidebar): boolean => sidebar.visible
);

/**
 * Select sidebar collapsed state
 */
export const selectSidebarCollapsed = createSelector(
  selectSidebar,
  (sidebar): boolean => sidebar.collapsed
);

/**
 * Select sidebar width
 */
export const selectSidebarWidth = createSelector(
  selectSidebar,
  (sidebar): number => sidebar.width
);

// ============================================================================
// Screen Selectors
// ============================================================================

/**
 * Select screen state
 */
export const selectScreen = createSelector(
  selectLayout,
  (layout): ScreenState => layout.screen
);

/**
 * Select active screen ID
 */
export const selectActiveScreen = createSelector(
  selectScreen,
  (screen): string | null => screen.activeScreen
);

/**
 * Select screen loading state
 */
export const selectScreenLoading = createSelector(
  selectScreen,
  (screen): boolean => screen.loading
);

// ============================================================================
// Popup Selectors
// ============================================================================

/**
 * Select popup state
 */
export const selectPopup = createSelector(
  selectLayout,
  (layout): PopupState => layout.popup
);

/**
 * Select active popup
 */
export const selectActivePopup = createSelector(
  selectPopup,
  (popup) => popup.active
);

/**
 * Select popup stack
 */
export const selectPopupStack = createSelector(
  selectPopup,
  (popup) => popup.stack
);

/**
 * Select if any popup is open
 */
export const selectHasPopup = createSelector(
  selectPopupStack,
  (stack): boolean => stack.length > 0
);

// ============================================================================
// Overlay Selectors
// ============================================================================

/**
 * Select overlay state
 */
export const selectOverlay = createSelector(
  selectLayout,
  (layout): OverlayState => layout.overlay
);

/**
 * Select active overlay
 */
export const selectActiveOverlay = createSelector(
  selectOverlay,
  (overlay) => overlay.active
);

/**
 * Select overlay stack
 */
export const selectOverlayStack = createSelector(
  selectOverlay,
  (overlay) => overlay.stack
);

/**
 * Select if any overlay is showing
 */
export const selectHasOverlay = createSelector(
  selectOverlayStack,
  (stack): boolean => stack.length > 0
);

// ============================================================================
// Combined Selectors
// ============================================================================

/**
 * Select if any modal content is showing (popup or overlay)
 */
export const selectHasModalContent = createSelector(
  selectHasPopup,
  selectHasOverlay,
  (hasPopup, hasOverlay): boolean => hasPopup || hasOverlay
);

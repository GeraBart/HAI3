/**
 * @hai3/layout - Layout Domain Definitions
 *
 * This package provides:
 * - Layout domain type definitions (header, footer, menu, etc.)
 * - Screenset definition types
 * - Screen configuration types
 * - Branded types for type-safe IDs
 * - Redux slices for layout state management
 * - Selectors for accessing layout state
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

// Re-export all types
export {
  LayoutDomain,
  ScreensetCategory,
} from './types';

export type {
  ScreensetId,
  ScreenId,
  MenuItemConfig,
  ScreenLoader,
  ScreenConfig,
  MenuScreenItem,
  TranslationLoaderFn,
  ScreensetDefinition,
  LayoutDomainState,
  HeaderConfig,
  HeaderState,
  FooterConfig,
  FooterState,
  MenuState,
  SidebarState,
  ScreenState,
  PopupConfig,
  PopupState,
  OverlayConfig,
  OverlayState,
  LayoutState,
} from './types';

// Export slices and actions
export { headerSlice, headerActions } from './slices/headerSlice';
export { footerSlice, footerActions } from './slices/footerSlice';
export { menuSlice, menuActions } from './slices/menuSlice';
export { sidebarSlice, sidebarActions } from './slices/sidebarSlice';
export { screenSlice, screenActions } from './slices/screenSlice';
export { popupSlice, popupActions } from './slices/popupSlice';
export { overlaySlice, overlayActions } from './slices/overlaySlice';

// Export combined reducer
export {
  layoutReducer,
  layoutDomainReducers,
  LAYOUT_SLICE_NAME,
  type LayoutDomainReducers,
} from './slices/layoutReducer';

// Export selectors
export {
  // Root selector type
  type RootStateWithLayout,
  // Base selector
  selectLayout,
  // Header selectors
  selectHeader,
  selectHeaderVisible,
  selectHeaderUser,
  selectHeaderConfig,
  // Footer selectors
  selectFooter,
  selectFooterVisible,
  selectFooterConfig,
  // Menu selectors
  selectMenu,
  selectMenuCollapsed,
  selectMenuVisible,
  selectMenuItems,
  selectMenuItemById,
  // Sidebar selectors
  selectSidebar,
  selectSidebarVisible,
  selectSidebarCollapsed,
  selectSidebarWidth,
  // Screen selectors
  selectScreen,
  selectActiveScreen,
  selectScreenLoading,
  // Popup selectors
  selectPopup,
  selectActivePopup,
  selectPopupStack,
  selectHasPopup,
  // Overlay selectors
  selectOverlay,
  selectActiveOverlay,
  selectOverlayStack,
  selectHasOverlay,
  // Combined selectors
  selectHasModalContent,
} from './selectors';

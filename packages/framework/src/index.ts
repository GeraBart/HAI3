/**
 * @hai3/framework - HAI3 Framework Package
 *
 * This package provides:
 * - Plugin architecture for composable HAI3 applications
 * - Registries for screensets, themes, routes
 * - Presets for common configurations
 * - Re-exports from SDK packages for convenience
 *
 * Framework Layer: L2 (Depends on all SDK packages)
 */

// ============================================================================
// Core Exports
// ============================================================================

export { createHAI3 } from './createHAI3';
export { createHAI3App } from './createHAI3App';

// ============================================================================
// Plugin Exports
// ============================================================================

export {
  screensets,
  themes,
  layout,
  navigation,
  routing,
  i18n,
  effects,
} from './plugins';

// ============================================================================
// Preset Exports
// ============================================================================

export { presets, full, minimal, headless } from './presets';

// ============================================================================
// Registry Exports
// ============================================================================

export {
  createScreensetRegistry,
  createThemeRegistry,
  createRouteRegistry,
} from './registries';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  HAI3Config,
  HAI3Plugin,
  HAI3AppBuilder,
  HAI3App,
  PluginFactory,
  PluginProvides,
  PluginLifecycle,
  ScreensetRegistry,
  ThemeRegistry,
  ThemeConfig,
  RouteRegistry,
  Preset,
  Presets,
  ScreensetsConfig,
  NavigateToScreenPayload,
  NavigateToScreensetPayload,
  ShowPopupPayload,
  ChangeThemePayload,
  SetLanguagePayload,
} from './types';

// ============================================================================
// Re-exports from SDK packages for convenience
// ============================================================================

// From @hai3/events
export { eventBus, createAction } from '@hai3/events';
export type { EventPayloadMap, EventHandler, Action, Subscription } from '@hai3/events';

// From @hai3/store
export { createStore, getStore, registerSlice, hasSlice, createSlice } from '@hai3/store';
export type { RootState, AppDispatch, SliceObject, HAI3Store } from '@hai3/store';

// From @hai3/layout
export {
  LayoutDomain,
  ScreensetCategory,
  layoutReducer,
  layoutDomainReducers,
  LAYOUT_SLICE_NAME,
  // Domain slices
  headerSlice,
  footerSlice,
  menuSlice,
  sidebarSlice,
  screenSlice,
  popupSlice,
  overlaySlice,
  // Domain actions
  headerActions,
  footerActions,
  menuActions,
  sidebarActions,
  screenActions,
  popupActions,
  overlayActions,
  // Selectors
  selectLayout,
  selectHeader,
  selectHeaderVisible,
  selectHeaderUser,
  selectHeaderConfig,
  selectFooter,
  selectFooterVisible,
  selectFooterConfig,
  selectMenu,
  selectMenuCollapsed,
  selectMenuVisible,
  selectMenuItems,
  selectMenuItemById,
  selectSidebar,
  selectSidebarVisible,
  selectSidebarCollapsed,
  selectSidebarWidth,
  selectScreen,
  selectActiveScreen,
  selectScreenLoading,
  selectPopup,
  selectActivePopup,
  selectPopupStack,
  selectHasPopup,
  selectOverlay,
  selectActiveOverlay,
  selectOverlayStack,
  selectHasOverlay,
  selectHasModalContent,
} from '@hai3/layout';

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
  RootStateWithLayout,
  LayoutDomainReducers,
} from '@hai3/layout';

// From @hai3/api
export { apiRegistry, BaseApiService, RestProtocol, MockPlugin } from '@hai3/api';
export type { ApiService, ApiServicesMap, MockMap, ApiServiceConfig } from '@hai3/api';

// From @hai3/i18n
export { i18nRegistry, I18nRegistryImpl, createI18nRegistry, Language, SUPPORTED_LANGUAGES, getLanguageMetadata } from '@hai3/i18n';
export type { I18nConfig, TranslationLoader, TranslationDictionary, LanguageMetadata, I18nRegistry as I18nRegistryType } from '@hai3/i18n';

// ============================================================================
// Migration Helpers (for @hai3/uicore backward compatibility)
// ============================================================================

export {
  createLegacySelector,
  setDeprecationWarnings,
  isDeprecationWarningsEnabled,
  getLayoutDomainState,
  hasLegacyUicoreState,
  hasNewLayoutState,
  legacySelectors,
  STATE_PATH_MAPPING,
} from './migration';

export type {
  LegacyUicoreState,
  LegacyRootState,
  Selector,
} from './migration';

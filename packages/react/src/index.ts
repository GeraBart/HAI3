/**
 * @hai3/react - React Bindings
 *
 * This package provides:
 * - HAI3Provider context provider
 * - Type-safe hooks for state and actions
 * - AppRouter for screen rendering
 * - TextLoader for translation loading
 *
 * Layer: L3 (Depends on @hai3/framework)
 */

// ============================================================================
// Provider
// ============================================================================

export { HAI3Provider } from './HAI3Provider';
export { HAI3Context, useHAI3 } from './HAI3Context';

// ============================================================================
// Hooks
// ============================================================================

export {
  useAppDispatch,
  useAppSelector,
  useTranslation,
  useScreenTranslations,
  useNavigation,
  useTheme,
} from './hooks';

// ============================================================================
// Components
// ============================================================================

export { TextLoader, AppRouter } from './components';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  HAI3ProviderProps,
  UseHAI3Return,
  UseAppSelector,
  UseAppDispatchReturn,
  UseTranslationReturn,
  UseScreenTranslationsReturn,
  UseLanguageReturn,
  UseThemeReturn,
  UseMenuReturn,
  UseScreenReturn,
  UseNavigationReturn,
  UseScreensetReturn,
  UsePopupReturn,
  UseOverlayReturn,
  AppRouterProps,
  TextLoaderProps,
  HAI3ProviderComponent,
  AppRouterComponent,
  TextLoaderComponent,
} from './types';

// ============================================================================
// Re-exports from @hai3/framework for convenience
// ============================================================================

// These re-exports allow users to import everything from @hai3/react
// without needing to import from @hai3/framework directly

export {
  // Core
  createHAI3,
  createHAI3App,
  presets,

  // Plugins
  screensets,
  themes,
  layout,
  navigation,
  routing,
  i18n,
  effects,

  // Registries
  createScreensetRegistry,
  createThemeRegistry,
  createRouteRegistry,

  // Events
  eventBus,
  createAction,

  // Store
  createStore,
  getStore,
  registerSlice,
  hasSlice,
  createSlice,

  // Layout selectors
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

  // Layout domain exports
  LayoutDomain,
  ScreensetCategory,
  layoutReducer,
  layoutDomainReducers,
  LAYOUT_SLICE_NAME,
  headerSlice,
  footerSlice,
  menuSlice,
  sidebarSlice,
  screenSlice,
  popupSlice,
  overlaySlice,
  headerActions,
  footerActions,
  menuActions,
  sidebarActions,
  screenActions,
  popupActions,
  overlayActions,

  // API
  apiRegistry,
  BaseApiService,
  RestProtocol,
  MockPlugin,

  // I18n
  i18nRegistry,
  I18nRegistryImpl,
  createI18nRegistry,
  Language,
  SUPPORTED_LANGUAGES,
  getLanguageMetadata,
} from '@hai3/framework';

// Re-export types from @hai3/framework
export type {
  // Config
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

  // Events
  EventPayloadMap,
  EventHandler,
  Action,
  Subscription,

  // Store
  RootState,
  AppDispatch,
  SliceObject,
  HAI3Store,

  // Layout
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

  // API
  ApiService,
  ApiServicesMap,
  MockMap,
  ApiServiceConfig,

  // I18n
  I18nConfig,
  TranslationLoader,
  TranslationDictionary,
  LanguageMetadata,
  I18nRegistryType,
} from '@hai3/framework';

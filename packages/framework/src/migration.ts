/**
 * Migration Helpers - Utilities for migrating from @hai3/uicore
 *
 * These helpers assist users migrating from the deprecated @hai3/uicore package
 * to the new SDK architecture (@hai3/framework, @hai3/layout, @hai3/react).
 *
 * Framework Layer: L2
 */

import type { LayoutState, RootStateWithLayout } from '@hai3/layout';

// ============================================================================
// Types
// ============================================================================

/**
 * Legacy uicore state structure (for reference/backward compat)
 */
export interface LegacyUicoreState {
  app: {
    user: unknown | null;
    tenant: unknown | null;
    language: string | null;
    translationsReady: boolean;
    screenTranslationsVersion: number;
    loading: boolean;
    error: string | null;
    useMockApi: boolean;
  };
  layout: {
    theme: string;
    currentScreenset: string;
    selectedScreen: string | null;
  };
  header: Record<string, unknown>;
  footer: {
    screensetOptions: unknown[];
    visible: boolean;
  };
  menu: {
    collapsed: boolean;
    items: unknown[];
    visible: boolean;
  };
  sidebar: {
    collapsed: boolean;
    position: string;
    title: string | null;
    content: unknown;
    visible: boolean;
  };
  screen: {
    activeScreen: string | null;
    loading: boolean;
  };
  popup: {
    stack: unknown[];
  };
  overlay: {
    visible: boolean;
  };
}

/**
 * Legacy root state with uicore key
 */
export interface LegacyRootState {
  uicore: LegacyUicoreState;
  [key: string]: unknown;
}

/**
 * Selector function type
 */
export type Selector<TState, TResult> = (state: TState) => TResult;

// ============================================================================
// Migration Path Mapping
// ============================================================================

/**
 * State path mapping from legacy to new structure
 */
export const STATE_PATH_MAPPING = {
  // App state (moved to app slice)
  'uicore.app.user': 'app.user',
  'uicore.app.tenant': 'app.tenant',
  'uicore.app.language': 'app.language',
  'uicore.app.translationsReady': 'app.translationsReady',
  'uicore.app.loading': 'app.loading',
  'uicore.app.error': 'app.error',
  'uicore.app.useMockApi': 'app.useMockApi',

  // Layout state (split into domains)
  'uicore.layout.theme': 'app.theme',
  'uicore.layout.currentScreenset': 'app.currentScreenset',
  'uicore.layout.selectedScreen': 'layout.screen.activeScreen',

  // Domain states (moved to layout.*)
  'uicore.header': 'layout.header',
  'uicore.footer': 'layout.footer',
  'uicore.menu': 'layout.menu',
  'uicore.sidebar': 'layout.sidebar',
  'uicore.screen': 'layout.screen',
  'uicore.popup': 'layout.popup',
  'uicore.overlay': 'layout.overlay',
} as const;

// ============================================================================
// Legacy Selector Factory
// ============================================================================

let deprecationWarningsEnabled = true;

/**
 * Enable or disable deprecation warnings globally
 */
export function setDeprecationWarnings(enabled: boolean): void {
  deprecationWarningsEnabled = enabled;
}

/**
 * Check if deprecation warnings are enabled
 */
export function isDeprecationWarningsEnabled(): boolean {
  return deprecationWarningsEnabled;
}

/**
 * Create a legacy selector that wraps a new selector with deprecation warnings
 *
 * @param legacyPath - The old state path being accessed (for warning message)
 * @param newSelector - The new selector to use
 * @param migrationHint - Hint for how to migrate (optional)
 * @returns A selector that logs a deprecation warning then returns the new value
 *
 * @example
 * ```typescript
 * import { createLegacySelector, selectMenuCollapsed } from '@hai3/framework';
 *
 * // Create a legacy selector
 * const selectMenuCollapsedLegacy = createLegacySelector(
 *   'uicore.menu.collapsed',
 *   selectMenuCollapsed,
 *   'Use selectMenuCollapsed from @hai3/layout'
 * );
 *
 * // In component (will show deprecation warning in dev)
 * const collapsed = useSelector(selectMenuCollapsedLegacy);
 * ```
 */
export function createLegacySelector<TState, TResult>(
  legacyPath: string,
  newSelector: Selector<TState, TResult>,
  migrationHint?: string
): Selector<TState, TResult> {
  let hasWarned = false;

  return (state: TState): TResult => {
    if (deprecationWarningsEnabled && !hasWarned && process.env.NODE_ENV === 'development') {
      hasWarned = true;
      const newPath = STATE_PATH_MAPPING[legacyPath as keyof typeof STATE_PATH_MAPPING] ?? 'unknown';
      const hint = migrationHint ?? `Use the new state path: ${newPath}`;
      console.warn(
        `[HAI3 Migration] Deprecated selector accessing "${legacyPath}". ${hint}`
      );
    }
    return newSelector(state);
  };
}

// ============================================================================
// Legacy State Accessors
// ============================================================================

/**
 * Get layout state from the new structure
 * Maps to what was previously `state.uicore.header`, `state.uicore.menu`, etc.
 */
export function getLayoutDomainState<K extends keyof LayoutState>(
  state: RootStateWithLayout,
  domain: K
): LayoutState[K] {
  return state.layout[domain];
}

/**
 * Check if a state object has the legacy uicore structure
 */
export function hasLegacyUicoreState(state: unknown): state is LegacyRootState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'uicore' in state &&
    typeof (state as Record<string, unknown>).uicore === 'object'
  );
}

/**
 * Check if a state object has the new layout structure
 */
export function hasNewLayoutState(state: unknown): state is RootStateWithLayout {
  return (
    typeof state === 'object' &&
    state !== null &&
    'layout' in state &&
    typeof (state as Record<string, unknown>).layout === 'object'
  );
}

// ============================================================================
// Pre-built Legacy Selectors (for @hai3/uicore to re-export)
// ============================================================================

// These are imported in the deprecated @hai3/uicore package to maintain
// backward compatibility while showing deprecation warnings.

import {
  selectMenu,
  selectMenuCollapsed,
  selectMenuVisible,
  selectMenuItems,
  selectHeader,
  selectHeaderVisible,
  selectFooter,
  selectFooterVisible,
  selectSidebar,
  selectSidebarVisible,
  selectSidebarCollapsed,
  selectScreen,
  selectActiveScreen,
  selectScreenLoading,
  selectPopup,
  selectPopupStack,
  selectHasPopup,
  selectOverlay,
  selectHasOverlay,
} from '@hai3/layout';

/**
 * Legacy selectors with deprecation warnings
 * These are provided for @hai3/uicore to re-export
 */
export const legacySelectors = {
  // Menu
  selectUicoreMenu: createLegacySelector('uicore.menu', selectMenu, 'Use selectMenu from @hai3/layout'),
  selectUicoreMenuCollapsed: createLegacySelector('uicore.menu.collapsed', selectMenuCollapsed, 'Use selectMenuCollapsed from @hai3/layout'),
  selectUicoreMenuVisible: createLegacySelector('uicore.menu.visible', selectMenuVisible, 'Use selectMenuVisible from @hai3/layout'),
  selectUicoreMenuItems: createLegacySelector('uicore.menu.items', selectMenuItems, 'Use selectMenuItems from @hai3/layout'),

  // Header
  selectUicoreHeader: createLegacySelector('uicore.header', selectHeader, 'Use selectHeader from @hai3/layout'),
  selectUicoreHeaderVisible: createLegacySelector('uicore.header.visible', selectHeaderVisible, 'Use selectHeaderVisible from @hai3/layout'),

  // Footer
  selectUicoreFooter: createLegacySelector('uicore.footer', selectFooter, 'Use selectFooter from @hai3/layout'),
  selectUicoreFooterVisible: createLegacySelector('uicore.footer.visible', selectFooterVisible, 'Use selectFooterVisible from @hai3/layout'),

  // Sidebar
  selectUicoreSidebar: createLegacySelector('uicore.sidebar', selectSidebar, 'Use selectSidebar from @hai3/layout'),
  selectUicoreSidebarVisible: createLegacySelector('uicore.sidebar.visible', selectSidebarVisible, 'Use selectSidebarVisible from @hai3/layout'),
  selectUicoreSidebarCollapsed: createLegacySelector('uicore.sidebar.collapsed', selectSidebarCollapsed, 'Use selectSidebarCollapsed from @hai3/layout'),

  // Screen
  selectUicoreScreen: createLegacySelector('uicore.screen', selectScreen, 'Use selectScreen from @hai3/layout'),
  selectUicoreActiveScreen: createLegacySelector('uicore.layout.selectedScreen', selectActiveScreen, 'Use selectActiveScreen from @hai3/layout'),
  selectUicoreScreenLoading: createLegacySelector('uicore.screen.loading', selectScreenLoading, 'Use selectScreenLoading from @hai3/layout'),

  // Popup
  selectUicorePopup: createLegacySelector('uicore.popup', selectPopup, 'Use selectPopup from @hai3/layout'),
  selectUicorePopupStack: createLegacySelector('uicore.popup.stack', selectPopupStack, 'Use selectPopupStack from @hai3/layout'),
  selectUicoreHasPopup: createLegacySelector('uicore.popup.stack', selectHasPopup, 'Use selectHasPopup from @hai3/layout'),

  // Overlay
  selectUicoreOverlay: createLegacySelector('uicore.overlay', selectOverlay, 'Use selectOverlay from @hai3/layout'),
  selectUicoreHasOverlay: createLegacySelector('uicore.overlay.visible', selectHasOverlay, 'Use selectHasOverlay from @hai3/layout'),
};

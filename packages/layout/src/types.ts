/**
 * @hai3/layout - Type Definitions
 *
 * Core types for HAI3 layout domain management.
 * Defines the structure for header, footer, menu, sidebar, screen, popup, overlay.
 */

import type { ComponentType } from 'react';

// ============================================================================
// Layout Domain Enum
// ============================================================================

/**
 * Layout Domain Enum
 * Defines all layout domains that can be managed.
 */
export enum LayoutDomain {
  Header = 'header',
  Footer = 'footer',
  Menu = 'menu',
  Sidebar = 'sidebar',
  Screen = 'screen',
  Popup = 'popup',
  Overlay = 'overlay',
}

// ============================================================================
// Branded Types for Type Safety
// ============================================================================

/**
 * Branded type for Screenset IDs
 * Provides compile-time safety for screenset identification.
 *
 * @example
 * ```typescript
 * const chatScreensetId = 'chat' as ScreensetId;
 * const demoScreensetId = 'demo' as ScreensetId;
 * ```
 */
export type ScreensetId = string & { readonly __brand: 'ScreensetId' };

/**
 * Branded type for Screen IDs
 * Provides compile-time safety for screen identification.
 *
 * @example
 * ```typescript
 * const homeScreenId = 'home' as ScreenId;
 * const profileScreenId = 'profile' as ScreenId;
 * ```
 */
export type ScreenId = string & { readonly __brand: 'ScreenId' };

// ============================================================================
// Screenset Category
// ============================================================================

/**
 * Screenset Category Enum
 * Defines the three-stage development workflow categories.
 */
export enum ScreensetCategory {
  /** AI-generated initial layouts */
  Drafts = 'drafts',
  /** Designer-refined versions */
  Mockups = 'mockups',
  /** Engineer-finalized, production-ready screens */
  Production = 'production',
}

// ============================================================================
// Menu Item Configuration
// ============================================================================

/**
 * Menu Item Configuration
 * Defines the structure of a menu item.
 *
 * @example
 * ```typescript
 * const menuItem: MenuItemConfig = {
 *   id: 'dashboard',
 *   label: 'screen.dashboard:title',  // Translation key
 *   icon: 'dashboard:home',           // Icon ID
 *   screenId: 'dashboard',
 * };
 * ```
 */
export interface MenuItemConfig {
  /** Unique identifier for the menu item */
  id: string;
  /** Translation key for the label */
  label: string;
  /** Icon identifier (format: screensetId:iconName) */
  icon?: string;
  /** Screen ID to navigate to on click */
  screenId?: string;
  /** External URL (mutually exclusive with screenId) */
  href?: string;
  /** Click handler (for custom actions) */
  onClick?: () => void;
  /** Child menu items for nested menus */
  children?: MenuItemConfig[];
  /** Badge content (string or number) */
  badge?: string | number;
}

// ============================================================================
// Screen Configuration
// ============================================================================

/**
 * Screen Loader Function Type
 * Returns a Promise resolving to a module with a default React component.
 *
 * @example
 * ```typescript
 * const loader: ScreenLoader = () => import('./screens/HomeScreen');
 * ```
 */
export type ScreenLoader = () => Promise<{ default: ComponentType }>;

/**
 * Screen Configuration
 * Defines the structure of a screen.
 *
 * @example
 * ```typescript
 * const screen: ScreenConfig = {
 *   id: 'home',
 *   loader: () => import('./screens/HomeScreen'),
 * };
 * ```
 */
export interface ScreenConfig {
  /** Unique identifier for the screen */
  id: string;
  /** Lazy loader function for the screen component */
  loader: ScreenLoader;
}

// ============================================================================
// Screenset Definition
// ============================================================================

/**
 * Menu Screen Item
 * Combines menu item config with its screen loader.
 */
export interface MenuScreenItem {
  /** Menu item configuration */
  menuItem: MenuItemConfig;
  /** Screen loader function */
  screen: ScreenLoader;
}

/**
 * Translation Loader Type
 * Function that loads translations for a given language.
 */
export type TranslationLoaderFn = (language: string) => Promise<Record<string, unknown>>;

/**
 * Screenset Definition
 * Complete definition of a screenset including screens, menu, and translations.
 *
 * @example
 * ```typescript
 * const demoScreenset: ScreensetDefinition = {
 *   id: 'demo',
 *   name: 'Demo Screenset',
 *   category: ScreensetCategory.Drafts,
 *   defaultScreen: 'home',
 *   localization: demoTranslations,
 *   menu: [
 *     { menuItem: homeMenuItem, screen: () => import('./screens/HomeScreen') },
 *   ],
 * };
 * ```
 */
export interface ScreensetDefinition {
  /** Unique identifier for the screenset */
  id: string;
  /** Display name for the screenset */
  name: string;
  /** Category (drafts, mockups, production) */
  category: ScreensetCategory;
  /** Default screen ID to show when screenset is selected */
  defaultScreen: string;
  /** Translation loader for screenset-level translations */
  localization: TranslationLoaderFn;
  /** Menu items with their associated screens */
  menu: MenuScreenItem[];
}

// ============================================================================
// Layout Domain State Types
// ============================================================================

/**
 * Layout Domain State Generic Interface
 * Base interface for all layout domain states.
 *
 * @template TConfig - Additional configuration type for the domain
 */
export interface LayoutDomainState<TConfig = unknown> {
  /** Whether the domain is visible */
  visible: boolean;
  /** Domain-specific configuration */
  config: TConfig;
}

// ============================================================================
// Header Domain
// ============================================================================

/**
 * Header Configuration
 * Configuration options for the header domain.
 */
export interface HeaderConfig {
  /** Title displayed in header */
  title?: string;
  /** Logo URL */
  logo?: string;
  /** Show user menu */
  showUserMenu?: boolean;
}

/**
 * Header State
 * State for the header layout domain.
 */
export interface HeaderState extends LayoutDomainState<HeaderConfig> {
  /** Currently logged in user (if any) */
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

// ============================================================================
// Footer Domain
// ============================================================================

/**
 * Footer Configuration
 * Configuration options for the footer domain.
 */
export interface FooterConfig {
  /** Footer text */
  text?: string;
  /** Links to display */
  links?: Array<{ label: string; href: string }>;
}

/**
 * Footer State
 * State for the footer layout domain.
 */
export interface FooterState extends LayoutDomainState<FooterConfig> {}

// ============================================================================
// Menu Domain
// ============================================================================

/**
 * Menu State
 * State for the menu layout domain.
 */
export interface MenuState {
  /** Whether menu is collapsed */
  collapsed: boolean;
  /** Menu items */
  items: MenuItemConfig[];
  /** Whether menu is visible */
  visible: boolean;
}

// ============================================================================
// Sidebar Domain
// ============================================================================

/**
 * Sidebar State
 * State for the sidebar layout domain.
 */
export interface SidebarState extends LayoutDomainState<Record<string, unknown>> {
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Sidebar width in pixels */
  width: number;
}

// ============================================================================
// Screen Domain
// ============================================================================

/**
 * Screen State
 * State for the screen layout domain.
 */
export interface ScreenState {
  /** Currently active screen ID */
  activeScreen: string | null;
  /** Whether screen is loading */
  loading: boolean;
}

// ============================================================================
// Popup Domain
// ============================================================================

/**
 * Popup Configuration
 * Configuration for a popup.
 */
export interface PopupConfig {
  /** Popup ID */
  id: string;
  /** Popup title */
  title?: string;
  /** Popup content component loader */
  content?: ScreenLoader;
  /** Popup size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether popup can be closed */
  closable?: boolean;
}

/**
 * Popup State
 * State for the popup layout domain.
 */
export interface PopupState {
  /** Stack of open popups */
  stack: PopupConfig[];
  /** Currently active popup (top of stack) */
  active: PopupConfig | null;
}

// ============================================================================
// Overlay Domain
// ============================================================================

/**
 * Overlay Configuration
 * Configuration for an overlay.
 */
export interface OverlayConfig {
  /** Overlay ID */
  id: string;
  /** Overlay content component loader */
  content?: ScreenLoader;
  /** Whether clicking backdrop closes overlay */
  closeOnBackdrop?: boolean;
}

/**
 * Overlay State
 * State for the overlay layout domain.
 */
export interface OverlayState {
  /** Stack of open overlays */
  stack: OverlayConfig[];
  /** Currently active overlay (top of stack) */
  active: OverlayConfig | null;
}

// ============================================================================
// Layout State (Combined)
// ============================================================================

/**
 * Combined Layout State
 * All layout domain states combined.
 */
export interface LayoutState {
  header: HeaderState;
  footer: FooterState;
  menu: MenuState;
  sidebar: SidebarState;
  screen: ScreenState;
  popup: PopupState;
  overlay: OverlayState;
}

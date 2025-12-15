/**
 * @hai3/uikit-contracts - [DEPRECATED]
 *
 * This package is deprecated. Import types directly from @hai3/uikit instead.
 *
 * MIGRATION:
 * - ButtonVariant, ButtonSize, etc. → import from '@hai3/uikit'
 * - Theme → import from '@hai3/framework' (or define your own)
 * - TextDirection → import from '@hai3/i18n'
 *
 * These exports are maintained for backward compatibility only.
 *
 * @deprecated Import types from @hai3/uikit or @hai3/framework
 */

// Show deprecation warning on import (development only)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[@hai3/uikit-contracts] This package is deprecated.\n' +
    'Import types from @hai3/uikit or @hai3/framework instead.'
  );
}

/**
 * Component Type Contracts
 * Defines the public API that any UI Kit implementation must fulfill
 * UI Core depends on these interfaces, not concrete implementations
 */

import type { ComponentType, ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Text Direction Enum
 * Defines text direction values for RTL/LTR support
 */
export enum TextDirection {
  LeftToRight = 'ltr',
  RightToLeft = 'rtl',
}

/**
 * Theme Contract
 * Defines the structure of themes that UI Core expects
 */
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    mainMenu: {
      DEFAULT: string;
      foreground: string;
      hover: string;
      selected: string;
      border: string;
    };
    chat: {
      leftMenu: {
        DEFAULT: string;
        foreground: string;
        hover: string;
        selected: string;
        border: string;
      };
      message: {
        user: {
          background: string;
          foreground: string;
        };
        assistant: {
          background: string;
          foreground: string;
        };
      };
      input: {
        background: string;
        foreground: string;
        border: string;
      };
      codeBlock: {
        background: string;
        foreground: string;
        border: string;
        headerBackground: string;
      };
    };
    inScreenMenu: {
      DEFAULT: string;
      foreground: string;
      hover: string;
      selected: string;
      border: string;
    };
    /** Chart colors for data visualization (OKLCH format recommended) */
    chart: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  typography: {
    fontFamily: {
      sans: string[];
      mono: string[];
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
}

/**
 * Button Component Contract
 */
export enum ButtonVariant {
  Default = 'default',
  Destructive = 'destructive',
  Outline = 'outline',
  Secondary = 'secondary',
  Ghost = 'ghost',
  Link = 'link',
}

export enum ButtonSize {
  Default = 'default',
  Sm = 'sm',
  Lg = 'lg',
  Icon = 'icon',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export type ButtonComponent = ComponentType<ButtonProps>;

/**
 * DropdownButton Component Contract
 * Button with integrated chevron for dropdown triggers
 * Extends ButtonHTMLAttributes to support DropdownMenuTrigger props
 */
export interface DropdownButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export type DropdownButtonComponent = ComponentType<DropdownButtonProps>;

/**
 * IconButton Component Contract
 */
export enum IconButtonSize {
  Default = 'default',
  Small = 'sm',
  Large = 'lg',
}

export interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  'aria-label': string;
  className?: string;
}

export type IconButtonComponent = ComponentType<IconButtonProps>;

/**
 * Switch Component Contract
 */
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export type SwitchComponent = ComponentType<SwitchProps>;

/**
 * Skeleton Component Contract
 * Used for loading states
 */
export interface SkeletonProps {
  className?: string;
  /**
   * If true, skeleton inherits text color instead of using bg-muted
   * Useful for buttons, menu items, and colored text
   */
  inheritColor?: boolean;
}

export type SkeletonComponent = ComponentType<SkeletonProps>;

/**
 * Spinner Component Contract
 * Used for loading indicators
 */
export interface SpinnerProps {
  className?: string;
  icon?: ComponentType<{ className?: string }>;
  size?: string;
}

export type SpinnerComponent = ComponentType<SpinnerProps>;

/**
 * Sidebar Components Contract
 */
export interface SidebarProps {
  collapsed?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface SidebarContentProps {
  className?: string;
  children?: ReactNode;
}

export interface SidebarHeaderProps {
  logo?: ReactNode;
  logoText?: ReactNode;
  collapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface SidebarMenuProps {
  className?: string;
  children?: ReactNode;
}

export interface SidebarMenuItemProps {
  className?: string;
  children?: ReactNode;
}

export interface SidebarMenuButtonProps {
  onClick?: () => void;
  tooltip?: string;
  isActive?: boolean;
  variant?: string;
  size?: string;
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface SidebarMenuIconProps {
  className?: string;
  children?: ReactNode;
}

export interface SidebarMenuLabelProps {
  className?: string;
  children?: ReactNode;
}

export type SidebarComponent = ComponentType<SidebarProps>;
export type SidebarContentComponent = ComponentType<SidebarContentProps>;
export type SidebarHeaderComponent = ComponentType<SidebarHeaderProps>;
export type SidebarMenuComponent = ComponentType<SidebarMenuProps>;
export type SidebarMenuItemComponent = ComponentType<SidebarMenuItemProps>;
export type SidebarMenuButtonComponent = ComponentType<SidebarMenuButtonProps>;
export type SidebarMenuIconComponent = ComponentType<SidebarMenuIconProps>;
export type SidebarMenuLabelComponent = ComponentType<SidebarMenuLabelProps>;

/**
 * Header Component Contract
 */
export interface HeaderProps {
  className?: string;
  children?: ReactNode;
}

export type HeaderComponent = ComponentType<HeaderProps>;

/**
 * UserInfo Component Contract
 */
export interface UserInfoProps {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  loading?: boolean;
}

export type UserInfoComponent = ComponentType<UserInfoProps>;

/**
 * Dropdown Components Contract
 */
export interface DropdownMenuProps {
  children?: ReactNode;
  dir?: TextDirection;
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children?: ReactNode;
}

export interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children?: ReactNode;
}

export interface DropdownMenuItemProps {
  onClick?: () => void;
  children?: ReactNode;
}

export interface DropdownMenuSubProps {
  children?: ReactNode;
}

export interface DropdownMenuSubTriggerProps {
  disabled?: boolean;
  children?: ReactNode;
}

export interface DropdownMenuSubContentProps {
  children?: ReactNode;
}

export type DropdownMenuComponent = ComponentType<DropdownMenuProps>;
export type DropdownMenuTriggerComponent = ComponentType<DropdownMenuTriggerProps>;
export type DropdownMenuContentComponent = ComponentType<DropdownMenuContentProps>;
export type DropdownMenuItemComponent = ComponentType<DropdownMenuItemProps>;
export type DropdownMenuSubComponent = ComponentType<DropdownMenuSubProps>;
export type DropdownMenuSubTriggerComponent = ComponentType<DropdownMenuSubTriggerProps>;
export type DropdownMenuSubContentComponent = ComponentType<DropdownMenuSubContentProps>;

/**
 * UI Kit Component Enum
 * Defines components that UI Core requires from UI Kit
 * Part of UI Core's API contract
 */
export enum UiKitComponent {
  Button = 'Button',
  IconButton = 'IconButton',
  DropdownButton = 'DropdownButton',
  Switch = 'Switch',
  Skeleton = 'Skeleton',
  Spinner = 'Spinner',
  Header = 'Header',
  Sidebar = 'Sidebar',
  SidebarContent = 'SidebarContent',
  SidebarHeader = 'SidebarHeader',
  SidebarMenu = 'SidebarMenu',
  SidebarMenuItem = 'SidebarMenuItem',
  SidebarMenuButton = 'SidebarMenuButton',
  SidebarMenuIcon = 'SidebarMenuIcon',
  SidebarMenuLabel = 'SidebarMenuLabel',
  UserInfo = 'UserInfo',
  DropdownMenu = 'DropdownMenu',
  DropdownMenuTrigger = 'DropdownMenuTrigger',
  DropdownMenuContent = 'DropdownMenuContent',
  DropdownMenuItem = 'DropdownMenuItem',
  DropdownMenuSub = 'DropdownMenuSub',
  DropdownMenuSubTrigger = 'DropdownMenuSubTrigger',
  DropdownMenuSubContent = 'DropdownMenuSubContent',
}

/**
 * UI Kit Component Map
 * Maps component enum values to their type implementations
 */
export interface UiKitComponentMap {
  // Basic components
  [UiKitComponent.Button]: ButtonComponent;
  [UiKitComponent.IconButton]: IconButtonComponent;
  [UiKitComponent.DropdownButton]: DropdownButtonComponent;
  [UiKitComponent.Switch]: SwitchComponent;
  [UiKitComponent.Skeleton]: SkeletonComponent;
  [UiKitComponent.Spinner]: SpinnerComponent;

  // Layout components
  [UiKitComponent.Header]: HeaderComponent;
  [UiKitComponent.Sidebar]: SidebarComponent;
  [UiKitComponent.SidebarContent]: SidebarContentComponent;
  [UiKitComponent.SidebarHeader]: SidebarHeaderComponent;
  [UiKitComponent.SidebarMenu]: SidebarMenuComponent;
  [UiKitComponent.SidebarMenuItem]: SidebarMenuItemComponent;
  [UiKitComponent.SidebarMenuButton]: SidebarMenuButtonComponent;
  [UiKitComponent.SidebarMenuIcon]: SidebarMenuIconComponent;
  [UiKitComponent.SidebarMenuLabel]: SidebarMenuLabelComponent;

  // Domain components
  [UiKitComponent.UserInfo]: UserInfoComponent;

  // Dropdown components
  [UiKitComponent.DropdownMenu]: DropdownMenuComponent;
  [UiKitComponent.DropdownMenuTrigger]: DropdownMenuTriggerComponent;
  [UiKitComponent.DropdownMenuContent]: DropdownMenuContentComponent;
  [UiKitComponent.DropdownMenuItem]: DropdownMenuItemComponent;
  [UiKitComponent.DropdownMenuSub]: DropdownMenuSubComponent;
  [UiKitComponent.DropdownMenuSubTrigger]: DropdownMenuSubTriggerComponent;
  [UiKitComponent.DropdownMenuSubContent]: DropdownMenuSubContentComponent;
}

/**
 * Component Names - for type-safe registration
 */
export type ComponentName = keyof UiKitComponentMap;

/**
 * UI Kit Icon Enum
 * Defines well-known icons that UI Core requires from UI Kit
 * Apps must register icons with these IDs
 */
export enum UiKitIcon {
  Close = 'close',
  AppLogo = 'app-logo',
  AppLogoText = 'app-logo-text',
}

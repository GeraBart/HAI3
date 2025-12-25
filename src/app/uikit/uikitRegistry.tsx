/**
 * UI Kit Registry for HAI3 Demo App
 * Registers HAI3 UI Kit components and icons with UI Core
 * Self-registers on import, similar to themeRegistry
 */

import { uikitRegistry, UiKitIcon } from '@hai3/react';
import {
  Button,
  IconButton,
  DropdownButton,
  Switch,
  Skeleton,
  Spinner,
  Header,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuIcon,
  SidebarMenuLabel,
  UserInfo,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  CloseIcon,
  CLOSE_ICON_ID,
} from '@hai3/uikit';
import { HAI3LogoIcon, APP_LOGO_ICON_ID } from '../icons/HAI3LogoIcon';
import { HAI3LogoTextIcon, APP_LOGO_TEXT_ICON_ID } from '../icons/HAI3LogoTextIcon';

// Re-export icon IDs for use by layout components
export { CLOSE_ICON_ID, APP_LOGO_ICON_ID, APP_LOGO_TEXT_ICON_ID };

// Register all HAI3 UI Kit components
uikitRegistry.registerComponents({
  // Basic components
  Button: Button as import('@hai3/uikit').ButtonComponent, // Type assertion to bridge contract/implementation mismatch
  IconButton: IconButton as import('@hai3/uikit').IconButtonComponent,
  DropdownButton: DropdownButton as import('@hai3/uikit').DropdownButtonComponent,
  Switch: Switch as import('@hai3/uikit').SwitchComponent,
  Skeleton: Skeleton as import('@hai3/uikit').SkeletonComponent,
  Spinner: Spinner as import('@hai3/uikit').SpinnerComponent,

  // Layout components
  Header,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem: SidebarMenuItem as import('@hai3/uikit').SidebarMenuItemComponent,
  SidebarMenuButton: SidebarMenuButton as import('@hai3/uikit').SidebarMenuButtonComponent,
  SidebarMenuIcon: SidebarMenuIcon as import('@hai3/uikit').SidebarMenuIconComponent,
  SidebarMenuLabel: SidebarMenuLabel as import('@hai3/uikit').SidebarMenuLabelComponent,

  // Domain components
  UserInfo,

  // Dropdown components
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem: DropdownMenuItem as import('@hai3/uikit').DropdownMenuItemComponent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
});

// Register core framework icons
uikitRegistry.registerIcons({
  [UiKitIcon.Close]: <CloseIcon />,
  [UiKitIcon.AppLogo]: <HAI3LogoIcon />,
  [UiKitIcon.AppLogoText]: <HAI3LogoTextIcon />,
});

/**
 * Menu Component
 *
 * Side navigation menu displaying screenset menu items.
 * Uses @hai3/uikit Sidebar components for proper styling and collapsible behavior.
 */

import React from 'react';
import { useAppSelector, useNavigation, uikitRegistry, UiKitIcon, type MenuState, type MenuItem } from '@hai3/react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuIcon,
  SidebarHeader,
} from '@hai3/uikit';
import { menuActions } from '@hai3/framework';
import { useDispatch } from 'react-redux';

export interface MenuProps {
  children?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  const dispatch = useDispatch();
  const menuState = useAppSelector((state) => state['layout/menu'] as MenuState | undefined);
  const { currentScreen, navigateToScreen, currentScreenset } = useNavigation();

  const collapsed = menuState?.collapsed ?? false;
  const items: MenuItem[] = menuState?.items ?? [];

  // Get app logo icons from registry
  const AppLogo = uikitRegistry.getIcon(UiKitIcon.AppLogo);
  const AppLogoText = uikitRegistry.getIcon(UiKitIcon.AppLogoText);

  const handleToggleCollapse = () => {
    dispatch(menuActions.toggleMenu());
  };

  return (
    <Sidebar collapsed={collapsed}>
      {/* Logo/Brand area with collapse button */}
      <SidebarHeader
        logo={AppLogo}
        logoText={!collapsed ? AppLogoText : undefined}
        collapsed={collapsed}
        onClick={handleToggleCollapse}
      />

      {/* Menu items */}
      <SidebarContent>
        <SidebarMenu>
          {items.map((item: MenuItem) => {
            const isActive = item.id === currentScreen;
            const icon = item.icon ? uikitRegistry.getIcon(item.icon) : null;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => navigateToScreen(currentScreenset ?? '', item.id)}
                  tooltip={collapsed ? item.label : undefined}
                >
                  {icon && (
                    <SidebarMenuIcon>
                      {icon}
                    </SidebarMenuIcon>
                  )}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {children}
    </Sidebar>
  );
};

Menu.displayName = 'Menu';

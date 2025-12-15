import React from 'react';
import { useAppSelector } from '../../../hooks/useRedux';
import { navigateToScreen } from '../../../core/actions';
import { toggleMenu } from '../../../core/actions';
import { uikitRegistry } from '../../../uikit/uikitRegistry';
import { UiKitComponent, UiKitIcon } from '@hai3/uikit';
import { useTranslation } from '../../../i18n/useTranslation';
import { TextLoader } from '../../../i18n/TextLoader';

/**
 * Menu Domain - Uses tailored shadcn sidebar components
 * Composes shadcn primitives with Redux state management
 * Purely presentational - responds to user clicks only
 * Initial navigation handled by AppRouter (default route)
 */
export const Menu: React.FC = () => {
  const { items, collapsed, visible } = useAppSelector((state) => state.uicore.menu);
  const selectedScreen = useAppSelector((state) => state.uicore.layout.selectedScreen);
  const { t } = useTranslation();

  if (!visible) return null;

  const Sidebar = uikitRegistry.getComponent(UiKitComponent.Sidebar);
  const SidebarHeader = uikitRegistry.getComponent(UiKitComponent.SidebarHeader);
  const SidebarContent = uikitRegistry.getComponent(UiKitComponent.SidebarContent);
  const SidebarMenu = uikitRegistry.getComponent(UiKitComponent.SidebarMenu);
  const SidebarMenuItem = uikitRegistry.getComponent(UiKitComponent.SidebarMenuItem);
  const SidebarMenuButton = uikitRegistry.getComponent(UiKitComponent.SidebarMenuButton);
  const SidebarMenuIcon = uikitRegistry.getComponent(UiKitComponent.SidebarMenuIcon);
  const SidebarMenuLabel = uikitRegistry.getComponent(UiKitComponent.SidebarMenuLabel);

  const logoIcon = uikitRegistry.getIcon(UiKitIcon.AppLogo);
  const logoTextIcon = uikitRegistry.getIcon(UiKitIcon.AppLogoText);

  const handleToggle = (): void => {
    toggleMenu();
  };

  return (
    <Sidebar collapsed={collapsed}>
      <SidebarHeader
        logo={logoIcon}
        logoText={logoTextIcon}
        collapsed={collapsed}
        onClick={handleToggle}
      />
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const icon = uikitRegistry.getIcon(item.icon || '');
            const isActive = selectedScreen === item.id;
            const translatedLabel = t(item.label);

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={translatedLabel}
                  onClick={() => navigateToScreen(item.id)}
                >
                  {icon && <SidebarMenuIcon>{icon}</SidebarMenuIcon>}
                  <SidebarMenuLabel>
                    <TextLoader skeletonClassName="h-4 w-20" inheritColor>
                      {translatedLabel}
                    </TextLoader>
                  </SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

Menu.displayName = 'Menu';

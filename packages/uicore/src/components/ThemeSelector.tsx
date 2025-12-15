import React from 'react';
import { upperFirst } from 'lodash';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useTranslation } from '../i18n/useTranslation';
import { uikitRegistry } from '../uikit/uikitRegistry';
import { UiKitComponent, ButtonVariant } from '@hai3/uikit';
import { changeTheme } from '../core/actions';
import { themeRegistry } from '../theme/themeRegistry';

/**
 * ThemeSelector Component
 * Redux-aware component for theme selection using DropdownMenu
 * Can be used in Footer, Header, Sidebar, or anywhere else
 */

export interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.uicore.layout.theme);
  const { direction } = useTranslation();

  const DropdownMenu = uikitRegistry.getComponent(UiKitComponent.DropdownMenu);
  const DropdownMenuTrigger = uikitRegistry.getComponent(UiKitComponent.DropdownMenuTrigger);
  const DropdownMenuContent = uikitRegistry.getComponent(UiKitComponent.DropdownMenuContent);
  const DropdownMenuItem = uikitRegistry.getComponent(UiKitComponent.DropdownMenuItem);
  const DropdownButton = uikitRegistry.getComponent(UiKitComponent.DropdownButton);

  const formatThemeName = (themeName: string): string => {
    return themeName
      .split('-')
      .map(word => upperFirst(word))
      .join(' ');
  };

  // Get themes directly from registry
  const availableThemes = themeRegistry.getThemeNames();

  return (
    <div className={`inline-flex items-center gap-2 rtl:flex-row-reverse ${className}`}>
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        Theme:
      </label>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <DropdownButton variant={ButtonVariant.Outline}>
            {formatThemeName(currentTheme)}
          </DropdownButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {availableThemes.map((themeName) => (
            <DropdownMenuItem
              key={themeName}
              onClick={() => dispatch(changeTheme(themeName))}
            >
              {formatThemeName(themeName)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

ThemeSelector.displayName = 'ThemeSelector';

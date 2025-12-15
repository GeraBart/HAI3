import React from 'react';
import { upperFirst } from 'lodash';
import { useAppDispatch, useAppSelector, useTranslation } from '@hai3/uicore';
import { ButtonVariant } from '@hai3/uikit';
import { changeTheme, themeRegistry } from '@hai3/uicore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownButton,
} from '@hai3/uikit';
import { useStudioContext } from '../StudioProvider';

/**
 * ThemeSelector Component
 * Redux-aware component for theme selection using DropdownMenu
 */

export interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.uicore.layout.theme);
  const { portalContainer } = useStudioContext();
  const { t } = useTranslation();

  const formatThemeName = (themeName: string): string => {
    return themeName
      .split('-')
      .map(word => upperFirst(word))
      .join(' ');
  };

  // Get themes directly from registry
  const availableThemes = themeRegistry.getThemeNames();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        {t('studio:controls.theme')}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownButton variant={ButtonVariant.Outline}>
            {formatThemeName(currentTheme)}
          </DropdownButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" container={portalContainer} className="z-[99999] pointer-events-auto">
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

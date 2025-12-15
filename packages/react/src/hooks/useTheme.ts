/**
 * useTheme Hook - Theme utilities
 *
 * React Layer: L3
 */

import { useCallback, useMemo } from 'react';
import { useHAI3 } from '../HAI3Context';
import type { UseThemeReturn } from '../types';

/**
 * Hook for theme utilities.
 *
 * @returns Theme utilities
 *
 * @example
 * ```tsx
 * const { currentTheme, themes, setTheme } = useTheme();
 *
 * return (
 *   <select
 *     value={currentTheme}
 *     onChange={(e) => setTheme(e.target.value)}
 *   >
 *     {themes.map((theme) => (
 *       <option key={theme.id} value={theme.id}>
 *         {theme.name}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const app = useHAI3();
  const { themeRegistry } = app;

  // Get current theme
  const currentTheme = useMemo(() => {
    const theme = themeRegistry.getCurrent();
    return theme?.id;
  }, [themeRegistry]);

  // Get all themes
  const themes = useMemo(() => {
    return themeRegistry.getAll().map((theme) => ({
      id: theme.id,
      name: theme.name,
    }));
  }, [themeRegistry]);

  // Set theme
  const setTheme = useCallback(
    (themeId: string) => {
      if (app.actions.changeTheme) {
        app.actions.changeTheme({ themeId });
      }
    },
    [app.actions]
  );

  return {
    currentTheme,
    themes,
    setTheme,
  };
}

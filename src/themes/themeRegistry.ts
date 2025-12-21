/**
 * Theme Registry for HAI3 Demo App
 * Self-registers themes with UI Core on import
 * App just needs to import this file
 */

import { themeRegistry, type ThemeApplyFn } from '@hai3/react';
import { applyTheme } from '@hai3/uikit';
import { defaultTheme, DEFAULT_THEME_ID } from './default';
import { lightTheme, LIGHT_THEME_ID } from './light';
import { darkTheme, DARK_THEME_ID } from './dark';
import { draculaTheme, DRACULA_THEME_ID } from './dracula';
import { draculaLargeTheme, DRACULA_LARGE_THEME_ID } from './dracula-large';

// Set the apply function from UI Kit (cast to generic ThemeApplyFn for compatibility)
themeRegistry.setApplyFunction(applyTheme as ThemeApplyFn);

// Register all themes (default theme first, becomes the default selection)
themeRegistry.register(DEFAULT_THEME_ID, defaultTheme);
themeRegistry.register(LIGHT_THEME_ID, lightTheme);
themeRegistry.register(DARK_THEME_ID, darkTheme);
themeRegistry.register(DRACULA_THEME_ID, draculaTheme);
themeRegistry.register(DRACULA_LARGE_THEME_ID, draculaLargeTheme);

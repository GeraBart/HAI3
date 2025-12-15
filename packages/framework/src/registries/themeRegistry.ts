/**
 * Theme Registry - Manages theme registration and application
 *
 * Framework Layer: L2
 */

import type { ThemeRegistry, ThemeConfig } from '../types';

/**
 * Create a new theme registry instance.
 */
export function createThemeRegistry(): ThemeRegistry {
  const themes = new Map<string, ThemeConfig>();
  let currentThemeId: string | null = null;

  /**
   * Apply CSS custom properties from theme to :root
   */
  function applyCSSVariables(config: ThemeConfig): void {
    // Skip if not in browser environment
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply each CSS variable
    Object.entries(config.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  return {
    /**
     * Register a theme.
     */
    register(config: ThemeConfig): void {
      if (themes.has(config.id)) {
        console.warn(`Theme "${config.id}" is already registered. Skipping.`);
        return;
      }

      themes.set(config.id, config);

      // If this is the default theme and no theme is applied yet, apply it
      if (config.default && currentThemeId === null) {
        this.apply(config.id);
      }
    },

    /**
     * Get theme by ID.
     */
    get(id: string): ThemeConfig | undefined {
      return themes.get(id);
    },

    /**
     * Get all themes.
     */
    getAll(): ThemeConfig[] {
      return Array.from(themes.values());
    },

    /**
     * Apply a theme.
     */
    apply(id: string): void {
      const config = themes.get(id);

      if (!config) {
        console.warn(`Theme "${id}" not found. Cannot apply.`);
        return;
      }

      applyCSSVariables(config);
      currentThemeId = id;
    },

    /**
     * Get current theme.
     */
    getCurrent(): ThemeConfig | undefined {
      return currentThemeId ? themes.get(currentThemeId) : undefined;
    },
  };
}

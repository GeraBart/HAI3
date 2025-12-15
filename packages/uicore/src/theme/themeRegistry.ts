import type { Theme } from '@hai3/uikit';

/**
 * Theme Registry
 * Manages theme registry and application
 */
class ThemeRegistry {
  private themes: Map<string, Theme> = new Map();
  private applyFunction: ((theme: Theme, name: string) => void) | null = null;

  /**
   * Register a theme
   */
  register(name: string, theme: Theme): void {
    this.themes.set(name, theme);
  }

  /**
   * Register multiple themes
   */
  registerMany(themes: Record<string, Theme>): void {
    Object.entries(themes).forEach(([name, theme]) => {
      this.register(name, theme);
    });
  }

  /**
   * Get theme by name
   */
  get(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * Get all theme names
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Set the apply function (from @hai3/uikit)
   */
  setApplyFunction(fn: (theme: Theme, name: string) => void): void {
    this.applyFunction = fn;
  }

  /**
   * Apply a theme by name
   */
  apply(name: string): void {
    const theme = this.themes.get(name);
    if (!theme) {
      console.warn(`Theme "${name}" not found in registry`);
      return;
    }

    if (!this.applyFunction) {
      console.warn('Theme apply function not set. Call themeRegistry.setApplyFunction() first.');
      return;
    }

    this.applyFunction(theme, name);
  }

  /**
   * Clear all themes (for testing)
   */
  clear(): void {
    this.themes.clear();
  }
}

// Export singleton instance
export const themeRegistry = new ThemeRegistry();

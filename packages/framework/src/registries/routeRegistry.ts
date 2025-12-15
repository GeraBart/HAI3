/**
 * Route Registry - Manages routes auto-synced from screensets
 *
 * Framework Layer: L2
 */

import type { MenuScreenItem, ScreenLoader } from '@hai3/layout';
import type { RouteRegistry, ScreensetRegistry } from '../types';

/**
 * Route entry type
 */
interface RouteEntry {
  screensetId: string;
  screenId: string;
  loader: ScreenLoader;
}

/**
 * Create a new route registry instance.
 *
 * @param screensetRegistry - Screenset registry to sync from
 */
export function createRouteRegistry(
  screensetRegistry: ScreensetRegistry
): RouteRegistry {
  // Lazy-initialized routes cache
  let routes: RouteEntry[] | null = null;

  /**
   * Build routes from screensets (lazy initialization)
   */
  function buildRoutes(): RouteEntry[] {
    if (routes !== null) {
      return routes;
    }

    routes = [];
    const screensets = screensetRegistry.getAll();

    screensets.forEach((screenset) => {
      screenset.menu.forEach((menuScreenItem: MenuScreenItem) => {
        if (menuScreenItem.menuItem.screenId && menuScreenItem.screen) {
          routes!.push({
            screensetId: screenset.id,
            screenId: menuScreenItem.menuItem.screenId,
            loader: menuScreenItem.screen,
          });
        }
      });
    });

    return routes;
  }

  return {
    /**
     * Check if a screen exists.
     */
    hasScreen(screensetId: string, screenId: string): boolean {
      const allRoutes = buildRoutes();
      return allRoutes.some(
        (route) =>
          route.screensetId === screensetId && route.screenId === screenId
      );
    },

    /**
     * Get screen loader.
     */
    getScreen(
      screensetId: string,
      screenId: string
    ): ScreenLoader | undefined {
      const allRoutes = buildRoutes();
      const route = allRoutes.find(
        (r) => r.screensetId === screensetId && r.screenId === screenId
      );
      return route?.loader;
    },

    /**
     * Get all routes.
     */
    getAll(): Array<{ screensetId: string; screenId: string }> {
      const allRoutes = buildRoutes();
      return allRoutes.map(({ screensetId, screenId }) => ({
        screensetId,
        screenId,
      }));
    },
  };
}

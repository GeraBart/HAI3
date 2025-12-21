/**
 * Backward Compatibility Exports
 *
 * These exports provide backward compatibility with @hai3/uicore API.
 * They are singletons that mirror the old API.
 *
 * NOTE: These are exported for migration convenience but may be deprecated
 * in future major versions. Prefer using the plugin architecture.
 */

import type { UnknownAction } from '@reduxjs/toolkit';
import { getStore, type AppDispatch } from '@hai3/state';
import { apiRegistry } from '@hai3/api';
import { screensetRegistry as sdkScreensetRegistry } from '@hai3/screensets';
import { screenActions as screenActionsImport } from './slices';
import { createThemeRegistry } from './registries/themeRegistry';
import { createRouteRegistry } from './registries/routeRegistry';
import type { ThemeRegistry, RouteRegistry } from './types';

// Type assertion for slice import (needed for backward compatibility functions)
type ActionCreators = Record<string, (payload?: UnknownAction['payload']) => UnknownAction>;
const screenActions = screenActionsImport as ActionCreators;

// ACCOUNTS_DOMAIN constant for backward compatibility
// NOTE: AccountsApiService has been moved to CLI templates
// This constant is kept for legacy code that references it
export const ACCOUNTS_DOMAIN = 'accounts' as const;

// ============================================================================
// Singleton Registries (backward compatibility)
// ============================================================================

// screensetRegistry is re-exported from @hai3/screensets directly
// No need for type assertion - SDK type is canonical
export { screensetRegistry } from '@hai3/screensets';

/**
 * Global theme registry singleton
 *
 * @deprecated Prefer using app.themeRegistry from createHAI3App()
 */
export const themeRegistry: ThemeRegistry = createThemeRegistry();

/**
 * Global route registry singleton
 *
 * @deprecated Prefer using app.routeRegistry from createHAI3App()
 */
export const routeRegistry: RouteRegistry = createRouteRegistry(sdkScreensetRegistry);

// ============================================================================
// Navigation Actions (backward compatibility)
// ============================================================================

/**
 * Navigate to a screen by ID.
 * Simply updates the active screen in the store.
 *
 * NOTE: This is a simplified backward-compatible function.
 * For full navigation including screenset switching, use:
 * - useNavigation().navigateToScreen(screensetId, screenId) hook
 * - or app.actions.navigateToScreen({ screensetId, screenId })
 *
 * @param screenId Screen ID to navigate to
 * @deprecated Use useNavigation() hook or app.actions.navigateToScreen()
 */
export const navigateToScreen = (screenId: string): void => {
  // Update the active screen
  getStore().dispatch(screenActions.setActiveScreen(screenId));
};

// ============================================================================
// User Actions (backward compatibility)
// ============================================================================

/**
 * Fetch current user from API
 * Returns a thunk action that fetches user data.
 *
 * @deprecated Prefer using api services directly in actions
 */
export const fetchCurrentUser = () => (_dispatch: AppDispatch): void => {
  // Get accounts service if registered
  // Type assertion needed because accounts service module augmentation is in deprecated @hai3/uicore
  try {
    const accountsService = (apiRegistry as { getService(domain: string): object }).getService(ACCOUNTS_DOMAIN);
    const service = accountsService as { getCurrentUser?: () => void };
    service.getCurrentUser?.();
  } catch {
    console.warn('fetchCurrentUser: accounts service not registered');
  }
};

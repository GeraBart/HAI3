/**
 * useNavigation Hook - Navigation utilities
 *
 * React Layer: L3
 */

import { useCallback } from 'react';
import { useHAI3 } from '../HAI3Context';
import { useAppSelector } from './useAppSelector';
import { selectActiveScreen } from '@hai3/framework';
import type { RootState } from '@hai3/framework';
import type { UseNavigationReturn } from '../types';

/**
 * Hook for navigation utilities.
 *
 * @returns Navigation utilities
 *
 * @example
 * ```tsx
 * const { navigateToScreen, navigateToScreenset, currentScreen } = useNavigation();
 *
 * return (
 *   <button onClick={() => navigateToScreen('demo', 'home')}>
 *     Go to Home
 *   </button>
 * );
 * ```
 */
export function useNavigation(): UseNavigationReturn {
  const app = useHAI3();
  // Cast selector to RootState - the layout slice is registered dynamically
  const currentScreen = useAppSelector(
    selectActiveScreen as unknown as (state: RootState) => string | null
  );

  // Navigate to a specific screen
  const navigateToScreen = useCallback(
    (screensetId: string, screenId: string) => {
      if (app.actions.navigateToScreen) {
        app.actions.navigateToScreen({ screensetId, screenId });
      }
    },
    [app.actions]
  );

  // Navigate to a screenset (uses default screen)
  const navigateToScreenset = useCallback(
    (screensetId: string) => {
      if (app.actions.navigateToScreenset) {
        app.actions.navigateToScreenset({ screensetId });
      }
    },
    [app.actions]
  );

  // Get current screenset from URL
  const getCurrentScreenset = () => {
    if (typeof window === 'undefined') return null;
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[0] || null;
  };

  return {
    navigateToScreen,
    navigateToScreenset,
    currentScreenset: getCurrentScreenset(),
    currentScreen,
  };
}

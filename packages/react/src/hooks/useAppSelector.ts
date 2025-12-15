/**
 * useAppSelector Hook - Type-safe selector hook
 *
 * React Layer: L3
 */

import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@hai3/framework';

/**
 * Type-safe selector hook.
 *
 * @example
 * ```tsx
 * const activeScreen = useAppSelector(selectActiveScreen);
 * const menuCollapsed = useAppSelector(selectMenuCollapsed);
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

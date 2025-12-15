/**
 * useAppDispatch Hook - Type-safe dispatch hook
 *
 * React Layer: L3
 */

import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@hai3/framework';

/**
 * Type-safe dispatch hook.
 *
 * @returns The typed dispatch function
 *
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * dispatch(someAction());
 * ```
 */
export function useAppDispatch(): AppDispatch {
  // Use untyped useDispatch and cast the result
  // This avoids type constraint issues with react-redux's generic
  return useDispatch() as AppDispatch;
}

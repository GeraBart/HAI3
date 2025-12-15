/**
 * @hai3/store - Redux Store Management
 *
 * This package provides:
 * - Dynamic slice registration with registerSlice
 * - Type-safe selectors
 * - Effect initialization system
 * - Module augmentation support for RootState
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

// Re-export all types
export type {
  RootState,
  AppDispatch,
  ThunkDispatch,
  SliceObject,
  EffectInitializer,
  EffectCleanup,
  EffectInitializerWithCleanup,
  HAI3Store,
  RegisterSlice,
  Selector,
  ParameterizedSelector,
} from './types';

// Export store functions
export {
  createStore,
  getStore,
  registerSlice,
  unregisterSlice,
  hasSlice,
  getRegisteredSlices,
  resetStore,
} from './store';

// Re-export Redux Toolkit essentials for convenience
export { createSlice, combineReducers } from '@reduxjs/toolkit';
export type { PayloadAction, Reducer } from '@reduxjs/toolkit';

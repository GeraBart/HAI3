/**
 * @hai3/state - Complete Flux Dataflow Pattern
 *
 * This package provides the unified Flux dataflow pattern:
 * - Type-safe event bus for pub/sub communication
 * - Redux store with dynamic slice registration
 * - Effect system types for event-driven state updates
 * - Module augmentation support for custom events and state
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 *
 * NOTE: Actions are NOT provided by this package.
 * Actions are handwritten functions in screensets that emit events.
 * This maintains knowledge separation: components know actions, not events.
 */

// Re-export all types
export type {
  // Event types
  EventPayloadMap,
  EventKey,
  EventHandler,
  Unsubscribe,
  Subscription,
  EventBus,
  EventName,
  PayloadOf,
  VoidPayload,
  // Store types
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

// Export EventBus singleton and implementation
export { eventBus, EventBusImpl } from './EventBus';

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

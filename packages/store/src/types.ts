/**
 * @hai3/store - Type Definitions
 *
 * Core types for HAI3 Redux store management.
 * These types enable dynamic slice registration and module augmentation.
 */

import type { Reducer, UnknownAction } from '@reduxjs/toolkit';

// ============================================================================
// Root State Interface
// ============================================================================

/**
 * Root State Base Interface
 * Central state type for the Redux store.
 *
 * EXTENSIBLE: Use module augmentation to add custom slices:
 *
 * @example
 * ```typescript
 * // In your screenset code
 * declare module '@hai3/store' {
 *   interface RootState {
 *     'chat/threads': ThreadsState;
 *     'chat/messages': MessagesState;
 *   }
 * }
 * ```
 *
 * Design: Interface (not type) enables TypeScript declaration merging.
 */
export interface RootState {
  // Base interface - extended via module augmentation
  // Intentionally empty - filled by consumers
  [key: string]: unknown;
}

// ============================================================================
// Dispatch Types
// ============================================================================

/**
 * App Dispatch Type
 * The dispatch function type for the HAI3 store.
 * Supports both plain actions and thunks.
 */
export type AppDispatch = (action: UnknownAction) => UnknownAction;

/**
 * Thunk Dispatch Type
 * Extended dispatch that supports async thunk actions.
 *
 * @template TState - The state type (defaults to RootState)
 */
export type ThunkDispatch<TState = RootState> = (
  action: UnknownAction | ((dispatch: AppDispatch, getState: () => TState) => void)
) => unknown;

// ============================================================================
// Slice Types
// ============================================================================

/**
 * Slice Object Interface
 * Represents a Redux Toolkit slice object.
 * Used for dynamic slice registration.
 *
 * NOTE: Default generic parameter uses `any` following Redux Toolkit's pattern.
 * This is intentional for heterogeneous slice collections where type safety
 * comes from individual slice definitions, not collection type.
 * See: https://github.com/reduxjs/redux-toolkit (Slice<State = any>)
 *
 * @template TState - The slice state type
 *
 * @example
 * ```typescript
 * const threadsSlice = createSlice({
 *   name: 'chat/threads',
 *   initialState,
 *   reducers: { ... }
 * });
 *
 * // threadsSlice satisfies SliceObject<ThreadsState>
 * registerSlice(threadsSlice, initThreadsEffects);
 * ```
 */
export interface SliceObject<TState = any> {
  /** Slice name - becomes the state key */
  name: string;
  /** Slice reducer function */
  reducer: Reducer<TState>;
  /** Slice action creators */
  actions: Record<string, unknown>;
  /** Slice selectors (optional) */
  selectors?: Record<string, unknown>;
  /** Initial state */
  getInitialState?: () => TState;
}

// ============================================================================
// Effect Types
// ============================================================================

/**
 * Effect Initializer Function
 * Function that sets up effects (event subscriptions) for a slice.
 * Called by registerSlice after the slice is registered.
 *
 * @param dispatch - The store's dispatch function
 *
 * @example
 * ```typescript
 * const initThreadsEffects: EffectInitializer = (dispatch) => {
 *   eventBus.on('chat/threads/selected', ({ threadId }) => {
 *     dispatch(threadsSlice.actions.setSelected(threadId));
 *   });
 * };
 * ```
 */
export type EffectInitializer = (dispatch: AppDispatch) => void;

/**
 * Effect Cleanup Function
 * Function to clean up effects when a slice is unregistered.
 * Returns an unsubscribe function.
 */
export type EffectCleanup = () => void;

/**
 * Effect Initializer with Cleanup
 * Effect initializer that returns a cleanup function.
 *
 * @param dispatch - The store's dispatch function
 * @returns Cleanup function to unsubscribe from events
 */
export type EffectInitializerWithCleanup = (dispatch: AppDispatch) => EffectCleanup;

// ============================================================================
// Store Types
// ============================================================================

/**
 * HAI3 Store Interface
 * The enhanced Redux store with dynamic slice registration.
 *
 * @template TState - The state type (defaults to RootState)
 */
export interface HAI3Store<TState = RootState> {
  /** Get current state */
  getState: () => TState;
  /** Dispatch an action */
  dispatch: AppDispatch;
  /** Subscribe to state changes */
  subscribe: (listener: () => void) => () => void;
  /** Replace the root reducer */
  replaceReducer: (nextReducer: Reducer<TState>) => void;
}

// ============================================================================
// Register Slice Function Signature
// ============================================================================

/**
 * Register Slice Function Signature
 * Registers a dynamic slice with the store.
 *
 * CONVENTION ENFORCEMENT: Slice.name becomes the state key automatically.
 * This ensures screenset self-containment - when you duplicate a screenset
 * and change the screenset ID constant, everything auto-updates.
 *
 * @param slice - Redux Toolkit slice object
 * @param initEffects - Optional function to initialize effects
 *
 * @throws Error if domain-based slice has invalid format
 *
 * @example
 * ```typescript
 * const SLICE_KEY = `${CHAT_SCREENSET_ID}/threads` as const;
 *
 * const threadsSlice = createSlice({
 *   name: SLICE_KEY,  // Name becomes state key
 *   initialState,
 *   reducers: { ... }
 * });
 *
 * registerSlice(threadsSlice, initThreadsEffects);
 *
 * // State shape: { 'chat/threads': ThreadsState }
 * ```
 */
export type RegisterSlice = <TState>(
  slice: SliceObject<TState>,
  initEffects?: EffectInitializer
) => void;

// ============================================================================
// Selector Types
// ============================================================================

/**
 * Selector Function Type
 * Type-safe selector that extracts data from state.
 *
 * @template TResult - The return type of the selector
 * @template TState - The state type (defaults to RootState)
 */
export type Selector<TResult, TState = RootState> = (state: TState) => TResult;

/**
 * Parameterized Selector Type
 * Selector that accepts additional parameters.
 *
 * @template TResult - The return type of the selector
 * @template TParams - The parameter types
 * @template TState - The state type (defaults to RootState)
 */
export type ParameterizedSelector<TResult, TParams extends unknown[], TState = RootState> = (
  state: TState,
  ...params: TParams
) => TResult;

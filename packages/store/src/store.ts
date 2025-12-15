/**
 * HAI3 Store - Redux store with dynamic slice registration
 *
 * This package provides:
 * - Configurable Redux store creation
 * - Dynamic slice registration (registerSlice)
 * - Type-safe state access via module augmentation
 *
 * SDK Layer: L1 (Zero @hai3 dependencies)
 */

import { configureStore, combineReducers, type Reducer } from '@reduxjs/toolkit';
import type { RootState, AppDispatch, SliceObject, EffectInitializer, HAI3Store } from './types';

// ============================================================================
// Store State
// ============================================================================

/** Static reducers that are always present */
let staticReducers: Record<string, Reducer> = {};

/** Dynamic reducers registered by screensets */
const dynamicReducers: Record<string, Reducer> = {};

/** The Redux store instance */
let storeInstance: ReturnType<typeof configureStore> | null = null;

/** Effect cleanup functions */
const effectCleanups: Map<string, () => void> = new Map();

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Create the HAI3 store with initial static reducers.
 *
 * @param initialReducers - Static reducers to include at store creation
 * @returns The configured store instance
 *
 * @example
 * ```typescript
 * // Framework creates the store with layout reducers
 * const store = createStore({
 *   'uicore': combineReducers({ header, footer, menu, screen, ... })
 * });
 * ```
 */
export function createStore(
  initialReducers: Record<string, Reducer> = {}
): HAI3Store<RootState> {
  staticReducers = { ...initialReducers };

  const rootReducer = Object.keys(staticReducers).length > 0
    ? combineReducers(staticReducers)
    : (state: RootState | undefined) => state ?? ({} as RootState);

  storeInstance = configureStore({
    reducer: rootReducer,
  });

  // Create typed wrapper
  const store: HAI3Store<RootState> = {
    getState: () => storeInstance!.getState() as RootState,
    dispatch: storeInstance.dispatch,
    subscribe: storeInstance.subscribe,
    replaceReducer: storeInstance.replaceReducer as HAI3Store<RootState>['replaceReducer'],
  };

  return store;
}

/**
 * Get the current store instance.
 * Creates a default empty store if none exists.
 *
 * @returns The HAI3 store instance
 */
export function getStore(): HAI3Store<RootState> {
  if (!storeInstance) {
    return createStore();
  }

  return {
    getState: () => storeInstance!.getState() as RootState,
    dispatch: storeInstance.dispatch,
    subscribe: storeInstance.subscribe,
    replaceReducer: storeInstance.replaceReducer as HAI3Store<RootState>['replaceReducer'],
  };
}

// ============================================================================
// Slice Registration
// ============================================================================

/**
 * Register a dynamic slice with the store.
 *
 * CONVENTION ENFORCEMENT: Slice.name becomes the state key automatically.
 * This ensures screenset self-containment - when you duplicate a screenset
 * and change the screenset ID constant, everything auto-updates.
 *
 * @param slice - Redux Toolkit slice object (from createSlice)
 * @param initEffects - Optional function to initialize effects
 *
 * @throws Error if domain-based slice has invalid format
 * @throws Error if store has not been created
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
export function registerSlice<TState>(
  slice: SliceObject<TState>,
  initEffects?: EffectInitializer
): void {
  if (!storeInstance) {
    throw new Error(
      'Store has not been created. Call createStore() before registerSlice().'
    );
  }

  const sliceName = slice.name;
  const reducer = slice.reducer;

  // Prevent duplicate registration
  if (dynamicReducers[sliceName]) {
    console.warn(`Slice "${sliceName}" is already registered. Skipping.`);
    return;
  }

  // VALIDATE DOMAIN-BASED SLICE FORMAT
  // Domain-based slices must follow 'screensetId/domain' format (exactly 2 parts)
  if (sliceName.includes('/')) {
    const parts = sliceName.split('/');
    if (parts.length !== 2) {
      throw new Error(
        `Invalid domain slice key: "${sliceName}".\n` +
        `Domain-based slices must use "screensetId/domain" format (exactly 2 parts).\n` +
        `Examples: "chat/threads", "chat/messages", "dashboard/widgets"\n` +
        `Invalid: "chat/messages/extra" (too many parts)`
      );
    }
    if (parts[0] === '' || parts[1] === '') {
      throw new Error(
        `Invalid domain slice key: "${sliceName}".\n` +
        `Both screensetId and domain must be non-empty.\n` +
        `Fix: Use format "screensetId/domain" (e.g., "chat/threads")`
      );
    }
  }

  // Add to dynamic reducers
  dynamicReducers[sliceName] = reducer as Reducer;

  // Rebuild root reducer with new slice
  const rootReducer = combineReducers({
    ...staticReducers,
    ...dynamicReducers,
  });

  // Replace store's reducer
  storeInstance.replaceReducer(rootReducer as any);

  // Initialize effects if provided
  if (initEffects) {
    initEffects(storeInstance.dispatch as AppDispatch);
  }
}

/**
 * Unregister a dynamic slice from the store.
 * Useful for cleanup in testing or when unloading screensets.
 *
 * @param sliceName - The name of the slice to unregister
 */
export function unregisterSlice(sliceName: string): void {
  if (!storeInstance) {
    return;
  }

  if (!dynamicReducers[sliceName]) {
    console.warn(`Slice "${sliceName}" is not registered. Skipping.`);
    return;
  }

  // Clean up effects if registered
  const cleanup = effectCleanups.get(sliceName);
  if (cleanup) {
    cleanup();
    effectCleanups.delete(sliceName);
  }

  // Remove from dynamic reducers
  delete dynamicReducers[sliceName];

  // Rebuild root reducer
  const allReducers = { ...staticReducers, ...dynamicReducers };
  const rootReducer = Object.keys(allReducers).length > 0
    ? combineReducers(allReducers)
    : (state: RootState | undefined) => state ?? ({} as RootState);

  storeInstance.replaceReducer(rootReducer as any);
}

/**
 * Check if a slice is registered.
 *
 * @param sliceName - The name of the slice to check
 * @returns True if the slice is registered
 */
export function hasSlice(sliceName: string): boolean {
  return sliceName in dynamicReducers || sliceName in staticReducers;
}

/**
 * Get all registered slice names.
 *
 * @returns Array of slice names
 */
export function getRegisteredSlices(): string[] {
  return [
    ...Object.keys(staticReducers),
    ...Object.keys(dynamicReducers),
  ];
}

// ============================================================================
// Reset (for testing)
// ============================================================================

/**
 * Reset the store to initial state.
 * Primarily used for testing.
 *
 * @internal
 */
export function resetStore(): void {
  // Clean up all effects
  effectCleanups.forEach((cleanup) => cleanup());
  effectCleanups.clear();

  // Clear dynamic reducers
  Object.keys(dynamicReducers).forEach((key) => delete dynamicReducers[key]);

  // Reset static reducers
  staticReducers = {};

  // Clear store instance
  storeInstance = null;
}

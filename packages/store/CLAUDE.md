# @hai3/store

Redux store management for HAI3 applications with dynamic slice registration.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has zero @hai3 dependencies and can be used independently. It has `@reduxjs/toolkit` as a peer dependency.

## Core Concepts

### Store Creation

```typescript
import { createStore, getStore } from '@hai3/store';

// Create store with optional initial reducers
const store = createStore({
  someFeature: someFeatureReducer
});

// Get store instance later
const store = getStore();
```

### Dynamic Slice Registration

Register slices at runtime (e.g., when screensets load):

```typescript
import { registerSlice, unregisterSlice, hasSlice } from '@hai3/store';
import { mySlice, initMyEffects } from './mySlice';

// Register slice with optional effect initializer
registerSlice(mySlice, initMyEffects);

// Check if registered
if (hasSlice('myFeature')) {
  // ...
}

// Unregister when no longer needed
unregisterSlice('myFeature');
```

### Slice Naming Convention

For screenset slices, use the pattern: `screensetId/domain`

```typescript
const SLICE_KEY = `${CHAT_SCREENSET_ID}/threads` as const;

export const threadsSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: { /* ... */ }
});
```

### Type Safety via Module Augmentation

Extend `RootState` to add custom slice state:

```typescript
declare module '@hai3/store' {
  interface RootState {
    'chat/threads': ThreadsState;
    'chat/messages': MessagesState;
  }
}
```

## Effect Initialization

Effects are initialized when their slice is registered:

```typescript
export function initThreadsEffects(): void {
  eventBus.on(ThreadsEvents.Selected, (payload) => {
    store.dispatch(threadsSlice.actions.setSelected(payload.threadId));
  });
}

// Register with effects
registerSlice(threadsSlice, initThreadsEffects);
```

## Key Rules

1. **Slice names must match state keys** - `slice.name` must equal the key in RootState
2. **Use registerSlice for dynamic slices** - Don't manually configure reducers
3. **Effects initialize with slices** - Pass effect initializer to registerSlice
4. **No direct dispatch in components** - Use actions that emit events

## Re-exports from Redux Toolkit

For convenience, this package re-exports:

- `createSlice`
- `createSelector`
- `configureStore`
- `combineReducers`
- `PayloadAction` (type)
- `Reducer` (type)

## Exports

- `createStore` - Create HAI3 store
- `getStore` - Get store instance
- `registerSlice` - Register dynamic slice
- `unregisterSlice` - Remove dynamic slice
- `hasSlice` - Check if slice exists
- `getRegisteredSlices` - List all registered slices
- `resetStore` - Reset store to initial state
- `RootState` - Augmentable root state interface
- `AppDispatch` - Store dispatch type
- `HAI3Store` - Store type

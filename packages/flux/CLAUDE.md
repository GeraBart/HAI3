# @hai3/flux

Complete Flux dataflow pattern for HAI3 applications - event bus, store, and effects.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has zero @hai3 dependencies and can be used independently. It has `@reduxjs/toolkit` as a peer dependency.

## Core Concepts

### EventBus

The `eventBus` singleton provides type-safe event emission and subscription:

```typescript
import { eventBus } from '@hai3/flux';

// Subscribe to events
const unsubscribe = eventBus.on('user/loggedIn', (payload) => {
  console.log('User logged in:', payload.userId);
});

// Emit events (only from actions!)
eventBus.emit('user/loggedIn', { userId: '123' });

// Cleanup
unsubscribe();
```

### Store

Dynamic slice registration and Redux store management:

```typescript
import { createStore, registerSlice, getStore } from '@hai3/flux';

// Create store with optional initial reducers
const store = createStore({
  someFeature: someFeatureReducer
});

// Register dynamic slice
registerSlice(mySlice, initMyEffects);

// Get store instance later
const store = getStore();
```

### Type Safety via Module Augmentation

Extend `EventPayloadMap` and `RootState` to add custom events and state:

```typescript
declare module '@hai3/flux' {
  interface EventPayloadMap {
    'user/loggedIn': { userId: string };
    'chat/messageReceived': { threadId: string; message: string };
  }

  interface RootState {
    'chat/threads': ThreadsState;
    'chat/messages': MessagesState;
  }
}
```

## Event Naming Convention

Events should follow the pattern: `domain/eventName`

- `user/loggedIn` - User domain, logged in event
- `chat/messageReceived` - Chat domain, message received event
- `theme/changed` - Theme domain, changed event

## Key Rules

1. **Actions emit events** - Only action functions call `eventBus.emit()`
2. **Components call actions** - Components never use `eventBus` directly
3. **Effects subscribe** - Effects subscribe to events and dispatch to slices
4. **One-way flow** - Actions → Events → Effects → State updates
5. **Type safety** - Always use module augmentation for custom events/state

## NO createAction Helper

This package intentionally does NOT export a `createAction` helper:
- Actions are handwritten functions in screensets
- Actions contain validation and business logic
- This maintains knowledge separation (components don't know about events)

Example action (in screenset):
```typescript
import { eventBus } from '@hai3/flux';

export function selectThread(threadId: string): void {
  if (!threadId) {
    console.warn('selectThread called with empty threadId');
    return;
  }
  eventBus.emit('chat/threads/selected', { threadId });
}
```

## Exports

### Event System
- `eventBus` - Singleton EventBus instance
- `EventBus` - EventBus interface (type)
- `EventPayloadMap` - Augmentable event payload interface
- `EventHandler` - Handler function type
- `Subscription` - Subscription object with unsubscribe

### Store
- `createStore` - Create HAI3 store
- `getStore` - Get store instance
- `registerSlice` - Register dynamic slice
- `unregisterSlice` - Remove dynamic slice
- `hasSlice` - Check if slice exists
- `getRegisteredSlices` - List all registered slices
- `resetStore` - Reset store to initial state
- `createSlice` - Re-exported from Redux Toolkit
- `combineReducers` - Re-exported from Redux Toolkit

### Types
- `RootState` - Augmentable root state interface
- `AppDispatch` - Store dispatch type
- `HAI3Store` - Store type
- `SliceObject` - Slice interface
- `EffectInitializer` - Effect initializer type

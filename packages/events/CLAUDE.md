# @hai3/events

Type-safe event bus for HAI3 applications.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has zero @hai3 dependencies and can be used independently.

## Core Concepts

### EventBus

The `eventBus` singleton provides type-safe event emission and subscription:

```typescript
import { eventBus } from '@hai3/events';

// Subscribe to events
const unsubscribe = eventBus.on('user/loggedIn', (payload) => {
  console.log('User logged in:', payload.userId);
});

// Emit events
eventBus.emit('user/loggedIn', { userId: '123' });

// Cleanup
unsubscribe();
```

### createAction

Creates type-safe action functions that emit events:

```typescript
import { createAction } from '@hai3/events';

// Define action
const loginUser = createAction<'user/loggedIn'>('user/loggedIn');

// Use action (emits event internally)
loginUser({ userId: '123' });
```

### Type Safety via Module Augmentation

Extend `EventPayloadMap` to add custom events:

```typescript
declare module '@hai3/events' {
  interface EventPayloadMap {
    'user/loggedIn': { userId: string };
    'user/loggedOut': void;
    'chat/messageReceived': { threadId: string; message: string };
  }
}
```

## Event Naming Convention

Events should follow the pattern: `domain/eventName`

- `user/loggedIn` - User domain, logged in event
- `chat/messageReceived` - Chat domain, message received event
- `theme/changed` - Theme domain, changed event

## Key Rules

1. **Actions are pure** - They only emit events, no side effects
2. **Effects listen** - Effects subscribe to events and handle side effects
3. **One-way flow** - Actions → Events → Effects → State updates
4. **Type safety** - Always use module augmentation for custom events

## Exports

- `eventBus` - Singleton EventBus instance
- `createAction` - Action factory function
- `EventBus` - EventBus interface (type)
- `EventPayloadMap` - Augmentable event payload interface
- `EventHandler` - Handler function type
- `Subscription` - Subscription object with unsubscribe
- `Action` - Action function type

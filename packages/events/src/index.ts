/**
 * @hai3/events - Type-Safe Event Bus and Action Pattern
 *
 * This package provides:
 * - Type-safe event bus for pub/sub communication
 * - Action pattern for event-driven state management
 * - Module augmentation support for custom events
 *
 * SDK Layer: L1 (Zero @hai3 dependencies)
 */

// Re-export all types
export type {
  EventPayloadMap,
  EventKey,
  EventHandler,
  Unsubscribe,
  Subscription,
  EventBus,
  Action,
  CreateAction,
  EventName,
  PayloadOf,
  VoidPayload,
} from './types';

// Export EventBus singleton and implementation
export { eventBus, EventBusImpl } from './EventBus';

// Export action factory
export { createAction, createActionWithBus } from './createAction';

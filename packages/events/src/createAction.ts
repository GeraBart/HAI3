/**
 * Action Factory - Creates type-safe actions that emit events
 *
 * Actions are pure functions that emit events to the EventBus.
 * They MUST NOT dispatch directly to Redux store.
 * Effects listen to these events and update state.
 *
 * This enforces the HAI3 Flux pattern:
 * Action → emit Event → Effect subscribes → Updates Slice
 */

import type { EventPayloadMap, EventKey, Action, EventBus } from './types';
import { eventBus } from './EventBus';

/**
 * Create a type-safe action that emits the specified event.
 *
 * @template K - Event key from EventPayloadMap
 * @param eventName - The event name to emit
 * @returns Action function that emits the event with typed payload
 *
 * @example
 * ```typescript
 * // First, define the event type via module augmentation
 * declare module '@hai3/events' {
 *   interface EventPayloadMap {
 *     'chat/threads/selected': { threadId: string };
 *   }
 * }
 *
 * // Create the action
 * const selectThread = createAction('chat/threads/selected');
 *
 * // Usage - fully type-safe
 * selectThread({ threadId: '123' });  // ✅
 * selectThread({ wrong: 'key' });     // ❌ Type error
 * ```
 */
export function createAction<K extends EventKey>(
  eventName: K
): Action<EventPayloadMap[K]> {
  return (payload: EventPayloadMap[K]): void => {
    // Use type assertion to handle the conditional spread
    (eventBus as EventBus<any>).emit(eventName, payload);
  };
}

/**
 * Create an action with a custom event bus instance.
 * Useful for testing or isolated event scopes.
 *
 * @template K - Event key from EventPayloadMap
 * @param eventName - The event name to emit
 * @param bus - Custom EventBus instance
 * @returns Action function that emits the event with typed payload
 *
 * @example
 * ```typescript
 * // For testing with isolated event bus
 * const testBus = new EventBusImpl();
 * const selectThread = createActionWithBus('chat/threads/selected', testBus);
 * ```
 */
export function createActionWithBus<K extends EventKey>(
  eventName: K,
  bus: EventBus<EventPayloadMap>
): Action<EventPayloadMap[K]> {
  return (payload: EventPayloadMap[K]): void => {
    // Use type assertion to handle the conditional spread
    (bus as EventBus<any>).emit(eventName, payload);
  };
}

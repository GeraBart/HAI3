/**
 * Action Factory - Creates simple actions that emit events
 *
 * Framework Layer: L2
 *
 * This is a convenience helper for creating simple "pass-through" actions
 * that only emit an event with the payload they receive. For complex actions
 * with business logic, API calls, or conditional behavior, write them by hand.
 *
 * IMPORTANT: This is an internal framework utility, NOT exported to consumers.
 * Screenset actions should be handwritten functions, not generated.
 */

import { eventBus } from '@hai3/flux';
import type { EventPayloadMap, EventBus } from '@hai3/flux';

/**
 * Simple action type - a function that takes payload and returns void
 */
type SimpleAction<TPayload> = (payload: TPayload) => void;

/**
 * Event key type from the global EventPayloadMap
 */
type EventKey = keyof EventPayloadMap;

/**
 * Create a simple action that emits the specified event.
 *
 * @template K - Event key from EventPayloadMap
 * @param eventName - The event name to emit
 * @returns Action function that emits the event with typed payload
 *
 * @internal This is for framework-level actions only
 */
export function createAction<K extends EventKey>(
  eventName: K
): SimpleAction<EventPayloadMap[K]> {
  return (payload: EventPayloadMap[K]): void => {
    (eventBus as EventBus<Record<string, unknown>>).emit(eventName, payload);
  };
}

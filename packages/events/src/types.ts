/**
 * @hai3/events - Type Definitions
 *
 * Core types for the HAI3 event system.
 * These types are designed for module augmentation and type-safe event handling.
 */

// ============================================================================
// Event Payload Map
// ============================================================================

/**
 * Global Event Payload Map
 * Central registry of ALL events in the application.
 * Maps event keys (strings) to their payload types.
 *
 * EXTENSIBLE: Use module augmentation to add custom events:
 *
 * @example
 * ```typescript
 * declare module '@hai3/events' {
 *   interface EventPayloadMap {
 *     'chat/threads/selected': { threadId: string };
 *     'chat/messages/received': { message: Message };
 *   }
 * }
 * ```
 *
 * Design: Interface (not type) enables TypeScript declaration merging.
 */
export interface EventPayloadMap {
  // Base interface - extended via module augmentation
  // Intentionally empty - filled by consumers
}

/**
 * Event Key Type
 * Union of all event keys from EventPayloadMap.
 * Used in EventBus generic constraints for type-safe event emission.
 */
export type EventKey = keyof EventPayloadMap;

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Event Handler Function
 * Function that handles an event with its typed payload.
 *
 * @template T - The payload type for this event
 */
export type EventHandler<T> = (payload: T) => void;

/**
 * Subscription / Unsubscribe Function
 * Returns a function to unsubscribe from the event.
 */
export type Unsubscribe = () => void;

/**
 * Subscription Object
 * Object-oriented way to manage event subscriptions.
 */
export interface Subscription {
  unsubscribe: Unsubscribe;
}

// ============================================================================
// Event Bus Interface
// ============================================================================

/**
 * EventBus Interface
 * Type-safe event pub/sub mechanism.
 *
 * @template TEvents - The event payload map type (defaults to EventPayloadMap)
 *
 * @example
 * ```typescript
 * // Emit an event (type-safe)
 * eventBus.emit('chat/threads/selected', { threadId: '123' });
 *
 * // Subscribe to an event
 * const unsubscribe = eventBus.on('chat/threads/selected', ({ threadId }) => {
 *   console.log('Thread selected:', threadId);
 * });
 *
 * // Unsubscribe
 * unsubscribe();
 * ```
 */
export interface EventBus<TEvents extends EventPayloadMap = EventPayloadMap> {
  /**
   * Emit an event with payload.
   * Type-safe: payload must match event type in EventPayloadMap.
   *
   * @param event - The event key
   * @param payload - The event payload (optional for void events)
   */
  emit<K extends keyof TEvents>(
    event: K,
    ...args: TEvents[K] extends void ? [] : [TEvents[K]]
  ): void;

  /**
   * Subscribe to an event.
   * Type-safe: handler receives correct payload type for event.
   *
   * @param event - The event key
   * @param handler - Function to handle the event
   * @returns Subscription object with unsubscribe method
   */
  on<K extends keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>
  ): Subscription;

  /**
   * Subscribe to an event once.
   * Handler is automatically removed after first invocation.
   *
   * @param event - The event key
   * @param handler - Function to handle the event
   * @returns Subscription object with unsubscribe method
   */
  once<K extends keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>
  ): Subscription;

  /**
   * Remove all handlers for a specific event.
   *
   * @param event - The event key
   */
  clear(event: string): void;

  /**
   * Remove all event handlers.
   */
  clearAll(): void;
}

// ============================================================================
// Action Pattern Types
// ============================================================================

/**
 * Action Type
 * An Action is a pure function that emits an event.
 * Actions MUST NOT dispatch directly to store.
 * Actions MUST return void.
 *
 * @template TPayload - The payload type for this action
 *
 * @example
 * ```typescript
 * const selectThread: Action<{ threadId: string }> = createAction('chat/threads/selected');
 *
 * // Usage
 * selectThread({ threadId: '123' });
 * ```
 */
export type Action<TPayload> = (payload: TPayload) => void;

/**
 * Action Creator Function Signature
 * Creates a type-safe action that emits the specified event.
 *
 * @template K - Event key from EventPayloadMap
 * @param eventName - The event name to emit
 * @returns Action function that emits the event with typed payload
 *
 * @example
 * ```typescript
 * // Define event type
 * declare module '@hai3/events' {
 *   interface EventPayloadMap {
 *     'chat/threads/selected': { threadId: string };
 *   }
 * }
 *
 * // Create action
 * const selectThread = createAction('chat/threads/selected');
 *
 * // Usage - fully type-safe
 * selectThread({ threadId: '123' });  // ✅
 * selectThread({ wrong: 'key' });     // ❌ Type error
 * ```
 */
export type CreateAction = <K extends EventKey>(
  eventName: K
) => Action<EventPayloadMap[K]>;

// ============================================================================
// Event Naming Convention Types
// ============================================================================

/**
 * Template Literal Types for Event Naming Convention
 * Enforces the HAI3 event naming pattern: `${screenset}/${domain}/${action}`
 *
 * @example
 * ```typescript
 * type ValidEvent = EventName<'chat', 'threads', 'selected'>;
 * // Result: 'chat/threads/selected'
 * ```
 */
export type EventName<
  TScreenset extends string,
  TDomain extends string,
  TAction extends string
> = `${TScreenset}/${TDomain}/${TAction}`;

/**
 * Conditional type for payload extraction from event name.
 *
 * @template K - Event key from EventPayloadMap
 */
export type PayloadOf<K extends EventKey> = EventPayloadMap[K];

// ============================================================================
// Void Event Helper
// ============================================================================

/**
 * Helper type for events with no payload.
 * Use `void` as the payload type for events that don't need data.
 *
 * @example
 * ```typescript
 * declare module '@hai3/events' {
 *   interface EventPayloadMap {
 *     'app/initialized': void;
 *   }
 * }
 *
 * eventBus.emit('app/initialized'); // No payload needed
 * ```
 */
export type VoidPayload = void;

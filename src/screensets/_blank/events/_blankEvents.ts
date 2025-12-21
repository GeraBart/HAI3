/**
 * _blank Events
 * Domain-specific events for this screenset
 */

import '@hai3/react';
import { _BLANK_SCREENSET_ID } from '../ids';

const DOMAIN_ID = '_blank';

/**
 * Events enum
 * Add your events here following the pattern:
 * EventName = `${_BLANK_SCREENSET_ID}/${DOMAIN_ID}/eventName`
 */
export enum _BlankEvents {
  // Example: Selected = `${_BLANK_SCREENSET_ID}/${DOMAIN_ID}/selected`,
}

// These are used in the event enum pattern above
void _BLANK_SCREENSET_ID;
void DOMAIN_ID;

/**
 * Module augmentation for type-safe event payloads
 * Add your event payload types here
 */
declare module '@hai3/react' {
  interface EventPayloadMap {
    /** Placeholder - remove when adding real events */
    '_blank/_placeholder'?: never;
    // Example: [_BlankEvents.Selected]: { id: string };
  }
}

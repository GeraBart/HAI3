import type { Position, Size } from '../types';

/**
 * Studio UI Event Payloads
 * These events track changes to Studio UI state (position, size, visibility)
 */

export interface PositionChangedPayload {
  position: Position;
}

export interface SizeChangedPayload {
  size: Size;
}

export interface ButtonPositionChangedPayload {
  position: Position;
}

/**
 * Studio Event Names
 * Namespace: studio/
 */
export const StudioEvents = {
  PositionChanged: 'studio/positionChanged',
  SizeChanged: 'studio/sizeChanged',
  ButtonPositionChanged: 'studio/buttonPositionChanged',
} as const;

/**
 * Module Augmentation
 * Extend EventPayloadMap from @hai3/events for type safety
 */
declare module '@hai3/events' {
  interface EventPayloadMap {
    'studio/positionChanged': PositionChangedPayload;
    'studio/sizeChanged': SizeChangedPayload;
    'studio/buttonPositionChanged': ButtonPositionChangedPayload;
  }
}

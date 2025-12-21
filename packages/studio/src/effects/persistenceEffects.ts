import { eventBus } from '@hai3/react';
import { StudioEvents } from '../events/studioEvents';
import { saveStudioState } from '../utils/persistence';
import { STORAGE_KEYS } from '../types';

/**
 * Persistence Effects
 * Listen to Studio UI events and update localStorage
 * Treats localStorage as a "slice" for Studio UI state
 */

/**
 * Initialize all persistence effects
 * Call this once when Studio mounts
 */
export const initPersistenceEffects = (): (() => void) => {
  // Position changed listener
  const positionSubscription = eventBus.on(
    StudioEvents.PositionChanged,
    ({ position }) => {
      saveStudioState(STORAGE_KEYS.POSITION, position);
    }
  );

  // Size changed listener
  const sizeSubscription = eventBus.on(
    StudioEvents.SizeChanged,
    ({ size }) => {
      saveStudioState(STORAGE_KEYS.SIZE, size);
    }
  );

  // Button position changed listener
  const buttonPositionSubscription = eventBus.on(
    StudioEvents.ButtonPositionChanged,
    ({ position }) => {
      saveStudioState(STORAGE_KEYS.BUTTON_POSITION, position);
    }
  );

  // Return cleanup function to unsubscribe all listeners
  return () => {
    positionSubscription.unsubscribe();
    sizeSubscription.unsubscribe();
    buttonPositionSubscription.unsubscribe();
  };
};

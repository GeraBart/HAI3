/**
 * @hai3/screensets - Screenset Registry
 *
 * Pure storage implementation for screenset registration.
 * This is a simple Map wrapper with no side effects.
 * ~20 lines of implementation - minimal and focused.
 *
 * NOTE: i18n wiring happens in @hai3/framework when it re-exports this registry.
 */

import type { ScreensetDefinition, ScreensetRegistry } from './types';

/**
 * Create a new screenset registry instance.
 * This is a pure storage implementation with no dependencies.
 */
function createScreensetRegistry(): ScreensetRegistry {
  const screensets = new Map<string, ScreensetDefinition>();

  return {
    register(screenset: ScreensetDefinition): void {
      screensets.set(screenset.id, screenset);
    },

    registerMany(configs: ScreensetDefinition[]): void {
      for (const config of configs) {
        screensets.set(config.id, config);
      }
    },

    get(id: string): ScreensetDefinition | undefined {
      return screensets.get(id);
    },

    getAll(): ScreensetDefinition[] {
      return Array.from(screensets.values());
    },

    has(id: string): boolean {
      return screensets.has(id);
    },

    unregister(id: string): boolean {
      return screensets.delete(id);
    },

    clear(): void {
      screensets.clear();
    },
  };
}

/**
 * Singleton screenset registry instance.
 * Use this for screenset registration throughout the application.
 *
 * @example
 * ```typescript
 * import { screensetRegistry } from '@hai3/screensets';
 *
 * // Register a screenset
 * screensetRegistry.register(myScreenset);
 *
 * // Get all screensets
 * const all = screensetRegistry.getAll();
 * ```
 */
export const screensetRegistry: ScreensetRegistry = createScreensetRegistry();

// Also export the factory for testing purposes
export { createScreensetRegistry };

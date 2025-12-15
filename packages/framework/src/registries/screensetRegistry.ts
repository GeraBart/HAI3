/**
 * Screenset Registry - Manages screenset registration
 *
 * Framework Layer: L2
 */

import type { ScreensetDefinition } from '@hai3/layout';
import type { ScreensetRegistry } from '../types';

/**
 * Create a new screenset registry instance.
 */
export function createScreensetRegistry(): ScreensetRegistry {
  const screensets = new Map<string, ScreensetDefinition>();

  return {
    /**
     * Register a screenset.
     */
    register(config: ScreensetDefinition): void {
      if (screensets.has(config.id)) {
        console.warn(`Screenset "${config.id}" is already registered. Skipping.`);
        return;
      }
      screensets.set(config.id, config);
    },

    /**
     * Register multiple screensets.
     */
    registerMany(configs: ScreensetDefinition[]): void {
      configs.forEach((config) => this.register(config));
    },

    /**
     * Get screenset by ID.
     */
    get(key: string): ScreensetDefinition | undefined {
      return screensets.get(key);
    },

    /**
     * Get all screensets.
     */
    getAll(): ScreensetDefinition[] {
      return Array.from(screensets.values());
    },

    /**
     * Clear registry.
     */
    clear(): void {
      screensets.clear();
    },
  };
}

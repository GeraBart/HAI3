/**
 * createHAI3App - Convenience function for full HAI3 application
 *
 * Creates a fully configured HAI3 application using the full preset.
 *
 * Framework Layer: L2
 */

import { createHAI3 } from './createHAI3';
import { full } from './presets';
import type { HAI3Config, HAI3App } from './types';

/**
 * Create a fully configured HAI3 application.
 *
 * This is a convenience function that uses the full preset.
 * For custom plugin composition, use `createHAI3()` instead.
 *
 * @param config - Optional application configuration
 * @returns The built HAI3 application
 *
 * @example
 * ```typescript
 * // Default - uses full() preset
 * const app = createHAI3App();
 *
 * // With configuration
 * const app = createHAI3App({ devMode: true });
 * ```
 */
export function createHAI3App(config?: HAI3Config): HAI3App {
  return createHAI3(config)
    .useAll(full())
    .build();
}

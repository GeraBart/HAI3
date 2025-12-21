/**
 * Migrations Registry
 *
 * Central registry of all available migrations.
 * Migrations are organized by version and applied in order.
 *
 * NOTE: This file is separated from index.ts to avoid circular dependencies
 * with runner.ts
 */

import type { Migration } from './types.js';
import { migration020 } from './0.2.0/index.js';

/**
 * All available migrations, sorted by version
 */
const migrations: Migration[] = [
  migration020,
  // Future migrations will be added here:
  // migration030,
  // migration100,
];

/**
 * Get all available migrations
 */
export function getMigrations(): Migration[] {
  return [...migrations];
}

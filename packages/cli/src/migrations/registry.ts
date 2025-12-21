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

/**
 * Get a specific migration by ID
 */
export function getMigrationById(id: string): Migration | undefined {
  return migrations.find((m) => m.id === id);
}

/**
 * Get migrations for a specific version
 */
export function getMigrationsByVersion(version: string): Migration[] {
  return migrations.filter((m) => m.version === version);
}

/**
 * Get migrations up to and including a target version
 */
export function getMigrationsUpTo(targetVersion: string): Migration[] {
  return migrations.filter((m) => m.version <= targetVersion);
}

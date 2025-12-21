/**
 * Migrations Public API
 *
 * Re-exports from registry and runner modules.
 */

// Re-export registry functions
export {
  getMigrations,
  getMigrationById,
  getMigrationsByVersion,
  getMigrationsUpTo,
} from './registry.js';

// Re-export types
export type {
  Migration,
  Transform,
  TransformChange,
  TransformResult,
  MigrationPreview,
  MigrationResult,
  MigrationStatus,
  MigrationTracker,
  MigrationOptions,
  MigrationContext,
  MigrationLogger,
  FilePreview,
  FileResult,
  AppliedMigration,
} from './types.js';

// Re-export runner functions
export {
  getMigrationStatus,
  previewMigration,
  applyMigration,
  runMigrations,
  formatPreview,
  formatResult,
} from './runner.js';

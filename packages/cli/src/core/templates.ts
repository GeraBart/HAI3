/**
 * Shared template utilities for CLI commands
 *
 * Used by both `hai3 create` and `hai3 update` commands to ensure
 * consistent template handling across project creation and updates.
 *
 * EXTENSIBILITY:
 * - presets/standalone/ content is auto-discovered (add files there, no code changes)
 * - Non-presets content (src/*, root configs) uses explicit whitelist below
 *
 * PRESERVATION:
 * - User-created screensets in src/screensets/ are preserved
 * - Only template screensets (demo) are synced
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

/**
 * Items to EXCLUDE from template sync (internal CLI files only)
 */
const SYNC_EXCLUDE = [
  'manifest.json',
  'screenset-template',
];

/**
 * Get the path to the CLI's bundled templates directory
 */
export function getTemplatesDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '..', 'templates');
}

/**
 * Logger interface for template operations
 */
export interface TemplateLogger {
  info: (msg: string) => void;
}

/**
 * Sync a directory, preserving user content in specific subdirectories
 *
 * For src/screensets/, only syncs template screensets (preserves user screensets)
 * For other directories, does full replacement
 */
async function syncDirectory(
  srcDir: string,
  destDir: string,
  relativePath: string
): Promise<void> {
  // Special handling for src/screensets/ - preserve user screensets
  if (relativePath === 'src/screensets' || relativePath === 'src\\screensets') {
    await fs.ensureDir(destDir);
    const templateScreensets = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of templateScreensets) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      // Replace only template screensets (like demo), preserve user screensets
      await fs.remove(destPath);
      await fs.copy(srcPath, destPath);
    }
    return;
  }

  // Special handling for src/themes/ - preserve user themes and generated files
  if (relativePath === 'src/themes' || relativePath === 'src\\themes') {
    await fs.ensureDir(destDir);
    const templateEntries = await fs.readdir(srcDir, { withFileTypes: true });

    // Only sync items that exist in templates, preserve user-created themes
    for (const entry of templateEntries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      // Replace only template items, preserve user items
      await fs.remove(destPath);
      await fs.copy(srcPath, destPath);
    }
    return;
  }

  // Special handling for src/ - recursively handle subdirectories
  if (relativePath === 'src') {
    await fs.ensureDir(destDir);
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      const subRelativePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        await syncDirectory(srcPath, destPath, subRelativePath);
      } else {
        // Files in src/ root (like main.tsx, App.tsx) are replaced
        await fs.copy(srcPath, destPath, { overwrite: true });
      }
    }
    return;
  }

  // Default: full replacement for other directories
  await fs.remove(destDir);
  await fs.copy(srcDir, destDir);
}

/**
 * Sync template files from bundled CLI templates to project
 *
 * Syncs everything in templates/ except SYNC_EXCLUDE items.
 * This includes:
 * - presets/standalone/ content (auto-discovered, extensible)
 * - Root project files (index.html, vite.config.ts, etc.)
 * - Source directories (src/themes, src/uikit, src/icons, src/screensets/demo)
 * - AI configuration (.ai/, .claude/, .cursor/, .windsurf/, CLAUDE.md)
 *
 * User-created screensets in src/screensets/ are preserved.
 *
 * @param projectRoot - The root directory of the HAI3 project
 * @param logger - Logger instance for output
 * @returns Array of synced paths
 */
export async function syncTemplates(
  projectRoot: string,
  logger: TemplateLogger
): Promise<string[]> {
  const templatesDir = getTemplatesDir();
  const synced: string[] = [];

  // Read all entries in templates directory
  const entries = await fs.readdir(templatesDir, { withFileTypes: true });

  for (const entry of entries) {
    const name = entry.name;

    // Skip excluded items
    if (SYNC_EXCLUDE.includes(name)) {
      continue;
    }

    const srcPath = path.join(templatesDir, name);
    const destPath = path.join(projectRoot, name);

    try {
      if (entry.isDirectory()) {
        await syncDirectory(srcPath, destPath, name);
      } else {
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath, { overwrite: true });
      }
      synced.push(name);
    } catch (err) {
      logger.info(`  Warning: Could not sync ${name}: ${err}`);
    }
  }

  return synced;
}

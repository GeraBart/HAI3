/**
 * Shared template utilities for CLI commands
 *
 * Used by both `hai3 create` and `hai3 update` commands to ensure
 * consistent template handling across project creation and updates.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

/**
 * Template sync configuration
 * - src: path in CLI templates directory
 * - dest: path in target project
 * - expand: if true, copy children of src to dest (not the directory itself)
 */
export interface SyncTemplate {
  src: string;
  dest: string;
  expand?: boolean;
}

/**
 * Templates to sync from bundled CLI templates to project
 *
 * These templates are copied during both `hai3 create` and `hai3 update`.
 * The structure matches the 3-stage pipeline output from copy-templates.ts:
 *
 * Stage 1a: Static presets (eslint-plugin-local, configs, scripts)
 * Stage 1b: Root project files (handled separately in project generator)
 * Stage 1c: .ai/ assembled from markers
 * Stage 2: Generated IDE rules and command adapters
 *
 * Note: openspec/ is NOT synced - it's managed by `openspec init/update` commands
 */
export const SYNC_TEMPLATES: SyncTemplate[] = [
  // AI configuration (Stage 1c + Stage 2)
  { src: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { src: '.ai', dest: '.ai' },
  { src: '.claude', dest: '.claude' },
  { src: '.cursor', dest: '.cursor' },
  { src: '.windsurf', dest: '.windsurf' },

  // ESLint plugin with HAI3 rules (Stage 1a)
  { src: 'eslint-plugin-local', dest: 'eslint-plugin-local' },

  // Config files - already flattened to templates root by copy-templates.ts (Stage 1a)
  { src: 'eslint.config.js', dest: 'eslint.config.js' },
  { src: '.dependency-cruiser.cjs', dest: '.dependency-cruiser.cjs' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },

  // Scripts (Stage 1a)
  { src: 'scripts', dest: 'scripts' },

  // Demo screenset (Stage 1b) - only on create, not update
  // { src: 'src/screensets/demo', dest: 'src/screensets/demo' },
];

/**
 * Templates synced only during project creation (not update)
 */
export const CREATE_ONLY_TEMPLATES: SyncTemplate[] = [
  // Demo screenset - only included in new projects
  { src: 'src/screensets/demo', dest: 'src/screensets/demo' },
];

/**
 * Get the path to the CLI's bundled templates directory
 *
 * In bundled CLI: dist/index.cjs -> templates/ is sibling to dist/
 */
export function getTemplatesDir(): string {
  // tsup bundles to flat structure: dist/index.cjs
  // Templates are at templates/ (sibling to dist/)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Navigate from dist/ to templates/
  return path.resolve(__dirname, '..', 'templates');
}

/**
 * Logger interface for template operations
 */
export interface TemplateLogger {
  info: (msg: string) => void;
}

/**
 * Sync template files from bundled CLI templates to project
 *
 * @param projectRoot - The root directory of the HAI3 project
 * @param logger - Logger instance for output
 * @param options - Sync options
 * @returns Array of synced paths
 */
export async function syncTemplates(
  projectRoot: string,
  logger: TemplateLogger,
  options: {
    /** Include templates only for project creation (e.g., demo screenset) */
    includeCreateOnly?: boolean;
  } = {}
): Promise<string[]> {
  const templatesDir = getTemplatesDir();
  const synced: string[] = [];

  // Determine which templates to sync
  const templates = options.includeCreateOnly
    ? [...SYNC_TEMPLATES, ...CREATE_ONLY_TEMPLATES]
    : SYNC_TEMPLATES;

  for (const { src, dest, expand } of templates) {
    const srcPath = path.join(templatesDir, src);

    // Only sync if source exists in templates
    if (!(await fs.pathExists(srcPath))) {
      continue;
    }

    try {
      if (expand) {
        // Expand mode: copy children of src directory to dest
        const children = await fs.readdir(srcPath);
        for (const child of children) {
          const childSrcPath = path.join(srcPath, child);
          const childDestPath = path.join(projectRoot, dest, child);
          await fs.ensureDir(path.dirname(childDestPath));
          await fs.remove(childDestPath);
          await fs.copy(childSrcPath, childDestPath);
          synced.push(path.join(dest, child));
        }
      } else {
        // Direct copy mode
        const destPath = path.join(projectRoot, dest);
        await fs.ensureDir(path.dirname(destPath));
        await fs.remove(destPath);
        await fs.copy(srcPath, destPath);
        synced.push(dest);
      }
    } catch (err) {
      logger.info(`  Warning: Could not sync ${src}: ${err}`);
    }
  }

  return synced;
}

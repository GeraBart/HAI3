/**
 * Layout Generator from Template
 *
 * Generates layout components in the user's project from templates.
 * Supports different UI kit options: hai3-uikit (default) and custom.
 */

import path from 'path';
import fs from 'fs-extra';
import type { GeneratedFile } from '../core/types.js';
import { getTemplatesDir } from '../core/templates.js';

/**
 * UI Kit options for layout generation
 */
export type LayoutUiKit = 'hai3-uikit' | 'custom';

/**
 * Input for layout generation from template
 */
export interface LayoutFromTemplateInput {
  /** UI kit to use for components */
  uiKit: LayoutUiKit;
  /** Project root directory */
  projectRoot: string;
  /** Whether to overwrite existing files */
  force?: boolean;
}

/**
 * Read all files from template directory recursively
 */
async function readTemplateFiles(
  dir: string,
  basePath: string = ''
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  if (!(await fs.pathExists(dir))) {
    return files;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await readTemplateFiles(fullPath, relativePath)));
    } else {
      const content = await fs.readFile(fullPath, 'utf-8');
      files.push({ path: relativePath, content });
    }
  }

  return files;
}

/**
 * Generate layout files from template
 * Copies the layout templates for the specified UI kit
 */
export async function copyLayoutTemplates(
  input: LayoutFromTemplateInput
): Promise<GeneratedFile[]> {
  const { uiKit, projectRoot, force = false } = input;
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'layout', uiKit);

  // Check template exists
  if (!(await fs.pathExists(templatePath))) {
    throw new Error(
      `Layout template '${uiKit}' not found at ${templatePath}. ` +
        'Run `npm run build` in packages/cli first.'
    );
  }

  // Read all template files
  const templateFiles = await readTemplateFiles(templatePath);

  if (templateFiles.length === 0) {
    throw new Error(`No files found in layout template '${uiKit}'.`);
  }

  // Check for existing files if not forcing
  if (!force) {
    const layoutDir = path.join(projectRoot, 'src', 'layout');
    if (await fs.pathExists(layoutDir)) {
      const existingFiles = await fs.readdir(layoutDir);
      if (existingFiles.length > 0) {
        throw new Error(
          'Layout directory already exists with files. ' +
            'Use --force to overwrite existing files.'
        );
      }
    }
  }

  // Transform paths for output
  const outputFiles: GeneratedFile[] = templateFiles.map((file) => ({
    path: `src/layout/${file.path}`,
    content: file.content,
  }));

  return outputFiles;
}

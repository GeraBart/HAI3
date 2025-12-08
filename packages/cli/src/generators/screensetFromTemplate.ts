/**
 * Screenset Generator from Template
 *
 * Creates a new screenset by copying and transforming the _blank template.
 * All occurrences of '_blank' are replaced with the new screenset name.
 */

import path from 'path';
import fs from 'fs-extra';
import lodash from 'lodash';
import type { GeneratedFile, ScreensetCategory } from '../core/types.js';
import { getTemplatesDir } from '../core/templates.js';
import { toPascalCase, toScreamingSnake } from './utils.js';

const { upperFirst } = lodash;

/**
 * Input for screenset generation from template
 */
export interface ScreensetFromTemplateInput {
  /** Screenset ID (camelCase) */
  screensetId: string;
  /** Initial screen ID (camelCase) */
  initialScreenId: string;
  /** Screenset category */
  category: ScreensetCategory;
}

/**
 * Transform template content by replacing _blank with new screenset name
 */
function transformContent(
  content: string,
  screensetId: string
): string {
  const pascalName = toPascalCase(screensetId);
  const screamingName = toScreamingSnake(screensetId);

  let result = content;

  // Replace constant names (SCREAMING_SNAKE_CASE)
  result = result.replace(/_BLANK_SCREENSET_ID/g, `${screamingName}_SCREENSET_ID`);
  result = result.replace(/_BLANK_DOMAIN/g, `${screamingName}_DOMAIN`);

  // Replace string values
  result = result.replace(/'_blank'/g, `'${screensetId}'`);
  result = result.replace(/"_blank"/g, `"${screensetId}"`);

  // Replace class/function/variable/file names
  result = result.replace(/_blankScreenset/g, `${screensetId}Screenset`);
  result = result.replace(/_blankApiService/g, `${screensetId}ApiService`);
  result = result.replace(/_blankMockMap/g, `${screensetId}MockMap`);
  result = result.replace(/_blankActions/g, `${screensetId}Actions`);
  result = result.replace(/_blankSlice/g, `${screensetId}Slice`);
  result = result.replace(/_blankEffects/g, `${screensetId}Effects`);
  result = result.replace(/_blankEvents/g, `${screensetId}Events`);
  result = result.replace(/_BlankEvents/g, `${pascalName}Events`);
  result = result.replace(/_BlankState/g, `${pascalName}State`);
  result = result.replace(/initialize_BlankEffects/g, `initialize${pascalName}Effects`);
  result = result.replace(/select_BlankState/g, `select${pascalName}State`);
  result = result.replace(/_blank/g, screensetId);
  result = result.replace(/_Blank/g, pascalName);

  // Replace comment references
  result = result.replace(/\* _blank/g, `* ${pascalName}`);

  return result;
}

/**
 * Transform file name by replacing _blank with new screenset name
 */
function transformFileName(fileName: string, screensetId: string): string {
  let result = fileName;

  // Replace in file names
  result = result.replace(/_blankScreenset/g, `${screensetId}Screenset`);
  result = result.replace(/_blankApiService/g, `${screensetId}ApiService`);
  result = result.replace(/_blankActions/g, `${screensetId}Actions`);
  result = result.replace(/_blankSlice/g, `${screensetId}Slice`);
  result = result.replace(/_blankEffects/g, `${screensetId}Effects`);
  result = result.replace(/_blankEvents/g, `${screensetId}Events`);
  result = result.replace(/_blank/g, screensetId);

  return result;
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
 * Generate screenset from template
 * Copies the _blank template and transforms all identifiers
 */
export async function generateScreensetFromTemplate(
  input: ScreensetFromTemplateInput
): Promise<GeneratedFile[]> {
  const { screensetId, category } = input;
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'screenset-template');

  // Check template exists
  const manifestPath = path.join(templatesDir, 'manifest.json');
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(
      'Templates not found. Run `npm run build` in packages/cli first.'
    );
  }

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(
      'Screenset template not found. Run `npm run build` in packages/cli first.'
    );
  }

  // Read all template files
  const templateFiles = await readTemplateFiles(templatePath);

  // Transform each file
  const outputFiles: GeneratedFile[] = [];

  for (const file of templateFiles) {
    // Transform file path
    const transformedPath = `src/screensets/${screensetId}/${transformFileName(file.path, screensetId)}`;

    // Transform content
    let transformedContent = transformContent(file.content, screensetId);

    // Update category in screenset config
    if (file.path.includes('Screenset.tsx')) {
      transformedContent = transformedContent.replace(
        /ScreensetCategory\.Drafts/g,
        `ScreensetCategory.${upperFirst(category)}`
      );
    }

    outputFiles.push({
      path: transformedPath,
      content: transformedContent,
    });
  }

  return outputFiles;
}

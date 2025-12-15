import path from 'path';
import fs from 'fs-extra';
import type { CommandDefinition } from '../../core/command.js';
import { validationOk, validationError } from '../../core/types.js';
import { copyLayoutTemplates, type LayoutUiKit } from '../../generators/layoutFromTemplate.js';
import { writeGeneratedFiles } from '../../utils/fs.js';

/**
 * Arguments for update layout command
 */
export interface UpdateLayoutArgs {
  uiKit?: LayoutUiKit;
  force?: boolean;
}

/**
 * Result of update layout command
 */
export interface UpdateLayoutResult {
  layoutPath: string;
  files: string[];
  uiKit: LayoutUiKit;
}

/**
 * Detect current UI kit from existing layout files
 */
async function detectCurrentUiKit(projectRoot: string): Promise<LayoutUiKit | null> {
  const layoutDir = path.join(projectRoot, 'src', 'layout');
  const headerPath = path.join(layoutDir, 'Header.tsx');

  if (!(await fs.pathExists(headerPath))) {
    return null;
  }

  try {
    const content = await fs.readFile(headerPath, 'utf-8');
    if (content.includes("from '@hai3/uikit'")) {
      return 'hai3-uikit';
    }
    return 'custom';
  } catch {
    return null;
  }
}

/**
 * Update layout command implementation
 *
 * Updates layout components from templates, preserving the UI kit type.
 */
export const updateLayoutCommand: CommandDefinition<
  UpdateLayoutArgs,
  UpdateLayoutResult
> = {
  name: 'update:layout',
  description: 'Update layout components from templates',
  args: [],
  options: [
    {
      name: 'ui-kit',
      shortName: 'u',
      description: 'UI kit to use (hai3-uikit or custom)',
      type: 'string',
      choices: ['hai3-uikit', 'custom'],
    },
    {
      name: 'force',
      shortName: 'f',
      description: 'Force update without prompting',
      type: 'boolean',
      defaultValue: false,
    },
  ],

  validate(args, ctx) {
    if (!ctx.projectRoot) {
      return validationError(
        'NOT_IN_PROJECT',
        'Not inside a HAI3 project. Run this command from a project root.'
      );
    }

    return validationOk();
  },

  async execute(args, ctx): Promise<UpdateLayoutResult> {
    const { logger, projectRoot, prompt } = ctx;
    const force = args.force ?? false;

    // Detect current UI kit if not specified
    let uiKit = args.uiKit as LayoutUiKit | undefined;
    if (!uiKit) {
      const detected = await detectCurrentUiKit(projectRoot!);
      if (detected) {
        uiKit = detected;
        logger.info(`Detected existing layout using '${uiKit}' templates`);
      } else {
        uiKit = 'hai3-uikit';
        logger.info('No existing layout detected, using default hai3-uikit templates');
      }
    }

    // Check for existing layout
    const layoutDir = path.join(projectRoot!, 'src', 'layout');
    if (await fs.pathExists(layoutDir)) {
      const existingFiles = await fs.readdir(layoutDir);
      if (existingFiles.length > 0 && !force) {
        logger.warn('Existing layout files will be overwritten:');
        for (const file of existingFiles.slice(0, 5)) {
          logger.log(`  ${file}`);
        }
        if (existingFiles.length > 5) {
          logger.log(`  ... and ${existingFiles.length - 5} more`);
        }
        logger.newline();

        const answers = await prompt<{ confirm: boolean }>([
          {
            name: 'confirm',
            message: 'Do you want to continue and overwrite these files?',
            type: 'confirm',
            default: false,
          },
        ]);

        if (!answers.confirm) {
          logger.info('Update cancelled');
          return {
            layoutPath: layoutDir,
            files: [],
            uiKit,
          };
        }
      }
    }

    logger.newline();
    logger.info(`Updating layout components using '${uiKit}' templates...`);
    logger.newline();

    // Generate files from template
    const files = await copyLayoutTemplates({
      uiKit,
      projectRoot: projectRoot!,
      force: true, // Already confirmed above
    });

    // Write files
    const writtenFiles = await writeGeneratedFiles(projectRoot!, files);

    logger.success(`Updated ${writtenFiles.length} layout files`);
    logger.newline();
    logger.log('Files updated:');
    for (const file of writtenFiles) {
      logger.log(`  ${file}`);
    }
    logger.newline();

    return {
      layoutPath: layoutDir,
      files: writtenFiles,
      uiKit,
    };
  },
};

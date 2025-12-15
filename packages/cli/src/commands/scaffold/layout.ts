import path from 'path';
import type { CommandDefinition } from '../../core/command.js';
import { validationOk, validationError } from '../../core/types.js';
import { copyLayoutTemplates } from '../../generators/layoutFromTemplate.js';
import { writeGeneratedFiles } from '../../utils/fs.js';

/**
 * UI Kit options for scaffold layout command
 */
export type UiKitOption = 'hai3-uikit' | 'custom';

/**
 * Arguments for scaffold layout command
 */
export interface ScaffoldLayoutArgs {
  uiKit?: UiKitOption;
  force?: boolean;
}

/**
 * Result of scaffold layout command
 */
export interface ScaffoldLayoutResult {
  layoutPath: string;
  files: string[];
  uiKit: UiKitOption;
}

/**
 * Scaffold layout command implementation
 *
 * Generates layout components (Layout, Header, Footer, Menu, etc.)
 * in the user's project from templates.
 */
export const scaffoldLayoutCommand: CommandDefinition<
  ScaffoldLayoutArgs,
  ScaffoldLayoutResult
> = {
  name: 'scaffold:layout',
  description: 'Generate layout components in your project',
  args: [],
  options: [
    {
      name: 'ui-kit',
      shortName: 'u',
      description: 'UI kit to use for components',
      type: 'string',
      choices: ['hai3-uikit', 'custom'],
      defaultValue: 'hai3-uikit',
    },
    {
      name: 'force',
      shortName: 'f',
      description: 'Overwrite existing layout files',
      type: 'boolean',
      defaultValue: false,
    },
  ],

  validate(args, ctx) {
    // Must be inside a project
    if (!ctx.projectRoot) {
      return validationError(
        'NOT_IN_PROJECT',
        'Not inside a HAI3 project. Run this command from a project root.'
      );
    }

    // Validate ui-kit option
    const uiKit = args.uiKit ?? 'hai3-uikit';
    if (!['hai3-uikit', 'custom'].includes(uiKit)) {
      return validationError(
        'INVALID_UI_KIT',
        `Invalid UI kit: ${uiKit}. Valid options: hai3-uikit, custom`
      );
    }

    return validationOk();
  },

  async execute(args, ctx): Promise<ScaffoldLayoutResult> {
    const { logger, projectRoot } = ctx;
    const uiKit = (args.uiKit ?? 'hai3-uikit') as UiKitOption;
    const force = args.force ?? false;

    logger.info(`Scaffolding layout components using '${uiKit}' templates...`);
    logger.newline();

    // Generate files from template
    const files = await copyLayoutTemplates({
      uiKit,
      projectRoot: projectRoot!,
      force,
    });

    // Write files
    const writtenFiles = await writeGeneratedFiles(projectRoot!, files);

    logger.success(`Generated ${writtenFiles.length} layout files`);
    logger.newline();
    logger.log('Files created:');
    for (const file of writtenFiles) {
      logger.log(`  ${file}`);
    }
    logger.newline();

    if (uiKit === 'hai3-uikit') {
      logger.info('Note: Make sure @hai3/uikit is installed:');
      logger.log('  npm install @hai3/uikit');
    } else {
      logger.info(
        'Note: Layout components use placeholder implementations.'
      );
      logger.log('  Replace them with your preferred UI library components.');
    }
    logger.newline();

    const layoutPath = path.join(projectRoot!, 'src', 'layout');

    return {
      layoutPath,
      files: writtenFiles,
      uiKit,
    };
  },
};

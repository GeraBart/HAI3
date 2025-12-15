import path from 'path';
import type { CommandDefinition } from '../../core/command.js';
import type { ScreensetCategory } from '../../core/types.js';
import { validationOk, validationError } from '../../core/types.js';
import { generateScreensetFromTemplate } from '../../generators/screensetFromTemplate.js';
import { writeGeneratedFiles } from '../../utils/fs.js';
import { getScreensetsDir, screensetExists } from '../../utils/project.js';
import { isCamelCase, isReservedScreensetName } from '../../utils/validation.js';
import { runProjectValidation, skipValidationOption } from '../../utils/projectValidation.js';

/**
 * Arguments for screenset create command
 */
export interface ScreensetCreateArgs {
  name: string;
  category?: ScreensetCategory;
  skipValidation?: boolean;
}

/**
 * Result of screenset create command
 */
export interface ScreensetCreateResult {
  screensetPath: string;
  files: string[];
  validationPassed?: boolean;
}

/**
 * Screenset create command implementation
 */
export const screensetCreateCommand: CommandDefinition<
  ScreensetCreateArgs,
  ScreensetCreateResult
> = {
  name: 'screenset:create',
  description: 'Create a new screenset with an initial screen',
  args: [
    {
      name: 'name',
      description: 'Name of the screenset (camelCase)',
      required: true,
    },
  ],
  options: [
    {
      name: 'category',
      shortName: 'c',
      description: 'Screenset category',
      type: 'string',
      choices: ['drafts', 'mockups', 'production'],
      defaultValue: 'drafts',
    },
    skipValidationOption,
  ],

  validate(args, ctx) {
    // Must be inside a project
    if (!ctx.projectRoot) {
      return validationError(
        'NOT_IN_PROJECT',
        'Not inside a HAI3 project. Run this command from a project root.'
      );
    }

    // Validate name
    if (!args.name) {
      return validationError('MISSING_NAME', 'Screenset name is required');
    }

    if (!isCamelCase(args.name)) {
      return validationError(
        'INVALID_NAME',
        "Screenset name must be camelCase (e.g., 'billing', 'userProfile')"
      );
    }

    if (isReservedScreensetName(args.name)) {
      return validationError(
        'RESERVED_NAME',
        `'${args.name}' is a reserved name and cannot be used`
      );
    }

    return validationOk();
  },

  async execute(args, ctx): Promise<ScreensetCreateResult> {
    const { logger, projectRoot } = ctx;
    const screensetId = args.name;
    const category = args.category ?? 'drafts';

    // Check if screenset already exists
    if (await screensetExists(projectRoot!, screensetId)) {
      throw new Error(
        `Screenset '${screensetId}' already exists at src/screensets/${screensetId}/`
      );
    }

    logger.info(`Creating screenset '${screensetId}'...`);
    logger.newline();

    // Generate files from template
    const files = await generateScreensetFromTemplate({
      screensetId,
      initialScreenId: 'home',
      category,
    });

    // Write files
    const writtenFiles = await writeGeneratedFiles(projectRoot!, files);

    logger.success(`Created screenset '${screensetId}' with ${writtenFiles.length} files`);
    logger.newline();
    logger.log('Files created:');
    for (const file of writtenFiles.slice(0, 5)) {
      logger.log(`  ${file}`);
    }
    if (writtenFiles.length > 5) {
      logger.log(`  ... and ${writtenFiles.length - 5} more`);
    }
    logger.newline();

    const screensetPath = path.join(
      getScreensetsDir(projectRoot!),
      screensetId
    );

    // Run validation unless skipped
    const validation = await runProjectValidation({
      projectRoot: projectRoot!,
      logger,
      skip: args.skipValidation,
    });

    return {
      screensetPath,
      files: writtenFiles,
      validationPassed: validation.success,
    };
  },
};

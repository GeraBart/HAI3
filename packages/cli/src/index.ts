#!/usr/bin/env node
/**
 * HAI3 CLI Entry Point
 *
 * Commands:
 *   hai3 create <project-name>              Create a new HAI3 project
 *   hai3 update                             Update CLI and project packages
 *   hai3 screenset create <name>            Create a new screenset
 *   hai3 screenset copy <source> <target>   Copy an existing screenset
 *   hai3 validate components [path]         Validate component structure
 */

import { Command } from 'commander';
import { registry, executeCommand } from './core/index.js';
import {
  createCommand,
  updateCommand,
  screensetCreateCommand,
  screensetCopyCommand,
  validateComponentsCommand,
} from './commands/index.js';

// CLI version
const VERSION = '0.1.0';

// Register all commands
registry.register(createCommand);
registry.register(updateCommand);
registry.register(screensetCreateCommand);
registry.register(screensetCopyCommand);
registry.register(validateComponentsCommand);

// Create Commander program
const program = new Command();

program
  .name('hai3')
  .description('HAI3 CLI - Project scaffolding and screenset management')
  .version(VERSION);

// Global quiet flag
program.option('-q, --quiet', 'Suppress non-essential output');

// hai3 create <project-name>
program
  .command('create <project-name>')
  .description('Create a new HAI3 project')
  .option('--uikit <type>', 'UIKit to use (hai3 or custom)', undefined)
  .option('--studio', 'Include Studio package')
  .option('--no-studio', 'Exclude Studio package')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip npm install')
  .action(async (projectName: string, options: Record<string, unknown>) => {
    const result = await executeCommand(
      createCommand,
      {
        projectName,
        uikit: options.uikit as 'hai3' | 'custom' | undefined,
        studio: options.studio as boolean | undefined,
        git: options.git as boolean,
        install: options.install as boolean,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 update
program
  .command('update')
  .description('Update HAI3 CLI and project packages')
  .option('-a, --alpha', 'Update to latest alpha/prerelease version')
  .option('-s, --stable', 'Update to latest stable version')
  .option('--templates-only', 'Only sync templates (skip CLI and package updates)')
  .action(async (options: Record<string, unknown>) => {
    const result = await executeCommand(
      updateCommand,
      {
        alpha: options.alpha as boolean | undefined,
        stable: options.stable as boolean | undefined,
        templatesOnly: options.templatesOnly as boolean | undefined,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 screenset subcommand
const screensetCmd = program
  .command('screenset')
  .description('Screenset management commands');

// hai3 screenset create <name>
screensetCmd
  .command('create <name>')
  .description('Create a new screenset with an initial screen')
  .option(
    '-c, --category <category>',
    'Screenset category (drafts, mockups, production)',
    'drafts'
  )
  .action(async (name: string, options: Record<string, unknown>) => {
    const result = await executeCommand(
      screensetCreateCommand,
      {
        name,
        category: options.category as 'drafts' | 'mockups' | 'production',
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 screenset copy <source> <target>
screensetCmd
  .command('copy <source> <target>')
  .description('Copy an existing screenset with transformed IDs')
  .option(
    '-c, --category <category>',
    'Category for new screenset (overrides source)'
  )
  .action(
    async (
      source: string,
      target: string,
      options: Record<string, unknown>
    ) => {
      const result = await executeCommand(
        screensetCopyCommand,
        {
          source,
          target,
          category: options.category as
            | 'drafts'
            | 'mockups'
            | 'production'
            | undefined,
        },
        { interactive: true }
      );

      if (!result.success) {
        process.exit(1);
      }
    }
  );

// hai3 validate subcommand
const validateCmd = program
  .command('validate')
  .description('Validation commands');

// hai3 validate components [path]
validateCmd
  .command('components [path]')
  .description('Validate component structure and placement')
  .action(async (targetPath: string | undefined) => {
    const result = await executeCommand(
      validateComponentsCommand,
      { path: targetPath },
      { interactive: true }
    );

    if (!result.success || !result.data?.passed) {
      process.exit(1);
    }
  });

// Parse and execute
program.parse();

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
  scaffoldLayoutCommand,
  aiSyncCommand,
  updateLayoutCommand,
} from './commands/index.js';

// CLI version
const VERSION = '0.1.0';

// Register all commands
registry.register(createCommand);
registry.register(updateCommand);
registry.register(screensetCreateCommand);
registry.register(screensetCopyCommand);
registry.register(validateComponentsCommand);
registry.register(scaffoldLayoutCommand);
registry.register(aiSyncCommand);
registry.register(updateLayoutCommand);

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
  .description('Create a new HAI3 project or layer package')
  .option('--uikit <type>', 'UIKit to use (hai3 or custom)', undefined)
  .option('--studio', 'Include Studio package')
  .option('--no-studio', 'Exclude Studio package')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip npm install')
  .option('-l, --layer <type>', 'Create a package for a specific SDK layer (sdk, framework, react)')
  .action(async (projectName: string, options: Record<string, unknown>) => {
    const result = await executeCommand(
      createCommand,
      {
        projectName,
        uikit: options.uikit as 'hai3' | 'custom' | undefined,
        studio: options.studio as boolean | undefined,
        git: options.git as boolean,
        install: options.install as boolean,
        layer: options.layer as 'sdk' | 'framework' | 'react' | 'app' | undefined,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 update subcommand
const updateCmd = program
  .command('update')
  .description('Update commands for HAI3 projects');

// hai3 update (default - updates CLI and packages)
updateCmd
  .command('packages', { isDefault: true })
  .description('Update HAI3 CLI and project packages')
  .option('-a, --alpha', 'Update to latest alpha/prerelease version')
  .option('-s, --stable', 'Update to latest stable version')
  .option('--templates-only', 'Only sync templates (skip CLI and package updates)')
  .option('--skip-ai-sync', 'Skip running AI sync after update')
  .action(async (options: Record<string, unknown>) => {
    const result = await executeCommand(
      updateCommand,
      {
        alpha: options.alpha as boolean | undefined,
        stable: options.stable as boolean | undefined,
        templatesOnly: options.templatesOnly as boolean | undefined,
        skipAiSync: options.skipAiSync as boolean | undefined,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 update layout
updateCmd
  .command('layout')
  .description('Update layout components from templates')
  .option(
    '-u, --ui-kit <type>',
    'UI kit to use (hai3-uikit or custom)'
  )
  .option('-f, --force', 'Force update without prompting')
  .action(async (options: Record<string, unknown>) => {
    const result = await executeCommand(
      updateLayoutCommand,
      {
        uiKit: options.uiKit as 'hai3-uikit' | 'custom' | undefined,
        force: options.force as boolean,
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

// hai3 scaffold subcommand
const scaffoldCmd = program
  .command('scaffold')
  .description('Generate project components from templates');

// hai3 scaffold layout
scaffoldCmd
  .command('layout')
  .description('Generate layout components in your project')
  .option(
    '-u, --ui-kit <type>',
    'UI kit to use (hai3-uikit or custom)',
    'hai3-uikit'
  )
  .option('-f, --force', 'Overwrite existing layout files')
  .action(async (options: Record<string, unknown>) => {
    const result = await executeCommand(
      scaffoldLayoutCommand,
      {
        uiKit: options.uiKit as 'hai3-uikit' | 'custom',
        force: options.force as boolean,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// hai3 ai subcommand
const aiCmd = program
  .command('ai')
  .description('AI assistant configuration commands');

// hai3 ai sync
aiCmd
  .command('sync')
  .description('Sync AI assistant configuration files')
  .option(
    '-t, --tool <tool>',
    'Specific tool to sync (claude, copilot, cursor, windsurf, all)',
    'all'
  )
  .option('-d, --detect-packages', 'Detect installed @hai3 packages')
  .option('--diff', 'Show diff of changes without writing files')
  .action(async (options: Record<string, unknown>) => {
    const result = await executeCommand(
      aiSyncCommand,
      {
        tool: options.tool as 'claude' | 'copilot' | 'cursor' | 'windsurf' | 'all',
        detectPackages: options.detectPackages as boolean,
        diff: options.diff as boolean,
      },
      { interactive: true }
    );

    if (!result.success) {
      process.exit(1);
    }
  });

// Parse and execute
program.parse();

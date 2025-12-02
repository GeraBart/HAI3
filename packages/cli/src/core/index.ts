/**
 * Core CLI infrastructure exports
 */

export type { CommandContext, CommandDefinition } from './command.js';
export type {
  Hai3Config,
  ScreensetCategory,
  ArgDefinition,
  OptionDefinition,
  ValidationError,
  ValidationResult,
  CommandResult,
  ExecutionMode,
  GeneratedFile,
} from './types.js';
export { validationOk, validationError } from './types.js';
export { Logger } from './logger.js';
export type { PromptFn, PromptQuestion } from './prompt.js';
export { createInteractivePrompt, createProgrammaticPrompt } from './prompt.js';
export { CommandRegistry, registry } from './registry.js';
export { executeCommand, buildCommandContext } from './executor.js';
export type { SyncTemplate, TemplateLogger } from './templates.js';
export {
  SYNC_TEMPLATES,
  CREATE_ONLY_TEMPLATES,
  getTemplatesDir,
  syncTemplates,
} from './templates.js';

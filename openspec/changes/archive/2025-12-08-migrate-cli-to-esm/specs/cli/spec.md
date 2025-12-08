## MODIFIED Requirements

### Requirement: CLI Package Structure

The CLI SHALL be implemented as a workspace package `@hai3/cli` with a globally installable binary named `hai3` and a programmatic API for AI agent integration.

#### Scenario: Package installation

**Given** a developer installing the CLI globally
**When** running `npm install -g @hai3/cli`
**Then** the system SHALL:
- Install the `@hai3/cli` package
- Make `hai3` command available in PATH
- Support ESM environments (Node.js 18+)
- Support both ESM `import` and CommonJS `require()` for programmatic API

#### Scenario: Package structure

```
packages/cli/
├── package.json          # name: @hai3/cli, type: module, bin: { hai3: ./dist/index.js }
├── tsup.config.ts        # Bundle config (ESM primary, dual exports for API)
├── scripts/
│   └── copy-templates.ts # Build-time template copying
├── templates/            # Gitignored - generated at build
│   ├── manifest.json
│   ├── screenset-template/
│   └── ...
├── src/
│   ├── index.ts          # CLI entry point (Commander setup)
│   ├── api.ts            # Programmatic API exports
│   │
│   ├── core/
│   │   ├── command.ts    # CommandDefinition interface
│   │   ├── registry.ts   # CommandRegistry class
│   │   ├── executor.ts   # executeCommand() function
│   │   ├── types.ts      # Shared types
│   │   ├── logger.ts     # Colored output (silenceable)
│   │   └── prompt.ts     # Prompt abstraction
│   │
│   ├── commands/
│   │   ├── create/       # Project creation command
│   │   ├── update/       # Update command
│   │   └── screenset/    # Screenset subcommands
│   │
│   ├── generators/
│   │   ├── project.ts          # Template-based project generation
│   │   ├── screensetFromTemplate.ts  # Template-based screenset generation
│   │   ├── screenset.ts        # Legacy programmatic (reference)
│   │   ├── i18n.ts             # Translation utilities
│   │   ├── transform.ts        # ID transformation for copy
│   │   └── utils.ts            # toPascalCase, toScreamingSnake, etc.
│   │
│   └── utils/
│       ├── project.ts    # findProjectRoot(), loadConfig()
│       ├── fs.ts         # writeGeneratedFiles()
│       └── validation.ts # Name validation utilities
```

**Given** the package structure above
**When** tsup builds the package
**Then** the output SHALL include:
- ESM CLI binary (`dist/index.js`)
- Dual-format API exports (`dist/api.js` for ESM, `dist/api.cjs` for CommonJS)
- Type declarations (`dist/api.d.ts`)

#### Scenario: Package.json exports configuration

**Given** the package.json configuration
**When** consumers import the package
**Then** the exports field SHALL provide:
```json
{
  "type": "module",
  "bin": {
    "hai3": "./dist/index.js"
  },
  "main": "./dist/api.cjs",
  "module": "./dist/api.js",
  "types": "./dist/api.d.ts",
  "exports": {
    ".": {
      "types": "./dist/api.d.ts",
      "import": "./dist/api.js",
      "require": "./dist/api.cjs"
    }
  }
}
```

#### Scenario: ESM dependencies compatibility

**Given** ESM-only dependencies (`inquirer@9+`, `chalk@5+`)
**When** bundling the CLI
**Then** the system SHALL:
- Use native ESM imports for all dependencies
- Bundle dependencies appropriately for each output format
- Provide `import.meta.url` based path resolution instead of `__dirname`

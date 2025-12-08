# Change: Migrate CLI Package to ESM

## Why

The HAI3 CLI (`@hai3/cli`) is currently bundled as CommonJS but depends on `inquirer@^9.2.23`, which is ESM-only. This creates a fundamental incompatibility that causes runtime errors. Additionally, other dependencies like `chalk@5+` have also moved to ESM-only distribution.

The Node.js ecosystem is converging on ESM as the standard module format. Modern CLI tools (`create-vite`, `tsx`, `degit`) are already ESM-only. HAI3 CLI requires Node.js 18+, which has full ESM support.

## What Changes

- **Package format**: Change from CommonJS-only to ESM-only (`"type": "module"`)
- **Build output**: Change from `.cjs` to `.js` ESM output
- **Dependencies**: Update to modern ESM versions (`chalk@5`, keep `inquirer@9+`)
- **Programmatic API**: Provide ESM exports (CJS consumers can use dynamic `import()`)
- **Align with HAI3 packages**: Match the dual-export pattern used by `@hai3/uicore` and `@hai3/uikit` for the API, while keeping CLI binary ESM-only

## Impact

- Affected specs: `cli`
- Affected code: `packages/cli/package.json`, `packages/cli/tsup.config.ts`, `packages/cli/src/**`
- **BREAKING**: CJS consumers using `require('@hai3/cli')` must switch to `import('@hai3/cli')` or `await import('@hai3/cli')`
- No impact on CLI usage (`hai3` command works the same)
- No impact on HAI3 project templates (they don't depend on CLI as a library)

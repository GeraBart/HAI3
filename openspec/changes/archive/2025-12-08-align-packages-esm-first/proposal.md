# Change: Align All Packages to ESM-First Pattern

## Why

After migrating `@hai3/cli` to ESM-first, the HAI3 packages now have inconsistent module configurations:

- `@hai3/cli` and `@hai3/uikit-contracts` use modern ESM-first pattern
- `@hai3/uicore`, `@hai3/uikit`, `@hai3/studio` use older CJS-first pattern

This inconsistency causes confusion and doesn't follow modern Node.js best practices. All packages should use the same pattern for maintainability and ecosystem alignment.

## What Changes

For `@hai3/uicore`, `@hai3/uikit`, and `@hai3/studio`:

- **Package format**: Add `"type": "module"` to package.json
- **File extensions**: Change from `.js`/`.mjs` to `.cjs`/`.js`
- **Exports order**: ESM (`import`) listed before CJS (`require`)

No functional changes - packages already provide dual exports.

## Impact

- Affected specs: `publishing`
- Affected code: `packages/uicore/package.json`, `packages/uikit/package.json`, `packages/studio/package.json`
- **Non-breaking**: Consumers using `import` or `require` will continue to work
- Aligns with Node.js and npm ecosystem conventions

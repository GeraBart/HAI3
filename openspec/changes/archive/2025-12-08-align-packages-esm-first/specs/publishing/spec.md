## ADDED Requirements

### Requirement: Package Module Format

All HAI3 packages SHALL use ESM-first module format with dual exports for maximum compatibility.

#### Scenario: ESM-first package configuration

**Given** any HAI3 package (`@hai3/uicore`, `@hai3/uikit`, `@hai3/uikit-contracts`, `@hai3/studio`, `@hai3/cli`)
**When** examining the package.json
**Then** the configuration SHALL include:
- `"type": "module"` field
- `"main"` pointing to `.cjs` file (CommonJS entry)
- `"module"` pointing to `.js` file (ESM entry)
- `"exports"` with `import` and `require` conditions

#### Scenario: Standard package.json exports structure

**Given** a HAI3 library package (uicore, uikit, uikit-contracts, studio)
**When** configuring exports
**Then** the structure SHALL be:
```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

#### Scenario: Build output file extensions

**Given** running `npm run build` on any HAI3 package
**When** the build completes
**Then** the dist folder SHALL contain:
- `index.js` - ESM bundle
- `index.cjs` - CommonJS bundle
- `index.d.ts` - TypeScript declarations

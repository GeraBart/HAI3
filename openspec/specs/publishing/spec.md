# publishing Specification

## Purpose
TBD - created by archiving change add-npm-publishing. Update Purpose after archive.
## Requirements
### Requirement: Package Publishing Metadata

All HAI3 packages (`@hai3/uikit-contracts`, `@hai3/uikit`, `@hai3/uicore`, `@hai3/studio`, `@hai3/cli`) SHALL include complete NPM publishing metadata in their `package.json` files.

Required fields:
- `author`: "HAI3org"
- `license`: "Apache-2.0"
- `repository`: GitHub repository with directory path
- `bugs`: GitHub issues URL
- `homepage`: GitHub repository URL
- `keywords`: Package-specific keywords
- `engines`: Node.js version requirement (>=18)
- `sideEffects`: Tree-shaking hint
- `publishConfig`: Public access configuration
- `files`: Published file list
- `exports`: Modern Node.js exports map

#### Scenario: Package metadata validation

- **WHEN** running `npm pack` on any HAI3 package
- **THEN** the package includes only dist files and README
- **AND** package.json contains all required publishing fields

### Requirement: Version Alignment

All HAI3 packages SHALL use aligned versions (same version number across all `@hai3/*` packages).

#### Scenario: Version consistency

- **WHEN** checking versions across all packages
- **THEN** all `@hai3/*` packages have the same version number

### Requirement: Peer Dependencies

Each package SHALL declare appropriate peer dependencies to ensure compatibility.

#### Scenario: React peer dependency

- **WHEN** installing `@hai3/uikit` or `@hai3/uicore` or `@hai3/studio`
- **THEN** React 18+ is required as a peer dependency

#### Scenario: CLI standalone

- **WHEN** installing `@hai3/cli` globally
- **THEN** no peer dependencies are required

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


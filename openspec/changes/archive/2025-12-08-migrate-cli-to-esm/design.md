# Design: CLI ESM Migration

## Context

### Current State
- CLI bundled as CommonJS (`.cjs`) via tsup
- Depends on ESM-only packages: `inquirer@^9.2.23`
- Using older CJS-compatible versions of other deps: `chalk@^4.1.2`
- Other HAI3 packages (`uicore`, `uikit`) provide dual ESM/CJS exports

### Industry Analysis (December 2025)

| Package | Module Format | Notes |
|---------|---------------|-------|
| `create-vite` | ESM-only | Modern CLI standard |
| `tsx` | ESM-only | TypeScript runner |
| `commander` | CommonJS | Broad compatibility focus |
| `inquirer@9+` | ESM-only | No CJS support |
| `chalk@5+` | ESM-only | Moved from CJS in v5 |
| `@angular/cli` | CommonJS | Legacy enterprise focus |

**Trend**: Modern CLI tools targeting Node.js 18+ are moving to ESM-only.

### Node.js ESM Support Timeline
- Node.js 12+: Basic ESM support
- Node.js 14+: Stable ESM
- Node.js 18+: Full ESM support (HAI3 minimum)
- Node.js 22+: `require(esm)` support (CJS can import ESM)

## Goals / Non-Goals

### Goals
- Fix the ESM-only dependency incompatibility
- Align with modern Node.js best practices
- Maintain CLI functionality (`hai3` command)
- Support programmatic API usage from both ESM and CJS consumers

### Non-Goals
- Maintaining pure CJS output (deprecated approach)
- Supporting Node.js < 18 (already outside HAI3 requirements)
- Changing CLI command interface or behavior

## Decision: ESM-Primary with Dual API Exports

### Approach
1. **CLI Binary**: ESM-only (`.js` with `"type": "module"`)
2. **Programmatic API**: Dual exports via tsup (`import` and `require`)

### Rationale
- CLI tools are entry points, not consumed as libraries by other packages
- The programmatic API for AI agents should support both module systems
- tsup can bundle ESM dependencies into CJS output for the API
- Matches the pattern used by `@hai3/uicore` and `@hai3/uikit`

### Alternatives Considered

#### Option A: ESM-Only (Entire Package)
```json
{
  "type": "module",
  "exports": {
    ".": "./dist/api.js"
  }
}
```
- **Pros**: Simplest configuration, smallest bundle
- **Cons**: CJS consumers must use dynamic `import()`, breaking change
- **Verdict**: Acceptable for CLI, but API should support both

#### Option B: Dual Exports (Recommended)
```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/api.js",
      "require": "./dist/api.cjs"
    }
  }
}
```
- **Pros**: Maximum compatibility, consistent with other HAI3 packages
- **Cons**: Slightly larger package, two output files
- **Verdict**: Best balance of modern approach and compatibility

#### Option C: Stay CJS with Dynamic Imports
```typescript
// Wrap all ESM deps in dynamic imports
const inquirer = await import('inquirer');
```
- **Pros**: Maintains CJS output
- **Cons**: Async everywhere, complex error handling, poor DX
- **Verdict**: Rejected - hacky workaround, not sustainable

#### Option D: Downgrade to CJS-Compatible Dependencies
- Use `inquirer@8` (last CJS version)
- Use `chalk@4` (current, CJS)
- **Pros**: No module system changes
- **Cons**: Missing features, security updates, going against ecosystem
- **Verdict**: Rejected - technical debt, not forward-compatible

### Package.json Configuration (Option B)

```json
{
  "name": "@hai3/cli",
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

### tsup Configuration

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',  // CLI entry (ESM only)
    api: 'src/api.ts',      // API entry (dual)
  },
  format: ['esm', 'cjs'],
  dts: {
    entry: { api: 'src/api.ts' },
  },
  clean: true,
  sourcemap: true,
  shims: true,  // Provides __dirname, __filename for ESM
  splitting: false,  // Keep single file for CLI
  // CLI gets ESM only, API gets both
  esbuildOptions(options, context) {
    if (context.format === 'cjs' && options.entryPoints?.includes('src/index.ts')) {
      // Skip CJS build for CLI entry
      options.entryPoints = options.entryPoints.filter(e => e !== 'src/index.ts');
    }
  },
});
```

## Risks / Trade-offs

### Risk: CJS API Consumers Breaking
- **Impact**: Medium - AI agents using `require('@hai3/cli')` need updates
- **Mitigation**: Dual exports mean `require()` still works via `.cjs` output
- **Migration**: Document in changelog, provide clear examples

### Risk: __dirname / __filename Not Available in ESM
- **Impact**: Low - CLI uses these for template paths
- **Mitigation**: tsup's `shims: true` provides these, or use `import.meta.url`

### Risk: Dynamic Imports in CJS Bundle
- **Impact**: Low - tsup handles this via bundling
- **Mitigation**: Test CJS output thoroughly before release

## Migration Plan

### Phase 1: Update Build Configuration
1. Update `tsup.config.ts` for dual output
2. Update `package.json` with ESM configuration
3. Verify builds produce correct outputs

### Phase 2: Update Dependencies
1. Update `chalk` to `^5.x` (ESM-only, cleaner syntax)
2. Keep `inquirer@^9.x` (already correct)
3. Verify `commander` and `fs-extra` work in ESM

### Phase 3: Code Updates
1. Change `require()` to `import` where needed
2. Replace `__dirname` with `import.meta.url` patterns
3. Update file extensions if needed (`.js` for ESM)

### Phase 4: Testing
1. Test CLI commands in clean environment
2. Test programmatic API from both ESM and CJS consumers
3. Test `npm pack` and local installation

### Rollback
- Revert to previous `package.json` and `tsup.config.ts`
- Dependencies can stay updated (issue is build output, not deps)

## Open Questions

1. **Should we provide type declarations for CJS?**
   - Current: Only ESM types (`.d.ts`)
   - Option: Also provide `.d.cts` for CJS-specific types
   - Recommendation: Single `.d.ts` is sufficient, TypeScript handles both

2. **Update chalk to v5 or keep v4?**
   - v4 is CJS-compatible but works in ESM too
   - v5 is ESM-only with cleaner API
   - Recommendation: Update to v5 for consistency and smaller bundle

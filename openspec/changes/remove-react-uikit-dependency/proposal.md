# Change: Clean @hai3/react Layer Dependencies

## Why

The `@hai3/react` package (L3) has layer architecture violations that need to be cleaned up:

### Violation 1: @hai3/uikit dependency

The package has a peerDependency on `@hai3/uikit` and contains a `uikitRegistry` module. Both are obsolete artifacts from the old architecture where SDK packages handled rendering.

**Key architectural insight**: Since `@hai3/uicore` is deprecated and rendering has moved to L4 (user's project via CLI scaffolding), there is no longer any need for:

1. A uikit registry in the SDK layer - component registration happens in user code
2. A peerDependency on `@hai3/uikit` - the uikit is entirely optional and user-managed
3. Re-exports of uikit types - users import directly from `@hai3/uikit` when they use it

### Violation 2: @hai3/i18n dependency

According to sdk-core spec, @hai3/react (L3) should ONLY depend on @hai3/framework (L2). Currently @hai3/react has `@hai3/i18n` in peerDependencies and directly imports from it:

```typescript
// packages/react/src/index.ts line 212
export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n';
```

This violates layer architecture. L3 should access L1 types through L2 (@hai3/framework), not directly.

**Solution**: @hai3/framework already re-exports all needed i18n types:
- `Language`, `TextDirection`, `LanguageDisplayMode` are re-exported at line 280 of `packages/framework/src/index.ts`

So @hai3/react should import these from @hai3/framework instead of @hai3/i18n.

**Note on isolatedModules**: The original comment in `packages/react/src/index.ts` mentions that `Language` is exported because re-exporting enums requires `isolatedModules: false`. This concern is addressed because `@hai3/framework` already exports `Language` as a value export (line 280 of `packages/framework/src/index.ts`), so importing from `@hai3/framework` does not require special TypeScript configuration.

This is a **cleanup and relocation task**. The uikitRegistry was a mistake from the old architecture that should be purged. TextLoader is still needed functionality - it just belongs in the 4th layer (user's project), not in @hai3/react.

## What Changes

### Deletions from @hai3/react

1. **DELETE** `packages/react/src/uikitRegistry.ts` - This module is obsolete
2. **DELETE** `packages/react/src/components/TextLoader.tsx` - This component belongs in L4
3. **REMOVE** `@hai3/uikit` from peerDependencies in package.json
4. **REMOVE** all `@hai3/uikit` imports and re-exports from index.ts

### Fix @hai3/i18n Layer Violation

5. **REMOVE** `@hai3/i18n` from peerDependencies in package.json
6. **UPDATE** i18n type re-exports in index.ts to import from `@hai3/framework` instead of `@hai3/i18n`
   - Change: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n'`
   - To: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/framework'`
   - Note: @hai3/framework already re-exports these types, so this is just fixing the import source

### Relocation to CLI Templates (L4)

7. **MOVE** `TextLoader.tsx` to `packages/cli/templates/src/app/components/TextLoader.tsx`
   - Adapt to use local uikitRegistry from `src/app/uikit/uikitRegistry.tsx`
   - Import `useTranslation` from `@hai3/react`
   - Import `Skeleton` directly from `@hai3/uikit` (no registry lookup)

### Code Changes in @hai3/react

- `packages/react/src/index.ts`: Remove uikitRegistry export, TextLoader component, all @hai3/uikit re-exports, and fix @hai3/i18n imports
- `packages/react/src/components/index.ts`: Remove TextLoader export
- `packages/react/src/types.ts`: Remove TextLoaderProps if present (keep type in template)
- `packages/react/tsup.config.ts`: Remove @hai3/uikit from externals if listed
- `packages/react/CLAUDE.md`: Update documentation - TextLoader moved to CLI templates

### Code Changes in CLI Templates

- `packages/cli/templates/src/app/components/TextLoader.tsx`: New file with simplified TextLoader
- `packages/cli/templates/src/app/components/index.ts`: Export TextLoader component

### NOT Backward Compatible

This is alpha stage software. We relocate cleanly without deprecation warnings. Users importing TextLoader from @hai3/react will get a compile error and must update their import to use the local component.

## Impact

- **Affected specs**: sdk-core (React layer constraints, CLI-Generated Layout requirements)
- **Affected packages**:
  - `@hai3/react` - Remove dependency, delete obsolete modules
  - `@hai3/cli` - Add TextLoader to templates
- **Migration**:
  - Users who used `uikitRegistry` from @hai3/react must use the local registry in their project
  - Users who used `TextLoader` from @hai3/react must import from local `src/app/components/TextLoader`
  - New projects scaffolded by CLI will have TextLoader available automatically

## Error Cases

### Scenario: User imports deleted module
- **WHEN** user imports `uikitRegistry` from `@hai3/react`
- **THEN** TypeScript/bundler throws "module not found" error
- **BECAUSE** the module no longer exists
- **RESOLUTION**: User uses local uikitRegistry at `src/app/uikit/uikitRegistry.tsx`

### Scenario: User imports TextLoader from @hai3/react
- **WHEN** user imports `TextLoader` from `@hai3/react`
- **THEN** TypeScript/bundler throws "module not found" error
- **BECAUSE** the component was moved to CLI templates
- **RESOLUTION**: User imports from local `src/app/components/TextLoader` or creates their own

### Scenario: Existing project without TextLoader template
- **WHEN** an existing project (created before this change) needs TextLoader
- **THEN** user can copy the component from CLI templates manually
- **BECAUSE** CLI scaffolding only applies to new projects
- **RESOLUTION**: User copies `TextLoader.tsx` from templates or implements their own

## Acceptance Criteria

1. `npm run arch:deps` passes for @hai3/react package
2. @hai3/react package.json has no @hai3/uikit in dependencies or peerDependencies
3. @hai3/react package.json has no @hai3/i18n in dependencies or peerDependencies
4. `packages/react/src/uikitRegistry.ts` file does not exist
5. `packages/react/src/components/TextLoader.tsx` file does not exist
6. No imports from `@hai3/uikit` exist anywhere in @hai3/react source
7. No imports from `@hai3/i18n` exist anywhere in @hai3/react source
8. i18n types (Language, TextDirection, LanguageDisplayMode) are re-exported from @hai3/framework in @hai3/react
9. `npm run build -w @hai3/react` succeeds
10. `npm run type-check -w @hai3/react` succeeds
11. `packages/cli/templates/src/app/components/TextLoader.tsx` exists and is valid
12. CLI templates build and scaffold correctly with TextLoader included

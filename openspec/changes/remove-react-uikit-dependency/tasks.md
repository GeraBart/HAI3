# Tasks: Clean @hai3/react Layer Dependencies

## Phase 1: Clean up @hai3/react

### 1. Delete Obsolete Files
- [ ] 1.1 Delete uikitRegistry.ts
  - File: `packages/react/src/uikitRegistry.ts`
  - Action: DELETE entire file
  - Traces to: proposal.md "Deletions from @hai3/react" item 1

- [ ] 1.2 Delete TextLoader.tsx from @hai3/react
  - File: `packages/react/src/components/TextLoader.tsx`
  - Action: DELETE entire file (will be recreated in CLI templates)
  - Traces to: proposal.md "Deletions from @hai3/react" item 2

### 2. Update Exports
- [ ] 2.1 Update components/index.ts
  - File: `packages/react/src/components/index.ts`
  - Remove: `export { TextLoader } from './TextLoader'`
  - Traces to: proposal.md "Code Changes in @hai3/react"

- [ ] 2.2 Update main index.ts - remove uikitRegistry export
  - File: `packages/react/src/index.ts`
  - Remove: `export { uikitRegistry } from './uikitRegistry'`
  - Traces to: proposal.md "Code Changes in @hai3/react"

- [ ] 2.3 Update main index.ts - remove @hai3/uikit re-exports
  - File: `packages/react/src/index.ts`
  - Remove: `export { UiKitComponent, UiKitIcon } from '@hai3/uikit'`
  - Remove: `export type { UiKitComponentMap, ComponentName } from '@hai3/uikit'`
  - Traces to: proposal.md "Deletions from @hai3/react" item 4

- [ ] 2.4 Update main index.ts - remove TextLoader type exports
  - File: `packages/react/src/index.ts`
  - Remove from type exports block (lines 62-66):
    - `TextLoaderProps` (line 62)
    - `TextLoaderComponent` (line 65)
  - Traces to: proposal.md "Code Changes in @hai3/react"

- [ ] 2.5 Update main index.ts - update header comment
  - File: `packages/react/src/index.ts`
  - Update line 8: Remove "- TextLoader for translation loading" from the header comment
  - The comment currently lists TextLoader as a provided feature; this is no longer accurate
  - Traces to: proposal.md "Code Changes in @hai3/react"

### 3. Update Types
- [ ] 3.1 Remove TextLoader-related types from types.ts
  - File: `packages/react/src/types.ts`
  - Remove: `TextLoaderProps` interface definition
  - Remove: `TextLoaderComponent` type definition
  - NOTE: These types will live with the component in the CLI template (`packages/cli/templates/src/app/components/TextLoader.tsx`)
  - Traces to: design.md "Phase 1 / Step 1.3: Update Types"

- [ ] 3.2 Update comment in types.ts referencing @hai3/i18n
  - File: `packages/react/src/types.ts`
  - Update: Line 32 comment that references @hai3/i18n to reference @hai3/framework instead
  - Traces to: proposal.md "Fix @hai3/i18n Layer Violation"

### 4. Update Package Configuration
- [ ] 4.1 Remove @hai3/uikit from package.json peerDependencies
  - File: `packages/react/package.json`
  - Remove: `"@hai3/uikit": "*"` from peerDependencies
  - Traces to: proposal.md "Deletions from @hai3/react" item 3

- [ ] 4.2 Remove @hai3/uikit from peerDependenciesMeta
  - File: `packages/react/package.json`
  - Remove: `"@hai3/uikit": { "optional": false }` from peerDependenciesMeta
  - Traces to: proposal.md "Deletions from @hai3/react" item 3

- [ ] 4.3 Remove @hai3/uikit from tsup externals (if present)
  - File: `packages/react/tsup.config.ts`
  - Check and remove `'@hai3/uikit'` from external array if listed
  - Traces to: proposal.md "Code Changes in @hai3/react"

- [ ] 4.4 Remove @hai3/i18n from package.json peerDependencies
  - File: `packages/react/package.json`
  - Remove: `"@hai3/i18n": "*"` from peerDependencies
  - Traces to: proposal.md "Fix @hai3/i18n Layer Violation" item 5

- [ ] 4.5 Remove @hai3/i18n from peerDependenciesMeta
  - File: `packages/react/package.json`
  - Remove: `"@hai3/i18n": { "optional": false }` from peerDependenciesMeta
  - Traces to: proposal.md "Fix @hai3/i18n Layer Violation" item 5

- [ ] 4.6 Remove @hai3/i18n from tsup.config.ts externals
  - File: `packages/react/tsup.config.ts`
  - Remove: `'@hai3/i18n'` from external array (currently at line 16)
  - Traces to: proposal.md "Fix @hai3/i18n Layer Violation" item 5

### 5. Fix i18n Imports

- [ ] 5.1 Update i18n type re-exports to use @hai3/framework
  - File: `packages/react/src/index.ts`
  - Change line 212: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/i18n'`
  - To: `export { Language, TextDirection, LanguageDisplayMode } from '@hai3/framework'`
  - Traces to: proposal.md "Fix @hai3/i18n Layer Violation" item 6

### 6. Update Documentation
- [ ] 6.1 Update CLAUDE.md - note TextLoader moved to CLI templates
  - File: `packages/react/CLAUDE.md`
  - Update: TextLoader documentation to note it moved to `src/app/components/TextLoader.tsx`
  - Remove: TextLoader from Components section (or add note about relocation)
  - Traces to: design.md "Phase 1 / Step 1.6: Update Documentation"

- [ ] 6.2 Update CLAUDE.md - remove uikitRegistry references
  - File: `packages/react/CLAUDE.md`
  - Remove: Any mention of uikitRegistry
  - Remove: "NO Layout components here - Layout is in @hai3/uikit or user code" line (outdated)
  - Traces to: design.md "Phase 1 / Step 1.6: Update Documentation"

## Phase 2: Add to CLI Templates

### 7. Create TextLoader in CLI Templates
- [ ] 7.1 Create TextLoader.tsx component
  - File: `packages/cli/templates/src/app/components/TextLoader.tsx`
  - Content: Adapted TextLoader with direct @hai3/uikit imports (no registry)
  - Include: TextLoaderProps interface inline
  - Traces to: proposal.md "Relocation to CLI Templates (L4)" item 7

- [ ] 7.2 Create components index.ts
  - File: `packages/cli/templates/src/app/components/index.ts`
  - Export: `export { TextLoader, type TextLoaderProps } from './TextLoader'`
  - Traces to: proposal.md "Code Changes in CLI Templates"

## Phase 3: Validation

### 8. Validate @hai3/react
- [ ] 8.1 Run TypeScript type check
  - Command: `npm run type-check -w @hai3/react`
  - Expected: No type errors
  - Traces to: proposal.md "Acceptance Criteria" item 10

- [ ] 8.2 Run build
  - Command: `npm run build -w @hai3/react`
  - Expected: Successful build
  - Traces to: proposal.md "Acceptance Criteria" item 9

- [ ] 8.3 Run architecture dependency check
  - Command: `npm run arch:deps`
  - Expected: @hai3/react passes without violations
  - Traces to: proposal.md "Acceptance Criteria" item 1

- [ ] 8.4 Verify no @hai3/uikit imports remain
  - Command: `grep -r "@hai3/uikit" packages/react/src/`
  - Expected: No matches found
  - Traces to: proposal.md "Acceptance Criteria" item 6

- [ ] 8.5 Verify no @hai3/i18n imports remain
  - Command: `grep -r "@hai3/i18n" packages/react/src/`
  - Expected: No matches found
  - Traces to: proposal.md "Acceptance Criteria" item 7

- [ ] 8.6 Verify i18n types are re-exported from @hai3/framework
  - Command: `grep "Language.*TextDirection.*LanguageDisplayMode.*@hai3/framework" packages/react/src/index.ts`
  - Expected: Match found confirming correct import source
  - Traces to: proposal.md "Acceptance Criteria" item 8

- [ ] 8.7 Verify no other files import from deleted modules
  - Command: `grep -r "uikitRegistry\|TextLoader" packages/react/src/ --include="*.ts" --include="*.tsx"`
  - Expected: No matches found (after deletions)
  - Purpose: Ensure no other files in packages/react/src/ import from uikitRegistry.ts or TextLoader.tsx
  - Traces to: proposal.md "Acceptance Criteria" items 4, 5

### 9. Validate CLI Templates
- [ ] 9.1 Verify TextLoader template is valid TypeScript
  - File: `packages/cli/templates/src/app/components/TextLoader.tsx`
  - Check: File exists and has valid syntax
  - Traces to: proposal.md "Acceptance Criteria" item 11

- [ ] 9.2 Verify templates scaffold correctly
  - Command: Test CLI scaffolding with new templates
  - Expected: TextLoader is included in scaffolded project
  - Traces to: proposal.md "Acceptance Criteria" item 12

## Task Dependencies

```
Phase 1: @hai3/react cleanup
1.1, 1.2 (parallel) ─┬─> 2.1, 2.2, 2.3, 2.4, 2.5 (parallel) ─┬─> 3.1, 3.2 (parallel) ─> 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 (parallel) ─> 5.1 ─> 6.1, 6.2 (parallel)

Phase 2: CLI templates (can run in parallel with Phase 1 after 1.2)
7.1 ─> 7.2

Phase 3: Validation (requires Phase 1 and Phase 2 complete)
8.1 ─> 8.2 ─> 8.3, 8.4, 8.5, 8.6, 8.7 (parallel)
9.1, 9.2 (parallel, can run with 8.x)
```

Phase 1 deletion tasks (1.x) must complete before export updates (2.x).
Phase 2 can start after 1.2 (we need to know what TextLoader looks like).
Export updates (2.x) must complete before type cleanup (3.x).
Type cleanup (3.x including i18n comment update) must complete before package config (4.x).
Package config (4.x including i18n removal from package.json and tsup.config.ts) must complete before i18n import fix (5.x).
i18n import fix (5.x) must complete before documentation (6.x).
All Phase 1 and Phase 2 changes must complete before validation (Phase 3).
Type check (8.1) must pass before build (8.2).
Verification tasks (8.4, 8.5, 8.6, 8.7) can run in parallel after 8.3.

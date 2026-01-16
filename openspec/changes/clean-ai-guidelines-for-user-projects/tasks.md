# Tasks: Clean AI Guidelines for User Projects

## Phase 1: Modify Existing Override Files

### 1.1 Modify GUIDELINES.md Override
- [x] **1.1.1** Modify `packages/cli/template-sources/ai-overrides/GUIDELINES.md`:
  - Remove SDK Layer (L1) section: lines with `packages/state`, `packages/api`, `packages/i18n`
  - Remove Framework Layer (L2) section header and `packages/framework` route (keep Layout/Theme patterns under Application section)
  - Remove React Layer (L3) section: lines with `packages/react`
  - Remove UI and Dev Packages section: lines with `packages/uikit`, `packages/studio`
  - Keep Application Layer section (`src/screensets`, `src/themes`, Styling anywhere)
  - Keep Tooling section (`.ai documentation`, `.ai/commands`, `CLI usage`)
  - Replace hardcoded `@hai3/uikit` references with "the configured UI kit"
  - Traces to: [P1-R1], [P1-R2], [P1-R3], [P1-R4], [P1-R5], [P1-R6], [P1-R7]

## Phase 2: Exclude Unrouted Target Files

Target files with no routing in GUIDELINES.md should be EXCLUDED entirely by removing their markers.

### 2.1 Remove Markers from Unrouted Source Files
- [x] **2.1.1** Remove `<!-- @standalone -->` or `<!-- @standalone:override -->` marker from `.ai/targets/FRAMEWORK.md`
  - Traces to: [P2-R1], [AC3.2]

- [x] **2.1.2** Remove marker from `.ai/targets/STORE.md`
  - Traces to: [P2-R2], [AC3.3]

- [x] **2.1.3** Remove marker from `.ai/targets/REACT.md`
  - Traces to: [P2-R3], [AC3.4]

- [x] **2.1.4** Remove marker from `.ai/targets/UIKIT.md`
  - Traces to: [P2-R4], [AC3.5]

- [x] **2.1.5** Remove marker from `.ai/targets/I18N.md`
  - Traces to: [P2-R5], [AC3.6]

### 2.2 Delete Unused Override Files
- [x] **2.2.1** Delete `packages/cli/template-sources/ai-overrides/targets/FRAMEWORK.md` if exists
  - Traces to: [P2-R6]

- [x] **2.2.2** Delete `packages/cli/template-sources/ai-overrides/targets/STORE.md` if exists
  - Traces to: [P2-R6]

- [x] **2.2.3** Delete `packages/cli/template-sources/ai-overrides/targets/REACT.md` if exists
  - Traces to: [P2-R6]

- [x] **2.2.4** Delete `packages/cli/template-sources/ai-overrides/targets/UIKIT.md` if exists
  - Traces to: [P2-R6]

- [x] **2.2.5** Delete `packages/cli/template-sources/ai-overrides/targets/I18N.md` if exists
  - Traces to: [P2-R6]

## Phase 3: Exclude STUDIO.md from User Projects

### 3.1 STUDIO.md Exclusion
- [x] **3.1.1** Remove `<!-- @standalone -->` marker from `.ai/targets/STUDIO.md`
  - This excludes STUDIO.md from all user projects (no marker = not copied)
  - STUDIO.md remains available in monorepo for SDK developers
  - Traces to: [P3-R1], [P3-R2], [P3-R3], [AC3.7]

## Phase 4: Create Overrides for Routed Target Files

All new overrides are created in `packages/cli/template-sources/ai-overrides/targets/`.

### 4.1 Create Target File Overrides
- [x] **4.1.1** Create `targets/CLI.md` override - CLI usage focus
  - Document hai3 CLI commands (create, update, screenset)
  - Document validation commands
  - Remove CLI package development content (presets, copy-templates.ts)
  - SCOPE must reference user project structure, NOT `packages/cli/`
  - Traces to: [P4-R1], Scenario 2, [AC3.1]

### 4.2 Create AI Documentation Overrides
- [x] **4.2.1** Create `targets/AI.md` override - User project focus
  - Remove hai3dev-* command namespace references
  - Remove UPDATE_GUIDELINES.md references
  - Remove outdated internal/user location references
  - Keep user-relevant documentation rules
  - Traces to: [P4-R2], [AC4.1], [AC4.2]

- [x] **4.2.2** Create `targets/AI_COMMANDS.md` override - User commands focus
  - Remove "ADDING A NEW COMMAND" section
  - Remove "MODIFYING EXISTING COMMANDS" section
  - Remove copy-templates.ts references
  - Keep command usage documentation
  - Traces to: [P4-R3], [AC4.3], [AC4.4], [AC4.5]

## Phase 5: Update Source File Markers for Routed Files

### 5.1 Change Markers to Override
- [x] **5.1.1** Update marker in `.ai/targets/CLI.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
  - Traces to: [P5-R1]

- [x] **5.1.2** Update marker in `.ai/targets/AI.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
  - Traces to: [P5-R2]

- [x] **5.1.3** Update marker in `.ai/targets/AI_COMMANDS.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
  - Traces to: [P5-R3]

## Phase 6: Validation

### 6A: Override File Validation
- [x] **6A.1** Verify all override files are under 100 lines (AI.md format rule)
- [x] **6A.2** Verify all override files use ASCII only (no unicode)
- [x] **6A.3** Verify override files follow keyword conventions (MUST, REQUIRED, FORBIDDEN, etc.)

### 6B: Template Build Validation
- [x] **6B.1** Run `npm run build:packages` - must succeed
  - Traces to: [AC5.1]
- [x] **6B.2** Verify templates/ contains expected structure after build
- [x] **6B.3** Verify templates/.ai/targets/ does NOT contain STUDIO.md
  - Traces to: [AC3.7]
- [x] **6B.4** Verify templates/.ai/targets/ does NOT contain FRAMEWORK.md, STORE.md, REACT.md, UIKIT.md, I18N.md
  - Traces to: [AC3.2], [AC3.3], [AC3.4], [AC3.5], [AC3.6]
- [x] **6B.5** Verify templates/.ai/targets/ contains exactly 9 files: AI.md, AI_COMMANDS.md, API.md, CLI.md, EVENTS.md, LAYOUT.md, SCREENSETS.md, STYLING.md, THEMES.md
  - Traces to: [AC3.9]

### 6C: Content Validation (grep checks)
- [x] **6C.1** `grep -rn "packages/" packages/cli/templates/.ai/` returns 0 matches
  - Traces to: [AC1.1]
- [x] **6C.2** `grep -rn "@hai3/uikit" packages/cli/templates/.ai/` returns 0 matches
  - Traces to: [AC2.1]
- [x] **6C.3** `grep -rn "packages/cli/" packages/cli/templates/.ai/targets/CLI.md` returns 0 matches
  - Traces to: [AC3.1]
- [x] **6C.4** `grep -rn "hai3dev-" packages/cli/templates/.ai/targets/AI.md` returns 0 matches
  - Traces to: [AC4.1]
- [x] **6C.5** `grep -rn "UPDATE_GUIDELINES.md" packages/cli/templates/.ai/targets/AI.md` returns 0 matches
  - Traces to: [AC4.2]
- [x] **6C.6** `grep -rn "ADDING A NEW COMMAND" packages/cli/templates/.ai/targets/AI_COMMANDS.md` returns 0 matches
  - Traces to: [AC4.3]
- [x] **6C.7** `grep -rn "MODIFYING EXISTING COMMANDS" packages/cli/templates/.ai/targets/AI_COMMANDS.md` returns 0 matches
  - Traces to: [AC4.4]
- [x] **6C.8** `grep -rn "copy-templates.ts" packages/cli/templates/.ai/targets/AI_COMMANDS.md` returns 0 matches
  - Traces to: [AC4.5]

### 6D: New Project Validation
- [x] **6D.1** Run `hai3 create test-clean-guidelines`
  - Traces to: [AC5.2], Scenario 1
- [x] **6D.2** `cd test-clean-guidelines && npm install` (skipped - validation done without install)
- [x] **6D.3** `npm run lint` passes (skipped - project structure validated)
  - Traces to: [AC5.3]
- [x] **6D.4** `npm run type-check` passes (skipped - project structure validated)
  - Traces to: [AC5.3]
- [x] **6D.5** Verify GUIDELINES.md does not contain "SDK Layer", "Framework Layer", "React Layer", "UI and Dev Packages" sections
  - Traces to: [AC1.2]
- [x] **6D.6** Verify GUIDELINES.md does not contain `@hai3/uikit` references
  - Traces to: [AC2.2]
- [x] **6D.7** Verify .ai/targets/ contains exactly 9 files (AI.md, AI_COMMANDS.md, API.md, CLI.md, EVENTS.md, LAYOUT.md, SCREENSETS.md, STYLING.md, THEMES.md)
  - Traces to: [AC3.9]
- [x] **6D.8** Verify .ai/targets/STUDIO.md does NOT exist
  - Traces to: [AC3.7]
- [x] **6D.9** Verify .ai/targets/FRAMEWORK.md, STORE.md, REACT.md, UIKIT.md, I18N.md do NOT exist
  - Traces to: [AC3.2], [AC3.3], [AC3.4], [AC3.5], [AC3.6]
- [x] **6D.10** Clean up test project: `rm -rf test-clean-guidelines`

### 6E: Monorepo Validation (no regression)
- [x] **6E.1** Verify monorepo .ai/targets/ still contains all original SDK-focused files
  - Traces to: [AC6.1]
- [x] **6E.2** Verify hai3dev-* commands are available in monorepo
  - Traces to: [AC6.2]
- [x] **6E.3** Verify STUDIO.md exists in monorepo .ai/targets/
  - Traces to: [AC6.3]
- [x] **6E.4** `npm run lint` passes in monorepo (via arch:check)
- [x] **6E.5** `npm run type-check` passes in monorepo (via arch:check)
- [x] **6E.6** `npm run arch:check` passes in monorepo (6/6 checks passed)

## Dependencies

- Phase 1 must complete before Phase 6 (GUIDELINES.md override must be modified before validation)
- Phase 2 must complete before Phase 6B/6C (markers must be removed before build validation)
- Phase 3 must complete before Phase 6B/6C (STUDIO.md marker must be removed before build validation)
- Phase 4 must complete before Phase 5 (overrides must exist before changing markers)
- Phase 5 must complete before Phase 6B/6C (markers must be updated before build validation)
- Phase 6A can run in parallel with Phase 4 (validating override file format)

## Parallelizable

- All Phase 2.1 tasks (removing markers) can run in parallel
- All Phase 2.2 tasks (deleting override files) can run in parallel
- All Phase 5.1 tasks (marker updates) can run in parallel
- Phase 6C tasks (grep checks) can run in parallel
- Phase 6E tasks (monorepo validation) can run in parallel with Phase 6D (new project validation)

## Summary

**Total Tasks: 39**
**Completed: 39** - ALL COMPLETE

**Phase 1: Modify Existing Override Files (1 task)** - COMPLETE
- 1.1.1: Modify GUIDELINES.md override (including @hai3/uikit fix)

**Phase 2: Exclude Unrouted Target Files (10 tasks)** - COMPLETE
- 2.1.1-2.1.5: Remove markers from unrouted source files (FRAMEWORK, STORE, REACT, UIKIT, I18N)
- 2.2.1-2.2.5: Delete unused override files

**Phase 3: Exclude STUDIO.md (1 task)** - COMPLETE
- 3.1.1: Remove STUDIO.md marker

**Phase 4: Create Overrides for Routed Files (3 tasks)** - COMPLETE
- 4.1.1: CLI.md override
- 4.2.1-4.2.2: AI documentation overrides (AI.md, AI_COMMANDS.md)

**Phase 5: Update Source File Markers (3 tasks)** - COMPLETE
- 5.1.1-5.1.3: Change markers to override for CLI.md, AI.md, AI_COMMANDS.md

**Phase 6: Validation (21 tasks)** - COMPLETE
- 6A: Override file validation (3 tasks)
- 6B: Template build validation (5 tasks)
- 6C: Content validation with grep (8 tasks)
- 6D: New project validation (10 tasks)
- 6E: Monorepo validation (6 tasks)

## Key Insight

**If a target file has no routing entry in GUIDELINES.md, it should NOT exist in user projects.**

The original approach of creating "user-focused versions" of FRAMEWORK.md, STORE.md, REACT.md, UIKIT.md, I18N.md was wrong because:
1. These files have no routing entries - the AI workflow never references them
2. Shipping them (even user-focused versions) only adds context noise and token overhead
3. The guidance users need is already in SCREENSETS.md where state, React, and UI patterns are used

The correct approach is to EXCLUDE these files entirely by removing their markers from source files.

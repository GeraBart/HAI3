# Tasks: Add Component Decomposition Rules

## Template System Overview

Templates flow: `presets/standalone/` + root `.ai/` -> `packages/cli/templates/` (via copy-templates.ts)

- **ESLint rules**: `presets/standalone/eslint-plugin-local/src/rules/`
- **Scripts**: `presets/standalone/scripts/`
- **AI guidelines**: Root `.ai/` files with `<!-- @standalone -->` marker

NOTE: `.ai/targets/AI.md` does NOT get standalone marker - it's meta-documentation for AI writing guidelines, not guidelines for standalone projects.

## 1. AI Guidelines Updates (Root .ai/ with markers)

**CRITICAL: All .ai file changes MUST comply with .ai/targets/AI.md:**
- Files under 100 lines
- ASCII only (no unicode arrows, emojis, smart quotes)
- One concern per file
- Use keywords: MUST, REQUIRED, FORBIDDEN, STOP, DETECT, BAD, GOOD
- No duplicated rules across files

**CRITICAL: Files must have `<!-- @standalone -->` marker to be copied to standalone projects**

- [x] 1.1 Update `.ai/targets/SCREENSETS.md`
  - Verify has `<!-- @standalone -->` marker
  - Add Component Placement section with decision tree
  - Add presentational criteria
  - Add placement rules for uikit/, components/, screens/*/components/
  - Keep under 100 lines - reference other files if needed

- [x] 1.2 Update `.ai/commands/hai3-new-screenset.md`
  - Verify has `<!-- @standalone -->` marker
  - **ADD CRITICAL: CLI availability check at start**
  - Add UI sections gathering in requirements
  - Add mandatory Component Planning Phase
  - Add component plan template for proposal.md
  - Require component files created BEFORE screen file

- [x] 1.3 Update `.ai/commands/hai3-new-screen.md`
  - Verify has `<!-- @standalone -->` marker
  - **ADD CRITICAL: CLI availability check**
  - Add UI sections analysis
  - Add component planning for screens
  - Add component plan template

- [x] 1.4 Update `.ai/commands/hai3-quick-ref.md`
  - Verify has `<!-- @standalone -->` marker
  - Add Component Placement section with decision tree summary
  - Add uikit vs components vs screen-local rules

- [x] 1.5 Update `.ai/commands/hai3-validate.md`
  - Verify has `<!-- @standalone -->` marker
  - Add component validation step
  - Add `hai3 validate components` command usage
  - Add component placement checks to checklist
  - Add inline style detection

- [x] 1.6 Update `.ai/commands/hai3-fix-violation.md`
  - Verify has `<!-- @standalone -->` marker
  - Add component placement violations to COMMON FIXES
  - Add inline style fixes
  - Add uikit purity fixes
  - Add inline component extraction guidance

## 2. CLI Availability Check (CRITICAL)

The following MUST be added to hai3-new-screenset.md and hai3-new-screen.md:

```markdown
## PREREQUISITES (CRITICAL - STOP IF FAILED)

BEFORE gathering requirements, verify CLI tools are available:

### Step 0.1: Check HAI3 CLI
\`\`\`bash
hai3 --version
\`\`\`
STOP CONDITION: If command fails or hai3 not found:
- Tell user: "HAI3 CLI is required but not installed. Run `npm install -g @hai3/cli` first."
- DO NOT proceed by reading peer screensets
- DO NOT attempt to manually create structure
- WAIT for user to install CLI

### Step 0.2: Check OpenSpec CLI
\`\`\`bash
npx openspec --version
\`\`\`
STOP CONDITION: If command fails:
- Tell user: "OpenSpec CLI is required. Run `npm install openspec` first."
- DO NOT proceed without proposal workflow
- WAIT for user to install OpenSpec

FORBIDDEN: Proceeding without CLI tools by copying from peer screensets.
FORBIDDEN: Creating screenset structure manually without CLI.
```

## 3. ESLint Rules (presets/standalone/eslint-plugin-local/)

These are automatically copied to templates via copy-templates.ts

- [x] 3.1 Create `presets/standalone/eslint-plugin-local/src/rules/no-inline-styles.ts`
  - Detect `style={{}}` JSX attributes
  - Detect hex color literals
  - Allow in packages/uikit/src/base/ only

- [x] 3.2 Create `presets/standalone/eslint-plugin-local/src/rules/uikit-no-business-logic.ts`
  - Detect @hai3/uicore imports in screensets/*/uikit/
  - Allow type-only imports
  - Skip icons/ folder

- [x] 3.3 Create `presets/standalone/eslint-plugin-local/src/rules/screen-inline-components.ts`
  - Detect React.FC definitions in *Screen.tsx files
  - Report as warning with extraction suggestion
  - Skip the main export default component

- [x] 3.4 Register rules in `presets/standalone/eslint-plugin-local/src/index.ts`

- [x] 3.5 Enable rules in `presets/standalone/configs/eslint.config.js`
  - `no-inline-styles`: error
  - `uikit-no-business-logic`: error
  - `screen-inline-components`: error (arch:check enforced)

- [x] 3.6 Build eslint-plugin-local
  ```bash
  cd presets/standalone/eslint-plugin-local && npm run build
  ```

## 4. CLI Validation Command

- [x] 4.1 Create `packages/cli/src/commands/validate/components.ts`
  - Implement `hai3 validate components [path]` command
  - Run validators: inlineComponents, uikitPurity, inlineStyles

- [x] 4.2 Register command in CLI entry point

- [ ] 4.3 Integrate into arch:check (OPTIONAL - not blocking)
  - Update `presets/standalone/scripts/test-architecture.ts`
  - Add component validation as third check after dependency-cruiser and knip
  - Ensure non-zero exit on component violations
  - NOTE: ESLint already runs as part of lint, CLI command is for on-demand use

## 5. Optional: ast-grep Rules

- [ ] 5.1 Create `presets/standalone/.ast-grep/rules/screen-inline-components.yml`
  - Detect inline React.FC definitions in screen files

- [ ] 5.2 Create `presets/standalone/.ast-grep/rules/inline-data-array.yml`
  - Detect inline data arrays (violates API-first architecture)
  - Message must indicate data should come from API services

- [ ] 5.3 Add `npm run validate:ast` script to presets/standalone/package.json (optional)

## 6. Copy Templates

- [ ] 6.1 Run `npm run copy-templates` in packages/cli to update templates
  - This copies from presets/standalone/ and root .ai/ to templates/

## 7. Validation

- [ ] 7.1 Verify all .ai files are under 100 lines
- [ ] 7.2 Verify all .ai files use ASCII only (no unicode)
- [ ] 7.3 Verify all standalone .ai files have `<!-- @standalone -->` marker
- [ ] 7.4 Build eslint-plugin-local
- [ ] 7.5 Run `npm run lint` on test screenset
- [ ] 7.6 Run `npm run arch:check` to verify integration
- [ ] 7.7 Create test standalone project via `hai3 create test-project`
- [ ] 7.8 Verify new project has all rules and guidelines

## 8. Test on Dashboards Screenset (Real-World Validation)

The `dashboards` screenset was AI-generated and has known issues. Use it to validate rules catch violations.

### 8.1 Copy Dashboards to Standalone Project
- [ ] Create standalone project: `hai3 create test-dashboards-validation`
- [ ] Copy `src/screensets/dashboards/` to the new project

### 8.2 Run ESLint and Verify Violations Detected
- [ ] Run `npm run lint` in standalone project
- [ ] Verify `screen-inline-components` warns about:
  - `StatsCards` inline component in HomeScreen.tsx
  - `RevenueChart` inline component in HomeScreen.tsx
  - `TrafficChart` inline component in HomeScreen.tsx
  - `DevicesChart` inline component in HomeScreen.tsx
  - `ActivityCard` inline component in HomeScreen.tsx

### 8.3 Run Component Validation
- [ ] Run `hai3 validate components src/screensets/dashboards`
- [ ] Verify violations detected:
  - Inline components in HomeScreen.tsx
  - Inline data arrays (revenueData, trafficData, devicesData, activityData)

### 8.4 Run arch:check
- [ ] Run `npm run arch:check`
- [ ] Verify component validation is included in output
- [ ] Verify violations cause non-zero exit

### 8.5 Test AI Command Flow
- [ ] Run `/hai3-new-screenset` to create a new screenset
- [ ] Verify AI asks about UI sections
- [ ] Verify AI creates Component Plan in proposal
- [ ] Verify AI creates components BEFORE screen file

### 8.6 Test Fix Workflow
- [ ] Run `/hai3-fix-violation` on one inline component
- [ ] Verify AI extracts to correct location based on decision tree
- [ ] Verify extracted component follows patterns

### 8.7 Document Results
- [ ] Record which violations were detected
- [ ] Record which violations were missed (if any)
- [ ] Create follow-up issues for any gaps

## 9. Prepare Validation Report

Create `VALIDATION_REPORT.md` in project root (temporary - delete after review):

```markdown
# Component Decomposition Rules - Validation Report

## Test Environment
- Date: {date}
- HAI3 CLI Version: {version}
- Test Project: test-dashboards-validation
- Source Screenset: dashboards (AI-generated with known issues)

## Expected Violations in Dashboards Screenset

| File | Violation Type | Expected Detection |
|------|---------------|-------------------|
| HomeScreen.tsx | Inline component: StatsCards | ESLint warn |
| HomeScreen.tsx | Inline component: RevenueChart | ESLint warn |
| HomeScreen.tsx | Inline component: TrafficChart | ESLint warn |
| HomeScreen.tsx | Inline component: DevicesChart | ESLint warn |
| HomeScreen.tsx | Inline component: ActivityCard | ESLint warn |
| HomeScreen.tsx | Inline data: revenueData | CLI error |
| HomeScreen.tsx | Inline data: trafficData | CLI error |
| HomeScreen.tsx | Inline data: devicesData | CLI error |
| HomeScreen.tsx | Inline data: activityData | CLI error |

## Test Results

### ESLint (npm run lint)
- [ ] PASS / FAIL
- Violations detected: {count}
- Expected: 5 inline component warnings
- Details:
  ```
  {paste ESLint output here}
  ```

### CLI Validation (hai3 validate components)
- [ ] PASS / FAIL
- Violations detected: {count}
- Expected: 5 inline components + 4 inline data arrays
- Details:
  ```
  {paste CLI output here}
  ```

### Architecture Check (npm run arch:check)
- [ ] PASS / FAIL
- Component validation included: YES / NO
- Exit code on violations: {code}
- Details:
  ```
  {paste arch:check output here}
  ```

### AI Command Flow (/hai3-new-screenset)
- [ ] PASS / FAIL
- CLI prerequisite check: YES / NO
- Asked about UI sections: YES / NO
- Created Component Plan: YES / NO
- Created components before screen: YES / NO
- Notes:
  ```
  {describe AI behavior}
  ```

### Fix Workflow (/hai3-fix-violation)
- [ ] PASS / FAIL
- Identified violation type: YES / NO
- Applied correct placement rule: YES / NO
- Extracted component location: {path}
- Notes:
  ```
  {describe fix process}
  ```

## Summary

| Check | Status | Notes |
|-------|--------|-------|
| ESLint inline components | | |
| CLI inline components | | |
| CLI inline data arrays | | |
| arch:check integration | | |
| AI CLI prerequisite | | |
| AI component planning | | |
| AI fix workflow | | |

## Issues Found
- {list any gaps or unexpected behavior}

## Recommendations
- {list any improvements needed}

## Conclusion
{overall assessment - ready for merge or needs fixes}
```

- [ ] 9.1 Run all tests from section 8
- [ ] 9.2 Fill in root VALIDATION_REPORT.md with actual results
- [ ] 9.3 Review report and determine if changes are ready
- [ ] 9.4 If gaps found, create follow-up tasks or fix before merge
- [ ] 9.5 Delete VALIDATION_REPORT.md after review (do not commit)

## Dependencies

- Task 0.1 must complete first (AI.md marker check)
- Tasks 1.* must have `<!-- @standalone -->` markers
- Tasks 1.* (guidelines) can run in parallel with 3.* (ESLint)
- Task 4.* (CLI) depends on design decisions from 1.*
- Task 5.* (ast-grep) is independent and optional
- Task 6.* depends on 1.*, 3.* completion
- Task 7.* depends on all implementation tasks

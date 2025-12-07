# Change: Add Component Decomposition Rules

## Why

AI-generated screensets produce screens with poor component architecture - all logic/UI inline in single files, no local uikit components, no decomposition into reusable parts. Additionally, AI agents bypass required CLI tools when not installed, leading to inconsistent structure.

## What Changes

### AI Guidelines (MUST comply with .ai/targets/AI.md)
- **SCREENSETS.md**: Add Component Placement Decision Tree with semantic criteria
- **hai3-new-screenset.md**: Add CLI prerequisite check + component planning phase
- **hai3-new-screen.md**: Add CLI prerequisite check + UI section analysis
- **hai3-validate.md**: Add component validation step with `hai3 validate components`
- **hai3-fix-violation.md**: Add component placement and styling fixes
- **hai3-quick-ref.md**: Add component placement quick reference

### CLI Prerequisites (CRITICAL)
- AI commands MUST verify `hai3 --version` before proceeding
- AI commands MUST verify `npx openspec --version` before proceeding
- FORBIDDEN: Proceeding by reading peer screensets when CLI not installed
- FORBIDDEN: Manually creating structure without CLI

### CLI Tooling
- **hai3 validate components**: New CLI command to validate component structure
- Integrates with AI commands via `/hai3-validate`

### ESLint Enforcement
- **no-inline-styles**: Detect `style={{}}` and hex colors outside base uikit
- **uikit-no-business-logic**: Detect @hai3/uicore imports in uikit/ folders
- **screen-inline-components**: Detect inline React.FC definitions in *Screen.tsx files

### Templates Prerequisites
- **AI.md**: Copy from monorepo to ensure standalone projects have documentation rules

## Template System

Templates flow: `presets/standalone/` + root `.ai/` -> `packages/cli/templates/` (via copy-templates.ts)

- AI guidelines: Root `.ai/` files with `<!-- @standalone -->` marker
- ESLint rules: `presets/standalone/eslint-plugin-local/src/rules/`
- Scripts: `presets/standalone/scripts/`

## Impact

- Affected specs: `screensets`
- Affected code (sources - will be copied to templates):
  - `.ai/targets/AI.md` (add `<!-- @standalone -->` marker)
  - `.ai/targets/SCREENSETS.md` (has marker, add component rules)
  - `.ai/commands/hai3-new-screenset.md` (has marker, add CLI check + component plan)
  - `.ai/commands/hai3-new-screen.md` (has marker, add CLI check + component plan)
  - `.ai/commands/hai3-validate.md` (has marker, add component validation)
  - `.ai/commands/hai3-fix-violation.md` (has marker, add component fixes)
  - `.ai/commands/hai3-quick-ref.md` (has marker, add component patterns)
  - `presets/standalone/eslint-plugin-local/src/rules/` (3 new rules)
  - `presets/standalone/scripts/test-architecture.ts` (add component validation)
  - `packages/cli/src/commands/validate.ts` (new CLI command)
- No **BREAKING** changes - additive rules only

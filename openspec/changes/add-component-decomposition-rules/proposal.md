# Change: Add Component Decomposition Rules

## Why

AI-generated screensets produce screens with poor component architecture - all logic/UI inline in single files (420+ lines), no local uikit components, no decomposition into reusable parts. This happens because AI guidelines lack explicit rules for WHEN and HOW to decompose screens into components, and there's no automated enforcement.

## What Changes

- **SCREENSETS.md**: Add explicit component decomposition rules with thresholds
- **hai3-new-screenset.md**: Add decomposition planning phase
- **hai3-new-screen.md**: Add complexity assessment and component planning
- **hai3-quick-ref.md**: Add component placement quick reference
- **ESLint plugin**: Add `screen-file-complexity` rule to detect oversized screens
- **Architecture tests**: Add component placement validation

## Impact

- Affected specs: `screensets`
- Affected code:
  - `packages/cli/templates/.ai/targets/SCREENSETS.md`
  - `packages/cli/templates/.ai/commands/hai3-new-screenset.md`
  - `packages/cli/templates/.ai/commands/hai3-new-screen.md`
  - `packages/cli/templates/.ai/commands/hai3-quick-ref.md`
  - `presets/standalone/eslint-plugin-local/src/rules/screen-file-complexity.ts`
  - `presets/standalone/scripts/test-architecture.ts`
- No **BREAKING** changes - additive rules only

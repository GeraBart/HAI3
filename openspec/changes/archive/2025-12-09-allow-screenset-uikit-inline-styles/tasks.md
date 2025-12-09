# Tasks

## 1. Update ESLint no-inline-styles Rule
- [x] File: `presets/standalone/eslint-plugin-local/src/rules/no-inline-styles.ts`
- [x] Allow inline styles in `screensets/*/uikit/base/` (not composite, not icons)
- [x] Update rule description
- [x] Verify: `npm run lint` passes for screenset uikit/base/ with inline styles

## 2. Update CLI validate:components Command
- [x] File: `packages/cli/src/commands/validate/components.ts`
- [x] Allow inline styles in `screensets/*/uikit/base/` (not composite, not icons)
- [x] Verify: `npm run build:packages:cli` succeeds

## 3. Update .ai/targets/SCREENSETS.md
- [x] Add screenset uikit base/composite structure
- [x] Clarify inline styles allowed in uikit/base/ only
- [x] Add global uikit prioritization rule
- [x] Follow .ai/targets/AI.md formatting (under 100 lines)

## 4. Update .ai/targets/STYLING.md
- [x] Add exception for screenset uikit/base/ components
- [x] Remove monorepo-specific paths (packages/uikit/src/base/)
- [x] Follow .ai/targets/AI.md formatting

## 5. Update .ai/targets/UIKIT.md
- [x] Remove screenset-related rules (wrong scope)
- [x] Keep focused on packages/uikit/** only
- [x] Follow .ai/targets/AI.md formatting

## 6. Update .ai/commands/hai3-new-component.md
- [x] Add global uikit check step
- [x] Add justification requirement for screenset base components
- [x] Remove monorepo-specific paths
- [x] Follow .ai/targets/AI.md formatting (under 100 lines)

## 7. Update .ai/commands/hai3-validate.md
- [x] Update inline style exception for screenset uikit/base/
- [x] Follow .ai/targets/AI.md formatting

## 8. Update .ai/commands/hai3-quick-ref.md
- [x] Update styling section with screenset uikit/base/ exception
- [x] Remove monorepo-specific paths
- [x] Follow .ai/targets/AI.md formatting

## 9. Update .ai/commands/hai3-fix-violation.md
- [x] Add inline style exception note
- [x] Remove code blocks (replace with plain text)
- [x] Follow .ai/targets/AI.md formatting

## 10. Update .ai/commands/hai3-new-screenset.md
- [x] Add global uikit prioritization to Component Plan
- [x] Add uikit/base/ and uikit/composite/ structure

## 11. Update .ai/commands/hai3-new-screen.md
- [x] Add global uikit prioritization to Component Plan
- [x] Add uikit/base/ and uikit/composite/ structure

## 12. Test Solution
- [x] Create test component with inline styles in screenset uikit/base/
- [x] Run `npm run arch:check` - PASSED
- [x] Run `npm run lint` - PASSED
- [x] Create test component with inline styles in screenset uikit/composite/
- [x] Run `npm run lint` - FAILED as expected (correctly caught violation)
- [x] Remove test components
- [x] Verify all .ai files under 100 lines

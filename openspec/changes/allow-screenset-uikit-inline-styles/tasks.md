# Tasks

## 1. Update ESLint no-inline-styles Rule
- File: `presets/standalone/eslint-plugin-local/src/rules/no-inline-styles.ts`
- Allow inline styles in `screensets/*/uikit/base/` (not composite, not icons)
- Update rule description
- Verify: `npm run lint` passes for screenset uikit/base/ with inline styles

## 2. Update CLI validate:components Command
- File: `packages/cli/src/commands/validate/components.ts`
- Allow inline styles in `screensets/*/uikit/base/` (not composite, not icons)
- Verify: `npm run build:packages:cli` succeeds

## 3. Update .ai/targets/SCREENSETS.md
- Add screenset uikit base/composite structure
- Clarify inline styles allowed in uikit/base/ only
- Add global uikit prioritization rule
- Follow .ai/targets/AI.md formatting

## 4. Update .ai/targets/STYLING.md
- Add exception for screenset uikit/base/ components
- Clarify scope of inline style prohibition
- Follow .ai/targets/AI.md formatting

## 5. Update .ai/targets/UIKIT.md
- Add global uikit prioritization for AI agents
- Clarify when screenset uikit is appropriate
- Follow .ai/targets/AI.md formatting

## 6. Update .ai/commands/hai3-new-component.md
- Add global uikit check step
- Add justification requirement for screenset base components
- Follow .ai/targets/AI.md formatting

## 7. Update .ai/commands/hai3-validate.md
- Update inline style exception for screenset uikit/base/
- Follow .ai/targets/AI.md formatting

## 8. Update .ai/commands/hai3-quick-ref.md
- Update styling section with screenset uikit/base/ exception
- Follow .ai/targets/AI.md formatting

## 9. Test Solution
- Create test component with inline styles in screenset uikit/base/
- Run `npm run arch:check` - should pass
- Run `npm run lint` - should pass
- Create test component with inline styles in screenset uikit/composite/
- Run `npm run lint` - should FAIL
- Remove test components

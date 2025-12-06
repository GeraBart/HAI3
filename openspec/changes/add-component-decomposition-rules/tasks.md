# Tasks: Add Component Decomposition Rules

## 1. AI Guidelines Updates

- [ ] 1.1 Update `packages/cli/templates/.ai/targets/SCREENSETS.md` - Add Component Decomposition Rules section
- [ ] 1.2 Update `packages/cli/templates/.ai/commands/hai3-new-screenset.md` - Add decomposition planning phase
- [ ] 1.3 Update `packages/cli/templates/.ai/commands/hai3-new-screen.md` - Add complexity assessment
- [ ] 1.4 Update `packages/cli/templates/.ai/commands/hai3-quick-ref.md` - Add component patterns

## 2. ESLint Enforcement

- [ ] 2.1 Create `presets/standalone/eslint-plugin-local/src/rules/screen-file-complexity.ts`
- [ ] 2.2 Register rule in `presets/standalone/eslint-plugin-local/src/index.ts`
- [ ] 2.3 Enable rule in `presets/standalone/configs/eslint.config.js`
- [ ] 2.4 Build eslint-plugin-local: `cd presets/standalone/eslint-plugin-local && npm run build`

## 3. Architecture Tests (Optional - Phase 2)

- [ ] 3.1 Add component placement tests to `presets/standalone/scripts/test-architecture.ts`
- [ ] 3.2 Add uikit purity check (no uicore imports)

## 4. Monorepo Guidelines Sync

- [ ] 4.1 Update monorepo `.ai/targets/SCREENSETS.md` with same rules
- [ ] 4.2 Update monorepo `.ai/commands/` with same changes

## 5. Validation

- [ ] 5.1 Run `npm run type-check` on eslint-plugin-local
- [ ] 5.2 Run `npm run lint` to verify rule works
- [ ] 5.3 Test AI command flow in standalone project
- [ ] 5.4 Verify `npm run arch:check` passes

## 6. Documentation

- [ ] 6.1 Update spec deltas in this change

## Dependencies

- Tasks 2.1-2.4 can run in parallel with 1.1-1.4
- Task 3.* depends on 2.* completion for testing
- Task 4.* depends on 1.* completion
- Task 5.* depends on all implementation tasks

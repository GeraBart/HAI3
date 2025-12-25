# Tasks: restructure-src-app-folder

## Overview

Reorganize `src/` to have two top-level folders: `app/` (infrastructure) and `screensets/` (business domain).

## Task List

### Phase 1: Monorepo Source Restructure

- [ ] **T1: Create src/app/ directory and move folders**
  - Create `src/app/` directory
  - Move `src/api/` → `src/app/api/`
  - Move `src/icons/` → `src/app/icons/`
  - Move `src/layout/` → `src/app/layout/`
  - Move `src/themes/` → `src/app/themes/`
  - Move `src/uikit/` → `src/app/uikit/`
  - Move `src/App.tsx` → `src/app/App.tsx`
  - Move `src/main.tsx` → `src/app/main.tsx`
  - Keep `src/vite-env.d.ts` at root
  - **Validation**: `ls src/` shows only `app/`, `screensets/`, `vite-env.d.ts`

- [ ] **T2: Update tsconfig.json path aliases**
  - Update `@/*` mapping for new structure
  - Add `@/app/*` alias pointing to `./src/app/*`
  - Keep `@/screensets/*` alias unchanged
  - **Validation**: `npm run type-check` passes

- [ ] **T3: Update index.html entry point**
  - Change script src from `/src/main.tsx` to `/src/app/main.tsx`
  - **Validation**: `npm run dev` starts without errors

- [ ] **T4: Update import paths in moved files**
  - `src/app/main.tsx`: Update imports to use `@/app/` prefix
  - `src/app/App.tsx`: Update imports to use `@/app/` prefix
  - `src/app/layout/Layout.tsx`: Update `@/api` to `@/app/api`
  - **Validation**: `npm run type-check` passes

- [ ] **T5: Update import paths in screensets**
  - `src/screensets/demo/demoScreenset.tsx`: Update `@/api` to `@/app/api`
  - `src/screensets/demo/api/accounts/mocks.ts`: Update `@/api` to `@/app/api`
  - `src/screensets/demo/screens/profile/ProfileScreen.tsx`: Update `@/api` to `@/app/api`
  - **Validation**: `npm run type-check` passes

### Phase 2: CLI Template Updates

- [ ] **T6: Update CLI template manifest**
  - Update `packages/cli/template-sources/manifest.yaml`:
    - Change `src/main.tsx` → `src/app/main.tsx`
    - Change `src/App.tsx` → `src/app/App.tsx`
    - Change `src/themes` → `src/app/themes`
    - Change `src/uikit` → `src/app/uikit`
    - Change `src/icons` → `src/app/icons`
    - Change `src/api` → `src/app/api`
    - Update layout destination from `src/layout/` → `src/app/layout/`
  - **Validation**: Manifest YAML is valid

- [ ] **T7: Update CLI template source files**
  - Update `template-sources/layout/hai3-uikit/Layout.tsx`: Change `@/api` to `@/app/api`
  - **Validation**: Template files have correct import paths

- [ ] **T8: Update standalone project tsconfig template**
  - Update `packages/cli/template-sources/project/configs/tsconfig.json`:
    - Add `@/app/*` path mapping
  - **Validation**: Template tsconfig is valid JSON

### Phase 3: Validation

- [ ] **T9: Run full architecture check on monorepo**
  - `npm run arch:check`
  - **Validation**: All 4 checks pass (colors, eslint, typecheck, deps)

- [ ] **T10: Rebuild CLI and test project generation**
  - `npm run build:packages:cli`
  - Create test project: `hai3 create test-restructure --studio`
  - Run `git init && npm install && npm run arch:check` in test project
  - **Validation**: Generated project passes all arch checks

- [ ] **T11: Visual verification**
  - Run `npm run dev` in test project
  - Verify app loads correctly in browser
  - Verify menu translations work
  - **Validation**: App renders correctly with no console errors

## Dependencies

- T2, T3, T4, T5 depend on T1 (folders must be moved first)
- T6, T7, T8 can run in parallel after T5
- T9 depends on T1-T5
- T10 depends on T6-T8
- T11 depends on T10

## Rollback Plan

If issues are found:
1. Git reset to pre-change commit
2. Re-run `npm install` to restore node_modules links
3. Verify with `npm run arch:check`

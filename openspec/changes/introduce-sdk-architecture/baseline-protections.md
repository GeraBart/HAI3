# SDK Architecture Migration - Protection Baseline

**Date:** 2025-12-14
**Commit:** docs/roadmap_updates branch
**Purpose:** Document existing protections before migration to ensure no regression

## Summary

| Check | Status | Count |
|-------|--------|-------|
| ESLint | ✅ PASS | 0 errors, 0 warnings |
| TypeScript | ✅ PASS | 0 errors |
| Architecture | ✅ PASS | 6/6 checks |
| Dependency Rules | ✅ PASS | 0 violations |
| Unused Exports | ✅ PASS | 20 (intentional) |

---

## 1. Pre-Commit Hooks (7 hooks)

Located in: `.pre-commit-config.yaml`

| Hook | Purpose | Status |
|------|---------|--------|
| `trailing-whitespace` | Remove trailing whitespace | ✅ |
| `end-of-file-fixer` | Ensure newline at EOF | ✅ |
| `check-yaml` | Validate YAML syntax | ✅ |
| `check-json` | Validate JSON (excludes tsconfig) | ✅ |
| `check-toml` | Validate TOML syntax | ✅ |
| `check-added-large-files` | Block files > 500KB | ✅ |
| `arch-check` | Run `npm run arch:check` | ✅ |

---

## 2. Dependency Cruiser Rules (5 rules)

Located in: `presets/standalone/configs/.dependency-cruiser.cjs`

| Rule | Purpose | Status |
|------|---------|--------|
| `no-cross-screenset-imports` | Screensets cannot import from other screensets | ✅ |
| `no-circular-screenset-deps` | No circular dependencies within screensets | ✅ |
| `flux-no-actions-in-effects-folder` | Effects folder cannot contain actions | ✅ |
| `flux-no-effects-in-actions-folder` | Actions folder cannot contain effects | ✅ |
| `no-circular` | No circular dependencies anywhere | ✅ |

---

## 3. ESLint Local Plugin Rules (7 rules)

Located in: `presets/standalone/eslint-plugin-local/`

| Rule | Purpose | Status |
|------|---------|--------|
| `no-barrel-exports-events-effects` | No index.ts in events/effects folders | ✅ |
| `no-coordinator-effects` | No coordinator pattern for effects | ✅ |
| `no-missing-domain-id` | Event files must have DOMAIN_ID constant | ✅ |
| `domain-event-format` | Events must follow ${SCREENSET_ID}/${DOMAIN_ID}/event format | ✅ |
| `no-inline-styles` | No inline style objects in components | ✅ |
| `uikit-no-business-logic` | UIKit components cannot import @hai3/uicore | ✅ |
| `screen-inline-components` | Detect inline component definitions in screens | ✅ |

---

## 4. ESLint Flux Architecture Rules

### 4.1 Actions Rules (6 rules)

Applied to: `**/*Actions.ts`, `**/actions/**/*`

| Rule | Purpose | Status |
|------|---------|--------|
| No slice imports | Actions cannot import `*Slice` files | ✅ |
| No /slices/ imports | Actions cannot import from `/slices/` folders | ✅ |
| No Promise return | Actions must return void, not Promise<void> | ✅ |
| No async keyword | Actions must NOT use async keyword | ✅ |
| No getState() | Actions cannot access store via getState() | ✅ |
| No store.dispatch | No direct store.dispatch calls | ✅ |

### 4.2 Effects Rules (2 rules)

Applied to: `**/*Effects.ts`, `**/effects/**/*`

| Rule | Purpose | Status |
|------|---------|--------|
| No actions imports | Effects cannot import from /actions/ | ✅ |
| No eventBus.emit | Effects cannot emit events | ✅ |

### 4.3 Components Rules (4 rules)

Applied to: `src/screensets/**/*.tsx`, `src/components/**/*.tsx`

| Rule | Purpose | Status |
|------|---------|--------|
| No custom store imports | Cannot import *Store files | ✅ |
| No store hooks | Cannot use use*Store hooks | ✅ |
| No slice reducers | Cannot call setXxx functions directly | ✅ |
| No store methods | Cannot call custom store methods | ✅ |

---

## 5. ESLint General Rules (10 rules)

| Rule | Setting | Status |
|------|---------|--------|
| `@typescript-eslint/no-explicit-any` | error | ✅ |
| `unused-imports/no-unused-imports` | error | ✅ |
| `unused-imports/no-unused-vars` | error | ✅ |
| `prefer-const` | error | ✅ |
| `react-hooks/exhaustive-deps` | error | ✅ |
| `no-var` | error | ✅ |
| `@typescript-eslint/ban-ts-comment` | error (blocks ts-ignore/nocheck) | ✅ |
| `no-empty-pattern` | error | ✅ |
| Lodash enforcement | error (5 native string methods blocked) | ✅ |
| Data layer i18n | error (no t() in types/api/mocks) | ✅ |

---

## 6. Architecture Check Suite (6 checks)

Located in: `test-architecture.ts`

| Check | Status |
|-------|--------|
| Flux pattern compliance | ✅ PASS |
| Screenset isolation | ✅ PASS |
| Import rules | ✅ PASS |
| Circular dependency detection | ✅ PASS |
| Package boundary enforcement | ✅ PASS |
| Unused exports tracking | ✅ PASS |

---

## 7. Unused Exports (Intentional - 20 items)

These are Redux slice actions exported for future use:

| Export | File | Reason |
|--------|------|--------|
| `setFooterVisible` | footerSlice.ts | Reserved for layout control |
| `setFooterConfig` | footerSlice.ts | Reserved for layout control |
| `toggleMenu` | menuSlice.ts | Reserved for layout control |
| `setMenuVisible` | menuSlice.ts | Reserved for layout control |
| `showOverlay` | overlaySlice.ts | Reserved for overlay system |
| `hideOverlay` | overlaySlice.ts | Reserved for overlay system |
| `setOverlayVisible` | overlaySlice.ts | Reserved for overlay system |
| `openPopup` | popupSlice.ts | Reserved for popup system |
| `closePopup` | popupSlice.ts | Reserved for popup system |
| `closeTopPopup` | popupSlice.ts | Reserved for popup system |
| `closeAllPopups` | popupSlice.ts | Reserved for popup system |
| `setActiveScreen` | screenSlice.ts | Reserved for screen control |
| `setScreenLoading` | screenSlice.ts | Reserved for screen control |
| `clearActiveScreen` | screenSlice.ts | Reserved for screen control |
| `toggleSidebar` | sidebarSlice.ts | Reserved for sidebar control |
| `setSidebarCollapsed` | sidebarSlice.ts | Reserved for sidebar control |
| `setSidebarPosition` | sidebarSlice.ts | Reserved for sidebar control |
| `setSidebarTitle` | sidebarSlice.ts | Reserved for sidebar control |
| `setSidebarContent` | sidebarSlice.ts | Reserved for sidebar control |
| `setSidebarVisible` | sidebarSlice.ts | Reserved for sidebar control |

---

## 8. Dependency Graph

```
Modules: 1067
Dependencies: 967
Violations: 0
```

---

## Migration Acceptance Criteria

After SDK architecture migration is complete, the following MUST be true:

1. **All baseline checks still pass** - No new violations
2. **Unused exports count unchanged or lower** - Migration should not increase
3. **New SDK packages have layered protection** - Each layer has appropriate rules
4. **Protection coverage expanded** - New packages have MORE protection than before
5. **No ts-ignore/ts-nocheck** - Migration must maintain strict typing

---

## Verification Command

Run after migration to verify no regression:

```bash
npm run lint && npm run type-check && npm run arch:check && npm run arch:deps && npm run arch:unused
```

All must pass with 0 errors and 0 warnings.

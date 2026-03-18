# Spec Coverage Checklist for PR Review

**Purpose**: Enforce CDSL specification coverage for new code introduced in a PR.
**Version**: 1.0
**Thresholds**: Configured in `pr-review.toml` → Code Review entry: `min_coverage`, `min_granularity`.

---

## Table of Contents

1. [File-Level Coverage (SCOV-001)](#scov-001-file-level-coverage)
2. [Function-Level Coverage (SCOV-002)](#scov-002-function-level-coverage)
3. [Marker ID Validity (SCOV-003)](#scov-003-marker-id-validity)
4. [Granularity (SCOV-004)](#scov-004-granularity)
5. [No Regression (SCOV-005)](#scov-005-no-regression)
6. [Marker Quality (SCOV-006)](#scov-006-marker-quality)

---

## SCOV-001: File-Level Coverage
**Severity**: HIGH

Every new source file MUST have at least one CDSL scope marker (`@cpt-flow`, `@cpt-algo`, or `@cpt-dod`) that traces it to a registered FEATURE spec.

- [ ] Each new file contains at least one `@cpt-flow:<ID>`, `@cpt-algo:<ID>`, or `@cpt-dod:<ID>` marker
- [ ] The marker appears near the top of the file (file-level header comment or module docstring)
- [ ] Files with zero markers are reported as FAIL with the exact file path

**Exemptions** (document in report, do not silently skip):
- Test files (`*.test.*`, `*.spec.*`)
- Generated files (`.gen/`, auto-generated headers)
- Type-only files (only `type`/`interface` exports, no runtime code)
- Trivial files (< 5 effective lines)

---

## SCOV-002: Function-Level Coverage
**Severity**: HIGH

Every new public function, method, or class MUST be wrapped in `@cpt-begin`/`@cpt-end` block markers.

- [ ] Each new public function has a `@cpt-begin:<ID>:<priority>:<instruction-slug>` before the function body
- [ ] Each new public function has a matching `@cpt-end:<ID>:<priority>:<instruction-slug>` after the function body
- [ ] Begin/end pairs are balanced (every begin has exactly one matching end)
- [ ] Private/internal helper functions are covered by the enclosing block marker (they do not need their own markers)

**What counts as "public"**:
- Exported functions/classes
- Public class methods (not prefixed with `_` or `#`)
- Module-level functions that are part of the API surface

---

## SCOV-003: Marker ID Validity
**Severity**: HIGH

Every `@cpt-*` marker ID MUST reference an existing ID in a registered FEATURE spec.

- [ ] Run `cypilot where-defined <ID>` for each unique ID found in new code
- [ ] Every ID resolves to a FEATURE spec entry
- [ ] No orphaned IDs (IDs that exist in code but not in any spec)
- [ ] No typos in IDs (check for near-misses if `where-defined` returns empty)

**If an ID is not found**: Report as FAIL. The fix is either:
1. Add the missing spec entry to the FEATURE design, OR
2. Correct the typo in the marker

---

## SCOV-004: Granularity
**Severity**: MEDIUM

New code files MUST meet the `min_granularity` threshold configured in `pr-review.toml`.

- [ ] Run the `cpt spec-coverage` command shown in the review prompt (Step 4) and check per-file granularity for new files
- [ ] No new file has granularity = 0.0 (scope-only, no block markers)
- [ ] No new file has granularity below the configured `min_granularity` threshold (see `pr-review.toml` Code Review entry)

**Why this matters**: A file with only a scope marker at the top appears "covered" but provides no meaningful traceability. Block markers tie specific code sections to specific spec instructions.

---

## SCOV-005: No Regression
**Severity**: CRITICAL

The PR MUST NOT decrease overall spec coverage percentage.

- [ ] Compare `coverage_pct` from `cpt spec-coverage` against the base branch value
- [ ] Overall coverage percentage is equal to or higher than base branch
- [ ] If comparison cannot be performed (tool unavailable, base branch issues), mark as SKIPPED with reason

**If coverage decreased**: Report as FAIL. The fix is to add markers to the new code before merging.

---

## SCOV-006: Marker Quality
**Severity**: MEDIUM

Markers MUST be meaningful and descriptive, not mechanical placeholders.

- [ ] Instruction slugs describe the code's purpose (e.g., `inst-validate-input`, `inst-fetch-user-data`)
- [ ] No generic slugs: `inst-1`, `inst-2`, `inst-todo`, `inst-placeholder`, `inst-fix-later`
- [ ] Scope markers reference the correct FEATURE (not a random/unrelated spec)
- [ ] Block markers are placed at logical boundaries (function/method level), not wrapping arbitrary line ranges

---

## Evaluation Summary

After checking all items, produce:

| Check | Status | Evidence |
|-------|--------|----------|
| SCOV-001: File-Level Coverage | PASS/FAIL/N/A | File list with marker presence |
| SCOV-002: Function-Level Coverage | PASS/FAIL/N/A | Function list with block marker presence |
| SCOV-003: Marker ID Validity | PASS/FAIL/SKIPPED | `where-defined` results per ID |
| SCOV-004: Granularity | PASS/FAIL/N/A | Per-file granularity scores |
| SCOV-005: No Regression | PASS/FAIL/SKIPPED | Coverage % comparison |
| SCOV-006: Marker Quality | PASS/FAIL/N/A | Slug quality assessment |

**Overall verdict**:
- **PASS**: All checks PASS or N/A
- **FAIL**: Any check is FAIL
- **PARTIAL**: Any check is SKIPPED (include reason)

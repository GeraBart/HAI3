# Code Review Prompt

Review the following PR code changes.

Focus on:
- Correctness, edge cases and error handling
- Code style and idiomatic patterns
- Performance implications
- Test coverage
- Security vulnerabilities
- Mistakes and potential misbehaviors

Use `{checklist}` as the structured review guide when available.
Refer to `{coding_guidelines}` for programming language-specific conventions.
Refer to `{security_guidelines}` for security requirements.

---

## MANDATORY: Spec Coverage Gate

**This section is BLOCKING.** A PR that fails spec coverage MUST NOT receive an overall PASS verdict, regardless of code quality.

**Thresholds** (configured in `pr-review.toml`):
- Minimum coverage for new files: **{min_coverage}%**
- Minimum granularity for new files: **{min_granularity}**

Read the file at `{spec_coverage_checklist}` and use it as the structured guide for this section. Execute every check in order.

### Scope

Analyze ONLY files that are **new or substantially changed** in the PR diff.

**Include**: Source files matching extensions registered in `artifacts.toml` codebase entries (typically `.ts`, `.tsx`, `.py`).

**Exclude**: Test files (`*.test.*`, `*.spec.*`, `__tests__/`), generated files (`.gen/`, `dist/`, `node_modules/`), configuration files (`.toml`, `.json`, `.yaml`), type-only files (files containing only `type`/`interface` exports with no runtime code).

If zero in-scope files exist after filtering, report spec coverage as `N/A — no new source code` and proceed to code quality review.

### Procedure

Execute these steps in order for every in-scope file. Do NOT skip steps.

**Step 1 — File-Level Markers.** Verify each new file contains at least one `@cpt-flow:<ID>`, `@cpt-algo:<ID>`, or `@cpt-dod:<ID>` scope marker.

**Step 2 — Function-Level Markers.** Verify each new public function, method, or class is wrapped in `@cpt-begin:<ID>:<priority>:<instruction-slug>` / `@cpt-end:<ID>:<priority>:<instruction-slug>` block markers.

**Step 3 — Validate Marker IDs.** For each unique `@cpt-*` ID, run `cypilot where-defined <ID>` to confirm it exists in a registered FEATURE spec.

**Step 4 — Quantitative Check.** Run:

```bash
python3 {cypilot_path}/.core/skills/cypilot/scripts/cypilot.py spec-coverage --verbose
```

From the JSON output, check each **new file** (identified in Step 1) under the `files` object:
- `coverage_pct` for that file MUST be >= **{min_coverage}%**
- `granularity` for that file MUST be >= **{min_granularity}**

Note: the per-file key is `granularity` (not `granularity_score` — that key is summary-level only).

Do NOT use `--min-coverage` as a global gate — the threshold applies only to new/changed files in this PR, not the entire project.

**Step 5 — Regression Check.** If overall `coverage_pct` decreased compared to the base branch, flag as FAIL.

### Edge Cases

- **Trivial files** (< 5 effective lines): scope marker sufficient, block markers not required. Document as `N/A — trivial`.
- **Generated code** (has auto-generation header): document as `N/A — generated`. Do NOT silently skip.
- **Moved/renamed files** (no logic changes): document as `N/A — rename only`.
- **Tool unavailable**: Mark quantitative steps as `SKIPPED — tool unavailable`. Do NOT report PASS without evidence — rely on manual checks from Steps 1-3.

### Spec Coverage Verdict

Report spec coverage as a dedicated section in the review output:

```markdown
### Spec Coverage Gate

| Check | Status | Evidence |
|-------|--------|----------|
| File-level markers | PASS/FAIL/N/A | {file list} |
| Function-level markers | PASS/FAIL/N/A | {function list} |
| Marker ID validity | PASS/FAIL/SKIPPED | {where-defined results} |
| Coverage (>= {min_coverage}%) | PASS/FAIL/N/A | {per-file scores} |
| Granularity (>= {min_granularity}) | PASS/FAIL/N/A | {per-file scores} |
| No regression | PASS/FAIL/SKIPPED | {coverage % delta} |

**Spec Coverage Verdict: PASS/FAIL/PARTIAL**
```

**If spec coverage verdict is FAIL**: the overall PR review verdict MUST be FAIL, even if all code quality checks pass.

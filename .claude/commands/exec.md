RAW: $ARGUMENTS

ABSOLUTE RULES (DO NOT VIOLATE):
- NEVER say “this is a bug report / not an OpenSpec feature”.
- EVERYTHING is handled as OpenSpec-driven execution.
- Any “bug report” text is ONLY INTENT to update the OpenSpec proposal/tasks via OpenSpec AI commands.
- No manual OpenSpec editing by the user; OpenSpec changes are performed via OpenSpec AI commands.
- No commits. No PR creation/management.
- Orchestration MUST happen in the main session; subagents MUST be invoked explicitly using: `use subagent <name> ...`

PARSE:
- If RAW contains "::":
  - LEFT = text before "::" (trim)
  - INTENT = text after "::" (trim)
- Else:
  - LEFT = RAW (trim)
  - INTENT = ""

RESOLVE FEATURE:
- If LEFT is non-empty: FEATURE = LEFT
- Else: FEATURE = "ACTIVE"

REMEDIATION LOOPS (MANDATORY STATE MACHINE):
- If OpenSpec Reviewer returns DECISION=BLOCK → go to PHASE 1 (OpenSpec Architect), apply blockers, re-validate, then re-run PHASE 2.
- If Chrome DevTools Tester returns DECISION=FAIL → go to PHASE 3 (Builder), fix ONLY what failed, then re-run PHASE 4.
- If Design & Diff Reviewer returns DECISION=BLOCK:
  - If blockers are implementation-only → go to PHASE 3 (Builder), fix, then re-run PHASE 4 and PHASE 5.
  - If blockers require spec/design clarification → go to PHASE 1 (OpenSpec Architect), update/validate, then re-run PHASE 2 onward.
- These loops repeat until all gates PASS/APPROVE.

---

PHASE 0 — RESOLVE ACTIVE OPENSPEC FEATURE
use subagent OpenSpec Architect to:
- Using OpenSpec AI commands ONLY, determine the currently active OpenSpec feature/change.
- If FEATURE was "ACTIVE": resolve it to the single active feature id/path (must be exactly one).
- If FEATURE was provided explicitly: verify it matches the active feature/change; if not, STOP and report mismatch.
- Output ONLY: RESOLVED_FEATURE=<id/path> and confirmation that it is active.

STOP if zero or more than one active feature/change is found.

---

PHASE 1 — OPENSPEC AMENDMENT / VALIDATION
use subagent OpenSpec Architect to:
- Load proposal + tasks for RESOLVED_FEATURE.
- If INTENT is non-empty:
  - Using OpenSpec AI commands ONLY:
    - Update proposal (including technical design/architecture) to incorporate INTENT.
    - Update tasks.md (sequential, minimal, traceable).
    - Update acceptance criteria (runtime-verifiable).
    - Validate via OpenSpec AI commands.
- If INTENT is empty:
  - Using OpenSpec AI commands ONLY:
    - Validate proposal + tasks.
    - If missing/weak (design, acceptance criteria, traceability), update and re-validate.
- Output:
  - SPEC_STATUS=VALIDATED
  - spec delta summary
  - pointers to proposal+tasks artifacts

---

PHASE 2 — OPENSPEC REVIEW (GATE 1)
use subagent OpenSpec Reviewer to:
- Review validated proposal + tasks.
- Research and assess compliance with modern best practices relevant to the technical design.
- Output: DECISION=APPROVE or DECISION=BLOCK with blockers tied to spec sections.

IF DECISION=BLOCK:
- Immediately return to PHASE 1 with the blockers and repeat PHASE 1 → PHASE 2 until DECISION=APPROVE.

---

PHASE 3 — IMPLEMENTATION (TASKS SEQUENTIALLY)
use subagent Builder to:
- Implement tasks sequentially, strictly per approved OpenSpec proposal+tasks.
- Run tests/lint/build as needed (NO git commit, NO PR).
- Output: task-to-code mapping, files changed, command results, DevTools notes

---

PHASE 4 — RUNTIME VALIDATION (GATE 2)
use subagent Chrome DevTools Tester to:
- Validate every acceptance criterion via Chrome DevTools MCP with evidence.
- Output: DECISION=PASS or DECISION=FAIL with evidence per criterion.

IF DECISION=FAIL:
- use subagent Builder to fix ONLY what is required to satisfy failed criteria (no commits/PR),
- then repeat PHASE 4 until DECISION=PASS.

---

PHASE 5 — FINAL DIFF REVIEW (GATE 3)
use subagent Design & Diff Reviewer to:
- Verify final diff complies with approved OpenSpec (requirements + technical design) and MCP evidence exists.
- Output: DECISION=APPROVE or DECISION=BLOCK with file-level blockers and a tag:
  - BLOCKER_TYPE=IMPLEMENTATION or BLOCKER_TYPE=SPEC

IF DECISION=BLOCK and BLOCKER_TYPE=IMPLEMENTATION:
- use subagent Builder to fix blockers,
- then re-run PHASE 4 and PHASE 5 until APPROVE.

IF DECISION=BLOCK and BLOCKER_TYPE=SPEC:
- return to PHASE 1 to update/validate OpenSpec,
- then re-run PHASE 2 onward until APPROVE.

---

COMPLETION:
- If PHASE 2 APPROVE, PHASE 4 PASS, and PHASE 5 APPROVE: report COMPLETE.
- Do NOT commit or create/manage PRs.

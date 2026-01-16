# Proposal: Clean AI Guidelines for User Projects

## Summary

Clean up the AI guidelines (`.ai/` directory) shipped to HAI3 user projects via the CLI. Currently, user projects receive SDK-development-focused content that is irrelevant or confusing when their goal is to **consume HAI3 packages** and **build applications**, not develop the HAI3 SDK itself.

## Background: Template Assembly System

The CLI uses a marker-based system for assembling `.ai/` content:

**Marker Types:**
- `<!-- @standalone -->` - File is copied verbatim to user projects
- `<!-- @standalone:override -->` - File is replaced with version from `packages/cli/template-sources/ai-overrides/`
- No marker - File is monorepo-only, not copied

**Override Location:**
- Override files are stored in `packages/cli/template-sources/ai-overrides/`
- The `copy-templates.ts` script replaces marked source files with their override counterparts

**Layer Filtering System:**
- `packages/cli/src/core/layers.ts` defines `TARGET_LAYERS` mapping for layer-aware filtering
- Layers: sdk, framework, react, app
- This proposal works alongside (not replaces) the layer system

## Problem

The HAI3 CLI ships AI guidelines to user projects, but several categories of issues make these guidelines inappropriate for their audience:

### Issue 1: Monorepo-Specific Routing in GUIDELINES.md

The existing `packages/cli/template-sources/ai-overrides/GUIDELINES.md` contains routing entries for `packages/` paths that do not exist in user projects:

**SDK Layer routing (packages that do not exist in user projects):**
- `packages/state -> .ai/targets/STORE.md`
- `packages/api -> .ai/targets/API.md`
- `packages/i18n -> .ai/targets/I18N.md`

**Framework Layer routing:**
- `packages/framework -> .ai/targets/FRAMEWORK.md`

**React Layer routing:**
- `packages/react -> .ai/targets/REACT.md`

**UI and Dev Packages routing:**
- `packages/uikit -> .ai/targets/UIKIT.md`
- `packages/studio -> .ai/targets/STUDIO.md`

User projects have only `src/` structure (screensets, themes, uikit customizations), not `packages/` structure.

### Issue 2: Unrouted Target Files Are Useless Context

The GUIDELINES.md ROUTING section for user projects routes to only 8 target files:

**Application Layer:**
- `src/screensets -> .ai/targets/SCREENSETS.md`
- `src/themes -> .ai/targets/THEMES.md`
- `Styling anywhere -> .ai/targets/STYLING.md`
- `Layout patterns -> .ai/targets/LAYOUT.md`
- `Event patterns -> .ai/targets/EVENTS.md`

**Tooling:**
- `.ai documentation -> .ai/targets/AI.md`
- `.ai/commands -> .ai/targets/AI_COMMANDS.md`
- `CLI usage -> .ai/targets/CLI.md`

The following target files have NO routing entries in user projects:
- FRAMEWORK.md - never referenced by AI workflow
- STORE.md - never referenced by AI workflow
- REACT.md - never referenced by AI workflow
- UIKIT.md - never referenced by AI workflow
- I18N.md - never referenced by AI workflow

**Key insight**: If a target file has no routing, it should not exist in user projects at all. Creating "user-focused versions" of unrouted files is still useless context that enlarges token count without providing value.

### Issue 3: AI Command Documentation Contains Monorepo-Specific Content

**AI.md target:**
- References `hai3dev-*` command namespace (monorepo-only commands)
- References `UPDATE_GUIDELINES.md` which is monorepo-only
- `internal/` and `user/` location references are outdated

**AI_COMMANDS.md target:**
- Note: `.ai/commands/` IS the correct canonical location in the monorepo
- However, the "ADDING A NEW COMMAND" and "MODIFYING EXISTING COMMANDS" sections reference monorepo development workflows
- References `copy-templates.ts` and IDE adapter generation (monorepo development)
- The issue is the SDK development content, not the command location itself

### Issue 4: STUDIO.md Should Not Ship to User Projects

STUDIO.md currently has `<!-- @standalone -->` marker, meaning it IS being shipped to user projects. However:
- Studio is SDK development tooling, not for application developers
- User projects do not have `packages/studio/` directory
- The SCOPE section references `packages/studio/**` which does not exist in user projects

### Issue 5: Confusing Mixed Audience

Users receive guidance that mixes:
- How to use HAI3 (what they need)
- How to develop HAI3 SDK packages (what they do not need)

This creates confusion and leads AI assistants to suggest inappropriate patterns (e.g., modifying core registries, creating new plugins, editing package internals).

### Issue 6: Hardcoded @hai3/uikit References

GUIDELINES.md and other files contain hardcoded `@hai3/uikit` references. However, users can replace the HAI3 uikit with their own UI kit. These references should use "the configured UI kit" instead.

## Existing Overrides Analysis

The following override files ALREADY EXIST in `packages/cli/template-sources/ai-overrides/`:

| File | Status | Action Needed |
|------|--------|---------------|
| `GUIDELINES.md` | EXISTS but contains `packages/` routing and hardcoded @hai3/uikit | MODIFY: Remove SDK routing, replace @hai3/uikit references |
| `GUIDELINES.sdk.md` | EXISTS | No changes needed (SDK layer variant) |
| `GUIDELINES.framework.md` | EXISTS | No changes needed (Framework layer variant) |
| `targets/API.md` | EXISTS and user-focused | No changes needed (referenced from SCREENSETS.md for API patterns) |
| `targets/THEMES.md` | EXISTS and user-focused | No changes needed (already standalone-appropriate) |

## Requirements

### Priority 1: Modify Existing GUIDELINES.md Override

The existing `packages/cli/template-sources/ai-overrides/GUIDELINES.md` needs MODIFICATION (not replacement):

- [P1-R1] REQUIRED: Remove SDK Layer (L1) section with `packages/state`, `packages/api`, `packages/i18n` routes
- [P1-R2] REQUIRED: Remove Framework Layer (L2) section with `packages/framework` route (keep Layout/Theme patterns)
- [P1-R3] REQUIRED: Remove React Layer (L3) section with `packages/react` route
- [P1-R4] REQUIRED: Remove UI and Dev Packages section with `packages/uikit`, `packages/studio` routes
- [P1-R5] REQUIRED: Keep Application Layer section (`src/screensets`, `src/themes`, styling)
- [P1-R6] REQUIRED: Keep Tooling section with CLI usage routes
- [P1-R7] REQUIRED: Replace hardcoded `@hai3/uikit` references with "the configured UI kit"

### Priority 2: Exclude Unrouted Target Files from User Projects

Target files with no routing in GUIDELINES.md should be EXCLUDED entirely (not given user-focused overrides):

- [P2-R1] REQUIRED: Remove `<!-- @standalone -->` or `<!-- @standalone:override -->` marker from `.ai/targets/FRAMEWORK.md` (no routing = exclude)
- [P2-R2] REQUIRED: Remove marker from `.ai/targets/STORE.md` (no routing = exclude)
- [P2-R3] REQUIRED: Remove marker from `.ai/targets/REACT.md` (no routing = exclude)
- [P2-R4] REQUIRED: Remove marker from `.ai/targets/UIKIT.md` (no routing = exclude)
- [P2-R5] REQUIRED: Remove marker from `.ai/targets/I18N.md` (no routing = exclude)
- [P2-R6] REQUIRED: Delete any override files created for these targets in `packages/cli/template-sources/ai-overrides/targets/`

**Rationale**: If a target file has no routing entry, the AI workflow never references it. Shipping it (even a "user-focused" version) only adds context noise and token overhead.

### Priority 3: Exclude STUDIO.md from User Projects

STUDIO.md exclusion via source file marker removal (simplest approach):

- [P3-R1] REQUIRED: Remove `<!-- @standalone -->` marker from `.ai/targets/STUDIO.md` source file
- [P3-R2] REQUIRED: This automatically excludes STUDIO.md from user projects (no marker = not copied)
- [P3-R3] REQUIRED: STUDIO.md remains available in monorepo for SDK developers

Note: Layer filtering (`TARGET_LAYERS` in layers.ts) handles per-layer target inclusion. This proposal uses marker removal for complete exclusion from all standalone projects, which is simpler than adding layer-based exclusion logic.

### Priority 4: Create Overrides for ROUTED Target Files

Create overrides ONLY for target files that ARE routed in user project GUIDELINES.md:

- [P4-R1] REQUIRED: Create `targets/CLI.md` override (CLI usage, not CLI development) - routed via "CLI usage"
- [P4-R2] REQUIRED: Create `targets/AI.md` override without `hai3dev-*` and `UPDATE_GUIDELINES.md` references - routed via ".ai documentation"
- [P4-R3] REQUIRED: Create `targets/AI_COMMANDS.md` override without SDK development sections - routed via ".ai/commands"

Note: SCREENSETS.md, THEMES.md, STYLING.md, LAYOUT.md, EVENTS.md are already user-focused (no override needed).

### Priority 5: Source File Marker Updates for Routed Files

For each new override of a ROUTED file, the corresponding source file needs marker update:

- [P5-R1] REQUIRED: Change marker in `.ai/targets/CLI.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
- [P5-R2] REQUIRED: Change marker in `.ai/targets/AI.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
- [P5-R3] REQUIRED: Change marker in `.ai/targets/AI_COMMANDS.md` from `<!-- @standalone -->` to `<!-- @standalone:override -->`
- [P5-R4] REQUIRED: Verify `copy-templates.ts` correctly processes the override mechanism

## Scenarios

### Scenario 1: New HAI3 Project Creation

**Given** a developer runs `hai3 create my-project`
**When** the CLI generates the `.ai/` directory
**Then** GUIDELINES.md routing contains only:
  - `src/screensets -> .ai/targets/SCREENSETS.md`
  - `src/themes -> .ai/targets/THEMES.md`
  - `Styling anywhere -> .ai/targets/STYLING.md`
  - `.ai documentation -> .ai/targets/AI.md`
  - `.ai/commands -> .ai/targets/AI_COMMANDS.md`
  - `CLI usage -> .ai/targets/CLI.md`
  - `Event patterns -> .ai/targets/EVENTS.md`
  - `Layout patterns -> .ai/targets/LAYOUT.md`
**And** GUIDELINES.md does NOT contain `packages/*` references
**And** GUIDELINES.md does NOT contain hardcoded `@hai3/uikit` references
**And** only 9 target files exist in `.ai/targets/`:
  - AI.md, AI_COMMANDS.md, CLI.md (Tooling)
  - SCREENSETS.md, THEMES.md, STYLING.md, LAYOUT.md, EVENTS.md (Application Layer)
  - API.md (referenced from SCREENSETS.md for API service patterns)
**And** the following files do NOT exist in `.ai/targets/`:
  - FRAMEWORK.md, STORE.md, REACT.md, UIKIT.md, I18N.md (no routing)
  - STUDIO.md (SDK development only)

### Scenario 2: AI Assistant Guidance in User Project

**Given** a user project with cleaned AI guidelines
**When** an AI assistant reads `.ai/targets/CLI.md`
**Then** the assistant learns about:
  - Using `hai3` CLI commands (create, update, screenset)
  - Running validation commands
  - Understanding project structure
**And** the assistant does NOT see:
  - CLI package development (presets hierarchy, copy-templates.ts)
  - Template assembly logic
  - `packages/cli/` scope references

### Scenario 3: AI Assistant Cannot Find Unrouted Files

**Given** a user project with cleaned AI guidelines
**When** an AI assistant tries to find `.ai/targets/STORE.md` or `.ai/targets/REACT.md`
**Then** these files do NOT exist
**And** the assistant uses SCREENSETS.md for state and component patterns instead
**Because** state management and React hooks are documented in context of screenset development

### Scenario 4: Monorepo Development Unaffected

**Given** the HAI3 monorepo (not a user project)
**When** a developer works on SDK packages
**Then** the original SDK-focused target files remain available
**And** hai3dev-* commands are available
**And** STUDIO.md is available for Studio development
**And** `packages/*` routing is available

## Edge Cases

### Edge Case 1: User Needs to Understand SDK Architecture

**Scenario**: A user wants to understand how @hai3/framework works internally
**Expected**: User project guidelines focus on consumption patterns; for SDK internals, users should consult HAI3 documentation or source code
**Rationale**: Mixing SDK development guidance with consumption guidance leads to confusion and inappropriate code patterns

### Edge Case 2: User Creates Custom UI Kit Components

**Scenario**: A user creates custom components in `src/screensets/*/uikit/`
**Expected**: SCREENSETS.md and STYLING.md guide local component customization patterns
**Rationale**: UI kit customization is documented in the context of screenset development, not as separate UIKIT.md file

### Edge Case 3: User Runs hai3 update

**Scenario**: A user updates an existing project with `hai3 update --templates-only`
**Expected**: Updated guidelines replace old monorepo-focused content with user-focused content
**Rationale**: Existing projects should benefit from cleaner guidelines

### Edge Case 4: User Looks for State or React Documentation

**Scenario**: A user expects to find STORE.md or REACT.md for state/React patterns
**Expected**: These files do not exist; state management and React patterns are documented in SCREENSETS.md where they are actually used
**Rationale**: Standalone target files for STORE and REACT were SDK development guides; usage patterns belong in screenset context

## Acceptance Criteria

### AC1: No packages/* References in User Projects
- [AC1.1] VERIFY: `grep -rn "packages/" project/.ai/` returns 0 matches in a newly created project
- [AC1.2] VERIFY: GUIDELINES.md does not contain "SDK Layer", "Framework Layer", "React Layer", "UI and Dev Packages" sections

### AC2: No Hardcoded @hai3/uikit References
- [AC2.1] VERIFY: `grep -rn "@hai3/uikit" project/.ai/` returns 0 matches in a newly created project
- [AC2.2] VERIFY: GUIDELINES.md uses "the configured UI kit" instead of hardcoded package names

### AC3: Only Routed Target Files Exist
- [AC3.1] VERIFY: CLI.md exists in user projects and does NOT contain "packages/cli/" scope reference
- [AC3.2] VERIFY: FRAMEWORK.md does NOT exist in user projects `.ai/targets/`
- [AC3.3] VERIFY: STORE.md does NOT exist in user projects `.ai/targets/`
- [AC3.4] VERIFY: REACT.md does NOT exist in user projects `.ai/targets/`
- [AC3.5] VERIFY: UIKIT.md does NOT exist in user projects `.ai/targets/`
- [AC3.6] VERIFY: I18N.md does NOT exist in user projects `.ai/targets/`
- [AC3.7] VERIFY: STUDIO.md does NOT exist in user projects `.ai/targets/`
- [AC3.8] VERIFY: API.md exists in user projects (referenced from SCREENSETS.md)
- [AC3.9] VERIFY: Exactly 9 target files exist: AI.md, AI_COMMANDS.md, API.md, CLI.md, EVENTS.md, LAYOUT.md, SCREENSETS.md, STYLING.md, THEMES.md

### AC4: Cleaned AI.md and AI_COMMANDS.md
- [AC4.1] VERIFY: AI.md in user projects does NOT contain "hai3dev-" references
- [AC4.2] VERIFY: AI.md in user projects does NOT contain "UPDATE_GUIDELINES.md" references
- [AC4.3] VERIFY: AI_COMMANDS.md in user projects does NOT contain "ADDING A NEW COMMAND" section
- [AC4.4] VERIFY: AI_COMMANDS.md in user projects does NOT contain "MODIFYING EXISTING COMMANDS" section
- [AC4.5] VERIFY: AI_COMMANDS.md in user projects does NOT contain "copy-templates.ts" references

### AC5: Template Assembly Validation
- [AC5.1] VERIFY: `npm run build:packages` succeeds
- [AC5.2] VERIFY: `hai3 create test-project` creates project with cleaned guidelines
- [AC5.3] VERIFY: Created project passes `npm run lint` and `npm run type-check`

### AC6: Monorepo Development Unaffected
- [AC6.1] VERIFY: Original SDK-focused target files remain in monorepo `.ai/targets/`
- [AC6.2] VERIFY: hai3dev-* commands remain available in monorepo
- [AC6.3] VERIFY: STUDIO.md remains available in monorepo `.ai/targets/`

## Out of Scope

- Changes to actual CLI functionality (only changing documentation/guidelines)
- Changes to SDK package implementations
- Changes to SCREENSETS.md, STYLING.md, EVENTS.md, LAYOUT.md (already user-focused)
- Changes to MCP_TROUBLESHOOTING.md
- Adding new features to the CLI or templates
- Modifying `packages/cli/src/core/layers.ts` (layer filtering works alongside this proposal)
- Changes to `packages/cli/template-sources/ai-overrides/targets/API.md` (already user-focused, referenced from SCREENSETS.md for API service patterns)
- Changes to `packages/cli/template-sources/ai-overrides/targets/THEMES.md` (already user-focused, no `packages/` references)
- Changes to `packages/cli/template-sources/ai-overrides/GUIDELINES.sdk.md` (SDK layer variant, not for app users)
- Changes to `packages/cli/template-sources/ai-overrides/GUIDELINES.framework.md` (Framework layer variant, not for app users)

## Notes

### Why API.md is Kept Despite No Direct Routing

API.md has no direct routing entry in GUIDELINES.md, but it IS referenced from SCREENSETS.md for API service patterns. It provides guidance on:
- Creating API services in `src/screensets/*/api/`
- Domain-based service architecture
- Error handling patterns

This makes API.md useful context when working on screensets, unlike FRAMEWORK.md, STORE.md, REACT.md, UIKIT.md, I18N.md which have no references from any routed file.

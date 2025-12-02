# AI Command Maintenance Rules

## CRITICAL RULES
- REQUIRED: All canonical command content in .ai/commands/.
- REQUIRED: IDE folders (.claude/, .cursor/, etc.) contain thin adapters only.
- FORBIDDEN: Command logic in IDE-specific folders.

## COMMAND CATEGORIES
hai3-*: Standalone project commands (shipped to all HAI3 projects).
hai3dev-*: Monorepo-only commands (framework development only).
openspec:*: OpenSpec workflow commands (managed by openspec update).

## OPENSPEC WORKFLOW COMMANDS
- hai3-new-screenset, hai3-new-screen, hai3-new-component, hai3-new-action, hai3-new-api-service.
- REQUIRED: These commands create OpenSpec proposals first, then implement after approval.
- REQUIRED: hai3-new-screenset must use CLI (hai3 screenset create) during apply step.
- Pattern: Gather requirements -> Create proposal -> Wait for approval -> Apply implementation.

## NAMING CONVENTIONS
- REQUIRED: Standalone commands use hai3- filename prefix (e.g., hai3-validate.md).
- REQUIRED: Monorepo-only commands use hai3dev- prefix (e.g., hai3dev-update-guidelines.md).
- FORBIDDEN: Unprefixed command files (except openspec: commands).
- FORBIDDEN: Changing openspec: prefix (managed by openspec update).

## COMMAND STRUCTURE
- REQUIRED: Commands are self-contained with full procedural steps.
- FORBIDDEN: References to external workflow files.
- FORBIDDEN: Duplicating GUIDELINES.md routing table in commands.
- REQUIRED: Commands follow AI.md format rules (under 100 lines, ASCII, keywords).

## STANDALONE VS MONOREPO
- Standalone (hai3-*): App development (screensets, validation, components).
- Monorepo (hai3dev-*): Framework development (guidelines updates, publishing).
- REQUIRED: Standalone commands must not reference packages/* paths.
- Location: .ai/commands/hai3-*.md marked with <!-- @standalone -->.
- FORBIDDEN: hai3dev-* commands in standalone projects (copy-templates excludes them).

## IDE ADAPTER PATTERN
File: .claude/commands/hai3-example.md
Content: Description frontmatter + reference to .ai/commands/hai3-example.md.
REQUIRED: Adapters must NOT contain command logic.

## UPDATE MECHANISM
- hai3: commands -> Updated by hai3 update.
- openspec: commands -> Updated by openspec update.
- hai3dev: commands -> Manual updates (not shipped to standalone).

## ADDING A NEW COMMAND
1) Create canonical file in .ai/commands/hai3-name.md with <!-- @standalone --> marker.
2) Follow AI.md format rules.
3) For hai3-new-* commands: MUST use OpenSpec workflow pattern.
4) IDE adapters are generated automatically by copy-templates.ts.
5) Verify with npm run build:packages && npm run lint.

## MODIFYING EXISTING COMMANDS
1) Edit ONLY the canonical file in .ai/commands/.
2) IDE adapters auto-update (they just reference canonical).
3) Changes propagate via hai3 update to standalone projects.

## DETECT RULES
- DETECT: grep -rn "hai3dev-" packages/cli/templates/.ai (must be 0).
- DETECT: grep -rn "packages/" packages/cli/templates/.ai/commands (must be 0).

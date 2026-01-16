# AI Command Usage Rules

## CRITICAL RULES
- REQUIRED: All canonical command content in .ai/commands/.
- REQUIRED: IDE folders (.claude/, .cursor/, etc.) contain thin adapters only.
- FORBIDDEN: Command logic in IDE-specific folders.

## COMMAND CATEGORIES
hai3-*: User project commands (shipped to all HAI3 projects).
openspec:*: OpenSpec workflow commands (managed by openspec update).

## OPENSPEC WORKFLOW COMMANDS
- hai3-new-screenset, hai3-new-screen, hai3-new-component, hai3-new-action, hai3-new-api-service.
- REQUIRED: These commands create OpenSpec proposals first, then implement after approval.
- REQUIRED: hai3-new-screenset must use CLI (hai3 screenset create) during apply step.
- Pattern: Gather requirements -> Create proposal -> Wait for approval -> Apply implementation.

## NAMING CONVENTIONS
- REQUIRED: User commands use hai3- filename prefix (e.g., hai3-validate.md).
- FORBIDDEN: Unprefixed command files (except openspec: commands).
- FORBIDDEN: Changing openspec: prefix (managed by openspec update).

## LAYER VARIANTS
Commands can have layer-specific variants for SDK architecture tiers:
- Base command: hai3-new-api-service.md (serves as SDK default).
- SDK variant: hai3-new-api-service.sdk.md (explicitly SDK-only content).
- Framework variant: hai3-new-api-service.framework.md (adds Framework patterns).
- React variant: hai3-new-api-service.react.md (adds React hooks/components).

Fallback chain (most specific first):
- sdk layer: .sdk.md -> .md
- framework layer: .framework.md -> .sdk.md -> .md
- react/app layer: .react.md -> .framework.md -> .sdk.md -> .md

REQUIRED: Only create variants when guidance differs meaningfully per layer.
REQUIRED: Variant content must match available APIs at that layer.

Commands without applicable variants are excluded from that layer.
Example: hai3-new-screenset.md (React-only) is excluded from SDK/Framework layers.

## COMMAND STRUCTURE
- REQUIRED: Commands are self-contained with full procedural steps.
- FORBIDDEN: References to external workflow files.
- FORBIDDEN: Duplicating GUIDELINES.md routing table in commands.
- REQUIRED: Commands follow AI.md format rules (under 100 lines, ASCII, keywords).

## USER PROJECT COMMANDS
- User commands (hai3-*): App development (screensets, validation, components).
- REQUIRED: Commands must not reference monorepo-specific paths or workflows.
- Location: .ai/commands/hai3-*.md.

## IDE ADAPTER PATTERN
File: .claude/commands/hai3-example.md
Content: Description frontmatter + reference to .ai/commands/hai3-example.md.
REQUIRED: Adapters must NOT contain command logic.

## UPDATE MECHANISM
- hai3: commands -> Updated by hai3 update.
- openspec: commands -> Updated by openspec update.

## USING COMMANDS
1) Select command from .ai/commands/ directory.
2) Follow command steps sequentially.
3) Commands delegate to hai3 CLI for scaffolding.
4) Commands run validation after changes.

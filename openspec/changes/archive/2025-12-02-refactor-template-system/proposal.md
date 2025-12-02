# Proposal: Refactor Template System

## Summary

Simplify the CLI template system to a clear 3-stage pipeline: copy → generate → use. Eliminate complex assembly logic and file-by-file listing in favor of an extensible directory-based approach.

## Problem

The current template system has several issues:

1. **Not extensible**: Adding new templates requires editing multiple lists in multiple files
2. **Complex assembly**: Content comes from scattered sources (root .ai/, presets/standalone/ai/, root eslint-plugin-local/, etc.)
3. **Inconsistent patterns**: Some files are copied, some generated, some use markers - hard to understand
4. **Redundant configuration**: SYNC_TEMPLATES in update command lists every file individually

## Proposed Solution

### 3-Stage Pipeline

**Stage 1: Copy from presets/standalone/**
- Everything in `presets/standalone/` is copied to `templates/`
- One source folder, one copy operation
- Extensible: add files to presets/standalone/ and they're automatically included

**Stage 2: Generate pointers and adapters**
- Generate CLAUDE.md (pointer to .ai/GUIDELINES.md)
- Generate .cursor/rules/, .windsurf/rules/ (pointers)
- Generate command adapters for all IDEs from .ai/commands/ markers
- Copy openspec commands from root to all IDEs

**Stage 3: CLI uses templates**
- `hai3 create` copies templates to new project
- `hai3 update` copies ALL templates to existing project (full sync)

### Directory Structure Changes

```
presets/
├── standalone/              # Base files for standalone projects
│   ├── ai-overrides/        # ONLY @standalone:override files (different content for standalone)
│   ├── eslint-plugin-local/ # ESLint rules (monorepo references from here)
│   ├── configs/             # tsconfig, eslint.config, .dependency-cruiser
│   └── scripts/             # generate-colors, test-architecture
│
└── monorepo/                # Monorepo EXTENDS standalone with these
    ├── configs/             # Additional monorepo configs (if any)
    └── scripts/             # Additional monorepo scripts (if any)

# NOT in presets (copied from root at build time):
# - src/themes/, src/uikit/, src/icons/  # Source code
# - src/screensets/demo/                  # Demo screenset
# - index.html, vite.config.ts, etc.      # Root configs

# GENERATED at build time:
# - .ai/                      # Assembled from markers + ai-overrides/
# - CLAUDE.md                 # Pointer to .ai/GUIDELINES.md
# - .claude/, .cursor/, .windsurf/  # IDE rules, command adapters, openspec commands

# NOT synced by update (user manages separately):
# - openspec/                 # Project-specific specs (user runs openspec init)
```

### Key Decisions

1. **Markers for .ai/ only**: Keep marker-based approach for .ai/ content (single source of truth for rules)
2. **Demo screenset from src/**: Not duplicated, copied from `src/screensets/demo/`
3. **eslint-plugin-local in presets/standalone/**: Monorepo references it from there, no duplication
4. **Full template sync**: Update command copies ALL templates, not selective sync
5. **hai3-new-* commands use OpenSpec**: All "new" commands (screenset, screen, component, action, api-service) create OpenSpec proposals instead of direct implementation. Forces proper documentation and review workflow. **Note**: hai3-new-screenset still uses `hai3 screenset create` CLI during apply step to ensure screenset uniformity.
6. **hai3dev-* commands are monorepo-only**: Commands for framework development (like update-guidelines) are not copied to standalone projects

## Impact

- **copy-templates.ts**: Major simplification - copy presets/standalone/ + generate pointers
- **update command**: Simplified to copy all templates (excludes openspec/)
- **eslint-plugin-local/**: Moved from root to presets/standalone/, monorepo references it from there
- **presets/standalone/**: Restructured to contain complete standalone project structure
- **eslint.config.js**: Updated to reference ./presets/standalone/eslint-plugin-local
- **hai3-new-* commands**: Refactored to create OpenSpec proposals instead of direct implementation
- **hai3dev-* commands**: Separated as monorepo-only (not copied to standalone projects)
- **.ai/targets/AI_COMMANDS.md**: Updated to document command categories and OpenSpec workflow

## Out of Scope

- Changes to marker-based .ai/ assembly (keep current approach)
- Changes to screenset create/copy commands
- Changes to project creation wizard

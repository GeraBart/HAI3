# CLI Spec Delta: Template System Refactoring

## MODIFIED Requirements

### Requirement: Template-Based Code Generation

The CLI SHALL use a 3-stage template pipeline: copy from presets → generate pointers/adapters → use templates.

#### Scenario: Template source structure

**Given** the presets directory structure
**When** building CLI templates
**Then** the system SHALL use:
```
presets/
├── standalone/                    # Base files for standalone projects
│   ├── ai-overrides/              # ONLY @standalone:override files
│   ├── eslint-plugin-local/       # ESLint rules (monorepo references from here)
│   ├── configs/                   # Build configs
│   └── scripts/                   # Utility scripts
│
└── monorepo/                      # Monorepo EXTENDS standalone
    ├── configs/                   # Additional monorepo configs (if any)
    └── scripts/                   # Additional monorepo scripts (if any)
```

**AND** root project files copied at build time:
- `index.html`, `postcss.config.ts`, `tailwind.config.ts`, `tsconfig.node.json`, `vite.config.ts`, `.gitignore`
- `src/vite-env.d.ts`, `src/main.tsx`, `src/App.tsx`, `src/screensets/screensetRegistry.tsx`
- `src/themes/`, `src/uikit/`, `src/icons/`, `src/screensets/demo/`

**AND** generated at build time:
- `.ai/` (assembled from markers + ai-overrides/)
- `CLAUDE.md`, `.claude/`, `.cursor/`, `.windsurf/` (IDE rules, command adapters, openspec commands)

**AND** NOT included in templates:
- `openspec/` (users initialize separately via `openspec init`)

#### Scenario: Build pipeline stages

**Given** running `npm run build:packages`
**When** copy-templates.ts executes
**Then** the system SHALL:
1. Copy `presets/standalone/` to `templates/` (excluding ai-overrides/, flattening configs/ and scripts/)
2. Copy root project files to `templates/`
3. Assemble `.ai/` from marker-based scanning of root `.ai/` (using ai-overrides/ for @standalone:override files)
4. Generate IDE rules (CLAUDE.md, .cursor/rules/, .windsurf/rules/) as pointers to .ai/GUIDELINES.md
5. Generate command adapters from @standalone marked commands
6. Copy openspec commands from root to all IDE directories

### Requirement: Update Command

The CLI SHALL provide a `hai3 update` command that syncs ALL templates to existing projects.

#### Scenario: Full template sync

**Given** running `hai3 update` inside a HAI3 project
**When** the command executes
**Then** the system SHALL:
- Copy entire templates/ directory to project root
- Overwrite existing template files
- Preserve user files not in templates
- Skip internal files (manifest.json)
- Report sync completion

#### Scenario: Templates-only update

**Given** running `hai3 update --templates-only` inside a HAI3 project
**When** the flag is provided
**Then** the system SHALL:
- Skip CLI update
- Skip NPM package updates
- Copy entire templates/ directory to project

## REMOVED Requirements

### Requirement: Selective Template Sync (REMOVED)

~~The update command SHALL selectively sync specific template directories~~

**Rationale**: Full template sync is simpler and more reliable. Users expect all templates to update together.

## ADDED Requirements

### Requirement: ESLint Plugin Location

The ESLint plugin SHALL live in `presets/standalone/` and be referenced by the monorepo.

#### Scenario: Standalone ESLint rules

**Given** a standalone HAI3 project
**When** linting with ESLint
**Then** the system SHALL use rules from `eslint-plugin-local/` containing:
- domain-event-format
- no-barrel-exports-events-effects
- no-coordinator-effects
- no-missing-domain-id

#### Scenario: Monorepo ESLint reference

**Given** the HAI3 monorepo
**When** linting with ESLint
**Then** the system SHALL reference `./presets/standalone/eslint-plugin-local` in eslint.config.js

### Requirement: Generated IDE Rules

All IDE rules SHALL be generated as pointers to `.ai/GUIDELINES.md`.

#### Scenario: CLAUDE.md generation

**Given** building CLI templates
**When** generating IDE rules
**Then** the system SHALL create `CLAUDE.md` containing:
```markdown
# CLAUDE.md

Use `.ai/GUIDELINES.md` as the single source of truth for HAI3 development guidelines.

For routing to specific topics, see the ROUTING section in GUIDELINES.md.
```

#### Scenario: Cursor rules generation

**Given** building CLI templates
**When** generating IDE rules
**Then** the system SHALL create `.cursor/rules/hai3.mdc` containing a pointer to `.ai/GUIDELINES.md`

#### Scenario: Windsurf rules generation

**Given** building CLI templates
**When** generating IDE rules
**Then** the system SHALL create `.windsurf/rules/hai3.md` containing a pointer to `.ai/GUIDELINES.md`

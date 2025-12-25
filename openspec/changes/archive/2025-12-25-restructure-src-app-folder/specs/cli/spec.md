# CLI Spec Delta: restructure-src-app-folder

## MODIFIED Requirements

### Requirement: Project Creation Command

The CLI SHALL provide a `hai3 create <project-name>` command that scaffolds a new HAI3 project using template-based generation.

#### Scenario: Project creation with AI configs

**Given** a developer running `hai3 create my-app`
**When** the command executes
**Then** the system SHALL create:
- Directory `my-app/`
- All root config files from templates
- `hai3.config.json` with project configuration
- `package.json` with HAI3 dependencies
- `.ai/` folder with standalone-only AI guidelines
- `.claude/commands/` with hai3-prefixed command adapters
- `.cursor/rules/` and `.cursor/commands/` with adapters
- `.windsurf/rules/` and `.windsurf/commands/` with adapters (no workflows/)
- `.cline/` configuration folder
- `.aider/` configuration folder
- `openspec/` directory with project.md and AGENTS.md
- `src/app/themes/`, `src/app/uikit/`, `src/app/icons/`, `src/app/api/`, `src/app/layout/` from templates
- `src/app/App.tsx` and `src/app/main.tsx` application entry points
- `src/screensets/demo/` screenset from templates
- `src/screensets/screensetRegistry.tsx` for screenset registration

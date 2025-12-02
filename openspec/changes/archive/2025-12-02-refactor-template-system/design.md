# Design: Template System Refactoring

## Context

The HAI3 CLI uses templates to scaffold new projects and sync updates to existing projects. The current implementation has complex assembly logic that's hard to maintain and extend.

## Key Insight: Three Categories of Template Content

| Category | Location | Copied When | Examples |
|----------|----------|-------------|----------|
| **Static presets** | `presets/standalone/` | Build time (direct copy) | configs/, scripts/, ai-overrides/, openspec/, eslint-plugin-local/ |
| **Root project files** | Root of HAI3 | Build time (copy to templates) | src/themes/, src/uikit/, src/icons/, index.html, vite.config.ts |
| **Generated** | N/A | Build time (generated) | CLAUDE.md, IDE rules, command adapters, .ai/ (assembled from markers) |

**The pattern:**
- **Static presets** = Standalone-ONLY or DIFFERENT from monorepo (monorepo can reference these from presets/)
- **Root project files** = Source code and configs that ARE the running monorepo app
- **Generated** = Programmatically created from sources

## Decisions

### Decision 1: Preset Structure (Static Only)

```
presets/
├── standalone/                    # Base files for standalone projects
│   ├── ai-overrides/              # ONLY @standalone:override files (GUIDELINES.md, API.md, THEMES.md)
│   ├── eslint-plugin-local/       # ESLint rules (monorepo references from here)
│   ├── configs/                   # Standalone build configs
│   │   ├── tsconfig.json
│   │   ├── eslint.config.js
│   │   └── .dependency-cruiser.cjs
│   └── scripts/
│       ├── generate-colors.ts
│       └── test-architecture.ts
│
└── monorepo/                      # Monorepo EXTENDS standalone with these
    ├── configs/                   # Additional monorepo configs (if any)
    └── scripts/                   # Additional monorepo scripts (if any)
```

**Notes:**
- `ai-overrides/` contains ONLY files marked `@standalone:override` in root `.ai/`. The main `.ai/` folder is assembled at build time from marker-scanned files.
- `openspec/` is NOT in presets - users initialize it themselves in new projects (`openspec init` or manually). Only openspec COMMANDS are synced.

**NOT in presets (copied from root at build time):**
- `src/themes/`, `src/uikit/`, `src/icons/`
- `src/screensets/demo/`
- `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- `src/screensets/screensetRegistry.tsx`
- `index.html`, `vite.config.ts`, `postcss.config.ts`, `tailwind.config.ts`, `tsconfig.node.json`, `.gitignore`

### Decision 2: Build Pipeline (copy-templates.ts)

```typescript
async function copyTemplates() {
  // Stage 1a: Copy static presets (excluding ai-overrides, handled in 1c)
  await copyPreset('presets/standalone/', 'templates/', {
    exclude: ['ai-overrides/'],  // Handled by marker assembly
    flatten: { 'configs/': '.', 'scripts/': 'scripts/' }
  });

  // Stage 1b: Copy root project files (source code that IS the monorepo app)
  await copyRootFiles([
    'index.html', 'postcss.config.ts', 'tailwind.config.ts',
    'tsconfig.node.json', 'vite.config.ts', '.gitignore',
    'src/vite-env.d.ts', 'src/main.tsx', 'src/App.tsx',
    'src/screensets/screensetRegistry.tsx',
  ]);
  await copyDirectories([
    'src/themes', 'src/uikit', 'src/icons',
    'src/screensets/demo',
  ]);

  // Stage 1c: Assemble .ai/ from markers (uses ai-overrides/ for @standalone:override files)
  await assembleAiConfig('presets/standalone/ai-overrides/');

  // Stage 2: Generate pointers and adapters
  await generateIdeRules();       // CLAUDE.md, .cursor/rules/, .windsurf/rules/
  await generateCommandAdapters(); // All IDE command adapters
  await copyOpenspecToAllIdes();   // Copy openspec commands to all IDEs
}
```

### Decision 3: Shared SYNC_TEMPLATES for create and update

Both `create` and `update` commands use the same template sync logic:

```typescript
// Shared template configuration for UPDATE command
// NOTE: openspec/ is NOT synced - it contains project-specific specs
// Only openspec COMMANDS are synced (inside .claude/, .cursor/, .windsurf/)
const SYNC_TEMPLATES = [
  // Root files
  'CLAUDE.md',
  'index.html',
  'postcss.config.ts',
  // ... etc

  // Directories
  '.ai/',
  '.claude/',       // Includes commands/openspec/
  '.cursor/',       // Includes commands/openspec/
  '.windsurf/',     // Includes workflows/openspec/
  'src/themes/',
  'src/uikit/',
  'src/icons/',
  'src/screensets/demo/',
  'eslint-plugin-local/',
  'scripts/',
];

// Shared sync function
async function syncTemplates(templatesDir: string, destDir: string): Promise<string[]> {
  const synced: string[] = [];
  for (const template of SYNC_TEMPLATES) {
    await fs.copy(path.join(templatesDir, template), path.join(destDir, template));
    synced.push(template);
  }
  return synced;
}

// create command uses it
async function createProject(projectDir: string) {
  await syncTemplates(getTemplatesDir(), projectDir);
}

// update command uses it
async function updateProject(projectDir: string) {
  await syncTemplates(getTemplatesDir(), projectDir);
}
```

### Decision 4: ESLint Plugin Location

The `eslint-plugin-local/` lives in `presets/standalone/` because:
1. It's a static preset (same for all standalone projects)
2. The monorepo references it from `./presets/standalone/eslint-plugin-local`
3. No build-time copy needed - it's copied directly with other presets

If monorepo-specific rules are needed later, they go in `presets/monorepo/eslint-plugin-local/`.

## Summary

```
BUILD TIME FLOW:

presets/standalone/          ─┐
  configs/, scripts/          │
  eslint-plugin-local/        │
  ai-overrides/               │
                              ├──▶ templates/
Root project files           ─┤
  src/themes/, src/uikit/     │
  src/icons/, src/screensets/ │
  index.html, vite.config.ts  │
                              │
Generated                    ─┤
  CLAUDE.md (pointer)         │
  IDE rules (pointers)        │
  Command adapters            │
  Openspec commands           │
  .ai/ (marker assembly)     ─┘


RUNTIME FLOW:

templates/ ──▶ hai3 create ──▶ new project (user inits openspec separately)
           ──▶ hai3 update ──▶ existing project (openspec/ NOT synced, only commands)

SYNC_TEMPLATES[] used by update excludes openspec/ folder


MONOREPO EXTENDS STANDALONE:

presets/standalone/          ─┐
  eslint-plugin-local/        │
  configs/, scripts/          ├──▶ Monorepo uses these directly
                              │
presets/monorepo/            ─┤
  additional configs/scripts  │    (extends standalone)
```

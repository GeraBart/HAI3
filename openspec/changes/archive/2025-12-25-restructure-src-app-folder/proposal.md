# Proposal: restructure-src-app-folder

## Summary

Reorganize the `src/` folder structure to group all non-screenset folders under a new `app/` subdirectory, resulting in a cleaner two-folder structure: `src/app/` and `src/screensets/`.

## Motivation

The current `src/` directory contains 6 folders and 3 files at the root level:
- `api/` - API services
- `icons/` - Icon definitions
- `layout/` - Layout components
- `themes/` - Theme definitions
- `uikit/` - UI kit registry
- `screensets/` - Screenset modules
- `App.tsx`, `main.tsx`, `vite-env.d.ts`

This flat structure mixes application infrastructure (`api`, `layout`, `themes`, etc.) with business domain modules (`screensets`). Grouping infrastructure under `app/` provides:

1. **Clear separation** - Application infrastructure vs. business domain
2. **Scalability** - Easy to add more app-level folders without cluttering root
3. **Discoverability** - Developers immediately understand the two main concerns

## Proposed Structure

```
src/
├── vite-env.d.ts          # Stays at root (Vite convention)
├── app/
│   ├── api/               # API services (AccountsApiService)
│   ├── icons/             # Icon definitions
│   ├── layout/            # Layout components
│   ├── themes/            # Theme definitions
│   ├── uikit/             # UI kit registry
│   ├── App.tsx            # Root application component
│   └── main.tsx           # Application entry point
└── screensets/
    ├── _blank/            # Screenset template
    ├── demo/              # Demo screenset
    └── screensetRegistry.tsx
```

## Scope

### In Scope
- Move folders: `api/`, `icons/`, `layout/`, `themes/`, `uikit/`
- Move files: `App.tsx`, `main.tsx`
- Update all `@/` path aliases to use `@/app/` prefix
- Update tsconfig.json path mappings
- Update CLI template manifest and sources
- Update template files with new paths
- Keep `vite-env.d.ts` at `src/` root

### Out of Scope
- Package structure changes
- Build configuration changes (vite.config.ts alias stays as `@` → `./src`)
- Screenset internal structure changes

## Impact

### Files Requiring Import Updates
- `src/main.tsx` → `src/app/main.tsx` (self + imports)
- `src/App.tsx` → `src/app/App.tsx` (imports)
- `src/layout/Layout.tsx` (imports from `@/api`)
- `src/screensets/demo/**` (imports from `@/api`)
- CLI template sources and manifest

### Configuration Updates
- `tsconfig.json` - Update `@/` path mappings
- `packages/cli/template-sources/manifest.yaml` - Update paths
- Template files in `packages/cli/template-sources/`

## Status

- [x] Proposal drafted
- [ ] Tasks defined
- [ ] Approved
- [ ] Implemented

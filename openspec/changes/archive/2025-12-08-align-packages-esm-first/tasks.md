# Tasks: Align All Packages to ESM-First Pattern

## 1. Update @hai3/uicore

- [x] 1.1 Add `"type": "module"` to package.json
- [x] 1.2 Update exports to use `.js` (ESM) and `.cjs` (CJS)
- [x] 1.3 Update tsup build script for correct extensions
- [x] 1.4 Update sideEffects paths
- [x] 1.5 Bump version to `0.1.0-alpha.1`

## 2. Update @hai3/uikit

- [x] 2.1 Add `"type": "module"` to package.json
- [x] 2.2 Update exports to use `.js` (ESM) and `.cjs` (CJS)
- [x] 2.3 Update tsup build script for correct extensions
- [x] 2.4 Bump version to `0.1.0-alpha.4`

## 3. Update @hai3/studio

- [x] 3.1 Add `"type": "module"` to package.json
- [x] 3.2 Update exports to use `.js` (ESM) and `.cjs` (CJS)
- [x] 3.3 Update tsup build script for correct extensions
- [x] 3.4 Update sideEffects paths
- [x] 3.5 Bump version to `0.1.0-alpha.1`

## 4. Validation

- [x] 4.1 Build all packages: `npm run build:packages`
- [x] 4.2 Verify output files: `index.js` (ESM), `index.cjs` (CJS), `index.d.ts`
- [x] 4.3 Run lint (passes)
- [x] 4.4 Run arch:check (6/6 checks pass)
- [x] 4.5 Test app with `npm run dev` (starts successfully)

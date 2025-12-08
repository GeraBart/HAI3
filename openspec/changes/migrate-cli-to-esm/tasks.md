# Tasks: Migrate CLI to ESM

## 1. Build Configuration

- [x] 1.1 Update `packages/cli/package.json`:
  - Add `"type": "module"`
  - Update `bin` to point to `.js` instead of `.cjs`
  - Update `main`, `module`, `types` fields
  - Update `exports` for dual ESM/CJS API output

- [x] 1.2 Update `packages/cli/tsup.config.ts`:
  - Change format to `['esm', 'cjs']`
  - Update `outExtension` for proper file extensions
  - Configure separate handling for CLI (ESM-only) vs API (dual)
  - Add shims for `__dirname`/`__filename` compatibility

## 2. Dependency Updates

- [x] 2.1 Update `chalk` from `^4.1.2` to `^5.4.1`
- [x] 2.2 Verify `commander`, `fs-extra`, `inquirer` work correctly in ESM context
- [x] 2.3 Add missing `lodash` dependency (was used but not declared)

## 3. Source Code Migration

- [x] 3.1 Audit all `require()` calls and convert to `import`
- [x] 3.2 Replace `__dirname` usage with `import.meta.url` patterns (using shared `getTemplatesDir()`)
- [x] 3.3 Update lodash imports to use default import pattern for ESM compatibility
- [x] 3.4 Ensure all file paths use `.js` extensions where required by ESM

## 4. Testing

- [x] 4.1 Build CLI package: `npm run build -w @hai3/cli`
- [x] 4.2 Verify CLI binary works: `node packages/cli/dist/index.js --version`
- [x] 4.3 Test all CLI commands:
  - `hai3 create test-project`
  - `hai3 screenset create test`
- [x] 4.4 Test programmatic API from ESM consumer
- [x] 4.5 Test programmatic API from CJS consumer
- [x] 4.6 Verify package outputs (dist/index.js, dist/api.js, dist/api.cjs)

## 5. Documentation & Publishing

- [x] 5.1 Version bumped to `0.1.0-alpha.18`
- [x] 5.2 Spec delta created in `openspec/changes/migrate-cli-to-esm/specs/cli/spec.md`

## 6. Validation

- [x] 6.1 Run `tsc --noEmit` (TypeScript passes)
- [x] 6.2 Run `npm run lint` (passes)
- [x] 6.3 Run `npm run arch:check` (passes - 6/6 checks)
- [x] 6.4 Test in a fresh project created with the new CLI (verified)

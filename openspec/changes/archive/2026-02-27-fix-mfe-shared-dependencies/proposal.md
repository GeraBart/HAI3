## Why

MFE shared dependency sharing is completely non-functional. `MfeHandlerMF` calls `init({})` with an empty share scope, so the federation runtime always falls back to bundling full local copies. Every MFE downloads its own copies of react (~140KB), tailwindcss (~3.9MB), @hai3/uikit (~3.2MB), and the entire @hai3/* stack (~1.3MB) — even when identical versions are already loaded. Additionally, locally-downloaded bundles are not registered back into the global share scope, so even MFE-to-MFE sharing never kicks in.

## What Changes

- **Fix `MfeHandlerMF.loadRemoteContainer()`** to construct a proper `shareScope` from `globalThis.__federation_shared__` based on `manifest.sharedDependencies`, and pass it to `init(shareScope)` instead of `init({})`.
- **Register MFE-loaded bundles back into `globalThis.__federation_shared__`** after an MFE resolves its dependencies, so subsequent MFEs with matching versions can reuse them (the federation runtime does NOT do this automatically).
- **Host bootstrap step in the microfrontends plugin (L2, `@hai3/framework`)** to pre-populate `globalThis.__federation_shared__` with the host app's already-loaded bundles at startup (before any MFE loads), so the first MFE to load can immediately benefit from sharing. This belongs in the microfrontends plugin because the plugin already owns MFE initialization and has access to the MFE handlers — it is the natural point where host-side sharing is configured before any MFE is loaded.
- **Expand `sharedDependencies` in MFE manifests** to include all commonly-used dependencies beyond the current 4 (react, react-dom, tailwindcss, @hai3/uikit). Candidates: `@hai3/react`, `@hai3/framework`, `@hai3/state`, `@hai3/screensets`, `@hai3/api`, `@hai3/i18n`, `@reduxjs/toolkit`, `react-redux`.

## Capabilities

### New Capabilities
- `mfe-share-scope-management`: MfeHandlerMF constructs, passes, and maintains the global share scope (`globalThis.__federation_shared__`) using manifest.sharedDependencies as the sole source of truth. Covers shareScope construction, init() invocation, and post-load registration of MFE bundles back into the global scope.
- `host-share-scope-bootstrap`: The microfrontends plugin (L2, `@hai3/framework`) pre-populates `globalThis.__federation_shared__` with the host app's already-loaded bundles at startup, before any MFE is loaded. This allows the first MFE to benefit from sharing without requiring a GTS manifest for the host.

### Modified Capabilities
- `microfrontends`: Remove the "MFE Version Validation" requirement (warnings for minor mismatches, MfeVersionMismatchError for major). Since MFEs always bundle local fallbacks, version mismatches are never errors — the MFE silently uses its own copy. Also update the "Dynamic MFE isolation principles" scenario (line 88) to clarify that stateful packages CAN appear in `sharedDependencies` — sharing means bundle code reuse, not instance sharing.
- `screensets`: The existing spec already says `container.init(sharedScope)` but implementation passes `init({})`. The spec requirement for SharedDependencyConfig and singleton semantics is correct — this change implements what was already specified.

## Impact

- **@hai3/screensets** (`packages/screensets/src/mfe/handler/mf-handler.ts`): Primary change location. MfeHandlerMF gains share scope management logic.
- **@hai3/framework** (`packages/framework/src/plugins/microfrontends/`): Microfrontends plugin gains host share scope bootstrap logic.
- **MFE manifests** (`src/mfe_packages/*/mfe.json`): Expanded `sharedDependencies` arrays.
- **MFE vite configs** (`src/mfe_packages/*/vite.config.ts`): Must be kept in sync with manifest `sharedDependencies` so the build emits the corresponding `__federation_shared_*` chunks.
- **Bundle size**: Expected reduction from ~8-10 MB per MFE to ~50-100 KB per MFE when versions align (the common case in monorepo development).
- **Rollback**: Revert to `init({})` — sharing becomes non-functional (current state) but no correctness impact. MFEs continue to work by loading their own bundled copies.

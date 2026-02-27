## Context

MFE shared dependency sharing is completely non-functional. The `@originjs/vite-plugin-federation` runtime provides a sharing mechanism through `globalThis.__federation_shared__`, but it requires the host to pass a populated `shareScope` object to each remote's `init()` function. Currently, `MfeHandlerMF.loadRemoteContainer()` passes `init({})` — an empty object — so the runtime always falls back to loading each MFE's own bundled copies.

Additionally, the federation runtime does NOT register locally-downloaded bundles back into `globalThis.__federation_shared__`. When MFE-A downloads react because nothing was available, MFE-B will not find it in the global scope and will download its own copy.

The screensets spec already requires `container.init(sharedScope)` (line 442). The `SharedDependencyConfig` type and `MfManifest.sharedDependencies` field already exist. The implementation just needs to use them.

### Current State

```
Host vite.config.ts declares:
  shared: { react, react-dom, tailwindcss, @hai3/uikit }
  → Build emits __federation_shared_*.js chunks (tiny re-export stubs)
  → But no remotes declared, so no wrapShareModule() generated
  → globalThis.__federation_shared__ is never populated by the host

MfeHandlerMF.loadRemoteContainer():
  → Calls init({}) — empty share scope
  → Every MFE falls back to local bundles
  → 8-10 MB per MFE
```

### Key Constraints

- `manifest.sharedDependencies` is the sole source of truth for what an MFE can share (runtime, not build-time)
- Sharing means bundle/code reuse (download optimization), NOT instance sharing
- `singleton: false` is always the default for MfeHandlerMF — each MFE gets its own isolated instances from the shared code. This works because the federation runtime's `importShared()` uses the `get` function from the shareScope to obtain a *module factory*, then each MFE evaluates that factory independently into its own `moduleCache` (module-scoped, not global). The shared code is downloaded once but evaluated per-MFE, so module-level singletons like `storeInstance` in `@hai3/state` are created independently per MFE.
- The `@originjs/vite-plugin-federation` plugin does NOT implement `singleton` at runtime (the config value is silently ignored). The `singleton: false` behavior (independent evaluation per MFE) is the *default* behavior of the runtime — not a flag-controlled feature.

## Goals / Non-Goals

**Goals:**
- Enable functional shared dependency resolution so MFEs reuse already-loaded bundle code
- Host pre-populates the global share scope at startup so the first MFE benefits immediately
- MFE-loaded bundles are registered back into the global scope so subsequent MFEs can reuse them
- Expand MFE manifests to declare all commonly-used dependencies as sharable

**Non-Goals:**
- Changing the MFE isolation model — each MFE continues to get its own isolated instances
- Replacing `@originjs/vite-plugin-federation` with a different federation runtime
- Implementing `singleton: true` behavior (not implemented in the plugin and not needed for MfeHandlerMF)
- Optimizing the tailwindcss 3.9 MB chunk size (separate concern — the sharing mechanism reduces duplication, not the base size)

## Decisions

### Decision 1: MfeHandlerMF constructs shareScope from globalThis.__federation_shared__

**Choice:** `MfeHandlerMF.loadRemoteContainer()` reads `manifest.sharedDependencies`, builds a `shareScope` object from entries already present in `globalThis.__federation_shared__` that match the manifest's declared dependencies and semver ranges, and passes this to `init(shareScope)`.

**Rationale:** The manifest declares what the MFE CAN share. The global scope contains what's AVAILABLE. The intersection is what gets passed to `init()`. This keeps the manifest as the sole source of truth while leveraging whatever is already loaded.

**Version matching strategy:** The handler uses a minimal inline version matching implementation — no `semver` library dependency (preserving `@hai3/screensets` L1 zero-dependency policy). The matching rules are:
- **Caret prefix** (`^19.0.0`): major version must match, minor+patch must be ≥ the required version. This is the only range used in current MFE manifests.
- **Bare version** (`3.4.1`, no prefix): exact match only.
- **Omitted** (`requiredVersion` is undefined): any version matches — the first available version in the global scope is used. This is consistent with the federation runtime's own behavior when no version constraint is specified.

**Alternative considered:** Adding the `semver` npm package. Rejected — `@hai3/screensets` is an L1 SDK package with a strict zero-dependency policy. The caret-only matching covers all current manifest patterns. If more complex ranges are needed in the future, the matching logic can be extended inline.

**Alternative considered:** Having MfeHandlerMF hardcode a list of shared dependencies. Rejected — this couples the handler to specific packages and ignores the manifest contract.

**shareScope object format** (as expected by the federation runtime's `init()`):

```typescript
{
  [packageName: string]: {
    [version: string]: {
      get: () => Promise<() => Module>,
      loaded?: 1,
      scope?: string  // defaults to 'default'
    }
  }
}
```

### Decision 2: MfeHandlerMF registers MFE-loaded bundles back into globalThis.__federation_shared__

**Choice:** After `init(shareScope)` completes, the handler registers entries into `globalThis.__federation_shared__['default']` for packages listed in `manifest.sharedDependencies` that were NOT already in the shareScope passed to `init()` (i.e., the MFE fell back to its own bundled copy for these).

**Concrete mechanism:** The `ModuleFederationContainer` interface only exposes `get(module)` and `init(shared)` — `container.get()` is for *exposed* modules (e.g., `"./lifecycle-helloworld"`), NOT for shared dependencies. Instead, the handler uses the shareScope object itself as the registration source:

1. Before calling `init(shareScope)`, the handler records which packages were included in the shareScope (already available in the global scope).
2. After `init(shareScope)` completes, the federation runtime has populated the shareScope with the MFE's own bundled module getters for packages that were NOT already present (this is what `init()` does — it merges the container's shared modules into the shareScope).
3. The handler then copies any NEW entries from the shareScope (entries that were added by `init()`, not entries that were there before) into `globalThis.__federation_shared__['default']`.

This works because `init(shareScope)` mutates the passed shareScope object — the federation runtime writes its own shared module getters into it for any packages the container provides. The handler simply reads what `init()` added and promotes those entries to the global scope.

The version key for each entry comes from the shareScope structure itself (the runtime writes the actual version it provides).

**First-loaded-wins:** Registration only writes entries that don't already exist in the global scope. If the host or a prior MFE already registered the same package+version, the new entry is skipped.

**Rationale:** The federation runtime's `importShared()` writes to a per-MFE `moduleCache` but never to `globalThis.__federation_shared__`. Without this step, MFE-to-MFE sharing never works — only host-to-MFE sharing. The handler is the only component that knows when an MFE has finished loading and what it loaded.

**Alternative considered:** Modifying the federation runtime's `importShared()` to write back to the global scope. Rejected — patching third-party runtime code is fragile and would break on plugin updates.

**Alternative considered:** Only registering packages where the MFE fell back to its own bundle (didn't receive a shared version). Rejected — there's no API to distinguish what the MFE consumed vs. bundled, and registering all declared packages is harmless (first-loaded-wins prevents overwrites).

### Decision 3: Microfrontends plugin bootstraps the host's share scope in onInit()

**Choice:** The microfrontends plugin (`@hai3/framework`, L2) pre-populates `globalThis.__federation_shared__` in its `onInit()` hook, before any MFE is loaded.

**Rationale:** The microfrontends plugin already owns MFE initialization (builds the ScreensetsRegistry, registers handlers, sets up effects). Adding host share scope bootstrap here is a natural extension of its existing responsibility. The `onInit()` hook runs after the app is built but before any MFE loading actions are dispatched.

**Mechanism for discovering host bundles:** The host's `@originjs/vite-plugin-federation` build already emits `__federation_shared_*.js` chunks that are tiny re-export stubs pointing to the host's vendor chunks. However, since the host config has no `remotes`, the plugin does NOT generate the `wrapShareModule()` code that would normally construct getters for these chunks.

The bootstrap step needs to construct the shareScope entries manually. Two approaches:

**(a) Build-time generated manifest** — A Vite plugin (or post-build script) emits a JSON file listing the host's shared packages with their versions and chunk URLs. The microfrontends plugin reads this at runtime.

**(b) Static declaration in MicrofrontendsConfig** — The `microfrontends()` config accepts a `hostSharedDependencies` list (package name + version + getter). The host app declares what it offers.

**Recommended: (b) — static declaration in config.** This avoids build tooling changes, is explicit, and the host app already knows its own dependency versions. The microfrontends plugin config already accepts `mfeHandlers`; adding `hostSharedDependencies` is consistent.

```typescript
microfrontends({
  mfeHandlers: [new MfeHandlerMF(gtsPlugin)],
  hostSharedDependencies: [
    { name: 'react', version: '19.2.4', get: () => import('react').then(m => () => m) },
    { name: 'react-dom', version: '19.2.4', get: () => import('react-dom').then(m => () => m) },
    { name: 'tailwindcss', version: '3.4.1', get: () => import('tailwindcss').then(m => () => m) },
    { name: '@hai3/uikit', version: '0.1.0', get: () => import('@hai3/uikit').then(m => () => m) },
    // ... additional shared deps
  ],
})
```

**Alternative considered:** Automatically introspecting what's loaded via the federation plugin's runtime globals. Rejected — the host's federation plugin doesn't populate these globals when no `remotes` are declared, and relying on plugin internals is fragile.

### Decision 4: Host vite.config.ts shared config remains for build-time chunk emission

**Choice:** The host's `vite.config.ts` `federation({ shared: {...} })` config stays. It controls which `__federation_shared_*.js` chunks the build emits. The runtime sharing is independently controlled by the microfrontends plugin bootstrap (Decision 3) and the handler's shareScope construction (Decision 1).

**Rationale:** The build-time config and runtime config serve different purposes:
- **Build-time** (`vite.config.ts`): Controls what chunks are emitted and how they're split
- **Runtime** (`microfrontends()` config + manifest): Controls what's actually shared at load time

These can evolve independently. The build-time config may eventually be simplified or removed if the host bootstrap mechanism proves sufficient, but that's a future optimization.

### Decision 5: MFE vite.config.ts shared array must match manifest sharedDependencies

**Choice:** Each MFE's `vite.config.ts` `shared` array must list the same packages as its `mfe.json` `manifest.sharedDependencies`. If a package is in the manifest but not in the vite `shared` array, the build won't emit a `__federation_shared_*` chunk for it, and the federation runtime's `importShared()` won't know about it.

**Rationale:** The vite config drives the build (what chunks are emitted and what the `moduleMap` in the federation runtime contains). The manifest drives the runtime (what the handler passes to `init()`). They must be aligned. In the future, a build plugin could auto-generate the vite `shared` array from `mfe.json`, but for now manual sync is acceptable.

### Decision 6: No MfeVersionMismatchError — graceful fallback only

**Choice:** Drop `MfeVersionMismatchError`. Version mismatches are never errors. When the handler constructs the shareScope and no compatible version is found for a dependency, the MFE silently falls back to its own bundled copy. The handler MAY log a debug-level message noting the fallback, but no warning or error is raised.

**Rationale:** MFEs always bundle their own local fallback copies (`import: true` is the default in `@originjs/vite-plugin-federation`). A version mismatch simply means the MFE uses its own copy instead of the shared one — a bigger download, but fully functional. Since sharing is a download optimization (not a correctness requirement), there is no error condition.

**Spec change required:** The existing microfrontends spec (lines 346-380) defines "MFE Version Validation" scenarios with warnings for minor mismatches and `MfeVersionMismatchError` for major mismatches. These scenarios should be removed or replaced with: "WHEN version mismatch occurs, THEN the MFE SHALL fall back to its own bundled copy, AND no error SHALL be thrown."

### Decision 7: Expanded sharedDependencies list for MFE manifests

**Choice:** MFE manifests should declare all dependencies that both the host and MFEs commonly use:

| Package | Already shared | Add? | Rationale |
|---------|---------------|------|-----------|
| `react` | Yes | — | Already in manifest |
| `react-dom` | Yes | — | Already in manifest |
| `tailwindcss` | Yes | — | Already in manifest |
| `@hai3/uikit` | Yes | — | Already in manifest |
| `@hai3/react` | No | **Yes** | ~1.3 MB with transitive deps |
| `@hai3/framework` | No | **Yes** | ~44 KB, pulled by @hai3/react |
| `@hai3/state` | No | **Yes** | ~8 KB + RTK (~200 KB) |
| `@hai3/screensets` | No | **Yes** | ~84 KB |
| `@hai3/api` | No | **Yes** | ~68 KB (axios bundled inside) |
| `@hai3/i18n` | No | **Yes** | ~24 KB |
| `@reduxjs/toolkit` | No | **Yes** | ~200 KB, pulled by @hai3/state |
| `react-redux` | No | **Yes** | ~30 KB |
| `axios` | No | **No** | Already bundled inside `@hai3/api` dist — not a direct dependency of MFEs |

All with `singleton: false`. Each MFE gets its own isolated instances from the shared code. The sharing is purely a download optimization.

**Note:** Adding these to `sharedDependencies` in the manifest also requires adding them to the MFE's `vite.config.ts` `shared` array (Decision 5).

## Risks / Trade-offs

**[Risk] Federation runtime caches shared modules as single evaluation, breaking instance isolation** → The `@originjs/vite-plugin-federation` `importShared()` stores resolved modules in a per-MFE `moduleCache` (module-scoped, not global). The shareScope `get` function returns a *module factory* (`() => Promise<() => Module>`). Each MFE's `importShared()` calls this factory and evaluates the result into its own `moduleCache`, producing independent module-level singletons (e.g., `storeInstance` in `@hai3/state`). The shared *code* is downloaded once, but *evaluated* independently per MFE. If this assumption proves wrong for specific packages, the handler can override the sharing behavior for those packages by not including them in the shareScope (graceful fallback to bundled copies).

**[Risk] MFE vite config and manifest sharedDependencies drift out of sync** → Manual synchronization is required. Mitigation: document the requirement clearly and consider a future lint rule or build plugin that validates alignment.

**[Risk] Host bootstrap config becomes stale when dependency versions change** → The `hostSharedDependencies` in the microfrontends config includes explicit versions. When the host updates a dependency version (e.g., react 19.2.4 → 19.3.0), the config must be updated too. Mitigation: versions can be imported from package.json or derived from the installed packages at build time.

**[Risk] Large number of shareScope entries slows init()** → The `init()` function iterates over all entries in the shareScope. With ~12 packages this is negligible. Only becomes a concern with hundreds of shared packages, which is unlikely.

**[Trade-off] Static host config vs. automatic discovery** → Chose explicit `hostSharedDependencies` config over automatic introspection. This means the host must declare what it shares, but it avoids fragile reliance on federation plugin internals.

**[Trade-off] Per-MFE post-load registration adds handler complexity** → The handler must track what each MFE loaded and register it globally. This adds ~20-30 lines of code to the handler but enables MFE-to-MFE sharing, which is critical when multiple MFEs share the same non-host dependency versions.

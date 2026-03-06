## Why

Extension domain contracts (shared properties, actions, lifecycle stages) and shared property propagation are hardcoded in the framework layer. The `microfrontends()` plugin in `@hai3/framework` bakes in 4 domain definitions with fixed `[theme, language]` shared properties and hardcodes event-to-property propagation in `onInit`. This prevents HAI3-based projects created via the CLI from customizing domain contracts, adding custom shared properties, defining additional domains, or opting out of properties they don't need (e.g., a project without theming).

GitHub Issue: [HAI3org/HAI3#204](https://github.com/HAI3org/HAI3/issues/204)

## What Changes

- **BREAKING**: `microfrontends()` plugin accepts `domains: ExtensionDomain[]` as a required config parameter. The base domain definitions (`screenDomain`, `sidebarDomain`, `popupDomain`, `overlayDomain`) become convenience exports that projects explicitly pass in, not auto-applied defaults.
- **BREAKING**: Theme propagation moves from `microfrontends()` plugin to `themes()` plugin. Language propagation moves from `microfrontends()` plugin to `i18n()` plugin. Each plugin owns the full lifecycle of its shared property data, including pushing values to domains.
- **BREAKING**: Replace `updateDomainProperty()`/`updateDomainProperties()` with `updateSharedProperty(propertyId, value)` on `ScreensetsRegistry` (L1). Shared properties have global values — a property means the same thing across all domains that declare it. `updateSharedProperty` broadcasts a value to all registered domains whose `sharedProperties` array includes the given property ID. `getDomainProperty()` remains as the read path. The per-domain write methods are removed because they imply per-domain property values, which is not the model.
- `createHAI3App()` / full preset passes config through without injecting defaults. No implicit domain injection — projects explicitly declare which domains they use. The CLI template scaffolds the standard 4 domains in the project's source code (visible, editable, tree-shakeable).
- Shared property constants (`HAI3_SHARED_PROPERTY_THEME`, `HAI3_SHARED_PROPERTY_LANGUAGE`) remain as vocabulary exports through the re-export chain (screensets -> framework -> react). They stop implying automatic behavior.
- Infrastructure action constants (`HAI3_ACTION_LOAD_EXT`, `HAI3_ACTION_MOUNT_EXT`, `HAI3_ACTION_UNMOUNT_EXT`) are unaffected. They are handled by `ExtensionLifecycleActionHandler` in L1, wired automatically during `registerDomain()`.
- Existing MFEs that act as nested hosts (parent runtimes with their own child MFEs) must manually forward shared properties from the parent bridge to their child registry using `bridge.subscribeToProperty()` followed by `registry.updateSharedProperty()`. This is a one-liner per property, enabled by the new `updateSharedProperty` method.

## Capabilities

### New Capabilities

- `shared-property-broadcast`: Registry-level method (`updateSharedProperty`) that broadcasts a shared property value to all registered domains declaring interest in that property via their `sharedProperties` array. Decouples property producers (plugins) from domain topology (which domains exist and what they accept).
- `configurable-domain-topology`: The `microfrontends()` plugin accepts domain definitions as configuration, allowing projects to customize the full domain contract: shared properties, action types (`actions` for actions the domain receives, `extensionsActions` for actions MFEs can send back), lifecycle stages, timeouts, and extension type constraints. Projects can extend base domains, override parts of their contracts, or define entirely new domains. Custom domain actions are already routed to the `customActionHandler` callback provided at `registerDomain()` time; this change makes it practical by letting the domain definition declare those action types upfront.

### Modified Capabilities

- `microfrontends`: The plugin stops hardcoding domain definitions and shared property propagation. Domains become a config parameter. Theme/language event listeners move to their owning plugins.
- `shared-property-validation`: `updateSharedProperty` validates each value against the property's GTS-derived schema using the existing `TypeSystemPlugin.register()` + `TypeSystemPlugin.validateInstance()` pattern before storing and broadcasting.

## Impact

- **@hai3/screensets (L1)**: Replace `updateDomainProperty()`/`updateDomainProperties()` with `updateSharedProperty()` on `ScreensetsRegistry` abstract class and `DefaultScreensetsRegistry` implementation. `getDomainProperty()` remains. No dependency changes.
- **@hai3/framework (L2)**: Modify `microfrontends()` plugin config interface, remove hardcoded propagation from `onInit`. Modify `themes()` and `i18n()` plugins to propagate their own properties. Modify `createHAI3App` / full preset to pass config through without defaults.
- **@hai3/react (L3)**: Re-export new types/exports from framework. No logic changes.
- **base-domains.ts**: Domain objects remain as convenience exports but are no longer automatically applied.
- **Existing tests**: Tests that rely on automatic theme/language propagation from the microfrontends plugin will need adjustment.
- **CLI templates**: May need updates to explicitly pass domain config.
- **Existing MFEs (nested hosts)**: MFEs that create child registries must add manual bridge-to-registry property forwarding.

## Future Work

**Automatic shared property propagation for nested MFEs** — The manual bridge forwarding pattern works but adds boilerplate for every nested MFE host. A future change should automate this via:

- A `serve(lifecycle)` method on `ScreensetsRegistryFactory` (public abstract) that wraps the MFE lifecycle and returns a `ServedMfeEntry`. The wrapped `mount()` caches the bridge instance on the factory (the bridge is available as mount's parameter). Later, when the MFE calls `build(config)`, the factory detects the cached bridge and internally delegates to `buildChild(config, bridge)`, producing a child registry pre-wired to the parent bridge. This solves the config-availability problem: `serve()` only needs the lifecycle, `build()` only needs the config, and the factory connects them via internal cached state. Per-MFE module isolation (blob URLs) ensures no cross-contamination of cached bridges between MFE instances.
- A `ServedMfeEntry` abstract class (with non-exported concrete implementation) that enforces all MFEs go through `serve()`. TypeScript prevents direct instantiation of the abstract class, and the concrete subclass is `@internal` (not exported), so the only way to produce a `ServedMfeEntry` is via `serve()`.
- An internal `ChildScreensetsRegistryFactory` (extending `ScreensetsRegistryFactory`, `@internal`) with a `buildChild(config, bridge)` method for bridge-aware registry creation. The public `ScreensetsRegistryFactory` interface stays clean — no bridge parameter on `build()`, no config parameter on `serve()`.

This will be tracked as a separate GitHub issue after this change is archived.

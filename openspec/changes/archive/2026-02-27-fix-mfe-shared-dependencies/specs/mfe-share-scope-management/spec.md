## ADDED Requirements

### Requirement: MfeHandlerMF Share Scope Construction

MfeHandlerMF SHALL construct a `shareScope` object from `globalThis.__federation_shared__` filtered by the manifest's `sharedDependencies`, and pass it to `container.init(shareScope)` instead of an empty object.

#### Scenario: Handler constructs shareScope from manifest and global scope

- **WHEN** `MfeHandlerMF.loadRemoteContainer()` loads a new container (not cached)
- **THEN** the handler SHALL read `manifest.sharedDependencies` from the resolved MfManifest
- **AND** for each entry in `sharedDependencies`, the handler SHALL check `globalThis.__federation_shared__['default']` for a matching package name
- **AND** if a matching package is found, the handler SHALL use semver matching against the entry's `requiredVersion` to find a compatible version
- **AND** compatible entries SHALL be included in the `shareScope` object passed to `container.init(shareScope)`
- **AND** incompatible or missing entries SHALL be omitted from the `shareScope` (the MFE falls back to its own bundled copy)

#### Scenario: Missing requiredVersion treated as any-version match

- **WHEN** a `sharedDependencies` entry omits `requiredVersion`
- **THEN** the handler SHALL treat it as "any version matches"
- **AND** the first available version in the global scope for that package name SHALL be used

#### Scenario: Empty global scope results in empty shareScope

- **WHEN** `globalThis.__federation_shared__` is empty or undefined
- **THEN** the handler SHALL pass an empty `shareScope` object to `container.init()`
- **AND** the MFE SHALL fall back to its own bundled copies for all dependencies
- **AND** no error SHALL be thrown

#### Scenario: Cached container skips init

- **WHEN** a container for the same `remoteName` is already cached
- **THEN** the handler SHALL return the cached container without calling `init()` again
- **AND** share scope construction SHALL NOT be repeated

### Requirement: Post-Load Registration of MFE Bundles

After an MFE container is initialized, MfeHandlerMF SHALL register the MFE's available shared modules back into `globalThis.__federation_shared__` so subsequent MFEs can reuse them.

#### Scenario: MFE shared modules registered into global scope after init

- **WHEN** `container.init(shareScope)` completes successfully
- **THEN** the handler SHALL register the MFE's shared module getters into `globalThis.__federation_shared__['default']`
- **AND** each registered entry SHALL include the package name, version, and a `get` function that returns the module
- **AND** existing entries in the global scope SHALL NOT be overwritten (first-loaded wins)

#### Scenario: Subsequent MFE reuses previously registered modules

- **GIVEN** MFE-A has been loaded and its shared modules registered into `globalThis.__federation_shared__`
- **WHEN** MFE-B is loaded with a `sharedDependencies` entry matching a package and version registered by MFE-A
- **THEN** MFE-B's `shareScope` SHALL include MFE-A's registered module getter
- **AND** MFE-B SHALL reuse MFE-A's bundle code instead of downloading its own copy

#### Scenario: Concurrent MFE loading results in independent fallback

- **GIVEN** `globalThis.__federation_shared__` is empty (no host bootstrap or no prior MFE loaded)
- **WHEN** MFE-A and MFE-B are loaded concurrently (both construct their shareScope before either completes post-load registration)
- **THEN** both MFEs SHALL construct empty shareScopeS and fall back to their own bundled copies
- **AND** whichever MFE completes first SHALL register its modules into the global scope
- **AND** MFEs loaded after both complete SHALL benefit from the registered modules
- **AND** no error SHALL be thrown in the concurrent case

#### Scenario: Registration does not overwrite host-provided modules

- **GIVEN** the host has pre-populated `globalThis.__federation_shared__` with its own modules
- **WHEN** an MFE loads and its bundled version matches a host-provided version
- **THEN** the handler SHALL NOT overwrite the host's entry in the global scope
- **AND** the host-provided module SHALL remain the authoritative source for that package and version

### Requirement: Share Scope Object Format

The `shareScope` object passed to `container.init()` SHALL conform to the format expected by the `@originjs/vite-plugin-federation` runtime.

#### Scenario: ShareScope entry structure

- **WHEN** the handler constructs a shareScope entry for a package
- **THEN** the entry SHALL have the structure: `{ [packageName]: { [version]: { get: () => Promise<() => Module>, loaded?: 1, scope?: string } } }`
- **AND** `get` SHALL be a function that returns a promise resolving to a module factory
- **AND** `scope` SHALL default to `'default'` if omitted

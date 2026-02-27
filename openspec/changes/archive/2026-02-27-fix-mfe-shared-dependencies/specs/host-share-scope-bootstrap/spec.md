## ADDED Requirements

### Requirement: Host Share Scope Bootstrap via Microfrontends Plugin

The microfrontends plugin SHALL accept an optional `hostSharedDependencies` configuration and pre-populate `globalThis.__federation_shared__` in its `onInit()` hook, before any MFE is loaded.

#### Scenario: MicrofrontendsConfig accepts hostSharedDependencies

- **WHEN** configuring the microfrontends plugin
- **THEN** `MicrofrontendsConfig` SHALL accept an optional `hostSharedDependencies` field
- **AND** `hostSharedDependencies` SHALL be an array of `HostSharedDependency` objects
- **AND** each `HostSharedDependency` SHALL include `name` (string), `version` (string), and `get` (function conforming to the shareScope `get` format: `() => Promise<() => Module>`)

```typescript
microfrontends({
  mfeHandlers: [new MfeHandlerMF(gtsPlugin)],
  hostSharedDependencies: [
    { name: 'react', version: '19.2.4', get: () => import('react').then(m => () => m) },
    { name: 'react-dom', version: '19.2.4', get: () => import('react-dom').then(m => () => m) },
    { name: 'tailwindcss', version: '3.4.1', get: () => import('tailwindcss').then(m => () => m) },
    { name: '@hai3/uikit', version: '0.1.0', get: () => import('@hai3/uikit').then(m => () => m) },
  ],
})
```

#### Scenario: Plugin pre-populates global scope in onInit

- **WHEN** the microfrontends plugin's `onInit()` hook executes
- **AND** `hostSharedDependencies` is provided in the config
- **THEN** the plugin SHALL write each entry into `globalThis.__federation_shared__['default']`
- **AND** each entry SHALL include the package name, version, and `get` function
- **AND** the global scope SHALL be populated BEFORE any MFE loading actions are dispatched

#### Scenario: No hostSharedDependencies provided

- **WHEN** the microfrontends plugin is configured without `hostSharedDependencies`
- **THEN** the plugin SHALL NOT modify `globalThis.__federation_shared__`
- **AND** MFEs SHALL still function by loading their own bundled copies (no sharing optimization from the host)

#### Scenario: First MFE benefits from host pre-populated scope

- **GIVEN** the host has pre-populated `globalThis.__federation_shared__` with react@19.2.4
- **WHEN** the first MFE is loaded with `sharedDependencies` including `{ name: 'react', requiredVersion: '^19.0.0' }`
- **THEN** the handler SHALL find react@19.2.4 in the global scope
- **AND** the MFE SHALL reuse the host's react bundle instead of downloading its own copy

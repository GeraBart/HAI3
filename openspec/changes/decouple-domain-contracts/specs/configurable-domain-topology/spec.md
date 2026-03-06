## ADDED Requirements

### Requirement: Configurable Domain Topology

The `microfrontends()` plugin SHALL accept an optional `domains?: ExtensionDomain[]` configuration parameter that declares the project's extension domain definitions. No implicit defaults SHALL be injected by the plugin or the preset.

#### Scenario: Explicit domain configuration

- **WHEN** building an app with `microfrontends({ domains: [screenDomain, sidebarDomain] })`
- **THEN** the plugin SHALL store the provided domain definitions
- **AND** the plugin SHALL expose the stored domain definitions so the app (or preset) can read them back
- **AND** only the explicitly provided domains SHALL be available as pre-declared domain contracts
- **AND** no additional domains SHALL be injected by the plugin
- **AND** the plugin SHALL NOT auto-register the domains — registration happens when the app calls `registerDomain()` at runtime

#### Scenario: App consumes stored domains for registration

- **WHEN** the app (or preset) reads the stored domain definitions from the microfrontends plugin config
- **THEN** the app SHALL iterate the stored domains and call `registerDomain(domain, containerProvider)` for each one
- **AND** the app SHALL control *when* registration happens and *which container provider* is used per domain
- **AND** domains not present in the stored config MAY still be registered dynamically via `registerDomain()` from any source

#### Scenario: No domains configured

- **WHEN** building an app with `microfrontends()` or `microfrontends({})` (no `domains` parameter)
- **THEN** the plugin SHALL operate with no pre-declared domains
- **AND** domains MAY still be registered dynamically at runtime via `registerDomain()`
- **AND** this SHALL NOT be treated as an error

#### Scenario: Custom domain with extended shared properties

- **WHEN** a project defines a custom domain extending a base domain with additional shared properties:
```typescript
const myScreenDomain = {
  ...screenDomain,
  sharedProperties: [...screenDomain.sharedProperties, MY_USER_CONTEXT_PROP],
};
microfrontends({ domains: [myScreenDomain] })
```
- **THEN** the custom domain SHALL be accepted with its full contract including the additional shared property
- **AND** contract validation SHALL use the custom domain's `sharedProperties` array when validating MFE entries

#### Scenario: Custom domain with extended action types

- **WHEN** a project defines a domain with custom action types in `actions` or `extensionsActions`:
```typescript
const myDomain = {
  ...sidebarDomain,
  actions: [...sidebarDomain.actions, MY_CUSTOM_ACTION],
  extensionsActions: [MY_MFE_SEND_ACTION],
};
```
- **THEN** the domain SHALL be accepted with the custom action types
- **AND** infrastructure actions (load_ext, mount_ext, unmount_ext) SHALL continue to be handled by `ExtensionLifecycleActionHandler` automatically
- **AND** non-infrastructure actions in `actions` SHALL be routed to the `customActionHandler` provided at `registerDomain()` time
- **AND** contract validation SHALL check `extensionsActions` against MFE entry `actions` arrays

#### Scenario: Entirely new domain

- **WHEN** a project defines an entirely new domain (not based on base domain objects):
```typescript
const drawerDomain: ExtensionDomain = {
  id: 'gts.myproject.ext.domain.v1~myproject.drawer.v1',
  actions: [HAI3_ACTION_LOAD_EXT, HAI3_ACTION_MOUNT_EXT, HAI3_ACTION_UNMOUNT_EXT],
  extensionsActions: [],
  sharedProperties: [MY_USER_CONTEXT_PROP],
  defaultActionTimeout: 15000,
  lifecycleStages: [...],
  extensionsLifecycleStages: [...],
  lifecycle: undefined,
};
```
- **THEN** the new domain SHALL be accepted and usable via `registerDomain()`
- **AND** all standard domain capabilities (lifecycle, actions chains, contract validation) SHALL apply

#### Scenario: Preset passes config through without defaults

- **WHEN** `createHAI3App({ microfrontends: { domains: [screenDomain] } })` is called
- **THEN** the full preset SHALL forward the provided `microfrontends` config to the `microfrontends()` plugin without modification
- **AND** no additional domains SHALL be injected by the preset

#### Scenario: createHAI3App with no microfrontends config

- **WHEN** `createHAI3App()` is called with no arguments or without `microfrontends` config
- **THEN** the full preset SHALL pass through to `microfrontends()` with no domain config
- **AND** no implicit domain definitions SHALL be injected

### Requirement: Base Domain Convenience Exports

The system SHALL continue to export `screenDomain`, `sidebarDomain`, `popupDomain`, and `overlayDomain` as convenience constants through the re-export chain (screensets -> framework -> react). These are data values, not automatically applied behavior.

#### Scenario: Base domains available as imports from highest layer

- **WHEN** a project imports from `@hai3/react` (the highest layer for React projects)
- **THEN** `screenDomain`, `sidebarDomain`, `popupDomain`, and `overlayDomain` SHALL be available as named exports
- **AND** these exports SHALL be `ExtensionDomain` objects with the standard HAI3 contracts (shared properties, actions, lifecycle stages)
- **AND** importing them SHALL NOT cause any automatic registration or side effects

#### Scenario: Tree-shaking of unused domains

- **WHEN** a project imports only `screenDomain` and `sidebarDomain` but not `popupDomain` or `overlayDomain`
- **THEN** unused domain objects SHALL be eligible for tree-shaking by the bundler
- **AND** no code related to unused domains SHALL be included in the production bundle

## ADDED Requirements

### Requirement: Type System Plugin Abstraction

The system SHALL abstract the Type System as a pluggable dependency.

#### Scenario: Plugin interface definition

- **WHEN** @hai3/screensets is imported
- **THEN** the package SHALL export a `TypeSystemPlugin` interface
- **AND** the interface SHALL define type ID operations (`parseTypeId`, `isValidTypeId`, `buildTypeId`)
- **AND** the interface SHALL define schema registry operations (`registerSchema`, `validateInstance`, `getSchema`)
- **AND** the interface SHALL define query operations (`query`, `listAll`)
- **AND** the interface SHALL define required compatibility checking (`checkCompatibility`)
- **AND** the interface SHALL define attribute access (`getAttribute`) for dynamic schema resolution

#### Scenario: GTS plugin as default implementation

- **WHEN** a developer imports `@hai3/screensets/plugins/gts`
- **THEN** the package SHALL export a `gtsPlugin` implementing `TypeSystemPlugin`
- **AND** the plugin SHALL use `@globaltypesystem/gts-ts` internally
- **AND** the plugin SHALL handle GTS type ID format: `gts.<vendor>.<package>.<namespace>.<type>.v<MAJOR>[.<MINOR>]~`

#### Scenario: GTS type ID validation

- **WHEN** validating a GTS type ID
- **THEN** the plugin SHALL accept valid type IDs like `gts.hai3.screensets.mfe.entry.v1~`
- **AND** the plugin SHALL reject invalid formats like `gts.hai3.mfe.v1~` (missing segments)
- **AND** the plugin SHALL reject formats without trailing tilde
- **AND** the plugin SHALL reject formats without version prefix "v"

#### Scenario: Plugin requirement at initialization

- **WHEN** creating a ScreensetsRuntime
- **THEN** the `ScreensetsRuntimeConfig` SHALL require a `typeSystem` parameter
- **AND** the runtime SHALL use the plugin for all type ID operations
- **AND** the runtime SHALL use the plugin for schema validation
- **AND** initialization without a plugin SHALL throw an error

#### Scenario: HAI3 type registration via plugin

- **WHEN** the ScreensetsRuntime initializes with a plugin
- **THEN** the runtime SHALL register HAI3 MFE types via `plugin.registerSchema()`
- **AND** registered types SHALL include 6 core types:
  - `gts.hai3.screensets.mfe.entry.v1~` (MfeEntry - Abstract Base)
  - `gts.hai3.screensets.ext.domain.v1~` (ExtensionDomain)
  - `gts.hai3.screensets.ext.extension.v1~` (Extension)
  - `gts.hai3.screensets.ext.shared_property.v1~` (SharedProperty)
  - `gts.hai3.screensets.ext.action.v1~` (Action)
  - `gts.hai3.screensets.ext.actions_chain.v1~` (ActionsChain)
- **AND** registered types SHALL include 2 MF-specific types:
  - `gts.hai3.screensets.mfe.mf.v1~` (MfManifest - Standalone)
  - `gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1` (MfeEntryMF - Derived)

#### Scenario: Custom plugin implementation

- **WHEN** a developer implements a custom `TypeSystemPlugin`
- **THEN** the implementation SHALL work with the ScreensetsRuntime
- **AND** type ID format SHALL be determined by the custom plugin
- **AND** validation behavior SHALL be determined by the custom plugin

#### Scenario: TypeMetadata extraction from type ID

- **WHEN** parsing a type ID like `gts.hai3.screensets.mfe.entry.v1~` via the plugin
- **THEN** the system SHALL extract `vendor` as "hai3"
- **AND** the system SHALL extract `package` as "screensets"
- **AND** the system SHALL extract `namespace` as "mfe"
- **AND** the system SHALL extract `type` as "entry"
- **AND** the system SHALL extract `version.major` as 1
- **AND** the system SHALL store the full `typeId`

#### Scenario: TypeMetadata extraction with minor version

- **WHEN** parsing a type ID like `gts.hai3.screensets.mfe.entry.v1.2~` via the plugin
- **THEN** the system SHALL extract `version.major` as 1
- **AND** the system SHALL extract `version.minor` as 2

#### Scenario: x-gts-ref validation in schemas

- **WHEN** validating a schema with `x-gts-ref` property
- **THEN** the system SHALL verify referenced type IDs exist in the registry
- **AND** the system SHALL validate that referenced type IDs follow the correct format
- **AND** wildcard patterns like `gts.hai3.screensets.mfe.entry.v1~*` SHALL match any instance of that type

#### Scenario: Attribute access via plugin

- **WHEN** calling `plugin.getAttribute(typeId, path)`
- **THEN** the plugin SHALL resolve the property path from the type's registered schema
- **AND** the result SHALL indicate whether the attribute was resolved
- **AND** the result SHALL contain the value if resolved
- **AND** the result SHALL contain an error message if not resolved

#### Scenario: GTS attribute selector format

- **WHEN** using the GTS plugin's getAttribute method
- **THEN** the method SHALL support GTS attribute selector syntax: `typeId@propertyPath`
- **AND** nested paths SHALL be supported (e.g., `typeId@property.nested.field`)
- **AND** the method SHALL work with derived types (e.g., `gts.hai3.screensets.ext.domain.v1~hai3.layout.domain.sidebar.v1@extensionsUiMeta`)

### Requirement: Dynamic uiMeta Validation

The system SHALL validate Extension's uiMeta against its domain's extensionsUiMeta schema at runtime.

#### Scenario: uiMeta validation via attribute selector

- **WHEN** registering an extension binding
- **THEN** the ScreensetsRuntime SHALL resolve the domain's extensionsUiMeta via `plugin.getAttribute()`
- **AND** the runtime SHALL validate extension.uiMeta against the resolved schema
- **AND** validation failure SHALL prevent extension registration
- **AND** error message SHALL identify the uiMeta validation failure

#### Scenario: uiMeta validation with derived domains

- **WHEN** an extension binds to a derived domain (e.g., `gts.hai3.screensets.ext.domain.v1~hai3.layout.domain.sidebar.v1`)
- **THEN** the runtime SHALL use the derived domain's narrowed extensionsUiMeta schema
- **AND** uiMeta validation SHALL enforce the derived schema requirements

#### Scenario: uiMeta schema resolution failure

- **WHEN** the ScreensetsRuntime cannot resolve extensionsUiMeta from the domain
- **THEN** extension registration SHALL fail
- **AND** error message SHALL indicate the attribute resolution failure
- **AND** error SHALL include the domain type ID

### Requirement: MFE TypeScript Type System

The system SHALL define internal TypeScript types for microfrontend architecture using a symmetric contract model. All types extend `TypeMetadata` which contains data extracted from the type ID via the plugin.

#### Scenario: TypeMetadata interface

- **WHEN** defining any MFE type
- **THEN** the type SHALL extend `TypeMetadata` interface
- **AND** `TypeMetadata` SHALL include `typeId`, `vendor`, `package`, `namespace`, `type`, and `version`
- **AND** `version` SHALL contain `major` (required) and `minor` (optional)

#### Scenario: MFE entry type definition (abstract base)

- **WHEN** a vendor defines an MFE entry point
- **THEN** the entry SHALL conform to `MfeEntry` TypeScript interface (extends TypeMetadata)
- **AND** the entry SHALL specify requiredProperties (required), actions (required), and domainActions (required)
- **AND** the entry MAY specify optionalProperties (optional field)
- **AND** the entry SHALL NOT contain implementation-specific fields like `path` or loading details
- **AND** requiredProperties and optionalProperties (if present) SHALL reference SharedProperty type IDs
- **AND** actions and domainActions SHALL reference Action type IDs
- **AND** `MfeEntry` SHALL be the abstract base type for all entry contracts

#### Scenario: MFE entry MF type definition (derived for Module Federation)

- **WHEN** a vendor creates an MFE entry for Module Federation 2.0
- **THEN** the entry SHALL conform to `MfeEntryMF` TypeScript interface (extends MfeEntry)
- **AND** the entry SHALL include manifest (reference to MfManifest type ID)
- **AND** the entry SHALL include exposedModule (federation exposed module name)
- **AND** the entry SHALL inherit all contract fields from MfeEntry base

#### Scenario: MF manifest type definition (standalone)

- **WHEN** a vendor defines a Module Federation manifest
- **THEN** the manifest SHALL conform to `MfManifest` TypeScript interface (extends TypeMetadata)
- **AND** the manifest SHALL include remoteEntry (URL to remoteEntry.js)
- **AND** the manifest SHALL include remoteName (federation container name)
- **AND** the manifest MAY include sharedDependencies (optional override configuration)
- **AND** the manifest MAY include entries (convenience field for discovery)
- **AND** multiple MfeEntryMF instances MAY reference the same manifest

#### Scenario: Extension domain type definition

- **WHEN** a host defines an extension domain
- **THEN** the domain SHALL conform to `ExtensionDomain` TypeScript interface (extends TypeMetadata)
- **AND** the domain SHALL specify sharedProperties, actions, extensionsActions, and extensionsUiMeta
- **AND** sharedProperties SHALL reference SharedProperty type IDs
- **AND** actions and extensionsActions SHALL reference Action type IDs
- **AND** extensionsUiMeta SHALL be a valid JSON Schema
- **AND** derived domains MAY narrow extensionsUiMeta through GTS type inheritance

#### Scenario: Extension binding type definition

- **WHEN** binding an MFE entry to a domain
- **THEN** the binding SHALL conform to `Extension` TypeScript interface (extends TypeMetadata)
- **AND** the binding SHALL reference valid domain and entry type IDs
- **AND** domain SHALL reference an ExtensionDomain type ID (e.g., `gts.hai3.screensets.ext.domain.v1~`)
- **AND** entry SHALL reference an MfeEntry type ID (base or derived, e.g., `gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1`)
- **AND** uiMeta SHALL conform to the domain's extensionsUiMeta schema

#### Scenario: Shared property type definition

- **WHEN** defining a shared property
- **THEN** the property SHALL conform to `SharedProperty` TypeScript interface (extends TypeMetadata)
- **AND** the property SHALL specify name and schema
- **AND** the property SHALL NOT include a default value

#### Scenario: Action type definition

- **WHEN** defining an action type
- **THEN** the action SHALL conform to `Action` TypeScript interface (extends TypeMetadata)
- **AND** the action SHALL specify target (REQUIRED) - uses `x-gts-ref` to reference ExtensionDomain or Extension type ID
- **AND** the action SHALL specify type (REQUIRED) - uses `x-gts-ref: "/$id"` for self-reference to action's own type ID per GTS spec
- **AND** the action MAY specify payload (optional object)

#### Scenario: Actions chain type definition

- **WHEN** defining an actions chain
- **THEN** the chain SHALL conform to `ActionsChain` TypeScript interface (extends TypeMetadata)
- **AND** the chain SHALL contain an action INSTANCE (object conforming to Action schema)
- **AND** next and fallback SHALL be optional ActionsChain INSTANCES (recursive objects)
- **AND** the chain SHALL NOT contain type ID references for action, next, or fallback

### Requirement: MfeEntry Type Hierarchy

The system SHALL support a type hierarchy for MfeEntry to enable multiple loader implementations without parallel hierarchies.

#### Scenario: MfeEntry as abstract base

- **WHEN** defining the MfeEntry type
- **THEN** it SHALL be an abstract base type defining only the communication contract
- **AND** it SHALL NOT contain loader-specific fields
- **AND** derived types SHALL inherit all contract fields

#### Scenario: MfeEntryMF as derived type

- **WHEN** a Module Federation entry is created
- **THEN** it SHALL derive from MfeEntry
- **AND** it SHALL add manifest (reference to MfManifest)
- **AND** it SHALL add exposedModule (federation module name)
- **AND** it SHALL inherit requiredProperties, optionalProperties, actions, domainActions from base

#### Scenario: Future loader extensibility

- **WHEN** a new loader type is needed (e.g., ESM, Import Maps)
- **THEN** a new derived type (e.g., MfeEntryEsm) SHALL be created
- **AND** the new type SHALL extend MfeEntry
- **AND** the new type SHALL add loader-specific fields
- **AND** existing MfeEntry base and MfeEntryMF SHALL NOT be modified

#### Scenario: Extension binds to MfeEntry hierarchy

- **WHEN** an Extension references an entry
- **THEN** the entry field SHALL accept MfeEntry or any derived type
- **AND** contract validation SHALL use the base MfeEntry contract fields
- **AND** loading SHALL use the derived type's loader-specific fields

### Requirement: Contract Matching Validation

The system SHALL validate that MFE entries are compatible with extension domains before mounting.

#### Scenario: Valid contract matching

- **WHEN** registering an extension binding
- **AND** entry.requiredProperties is a subset of domain.sharedProperties
- **AND** entry.actions is a subset of domain.extensionsActions
- **AND** domain.actions is a subset of entry.domainActions
- **THEN** registration SHALL succeed

#### Scenario: Missing required property

- **WHEN** registering an extension binding
- **AND** entry requires a property not in domain.sharedProperties
- **THEN** registration SHALL fail with error type `missing_property`
- **AND** error message SHALL identify the missing property

#### Scenario: Unsupported entry action

- **WHEN** registering an extension binding
- **AND** entry emits an action not in domain.extensionsActions
- **THEN** registration SHALL fail with error type `unsupported_action`
- **AND** error message SHALL identify the unsupported action

#### Scenario: Unhandled domain action

- **WHEN** registering an extension binding
- **AND** domain emits an action not in entry.domainActions
- **THEN** registration SHALL fail with error type `unhandled_domain_action`
- **AND** error message SHALL identify the unhandled action

#### Scenario: Optional properties not required

- **WHEN** registering an extension binding
- **AND** entry.optionalProperties includes properties not in domain.sharedProperties
- **THEN** registration SHALL still succeed
- **AND** missing optional properties SHALL be undefined at runtime

### Requirement: Isolated State Instances

Each MFE instance SHALL have its own isolated HAI3 state instance separate from the host.

#### Scenario: MFE state isolation

- **WHEN** an MFE is loaded and mounted
- **THEN** the MFE SHALL receive its own HAI3 state instance
- **AND** the MFE state SHALL be independent of host state
- **AND** the MFE SHALL NOT have direct access to host state

#### Scenario: Host state isolation

- **WHEN** an MFE is mounted in the host
- **THEN** the host state SHALL NOT be modified by MFE state changes
- **AND** the host SHALL NOT have direct access to MFE state

#### Scenario: Shared properties propagation

- **WHEN** an MFE entry receives shared properties
- **THEN** properties SHALL be passed as read-only props
- **AND** properties SHALL be updated when host values change
- **AND** MFE SHALL NOT modify shared properties directly

### Requirement: Actions Chain Mediation

The system SHALL provide an ActionsChainsMediator to deliver action chains between domains and extensions, using the Type System plugin for validation.

**Note on terminology:**
- **ScreensetsRuntime**: Manages MFE lifecycle (loading, mounting, registration, validation)
- **ActionsChainsMediator**: Mediates action chain delivery between domains and extensions

#### Scenario: Action chain type ID validation

- **WHEN** ActionsChainsMediator receives an actions chain
- **THEN** mediator SHALL validate target type ID via `plugin.isValidTypeId()`
- **AND** mediator SHALL validate action type ID via `plugin.isValidTypeId()`
- **AND** invalid type IDs SHALL cause chain failure

#### Scenario: Action chain execution success path

- **WHEN** ActionsChainsMediator executes an actions chain
- **AND** target successfully handles the action
- **AND** chain has a `next` property
- **THEN** mediator SHALL execute the next chain
- **AND** next chain's target SHALL receive its action

#### Scenario: Action chain execution failure path

- **WHEN** ActionsChainsMediator executes an actions chain
- **AND** target fails to handle the action
- **AND** chain has a `fallback` property
- **THEN** mediator SHALL execute the fallback chain
- **AND** fallback chain's target SHALL receive its action

#### Scenario: Action chain termination

- **WHEN** ActionsChainsMediator executes an actions chain
- **AND** chain has no `next` property (on success)
- **OR** chain has no `fallback` property (on failure)
- **THEN** chain execution SHALL terminate
- **AND** mediator SHALL return completion result

#### Scenario: Action payload validation via plugin

- **WHEN** ActionsChainsMediator delivers an action
- **THEN** payload SHALL be validated via `plugin.validateInstance()`
- **AND** validation SHALL use the action's registered payloadSchema
- **AND** invalid payloads SHALL cause chain failure

#### Scenario: Extension registration

- **WHEN** an MFE entry is mounted
- **THEN** the entry SHALL register with ActionsChainsMediator
- **AND** registration SHALL provide action handler callback
- **AND** handler SHALL receive actions for that extension

#### Scenario: Extension unregistration

- **WHEN** an MFE entry is unmounted
- **THEN** the entry SHALL unregister from ActionsChainsMediator
- **AND** pending actions SHALL be cancelled or failed
- **AND** mediator SHALL not deliver actions to unmounted entries

### Requirement: MFE Loading via MfeEntryMF and MfManifest

The system SHALL load MFE bundles using the MfeEntryMF derived type which references an MfManifest.

#### Scenario: MfeEntryMF loading flow

- **WHEN** loading an MFE from its MfeEntryMF definition
- **THEN** the loader SHALL validate entry against MfeEntryMF schema
- **AND** the loader SHALL resolve manifest from entry.manifest reference
- **AND** the loader SHALL load Module Federation container from manifest.remoteEntry
- **AND** the loader SHALL get exposed module using entry.exposedModule

#### Scenario: Manifest resolution and caching

- **WHEN** resolving an MfManifest from type ID
- **THEN** the loader SHALL cache manifests to avoid redundant loading
- **AND** the loader SHALL validate manifest against MfManifest schema
- **AND** multiple MfeEntryMF referencing same manifest SHALL reuse cached container

#### Scenario: Module Federation container loading

- **WHEN** loading a Module Federation container
- **THEN** the loader SHALL load remoteEntry.js script
- **AND** the loader SHALL get container from window[manifest.remoteName]
- **AND** the loader SHALL initialize sharing scope
- **AND** the loader SHALL cache containers per remoteName

### Requirement: Hierarchical Extension Domains

The system SHALL support hierarchical extension domains where vendor screensets can define their own domains.

#### Scenario: Base layout domains

- **WHEN** HAI3 initializes
- **THEN** the system SHALL provide base layout domains
- **AND** domains SHALL include sidebar, popup, screen, and overlay
- **AND** each domain SHALL have defined contracts

#### Scenario: Vendor-defined extension domain

- **WHEN** a vendor screenset defines an extension domain
- **THEN** the domain SHALL be registered with the system
- **AND** MFE entries compatible with the domain SHALL be mountable
- **AND** domain contracts SHALL be validated at registration

#### Scenario: Nested extension mounting

- **WHEN** an MFE entry is mounted into a vendor-defined domain
- **AND** that domain is rendered within a base layout domain
- **THEN** the MFE SHALL render within the nested context
- **AND** actions chains SHALL traverse the hierarchy correctly

### Requirement: MFE Error Handling

The system SHALL provide consistent error handling for MFE operations.

#### Scenario: MFE bundle load failure

- **WHEN** MFE bundle fails to load from URL
- **THEN** the system SHALL display fallback UI in the domain slot
- **AND** error details SHALL be logged
- **AND** retry option SHALL be available

#### Scenario: Contract validation failure at load time

- **WHEN** MFE is loaded but contract validation fails
- **THEN** the MFE SHALL NOT be mounted
- **AND** detailed error SHALL be displayed
- **AND** error SHALL identify specific contract violations

#### Scenario: Action handler throws error

- **WHEN** an action handler throws during execution
- **THEN** the action SHALL be considered failed
- **AND** fallback chain SHALL be executed if defined
- **AND** error SHALL be logged with action context

### Requirement: Framework Plugin Propagation

The Type System plugin SHALL propagate from @hai3/screensets through @hai3/framework layers.

#### Scenario: Framework microfrontends plugin configuration

- **WHEN** configuring the @hai3/framework microfrontends plugin
- **THEN** the plugin configuration SHALL accept a `typeSystem` parameter
- **AND** the plugin SHALL pass the Type System plugin to the ScreensetsRuntime
- **AND** the same plugin instance SHALL be used throughout the application

#### Scenario: Base domains registration via plugin

- **WHEN** the framework microfrontends plugin initializes
- **AND** baseDomains are specified in configuration
- **THEN** base domain type IDs SHALL be built via `plugin.buildTypeId()`
- **AND** base domain schemas SHALL be registered via `plugin.registerSchema()`

#### Scenario: Plugin consistency across layers

- **WHEN** an MFE extension accesses the ScreensetsRuntime
- **THEN** all type ID operations SHALL use the same plugin instance
- **AND** type IDs from different layers SHALL be compatible
- **AND** schema validation SHALL be consistent

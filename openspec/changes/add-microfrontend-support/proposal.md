# Change: Add Microfrontend Support

## Why

HAI3 applications need to compose functionality from multiple independently deployed microfrontends (MFEs). Vendors can create MFE extensions that integrate into host applications through well-defined extension points. This enables:

1. **Independent Deployment**: MFEs can be deployed separately from the host application
2. **Vendor Extensibility**: Third parties can create extensions without modifying host code
3. **State Isolation**: Each MFE maintains its own HAI3 state instance with controlled communication
4. **Type-Safe Contracts**: Pluggable type system defines clear communication boundaries between host and MFE

## What Changes

### Core Architecture

Each MFE instance and host has its **own isolated HAI3 state instance**. Communication happens ONLY through a symmetric contract:
- **Shared properties** (parent to child, read-only)
- **Actions chain** delivered by ActionsChainsMediator to targets

### Architectural Decision: Type System Plugin Abstraction

The @hai3/screensets package abstracts the Type System as a **pluggable dependency**:

1. **Internal TypeScript Types**: The package works internally with TypeScript interfaces (`MfeEntry`, `MfeEntryMF`, `ExtensionDomain`, etc.)
2. **Required Plugin**: A `TypeSystemPlugin` must be provided at initialization
3. **Default Implementation**: GTS (`@globaltypesystem/gts-ts`) ships as the default plugin
4. **Extensibility**: Other Type System implementations can be plugged in

**Plugin Interface:**
```typescript
interface TypeSystemPlugin<TTypeId = string> {
  // Type ID operations
  parseTypeId(id: string): ParsedTypeId;
  isValidTypeId(id: string): boolean;
  buildTypeId(options: TypeIdOptions): TTypeId;

  // Schema registry
  registerSchema(typeId: TTypeId, schema: JSONSchema): void;
  validateInstance(typeId: TTypeId, instance: unknown): ValidationResult;
  getSchema(typeId: TTypeId): JSONSchema | undefined;

  // Query
  query(pattern: string, limit?: number): TTypeId[];

  // Compatibility (REQUIRED)
  checkCompatibility(oldTypeId: TTypeId, newTypeId: TTypeId): CompatibilityResult;

  // Attribute access (REQUIRED for dynamic schema resolution)
  getAttribute(typeId: TTypeId, path: string): AttributeResult;
}
```

### HAI3 Internal TypeScript Types

The MFE system uses these internal TypeScript interfaces. Each type includes `TypeMetadata` which contains data extracted from the type ID by the plugin:

```typescript
// Extracted from type ID parsing via plugin
interface TypeMetadata {
  readonly typeId: string;      // Full type ID
  readonly vendor: string;      // Extracted from typeId
  readonly package: string;     // Extracted from typeId
  readonly namespace: string;   // Extracted from typeId
  readonly type: string;        // Extracted from typeId
  readonly version: {           // Extracted from typeId
    major: number;
    minor?: number;
  };
}
```

**Core Types (6 types):**

| TypeScript Interface | Extends | Fields | Purpose |
|---------------------|---------|--------|---------|
| `MfeEntry` | `TypeMetadata` | `requiredProperties[], optionalProperties?[], actions[], domainActions[]` | Pure contract type (Abstract Base) |
| `ExtensionDomain` | `TypeMetadata` | `sharedProperties[], actions[], extensionsActions[], extensionsUiMeta` | Extension point contract |
| `Extension` | `TypeMetadata` | `domain: string, entry: string, uiMeta` | Extension binding |
| `SharedProperty` | `TypeMetadata` | `name, schema` | Property definition (NO default value) |
| `Action` | `TypeMetadata` | `target (x-gts-ref), type (x-gts-ref: "/$id"), payload?` | Action type with self-identifying type ID |
| `ActionsChain` | `TypeMetadata` | `action: Action, next?: ActionsChain, fallback?: ActionsChain` | Action chain for mediation (contains instances) |

**MF-Specific Types (2 types):**

| TypeScript Interface | Extends | Fields | Purpose |
|---------------------|---------|--------|---------|
| `MfManifest` | `TypeMetadata` | `remoteEntry, remoteName, sharedDependencies?, entries?` | Module Federation manifest (standalone) |
| `MfeEntryMF` | `MfeEntry` | `manifest: string, exposedModule: string` | Module Federation entry (derived) |

**Note on MfeEntry Design:** MfeEntry is a **pure contract** type (abstract base) that defines ONLY the communication interface (properties, actions). Derived types like `MfeEntryMF` add loader-specific fields. This separation ensures the same entry contract works with any loader and allows future loaders (ESM, Import Maps) to add their own derived types.

**Why This Structure Eliminates Parallel Hierarchies:**

The previous design had parallel hierarchies:
- `MfeDefinition` (abstract) -> `MfeDefinitionMF` (derived)
- `MfeEntry` (pure contract)

This created redundancy because both hierarchies needed to track entries. The new design:

1. **Makes MfeEntry the abstract base** for entry contracts
2. **Adds MfeEntryMF as derived** that references its MfManifest
3. **MfManifest is standalone** containing Module Federation config
4. **Extension binds to MfeEntry** (or its derived types)

Benefits:
- **No parallel hierarchies**: Only one entry hierarchy
- **Future-proof**: ESM loader would add `MfeEntryEsm` derived type with its own manifest reference
- **Clear ownership**: Entry owns its contract AND references its manifest

### GTS Type ID Format

The GTS type ID format is: `gts.<vendor>.<package>.<namespace>.<type>.v<MAJOR>[.<MINOR>]~`

### Type System Registration (via Plugin)

When using the GTS plugin, the following types are registered with properly structured GTS type IDs:

**Core Types (6 types):**

| GTS Type ID | Segments | Purpose |
|-------------|----------|---------|
| `gts.hai3.screensets.mfe.entry.v1~` | vendor=hai3, package=screensets, namespace=mfe, type=entry | Pure contract type (Abstract Base) |
| `gts.hai3.screensets.ext.domain.v1~` | vendor=hai3, package=screensets, namespace=ext, type=domain | Extension point contract |
| `gts.hai3.screensets.ext.extension.v1~` | vendor=hai3, package=screensets, namespace=ext, type=extension | Extension binding |
| `gts.hai3.screensets.ext.shared_property.v1~` | vendor=hai3, package=screensets, namespace=ext, type=shared_property | Property definition |
| `gts.hai3.screensets.ext.action.v1~` | vendor=hai3, package=screensets, namespace=ext, type=action | Action type with target and self-id |
| `gts.hai3.screensets.ext.actions_chain.v1~` | vendor=hai3, package=screensets, namespace=ext, type=actions_chain | Action chain for mediation |

**MF-Specific Types (2 types):**

| GTS Type ID | Segments | Purpose |
|-------------|----------|---------|
| `gts.hai3.screensets.mfe.mf.v1~` | vendor=hai3, package=screensets, namespace=mfe, type=mf | Module Federation manifest (standalone) |
| `gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1` | Derived from MfeEntry | Module Federation entry with manifest reference |

### GTS JSON Schema Definitions

Each of the 6 core types and 2 MF-specific types has a corresponding JSON Schema with proper `$id` and `x-gts-ref` references. The Action type uses `x-gts-ref: "/$id"` for self-reference per GTS spec:

```json
{
  "$id": "gts://gts.hai3.screensets.ext.action.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "target": {
      "type": "string",
      "oneOf": [
        { "x-gts-ref": "gts.hai3.screensets.ext.domain.v1~*" },
        { "x-gts-ref": "gts.hai3.screensets.ext.extension.v1~*" }
      ],
      "description": "Type ID of the target ExtensionDomain or Extension"
    },
    "type": {
      "x-gts-ref": "/$id",
      "description": "Self-reference to this action's type ID (the action's own $id)"
    },
    "payload": {
      "type": "object",
      "description": "Optional action payload"
    }
  },
  "required": ["target", "type"]
}
```

See `design.md` for complete JSON Schema definitions of all 8 types.

### MfeEntry Type Hierarchy

```
gts.hai3.screensets.mfe.entry.v1~ (Base - Abstract Contract)
  |-- requiredProperties: SharedProperty typeId[]
  |-- optionalProperties: SharedProperty typeId[]
  |-- actions: Action typeId[]
  |-- domainActions: Action typeId[]
  |
  +-- gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1 (Module Federation)
        |-- (inherits contract fields from base)
        |-- manifest: MfManifest typeId (reference to shared MF config)
        |-- exposedModule: string (federation exposed module name)

gts.hai3.screensets.mfe.mf.v1~ (Standalone - Module Federation Config)
  |-- remoteEntry: string (URL to remoteEntry.js)
  |-- remoteName: string (federation container name)
  |-- sharedDependencies?: SharedDependencyConfig[] (optional override)
  |-- entries?: MfeEntryMF typeId[] (convenience for discovery)
```

### Contract Matching Rules

For mounting to be valid:
```
entry.requiredProperties  is subset of  domain.sharedProperties
entry.actions             is subset of  domain.extensionsActions
domain.actions            is subset of  entry.domainActions
```

### Dynamic uiMeta Validation

An `Extension`'s `uiMeta` must conform to its domain's `extensionsUiMeta` schema. Since the domain reference is dynamic, this validation uses the GTS attribute selector syntax at runtime:
- The ScreensetsRuntime calls `plugin.getAttribute(extension.domain, 'extensionsUiMeta')` to resolve the schema
- Then validates `extension.uiMeta` against the resolved schema
- See Decision 9 in `design.md` for implementation details

### Actions Chain Runtime

1. ActionsChainsMediator delivers actions chain to target (domain or entry)
2. Target executes the action (only target understands payload based on action type)
3. On success: mediator delivers `next` chain to its target
4. On failure: mediator delivers `fallback` chain to its target
5. Recursive until chain ends (no next/fallback)

### Hierarchical Extension Domains

- HAI3 provides base layout domains: `sidebar`, `popup`, `screen`, `overlay`
- Vendor screensets can define their own extension domains
- Example: A dashboard screenset defines a "widget slot" domain for third-party widgets

## Impact

### Affected specs
- `screensets` - Core MFE integration, Type System plugin interface, and type definitions

### Affected code

**New packages:**
- `packages/screensets/src/mfe/` - MFE runtime, loader, ActionsChainsMediator
- `packages/screensets/src/mfe/types/` - Internal TypeScript type definitions
- `packages/screensets/src/mfe/validation/` - Contract matching validation
- `packages/screensets/src/mfe/mediator/` - ActionsChainsMediator for action chain delivery
- `packages/screensets/src/mfe/plugins/` - Type System plugin interface and implementations
- `packages/screensets/src/mfe/plugins/gts/` - GTS plugin implementation (default)
- `packages/screensets/src/mfe/loader/` - MFE loader (Module Federation)

**Modified packages:**
- `packages/screensets/src/state/` - Isolated state instances (uses @hai3/state)
- `packages/screensets/src/screensets/` - Extension domain registration
- `packages/framework/src/plugins/microfrontends/` - Accept Type System plugin from screensets

### Breaking changes
- **BREAKING**: MFEs require Type System-compliant type definitions for integration
- **BREAKING**: Extension points must define explicit contracts
- **BREAKING**: `ScreensetsRuntimeConfig` now requires `typeSystem` parameter

### Migration strategy
1. Define `TypeSystemPlugin` interface in @hai3/screensets
2. Create GTS plugin implementation as default
3. Implement ScreensetsRuntime to require plugin at initialization
4. Define internal TypeScript types for MFE architecture (6 core + 2 MF-specific)
5. Register HAI3 types via plugin at initialization
6. Propagate plugin through @hai3/framework layers
7. Update documentation and examples

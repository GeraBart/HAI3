# Design: Add Microfrontend Support

## Context

HAI3 needs to support microfrontend (MFE) architecture where independent applications can be composed into a host application. Each MFE is a separately deployed unit with its own HAI3 state instance. Communication between host and MFE must be explicit, type-safe, and controlled.

The type system for MFE contracts is abstracted through a **Type System Plugin** interface, allowing different type system implementations while shipping GTS as the default.

### Stakeholders

- **HAI3 Host Application**: Defines extension domains and orchestrates MFE communication
- **MFE Vendors**: Create independently deployable extensions
- **End Users**: Experience seamless integration of multiple MFEs
- **Type System Providers**: Implement Type System plugin interface for custom type systems

### Constraints

- State isolation: No direct state access between host and MFE
- Type safety: All communication contracts defined via pluggable Type System
- Security: MFEs cannot access host internals
- Performance: Lazy loading of MFE bundles
- Plugin requirement: Type System plugin must be provided at initialization

## Goals / Non-Goals

### Goals

1. **State Isolation**: Each MFE has its own HAI3 state instance
2. **Symmetric Contracts**: Clear bidirectional communication contracts
3. **Contract Validation**: Compile-time and runtime validation of compatibility
4. **Mediated Actions**: Centralized action chain delivery through ActionsChainsMediator
5. **Hierarchical Domains**: Support nested extension points
6. **Pluggable Type System**: Abstract Type System as a plugin with GTS as default

### Non-Goals

1. **Direct State Sharing**: No shared Redux store between host and MFE
2. **Event Bus Bridging**: No automatic event propagation across boundaries
3. **Hot Module Replacement**: MFE updates require reload
4. **Version Negotiation**: Single version per MFE entry
5. **Multiple Concurrent Plugins**: Only one Type System plugin per application instance

## Decisions

### Decision 1: Type System Plugin Interface

The @hai3/screensets package defines a `TypeSystemPlugin` interface that abstracts type system operations. This allows different type system implementations while shipping GTS as the default.

#### Plugin Interface Definition

```typescript
/**
 * Parsed representation of a type ID
 */
interface ParsedTypeId {
  namespace: string;
  name: string;
  version: string;
  qualifier?: string;
}

/**
 * Options for building a type ID
 */
interface TypeIdOptions {
  namespace: string;
  name: string;
  version: string;
  qualifier?: string;
}

/**
 * Result of schema validation
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
  keyword: string;
}

/**
 * Result of compatibility check
 */
interface CompatibilityResult {
  compatible: boolean;
  breaking: boolean;
  changes: CompatibilityChange[];
}

interface CompatibilityChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  description: string;
}

/**
 * Type System Plugin interface
 * Abstracts type system operations for MFE contracts
 */
interface TypeSystemPlugin<TTypeId = string> {
  /** Plugin identifier */
  readonly name: string;

  /** Plugin version */
  readonly version: string;

  // === Type ID Operations ===

  /**
   * Parse a type ID string into structured components
   */
  parseTypeId(id: string): ParsedTypeId;

  /**
   * Check if a string is a valid type ID format
   */
  isValidTypeId(id: string): boolean;

  /**
   * Build a type ID from components
   */
  buildTypeId(options: TypeIdOptions): TTypeId;

  // === Schema Registry ===

  /**
   * Register a JSON Schema for a type ID
   */
  registerSchema(typeId: TTypeId, schema: JSONSchema): void;

  /**
   * Validate an instance against the schema for a type ID
   */
  validateInstance(typeId: TTypeId, instance: unknown): ValidationResult;

  /**
   * Get the schema registered for a type ID
   */
  getSchema(typeId: TTypeId): JSONSchema | undefined;

  /**
   * Check if a type ID has a registered schema
   */
  hasSchema(typeId: TTypeId): boolean;

  // === Query ===

  /**
   * Query registered type IDs matching a pattern
   */
  query(pattern: string, limit?: number): TTypeId[];

  /**
   * List all registered type IDs
   */
  listAll(): TTypeId[];

  // === Compatibility (REQUIRED) ===

  /**
   * Check compatibility between two type versions
   */
  checkCompatibility(oldTypeId: TTypeId, newTypeId: TTypeId): CompatibilityResult;

  // === Attribute Access (REQUIRED for dynamic schema resolution) ===

  /**
   * Get an attribute value from a type using property path
   * Supports GTS attribute selector syntax: typeId@propertyPath
   * Example: 'gts.hai3.screensets.ext.domain.v1~hai3.layout.sidebar.v1@extensionsUiMeta'
   */
  getAttribute(typeId: TTypeId, path: string): AttributeResult;
}

/**
 * Result of attribute access
 */
interface AttributeResult {
  /** The type ID that was queried */
  typeId: string;
  /** The property path that was accessed */
  path: string;
  /** Whether the attribute was found */
  resolved: boolean;
  /** The value if resolved */
  value?: unknown;
  /** Error message if not resolved */
  error?: string;
}
```

#### GTS Plugin Implementation

The GTS plugin implements `TypeSystemPlugin` using `@globaltypesystem/gts-ts`. Note that GTS-specific names are used inside the plugin implementation itself:

```typescript
// packages/screensets/src/mfe/plugins/gts/index.ts
import { Gts, GtsStore, GtsQuery } from '@globaltypesystem/gts-ts';
import type { TypeSystemPlugin, ParsedTypeId, ValidationResult } from '../types';

type GtsTypeId = string; // GTS type ID format: gts.vendor.package.namespace.type.vN~

export function createGtsPlugin(): TypeSystemPlugin<GtsTypeId> {
  const gtsStore = new GtsStore();

  return {
    name: 'gts',
    version: '1.0.0',

    // Type ID operations
    parseTypeId(id: string): ParsedTypeId {
      const parsed = Gts.parseGtsID(id);
      return {
        namespace: parsed.namespace,
        name: parsed.name,
        version: parsed.version,
        qualifier: parsed.qualifier,
      };
    },

    isValidTypeId(id: string): boolean {
      return Gts.isValidGtsID(id);
    },

    buildTypeId(options): GtsTypeId {
      return Gts.buildGtsID(options);
    },

    // Schema registry
    registerSchema(typeId: GtsTypeId, schema: JSONSchema): void {
      gtsStore.register(typeId, schema);
    },

    validateInstance(typeId: GtsTypeId, instance: unknown): ValidationResult {
      const result = gtsStore.validate(typeId, instance);
      return {
        valid: result.valid,
        errors: result.errors.map(e => ({
          path: e.instancePath,
          message: e.message,
          keyword: e.keyword,
        })),
      };
    },

    getSchema(typeId: GtsTypeId): JSONSchema | undefined {
      return gtsStore.getSchema(typeId);
    },

    hasSchema(typeId: GtsTypeId): boolean {
      return gtsStore.has(typeId);
    },

    // Query
    query(pattern: string, limit?: number): GtsTypeId[] {
      return GtsQuery.search(gtsStore, pattern, { limit });
    },

    listAll(): GtsTypeId[] {
      return gtsStore.listAll();
    },

    // Compatibility (REQUIRED)
    checkCompatibility(oldTypeId: GtsTypeId, newTypeId: GtsTypeId) {
      return Gts.checkCompatibility(gtsStore, oldTypeId, newTypeId);
    },

    // Attribute Access (REQUIRED for dynamic schema resolution)
    getAttribute(typeId: GtsTypeId, path: string): AttributeResult {
      // GTS supports attribute selector syntax: typeId@path
      const result = gtsStore.getAttribute(typeId, path);
      return {
        typeId,
        path,
        resolved: result !== undefined,
        value: result,
        error: result === undefined ? `Attribute '${path}' not found in type '${typeId}'` : undefined,
      };
    },
  };
}

// Default export for convenience - creates a singleton plugin instance
export const gtsPlugin = createGtsPlugin();
```

### Decision 2: GTS Type ID Format and Registration

The GTS type ID format follows the structure: `gts.<vendor>.<package>.<namespace>.<type>.v<MAJOR>[.<MINOR>]~`

#### HAI3 GTS Type IDs

The type system is organized into **6 core types** that define the contract model, plus **2 MF-specific types** for Module Federation loading:

**Core Types (6 total):**

| Type | GTS Type ID | Segments | Purpose |
|------|-------------|----------|---------|
| MFE Entry (Abstract) | `gts.hai3.screensets.mfe.entry.v1~` | vendor=hai3, package=screensets, namespace=mfe, type=entry | Pure contract type (abstract base) |
| Extension Domain | `gts.hai3.screensets.ext.domain.v1~` | vendor=hai3, package=screensets, namespace=ext, type=domain | Extension point contract |
| Extension | `gts.hai3.screensets.ext.extension.v1~` | vendor=hai3, package=screensets, namespace=ext, type=extension | Extension binding |
| Shared Property | `gts.hai3.screensets.ext.shared_property.v1~` | vendor=hai3, package=screensets, namespace=ext, type=shared_property | Property definition |
| Action | `gts.hai3.screensets.ext.action.v1~` | vendor=hai3, package=screensets, namespace=ext, type=action | Action type with target and self-id |
| Actions Chain | `gts.hai3.screensets.ext.actions_chain.v1~` | vendor=hai3, package=screensets, namespace=ext, type=actions_chain | Action chain for mediation |

**MF-Specific Types (2 total):**

| Type | GTS Type ID | Segments | Purpose |
|------|-------------|----------|---------|
| MF Manifest | `gts.hai3.screensets.mfe.mf.v1~` | vendor=hai3, package=screensets, namespace=mfe, type=mf | Module Federation manifest (standalone) |
| MFE Entry MF (Derived) | `gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1` | Derived from MfeEntry | Module Federation entry with manifest reference |

#### Why This Structure Eliminates Parallel Hierarchies

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

#### Complete GTS JSON Schema Definitions

**1. MFE Entry Schema (Abstract Base):**

MfeEntry is the **abstract base type** for all entry contracts. It defines ONLY the communication interface (properties, actions). Derived types add loader-specific fields.

```json
{
  "$id": "gts://gts.hai3.screensets.mfe.entry.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "requiredProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.shared_property.v1~*" },
      "description": "SharedProperty type IDs that MUST be provided by the domain"
    },
    "optionalProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.shared_property.v1~*" },
      "description": "SharedProperty type IDs that MAY be provided by the domain"
    },
    "actions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.action.v1~*" },
      "description": "Action type IDs this entry can emit to the domain"
    },
    "domainActions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.action.v1~*" },
      "description": "Action type IDs this entry can receive from the domain"
    }
  },
  "required": ["requiredProperties", "actions", "domainActions"]
}
```

**1a. MFE Entry MF Schema (Derived - Module Federation):**

The Module Federation derived type adds fields specific to Webpack 5 / Rspack Module Federation 2.0 implementation. It references an MfManifest and specifies the exposed module name.

```json
{
  "$id": "gts://gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [
    { "$ref": "gts://gts.hai3.screensets.mfe.entry.v1~" }
  ],
  "properties": {
    "manifest": {
      "x-gts-ref": "gts.hai3.screensets.mfe.mf.v1~*",
      "description": "Reference to MfManifest type ID containing Module Federation config"
    },
    "exposedModule": {
      "type": "string",
      "minLength": 1,
      "description": "Module Federation exposed module name (e.g., './ChartWidget')"
    }
  },
  "required": ["manifest", "exposedModule"]
}
```

**2. MF Manifest Schema (Standalone):**

MfManifest is a **standalone type** containing Module Federation configuration. Multiple MfeEntryMF instances can reference the same manifest (when an MFE bundle exposes multiple entries).

```json
{
  "$id": "gts://gts.hai3.screensets.mfe.mf.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "remoteEntry": {
      "type": "string",
      "format": "uri",
      "description": "URL to the remoteEntry.js file"
    },
    "remoteName": {
      "type": "string",
      "minLength": 1,
      "description": "Module Federation container name (used in exposes/remotes config)"
    },
    "sharedDependencies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "singleton": { "type": "boolean" },
          "requiredVersion": { "type": "string" }
        },
        "required": ["name"]
      },
      "description": "Optional override for shared dependency configuration"
    },
    "entries": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1*" },
      "description": "Convenience field for discovery - lists MfeEntryMF type IDs from this manifest (not authoritative)"
    }
  },
  "required": ["remoteEntry", "remoteName"]
}
```

**MfeEntry Type Hierarchy:**

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

**Why MfeEntry References Manifest (Not Vice Versa):**

1. **Extension binds to Entry**: The Extension type references an MfeEntry (or derived type). This is the primary binding point.
2. **Entry owns its loading config**: The MfeEntryMF knows how to load itself via its manifest reference.
3. **Future loaders**: Adding ESM support means adding MfeEntryEsm with its own loader config, not modifying existing types.
4. **No circular dependency**: Manifest can optionally list its entries for discovery, but entries are authoritative.

**3. Extension Domain Schema (Base):**

The base `ExtensionDomain` type defines `extensionsUiMeta` as a generic object schema. Derived domain types narrow `extensionsUiMeta` through GTS type inheritance:

```json
{
  "$id": "gts://gts.hai3.screensets.ext.domain.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "sharedProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.shared_property.v1~*" }
    },
    "actions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.action.v1~*" },
      "description": "Action type IDs domain can emit to extensions"
    },
    "extensionsActions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.screensets.ext.action.v1~*" },
      "description": "Action type IDs domain can receive from extensions"
    },
    "extensionsUiMeta": { "type": "object" }
  },
  "required": ["sharedProperties", "actions", "extensionsActions", "extensionsUiMeta"]
}
```

**3a. Derived Domain Example (Sidebar Layout):**

Derived domains inherit from base and narrow `extensionsUiMeta` to specific requirements:

```json
{
  "$id": "gts://gts.hai3.screensets.ext.domain.v1~hai3.layout.domain.sidebar.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [
    { "$ref": "gts://gts.hai3.screensets.ext.domain.v1~" }
  ],
  "properties": {
    "extensionsUiMeta": {
      "type": "object",
      "properties": {
        "icon": { "type": "string" },
        "label": { "type": "string" },
        "group": { "type": "string" }
      },
      "required": ["icon", "label"]
    }
  }
}
```

**4. Extension Schema:**

Extensions provide `uiMeta` instances conforming to the domain's `extensionsUiMeta` schema. Runtime validation enforces this constraint using the GTS attribute selector (see Decision 9):

```json
{
  "$id": "gts://gts.hai3.screensets.ext.extension.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "domain": { "x-gts-ref": "gts.hai3.screensets.ext.domain.v1~*" },
    "entry": { "x-gts-ref": "gts.hai3.screensets.mfe.entry.v1~*" },
    "uiMeta": {
      "type": "object",
      "description": "Must conform to the domain's extensionsUiMeta schema. Validated at runtime via plugin.getAttribute(domain, 'extensionsUiMeta')."
    }
  },
  "required": ["domain", "entry", "uiMeta"]
}
```

**5. Shared Property Schema:**
```json
{
  "$id": "gts://gts.hai3.screensets.ext.shared_property.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "schema": { "type": "object" }
  },
  "required": ["name", "schema"]
}
```

**6. Action Schema:**

Action is an action type with its target, self-identifying type, and optional payload. The `type` field uses `x-gts-ref: "/$id"` to reference the action's own type ID per GTS spec. The `target` field uses JSON Schema `oneOf` with `x-gts-ref` to allow referencing either ExtensionDomain or Extension:

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
      "description": "Self-reference to this action's type ID"
    },
    "payload": {
      "type": "object",
      "description": "Optional action payload"
    }
  },
  "required": ["target", "type"]
}
```

**7. Actions Chain Schema:**

ActionsChain contains actual Action INSTANCES (objects with target, type, and optional payload). The chain is recursive with embedded objects:

```json
{
  "$id": "gts://gts.hai3.screensets.ext.actions_chain.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "action": { "$ref": "gts://gts.hai3.screensets.ext.action.v1~" },
    "next": { "$ref": "gts://gts.hai3.screensets.ext.actions_chain.v1~" },
    "fallback": { "$ref": "gts://gts.hai3.screensets.ext.actions_chain.v1~" }
  },
  "required": ["action"]
}
```

Note: Each `action` in the chain is a full Action instance containing `target` (required), `type` (required), and `payload` (optional).

### Decision 3: Internal TypeScript Type Definitions

The MFE system uses internal TypeScript interfaces that include `TypeMetadata` extracted from type IDs via the plugin. This metadata is populated at runtime when types are parsed/registered.

#### TypeMetadata Interface

The `TypeMetadata` interface contains data extracted from parsing a type ID. The parsing logic is provided by the TypeSystemPlugin:

```typescript
// packages/screensets/src/mfe/types/metadata.ts

/**
 * Metadata extracted from a type ID via plugin
 * For GTS, the ID format is: gts.<vendor>.<package>.<namespace>.<type>.v<MAJOR>[.<MINOR>]~
 */
interface TypeMetadata {
  /** Full type ID (e.g., "gts.hai3.screensets.mfe.entry.v1~") */
  readonly typeId: string;
  /** Vendor segment (e.g., "hai3") */
  readonly vendor: string;
  /** Package segment (e.g., "screensets") */
  readonly package: string;
  /** Namespace segment (e.g., "mfe" or "ext") */
  readonly namespace: string;
  /** Type segment (e.g., "entry", "domain") */
  readonly type: string;
  /** Version information extracted from type ID */
  readonly version: {
    major: number;
    minor?: number;
  };
}

/**
 * Utility function to parse a type ID into TypeMetadata
 * Uses the plugin's parseTypeId method internally
 */
function parseTypeId(plugin: TypeSystemPlugin, typeId: string): TypeMetadata {
  const parsed = plugin.parseTypeId(typeId);
  // Map parsed result to TypeMetadata structure
  return {
    typeId,
    vendor: parsed.namespace.split('.')[0] || '',
    package: parsed.namespace.split('.')[1] || '',
    namespace: parsed.namespace.split('.')[2] || '',
    type: parsed.name,
    version: {
      major: parseInt(parsed.version.split('.')[0], 10),
      minor: parsed.version.includes('.')
        ? parseInt(parsed.version.split('.')[1], 10)
        : undefined,
    },
  };
}
```

#### TypeScript Interface Definitions with TypeMetadata

All MFE types extend `TypeMetadata` and include domain-specific properties:

```typescript
// packages/screensets/src/mfe/types/index.ts

/**
 * Defines an entry point with its communication contract (PURE CONTRACT - Abstract Base)
 * GTS Type: gts.hai3.screensets.mfe.entry.v1~
 *
 * MfeEntry is the abstract base type for all entry contracts. It defines ONLY
 * the communication interface (properties, actions). Derived types add
 * loader-specific fields (e.g., MfeEntryMF for Module Federation).
 */
interface MfeEntry extends TypeMetadata {
  /** SharedProperty type IDs that MUST be provided by domain */
  requiredProperties: string[];
  /** SharedProperty type IDs that MAY be provided by domain (optional field) */
  optionalProperties?: string[];
  /** Action type IDs this entry can emit to the domain */
  actions: string[];
  /** Action type IDs this entry can receive from the domain */
  domainActions: string[];
}

/**
 * Module Federation 2.0 implementation of MfeEntry
 * GTS Type: gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1
 *
 * Adds Module Federation specific fields for remote bundle loading.
 * References an MfManifest for the federation container config.
 */
interface MfeEntryMF extends MfeEntry {
  /** Reference to MfManifest type ID containing Module Federation config */
  manifest: string;
  /** Module Federation exposed module name (e.g., './ChartWidget') */
  exposedModule: string;
}

/**
 * Module Federation manifest containing shared configuration
 * GTS Type: gts.hai3.screensets.mfe.mf.v1~
 *
 * Standalone type containing Module Federation configuration.
 * Multiple MfeEntryMF instances can reference the same manifest.
 */
interface MfManifest extends TypeMetadata {
  /** URL to the remoteEntry.js file */
  remoteEntry: string;
  /** Module Federation container name (used in exposes/remotes config) */
  remoteName: string;
  /** Optional override for shared dependency configuration */
  sharedDependencies?: SharedDependencyConfig[];
  /** Convenience field for discovery - lists MfeEntryMF type IDs from this manifest */
  entries?: string[];
}

/**
 * Configuration for a shared dependency in Module Federation
 */
interface SharedDependencyConfig {
  /** Package name */
  name: string;
  /** Whether this should be a singleton */
  singleton?: boolean;
  /** Required version range */
  requiredVersion?: string;
}

/**
 * Defines an extension point (domain) where MFEs can be mounted
 * GTS Type: gts.hai3.screensets.ext.domain.v1~
 *
 * Base domain defines extensionsUiMeta as generic object.
 * Derived domains narrow extensionsUiMeta through GTS type inheritance.
 */
interface ExtensionDomain extends TypeMetadata {
  /** SharedProperty type IDs provided to extensions */
  sharedProperties: string[];
  /** Action type IDs domain can emit to extensions */
  actions: string[];
  /** Action type IDs domain can receive from extensions */
  extensionsActions: string[];
  /** JSON Schema for UI metadata extensions must provide (narrowed in derived domains) */
  extensionsUiMeta: JSONSchema;
}

/**
 * Binds an MFE entry to an extension domain
 * GTS Type: gts.hai3.screensets.ext.extension.v1~
 */
interface Extension extends TypeMetadata {
  /** ExtensionDomain type ID to mount into */
  domain: string;
  /** MfeEntry type ID to mount (can be base MfeEntry or derived like MfeEntryMF) */
  entry: string;
  /** UI metadata instance conforming to domain's extensionsUiMeta schema */
  uiMeta: Record<string, unknown>;
}

/**
 * Defines a property that can be shared from domain to extension
 * GTS Type: gts.hai3.screensets.ext.shared_property.v1~
 * Note: No default value - domain provides values at runtime
 */
interface SharedProperty extends TypeMetadata {
  /** Property name used for passing to extension */
  name: string;
  /** JSON Schema for property value */
  schema: JSONSchema;
}

/**
 * An action type with target, self-identifying type, and optional payload
 * GTS Type: gts.hai3.screensets.ext.action.v1~
 * The `type` field is a self-reference to the action's own $id per GTS spec
 */
interface Action extends TypeMetadata {
  /** Target type ID (ExtensionDomain or Extension) - REQUIRED, uses x-gts-ref */
  target: string;
  /** Self-reference to this action's type ID (uses x-gts-ref: "/$id") - REQUIRED */
  type: string;
  /** Optional action payload */
  payload?: unknown;
}

/**
 * Defines a mediated chain of actions with success/failure branches
 * GTS Type: gts.hai3.screensets.ext.actions_chain.v1~
 *
 * Contains actual Action INSTANCES (objects with target, type, payload).
 */
interface ActionsChain extends TypeMetadata {
  /** Action INSTANCE (object with target, type, and optional payload) */
  action: Action;
  /** ActionsChain INSTANCE to execute on success (recursive object) */
  next?: ActionsChain;
  /** ActionsChain INSTANCE to execute on failure (recursive object) */
  fallback?: ActionsChain;
}
```

### Decision 4: TypeMetadata Extraction Utility

The system provides a utility to extract `TypeMetadata` from type IDs and hydrate runtime objects:

```typescript
// packages/screensets/src/mfe/utils/metadata.ts

/**
 * Create a typed instance with TypeMetadata from raw data
 * Uses the plugin to parse the type ID
 */
function hydrateWithMetadata<T extends TypeMetadata>(
  plugin: TypeSystemPlugin,
  typeId: string,
  data: Omit<T, keyof TypeMetadata>
): T {
  const metadata = parseTypeId(plugin, typeId);
  return {
    ...metadata,
    ...data,
  } as T;
}

// Usage example:
const mfeEntry = hydrateWithMetadata<MfeEntry>(
  typeSystem,
  'gts.acme.analytics.mfe.entry.chart.v1~',
  {
    requiredProperties: ['gts.hai3.screensets.ext.shared_property.v1~:user_context'],
    optionalProperties: [],
    actions: ['gts.acme.dashboard.ext.action.data_updated.v1~'],
    domainActions: ['gts.acme.dashboard.ext.action.refresh.v1~'],
  }
);

// mfeEntry now has:
// - typeId: 'gts.acme.analytics.mfe.entry.chart.v1~'
// - vendor: 'acme'
// - package: 'analytics'
// - namespace: 'mfe'
// - type: 'entry'
// - version: { major: 1 }
// - requiredProperties: [...]
// - optionalProperties: [...]
// - actions: [...]
// - domainActions: [...]
```

### Decision 5: HAI3 Type Registration via Plugin

When initializing the ScreensetsRuntime with the GTS plugin, HAI3 types are registered. There are 6 core types plus 2 MF-specific types:

```typescript
// packages/screensets/src/mfe/init.ts

import { mfeGtsSchemas } from './schemas/gts-schemas';

/** GTS Type IDs for HAI3 MFE core types (6 types) */
const HAI3_CORE_TYPE_IDS = {
  mfeEntry: 'gts.hai3.screensets.mfe.entry.v1~',
  extensionDomain: 'gts.hai3.screensets.ext.domain.v1~',
  extension: 'gts.hai3.screensets.ext.extension.v1~',
  sharedProperty: 'gts.hai3.screensets.ext.shared_property.v1~',
  action: 'gts.hai3.screensets.ext.action.v1~',
  actionsChain: 'gts.hai3.screensets.ext.actions_chain.v1~',
} as const;

/** GTS Type IDs for MF-specific types (2 types) */
const HAI3_MF_TYPE_IDS = {
  mfManifest: 'gts.hai3.screensets.mfe.mf.v1~',
  mfeEntryMf: 'gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1',
} as const;

function registerHai3Types<TTypeId>(
  plugin: TypeSystemPlugin<TTypeId>
): { core: typeof HAI3_CORE_TYPE_IDS; mf: typeof HAI3_MF_TYPE_IDS } {
  // Register core schemas (6 types)
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.mfeEntry as TTypeId,
    mfeGtsSchemas.mfeEntry
  );
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.extensionDomain as TTypeId,
    mfeGtsSchemas.extensionDomain
  );
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.extension as TTypeId,
    mfeGtsSchemas.extension
  );
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.sharedProperty as TTypeId,
    mfeGtsSchemas.sharedProperty
  );
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.action as TTypeId,
    mfeGtsSchemas.action
  );
  plugin.registerSchema(
    HAI3_CORE_TYPE_IDS.actionsChain as TTypeId,
    mfeGtsSchemas.actionsChain
  );

  // Register MF-specific schemas (2 types)
  plugin.registerSchema(
    HAI3_MF_TYPE_IDS.mfManifest as TTypeId,
    mfeGtsSchemas.mfManifest
  );
  plugin.registerSchema(
    HAI3_MF_TYPE_IDS.mfeEntryMf as TTypeId,
    mfeGtsSchemas.mfeEntryMf
  );

  return { core: HAI3_CORE_TYPE_IDS, mf: HAI3_MF_TYPE_IDS };
}
```

### Decision 6: ScreensetsRuntime Configuration

The ScreensetsRuntime requires a Type System plugin at initialization:

```typescript
// packages/screensets/src/mfe/runtime/config.ts

/**
 * Configuration for the ScreensetsRuntime
 * Note: ScreensetsRuntimeConfig is the canonical configuration interface.
 * The runtime manages MFE lifecycle (loading, mounting, registration, validation).
 */
interface ScreensetsRuntimeConfig<TTypeId = string> {
  /** Required: Type System plugin for type handling */
  typeSystem: TypeSystemPlugin<TTypeId>;

  /** Optional: Custom error handler */
  onError?: (error: MfeError) => void;

  /** Optional: Custom loading state component */
  loadingComponent?: React.ComponentType;

  /** Optional: Custom error fallback component */
  errorFallbackComponent?: React.ComponentType<{ error: MfeError; retry: () => void }>;

  /** Optional: Enable debug logging */
  debug?: boolean;

  /** MFE loader configuration (enables hosting nested MFEs) */
  mfeLoader?: MfeLoaderConfig;

  /** Initial parent bridge (if loaded as MFE) */
  parentBridge?: MfeBridgeConnection;
}

/**
 * Create the ScreensetsRuntime with required Type System plugin
 */
function createScreensetsRuntime<TTypeId = string>(
  config: ScreensetsRuntimeConfig<TTypeId>
): ScreensetsRuntime<TTypeId> {
  const { typeSystem, ...options } = config;

  // Validate plugin
  if (!typeSystem) {
    throw new Error('ScreensetsRuntime requires a typeSystem');
  }

  // Register HAI3 types (6 core + 2 MF-specific)
  const typeIds = registerHai3Types(typeSystem);

  return new ScreensetsRuntime(typeSystem, typeIds, options);
}

// Usage with GTS (default)
import { gtsPlugin } from '@hai3/screensets/plugins/gts';

const runtime = createScreensetsRuntime({
  typeSystem: gtsPlugin,
  debug: process.env.NODE_ENV === 'development',
});

// Usage with custom plugin
import { customPlugin } from './my-custom-plugin';

const runtimeWithCustomPlugin = createScreensetsRuntime({
  typeSystem: customPlugin,
});
```

### Decision 7: Plugin Propagation to Framework

The @hai3/framework microfrontends plugin accepts the Type System plugin from screensets:

```typescript
// packages/framework/src/plugins/microfrontends/index.ts

interface MicrofrontendsPluginConfig<TTypeId = string> {
  /** Type System plugin inherited from screensets configuration */
  typeSystem: TypeSystemPlugin<TTypeId>;

  /** Base domains to register */
  baseDomains?: Array<'sidebar' | 'popup' | 'screen' | 'overlay'>;
}

function createMicrofrontendsPlugin<TTypeId = string>(
  config: MicrofrontendsPluginConfig<TTypeId>
): FrameworkPlugin {
  return {
    name: 'microfrontends',

    setup(framework) {
      // Create runtime with provided plugin
      const runtime = createScreensetsRuntime({
        typeSystem: config.typeSystem,
      });

      // Register base domains if specified
      if (config.baseDomains) {
        for (const domain of config.baseDomains) {
          runtime.registerDomain(getBaseDomain(domain, config.typeSystem));
        }
      }

      // Expose runtime to framework
      framework.provide('screensetsRuntime', runtime);
    },
  };
}

// App initialization example
import { createFramework } from '@hai3/framework';
import { gtsPlugin } from '@hai3/screensets/plugins/gts';

const app = createFramework({
  plugins: [
    createMicrofrontendsPlugin({
      typeSystem: gtsPlugin,
      baseDomains: ['sidebar', 'popup', 'screen', 'overlay'],
    }),
  ],
});
```

### Decision 8: Contract Matching Rules

For an MFE entry to be mountable into an extension domain, the following conditions must ALL be true:

```
1. entry.requiredProperties  SUBSET_OF  domain.sharedProperties
   (domain provides all required properties)

2. entry.actions             SUBSET_OF  domain.extensionsActions
   (domain can receive all actions entry emits)

3. domain.actions            SUBSET_OF  entry.domainActions
   (entry can handle all actions domain emits)
```

**Validation Implementation:**
```typescript
interface ContractValidationResult {
  valid: boolean;
  errors: ContractError[];
}

interface ContractError {
  type: 'missing_property' | 'unsupported_action' | 'unhandled_domain_action';
  details: string;
}

function validateContract(
  entry: MfeEntry,
  domain: ExtDomain
): ContractValidationResult {
  const errors: ContractError[] = [];

  // Rule 1: Required properties
  for (const prop of entry.requiredProperties) {
    if (!domain.sharedProperties.includes(prop)) {
      errors.push({
        type: 'missing_property',
        details: `Entry requires property '${prop}' not provided by domain`
      });
    }
  }

  // Rule 2: Entry actions
  for (const action of entry.actions) {
    if (!domain.extensionsActions.includes(action)) {
      errors.push({
        type: 'unsupported_action',
        details: `Entry emits action '${action}' not accepted by domain`
      });
    }
  }

  // Rule 3: Domain actions
  for (const action of domain.actions) {
    if (!entry.domainActions.includes(action)) {
      errors.push({
        type: 'unhandled_domain_action',
        details: `Domain emits action '${action}' not handled by entry`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Decision 9: Dynamic uiMeta Validation via Attribute Selector

**Problem:** An `Extension` instance has a `domain` field containing a type ID reference (e.g., `gts.hai3.screensets.ext.domain.v1~hai3.layout.domain.sidebar.v1`), and its `uiMeta` property must conform to that domain's `extensionsUiMeta` schema. This cannot be expressed as a static JSON Schema constraint because the domain reference is a dynamic value.

**Solution:** The GTS specification supports **attribute selectors** using the `@` syntax to access properties from type instances:

```
gts.hai3.screensets.ext.domain.v1~hai3.layout.domain.sidebar.v1@extensionsUiMeta
```

This allows the ScreensetsRuntime to resolve the domain's `extensionsUiMeta` schema at runtime.

**Implementation:**

1. **At schema level:** The Extension GTS schema defines `uiMeta` as `"type": "object"` with a description stating it must conform to the domain's `extensionsUiMeta` schema. The actual schema constraint is dynamic and cannot be expressed statically in JSON Schema because it depends on which domain the extension binds to.
2. **At runtime (registration):** The ScreensetsRuntime enforces the real constraint by resolving the domain's `extensionsUiMeta` schema and validating `uiMeta` against it:

```typescript
/**
 * Validate Extension's uiMeta against its domain's extensionsUiMeta schema
 */
function validateExtensionUiMeta(
  plugin: TypeSystemPlugin,
  extension: Extension
): ValidationResult {
  // 1. Get the domain's extensionsUiMeta schema using attribute selector
  const schemaResult = plugin.getAttribute(extension.domain, 'extensionsUiMeta');

  if (!schemaResult.resolved) {
    return {
      valid: false,
      errors: [{
        path: 'domain',
        message: `Cannot resolve extensionsUiMeta from domain '${extension.domain}'`,
        keyword: 'x-gts-attr',
      }],
    };
  }

  // 2. The resolved value is the JSON Schema for uiMeta
  const extensionsUiMetaSchema = schemaResult.value as JSONSchema;

  // 3. Create a temporary type for validation
  const tempTypeId = `${extension.typeId}:uiMeta:validation`;
  plugin.registerSchema(tempTypeId, extensionsUiMetaSchema);

  // 4. Validate extension.uiMeta against the resolved schema
  const result = plugin.validateInstance(tempTypeId, extension.uiMeta);

  // 5. Transform errors to include context
  return {
    valid: result.valid,
    errors: result.errors.map(e => ({
      ...e,
      path: `uiMeta.${e.path}`,
      message: `uiMeta validation failed against ${extension.domain}@extensionsUiMeta: ${e.message}`,
    })),
  };
}
```

**Why GTS Attribute Selector:**
- Native GTS feature from the specification: "Append `@` to the identifier and provide a property path"
- Implemented in `@globaltypesystem/gts-ts` via `getAttribute()` method
- No custom schema extensions required
- Works with GTS type inheritance (derived domains have their narrowed `extensionsUiMeta`)

**Integration Point:**

The ScreensetsRuntime calls `validateExtensionUiMeta()` during extension registration, after contract matching validation:

```typescript
// In ScreensetsRuntime.registerExtension()
const contractResult = validateContract(entry, domain);
if (!contractResult.valid) {
  throw new ContractValidationError(contractResult.errors);
}

const uiMetaResult = validateExtensionUiMeta(this.typeSystem, extension);
if (!uiMetaResult.valid) {
  throw new UiMetaValidationError(uiMetaResult.errors);
}

// Contract and uiMeta both valid, proceed with registration
```

### Decision 10: Isolated State Instances

Each MFE instance runs with its own isolated @hai3/state container. The host also has its own state instance.

**Architecture:**
```
+------------------+      +------------------+
|   HOST STATE     |      |   MFE STATE      |
|  (HAI3 Store)    |      |  (HAI3 Store)    |
+--------+---------+      +--------+---------+
         |                         |
         v                         v
+--------+---------+      +--------+---------+
|  HOST COMPONENT  |      |  MFE COMPONENT   |
+--------+---------+      +--------+---------+
         |                         |
         +-----------+-------------+
                     |
              +------v------+
              | SCREENSETS   |
              | RUNTIME      |
              +-------------+
```

**Key Points:**
- No direct store access across boundary
- Shared properties passed via props at render time
- Actions delivered via ActionsChainsMediator
- Type System plugin validates type IDs and schemas

### Decision 11: Actions Chain Mediation

The **ActionsChainsMediator** delivers action chains to targets and handles success/failure branching. The Type System plugin validates all type IDs and payloads.

**Note on terminology:**
- **ScreensetsRuntime**: Manages MFE lifecycle (loading, mounting, registration, and validation)
- **ActionsChainsMediator**: The specific component responsible for action chain delivery between domains and extensions

**Execution Flow:**
```
1. ActionsChainsMediator receives chain
2. Validate chain.target via typeSystem.isValidTypeId()
3. Resolve target (domain or entry instance)
4. Validate action against target's contract
5. Validate payload via typeSystem.validateInstance()
6. Deliver payload to target
7. Wait for result (Promise<success|failure>)
8. If success AND chain.next: mediator executes chain.next
9. If failure AND chain.fallback: mediator executes chain.fallback
10. Recurse until no next/fallback
```

**API Contract:**

The actions chain mediation functionality is provided by the `ActionsChainsMediator` interface:

```typescript
/**
 * ActionsChainsMediator - Mediates action chain delivery between domains and extensions.
 * This is the component responsible for executing action chains and routing actions
 * to their targets (domains or extensions).
 */
interface ActionsChainsMediator<TTypeId = string> {
  /** The Type System plugin used by this mediator */
  readonly typeSystem: TypeSystemPlugin<TTypeId>;

  /** Execute an action chain, routing to targets and handling success/failure branching */
  executeActionsChain(chain: ActionsChain<TTypeId>): Promise<ChainResult>;

  /** Register an extension's action handler for receiving actions */
  registerExtensionHandler(
    extensionId: string,
    domainId: TTypeId,
    entryId: TTypeId,
    handler: ActionHandler<TTypeId>
  ): void;

  /** Unregister an extension's action handler */
  unregisterExtensionHandler(extensionId: string): void;

  /** Register a domain's action handler for receiving actions from extensions */
  registerDomainHandler(
    domainId: TTypeId,
    handler: ActionHandler<TTypeId>
  ): void;
}

interface ActionHandler<TTypeId = string> {
  handleAction(actionId: TTypeId, payload: unknown): Promise<void>;
}

interface ChainResult {
  completed: boolean;
  path: string[];  // Action IDs executed
  error?: string;  // If failed
}
```

**Note:** The `ScreensetsRuntime` class owns an `ActionsChainsMediator` instance internally and delegates action chain execution to it. The runtime exposes `executeActionsChain()` for convenience but the actual mediation logic is encapsulated in the mediator.

### Decision 12: Hierarchical Extension Domains

Extension domains can be hierarchical. HAI3 provides base layout domains, and vendor screensets can define their own. Base domains are registered via the Type System plugin.

**Base Layout Domains (registered via plugin):**

When using GTS plugin, base domains follow the format `gts.hai3.screensets.ext.domain.<layout>.v1~`:
- `gts.hai3.screensets.ext.domain.sidebar.v1~` - Sidebar panels
- `gts.hai3.screensets.ext.domain.popup.v1~` - Modal popups
- `gts.hai3.screensets.ext.domain.screen.v1~` - Full screen views
- `gts.hai3.screensets.ext.domain.overlay.v1~` - Floating overlays

**Vendor-Defined Domains:**

Vendors define their own domains following the GTS type ID format. The domain's `extensionsUiMeta` defines what UI metadata extensions must provide:

```typescript
// Example: Dashboard screenset defines widget slot domain
// Type ID: gts.acme.dashboard.ext.domain.widget_slot.v1~

const widgetSlotDomain: ExtensionDomain = hydrateWithMetadata(
  typeSystem,
  'gts.acme.dashboard.ext.domain.widget_slot.v1~',
  {
    sharedProperties: [
      'gts.hai3.screensets.ext.shared_property.user_context.v1~',
    ],
    actions: [
      'gts.acme.dashboard.ext.action.refresh.v1~',  // Action type ID domain can emit
    ],
    extensionsActions: [
      'gts.acme.dashboard.ext.action.data_update.v1~',  // Action type ID domain can receive
    ],
    extensionsUiMeta: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        icon: { type: 'string' },
        size: { enum: ['small', 'medium', 'large'] },
      },
      required: ['title', 'size'],
    },
  }
);
```

### Decision 13: Module Federation 2.0 for Bundle Loading

**What**: Use Webpack 5 / Rspack Module Federation 2.0 for loading remote MFE bundles.

**Why**:
- Mature ecosystem with TypeScript type generation
- Shared dependency deduplication (single React instance across host and MFEs)
- Battle-tested at scale (Zara, IKEA, others)
- Works with existing HAI3 Vite build (via `@originjs/vite-plugin-federation`)

**Alternatives Considered**:

| Alternative | Pros | Cons | Decision |
|------------|------|------|----------|
| Native Federation (ESM + Import Maps) | Pure ESM, no bundler | React CommonJS issues, import map constraints | Rejected |
| iframes | Complete isolation | Poor UX, heavy performance, no shared context | Rejected |
| Web Components only | Native platform | No shared React context, complex state | Rejected |

**MfeLoader Implementation:**

The MfeLoader uses the `MfeEntryMF` derived type which references an `MfManifest` for Module Federation configuration:

```typescript
// packages/screensets/src/mfe/loader/index.ts

interface MfeLoaderConfig {
  /** Timeout for bundle loading in ms (default: 30000) */
  timeout?: number;
  /** Retry attempts on load failure (default: 2) */
  retries?: number;
  /** Enable preloading of known MFEs */
  preload?: boolean;
}

interface LoadedMfe {
  /** The loaded React component */
  component: React.ComponentType<MfeBridgeProps>;
  /** The entry that was loaded (Module Federation variant) */
  entry: MfeEntryMF;
  /** The manifest used for loading */
  manifest: MfManifest;
  /** Cleanup function to unload the MFE */
  unload: () => void;
}

/**
 * MFE Loader using Module Federation 2.0
 * Handles remote bundle loading with schema validation.
 * Uses MfeEntryMF.manifest to find MfManifest, then loads the exposed module.
 */
class MfeLoader {
  /** GTS Type ID for Module Federation MFE entries */
  private static readonly MF_ENTRY_TYPE_ID =
    'gts.hai3.screensets.mfe.entry.v1~hai3.mfe.entry_mf.v1';

  /** GTS Type ID for Module Federation manifests */
  private static readonly MF_MANIFEST_TYPE_ID =
    'gts.hai3.screensets.mfe.mf.v1~';

  // Cache of loaded manifests by type ID
  private loadedManifests = new Map<string, MfManifest>();
  // Cache of loaded containers by remoteName
  private loadedContainers = new Map<string, Container>();

  constructor(
    private typeSystem: TypeSystemPlugin,
    private config: MfeLoaderConfig = {}
  ) {}

  /**
   * Load an MFE from its MfeEntryMF definition
   * 1. Validates entry against MfeEntryMF schema
   * 2. Resolves manifest from entry.manifest reference
   * 3. Loads Module Federation container
   * 4. Gets exposed module from entry.exposedModule
   */
  async load(entry: MfeEntryMF): Promise<LoadedMfe> {
    // 1. Validate entry against Module Federation entry schema
    const entryValidation = this.typeSystem.validateInstance(
      MfeLoader.MF_ENTRY_TYPE_ID,
      entry
    );
    if (!entryValidation.valid) {
      throw new MfeLoadError('Invalid MfeEntryMF', entryValidation.errors);
    }

    // 2. Resolve and validate manifest
    const manifest = await this.resolveManifest(entry.manifest);

    // 3. Load remote container (cached per remoteName)
    const container = await this.loadRemoteContainer(manifest);

    // 4. Get the exposed module using entry.exposedModule
    const moduleFactory = await container.get(entry.exposedModule);
    if (!moduleFactory) {
      throw new MfeLoadError(
        `Module '${entry.exposedModule}' not found in container '${manifest.remoteName}'`,
        []
      );
    }
    const module = moduleFactory();

    return {
      component: module.default,
      entry,
      manifest,
      unload: () => this.unloadIfUnused(manifest.remoteName),
    };
  }

  /**
   * Resolve manifest from type ID
   * Manifests are cached to avoid redundant loading
   */
  private async resolveManifest(manifestTypeId: string): Promise<MfManifest> {
    // Check cache first
    if (this.loadedManifests.has(manifestTypeId)) {
      return this.loadedManifests.get(manifestTypeId)!;
    }

    // Get manifest from type system registry
    const manifestSchema = this.typeSystem.getSchema(manifestTypeId);
    if (!manifestSchema) {
      throw new MfeLoadError(
        `Manifest type '${manifestTypeId}' not registered`,
        []
      );
    }

    // The manifest instance should be registered with the type
    // This is a simplification - in practice, manifest instances
    // would be loaded from a manifest registry or remote endpoint
    const manifest = await this.fetchManifestInstance(manifestTypeId);

    // Validate manifest
    const validation = this.typeSystem.validateInstance(
      MfeLoader.MF_MANIFEST_TYPE_ID,
      manifest
    );
    if (!validation.valid) {
      throw new MfeLoadError('Invalid MfManifest', validation.errors);
    }

    this.loadedManifests.set(manifestTypeId, manifest);
    return manifest;
  }

  /**
   * Load Module Federation container from manifest
   * Containers are cached per remoteName
   */
  private async loadRemoteContainer(manifest: MfManifest): Promise<Container> {
    // Check cache first
    if (this.loadedContainers.has(manifest.remoteName)) {
      return this.loadedContainers.get(manifest.remoteName)!;
    }

    // Module Federation container loading logic
    // 1. Dynamically load the remoteEntry.js script
    await this.loadScript(manifest.remoteEntry);

    // 2. Get container from window (Module Federation convention)
    const container = (window as any)[manifest.remoteName];
    if (!container) {
      throw new MfeLoadError(
        `Container '${manifest.remoteName}' not found after loading ${manifest.remoteEntry}`,
        []
      );
    }

    // 3. Initialize sharing scope
    await container.init(__webpack_share_scopes__.default);

    this.loadedContainers.set(manifest.remoteName, container);
    return container;
  }

  /**
   * Preload MFEs for faster subsequent mounting
   */
  async preload(entries: MfeEntryMF[]): Promise<void> {
    // Group entries by manifest to avoid redundant manifest loads
    const byManifest = new Map<string, MfeEntryMF[]>();
    for (const entry of entries) {
      const existing = byManifest.get(entry.manifest) || [];
      existing.push(entry);
      byManifest.set(entry.manifest, existing);
    }

    // Load all manifests and their containers in parallel
    await Promise.allSettled(
      Array.from(byManifest.keys()).map(async (manifestId) => {
        const manifest = await this.resolveManifest(manifestId);
        await this.loadRemoteContainer(manifest);
      })
    );
  }

  private async loadScript(url: string): Promise<void> {
    // Script loading with timeout and error handling
  }

  private unloadIfUnused(remoteName: string): void {
    // Cleanup the loaded container from memory if no entries using it
  }
}
```

**Example MfManifest Instance:**

```typescript
const analyticsManifest: MfManifest = {
  // TypeMetadata (populated by hydrateWithMetadata)
  typeId: 'gts.acme.analytics.mfe.mf.v1~',
  vendor: 'acme',
  package: 'analytics',
  namespace: 'mfe',
  type: 'mf',
  version: { major: 1 },

  // MfManifest fields
  remoteEntry: 'https://cdn.acme.com/analytics/remoteEntry.js',
  remoteName: 'acme_analytics',
  sharedDependencies: [
    { name: 'react', singleton: true, requiredVersion: '^18.0.0' },
    { name: 'react-dom', singleton: true, requiredVersion: '^18.0.0' },
  ],
  // Convenience field for discovery
  entries: [
    'gts.acme.analytics.mfe.entry.v1~hai3.mfe.entry_mf.v1:chart',
    'gts.acme.analytics.mfe.entry.v1~hai3.mfe.entry_mf.v1:metrics',
  ],
};
```

**Example MfeEntryMF Instance:**

```typescript
const chartEntry: MfeEntryMF = {
  // TypeMetadata (populated by hydrateWithMetadata)
  typeId: 'gts.acme.analytics.mfe.entry.v1~hai3.mfe.entry_mf.v1:chart',
  vendor: 'acme',
  package: 'analytics',
  namespace: 'mfe',
  type: 'entry',
  version: { major: 1 },

  // Base MfeEntry contract fields
  requiredProperties: [
    'gts.hai3.screensets.ext.shared_property.v1~:user_context',
    'gts.hai3.screensets.ext.shared_property.v1~:selected_date_range',
  ],
  optionalProperties: [
    'gts.hai3.screensets.ext.shared_property.v1~:theme',
  ],
  actions: ['gts.acme.analytics.ext.action.data_updated.v1~'],
  domainActions: ['gts.acme.analytics.ext.action.refresh.v1~'],

  // MfeEntryMF fields (Module Federation specific)
  manifest: 'gts.acme.analytics.mfe.mf.v1~',  // Reference to MfManifest
  exposedModule: './ChartWidget',  // Module Federation exposed module name
};
```

### Decision 14: Isolated Package Instances with Hierarchical Runtime

**What**: @hai3/screensets is configured as `singleton: false` in Module Federation, giving each MFE its own isolated copy of the package. Runtime instances form a tree where any MFE can also be a host for nested MFEs.

**Why**:
- **True isolation**: Each MFE has its own package instance - no shared state at any level
- **Hierarchical composition**: An MFE screen can define extension domains for nested widget MFEs
- **Independent HAI3 state**: Each runtime has its own state container, completely isolated

**Architecture Overview - Hierarchical MFE Tree**:

```
+-------------------------------------------------------------------------------+
|                        MODULE FEDERATION BUNDLES                               |
|  +---------------+  +---------------+  +---------------+  +---------------+    |
|  | react         |  | react-dom     |  | gts-ts        |  | @hai3/state   |    |
|  | (singleton)   |  | (singleton)   |  | (singleton)   |  | (singleton)   |    |
|  +---------------+  +---------------+  +---------------+  +---------------+    |
|                                                                                |
|  +---------------+  +---------------+  +---------------+                       |
|  | screensets    |  | screensets    |  | screensets    |  ... per MFE         |
|  | (host copy)   |  | (MFE-1 copy)  |  | (MFE-2 copy)  |                       |
|  +---------------+  +---------------+  +---------------+                       |
+-------------------------------------------------------------------------------+
        |                    |                    |
        v                    v                    v
+-------------------------------------------------------------------------------+
|                      HIERARCHICAL RUNTIME TREE                                 |
|                                                                                |
|  +-----------------------------------------------------------------------+    |
|  | HOST APP RUNTIME (L0)                                                  |    |
|  | +------------------+  +------------------+                             |    |
|  | | Domain: sidebar  |  | Domain: popup    |  (each domain = scope)      |    |
|  | +--------+---------+  +--------+---------+                             |    |
|  +----------+-----------------------+-------------------------------------+    |
|             |                       |                                          |
|     +-------v-------+       +-------v-------+                                  |
|     | MFE-1 RUNTIME |       | MFE-2 RUNTIME |  (L1 - can also be hosts)       |
|     | (Dashboard)   |       | (Settings)    |                                  |
|     | +-----------+ |       +---------------+                                  |
|     | |Domain:    | |                                                          |
|     | |widget_slot| |  (MFE-1 defines its own extension domain)               |
|     | +-----+-----+ |                                                          |
|     +-------+-------+                                                          |
|             |                                                                  |
|     +-------v-------+       +---------------+                                  |
|     | MFE-3 RUNTIME |       | MFE-4 RUNTIME |  (L2 - nested widgets)          |
|     | (Chart)       |       | (Metrics)     |                                  |
|     +---------------+       +---------------+                                  |
+-------------------------------------------------------------------------------+
```

**Module Federation Shared Configuration**:

```javascript
// Host and ALL MFEs webpack/rspack/vite config
shared: {
  // Singletons - MUST be shared (React hooks, shared schema registry)
  'react': { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  '@globaltypesystem/gts-ts': { singleton: true },  // Shared schema registry
  '@hai3/state': { singleton: true },  // Shared state primitives

  // NOT singleton - each MFE gets its own isolated copy
  '@hai3/screensets': {
    singleton: false,  // ISOLATED per MFE
    requiredVersion: '^1.0.0',
  },
}
```

**Why These Choices**:

| Package | Singleton? | Reason |
|---------|------------|--------|
| react, react-dom | Yes | React hooks break with multiple instances |
| @globaltypesystem/gts-ts | Yes | Schema registry must be shared - all validate against same schemas |
| @hai3/state | Yes | State primitives are stateless utilities |
| @hai3/screensets | **No** | Each MFE needs fully isolated ScreensetsRuntime instance, domains, mediator |

**Class-Based ScreensetsRuntime**:

Using a class provides clear encapsulation and supports the hierarchical pattern where any runtime can be both a child (connected to parent) and a host (managing its own domains).

```typescript
// packages/screensets/src/runtime/ScreensetsRuntime.ts

/**
 * ScreensetsRuntime - isolated instance per MFE.
 * Each instance can:
 * - Connect to a parent host (be a child MFE)
 * - Define extension domains and host nested MFEs (be a host)
 * - Both simultaneously (intermediate host pattern)
 */
class ScreensetsRuntime {
  // === Isolated State (per instance) ===
  private readonly domains = new Map<string, ExtensionDomainState>();
  private readonly extensions = new Map<string, ExtensionState>();
  private readonly childBridges = new Map<string, MfeBridgeConnection>();
  private readonly actionHandlers = new Map<string, ActionHandler>();

  // Parent connection (if this runtime is an MFE)
  private parentBridge: MfeBridgeConnection | null = null;

  // Isolated HAI3 state for this runtime
  private readonly state: HAI3State;

  // Type system reference (singleton, shared)
  public readonly typeSystem: TypeSystemPlugin;

  constructor(config: ScreensetsRuntimeConfig) {
    this.typeSystem = config.typeSystem;
    this.state = createHAI3State();  // Fresh isolated state

    if (config.mfeLoader) {
      this.mfeLoader = new MfeLoader(this.typeSystem, config.mfeLoader);
    }
  }

  // === Host Capabilities (any runtime can be a host) ===

  /**
   * Register an extension domain.
   * This runtime becomes a host for MFEs mounted into this domain.
   */
  registerDomain(domain: ExtensionDomain): void {
    // Validate domain schema
    const validation = this.typeSystem.validateInstance(
      'gts.hai3.screensets.ext.domain.v1~',
      domain
    );
    if (!validation.valid) {
      throw new DomainValidationError(validation.errors);
    }

    this.domains.set(domain.typeId, {
      domain,
      properties: new Map(),  // Domain-scoped property values
      extensions: new Set(),  // Extensions mounted into this domain
    });
  }

  /**
   * Set a shared property value for a specific domain.
   * Only extensions in this domain will receive the value.
   */
  setDomainProperty(domainId: string, propertyId: string, value: unknown): void {
    const domainState = this.domains.get(domainId);
    if (!domainState) {
      throw new Error(`Domain '${domainId}' not registered`);
    }

    // Validate property is in domain's sharedProperties
    if (!domainState.domain.sharedProperties.includes(propertyId)) {
      throw new ContractViolationError(
        `Property '${propertyId}' not in domain's sharedProperties`
      );
    }

    domainState.properties.set(propertyId, value);

    // Notify all extensions in this domain
    for (const extensionId of domainState.extensions) {
      const bridge = this.childBridges.get(extensionId);
      bridge?.notifyPropertyChange(propertyId, value);
    }
  }

  /**
   * Load an MFE from its MfeEntryMF definition.
   */
  async loadMfe(entry: MfeEntryMF): Promise<LoadedMfe> {
    if (!this.mfeLoader) {
      throw new Error('MfeLoader not configured');
    }
    return this.mfeLoader.load(entry);
  }

  /**
   * Mount an extension into a domain.
   * Creates a bridge scoped to that domain.
   */
  mountExtension(extension: Extension): MfeBridgeConnection {
    // Validate extension
    const validation = this.typeSystem.validateInstance(
      'gts.hai3.screensets.ext.extension.v1~',
      extension
    );
    if (!validation.valid) {
      throw new ExtensionValidationError(validation.errors);
    }

    const domainState = this.domains.get(extension.domain);
    if (!domainState) {
      throw new Error(`Domain '${extension.domain}' not registered`);
    }

    // Contract validation
    const entry = this.getEntry(extension.entry);
    const contractResult = this.validateContract(entry, domainState.domain);
    if (!contractResult.valid) {
      throw new ContractValidationError(contractResult.errors);
    }

    // Dynamic uiMeta validation
    const uiMetaResult = this.validateExtensionUiMeta(extension, domainState.domain);
    if (!uiMetaResult.valid) {
      throw new UiMetaValidationError(uiMetaResult.errors);
    }

    // Create domain-scoped bridge for this extension
    const instanceId = generateInstanceId();
    const bridge = this.createBridge(domainState, entry, instanceId);

    this.extensions.set(instanceId, { extension, entry, bridge });
    this.childBridges.set(instanceId, bridge);
    domainState.extensions.add(instanceId);

    return bridge;
  }

  // === Child Capabilities (connecting to parent host) ===

  /**
   * Connect this runtime to a parent host via bridge.
   * Used when this runtime is loaded as an MFE.
   */
  connectToParent(bridge: MfeBridgeConnection): void {
    this.parentBridge = bridge;

    // Subscribe to parent's property changes
    bridge.subscribeToAllProperties((props) => {
      // Update local state with parent's properties
      this.handleParentProperties(props);
    });

    // Register action handlers for domain actions this MFE can receive
    // Action types come from entry.domainActions
    this.registerDomainActionHandlers(bridge);
  }

  /**
   * Register action handlers for all actions this entry can receive.
   * Called during connectToParent to set up bidirectional communication.
   */
  private registerDomainActionHandlers(bridge: MfeBridgeConnection): void {
    // Register handlers based on entry's domainActions contract
    for (const [actionTypeId, handler] of this.actionHandlers.entries()) {
      bridge.registerActionHandler(actionTypeId, handler);
    }
  }

  /**
   * Send actions chain to parent host.
   */
  async sendToParent(chain: ActionsChain): Promise<ChainResult> {
    if (!this.parentBridge) {
      throw new Error('Not connected to parent host');
    }
    return this.parentBridge.sendActionsChain(chain);
  }

  /**
   * Get shared properties from parent.
   */
  getParentProperties(): Readonly<Record<string, unknown>> {
    if (!this.parentBridge) {
      throw new Error('Not connected to parent host');
    }
    return this.parentBridge.getSharedProperties();
  }

  // === Actions Chain Mediation ===
  // Note: These methods delegate to the internal ActionsChainsMediator

  /**
   * Execute an actions chain via the internal ActionsChainsMediator.
   * Routes to appropriate target (local domain, child extension, or parent).
   */
  async executeActionsChain(chain: ActionsChain): Promise<ChainResult> {
    const { target, type, payload } = chain.action;

    // Validate action
    const validation = this.typeSystem.validateInstance(type, payload);
    if (!validation.valid) {
      return this.handleChainFailure(chain, validation.errors);
    }

    try {
      // Route based on target
      if (this.domains.has(target)) {
        // Target is a local domain - deliver to domain handler
        await this.deliverToDomain(target, chain.action);
      } else if (this.childBridges.has(target)) {
        // Target is a child extension - deliver via bridge
        await this.deliverToChild(target, chain.action);
      } else if (this.parentBridge && target === this.parentBridge.domainId) {
        // Target is parent - send up
        return this.parentBridge.sendActionsChain(chain);
      } else {
        throw new Error(`Unknown target: ${target}`);
      }

      // Success - execute next chain if present
      if (chain.next) {
        return this.executeActionsChain(chain.next);
      }
      return { success: true };

    } catch (error) {
      return this.handleChainFailure(chain, error);
    }
  }

  private async handleChainFailure(
    chain: ActionsChain,
    error: unknown
  ): Promise<ChainResult> {
    if (chain.fallback) {
      return this.executeActionsChain(chain.fallback);
    }
    return { success: false, error };
  }

  // === Lifecycle ===

  /**
   * Cleanup runtime instance.
   */
  dispose(): void {
    // Disconnect from parent
    this.parentBridge?.dispose();
    this.parentBridge = null;

    // Dispose all child bridges
    for (const bridge of this.childBridges.values()) {
      bridge.dispose();
    }
    this.childBridges.clear();

    // Clear all state
    this.domains.clear();
    this.extensions.clear();
    this.actionHandlers.clear();
  }
}
```

**Runtime Configuration**:

See `ScreensetsRuntimeConfig` in Decision 6 for the complete interface definition. The key fields used in hierarchical patterns are:

- `typeSystem`: Required Type System plugin (shared singleton reference)
- `mfeLoader`: Optional MFE loader configuration (enables hosting nested MFEs)
- `parentBridge`: Optional initial parent bridge (if loaded as MFE)

**Nested MFE Example - Dashboard with Widgets**:

```typescript
// Dashboard MFE - acts as BOTH child (to host) AND host (to widgets)

export default function DashboardMfe({ bridge }: MfeBridgeProps) {
  // Dashboard's OWN isolated screensets runtime
  const runtime = useMemo(() => new ScreensetsRuntime({
    typeSystem: getGtsPlugin(),  // Shared singleton
    mfeLoader: { timeout: 30000 },  // Enable loading nested MFEs
  }), []);

  // Connect to parent host
  useEffect(() => {
    runtime.connectToParent(bridge);
    return () => runtime.dispose();
  }, [runtime, bridge]);

  // Register Dashboard's OWN extension domain for widgets
  useEffect(() => {
    runtime.registerDomain({
      typeId: 'gts.acme.dashboard.ext.domain.widget_slot.v1~',
      sharedProperties: ['gts.acme.dashboard.ext.shared_property.dashboard_context.v1~'],
      actions: ['gts.acme.dashboard.ext.action.refresh.v1~'],
      extensionsActions: ['gts.acme.dashboard.ext.action.widget_ready.v1~'],
      extensionsUiMeta: { type: 'object', properties: { size: { enum: ['sm', 'md', 'lg'] } } },
    });
  }, [runtime]);

  // Load widget MFEs into Dashboard's domain
  const loadWidget = async (widgetEntry: MfeEntryMF) => {
    const widget = await runtime.loadMfe(widgetEntry);
    const widgetBridge = runtime.mountExtension({
      typeId: `gts.widget.ext.extension.v1~:${widgetEntry.typeId}`,
      domain: 'gts.acme.dashboard.ext.domain.widget_slot.v1~',
      entry: widgetEntry.typeId,
      uiMeta: { size: 'md' },
    });
    return { widget, bridge: widgetBridge };
  };

  return (
    <ScreensetsRuntimeProvider runtime={runtime}>
      <DashboardLayout>
        {/* Widget slots - render loaded widget MFEs here */}
        <WidgetSlot domainId="gts.acme.dashboard.ext.domain.widget_slot.v1~" />
      </DashboardLayout>
    </ScreensetsRuntimeProvider>
  );
}
```

**Domain-Scoped Properties**:

Each ExtensionDomain maintains its own property values. Different domains can have the same property type with different values:

```typescript
// Host has two domains with different userContext values
hostRuntime.registerDomain(sidebarDomain);
hostRuntime.registerDomain(popupDomain);

// Set different values per domain
hostRuntime.setDomainProperty(
  'gts.hai3.layout.ext.domain.sidebar.v1~',
  'gts.hai3.screensets.ext.shared_property.user_context.v1~',
  { userId: '123', role: 'admin', scope: 'full' }
);

hostRuntime.setDomainProperty(
  'gts.hai3.layout.ext.domain.popup.v1~',
  'gts.hai3.screensets.ext.shared_property.user_context.v1~',
  { userId: '123', role: 'admin', scope: 'limited' }  // Different scope!
);

// MFE in sidebar gets 'full' scope
// MFE in popup gets 'limited' scope
// They don't see each other's values
```

**Why Class-Based Approach**:

| Aspect | Function Factory | Class |
|--------|------------------|-------|
| State encapsulation | Closures | Private fields |
| Inheritance | Composition | Extends |
| Instance identity | Via returned object | `instanceof` check |
| Method binding | Arrow functions | Class methods |
| Tree-shaking | Better | Slightly worse |
| **Chosen** | | **Yes** |

Classes are chosen because:
1. Clear encapsulation of complex state
2. Easier to extend for framework-specific runtimes
3. `instanceof` checks for type narrowing
4. Better IDE support for method discovery

### Decision 15: MFE Bridge Communication Protocol

**What**: The bridge is the domain-scoped communication contract between parent runtime and child MFE runtime. In hierarchical MFE trees, an MFE can have bridges both to its parent AND to its children.

**Key Design Decision**: Actions chains are **BIDIRECTIONAL** - they flow both parent-to-child AND child-to-parent through the same mechanism. The `domain.actions` field in ExtensionDomain is simply a LIST of action types the domain can execute, not a separate communication channel.

**Architecture**:

```
+-----------------+         BRIDGE          +-----------------+
| PARENT RUNTIME  | <---------------------> |  CHILD RUNTIME  |
|                 |                          |                 |
| ExtensionDomain |  --- sharedProperties -->| getSharedProps  |
| (domain-scoped) |  <-- actionsChain ------| sendActionsChain|
|                 |  --- actionsChain ----->| (via handlers)  |
+-----------------+                          +-----------------+
                                             (can also be a parent
                                              to nested MFEs)
```

**Bidirectional Actions Chain Flow**:
- **Child to Parent**: Child calls `bridge.sendActionsChain(chain)` to send actions to parent
- **Parent to Child**: Parent runtime calls `bridge.deliverActionsChain(chain)` to send actions to child
- Both directions use the SAME actions chain structure
- Child registers action handlers for action types it can receive (listed in `entry.domainActions`)

**Bridge Interface**:

```typescript
// packages/screensets/src/mfe/bridge/types.ts

/**
 * Bridge connection from MFE to Host.
 * Created by host, passed to MFE as props.
 */
interface MfeBridgeConnection {
  /** Unique ID for this MFE instance */
  readonly instanceId: string;

  /** Extension domain this MFE is mounted into */
  readonly domainId: string;

  /** MFE entry type ID */
  readonly entryId: string;

  // === Properties (Host to MFE) ===

  /** Get current shared properties snapshot */
  getSharedProperties(): Readonly<Record<string, unknown>>;

  /** Subscribe to property changes */
  subscribeToProperty(
    propertyId: string,
    callback: (value: unknown) => void
  ): () => void;

  /** Subscribe to all properties */
  subscribeToAllProperties(
    callback: (properties: Record<string, unknown>) => void
  ): () => void;

  // === Actions Chain (BIDIRECTIONAL) ===

  /** Send actions chain to parent host (Child to Parent) */
  sendActionsChain(chain: ActionsChain): Promise<ChainResult>;

  /**
   * Register handler for incoming actions chains (Parent to Child)
   * Handler receives chains where action.type is in entry.domainActions
   */
  registerActionHandler(
    actionTypeId: string,
    handler: (action: Action) => Promise<void>
  ): () => void;

  // === Lifecycle ===

  /** Called when MFE is being unmounted */
  dispose(): void;
}

/**
 * Internal bridge interface used by parent runtime to deliver chains to child.
 * Not exposed to MFE - used by ScreensetsRuntime internally.
 */
interface MfeBridgeInternal extends MfeBridgeConnection {
  /**
   * Deliver actions chain to child MFE (Parent to Child)
   * Called by parent runtime when chain targets this extension
   */
  deliverActionsChain(chain: ActionsChain): Promise<ChainResult>;

  /** Notify child of property change */
  notifyPropertyChange(propertyId: string, value: unknown): void;
}
```

**Bridge Creation by Host**:

```typescript
// packages/screensets/src/mfe/bridge/factory.ts

/**
 * Host creates a bridge for each MFE instance.
 * The bridge provides controlled access to host capabilities.
 * Supports BIDIRECTIONAL actions chain communication.
 */
function createMfeBridge(
  hostRuntime: ScreensetsRuntime,
  domain: ExtensionDomain,
  entry: MfeEntry,
  instanceId: string
): MfeBridgeInternal {
  const propertySubscribers = new Map<string, Set<(value: unknown) => void>>();
  // Action handlers keyed by action type ID (for Parent to Child delivery)
  const actionHandlers = new Map<string, (action: Action) => Promise<void>>();

  return {
    instanceId,
    domainId: domain.typeId,
    entryId: entry.typeId,

    getSharedProperties() {
      // Return only properties defined in domain.sharedProperties
      const props: Record<string, unknown> = {};
      for (const propId of domain.sharedProperties) {
        props[propId] = hostRuntime.getPropertyValue(domain.typeId, propId);
      }
      return Object.freeze(props);
    },

    subscribeToProperty(propertyId, callback) {
      // Validate property is in contract
      if (!domain.sharedProperties.includes(propertyId)) {
        throw new ContractViolationError(
          `Property '${propertyId}' not in domain's sharedProperties`
        );
      }

      if (!propertySubscribers.has(propertyId)) {
        propertySubscribers.set(propertyId, new Set());
      }
      propertySubscribers.get(propertyId)!.add(callback);

      // Return unsubscribe function
      return () => {
        propertySubscribers.get(propertyId)?.delete(callback);
      };
    },

    subscribeToAllProperties(callback) {
      const unsubscribes = domain.sharedProperties.map(propId =>
        this.subscribeToProperty(propId, () => {
          callback(this.getSharedProperties());
        })
      );
      return () => unsubscribes.forEach(unsub => unsub());
    },

    // === Child to Parent ===
    async sendActionsChain(chain) {
      // Validate action is in entry's contract (actions entry can EMIT)
      const actionTypeId = chain.action.type;
      if (!entry.actions.includes(actionTypeId)) {
        throw new ContractViolationError(
          `Action '${actionTypeId}' not in entry's actions contract`
        );
      }

      // Validate payload against action schema
      const validation = hostRuntime.typeSystem.validateInstance(
        actionTypeId,
        chain.action.payload
      );
      if (!validation.valid) {
        throw new PayloadValidationError(validation.errors);
      }

      // Execute via host runtime
      return hostRuntime.executeActionsChain(chain);
    },

    // === Parent to Child (handler registration) ===
    registerActionHandler(actionTypeId, handler) {
      // Validate action is in entry's domainActions (actions entry can RECEIVE)
      if (!entry.domainActions.includes(actionTypeId)) {
        throw new ContractViolationError(
          `Action '${actionTypeId}' not in entry's domainActions contract`
        );
      }

      actionHandlers.set(actionTypeId, handler);
      return () => actionHandlers.delete(actionTypeId);
    },

    // === Parent to Child (delivery - internal use) ===
    async deliverActionsChain(chain) {
      const actionTypeId = chain.action.type;
      const handler = actionHandlers.get(actionTypeId);

      if (!handler) {
        return {
          success: false,
          error: `No handler registered for action '${actionTypeId}'`,
        };
      }

      try {
        await handler(chain.action);

        // Success - execute next chain if present
        if (chain.next) {
          return hostRuntime.executeActionsChain(chain.next);
        }
        return { success: true };
      } catch (error) {
        // Failure - execute fallback chain if present
        if (chain.fallback) {
          return hostRuntime.executeActionsChain(chain.fallback);
        }
        return { success: false, error };
      }
    },

    notifyPropertyChange(propertyId, value) {
      const subscribers = propertySubscribers.get(propertyId);
      if (subscribers) {
        for (const callback of subscribers) {
          callback(value);
        }
      }
    },

    dispose() {
      propertySubscribers.clear();
      actionHandlers.clear();
    },
  };
}
```

**Property Propagation Flow**:

```
1. Host domain updates property value
2. Host runtime notifies all bridges for that domain
3. Bridge calls subscribed callbacks in MFE
4. MFE re-renders with new property value

Host:  domain.setProperty('userContext', newValue)
         |
       hostRuntime.notifyPropertyChange(domainId, 'userContext', newValue)
         |
       bridge.notifyPropertyChange('userContext', newValue)
         |
MFE:   useSyncExternalStore re-renders with newValue
```

**Bidirectional Actions Chain Flow**:

Actions chains flow BOTH directions through the same mechanism:

**Child to Parent Flow**:
```
1. MFE sends actions chain via bridge
2. Host validates action is in entry.actions contract
3. Host validates payload schema
4. Host mediator executes chain
5. Result returned to MFE

MFE:   bridge.sendActionsChain({ action: { target, type, payload }, next, fallback })
         |
       Host validates: entry.actions.includes(action.type)
         |
       Host validates: typeSystem.validateInstance(action.type, payload)
         |
       Host ActionsChainsMediator: executeActionsChain(chain)
         |
       Target handles action -> success/failure
         |
       Mediator follows next/fallback chain
         |
MFE:   Promise resolves with ChainResult
```

**Parent to Child Flow**:
```
1. Host runtime sends actions chain to child via bridge
2. Bridge validates action is in entry.domainActions contract
3. Bridge delivers to registered handler
4. Handler processes action
5. Success/failure triggers next/fallback chain

Host:  runtime.sendToChild(extensionId, { action: { target, type, payload }, next, fallback })
         |
       bridge.deliverActionsChain(chain)
         |
       Bridge validates: entry.domainActions.includes(action.type)
         |
       handler = actionHandlers.get(action.type)
         |
       await handler(action)
         |
       Success -> execute chain.next (if present)
       Failure -> execute chain.fallback (if present)
         |
Host:  Promise resolves with ChainResult
```

**MFE Action Handler Registration**:
```typescript
// Inside MFE component
useEffect(() => {
  // Register handlers for actions this entry can RECEIVE (domainActions)
  const unsubscribe = bridge.registerActionHandler(
    'gts.acme.dashboard.ext.action.refresh.v1~',
    async (action) => {
      // Handle refresh action from parent
      await refreshData();
    }
  );

  return () => unsubscribe();
}, [bridge]);
```

### Decision 16: Shadow DOM for Style Isolation

**What**: Each MFE entry renders inside a Shadow DOM container that isolates its styles from the host and other MFEs.

**Why**:
- Web standard with excellent browser support (>96%)
- CSS custom properties (theme variables) pierce the shadow boundary
- No build coordination required between host and MFEs
- Declarative Shadow DOM enables future SSR path

**CSS Variables Strategy**:

```css
/* Host defines theme variables (these pierce shadow boundary) */
:root {
  --hai3-color-primary: #3b82f6;
  --hai3-color-secondary: #64748b;
  --hai3-spacing-unit: 4px;
  --hai3-border-radius: 8px;
  --hai3-font-family: system-ui, sans-serif;
}

/* MFE styles reference variables (works inside shadow DOM) */
.mfe-button {
  background: var(--hai3-color-primary);
  padding: calc(var(--hai3-spacing-unit) * 2);
  border-radius: var(--hai3-border-radius);
  font-family: var(--hai3-font-family);
}
```

**Shadow DOM Utilities**:

```typescript
// packages/screensets/src/mfe/shadow/index.ts

interface ShadowContainerOptions {
  /** Shadow DOM mode (default: 'open') */
  mode?: 'open' | 'closed';
  /** Inject CSS reset into shadow root */
  injectReset?: boolean;
  /** Additional styles to inject */
  styles?: string[];
}

/**
 * Create a shadow root container for MFE isolation
 */
function createShadowContainer(
  hostElement: HTMLElement,
  options: ShadowContainerOptions = {}
): ShadowRoot {
  const { mode = 'open', injectReset = true, styles = [] } = options;

  const shadowRoot = hostElement.attachShadow({ mode });

  // Inject CSS reset to prevent host style leakage
  if (injectReset) {
    const resetStyle = document.createElement('style');
    resetStyle.textContent = `
      :host {
        all: initial;
        display: block;
        contain: content;
      }
    `;
    shadowRoot.appendChild(resetStyle);
  }

  // Inject additional styles
  for (const css of styles) {
    const style = document.createElement('style');
    style.textContent = css;
    shadowRoot.appendChild(style);
  }

  return shadowRoot;
}

/**
 * Inject CSS variables from host into shadow root
 * Called when theme changes to update MFE styling
 */
function syncCssVariables(
  shadowRoot: ShadowRoot,
  variablePrefix = '--hai3-'
): void {
  const rootStyles = getComputedStyle(document.documentElement);
  const variables: string[] = [];

  // Extract all HAI3 theme variables
  for (const prop of document.documentElement.style) {
    if (prop.startsWith(variablePrefix)) {
      variables.push(`${prop}: ${rootStyles.getPropertyValue(prop)};`);
    }
  }

  // Apply to shadow root host
  const style = shadowRoot.querySelector('style[data-theme]')
    || document.createElement('style');
  style.setAttribute('data-theme', 'true');
  style.textContent = `:host { ${variables.join(' ')} }`;

  if (!style.parentNode) {
    shadowRoot.appendChild(style);
  }
}
```

## Data Flow Diagrams

### Extension Loading and Mounting Flow

```
+------------------+     1. Load MFE      +------------------+
|   HOST APP       | ------------------>  | MFE LOADER       |
| (with Domain)    |                      | (Module Fed 2.0) |
+--------+---------+                      +--------+---------+
         |                                         |
         |                                    2. Resolve Manifest
         |                                    3. Fetch Bundle
         |                                         |
         |                                         v
         |                                +------------------+
         |                                | REMOTE SERVER    |
         |                                | (MFE Bundle)     |
         |                                +--------+---------+
         |                                         |
         |     4. Return Loaded Component          |
         | <---------------------------------------+
         |
         v
+--------+---------+     5. Validate      +------------------+
| SCREENSETS       | <----------------->  | TYPE SYSTEM      |
| RUNTIME          |     Contract         | PLUGIN (GTS)     |
+--------+---------+                      +------------------+
         |
         | 6. Contract Valid
         v
+--------+---------+
| SHADOW DOM       |
| CONTAINER        |
+--------+---------+
         |
         | 7. Mount in Shadow Root
         v
+------------------+
| MFE COMPONENT    |
| (with Bridge)    |
+------------------+
```

### Shared Properties Flow (Domain to Extension)

```
+------------------+                      +------------------+
|   DOMAIN STATE   |  1. State Change    | SCREENSETS       |
| (Host HAI3 Store)|  ---------------->  | RUNTIME          |
+--------+---------+                      +--------+---------+
                                                   |
                                          2. Update Shared Properties
                                                   |
                    +------------------------------+
                    |
                    v
+------------------+     3. Notify       +------------------+
| SHARED PROPS     | ----------------->  | MFE BRIDGE       |
| SUBSCRIPTION     |                     | (per Extension)  |
+------------------+                     +--------+---------+
                                                  |
                                         4. Callback
                                                  |
                                                  v
                                         +------------------+
                                         | MFE COMPONENT    |
                                         | (Re-render)      |
                                         +------------------+
```

### Actions Chain Flow (Extension to Domain and Back)

```
+------------------+                      +------------------+
| MFE COMPONENT    |  1. sendActionsChain | MFE BRIDGE      |
| (User Action)    | ------------------> |                  |
+------------------+                      +--------+---------+
                                                   |
                                          2. Validate Action in Contract
                                                   |
                                                   v
+------------------+                      +------------------+
| TYPE SYSTEM      | <---3. Validate---> | SCREENSETS       |
| PLUGIN (GTS)     |    Payload Schema   | RUNTIME          |
+------------------+                      +--------+---------+
                                                   |
                                          4. Resolve Target
                                                   |
                    +------------------------------+
                    |
                    v
+------------------+     5. Deliver      +------------------+
| DOMAIN HANDLER   | <----------------- | ACTION CHAIN     |
| (Host L2 Layer)  |    Action+Payload   | EXECUTOR         |
+--------+---------+                     +--------+---------+
         |                                        |
         | 6. Execute (Flux Dispatch)             |
         |                                        |
         v                                        |
+------------------+                              |
| SUCCESS/FAILURE  | --------------------------->+
|                  |  7. Result                   |
+------------------+                              |
                                                  |
                                         8. Execute next/fallback
                                                  |
                                                  v
                                         +------------------+
                                         | NEXT TARGET      |
                                         | (Chain Continues)|
                                         +------------------+
```

## Component Architecture Diagram

```
+==============================================================================+
|                              HOST APPLICATION                                  |
|                                                                               |
|  +--------------------------+     +--------------------------------------+    |
|  |     HOST HAI3 STORE      |     |        SCREENSETS RUNTIME            |    |
|  |    (Isolated State)      |     |  +--------------------------------+  |    |
|  +--------------------------+     |  | Type System Plugin (GTS)       |  |    |
|                                   |  | - Schema Registry              |  |    |
|  +--------------------------+     |  | - Type Validation              |  |    |
|  |    EXTENSION DOMAIN      |     |  | - Contract Matching            |  |    |
|  |  (sidebar.v1~)           |     |  +--------------------------------+  |    |
|  |                          |     |  | Actions Chain Executor         |  |    |
|  |  sharedProperties:       |     |  | - Target Resolution            |  |    |
|  |    - user_context        |     |  | - Success/Failure Routing      |  |    |
|  |  actions: [refresh]      |     |  +--------------------------------+  |    |
|  |  extensionsActions:      |     +--------------------------------------+    |
|  |    - data_update         |                      |                          |
|  +-----------+--------------+                      |                          |
|              |                                     |                          |
|              | Contract Validation                 |                          |
|              +-------------------------------------+                          |
|              |                                                                |
|  +-----------v--------------+                                                 |
|  |   EXTENSION SLOT         |                                                 |
|  |   (Shadow DOM Container) |                                                 |
|  |                          |                                                 |
|  |  +--------------------+  |     +--------------------------------------+    |
|  |  |  SHADOW ROOT       |  |     |         MFE INSTANCE                 |    |
|  |  |  (Style Isolation) |  |     |                                      |    |
|  |  |                    |  |     |  +--------------------------------+  |    |
|  |  |  +---------------+ |  |     |  |     MFE HAI3 STORE             |  |    |
|  |  |  | CSS Variables | |  |     |  |    (Isolated State)            |  |    |
|  |  |  | (Theme)       | |  |     |  +--------------------------------+  |    |
|  |  |  +---------------+ |  |     |                                      |    |
|  |  |                    |  |     |  +--------------------------------+  |    |
|  |  |  +---------------+ |  |---->|  |     MFE BRIDGE                 |  |    |
|  |  |  | MFE COMPONENT | |  |     |  | - subscribeToProperty()        |  |    |
|  |  |  | (Rendered)    | |  |     |  | - sendActionsChain()           |  |    |
|  |  |  +---------------+ |  |     |  | - onDomainAction()             |  |    |
|  |  +--------------------+  |     |  +--------------------------------+  |    |
|  +--------------------------+     +--------------------------------------+    |
|                                                                               |
+===============================================================================+
```

## Risks / Trade-offs

### Risk Summary Table

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| React version mismatch host/MFE | Critical (runtime crash) | Medium | Strict shared dep version validation at load time via Module Federation |
| CSS leakage despite Shadow DOM | Medium (visual bugs) | Low | CSS reset in shadow root, automated visual regression testing |
| Contract mismatch at runtime | High (mount failure) | Medium | Validate contracts at registration, clear error messages with type IDs |
| Actions chain loops | High (infinite recursion) | Low | Max chain depth limit (default: 10), loop detection in ActionsChainsMediator |
| Slow MFE loads | Medium (poor UX) | Medium | Preloading strategies, loading skeletons, configurable timeouts |
| Contract evolution breaks MFEs | High (integration failure) | Medium | Semantic versioning in type IDs, new versions are new types |
| Plugin implementation complexity | Medium (adoption barrier) | Medium | Ship GTS as reference, comprehensive docs, testing utilities |

### Risk 1: Contract Evolution

**Risk:** Changing domain contracts may break existing MFE entries.

**Mitigation:**
- Use semantic versioning in type IDs (plugin-agnostic)
- New domain versions are new types (not modifications)
- Use plugin's `checkCompatibility()` when available
- Document contract stability levels

### Risk 2: Performance Overhead

**Risk:** Action chain execution adds latency.

**Mitigation:**
- Actions are async by design (no blocking)
- Batch related actions where possible
- Profile and optimize hot paths
- Plugin implementations can optimize type resolution

### Risk 3: Debugging Complexity

**Risk:** Distributed state makes debugging harder.

**Mitigation:**
- ActionsChainsMediator logs all action chains with type IDs
- DevTools extension for MFE state inspection
- Clear error messages with chain context and plugin details

### Risk 4: Plugin Implementation Complexity

**Risk:** Implementing a custom Type System plugin requires understanding the full interface.

**Mitigation:**
- Provide comprehensive interface documentation
- Ship GTS plugin as reference implementation
- Create plugin testing utilities
- Minimal required methods vs optional methods clearly documented

### Risk 5: React Version Mismatch

**Risk:** Host and MFE may use different React versions causing runtime crashes.

**Mitigation:**
- Module Federation shared dependency configuration enforces single React instance
- Validate React version at MFE load time before mounting
- Clear error message if version mismatch detected
- Document supported React version ranges

### Risk 6: CSS Leakage Despite Shadow DOM

**Risk:** Some styles may leak into or out of Shadow DOM containers.

**Mitigation:**
- Inject CSS reset (`all: initial`) in shadow root
- Use `contain: content` for additional isolation
- Automated visual regression testing for MFE components
- Document CSS variable naming conventions

### Risk 7: Actions Chain Loops

**Risk:** Circular action chains could cause infinite recursion.

**Mitigation:**
- Implement max chain depth limit (configurable, default: 10)
- Track visited targets in chain execution
- Detect and break loops with clear error message
- Log chain execution path for debugging

### Risk 8: Slow MFE Bundle Loads

**Risk:** Remote MFE bundles may load slowly, degrading user experience.

**Mitigation:**
- Preload known MFEs during idle time
- Show loading skeleton in extension slot
- Configurable timeout with retry mechanism
- Bundle size monitoring and alerts

## Migration Plan

### Phase 1: SDK Contracts and Type System Plugin Infrastructure

**Goal**: Define the plugin interface and core type contracts.

1. Define `TypeSystemPlugin` interface with all required methods
2. Create supporting types (`ParsedTypeId`, `ValidationResult`, `CompatibilityResult`, etc.)
3. Define `TypeMetadata` interface for extracted type ID metadata
4. Create `parseTypeId()` and `hydrateWithMetadata()` utilities
5. Export plugin interface from `@hai3/screensets`
6. Document plugin interface with examples

**Deliverables**:
- `packages/screensets/src/mfe/plugins/types.ts`
- `packages/screensets/src/mfe/types/metadata.ts`
- Plugin interface documentation

### Phase 2: GTS Plugin Implementation

**Goal**: Ship GTS as the default Type System plugin.

1. Implement GTS plugin using `@globaltypesystem/gts-ts`
2. Implement all plugin interface methods (`parseTypeId`, `validateInstance`, etc.)
3. Register HAI3 MFE type schemas (6 core types + 2 MF-specific types: MfeEntry, ExtensionDomain, Extension, SharedProperty, Action, ActionsChain, MfManifest, MfeEntryMF)
4. Test all plugin interface methods with real GTS type IDs
5. Export as `@hai3/screensets/plugins/gts`
6. Add peer dependency on `@globaltypesystem/gts-ts`

**Deliverables**:
- `packages/screensets/src/mfe/plugins/gts/index.ts`
- `packages/screensets/src/mfe/schemas/gts-schemas.ts`
- GTS plugin unit tests

### Phase 3: Internal TypeScript Types and Schemas

**Goal**: Define all MFE types with TypeMetadata extraction.

1. Define MFE TypeScript interfaces with generic `TTypeId` (6 core + 2 MF-specific types)
2. Create JSON schemas with proper `$id` and `x-gts-ref` references (Action uses `x-gts-ref: "/$id"` for self-reference)
3. Implement `registerHai3Types(plugin)` function
4. Implement x-gts-ref reference validation
5. Export types from `@hai3/screensets`

**Deliverables**:
- `packages/screensets/src/mfe/types/index.ts`
- Complete JSON schema definitions
- Type registration utilities

### Phase 4: Framework Integration

**Goal**: Wire Type System plugin through all layers.

1. Update `ScreensetsRuntimeConfig` to require `typeSystem`
2. Implement `createScreensetsRuntime()` factory
3. Create `MicrofrontendsPluginConfig` for @hai3/framework
4. Implement `createMicrofrontendsPlugin()` factory
5. Register base layout domains via plugin
6. Expose runtime via `framework.provide()`

**Deliverables**:
- Updated runtime configuration
- Framework microfrontends plugin
- Base domain definitions

### Phase 5: MFE Loading and Shadow DOM

**Goal**: Implement MFE bundle loading with style isolation.

1. Implement `MfeLoader` class with Module Federation 2.0
2. Add entry and manifest validation against GTS schemas
3. Implement `createShadowContainer()` for style isolation
4. Implement `syncCssVariables()` for theme propagation
5. Add preloading and retry mechanisms
6. Create loading skeleton components

**Deliverables**:
- `packages/screensets/src/mfe/loader/index.ts`
- `packages/screensets/src/mfe/shadow/index.ts`
- Vite plugin configuration for Module Federation

### Phase 6: Contract Validation and Actions Chain Mediation

**Goal**: Implement contract matching and action chain mediation.

1. Implement contract matching algorithm (3 subset rules)
2. Add validation at extension registration time
3. Implement `ActionsChainsMediator` with `executeActionsChain(chain)` method
4. Implement success/failure path routing in mediator
5. Add max depth limit and loop detection in mediator
6. Create clear error messages with type ID context

**Deliverables**:
- `packages/screensets/src/mfe/validation/contract.ts`
- `packages/screensets/src/mfe/mediator/ActionsChainsMediator.ts`
- Contract error types and messages

### Phase 7: MfeBridge and State Isolation

**Goal**: Implement the MFE communication layer.

1. Create `MfeBridge` class for MFE-to-runtime communication
2. Implement shared property subscription
3. Implement actions chain sending with contract validation
4. Create `useMfeBridge()` React hook
5. Implement isolated state container factory
6. Add state disposal on MFE unmount

**Deliverables**:
- `packages/screensets/src/mfe/bridge/index.ts`
- `MfeBridgeContext` and provider
- State isolation utilities

### Phase 8: Documentation and Examples

**Goal**: Comprehensive documentation and working examples.

1. Update `.ai/targets/SCREENSETS.md` with MFE architecture
2. Create MFE vendor development guide
3. Document `TypeSystemPlugin` interface
4. Document GTS plugin usage and type schemas
5. Create custom plugin implementation guide
6. Create example MFE implementation

**Deliverables**:
- Updated SCREENSETS.md
- Vendor SDK documentation
- Example MFE project

### Phase 9: Production Hardening

**Goal**: Ensure production readiness.

1. Performance testing for action chain execution
2. Bundle size optimization
3. Error boundary implementation
4. DevTools extension for MFE debugging
5. Visual regression testing setup
6. Security audit for cross-MFE communication

**Deliverables**:
- Performance benchmarks
- DevTools extension
- Security documentation

## Open Questions

### Q1: How to handle MFE bundle loading errors?

**Proposal:** ScreensetsRuntime provides fallback UI with retry option. Domain can define custom error handling via actions chain.

**Details:**
- Show loading skeleton while bundle loads
- On timeout (configurable, default 30s), show error UI with retry button
- Log error with bundle URL and timeout details
- Domain can provide custom `errorFallbackComponent` in config

### Q2: Should optional properties have defaults?

**Decision:** No. Domain is responsible for providing all values. This keeps the contract simple and explicit.

**Rationale:**
- Defaults would require synchronization between domain and entry
- Domain knows the runtime context, entry does not
- Simpler mental model: domain provides, entry consumes

### Q3: How to version action payloads?

**Proposal:** Action type IDs include version. Breaking payload changes require new action type. Plugin's versioning convention is used.

**Example:**
- `gts.hai3.screensets.ext.action.refresh.v1~` - original action
- `gts.hai3.screensets.ext.action.refresh.v2~` - breaking payload change (new type)
- Domain can support both v1 and v2 during migration

### Q4: Can plugins be swapped at runtime?

**Decision:** No. Plugin is set at initialization and cannot be changed. This ensures type ID consistency throughout the application lifecycle.

**Rationale:**
- Type IDs registered with one plugin may not be valid in another
- Schemas are cached in plugin's internal registry
- Runtime swap would require re-registration of all types

### Q5: How to handle authentication tokens for MFEs?

**Open:** How should MFEs receive authentication tokens for API calls?

**Options:**
1. Pass via shared property (`authToken` in domain's `sharedProperties`)
2. MFE calls host's auth service via actions chain
3. Use browser cookie/session (if same origin)
4. Host provides token refresh callback via bridge

**Recommendation:** Option 1 for simplicity. Domain subscribes to token changes and updates shared property. MFE receives updates via property subscription.

### Q6: How to handle deep linking into MFE routes?

**Open:** If an MFE has internal routing, how does the host handle deep links?

**Options:**
1. MFE reports its route state via action, host updates URL
2. Host passes initial route via shared property on mount
3. MFE manages its own URL segment (path prefix convention)

**Recommendation:** Combination of options 1 and 2. Host provides `initialRoute` property, MFE sends `routeChanged` action when internal navigation occurs.

### Q7: What is the error boundary strategy?

**Open:** How should React error boundaries work across MFE boundaries?

**Options:**
1. Each MFE wrapped in its own error boundary (isolation)
2. Host provides a single error boundary for all MFEs
3. Nested boundaries with escalation

**Recommendation:** Option 1 with escalation. Each MFE has its own boundary. If error occurs, MFE boundary catches it and sends `mfe.error` action to domain. Domain can decide to retry, remove, or show global error.

### Q8: What is the versioning strategy for contracts?

**Open:** How do we handle version compatibility between domain and entry contracts?

**Options:**
1. Exact version match required (strict)
2. Major version compatibility (semver)
3. Feature detection at runtime

**Recommendation:** Option 2 (semver) with plugin's `checkCompatibility()` when available. Breaking changes require major version bump. Additive changes (new optional properties/actions) allowed within major version.

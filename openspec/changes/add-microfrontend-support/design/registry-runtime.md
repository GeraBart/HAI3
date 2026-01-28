# Design: Registry and Runtime Architecture

This document covers the ScreensetsRegistry runtime isolation model, action chain mediation, MFE bridges, handler registration, and dynamic registration.

**Related Documents:**
- [Type System](./type-system.md) - Type System Plugin interface, GTS types, contract validation
- [MFE Loading](./mfe-loading.md) - MfeHandler abstract class, handler registry, Module Federation loading
- [MFE API](./mfe-api.md) - MfeEntryLifecycle interface
- [MFE Actions](./mfe-actions.md) - Action and ActionsChain types
- [MFE Domain](./mfe-domain.md) - ExtensionDomain type
- [MFE Extension](./mfe-extension.md) - Extension type

---

## Decisions

### Decision 9: Isolated Runtime Instances (Framework-Agnostic)

Each MFE instance runs with its own FULLY ISOLATED runtime:
- Own @hai3/screensets instance
- Own TypeSystemPlugin instance (with own schema registry)
- Own @hai3/state container
- Can use ANY UI framework (Vue 3, Angular, Svelte, etc.)

The host uses React, but MFEs are NOT required to use React.

**Architecture:**
```
+---------------------------+      +---------------------------+
|      HOST RUNTIME         |      |       MFE RUNTIME         |
|  (React + TypeSystemA)    |      |  (Vue 3 + TypeSystemB)    |
+---------------------------+      +---------------------------+
|   TypeSystemPlugin A      |      |   TypeSystemPlugin B      |
|   (host schemas only)     |      |   (MFE schemas only)      |
+---------------------------+      +---------------------------+
|   HAI3 State Instance A   |      |   HAI3 State Instance B   |
+---------------------------+      +---------------------------+
|   React Host Component    |      |   Vue 3 MFE Component     |
+-------------+-------------+      +-------------+-------------+
              |                                  |
              |    MfeBridge (Contract)          |
              +==================================+
              |  - Shared Properties (host→MFE)  |
              |  - Actions Chains (bidirectional)|
              +==================================+
              |                                  |
              |  RuntimeCoordinator (PRIVATE)    |
              |  (WeakMap<Element, Connection>)  |
              +----------------------------------+
```

**Key Points:**
- No direct store access across boundary
- No direct schema registry access across boundary (security)
- Shared properties passed via MfeBridge only
- Actions delivered via ActionsChainsMediator through MfeBridge
- Internal coordination via private RuntimeCoordinator (not exposed to MFE code)
- MFEs can use ANY UI framework - not limited to React

### Decision 13: Framework-Agnostic Isolation Model

**What**: MFEs are completely isolated with their own runtime instances. Each MFE can use ANY UI framework (React, Vue 3, Angular, Svelte, etc.) - the host uses React but MFEs are framework-agnostic.

**Key Architectural Principle**: Complete Isolation

Each MFE runtime instance has:
- Its own `@hai3/screensets` instance (NOT singleton)
- Its own `TypeSystemPlugin` instance (NOT singleton)
- Its own isolated schema registry
- No direct access to host or other MFE internals

**Why Complete GTS Isolation is Required**:

If GTS/TypeSystemPlugin were shared as a singleton:
1. **Security Violation**: MFEs could call `plugin.query('gts.*')` and discover ALL registered types from the host and other MFEs
2. **Information Leakage**: An MFE could learn about host's internal domain structure, other MFE contracts, and business logic encoded in type schemas
3. **Contract Violation**: MFEs should ONLY know about their own contract with the host domain - nothing more

With isolated TypeSystemPlugin per runtime:
- Each MFE's plugin only contains schemas for that MFE's contract types
- Host's plugin contains host-specific schemas (domains, extensions)
- No cross-boundary schema discovery is possible

**Why Framework Agnostic**:

1. **Vendor Extensibility**: Third-party vendors may use Vue 3, Angular, or other frameworks for their MFEs
2. **No React Dependency**: MFEs are NOT required to use React - only the host uses React
3. **Technology Freedom**: Each MFE team chooses their own framework and tooling

**Internal Runtime Coordination**:

Host and MFE runtimes need to coordinate (property updates, action delivery) but this coordination is PRIVATE. The coordination uses a WeakMap-based approach for better encapsulation and automatic garbage collection:

```typescript
// INTERNAL: Not exposed to MFE code - used only by ScreensetsRegistry internals

// Module-level WeakMap instead of window global
const runtimeConnections = new WeakMap<Element, RuntimeConnection>();

interface RuntimeConnection {
  hostRuntime: ScreensetsRegistry;
  bridges: Map<string, MfeBridgeConnection>; // entryTypeId -> bridge
}

// Register when mounting MFE to a container element
function registerRuntime(container: Element, connection: RuntimeConnection): void;

// Lookup by container element
function getRuntime(container: Element): RuntimeConnection | undefined;

// Cleanup when unmounting
function unregisterRuntime(container: Element): void;

interface RuntimeCoordinator {
  sendToChild(instanceId: string, message: CoordinatorMessage): void;
  sendToParent(message: CoordinatorMessage): void;
  onMessage(handler: (message: CoordinatorMessage) => void): () => void;
}

// WHAT MFE CODE SEES: Only the MfeBridge interface
interface MfeBridge {
  readonly entryTypeId: string;
  readonly domainId: string;
  requestHostAction(actionTypeId: string, payload?: unknown): Promise<void>;
  subscribeToProperty(propertyTypeId: string, callback: (value: unknown) => void): () => void;
  getProperty(propertyTypeId: string): unknown;
  subscribeToAllProperties(callback: (properties: Map<string, unknown>) => void): () => void;
}

// INTERNAL: Extended interface for registry-to-bridge communication
// Not exposed to MFE code - used by ScreensetsRegistry internally
interface MfeBridgeConnectionInternal extends MfeBridgeConnection {
  /**
   * Called by the registry when a domain property is updated.
   * Dispatches the update to all registered subscriber callbacks.
   * @internal
   */
  receivePropertyUpdate(propertyTypeId: string, value: unknown): void;
}
```

**Communication Layers**:

```
+------------------+     Contract (MfeBridge)      +------------------+
|   HOST RUNTIME   | <===========================> |   MFE RUNTIME    |
| (React + GTS A)  |     Properties & Actions      | (Vue 3 + GTS B)  |
+--------+---------+                               +--------+---------+
         |                                                  |
         |  Internal Coordination (PRIVATE)                 |
         |  (window.__hai3_runtime_coordinator)             |
         +--------------------------------------------------+
```

**Module Federation Shared Configuration**:

Module Federation provides TWO independent benefits:
1. **Code/bundle sharing** - Download code once, cache it (always enabled when dep is in `shared`)
2. **Runtime instance isolation** - Controlled by `singleton` flag

With `singleton: false` (the default in HAI3), you get BOTH benefits:
- Code is downloaded and cached once (performance)
- Each MFE gets its OWN instance (isolation)

```javascript
// Host and ALL MFEs webpack/rspack/vite config
shared: {
  // React/ReactDOM: Share CODE but NOT instance (singleton: false)
  // This gives bundle optimization while preserving isolation
  'react': {
    requiredVersion: '^18.0.0',
    singleton: false,  // Each MFE gets own React instance
  },
  'react-dom': {
    requiredVersion: '^18.0.0',
    singleton: false,
  },

  // GTS: Share CODE but NOT instance (isolation required for security)
  '@globaltypesystem/gts-ts': {
    requiredVersion: '^1.0.0',
    singleton: false,  // Each runtime has isolated schema registry
  },

  // @hai3/screensets: Share CODE but NOT instance
  '@hai3/screensets': {
    requiredVersion: '^1.0.0',
    singleton: false,  // Each MFE has isolated TypeSystemPlugin
  },

  // Stateless utilities: Can safely use singleton: true
  'lodash': {
    requiredVersion: '^4.17.0',
    singleton: true,   // No state, safe to share instance
  },
  'date-fns': {
    requiredVersion: '^2.30.0',
    singleton: true,
  },
}
```

**Summary of singleton usage:**

| Package Type | singleton | Reason |
|--------------|-----------|--------|
| React/ReactDOM | `false` | Has internal state (hooks, context) |
| @hai3/* | `false` | Has runtime state (TypeSystemPlugin, schema registry) |
| GTS | `false` | Has schema registry state |
| lodash, date-fns | `true` | Purely functional, no state |

**Class-Based ScreensetsRegistry**:

```typescript
// packages/screensets/src/runtime/ScreensetsRegistry.ts

/**
 * ScreensetsRegistry - FULLY isolated instance per MFE.
 * Each instance has:
 * - Its own TypeSystemPlugin instance (NOT shared)
 * - Its own schema registry (isolated from other runtimes)
 * - Its own state, domains, extensions, bridges
 * - Its own handler registry for custom entry types
 *
 * Can operate as:
 * - Connect to a parent host (be a child MFE)
 * - Define extension domains and host nested MFEs (be a host)
 * - Both simultaneously (intermediate host pattern)
 */
class ScreensetsRegistry {
  // === Isolated State (per instance) ===
  private readonly domains = new Map<string, ExtensionDomainState>();
  private readonly extensions = new Map<string, ExtensionState>();
  private readonly childBridges = new Map<string, MfeBridgeConnection>();
  private readonly actionHandlers = new Map<string, ActionHandler>();

  // === Handler Registry ===
  // Registered handlers, ordered by priority (highest first)
  // See MFE Loading - Decision 11 for details
  private readonly handlers: MfeHandler[] = [];

  // Parent connection (if this runtime is an MFE)
  private parentBridge: MfeBridgeConnection | null = null;

  // Isolated HAI3 state for this runtime
  private readonly state: HAI3State;

  // ISOLATED Type System instance - NOT shared across runtimes
  // Each runtime has its own TypeSystemPlugin with its own schema registry
  // This prevents MFEs from discovering host/other MFE types via plugin.query()
  public readonly typeSystem: TypeSystemPlugin;

  constructor(config: ScreensetsRegistryConfig) {
    this.typeSystem = config.typeSystem;
    this.state = createHAI3State();  // Fresh isolated state

    // Register default MF handler if MFE loading is enabled
    if (config.mfeHandler) {
      this.registerHandler(new MfeHandlerMF(this.typeSystem, config.mfeHandler));
    }
  }

  /**
   * Register an extension domain.
   */
  registerDomain(domain: ExtensionDomain): void {
    const validation = this.typeSystem.validateInstance(
      'gts.hai3.screensets.ext.domain.v1~',
      domain
    );
    if (!validation.valid) {
      throw new DomainValidationError(validation.errors);
    }

    this.domains.set(domain.id, {
      domain,
      properties: new Map(),
      extensions: new Set(),
      propertySubscribers: new Map(), // Map<propertyTypeId, Set<instanceId>>
    });
  }

  // === Domain-Level Shared Property Management ===

  /**
   * Update a shared property at the domain level.
   * All extensions in the domain that subscribe to this property
   * will automatically receive the update.
   *
   * @param domainId - The domain type ID
   * @param propertyTypeId - The shared property type ID
   * @param value - The new property value
   * @throws Error if domain not found or property not declared in domain
   */
  updateDomainProperty(domainId: string, propertyTypeId: string, value: unknown): void {
    const domainState = this.domains.get(domainId);
    if (!domainState) {
      throw new Error(`Domain '${domainId}' not registered`);
    }

    // Validate that the property is declared in the domain's sharedProperties
    if (!domainState.domain.sharedProperties.includes(propertyTypeId)) {
      throw new Error(
        `Property '${propertyTypeId}' is not declared in domain '${domainId}'. ` +
        `Domain only provides: ${domainState.domain.sharedProperties.join(', ')}`
      );
    }

    // Update the property value in domain state
    domainState.properties.set(propertyTypeId, value);

    // Notify all extensions in this domain that subscribe to this property
    for (const extensionId of domainState.extensions) {
      const extensionState = this.extensions.get(extensionId);
      if (!extensionState?.bridge) continue;

      // Check if this extension subscribes to this property
      const entry = extensionState.entry;
      const subscribes =
        entry.requiredProperties?.includes(propertyTypeId) ||
        entry.optionalProperties?.includes(propertyTypeId);

      if (subscribes) {
        // Notify the bridge - internal method that triggers subscriber callbacks
        this.notifyBridgePropertyUpdate(extensionState.bridge, propertyTypeId, value);
      }
    }
  }

  /**
   * Get current value of a domain property.
   *
   * @param domainId - The domain type ID
   * @param propertyTypeId - The shared property type ID
   * @returns Current value or undefined if not set
   */
  getDomainProperty(domainId: string, propertyTypeId: string): unknown {
    const domainState = this.domains.get(domainId);
    if (!domainState) {
      return undefined;
    }
    return domainState.properties.get(propertyTypeId);
  }

  /**
   * Update multiple domain properties at once.
   * More efficient than calling updateDomainProperty multiple times.
   *
   * @param domainId - The domain type ID
   * @param properties - Map of propertyTypeId to value
   */
  updateDomainProperties(domainId: string, properties: Map<string, unknown>): void {
    for (const [propertyTypeId, value] of properties) {
      this.updateDomainProperty(domainId, propertyTypeId, value);
    }
  }

  /**
   * Internal: Notify a bridge that a property has been updated.
   * This triggers the subscriber callbacks registered via bridge.subscribeToProperty().
   */
  private notifyBridgePropertyUpdate(
    bridge: MfeBridgeConnection,
    propertyTypeId: string,
    value: unknown
  ): void {
    // Implementation detail: bridges maintain their own subscriber callbacks
    // This method is called by the registry when domain properties change
    // The bridge implementation handles dispatching to registered callbacks
    (bridge as MfeBridgeConnectionInternal).receivePropertyUpdate(propertyTypeId, value);
  }

  /**
   * Mount an extension into a domain.
   */
  mountExtension(extension: Extension): MfeBridgeConnection {
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
    const contractResult = validateContract(entry, domainState.domain);
    if (!contractResult.valid) {
      throw new ContractValidationError(contractResult.errors);
    }

    // Dynamic uiMeta validation
    const uiMetaResult = validateExtensionUiMeta(this.typeSystem, extension);
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

  /**
   * Connect this runtime to a parent host via bridge.
   */
  connectToParent(bridge: MfeBridgeConnection): void {
    this.parentBridge = bridge;
    bridge.subscribeToAllProperties((props) => {
      this.handleParentProperties(props);
    });
    this.registerDomainActionHandlers(bridge);
  }

  /**
   * Execute an actions chain.
   */
  async executeActionsChain(chain: ActionsChain): Promise<ChainResult> {
    const { target, type, payload } = chain.action;

    const validation = this.typeSystem.validateInstance(type, payload);
    if (!validation.valid) {
      return this.handleChainFailure(chain, validation.errors);
    }

    try {
      if (this.domains.has(target)) {
        await this.deliverToDomain(target, chain.action);
      } else if (this.childBridges.has(target)) {
        await this.deliverToChild(target, chain.action);
      } else if (this.parentBridge && target === this.parentBridge.domainId) {
        return this.parentBridge.sendActionsChain(chain);
      } else {
        throw new Error(`Unknown target: ${target}`);
      }

      if (chain.next) {
        return this.executeActionsChain(chain.next);
      }
      return { completed: true, path: [chain.action.type] };

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
    return { completed: false, path: [], error: String(error) };
  }

  dispose(): void {
    this.parentBridge?.dispose();
    this.parentBridge = null;
    for (const bridge of this.childBridges.values()) {
      bridge.dispose();
    }
    this.childBridges.clear();
    this.domains.clear();
    this.extensions.clear();
    this.actionHandlers.clear();
  }

  // === Handler Registry ===

  /**
   * Register an MFE handler.
   * Handlers are tried in priority order (highest first).
   *
   * HAI3 registers MfeHandlerMF by default (priority: 0).
   * Companies register their custom handlers with higher priority.
   *
   * See MFE Loading - Decision 11 for full details.
   *
   * @param handler - The handler to register
   */
  registerHandler(handler: MfeHandler): void {
    this.handlers.push(handler);
    // Sort by priority descending (higher priority first)
    this.handlers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Unregister an MFE handler by handled base type ID.
   */
  unregisterHandler(handledBaseTypeId: string): void {
    const index = this.handlers.findIndex(h => h.handledBaseTypeId === handledBaseTypeId);
    if (index !== -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Get the appropriate handler for an entry.
   * Tries handlers in priority order until one can handle the entry.
   *
   * @param entry - The entry to find a handler for
   * @returns The appropriate handler
   * @throws Error if no handler can handle the entry type
   */
  private getHandlerForEntry(entry: MfeEntry): MfeHandler {
    for (const handler of this.handlers) {
      if (handler.canHandle(entry.id)) {
        return handler;
      }
    }
    throw new Error(
      `No handler registered for entry type '${entry.id}'. ` +
      `Register a handler using registry.registerHandler() that can handle this entry type.`
    );
  }
}
```

### Decision 14: Handler Registry Integration

**What**: The ScreensetsRegistry integrates with the MfeHandler abstraction to support multiple entry types and bridge customization.

**Why**:
- **Extensibility**: Companies can handle custom derived entry types
- **Separation of Concerns**: Loading logic is encapsulated in handlers, not the registry
- **Flexibility**: Different handlers can have different preload, caching, and error handling strategies
- **Bridge Customization**: Handlers provide their own bridge factories, enabling rich bridges for internal MFEs

**Registration Flow**:

```typescript
// 1. HAI3 default handler is registered automatically when mfeHandler config is provided
const runtime = createScreensetsRegistry({
  typeSystem: gtsPlugin,
  mfeHandler: { timeout: 30000 },  // Enables MfeHandlerMF with config
});

// 2. Company registers their custom handler (higher priority)
runtime.registerHandler(new MfeHandlerAcme(typeSystem, router, apiClient, services));

// 3. When mounting an extension, registry finds the appropriate handler
// Handlers are tried in priority order (highest first)
// Bridge is created using handler.bridgeFactory
const bridge = await runtime.mountExtension(extensionId, container);
```

**Handler Selection Algorithm**:

```
For each handler in priority order (highest first):
  If handler.canHandle(entry.id) returns true:
    Use this handler
    Create bridge using handler.bridgeFactory
    Break

If no handler can handle the entry:
  Throw Error("No handler registered for entry type")
```

### Decision 15: Shadow DOM Utilities

Shadow DOM utilities are provided by `@hai3/screensets` for style isolation. The `@hai3/framework` uses these utilities in its `ShadowDomContainer` component.

#### Shadow DOM API

```typescript
// packages/screensets/src/mfe/shadow/index.ts

/**
 * Options for creating a shadow root
 */
interface ShadowRootOptions {
  /** Shadow DOM mode (default: 'open') */
  mode?: 'open' | 'closed';
  /** Enable delegatesFocus for accessibility */
  delegatesFocus?: boolean;
}

/**
 * Create a shadow root attached to an element.
 * Handles edge cases like already-attached shadow roots.
 *
 * @param element - Host element for the shadow root
 * @param options - Shadow root configuration
 * @returns The created or existing ShadowRoot
 * @throws Error if element cannot host shadow DOM
 */
function createShadowRoot(
  element: HTMLElement,
  options: ShadowRootOptions = {}
): ShadowRoot {
  const { mode = 'open', delegatesFocus = false } = options;

  // Return existing shadow root if present
  if (element.shadowRoot && mode === 'open') {
    return element.shadowRoot;
  }

  return element.attachShadow({ mode, delegatesFocus });
}

/**
 * CSS variable map type
 */
type CssVariables = Record<string, string>;

/**
 * Inject CSS custom properties into a shadow root.
 * Variables are set on the :host element and cascade to all children.
 *
 * @param shadowRoot - Target shadow root
 * @param variables - Map of CSS variable names to values
 */
function injectCssVariables(
  shadowRoot: ShadowRoot,
  variables: CssVariables
): void {
  const styleId = '__hai3_css_variables__';
  let styleElement = shadowRoot.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    shadowRoot.prepend(styleElement);
  }

  const cssText = Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');

  styleElement.textContent = `:host {\n${cssText}\n}`;
}

/**
 * Inject a stylesheet into a shadow root.
 * Supports both CSS text and URLs.
 *
 * @param shadowRoot - Target shadow root
 * @param css - CSS text or URL to stylesheet
 * @param id - Optional ID for the style element (for updates)
 */
function injectStylesheet(
  shadowRoot: ShadowRoot,
  css: string,
  id?: string
): void {
  if (id) {
    const existing = shadowRoot.getElementById(id);
    if (existing) {
      existing.textContent = css;
      return;
    }
  }

  const styleElement = document.createElement('style');
  if (id) styleElement.id = id;
  styleElement.textContent = css;
  shadowRoot.appendChild(styleElement);
}

// Export utilities
export { createShadowRoot, injectCssVariables, injectStylesheet };
export type { ShadowRootOptions, CssVariables };
```

### Decision 19: Dynamic Registration Model

**What**: Extensions and MFEs can be registered at ANY time during the application lifecycle, not just at initialization.

**Why**:
- Extensions are NOT known at app initialization time
- GTS types and instances will be obtained from backend API in the future
- Enables runtime configuration, feature flags, and permission-based extensibility
- Supports hot-swapping extensions for A/B testing

#### ScreensetsRegistry Dynamic API

The ScreensetsRegistry provides a complete API for dynamic registration and unregistration:

```typescript
/**
 * ScreensetsRegistry - Supports dynamic registration at any time
 */
class ScreensetsRegistry {
  // === Dynamic Registration (anytime during runtime) ===

  /**
   * Register extension dynamically.
   * Can be called at any time, not just initialization.
   * Validates contract compatibility before registration.
   */
  async registerExtension(extension: Extension): Promise<void> {
    // 1. Validate extension against schema
    const validation = this.typeSystem.validateInstance(
      'gts.hai3.screensets.ext.extension.v1~',
      extension
    );
    if (!validation.valid) {
      throw new ExtensionValidationError(validation.errors, extension.id);
    }

    // 2. Verify domain exists (may have been registered earlier or dynamically)
    const domainState = this.domains.get(extension.domain);
    if (!domainState) {
      throw new Error(`Domain '${extension.domain}' not registered. Register domain first.`);
    }

    // 3. Resolve entry (may need to fetch from provider)
    const entry = await this.resolveEntry(extension.entry);

    // 4. Validate contract
    const contractResult = validateContract(entry, domainState.domain);
    if (!contractResult.valid) {
      throw new ContractValidationError(contractResult.errors);
    }

    // 5. Validate uiMeta
    const uiMetaResult = validateExtensionUiMeta(this.typeSystem, extension);
    if (!uiMetaResult.valid) {
      throw new UiMetaValidationError(uiMetaResult.errors, extension.id, extension.domain);
    }

    // 6. Register extension
    this.extensions.set(extension.id, {
      extension,
      entry,
      mounted: false,
      bridge: null,
    });

    // 7. Emit registration event for observers
    this.emit('extensionRegistered', { extensionId: extension.id });
  }

  /**
   * Unregister extension dynamically.
   * Unmounts MFE if currently mounted, cleans up bridge.
   */
  async unregisterExtension(extensionId: string): Promise<void> {
    const state = this.extensions.get(extensionId);
    if (!state) {
      return; // Already unregistered, idempotent
    }

    // 1. Unmount if mounted
    if (state.mounted && state.bridge) {
      await this.unmountExtension(extensionId);
    }

    // 2. Remove from registry
    this.extensions.delete(extensionId);

    // 3. Remove from domain
    const domainState = this.domains.get(state.extension.domain);
    if (domainState) {
      domainState.extensions.delete(extensionId);
    }

    // 4. Emit unregistration event
    this.emit('extensionUnregistered', { extensionId });
  }

  /**
   * Register domain dynamically.
   * Can be called at any time to add new extension points.
   */
  async registerDomain(domain: ExtensionDomain): Promise<void> {
    // 1. Validate domain
    const validation = this.typeSystem.validateInstance(
      'gts.hai3.screensets.ext.domain.v1~',
      domain
    );
    if (!validation.valid) {
      throw new DomainValidationError(validation.errors, domain.id);
    }

    // 2. Register domain
    this.domains.set(domain.id, {
      domain,
      properties: new Map(),
      extensions: new Set(),
    });

    // 3. Emit event
    this.emit('domainRegistered', { domainId: domain.id });
  }

  /**
   * Unregister domain dynamically.
   * Unregisters all extensions in the domain first.
   */
  async unregisterDomain(domainId: string): Promise<void> {
    const domainState = this.domains.get(domainId);
    if (!domainState) {
      return; // Already unregistered, idempotent
    }

    // 1. Unregister all extensions in this domain
    for (const extensionId of domainState.extensions) {
      await this.unregisterExtension(extensionId);
    }

    // 2. Remove domain
    this.domains.delete(domainId);

    // 3. Emit event
    this.emit('domainUnregistered', { domainId });
  }

  // === Extension Mounting (on-demand) ===

  /**
   * Mount extension on demand.
   * Extension must be registered before mounting.
   */
  async mountExtension(extensionId: string, container: Element): Promise<MfeBridgeConnection> {
    // Get extension state
    const extensionState = this.extensions.get(extensionId);
    if (!extensionState) {
      throw new Error(`Extension '${extensionId}' not registered`);
    }

    const { extension, entry } = extensionState;
    const domainState = this.domains.get(extension.domain);
    if (!domainState) {
      throw new Error(`Domain '${extension.domain}' not found`);
    }

    // Get appropriate handler for this entry type
    const handler = this.getHandlerForEntry(entry);

    // Load MFE bundle using handler
    const loaded = await handler.load(entry);

    // Create bridge
    const bridge = this.createBridge(domainState, entry, extensionId);

    // Register with runtime coordinator
    registerRuntime(container, {
      hostRuntime: this,
      bridges: new Map([[extensionId, bridge]]),
    });

    // Mount component
    // (Component mounting is framework-specific, handled by caller)

    // Update state
    extensionState.mounted = true;
    extensionState.bridge = bridge;
    extensionState.container = container;

    return bridge;
  }

  /**
   * Unmount extension.
   */
  async unmountExtension(extensionId: string): Promise<void> {
    const extensionState = this.extensions.get(extensionId);
    if (!extensionState || !extensionState.mounted) {
      return;
    }

    // Dispose bridge
    if (extensionState.bridge) {
      extensionState.bridge.dispose();
    }

    // Unregister from coordinator
    if (extensionState.container) {
      unregisterRuntime(extensionState.container);
    }

    // Update state
    extensionState.mounted = false;
    extensionState.bridge = null;
    extensionState.container = undefined;
  }

  // === Type Instance Provider (future backend integration) ===

  private typeInstanceProvider: TypeInstanceProvider | null = null;

  /**
   * Set the provider for fetching GTS type instances from backend.
   * Current: in-memory registry
   * Future: backend API calls
   */
  setTypeInstanceProvider(provider: TypeInstanceProvider): void {
    this.typeInstanceProvider = provider;

    // Subscribe to updates for real-time sync
    provider.subscribeToUpdates(async (update) => {
      if (update.type === 'added' && update.instance) {
        // Auto-register new extensions/domains from backend
        if (this.isExtension(update.instance)) {
          await this.registerExtension(update.instance as Extension);
        } else if (this.isDomain(update.instance)) {
          await this.registerDomain(update.instance as ExtensionDomain);
        }
      } else if (update.type === 'removed') {
        // Auto-unregister removed extensions/domains
        if (this.extensions.has(update.typeId)) {
          await this.unregisterExtension(update.typeId);
        } else if (this.domains.has(update.typeId)) {
          await this.unregisterDomain(update.typeId);
        }
      }
    });
  }

  /**
   * Refresh extensions from backend.
   * Fetches all extensions/domains from provider and syncs local registry.
   */
  async refreshExtensionsFromBackend(): Promise<void> {
    if (!this.typeInstanceProvider) {
      throw new Error('No TypeInstanceProvider configured. Call setTypeInstanceProvider() first.');
    }

    // Fetch domains first (extensions depend on domains)
    const domains = await this.typeInstanceProvider.fetchDomains();
    for (const domain of domains) {
      if (!this.domains.has(domain.id)) {
        await this.registerDomain(domain);
      }
    }

    // Then fetch extensions
    const extensions = await this.typeInstanceProvider.fetchExtensions();
    for (const extension of extensions) {
      if (!this.extensions.has(extension.id)) {
        await this.registerExtension(extension);
      }
    }
  }

  /**
   * Resolve entry - tries local cache first, then provider.
   */
  private async resolveEntry(entryId: string): Promise<MfeEntry> {
    // Try local cache first
    const cached = this.entryCache.get(entryId);
    if (cached) {
      return cached;
    }

    // Try provider if available
    if (this.typeInstanceProvider) {
      const entry = await this.typeInstanceProvider.fetchInstance<MfeEntry>(entryId);
      if (entry) {
        this.entryCache.set(entryId, entry);
        return entry;
      }
    }

    throw new Error(`Entry '${entryId}' not found. Ensure entry is registered or provider is configured.`);
  }
}
```

#### TypeInstanceProvider Interface

```typescript
/**
 * Provider for fetching GTS type instances from backend.
 *
 * CURRENT IMPLEMENTATION: InMemoryTypeInstanceProvider
 * - Uses local Map for storage
 * - Manual registration via register() methods
 *
 * FUTURE IMPLEMENTATION: BackendTypeInstanceProvider
 * - Fetches from REST API or GraphQL endpoint
 * - Supports real-time updates via WebSocket/SSE
 * - Caches with TTL and invalidation
 */
interface TypeInstanceProvider {
  /** Fetch all available extensions from backend */
  fetchExtensions(): Promise<Extension[]>;

  /** Fetch all available domains from backend */
  fetchDomains(): Promise<ExtensionDomain[]>;

  /** Fetch specific type instance by ID */
  fetchInstance<T>(typeId: string): Promise<T | undefined>;

  /** Subscribe to instance updates (real-time sync) */
  subscribeToUpdates(callback: (update: InstanceUpdate) => void): () => void;
}

interface InstanceUpdate {
  type: 'added' | 'updated' | 'removed';
  typeId: string;
  instance?: unknown;
}

/**
 * In-memory implementation for current use.
 * Future: Replace with BackendTypeInstanceProvider.
 */
class InMemoryTypeInstanceProvider implements TypeInstanceProvider {
  private extensions = new Map<string, Extension>();
  private domains = new Map<string, ExtensionDomain>();
  private instances = new Map<string, unknown>();
  private subscribers = new Set<(update: InstanceUpdate) => void>();

  // Manual registration methods (current use)
  registerExtension(extension: Extension): void {
    this.extensions.set(extension.id, extension);
    this.notifySubscribers({ type: 'added', typeId: extension.id, instance: extension });
  }

  registerDomain(domain: ExtensionDomain): void {
    this.domains.set(domain.id, domain);
    this.notifySubscribers({ type: 'added', typeId: domain.id, instance: domain });
  }

  registerInstance(typeId: string, instance: unknown): void {
    this.instances.set(typeId, instance);
    this.notifySubscribers({ type: 'added', typeId, instance });
  }

  // TypeInstanceProvider implementation
  async fetchExtensions(): Promise<Extension[]> {
    return Array.from(this.extensions.values());
  }

  async fetchDomains(): Promise<ExtensionDomain[]> {
    return Array.from(this.domains.values());
  }

  async fetchInstance<T>(typeId: string): Promise<T | undefined> {
    return this.instances.get(typeId) as T | undefined;
  }

  subscribeToUpdates(callback: (update: InstanceUpdate) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(update: InstanceUpdate): void {
    for (const callback of this.subscribers) {
      callback(update);
    }
  }
}
```

#### Usage Examples

**Example 1: Dynamic registration after user action**
```typescript
// User enables analytics widget in settings
settingsButton.onClick = async () => {
  // Register the extension dynamically
  await runtime.registerExtension({
    id: 'gts.hai3.screensets.ext.extension.v1~acme.user.widgets.analytics_widget.v1',
    domain: 'gts.hai3.screensets.ext.domain.v1~acme.dashboard.layout.widget_slot.v1~',
    entry: 'gts.hai3.screensets.mfe.entry.v1~hai3.screensets.mfe.entry_mf.v1~acme.analytics.mfe.chart.v1',
    uiMeta: { title: 'Analytics', size: 'medium' },
  });

  // Mount the extension
  const container = document.getElementById('widget-slot-1');
  const bridge = await runtime.mountExtension(
    'gts.hai3.screensets.ext.extension.v1~acme.user.widgets.analytics_widget.v1',
    container
  );
};
```

**Example 2: Registration after backend API response**
```typescript
// After user login, fetch available extensions from backend
async function onUserLogin(user: User) {
  // Configure backend provider
  runtime.setTypeInstanceProvider(new BackendTypeInstanceProvider({
    apiUrl: '/api/extensions',
    authToken: user.token,
  }));

  // Fetch and register all extensions from backend
  await runtime.refreshExtensionsFromBackend();

  // Now extensions are available for mounting
}
```

**Example 3: Unregistration when user disables feature**
```typescript
// User disables analytics widget
disableButton.onClick = async () => {
  // Unregister - this also unmounts if currently mounted
  await runtime.unregisterExtension('gts.hai3.screensets.ext.extension.v1~acme.user.widgets.analytics_widget.v1');
};
```

**Example 4: Hot-swap extensions at runtime**
```typescript
// A/B testing: swap implementation at runtime
async function swapToVariantB() {
  const extensionId = 'gts.hai3.screensets.ext.extension.v1~acme.user.widgets.analytics_widget.v1';

  // 1. Unregister current implementation
  await runtime.unregisterExtension(extensionId);

  // 2. Register variant B
  await runtime.registerExtension({
    id: extensionId,
    domain: 'gts.hai3.screensets.ext.domain.v1~acme.dashboard.layout.widget_slot.v1~',
    entry: 'gts.hai3.screensets.mfe.entry.v1~hai3.screensets.mfe.entry_mf.v1~acme.analytics.mfe.chart_v2.v1', // Different entry
    uiMeta: { title: 'Analytics (New)', size: 'medium' },
  });

  // 3. Mount extension with new implementation
  const container = document.getElementById('widget-slot-1');
  await runtime.mountExtension(extensionId, container);
}
```

**Example 5: Domain-level shared property updates**
```typescript
// Host updates a shared property at the domain level
// ALL extensions in the domain that subscribe to this property receive the update

const domainId = 'gts.hai3.screensets.ext.domain.v1~acme.dashboard.layout.widget_slot.v1~';
const themePropertyId = 'gts.hai3.screensets.ext.shared_property.v1~hai3.screensets.props.theme.v1';
const userContextPropertyId = 'gts.hai3.screensets.ext.shared_property.v1~hai3.screensets.props.user_context.v1';

// Single property update - all subscribed extensions in domain receive it
runtime.updateDomainProperty(domainId, themePropertyId, 'dark');

// Multiple properties at once (more efficient)
runtime.updateDomainProperties(domainId, new Map([
  [themePropertyId, 'dark'],
  [userContextPropertyId, { userId: '123', permissions: ['read', 'write'] }],
]));

// Get current property value
const currentTheme = runtime.getDomainProperty(domainId, themePropertyId);

// Flow explanation:
// 1. Domain 'widget_slot' declares sharedProperties: [themePropertyId, userContextPropertyId]
// 2. Extension A's entry declares requiredProperties: [themePropertyId]
// 3. Extension B's entry declares optionalProperties: [themePropertyId, userContextPropertyId]
// 4. Extension C's entry doesn't declare either property
// 5. When updateDomainProperty(domainId, themePropertyId, 'dark') is called:
//    - Extension A receives 'dark' (required subscriber)
//    - Extension B receives 'dark' (optional subscriber)
//    - Extension C receives nothing (not subscribed)
```

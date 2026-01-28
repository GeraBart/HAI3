# Design: MFE Principles

This document covers the core architectural principles for the MFE system.

**Related Documents:**
- [MFE API](./mfe-api.md) - MfeEntryLifecycle, MfeBridge interfaces
- [MFE Actions](./mfe-actions.md) - Action and ActionsChain types
- [Registry and Runtime](./registry-runtime.md) - Runtime isolation, dynamic registration
- [MFE Loading](./mfe-loading.md) - MfeHandler abstract class, handler registry

---

## Core Principles

1. **Thin Public Contracts** - The public interface is minimal and stable
2. **Full Runtime Isolation** - Each MFE has its own isolated runtime
3. **Extensibility via Loaders** - Companies extend via custom loaders, not core changes
4. **MFE Independence** - Each MFE takes full responsibility for its own needs

---

## Extensibility via Handlers

**What**: HAI3 ships thin contracts (MfeEntryMF, MfeHandlerMF, MfeBridgeFactoryDefault) by default. Companies extend the system by creating custom derived entry types, custom handlers, and custom bridge factories - NOT by modifying HAI3 core.

**Why**:
- **Thin Core**: HAI3 core stays minimal and stable for 3rd-party vendors
- **Company Control**: Enterprises add richness for internal MFEs without affecting the core
- **No Contract Bloat**: Reviewer requests for metadata, preload hooks, etc. go into company handlers, not HAI3
- **Clear Responsibility**: "Static knowledge about MFEs" lives in company handlers
- **Bridge Customization**: Companies can inject shared services (router, API client) into bridges for internal MFEs

### The Extensibility Pattern

```
┌────────────────────────────────────────────────────────────────────────┐
│                         HAI3 CORE (THIN)                               │
├────────────────────────────────────────────────────────────────────────┤
│  MfeEntry (abstract)        │  MfeHandler (abstract class)             │
│  MfeEntryMF (thin)          │  MfeHandlerMF (default)                  │
│  MfeBridge, Actions         │  MfeBridgeFactoryDefault (thin bridges)  │
│                             │                                          │
│                             │  STABLE API FOR 3RD-PARTY VENDORS        │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ Companies extend, not modify
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      COMPANY EXTENSIONS (RICH)                         │
├────────────────────────────────────────────────────────────────────────┤
│  MfeEntryAcme (derived)     │  MfeHandlerAcme (custom)                 │
│  - translations             │  - preload translations                  │
│  - routes                   │  - verify feature flags                  │
│  - preloadAssets            │  - preload assets                        │
│  - requiredFeatureFlags     │  - custom error handling                 │
│                             │                                          │
│  MfeBridgeAcme (extended)   │  MfeBridgeFactoryAcme (custom)           │
│  - router                   │  - injects Router, ApiClient             │
│  - apiClient                │  - creates rich bridges for internal MFEs│
│                             │                                          │
│                             │  INTERNAL MFEs USE RICHER CONTRACT       │
└────────────────────────────────────────────────────────────────────────┘
```

### Use Case: 3rd-Party vs Internal MFEs

| MFE Type | Entry Type | Handler | Bridge | Contract |
|----------|------------|---------|--------|----------|
| 3rd-party vendor widget | MfeEntryMF | MfeHandlerMF (HAI3 default) | MfeBridge (thin) | Thin, stable |
| Internal dashboard | MfeEntryAcme | MfeHandlerAcme (company) | MfeBridgeAcme (rich) | Rich, with translations, preload, flags |
| Internal settings | MfeEntryAcme | MfeHandlerAcme (company) | MfeBridgeAcme (rich) | Rich, with translations, preload, flags |

### What Lives Where

| Concern | Location | Example |
|---------|----------|---------|
| Communication contract | MfeEntry (HAI3) | requiredProperties, actions |
| Loading mechanism | MfeHandler abstract class (HAI3) | load(), preload(), canHandle() |
| Bridge creation | MfeBridgeFactory abstract class (HAI3) | create() |
| Module Federation config | MfeEntryMF (HAI3) | manifest, exposedModule |
| Thin bridges | MfeBridgeFactoryDefault (HAI3) | creates minimal MfeBridge |
| Translations | MfeEntryAcme (Company) | translations field |
| Feature flag checks | MfeHandlerAcme (Company) | preload() method |
| Asset preloading | MfeHandlerAcme (Company) | preload() method |
| Custom error handling | MfeHandlerAcme (Company) | load() method |
| Shared services in bridges | MfeBridgeFactoryAcme (Company) | injects router, apiClient |

### Key Benefits

1. **HAI3 Core Stays Thin**: No pressure to add "one more field" to MfeEntryMF
2. **Companies Own Their Complexity**: Rich contracts are company's responsibility
3. **3rd-Party Stability**: Vendors can rely on MfeEntryMF contract staying stable
4. **Clear Extension Point**: `registerHandler()` is the official way to extend loading
5. **Rich Bridges for Internal MFEs**: Companies can inject shared services via custom MfeBridgeFactory while keeping 3rd-party MFEs isolated with thin bridges

See [MFE Loading - Decision 11](./mfe-loading.md#decision-11-mfehandler-abstraction-and-registry) for implementation details.

---

## MFE Independence with Thin Public Contracts

**What**: Each MFE is maximally independent with a thin public contract. The public interface (MfeEntryLifecycle, MfeBridge, actions) is the ONLY required coupling between host and MFE.

**Why**:
- Easy to version and maintain compatibility
- Low coupling between host and MFEs
- MFE developers take full responsibility for their own needs
- Each MFE evolves independently

### Architecture: Thin Contracts, Full Ownership

```
+--------------------------------------------------------------------+
|                           PUBLIC CONTRACT                           |
|    (MfeEntryLifecycle + MfeBridge + Actions = THIN INTERFACE)      |
+--------------------------------------------------------------------+
         |                                          |
         v                                          v
+------------------+                      +------------------+
|   HOST RUNTIME   |                      |   MFE RUNTIME    |
+------------------+                      +------------------+
| - Own API Client |                      | - Own API Client |
| - Own Router     |                      | - Own Router     |
| - Own Services   |                      | - Own Services   |
| - Own State      |                      | - Own State      |
+------------------+                      +------------------+
         |                                          |
         |        (Optional: Private Library)       |
         +------------------+  +--------------------+
                            |  |
                            v  v
                   +------------------+
                   |  @hai3/api       |
                   |  (Shared Code)   |
                   +------------------+
                   | - Cache sync     |
                   | - Deduplication  |
                   | (TRANSPARENT)    |
                   +------------------+
```

Each MFE has:
- **Own API services**: Makes its own API requests
- **Own router**: Manages its own internal navigation
- **Own state**: Isolated state container
- **Full responsibility**: MFE developers control their stack

### The Trade-off and Solution

**Trade-off**: Duplicate API requests may occur if multiple MFEs need the same data.

**Solution**: Optimizations happen through **optional private libraries**, NOT through public contracts:

| Layer | Contract Type | Example | Who Controls |
|-------|--------------|---------|--------------|
| Public | Thin | MfeBridge, Actions | HAI3 Architecture |
| Private | Optional | @hai3/api with cache sync | Library Maintainers |

### Private Optimization Layer

Libraries like `@hai3/api` can be used by MFEs to optimize performance:

```typescript
// MFE code - simple, independent API call
const api = createApiClient();  // MFE gets its own instance
const user = await api.get('/users/123');

// Under the hood (TRANSPARENT to MFE):
// - Library checks shared cache first
// - If another MFE already fetched this, returns cached value
// - Deduplicates in-flight requests across MFEs
// - MFE code doesn't know or care
```

**Key Characteristics:**
1. **Each MFE gets its own instance** - No singleton, full isolation semantics
2. **Libraries sync cache implicitly** - Transparent to MFE code
3. **Opt-in optimization** - MFE can use axios instead; system still works, just no cache sharing
4. **No public contract changes** - Optimizations don't affect MfeBridge or action interfaces

### The Principle

```
PUBLIC (Architecture Level)     PRIVATE (Implementation Level)
+---------------------------+   +---------------------------+
| - MfeEntryLifecycle       |   | - @hai3/api cache sync    |
| - MfeBridge               |   | - Request deduplication   |
| - Actions                 |   | - Shared worker pools     |
| - Shared Properties       |   | - Background prefetching  |
+---------------------------+   +---------------------------+
        THIN, STABLE                  OPT-IN, EVOLVABLE
```

**Applies to**:
- API services (each MFE has its own, library may optimize)
- Routers (each MFE has its own, no sharing needed)
- Any potential "singleton service" pattern (avoided in favor of per-MFE instances)

### Trade-offs and Clarifications

**1. Memory Overhead**

The concern about duplicate service instances is about **runtime memory**, not **bundle size**. Module Federation 2.0 handles bundle sharing at load time - code isn't duplicated on disk or over the network. Only runtime instances are duplicated in memory.

This is an acceptable trade-off for the independence benefits. If memory becomes a measurable issue, the private optimization layer can address it without changing public contracts.

**2. Cache Invalidation Complexity**

Cache invalidation would be equally complex for a singleton service approach. The challenge of invalidating stale data, coordinating updates, and handling race conditions is universal to any caching system - it's not additional complexity unique to the independent MFE approach.

**3. Opt-in Optimization**

MFEs can use axios, fetch, or any HTTP client instead of `@hai3/api` - the system still works, just without cross-MFE cache optimization. This is intentional: **graceful degradation over mandatory coupling**.

Adding cache keys or coordination metadata to the public MFE contract would defeat the thin contracts principle. If optimization requires MFE-level declarations, we're back to tight coupling. The optimization must remain at the library level to preserve MFE independence.

### Guarantees and Scope

**1. Cross-MFE Data Consistency**

Cross-MFE data consistency IS guaranteed at the architecture level when HAI3's own tooling is used (e.g., `@hai3/api`). This guarantee holds even across different frameworks (React, Vue, Angular, Svelte). MFEs using third-party HTTP clients (axios, fetch) opt out of this guarantee but the system continues to function.

**2. Platform-Level Shared Data**

Essential platform-level data (authentication state, user context, feature flags) is shared via the SharedProperty mechanism and is guaranteed to be in sync at the architecture level. This is the appropriate channel for inherently host-level concerns, not library-level sharing.

**3. Tooling Implementation (Out of Scope)**

The private optimization layer (e.g., `@hai3/api` cache synchronization) is referenced in this proposal to illustrate how performance concerns will be addressed at the tooling level. The actual implementation of these libraries is out of scope for this proposal and will be addressed in separate tooling proposals.

# Design: MFE Loading and Error Handling

This document covers Module Federation 2.0 bundle loading and manifest fetching strategies.

---

## Context

MFE loading is the process of fetching and initializing remote MFE bundles at runtime. The system uses Module Federation 2.0 as the underlying mechanism, which provides code sharing, dependency management, and dynamic module resolution. The loader works with [MfeEntryMF](./mfe-entry-mf.md) (which defines the entry contract) and [MfManifest](./mfe-manifest.md) (which defines the Module Federation configuration).

The loading process must handle network failures, validation [errors](./mfe-errors.md), and version mismatches while maintaining runtime isolation between MFEs.

## Definition

**MfeLoader**: An internal implementation component that loads MFE bundles using Module Federation 2.0. It resolves manifests, initializes remote containers, and returns the MfeEntryLifecycle interface for mounting.

**ManifestFetcher**: A strategy interface for resolving MfManifest instances from their type IDs. Implementations include URL-based, registry-based, and composite fetchers.

---

## Decisions

### Decision 12: Module Federation 2.0 for Bundle Loading

**What**: Use Webpack 5 / Rspack Module Federation 2.0 for loading remote MFE bundles.

**Why**:
- Mature ecosystem with TypeScript type generation
- Shared dependency configuration with independent control over code sharing and instance isolation
- Battle-tested at scale (Zara, IKEA, others)
- Works with existing HAI3 Vite build (via `@originjs/vite-plugin-federation`)

#### Shared Dependencies Model

Module Federation's shared dependencies provide TWO independent benefits:

1. **Code/Bundle Sharing** (Performance)
   - When a dependency is listed in `shared`, the code is downloaded once and cached
   - All consumers (host and MFEs) use the cached bundle

2. **Runtime Instance Control** (Isolation vs Sharing)
   - `singleton: false` (DEFAULT): Each consumer gets its OWN instance from the shared code
   - `singleton: true`: All consumers share the SAME instance

**Key Insight**: With `singleton: false`, you get BOTH code sharing AND instance isolation.

#### Why `singleton: false` is the Correct Default

HAI3's architecture requires runtime isolation between MFEs:

1. **React State Isolation**: Each MFE has its own React context, hooks state, and reconciler
2. **TypeSystemPlugin Isolation**: Each MFE's schema registry is isolated (security requirement)
3. **@hai3/screensets Isolation**: Each MFE has its own state container

#### When `singleton: true` is Safe

| Library | singleton | Reason |
|---------|-----------|--------|
| lodash | `true` | Pure functions, no internal state |
| date-fns | `true` | Pure functions, no internal state |
| React | `false` | Has hooks state, context, reconciler |
| ReactDOM | `false` | Has fiber tree, event system |
| @hai3/* | `false` | Has TypeSystemPlugin, schema registry |

**MfeLoader (Internal Implementation Detail):**

```typescript
// packages/screensets/src/mfe/loader/index.ts (INTERNAL)

/** @internal */
interface MfeLoaderConfig {
  timeout?: number;   // default: 30000
  retries?: number;   // default: 2
  preload?: boolean;
}

interface MfeEntryLifecycle {
  mount(container: HTMLElement, bridge: MfeBridge): void;
  unmount(container: HTMLElement): void;
}

/** @internal */
interface LoadedMfeInternal {
  lifecycle: MfeEntryLifecycle;
  entry: MfeEntryMF;
  manifest: MfManifest;
  unload: () => void;
}

/** @internal */
class MfeLoader {
  private loadedManifests = new Map<string, MfManifest>();
  private loadedContainers = new Map<string, Container>();

  constructor(
    private typeSystem: TypeSystemPlugin,
    private config: MfeLoaderConfig = {}
  ) {}

  async load(entry: MfeEntryMF): Promise<LoadedMfeInternal> {
    // 1. Validate entry against Module Federation entry schema
    // 2. Resolve and validate manifest
    // 3. Load remote container (cached per remoteName)
    // 4. Get the exposed module using entry.exposedModule
    // 5. Validate the module exports mount/unmount functions
    const manifest = await this.resolveManifest(entry.manifest);
    const container = await this.loadRemoteContainer(manifest);
    const moduleFactory = await container.get(entry.exposedModule);
    const loadedModule = moduleFactory();

    if (typeof loadedModule.mount !== 'function' || typeof loadedModule.unmount !== 'function') {
      throw new MfeLoadError(
        `Module '${entry.exposedModule}' must implement MfeEntryLifecycle interface`,
        []
      );
    }

    return {
      lifecycle: loadedModule as MfeEntryLifecycle,
      entry,
      manifest,
      unload: () => this.unloadIfUnused(manifest.remoteName),
    };
  }

  async preload(entries: MfeEntryMF[]): Promise<void> {
    const byManifest = new Map<string, MfeEntryMF[]>();
    for (const entry of entries) {
      const existing = byManifest.get(entry.manifest) || [];
      existing.push(entry);
      byManifest.set(entry.manifest, existing);
    }

    await Promise.allSettled(
      Array.from(byManifest.keys()).map(async (manifestId) => {
        const manifest = await this.resolveManifest(manifestId);
        await this.loadRemoteContainer(manifest);
      })
    );
  }

  private async resolveManifest(manifestTypeId: string): Promise<MfManifest>;
  private async loadRemoteContainer(manifest: MfManifest): Promise<Container>;
  private async loadScript(url: string): Promise<void>;
  private unloadIfUnused(remoteName: string): void;
}
```

### Decision 18: Manifest Fetching Strategy

The MfeLoader requires a strategy for fetching MfManifest instances from their type IDs.

#### Manifest Fetching Design

```typescript
// packages/screensets/src/mfe/loader/manifest-fetcher.ts

interface ManifestFetcher {
  fetch(manifestTypeId: string): Promise<MfManifest>;
}

class UrlManifestFetcher implements ManifestFetcher {
  constructor(
    private readonly urlResolver: (manifestTypeId: string) => string,
    private readonly fetchOptions?: RequestInit
  ) {}

  async fetch(manifestTypeId: string): Promise<MfManifest> {
    const url = this.urlResolver(manifestTypeId);
    const response = await fetch(url, this.fetchOptions);
    if (!response.ok) {
      throw new MfeLoadError(`Failed to fetch manifest: ${response.status}`, manifestTypeId);
    }
    return response.json();
  }
}

class RegistryManifestFetcher implements ManifestFetcher {
  private readonly manifests = new Map<string, MfManifest>();

  register(manifest: MfManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  async fetch(manifestTypeId: string): Promise<MfManifest> {
    const manifest = this.manifests.get(manifestTypeId);
    if (!manifest) {
      throw new MfeLoadError(`Manifest not found in registry`, manifestTypeId);
    }
    return manifest;
  }
}

class CompositeManifestFetcher implements ManifestFetcher {
  constructor(private readonly fetchers: ManifestFetcher[]) {}

  async fetch(manifestTypeId: string): Promise<MfManifest> {
    for (const fetcher of this.fetchers) {
      try {
        return await fetcher.fetch(manifestTypeId);
      } catch {
        continue;
      }
    }
    throw new MfeLoadError(`Manifest not found by any fetcher`, manifestTypeId);
  }
}
```

#### Usage Example

```typescript
// URL-based fetching
const loader = new MfeLoader(typeSystem, {
  manifestFetcher: new UrlManifestFetcher(
    (typeId) => `https://mfe-registry.example.com/manifests/${encodeURIComponent(typeId)}.json`
  ),
});

// Pre-registered manifests
const registryFetcher = new RegistryManifestFetcher();
registryFetcher.register(analyticsManifest);

// Composite strategy (try registry first, then URL)
const loader = new MfeLoader(typeSystem, {
  manifestFetcher: new CompositeManifestFetcher([
    registryFetcher,
    new UrlManifestFetcher((typeId) => `https://cdn.example.com/manifests/${typeId}.json`),
  ]),
});
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Type System plugin complexity | Provide comprehensive GTS plugin as reference implementation |
| Contract validation overhead | Cache validation results, validate once at registration |
| Module Federation bundle size | Tree-shaking, shared dependencies, lazy loading |
| Manifest discovery | Multiple fetching strategies (registry, URL, composite) |
| Dynamic registration race conditions | Sequential registration with async/await, event-based coordination |

## Testing Strategy

1. **Unit Tests**: Plugin interface, contract validation, type validation, bridge communication
2. **Integration Tests**: MFE loading, domain registration, action chain execution, Shadow DOM isolation
3. **E2E Tests**: Full MFE lifecycle with real Module Federation bundles

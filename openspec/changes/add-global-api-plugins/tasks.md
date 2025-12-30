# Tasks for add-global-api-plugins (Class-Based Design)

## Ordered Work Items

### 1. Add ApiPluginBase Abstract Class to types.ts

**Goal**: Add the non-generic abstract base class for all plugins

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Add `ApiPluginBase` abstract class with:
  - Optional `onRequest` method signature
  - Optional `onResponse` method signature
  - Optional `onError` method signature
  - Optional `destroy` method signature
  - No generic type parameters (used for storage)

**Traceability**:
- Requirement: Type Definitions (spec.md)
- Scenario: ApiPluginBase abstract class (non-generic) (spec.md)
- Decision 3: DRY Plugin Class Hierarchy (design.md)

**Validation**:
- [ ] `ApiPluginBase` abstract class is exported
- [ ] All lifecycle methods are optional
- [ ] No generic type parameters
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: None

---

### 2. Add ApiPlugin Generic Class to types.ts

**Goal**: Add the generic abstract class extending ApiPluginBase with typed config

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Add `ApiPlugin<TConfig>` abstract class:
  - Extends `ApiPluginBase`
  - Uses parameter property: `constructor(protected readonly config: TConfig) { super(); }`
  - TConfig defaults to `void`

**Traceability**:
- Requirement: Type Definitions (spec.md)
- Scenario: ApiPlugin abstract class with parameter property (spec.md)
- Decision 3: DRY Plugin Class Hierarchy (design.md)

**Validation**:
- [ ] `ApiPlugin<TConfig>` abstract class is exported
- [ ] Extends `ApiPluginBase`
- [ ] Uses parameter property for config
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 1

---

### 3. Add Core Context Types to types.ts

**Goal**: Add request, response, and short-circuit types (pure request data)

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Add `ApiRequestContext` type with readonly properties (pure request data):
  - `method: string`
  - `url: string`
  - `headers: Record<string, string>`
  - `body?: unknown`
  - NO serviceName (plugins use DI for service-specific behavior)
- Add `ApiResponseContext` type with readonly properties:
  - `status: number`
  - `headers: Record<string, string>`
  - `data: unknown`
- Add `ShortCircuitResponse` type with readonly `shortCircuit: ApiResponseContext`

**Traceability**:
- Requirement: Type Definitions (spec.md)
- Scenario: ApiRequestContext type (pure request data) (spec.md)
- Scenario: ApiResponseContext type (spec.md)
- Scenario: ShortCircuitResponse type (spec.md)
- Decision 6: Pure Request Data in ApiRequestContext (design.md)

**Validation**:
- [ ] `ApiRequestContext` has only pure request data (method, url, headers, body)
- [ ] `ApiRequestContext` does NOT have serviceName
- [ ] All context properties are readonly
- [ ] `ShortCircuitResponse` type is exported
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: None

---

### 4. Add PluginClass Type and isShortCircuit Guard

**Goal**: Add type-safe plugin class reference type and type guard

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Add `PluginClass<T>` type:
  ```typescript
  export type PluginClass<T extends ApiPluginBase = ApiPluginBase> = abstract new (...args: any[]) => T;
  ```
- Add `isShortCircuit` type guard function:
  ```typescript
  export function isShortCircuit(
    result: ApiRequestContext | ShortCircuitResponse | undefined
  ): result is ShortCircuitResponse {
    return result !== undefined && 'shortCircuit' in result;
  }
  ```

**Traceability**:
- Requirement: Type Definitions (spec.md)
- Scenario: PluginClass type for class references (spec.md)
- Scenario: isShortCircuit type guard (spec.md)

**Validation**:
- [ ] `PluginClass<T>` type is exported
- [ ] `isShortCircuit` function is exported
- [ ] Type guard narrows type correctly
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 1, 3

---

### 5. Update ApiRegistry Interface for Class-Based Service Registration (OCP/DIP Compliant)

**Goal**: Change service registration from string domains to class references, remove mock-specific methods

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Update `ApiRegistry` interface:
  - `register<T extends BaseApiService>(serviceClass: new () => T): void`
  - `getService<T extends BaseApiService>(serviceClass: new () => T): T`
  - `has<T extends BaseApiService>(serviceClass: new () => T): boolean`
  - REMOVE `getDomains()` method
  - REMOVE `registerMocks()` method (OCP/DIP - mock config goes to MockPlugin)
  - REMOVE `setMockMode()` method (OCP/DIP - replaced by plugins.add/remove)
  - REMOVE `getMockMap()` method (OCP/DIP - MockPlugin manages its own map)
- Update `ApiServicesConfig` interface:
  - REMOVE `useMockApi` field (OCP/DIP)
  - REMOVE `mockDelay` field (OCP/DIP - now in MockPluginConfig)

**Traceability**:
- Requirement: Class-Based Service Registration (spec.md)
- Scenario: Register service by class reference (spec.md)
- Scenario: REMOVED - getDomains() method (spec.md)
- Decision 1: Class-Based Service Registration (design.md)
- Decision 13: OCP/DIP Compliant Registry (design.md)

**Validation**:
- [ ] `register()` takes class constructor
- [ ] `getService()` takes class constructor, returns typed instance
- [ ] `has()` takes class constructor
- [ ] `getDomains()` is NOT defined
- [ ] `registerMocks()` is NOT defined (OCP/DIP)
- [ ] `setMockMode()` is NOT defined (OCP/DIP)
- [ ] `getMockMap()` is NOT defined (OCP/DIP)
- [ ] `useMockApi` is NOT in ApiServicesConfig (OCP/DIP)
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: None

---

### 6. Add Namespaced Plugin API to ApiRegistry Interface

**Goal**: Extend ApiRegistry interface with namespaced `plugins` object

**Files**:
- `packages/api/src/types.ts` (modified)

**Changes**:
- Add `readonly plugins: { ... }` namespace object to ApiRegistry interface:
  - `add(...plugins: ApiPluginBase[]): void` - throws on duplicate class
  - `addBefore<T extends ApiPluginBase>(plugin: ApiPluginBase, before: PluginClass<T>): void`
  - `addAfter<T extends ApiPluginBase>(plugin: ApiPluginBase, after: PluginClass<T>): void`
  - `remove<T extends ApiPluginBase>(pluginClass: PluginClass<T>): void` - throws if not registered
  - `has<T extends ApiPluginBase>(pluginClass: PluginClass<T>): boolean`
  - `getAll(): readonly ApiPluginBase[]`
  - `getPlugin<T extends ApiPluginBase>(pluginClass: new (...args: never[]) => T): T | undefined`
- Add JSDoc with code examples for each method

**Traceability**:
- Requirement: ApiRegistry Interface Extension (spec.md)
- Scenario: ApiRegistry interface includes plugins namespace (spec.md)
- Scenario: ApiRegistry.plugins includes getPlugin() method (spec.md)
- Decision 5: getPlugin() Method (design.md)
- Decision 9: Namespaced Plugin API (design.md)

**Validation**:
- [ ] ApiRegistry interface includes `plugins` namespace object
- [ ] All plugin methods defined with correct signatures
- [ ] `getPlugin()` method defined
- [ ] JSDoc includes code examples
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 1, 4

---

### 7. Implement Class-Based Service Registration in apiRegistry (OCP/DIP Compliant)

**Goal**: Update apiRegistry to use class references instead of string domains, remove mock-specific methods

**Files**:
- `packages/api/src/apiRegistry.ts` (modified)

**Changes**:
- Change services storage from `Map<string, service>` to `Map<ServiceClass, service>`
- Update `register()`:
  - Take class constructor, not string + class
  - Instantiate service
  - Call `_setGlobalPluginsProvider()` on service
  - Store with class as key
- Update `getService()`:
  - Take class constructor
  - Return typed instance
  - Throw if not registered
- Update `has()`:
  - Take class constructor
- REMOVE `getDomains()` method
- REMOVE `registerMocks()` method (OCP/DIP)
- REMOVE `setMockMode()` method (OCP/DIP)
- REMOVE `getMockMap()` method (OCP/DIP)
- REMOVE `mockMaps` storage (OCP/DIP)
- REMOVE mock-related private methods (`enableMockMode`, `disableMockMode`, `updateServiceMockPlugin`)

**Traceability**:
- Requirement: Class-Based Service Registration (spec.md)
- Scenario: Register service by class reference (spec.md)
- Decision 1: Class-Based Service Registration (design.md)
- Decision 13: OCP/DIP Compliant Registry (design.md)

**Validation**:
- [ ] `register(ServiceClass)` creates and stores instance
- [ ] `getService(ServiceClass)` returns correctly typed instance
- [ ] `has(ServiceClass)` returns correct boolean
- [ ] `getDomains()` does not exist
- [ ] `registerMocks()` does not exist (OCP/DIP)
- [ ] `setMockMode()` does not exist (OCP/DIP)
- [ ] `getMockMap()` does not exist (OCP/DIP)
- [ ] No mock-related code in apiRegistry (OCP/DIP)
- [ ] `_setGlobalPluginsProvider()` called on registration
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 5

---

### 8. Implement Namespaced Plugin API in apiRegistry

**Goal**: Add private storage and implement `plugins` namespace object

**Files**:
- `packages/api/src/apiRegistry.ts` (modified)

**Changes**:
- Add `private globalPlugins: ApiPluginBase[] = []` field to ApiRegistryImpl
- Create `readonly plugins` namespace object with implementations:
  - `add(...plugins: ApiPluginBase[]): void`
    - Validate no duplicate plugin classes (via instanceof)
    - Append each plugin to globalPlugins array (FIFO)
    - Throw if duplicate class already registered
  - `getAll(): readonly ApiPluginBase[]`
    - Return readonly array of plugins in execution order
  - `has<T extends ApiPluginBase>(pluginClass: PluginClass<T>): boolean`
    - Return true if plugin of given class is registered
  - `getPlugin<T extends ApiPluginBase>(pluginClass: new (...args: never[]) => T): T | undefined`
    - Find and return plugin instance by class

**Traceability**:
- Scenario: Register global plugins with plugins.add() (spec.md)
- Scenario: Get global plugins (spec.md)
- Scenario: Check if plugin is registered (spec.md)
- Scenario: Get plugin by class reference (spec.md)
- Decision 5: getPlugin() Method (design.md)
- Decision 10: Duplicate Policy (design.md)

**Validation**:
- [ ] `plugins.add()` appends plugins in FIFO order
- [ ] `plugins.add()` throws on duplicate plugin class
- [ ] `plugins.getAll()` returns readonly array in execution order
- [ ] `plugins.has()` returns true/false based on class
- [ ] `plugins.getPlugin()` returns instance or undefined
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 1, 6

---

### 9. Implement Plugin Positioning in apiRegistry

**Goal**: Add before/after positioning via `plugins.addBefore()` and `plugins.addAfter()`

**Files**:
- `packages/api/src/apiRegistry.ts` (modified)

**Changes**:
- Add to `plugins` namespace object:
  - `addBefore<T extends ApiPluginBase>(plugin: ApiPluginBase, before: PluginClass<T>): void`
    - Find target plugin by class (using instanceof)
    - Insert before target
    - Throw if target plugin class not found
    - Throw on duplicate plugin class
    - Detect circular dependencies and throw
  - `addAfter<T extends ApiPluginBase>(plugin: ApiPluginBase, after: PluginClass<T>): void`
    - Find target plugin by class (using instanceof)
    - Insert after target
    - Throw if target plugin class not found
    - Throw on duplicate plugin class
    - Detect circular dependencies and throw

**Traceability**:
- Scenario: Position before another plugin by class (spec.md)
- Scenario: Position after another plugin by class (spec.md)

**Validation**:
- [ ] `plugins.addBefore()` inserts before target
- [ ] `plugins.addAfter()` inserts after target
- [ ] Throws on non-existent target plugin class
- [ ] Throws on duplicate plugin class
- [ ] Throws on circular dependency
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 8

---

### 10. Implement Plugin Removal in apiRegistry

**Goal**: Add ability to remove plugins by class with cleanup via `plugins.remove()`

**Files**:
- `packages/api/src/apiRegistry.ts` (modified)

**Changes**:
- Add to `plugins` namespace object:
  - `remove<T extends ApiPluginBase>(pluginClass: PluginClass<T>): void`
    - Find plugin by class (using instanceof)
    - If found, call `destroy()` if available
    - Remove from globalPlugins array
    - Throw if plugin not registered
- Update `reset()` to clear global plugins
  - Call `destroy()` on each global plugin
  - Clear globalPlugins array

**Traceability**:
- Scenario: Remove global plugin by class (spec.md)
- Scenario: Registry reset clears global plugins (spec.md)

**Validation**:
- [ ] `plugins.remove()` removes plugin from storage (found by instanceof)
- [ ] `plugins.remove()` calls `destroy()` if available
- [ ] `plugins.remove()` throws if plugin not registered
- [ ] `reset()` calls `destroy()` on all plugins
- [ ] `reset()` clears globalPlugins array
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 8

---

### 11. Add Internal Global Plugins Injection to BaseApiService (OCP/DIP Compliant)

**Goal**: Add `_setGlobalPluginsProvider()` internal method, remove mock-related code

**Files**:
- `packages/api/src/BaseApiService.ts` (modified)

**Changes**:
- Add `private globalPluginsProvider: (() => readonly ApiPluginBase[]) | null = null` field
- Add internal method:
  ```typescript
  _setGlobalPluginsProvider(provider: () => readonly ApiPluginBase[]): void {
    this.globalPluginsProvider = provider;
  }
  ```
- Add method to get global plugins:
  ```typescript
  private getGlobalPlugins(): readonly ApiPluginBase[] {
    return this.globalPluginsProvider?.() ?? [];
  }
  ```
- REMOVE `getMockMap()` method (OCP/DIP - services unaware of mocking):
  ```typescript
  // REMOVE THIS:
  protected getMockMap(): MockMap {
    return {};
  }
  ```
- REMOVE any mock-related imports or dependencies

**Traceability**:
- Requirement: Internal Global Plugins Injection (spec.md)
- Scenario: _setGlobalPluginsProvider() internal method (spec.md)
- Decision 4: Internal Global Plugins Injection (design.md)
- Decision 15: Services unaware of plugins (design.md)

**Validation**:
- [ ] `_setGlobalPluginsProvider()` method exists
- [ ] Method is internal (underscore convention)
- [ ] Global plugins accessible via provider
- [ ] `getMockMap()` does NOT exist (OCP/DIP)
- [ ] No mock-related code in BaseApiService (OCP/DIP)
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 1

---

### 12. Add Namespaced Plugin API to BaseApiService

**Goal**: Add namespaced `plugins` object to BaseApiService

**Files**:
- `packages/api/src/BaseApiService.ts` (modified)

**Changes**:
- Add `private servicePlugins: ApiPluginBase[] = []` field
- Add `private excludedPluginClasses: Set<PluginClass> = new Set()` field
- Create `readonly plugins` namespace object with implementations:
  - `add(...plugins: ApiPluginBase[]): void`
    - Append plugins to servicePlugins array (FIFO)
    - Duplicates of same class ARE allowed (different configs)
  - `exclude(...pluginClasses: PluginClass[]): void`
    - Add classes to excludedPluginClasses set
  - `getExcluded(): readonly PluginClass[]`
    - Return array of excluded plugin classes
  - `getAll(): readonly ApiPluginBase[]`
    - Return service plugins (not including globals)
  - `getPlugin<T extends ApiPluginBase>(pluginClass: new (...args: never[]) => T): T | undefined`
    - Search service plugins first, then global plugins
    - Return instance or undefined

**Traceability**:
- Scenario: Register service-specific plugins with plugins.add() (spec.md)
- Scenario: Exclude global plugins by class (spec.md)
- Scenario: Get excluded plugin classes (spec.md)
- Scenario: Get service plugins (spec.md)
- Scenario: Get plugin by class reference (service-level) (spec.md)
- Decision 5: getPlugin() Method (design.md)
- Decision 10: Duplicate Policy (design.md)

**Validation**:
- [ ] `plugins.add()` appends plugins to service-specific storage
- [ ] `plugins.add()` allows duplicates of same class
- [ ] `plugins.exclude()` stores plugin classes for exclusion
- [ ] `plugins.getExcluded()` returns readonly array of classes
- [ ] `plugins.getAll()` returns service plugins only
- [ ] `plugins.getPlugin()` searches service then global
- [ ] Service plugins are separate from global plugins
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 1, 4, 11

---

### 13. Implement Plugin Merging in BaseApiService

**Goal**: Merge global and service plugins respecting exclusions by class

**Files**:
- `packages/api/src/BaseApiService.ts` (modified)

**Changes**:
- Implement `getMergedPluginsInOrder(): readonly ApiPluginBase[]`
  - Get global plugins via provider
  - Filter out plugins where `plugin instanceof excludedClass` for any excluded class
  - Append servicePlugins (FIFO)
  - Return merged array
- Implement `getMergedPluginsReversed(): readonly ApiPluginBase[]`
  - Return reversed `getMergedPluginsInOrder()` for response phase

**Traceability**:
- Scenario: Plugin merging respects exclusions by class (spec.md)
- Scenario: Reverse order for response processing (spec.md)
- Scenario: Plugin execution follows FIFO order (spec.md)

**Validation**:
- [ ] Global plugins come before service plugins
- [ ] Excluded plugin classes are filtered out (via instanceof)
- [ ] `getMergedPluginsReversed()` returns correct reverse order
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 11, 12

---

### 14. Implement Plugin Execution Chain

**Goal**: Execute plugin lifecycle methods with short-circuit and error recovery support

**Files**:
- `packages/api/src/BaseApiService.ts` or protocol files (modified)

**Changes**:
- Update request execution to use class-based chain:
  1. Build request context with pure request data (method, url, headers, body - NO serviceName)
  2. For each plugin in order, call `onRequest?.(ctx)`
  3. If returns `{ shortCircuit }`, stop chain and use response
  4. If not short-circuited, make HTTP request
  5. For each plugin in reverse order, call `onResponse?.(response, request)`
  6. Return final response
- Implement error handling:
  1. On error, call `onError?.(error, request)` for each plugin in reverse
  2. If returns `ApiResponseContext`, treat as recovery
  3. If returns `Error`, pass to next handler
  4. If no recovery, throw final error

**Traceability**:
- Scenario: Short-circuit skips HTTP request (spec.md)
- Scenario: onRequest lifecycle method contract (spec.md)
- Scenario: onResponse lifecycle method contract (spec.md)
- Scenario: onError lifecycle method contract (spec.md)
- Decision 6: Pure Request Data in ApiRequestContext (design.md)

**Validation**:
- [ ] `onRequest` methods execute in FIFO order
- [ ] Short-circuit return stops chain and skips HTTP
- [ ] `onResponse` methods execute in reverse order
- [ ] `onError` can transform error or recover with response
- [ ] Request context has pure request data (no serviceName)
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 13

---

### 15. Update MockPlugin to Extend ApiPlugin (OCP/DIP Compliant)

**Goal**: Update MockPlugin to be completely self-contained - all mock config in constructor

**Files**:
- `packages/api/src/plugins/MockPlugin.ts` (modified)

**Changes**:
- Update MockPlugin to extend `ApiPlugin<MockPluginConfig>`:
```typescript
export interface MockPluginConfig {
  /** Mock response map - keys are full URL patterns (e.g., 'GET /api/accounts/user/current') */
  mockMap: MockMap;
  /** Simulated network delay in ms */
  delay?: number;
}

export class MockPlugin extends ApiPlugin<MockPluginConfig> {
  /** Update mock map dynamically */
  setMockMap(mockMap: Readonly<MockMap>): void {
    (this.config as { mockMap: Readonly<MockMap> }).mockMap = mockMap;
  }

  async onRequest(ctx: ApiRequestContext): Promise<ApiRequestContext | ShortCircuitResponse> {
    // Match against full URL (includes service baseURL path)
    const factory = this.findMockFactory(ctx.method, ctx.url);

    if (factory) {
      if (this.config.delay) {
        await new Promise(r => setTimeout(r, this.config.delay));
      }
      return {
        shortCircuit: {
          status: 200,
          headers: { 'x-hai3-short-circuit': 'true' },
          data: factory(ctx.body)
        }
      };
    }
    return ctx;
  }

  // ... existing URL pattern matching logic
}
```
- MockPlugin matches full URL patterns including service baseURL:
  - `'GET /api/accounts/user/current'` (not relative `/user/current`)
  - This allows centralized mock configuration without per-service knowledge
- Remove any dependency on registry mock storage
- **NOTE**: The current MockPlugin implementation already matches against `ctx.url` directly.
  The request context `url` is built by protocols (RestProtocol) to include the full path
  (baseURL + endpoint). No URL transformation changes are needed in MockPlugin itself -
  only the mock map keys should use full URL patterns.

**Traceability**:
- Scenario: Mock plugin with short-circuit (spec.md)
- Example: MockPlugin implementation (design.md)
- Decision 13: OCP/DIP Compliant Registry (design.md)
- Decision 14: Self-contained plugins (design.md)

**Validation**:
- [ ] `MockPlugin` extends `ApiPlugin<MockPluginConfig>`
- [ ] Uses `this.config.mockMap` for mock data
- [ ] Matches full URL patterns (includes baseURL path)
- [ ] Uses short-circuit to return mock responses
- [ ] `setMockMap()` allows dynamic updates
- [ ] No dependency on registry mock methods
- [ ] Supports optional delay via `this.config.delay`
- [ ] No concurrency issues (MockPlugin is stateless except for config)
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 2, 3, 14

**Note on Concurrency Safety**:
Stateful plugins should use request-scoped storage (WeakMap keyed by request context)
for production use. MockPlugin is safe as it only reads from immutable config.

---

### 16. Update Package Exports

**Goal**: Ensure all new types and classes are properly exported

**Files**:
- `packages/api/src/index.ts` (modified)

**Changes**:
- Export all new types and classes:
  - `ApiPluginBase` (abstract class)
  - `ApiPlugin` (abstract class)
  - `PluginClass` (type)
  - `ApiRequestContext` (type)
  - `ApiResponseContext` (type)
  - `ShortCircuitResponse` (type)
  - `isShortCircuit` (function)
- Export updated `MockPlugin` class
- Remove old types (clean break):
  - Remove any deprecated exports

**Traceability**:
- Acceptance Criteria: AC9 Types are exported

**Validation**:
- [ ] All new types importable from '@hai3/api'
- [ ] `ApiPluginBase` class importable from '@hai3/api'
- [ ] `ApiPlugin` class importable from '@hai3/api'
- [ ] `isShortCircuit` function importable from '@hai3/api'
- [ ] `apiRegistry.plugins.add()` method available
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Tasks 1-15

---

### 17. Verify Framework Re-exports

**Goal**: Confirm L2 layer properly re-exports updated types

**Files**:
- `packages/framework/src/index.ts` (verify, may not need changes)

**Changes**:
- Verify existing re-exports work with updated types
- No code changes expected (pass-through exports)

**Traceability**:
- Proposal: Layer Propagation section

**Validation**:
- [ ] `import { ApiPluginBase, ApiPlugin, apiRegistry } from '@hai3/framework'` works
- [ ] `import { MockPlugin } from '@hai3/framework'` works
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 16

---

### 18. Verify React Re-exports

**Goal**: Confirm L3 layer properly re-exports updated types

**Files**:
- `packages/react/src/index.ts` (verify, may not need changes)

**Changes**:
- Verify existing re-exports work with updated types
- No code changes expected (pass-through exports)

**Traceability**:
- Proposal: Layer Propagation section

**Validation**:
- [ ] `import { ApiPluginBase, ApiPlugin, apiRegistry } from '@hai3/react'` works
- [ ] TypeScript compiles without errors

**Status**: COMPLETED

**Dependencies**: Task 17

---

### 19. Run Architecture Validation

**Goal**: Ensure changes follow HAI3 architecture rules

**Commands**:
```bash
npm run type-check
npm run lint
npm run arch:check
npm run arch:deps
```

**Traceability**:
- HAI3 Guidelines: PRE-DIFF CHECKLIST

**Validation**:
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Architecture tests pass
- [ ] Dependency rules validated

**Status**: COMPLETED

**Dependencies**: Task 18

---

### 20. Manual Testing - Class-Based Service Registration

**Goal**: Verify class-based service registration works

**Steps**:
1. Start dev server: `npm run dev`
2. Open browser console
3. Test registration:
   ```typescript
   class TestService extends BaseApiService {}
   apiRegistry.register(TestService);
   const service = apiRegistry.getService(TestService);
   // service should be typed as TestService
   ```
4. Test has():
   ```typescript
   apiRegistry.has(TestService); // true
   apiRegistry.has(UnregisteredService); // false
   ```

**Traceability**:
- Acceptance Criteria: AC1 Class-based service registration works

**Validation**:
- [ ] `register(ServiceClass)` creates instance
- [ ] `getService(ServiceClass)` returns correctly typed instance
- [ ] `has(ServiceClass)` returns correct boolean
- [ ] No console errors

**Status**: NOT STARTED

**Dependencies**: Task 19

---

### 21. Manual Testing - Global Plugin Registration (Namespaced API)

**Goal**: Verify global plugins work with FIFO ordering via namespaced API

**Steps**:
1. Test FIFO ordering:
   ```typescript
   class LoggingPlugin extends ApiPlugin<void> {
     constructor() { super(void 0); }
     onRequest(ctx) { console.log('1: Logging'); return ctx; }
   }
   class AuthPlugin extends ApiPlugin<{ getToken: () => string }> {
     onRequest(ctx) { console.log('2: Auth'); return ctx; }
   }
   apiRegistry.plugins.add(new LoggingPlugin(), new AuthPlugin({ getToken: () => 'token' }));
   ```
2. Make an API request
3. Verify console shows: "1: Logging" then "2: Auth"
4. Test `plugins.has()`: `apiRegistry.plugins.has(LoggingPlugin)` returns `true`
5. Test `plugins.getPlugin()`: `apiRegistry.plugins.getPlugin(LoggingPlugin)` returns instance

**Traceability**:
- Acceptance Criteria: AC2 Global plugin registration works (namespaced API)

**Validation**:
- [ ] FIFO ordering works correctly
- [ ] Duplicate class throws error
- [ ] `plugins.has()` returns correct boolean
- [ ] `plugins.getPlugin()` returns instance or undefined
- [ ] No console errors

**Status**: NOT STARTED

**Dependencies**: Task 20

---

### 22. Manual Testing - Plugin Positioning by Class (Namespaced API)

**Goal**: Verify before/after positioning works via namespaced API

**Steps**:
1. Register plugins with positioning:
   ```typescript
   apiRegistry.plugins.add(new LoggingPlugin(), new AuthPlugin({ getToken }));
   apiRegistry.plugins.addAfter(new MetricsPlugin(), LoggingPlugin);
   ```
2. Make a request
3. Verify order: LoggingPlugin -> MetricsPlugin -> AuthPlugin

**Traceability**:
- Acceptance Criteria: AC3 Plugin positioning works (namespaced API)

**Validation**:
- [ ] `plugins.addAfter(plugin, TargetClass)` positions correctly
- [ ] `plugins.addBefore(plugin, TargetClass)` positions correctly
- [ ] Invalid class reference throws error

**Status**: NOT STARTED

**Dependencies**: Task 21

---

### 23. Manual Testing - Short-Circuit

**Goal**: Verify short-circuit skips HTTP request

**Steps**:
1. Register mock plugin:
   ```typescript
   apiRegistry.plugins.add(new MockPlugin({
     mockMap: { 'GET /api/users': () => [{ id: 1, name: 'Test' }] }
   }));
   ```
2. Make request to `/api/users`
3. Verify mock data returned without network request
4. Check for `x-hai3-short-circuit: true` header in response

**Traceability**:
- Acceptance Criteria: AC6 Short-circuit works

**Validation**:
- [ ] Mock data returned
- [ ] No network request made
- [ ] Response includes `x-hai3-short-circuit: true` header
- [ ] `onResponse` hooks still execute

**Status**: NOT STARTED

**Dependencies**: Task 22

---

### 24. Manual Testing - Service Exclusion by Class (Namespaced API)

**Goal**: Verify services can exclude global plugins via namespaced API

**Steps**:
1. Register global auth plugin
2. Create a health check service that excludes auth:
   ```typescript
   class HealthService extends BaseApiService {
     constructor() {
       super();
       this.plugins.exclude(AuthPlugin);
     }
   }
   ```
3. Make requests to both regular and health services
4. Verify auth plugin runs for regular service but not health service

**Traceability**:
- Acceptance Criteria: AC5 Service exclusion works (namespaced API)

**Validation**:
- [ ] Excluded plugin classes do not run for the service
- [ ] Other services still receive the global plugin
- [ ] `plugins.getExcluded()` returns correct classes
- [ ] Service-level duplicates are allowed

**Status**: NOT STARTED

**Dependencies**: Task 23

---

### 25. Manual Testing - getPlugin() Method

**Goal**: Verify getPlugin() works at both registry and service level

**Steps**:
1. Register plugins:
   ```typescript
   apiRegistry.plugins.add(new LoggingPlugin(), new AuthPlugin({ getToken }));
   ```
2. Test registry-level getPlugin:
   ```typescript
   const logging = apiRegistry.plugins.getPlugin(LoggingPlugin);
   // logging should be typed as LoggingPlugin
   ```
3. Test service-level getPlugin (searches service then global):
   ```typescript
   service.plugins.add(new RateLimitPlugin({ limit: 100 }));
   const rateLimit = service.plugins.getPlugin(RateLimitPlugin); // service plugin
   const auth = service.plugins.getPlugin(AuthPlugin); // global plugin
   ```

**Traceability**:
- Acceptance Criteria: AC13 getPlugin() method works

**Validation**:
- [ ] `apiRegistry.plugins.getPlugin()` returns instance or undefined
- [ ] `service.plugins.getPlugin()` searches service first
- [ ] `service.plugins.getPlugin()` falls back to global
- [ ] Return types correctly inferred

**Status**: NOT STARTED

**Dependencies**: Task 24

---

### 26. Manual Testing - Internal Global Plugins Injection

**Goal**: Verify services receive global plugins via internal method

**Steps**:
1. Register global plugin BEFORE service:
   ```typescript
   apiRegistry.plugins.add(new LoggingPlugin());
   apiRegistry.register(TestService);
   // Verify logging works for TestService
   ```
2. Register global plugin AFTER service:
   ```typescript
   apiRegistry.register(AnotherService);
   apiRegistry.plugins.add(new AuthPlugin({ getToken }));
   // Verify auth works for AnotherService (via provider)
   ```

**Traceability**:
- Acceptance Criteria: AC12 Internal global plugins injection works

**Validation**:
- [ ] Services registered before plugins see new plugins
- [ ] Services registered after plugins see existing plugins
- [ ] No changes needed in derived service classes

**Status**: NOT STARTED

**Dependencies**: Task 25

---

## Task Dependency Graph

```
Task 1 (ApiPluginBase) ──────────────────────────────────────────────────┐
       │                                                                  │
       v                                                                  │
Task 2 (ApiPlugin<TConfig>) ─────────────────────────────────────────────┤
                                                                          │
Task 3 (Context Types) ──────────────────────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 4 (PluginClass + Guard) ────────────────────────────────────────────┤
                                                                          │
Task 5 (ApiRegistry Service Interface) ──────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 6 (ApiRegistry Plugin Interface) ───────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 7 (apiRegistry Service Impl) ───────────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 8 (apiRegistry Plugin Storage) ─────────────────────────────────────┤
       │                                                                  │
       ├──> Task 9 (Plugin Positioning)                                   │
       │                                                                  │
       └──> Task 10 (Plugin Removal)                                      │
                                                                          │
Task 11 (BaseApiService Global Injection) ───────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 12 (BaseApiService Plugin Namespace) ───────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 13 (Plugin Merging) ────────────────────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 14 (Plugin Execution Chain) ────────────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 15 (MockPlugin Update) ─────────────────────────────────────────────┤
       │                                                                  │
       v                                                                  │
Task 16 (Package Exports) ───────────────────────────────────────────────┘
       │
       v
Task 17 (Framework Re-exports)
       │
       v
Task 18 (React Re-exports)
       │
       v
Task 19 (Architecture Validation)
       │
       v
Task 20 (Test Service Registration)
       │
       v
Task 21 (Test Plugin Registration)
       │
       v
Task 22 (Test Positioning)
       │
       v
Task 23 (Test Short-Circuit)
       │
       v
Task 24 (Test Exclusion)
       │
       v
Task 25 (Test getPlugin)
       │
       v
Task 26 (Test Internal Injection)
       |
       v
Task 27 (Update API.md)
       |
       v
Task 28-31 (Update Commands) [parallel]
       |
       v
Task 32 (Validation Grep)
```

---

### 27. Update .ai/targets/API.md Guidelines

**Goal**: Update API guidelines for new class-based plugin architecture

**Files**:
- `.ai/targets/API.md` (modified)

**Changes**:
- Update SCOPE section: Change path from `packages/uicore/src/api/**` to `packages/api/src/**`
- Update CRITICAL RULES:
  - Change "update ApiServicesMap via module augmentation" to class-based registration
  - Remove "Mock data lives in the app layer and is wired via apiRegistry.initialize({ useMockApi, mockMaps })"
  - Add "Mock data configured via `apiRegistry.plugins.add(new MockPlugin({ mockMap }))`"
- Update STOP CONDITIONS:
  - Remove or update "Editing BaseApiService or apiRegistry.ts" (feature requires it)
- Update USAGE RULES:
  - Change `apiRegistry.getService(DOMAIN)` to `apiRegistry.getService(ServiceClass)`
  - Update "Type inference must originate from ApiServicesMap" to class-based
  - Remove any references to `registerMocks()`, `setMockMode()`, `useMockApi`
- Rewrite PLUGIN RULES section:
  - REQUIRED: Extend ApiPluginBase (no config) or ApiPlugin<TConfig> (with config)
  - REQUIRED: Use namespaced API (apiRegistry.plugins.add, service.plugins.add)
  - REQUIRED: Plugins are identified by class reference (instanceof)
  - REQUIRED: MockPlugin is self-contained (all config in constructor)
  - FORBIDDEN: String-based plugin names for identification
  - FORBIDDEN: Mock-specific methods on apiRegistry (registerMocks, setMockMode)
- Update PRE-DIFF CHECKLIST:
  - Change "ApiServicesMap augmented" to "Service registered with apiRegistry.register(ServiceClass)"

**Traceability**:
- Gate 1 Review: Non-blocking suggestion (API.md Target File Update)

**Validation**:
- [ ] File stays under 100 lines
- [ ] ASCII only, no unicode
- [ ] Rules use keywords (REQUIRED, FORBIDDEN, STOP)
- [ ] No duplication with other target files

**Status**: NOT STARTED

**Dependencies**: Task 19

---

### 28. Update hai3-new-api-service.md Command (SDK Layer)

**Goal**: Update SDK command template for class-based registration

**Files**:
- `packages/api/commands/hai3-new-api-service.md` (modified)

**Changes**:
- Update service registration pattern:
  - BAD: `apiRegistry.register(DOMAIN, ServiceClass)`
  - GOOD: `apiRegistry.register(ServiceClass)`
- Remove module augmentation pattern (ApiServicesMap)
- Update getService examples:
  - BAD: `apiRegistry.getService(DOMAIN)`
  - GOOD: `apiRegistry.getService(ServiceClass)`
- REMOVE mock registration section (OCP/DIP - mocks now configured via MockPlugin):
  - Remove any references to `apiRegistry.registerMocks()`
  - Add note: "Mock configuration via `apiRegistry.plugins.add(new MockPlugin({ mockMap }))`"
- Update constructor (simple, no globalPluginsProvider):
  ```typescript
  constructor() {
    super({ baseURL: '/api/v1/{domain}' }, [new RestProtocol()]);
  }
  ```

**Traceability**:
- Decision 1: Class-Based Service Registration (design.md)
- Decision 13: OCP/DIP Compliant Registry (design.md)

**Validation**:
- [ ] No string domain registration
- [ ] No module augmentation
- [ ] No `registerMocks()` references (OCP/DIP)
- [ ] Constructor takes no parameters
- [ ] File follows AI.md format rules

**Status**: NOT STARTED

**Dependencies**: Task 27

---

### 29. Update hai3-new-api-service.framework.md Command

**Goal**: Update Framework layer command template for class-based registration

**Files**:
- `packages/api/commands/hai3-new-api-service.framework.md` (modified)

**Changes**:
- Same changes as Task 28
- Ensure imports use `@hai3/framework` not `@hai3/api`

**Traceability**:
- Decision 1: Class-Based Service Registration (design.md)

**Validation**:
- [ ] No string domain registration
- [ ] No module augmentation
- [ ] Imports from @hai3/framework

**Status**: NOT STARTED

**Dependencies**: Task 27

---

### 30. Update hai3-new-api-service.react.md Command

**Goal**: Update React layer command template for class-based registration

**Files**:
- `packages/api/commands/hai3-new-api-service.react.md` (modified)

**Changes**:
- Same registration changes as Task 28
- Update effects to use class-based getService:
  ```typescript
  const service = apiRegistry.getService(MyApiService);
  ```
- Ensure imports use `@hai3/react`

**Traceability**:
- Decision 1: Class-Based Service Registration (design.md)

**Validation**:
- [ ] No string domain registration
- [ ] No module augmentation
- [ ] Effects use class-based getService
- [ ] Imports from @hai3/react

**Status**: NOT STARTED

**Dependencies**: Task 27

---

### 31. Update hai3-quick-ref.md Command

**Goal**: Update quick reference Registry section

**Files**:
- `packages/framework/commands/hai3-quick-ref.md` (modified)

**Changes**:
- Update Registry section (lines 29-33):
  - REMOVE: `export const MY_DOMAIN = 'my-domain'`
  - KEEP: `class MyService extends BaseApiService`
  - REMOVE: `declare module '@hai3/api' { interface ApiServicesMap }`
  - CHANGE: `apiRegistry.register(MY_DOMAIN, MyService)` to `apiRegistry.register(MyService)`

**Traceability**:
- Decision 1: Class-Based Service Registration (design.md)

**Validation**:
- [ ] No string domain constant
- [ ] No module augmentation
- [ ] Class-based registration only

**Status**: NOT STARTED

**Dependencies**: Task 27

---

### 32. Add ApiServicesMap Migration Validation

**Goal**: Verify no orphaned ApiServicesMap module augmentation remains

**Files**:
- None (validation only)

**Commands**:
```bash
grep -rn "interface ApiServicesMap" src/ packages/
grep -rn "declare module.*@hai3" src/ packages/ | grep ApiServicesMap
```

**Traceability**:
- Gate 1 Review: Non-blocking suggestion (ApiServicesMap Removal Validation)

**Validation**:
- [ ] No ApiServicesMap module augmentation in src/
- [ ] No ApiServicesMap module augmentation in app code
- [ ] Only type definition in packages/api/src/types.ts (empty interface)

**Status**: NOT STARTED

**Dependencies**: Tasks 28-31

---

## Parallelizable Work

- Tasks 1, 3, 5 can run in parallel (independent type definitions)
- Task 2 depends on Task 1
- Task 4 depends on Tasks 1 and 3
- Task 6 depends on Tasks 1 and 4
- Tasks 7 and 11 can run in parallel after Tasks 5 and 1 respectively
- Task 8 depends on Tasks 1 and 6
- Tasks 9 and 10 can run in parallel after Task 8
- Tasks 12 and 13 are sequential after Task 11
- Tasks 17-18 (re-export verification) can run in parallel after Task 16
- Tasks 20-26 (manual testing) must be sequential
- Task 27 (API.md) depends on Task 19
- Tasks 28-31 (command updates) can run in parallel after Task 27
- Task 32 (migration validation) depends on Tasks 28-31

## Estimated Effort

- Tasks 1-4: 1.5 hours (type definitions)
- Tasks 5-6: 1 hour (interface updates)
- Task 7: 1.5 hours (class-based service registration)
- Tasks 8-10: 2 hours (apiRegistry plugin implementation)
- Tasks 11-13: 1.5 hours (BaseApiService changes)
- Task 14: 2 hours (plugin execution chain)
- Task 15: 30 minutes (MockPlugin update)
- Task 16: 15 minutes (export verification)
- Tasks 17-18: 20 minutes (re-export verification)
- Task 19: 15 minutes (validation commands)
- Tasks 20-26: 2 hours (manual testing)
- Task 27: 30 minutes (API.md guidelines update)
- Tasks 28-31: 1 hour (command updates, parallel)
- Task 32: 10 minutes (migration validation grep)

**Total**: ~14 hours

## Success Criteria

### Type Definitions
- [ ] `ApiPluginBase` abstract class exported from `@hai3/api` (non-generic)
- [ ] `ApiPlugin<TConfig>` abstract class exported (extends ApiPluginBase)
- [ ] `PluginClass<T>` type exported for class references
- [ ] `ApiRequestContext` exported with pure request data (no serviceName)
- [ ] All context types exported from `@hai3/api`

### Class-Based Service Registration
- [ ] `apiRegistry.register(ServiceClass)` creates and stores instance
- [ ] `apiRegistry.getService(ServiceClass)` returns correctly typed instance
- [ ] `apiRegistry.has(ServiceClass)` returns correct boolean
- [ ] `getDomains()` method does NOT exist

### OCP/DIP Compliance (Registry)
- [ ] `apiRegistry.registerMocks()` does NOT exist
- [ ] `apiRegistry.setMockMode()` does NOT exist
- [ ] `apiRegistry.getMockMap()` does NOT exist
- [ ] `useMockApi` is NOT in ApiServicesConfig
- [ ] No mock-related private methods in apiRegistry

### OCP/DIP Compliance (Services)
- [ ] `BaseApiService.getMockMap()` does NOT exist
- [ ] Services have zero knowledge of mocking
- [ ] No mock-related imports in BaseApiService

### OCP/DIP Compliance (MockPlugin)
- [ ] MockPlugin is completely self-contained
- [ ] MockPlugin receives all mock config in constructor
- [ ] MockPlugin matches full URL patterns (includes baseURL path)
- [ ] `MockPlugin.setMockMap()` for dynamic updates

### Plugin Registry API
- [ ] `apiRegistry.plugins.add()` registers plugins in FIFO order (no duplicates)
- [ ] `apiRegistry.plugins.addBefore()` / `addAfter()` support positioning by class
- [ ] `apiRegistry.plugins.remove()` removes by class with cleanup
- [ ] `apiRegistry.plugins.has()` checks registration by class
- [ ] `apiRegistry.plugins.getAll()` returns ordered plugins
- [ ] `apiRegistry.plugins.getPlugin()` returns instance by class

### Plugin Service API
- [ ] `service.plugins.add()` registers service-specific plugins (duplicates allowed)
- [ ] `service.plugins.exclude()` excludes global plugins by class
- [ ] `service.plugins.getExcluded()` returns excluded classes
- [ ] `service.plugins.getAll()` returns service plugins
- [ ] `service.plugins.getPlugin()` searches service then global

### Plugin Execution
- [ ] `_setGlobalPluginsProvider()` called on service registration
- [ ] Short-circuit via `{ shortCircuit: response }` skips HTTP
- [ ] `onResponse` hooks execute in reverse order (onion model)
- [ ] `onError` can transform errors or recover with response
- [ ] `MockPlugin` extends `ApiPlugin<TConfig>`
- [ ] `isShortCircuit()` type guard exported and functional
- [ ] Global plugins: duplicate class throws error
- [ ] Service plugins: duplicate class allowed (different configs)

### Validation
- [ ] All architecture validations pass
- [ ] Framework and React layers re-export correctly
- [ ] Manual testing confirms end-to-end functionality

### Documentation
- [ ] `.ai/targets/API.md` updated for class-based registration
- [ ] `.ai/targets/API.md` PLUGIN RULES section reflects new class hierarchy
- [ ] `hai3-new-api-service.md` uses class-based registration (all variants)
- [ ] `hai3-quick-ref.md` Registry section updated
- [ ] No orphaned ApiServicesMap module augmentation in codebase

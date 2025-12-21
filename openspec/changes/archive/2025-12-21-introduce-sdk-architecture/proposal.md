# Change: Introduce 3-Layer SDK Architecture

## Why

The current `@hai3/uicore` package violates SOLID principles:
- **Single Responsibility**: Mixes state management, events, API, i18n, AND React rendering
- **Interface Segregation**: Users must import everything even if they need just one piece
- **Dependency Inversion**: React package depends on concrete uikit, not abstractions

Industry leaders (TanStack, shadcn/ui) solve this with:
- Flat, composable packages with zero inter-dependencies
- CLI-generated code that users own (not npm runtime dependencies)
- Framework-agnostic cores with thin adapters

## What Changes

### 3-Layer Architecture

```
LAYER 1: SDK (Flat NPM packages, ZERO @hai3 inter-dependencies)
┌──────────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
│      state       │  │ screensets │  │   api    │  │   i18n   │
│                  │  │            │  │          │  │          │
│ EventBus + Store │  │ Contracts  │  │ Axios    │  │ Zero     │
│ Redux internal   │  │ + Registry │  │ internal │  │ deps     │
└──────────────────┘  └────────────┘  └──────────┘  └──────────┘

LAYER 2: Framework (Headless, NO uikit-contracts)
┌─────────────────────────────────────────────────────────────────┐
│                       @hai3/framework                            │
│  • Wires SDK packages together                                  │
│  • Screenset pattern, registries, navigation                    │
│  • Effect system (event → action → state)                       │
│  • For users who want HAI3 patterns + OWN rendering             │
└─────────────────────────────────────────────────────────────────┘

LAYER 3: React Adapter (NO rendering components)
┌─────────────────────────────────────────────────────────────────┐
│                         @hai3/react                              │
│  • HAI3Provider, AppRouter                                      │
│  • React hooks (useAppSelector, useTranslation, etc.)           │
│  • Effect lifecycle wiring                                       │
│  • NO Layout components (those are CLI-generated)               │
└─────────────────────────────────────────────────────────────────┘

LAYER 4: CLI-Generated Layout (IN USER'S PROJECT, not npm)
┌─────────────────────────────────────────────────────────────────┐
│              hai3 scaffold layout [--ui-kit=custom]             │
│  • Layout.tsx, Header.tsx, Menu.tsx, Screen.tsx, etc.          │
│  • Default: @hai3/uikit | Available: custom | Future: shadcn   │
│  • User OWNS this code, can modify freely                       │
└─────────────────────────────────────────────────────────────────┘
```

### Package Breakdown

**Layer 1: SDK (Flat, zero @hai3 inter-dependencies, zero runtime dependencies)**

| Package | Responsibility | External Deps | @hai3 Deps |
|---------|---------------|---------------|------------|
| `@hai3/state` | Event bus, store, createSlice | redux-toolkit (peer) | **None** |
| `@hai3/screensets` | Screenset contracts + registry | **None** | **None** |
| `@hai3/api` | HTTP services, protocols | axios (peer) | **None** |
| `@hai3/i18n` | Translation system | **None** | **None** |

> **Note on @hai3/state:** Originally planned as 2 separate packages (`@hai3/events`, `@hai3/store`), consolidated because:
> - Events and store are tightly coupled in the Flux pattern
> - The complete dataflow pattern (EventBus → Effects → Store) is the atomic unit of value
> - Following industry naming conventions (Zustand, Jotai = "state" in German/Japanese)

> **Note on @hai3/screensets (formerly @hai3/layout):** Renamed because:
> - The package is 90% about screenset contracts, not layout state
> - Screensets are HAI3's first-class citizen (vertical slices)
> - Layout state shapes moved to @hai3/framework (where state is managed)
> - The package contains: ScreensetDefinition, ScreensetCategory, LayoutDomain enum, MenuItemConfig, ScreensetRegistry implementation
> - The package does NOT contain: HeaderState, MenuState, Redux slices (those are framework concerns)

**Layer 2: Framework**

| Package | Responsibility | Dependencies |
|---------|---------------|--------------|
| `@hai3/framework` | Wires SDK, layout state, registries, plugins | All SDK packages |

> **@hai3/framework owns:**
> - Layout domain state shapes (HeaderState, MenuState, SidebarState, ScreenState, PopupState, OverlayState)
> - Layout domain Redux slices (header, footer, menu, sidebar, screen, popup, overlay)
> - ThemeRegistry, RouteRegistry implementations
> - i18n wiring (registers translations when screensets register)
> - Plugin system for composable features
>
> **State access:** Components access state via hooks from @hai3/react (e.g., `useAppSelector`). The term "selector" is avoided as it's Redux-specific terminology. @hai3/state provides the store, effects dispatch to slice reducers.

**Layer 3: React Adapter**

| Package | Responsibility | Dependencies |
|---------|---------------|--------------|
| `@hai3/react` | Hooks, Provider, Router | `@hai3/framework`, react |

**Layer 4: CLI Templates**

| Command | Output | Uses |
|---------|--------|------|
| `hai3 scaffold layout` | `src/layout/*.tsx` | User's UI kit |
| `hai3 scaffold screenset` | `src/screensets/<name>/*` | Layout domains |

### Key Architectural Decisions

1. **SDK packages are 100% flat** - No @hai3 package depends on another @hai3 package at SDK layer
2. **No uikit-contracts** - Layout rendering uses user's UI kit directly, no abstraction layer
3. **CLI generates layout** - Following shadcn/ui model, user owns rendering code
4. **Types-first design** - All interfaces defined before implementation
5. **TDD approach** - ESLint rules, dependency-cruiser updated BEFORE implementation
6. **Plugin architecture** - Framework uses composable plugins for maximum flexibility
7. **Application logic in templates, not framework** - Business-specific functionality belongs in CLI templates

### User Info / Header User Architecture (Architectural Clarification)

**Principle:** The framework provides the **state contract and reducers**, but **application-specific logic** (like fetching current user) belongs in CLI-generated templates, not the framework.

**What belongs in `@hai3/framework`:**
- `HeaderState` interface with `user: HeaderUser | null` and `loading: boolean` fields
- `HeaderUser` type definition (`displayName`, `email`, `avatarUrl`)
- Header slice reducers: `setUser`, `setLoading`, `clearUser`
- The slice is part of the `layout()` plugin

**What belongs in CLI templates (`src/layout/` via `hai3 scaffold layout`):**
- `AccountsApiService` class (or equivalent user fetching service)
- User fetching logic in `Layout.tsx` `useEffect`
- Conversion function (`toHeaderUser`) from API response to `HeaderUser`
- Registration of `AccountsApiService` with `apiRegistry` in `main.tsx`

**Why this separation:**
1. **Framework is generic** - Not all applications have "accounts" or "users"
2. **API shapes vary** - Different backends have different user endpoint responses
3. **User owns the logic** - Can customize fetching, caching, error handling
4. **Optional feature** - Applications without users skip this entirely
5. **SOLID compliance** - Framework provides extension points, templates provide implementation

**Template behavior:**
- CLI templates include `AccountsApiService` as example/starter code
- `Layout.tsx` checks if accounts service is registered before fetching
- If no accounts service registered, user fetching is gracefully skipped

**State access pattern:**
```typescript
// In Header.tsx (CLI-generated template)
import { useAppSelector } from '@hai3/react';
import type { RootStateWithLayout } from '@hai3/framework';

const { user, loading } = useAppSelector((state: RootStateWithLayout) => state.layout.header);
```

### Plugin Architecture (Framework Layer)

The `@hai3/framework` package uses a **plugin-based architecture** inspired by [TanStack](https://tanstack.com/), [NestJS](https://docs.nestjs.com/modules), and [AWS SDK v3](https://aws.amazon.com/blogs/developer/modular-packages-in-aws-sdk-for-javascript/).

**Why?** External companies may want to integrate HAI3 screensets into their existing platforms without adopting HAI3's full layout system (header, menu, footer). Plugin architecture allows them to use only what they need.

```
@hai3/framework
├── createHAI3()              ← Minimal core with plugin system
├── plugins/
│   ├── screensets()          ← Uses @hai3/screensets registry + wires i18n
│   ├── themes()              ← Theme registry + changeTheme
│   ├── layout()              ← Layout domain slices (header, menu, footer, etc.)
│   ├── routing()             ← Route registry + URL sync
│   ├── effects()             ← Core effect coordination system
│   ├── navigation()          ← Navigation actions (navigateToScreen, etc.)
│   └── i18n()                ← i18nRegistry + setLanguage
├── presets/
│   ├── full()                ← All 7 plugins (default for hai3 create)
│   ├── minimal()             ← screensets + themes only
│   └── headless()            ← screensets only (external integration)
```

**Usage Examples:**

```typescript
// Full HAI3 experience (default)
import { createHAI3App } from '@hai3/framework';
const app = createHAI3App();

// External platform - screensets only
import { createHAI3, screensets } from '@hai3/framework';
const app = createHAI3()
  .use(screensets())
  .build();

// Custom composition
import { createHAI3, screensets, themes, i18n } from '@hai3/framework';
const app = createHAI3()
  .use(screensets())
  .use(themes())
  .use(i18n())
  // NO layout() - they have their own
  .build();
```

**Benefits:**
- **SOLID-compliant** - Each plugin has single responsibility, open for extension
- **Tree-shakeable** - Unused plugins not bundled
- **External integration** - Companies can embed HAI3 screens in their existing platforms
- **Flexible composition** - Mix and match features as needed

### What Happens to Existing Packages

| Current | Fate |
|---------|------|
| `@hai3/uicore` | **DELETED** - Package removed entirely. Migrate to @hai3/framework + @hai3/react. |
| `@hai3/uikit` | **KEPT AS PACKAGE** - Default UI kit, maintained by UX designers, NOT part of SDK layers |
| `@hai3/uikit-contracts` | **DELETED** - Package removed entirely. Types moved to @hai3/uikit. |
| `@hai3/studio` | **UNCHANGED** - Dev overlay, optional |
| `@hai3/cli` | **ENHANCED** - New scaffold commands |

> **CRITICAL: Package Removal**
> - `@hai3/uicore` and `@hai3/uikit-contracts` directories will be physically deleted
> - All functionality migrated to SDK packages:
>   - EventBus, Store → `@hai3/state`
>   - Slices, registries, plugins → `@hai3/framework`
>   - Hooks, Provider, components → `@hai3/react`
>   - UI component types → `@hai3/uikit` (no contracts package needed)
> - AI guidelines (.ai/targets/UICORE.md, UIKIT_CONTRACTS.md) removed
> - Dependency cruiser rules for these packages removed

### Why @hai3/uikit Stays as npm Package (Not CLI Template)

Unlike shadcn/ui's approach where components are copied into user's codebase, @hai3/uikit remains a **standalone npm package** for important reasons:

1. **AI Agent Boundary**: Prevents AI agents from modifying UI kit components during screenset implementation. AI works on business logic (screensets), UX designers maintain the UI kit.

2. **UX Designer Ownership**: The UI kit is maintained by the UX design team, not developers or AI agents. Clear separation of concerns.

3. **Consistent Updates**: Bug fixes and improvements are delivered via npm updates, ensuring all projects benefit.

4. **Flexibility for Companies**: Organizations can:
   - Use @hai3/uikit as-is (default)
   - Fork @hai3/uikit and customize (enterprise approach)
   - Use `--ui-kit=custom` for no bundled UI kit (available now)
   - Use shadcn/ui or MUI via `--ui-kit` option (future)

### UI Kit Options

| UI Kit | Status | Description |
|--------|--------|-------------|
| `@hai3/uikit` | **Default** | HAI3's UI kit, npm package, maintained by UX designers |
| `custom` | **Available** | No bundled UI kit, user provides own components |
| `shadcn` | **Future** | Door open for CLI-generated shadcn/ui components |
| `mui` | **Future** | Door open for Material UI |

```bash
hai3 create my-app                    # Uses @hai3/uikit (default)
hai3 create my-app --ui-kit=custom    # No bundled UI kit
hai3 scaffold layout                  # Generates layout using @hai3/uikit
hai3 scaffold layout --ui-kit=custom  # Generates layout without @hai3/uikit imports
```

## Open Issues (Require Resolution)

### Issue 1: createAction in Framework is a Flux Violation

**Status:** MUST FIX

The current implementation has `createAction` as an "internal framework helper" in `packages/framework/src/actions/createAction.ts`. This is a **flux architecture violation**.

**Problem:** Even internal use of `createAction` violates the principle that actions are handwritten functions containing business logic. The factory pattern hides the event emission, breaking the explicit data flow.

**Current (Wrong):**
```typescript
// packages/framework/src/plugins/themes.ts
import { createAction } from '../actions';
const changeTheme = createAction<'theme/changed'>('theme/changed');
```

**Correct:**
```typescript
// packages/framework/src/plugins/themes.ts
import { eventBus } from '@hai3/state';
export function changeTheme(payload: { themeId: string }): void {
  eventBus.emit('theme/changed', payload);
}
```

**Action Required:**
1. Delete `packages/framework/src/actions/createAction.ts`
2. Rewrite all framework plugins (themes, layout, navigation, i18n) to use `eventBus.emit()` directly
3. Update all references in tasks.md that mention "keep createAction as internal helper"

### Issue 2: ESLint/Depcruise Decomposition Misunderstanding

**Status:** NEEDS RE-ASSESSMENT

The current implementation created per-package ESLint/depcruise configs in each SDK package:
- `packages/state/eslint.config.js` extending `sdk.js`
- `packages/screensets/eslint.config.js` extending `sdk.js`
- etc.

**Problem:** This conflates two different purposes:

| Purpose | Scope | Where It Should Live |
|---------|-------|---------------------|
| Protect SDK source code | Monorepo only | `presets/monorepo/` (NOT shipped to users) |
| Protect SDK users' code | User projects | Shipped with CLI templates |

**Monorepo-level rules (for SDK source code):**
- `no-explicit-any` in SDK packages
- SDK packages cannot import @hai3/* packages
- SDK packages cannot import React

**User-level rules (shipped to protect user code):**
- Actions can only emit events (no getState, no async)
- Effects cannot emit events
- Components cannot dispatch directly
- Cross-screenset import prohibition

**Action Required:**
1. Research: Which rules are for SDK source vs SDK users?
2. Keep monorepo-level rules in `presets/monorepo/` (single config)
3. Remove per-package `eslint.config.js` files from SDK packages
4. User-level rules stay in `presets/standalone/` (shipped via CLI)
5. Update Phase 1 in tasks.md with corrected approach

### Issue 3: Static AI Commands for Plugin-Based Framework

**Status:** ARCHITECTURAL GAP

If the framework is plugin-based (users pick which plugins to use), why are AI commands/guidelines static?

**Problem:** Current approach:
- User installs `@hai3/framework` and composes: `createHAI3().use(screensets()).use(themes()).build()`
- But AI commands in `.ai/commands/` are static and include ALL plugins
- User who doesn't use `layout()` plugin still gets layout-related guidelines

**Possible Solutions:**

1. **Plugin-contributed guidelines**: Each plugin contributes its own section to CLAUDE.md
   ```typescript
   const themes = (): HAI3Plugin => ({
     name: 'themes',
     guidelines: `## Themes\nUse changeTheme() action...`,
   });
   ```

2. **Dynamic command generation**: `hai3 ai sync` detects installed plugins and generates only relevant commands

3. **Modular GUIDELINES.md**: Break into plugin-specific sections that are conditionally included

**Action Required:**
1. Decide which solution fits the plugin architecture best
2. Update proposal with chosen approach
3. Add tasks for implementation

### Issue 4: Hide Redux Internals, Provide Clean HAI3 API

**Status:** ✅ RESOLVED

The `@hai3/state` package provides a clean API that completely hides Redux internals. The word "action" is reserved exclusively for HAI3 Actions (event emitters).

**Principle:** Redux is an internal implementation detail. Users never see `.actions`, `PayloadAction`, or other Redux terminology.

**HAI3 Terminology:**
- **Action**: Function that emits events via `eventBus.emit()` (e.g., `selectThread()`)
- **Reducer**: Pure function in a slice that updates state
- **ReducerPayload<T>**: Type for reducer parameters (HAI3 alias for RTK's PayloadAction)

**HAI3 createSlice Wrapper:**

HAI3 provides a `createSlice` wrapper that returns `{ slice, ...reducerFunctions }` instead of RTK's object with `.actions`:

```typescript
import { createSlice, registerSlice, type ReducerPayload } from '@hai3/state';

// createSlice returns { slice, setMenuCollapsed, setMenuItems }
// NO .actions property - Redux is hidden
const { slice, setMenuCollapsed, setMenuItems } = createSlice({
  name: 'uicore/menu',
  initialState: { collapsed: false, items: [] },
  reducers: {
    setMenuCollapsed: (state, payload: ReducerPayload<boolean>) => {
      state.collapsed = payload.payload;
    },
    setMenuItems: (state, payload: ReducerPayload<MenuItem[]>) => {
      state.items = payload.payload;
    },
  },
});

// Register slice with effects
registerSlice(slice, initMenuEffects);

// Export reducer functions for effects
export { setMenuCollapsed, setMenuItems };
```

**Effects dispatch to reducers:**
```typescript
import { eventBus, type AppDispatch } from '@hai3/state';
import { setMenuItems } from './menuSlice';

export function initMenuEffects(dispatch: AppDispatch): void {
  eventBus.on(MenuEvents.ItemsChanged, ({ items }) => {
    dispatch(setMenuItems(items));
  });
}
```

**Minimal Public API:**

| Export | Purpose |
|--------|---------|
| `eventBus` | Singleton EventBus instance |
| `createSlice` | HAI3 wrapper that returns `{ slice, ...reducerFunctions }` |
| `createStore`, `getStore` | Store management |
| `registerSlice`, `unregisterSlice`, `hasSlice`, `getRegisteredSlices` | Slice registration |
| `resetStore` | Testing utility |
| `ReducerPayload<T>` | Type for reducer parameters |
| `EventPayloadMap`, `RootState` | Module augmentation interfaces |
| `AppDispatch`, `EffectInitializer` | Types for effects |
| `HAI3Store`, `SliceObject`, `EventBus`, `Subscription` | Core types |

**NOT Exported (Hidden Redux internals):**

| Hidden | Reason |
|--------|--------|
| `.actions` property | RTK's actions hidden by wrapper |
| `combineReducers` | Internal store implementation |
| `Reducer` type | Internal type |
| `ThunkDispatch` | Not used in HAI3 pattern |
| Redux selector utilities | State access via @hai3/react hooks (useAppSelector) |

> **Note on "Selectors":** The term "selector" is Redux-specific terminology. HAI3 avoids this term. Components access state via `useAppSelector` hook from @hai3/react, which uses the store from @hai3/state internally.

**Headless / Framework-Agnostic:**

`@hai3/state` MUST work without React:
- NO React imports
- NO React hooks
- Works in Node.js
- React bindings are in `@hai3/react` package

### Issue 5: URL Routing Should Use Screen ID Only, Not Screenset ID

**Status:** MUST FIX

The current navigation plugin incorrectly includes the screenset ID in URLs. Before the SDK migration, routes only contained the screen ID.

**Current (Wrong):**
```
URL: /demo/helloworld
URL: /chat/chat
URL: /machine-monitoring/machines-list
```

**Correct (Pre-migration behavior):**
```
URL: /helloworld
URL: /chat
URL: /machines-list
```

**Problem:** The SDK migration changed the URL format from `/{screenId}` to `/{screensetId}/{screenId}`. This is a regression that breaks existing bookmarks and the URL design principle that screen IDs are globally unique.

**Why Screen-Only URLs:**
1. **Global uniqueness**: Screen IDs are globally unique across all screensets (enforced by route registry)
2. **Cleaner URLs**: Shorter, more user-friendly URLs
3. **Backward compatibility**: Existing bookmarks and links continue to work
4. **Screenset context**: The active screenset is derived from the screen, not from the URL

**How It Works:**
- Route registry maps `screenId → screensetId` (lookup)
- Navigation to `/helloworld` finds which screenset owns it
- Screen state + menu state updated accordingly
- URL never contains screenset ID

**Action Required:**
1. Update `packages/framework/src/plugins/navigation.ts`:
   - Change URL format from `/${screensetId}/${screenId}` to `/${screenId}`
   - Add reverse lookup: given screenId, find screensetId
   - Update popstate handler to use single-segment paths
2. Update `packages/framework/src/registries/routeRegistry.ts`:
   - Add `getScreensetForScreen(screenId)` method
   - Ensure screen ID uniqueness validation
3. Update all navigation-related types and actions
4. Fix any broken tests

### Issue 6: Chat Screenset Duplicate Rendering Bug

**Status:** FIXED

During SDK migration, the Chat screenset developed a bug where user actions trigger duplicate state updates.

**Symptoms:**
- Sending a message renders 3 times
- Creating a new thread adds 3 entries
- Deleting a thread removes multiple times

**Root Cause Analysis:**

The bug is caused by effect initializers being called multiple times without proper cleanup:

1. **`registerSlice` lacks cleanup tracking**: When `registerSlice` is called multiple times (e.g., during HMR or re-renders), effects are re-initialized without cleaning up previous subscriptions.

2. **Effect initializers don't return cleanup functions**: Current pattern only initializes, doesn't provide cleanup:
   ```typescript
   // Current (buggy) pattern:
   export function initThreadsEffects(dispatch: AppDispatch): void {
     eventBus.on('chat/threads/selected', ...);  // Creates subscription
     // No cleanup returned - subscription persists!
   }
   ```

3. **EventBus subscriptions accumulate**: Each re-initialization adds new subscriptions, causing the same event to trigger multiple handlers.

**Required Fix:**

1. **Effect initializers MUST return cleanup functions:**
   ```typescript
   export function initThreadsEffects(dispatch: AppDispatch): () => void {
     const sub1 = eventBus.on('chat/threads/selected', ...);
     const sub2 = eventBus.on('chat/threads/created', ...);

     // Return cleanup function
     return () => {
       sub1.unsubscribe();
       sub2.unsubscribe();
     };
   }
   ```

2. **`registerSlice` MUST cleanup before re-initializing:**
   ```typescript
   export function registerSlice(slice, initEffects) {
     // Cleanup previous effects if any
     const previousCleanup = effectCleanups.get(slice.name);
     if (previousCleanup) {
       previousCleanup();
     }

     // ... register slice ...

     if (initEffects) {
       const cleanup = initEffects(dispatch);
       if (cleanup) {
         effectCleanups.set(slice.name, cleanup);
       }
     }
   }
   ```

3. **Update type: `EffectInitializer` should return optional cleanup:**
   ```typescript
   export type EffectInitializer = (dispatch: AppDispatch) => void | (() => void);
   ```

**Verification:**
- Manual testing: send message → appears exactly once
- Manual testing: create thread → appears exactly once
- Hot reload test: no duplicate handlers after code change

---

## Impact

- **Affected specs**: None (new capability, deprecates old)
- **Affected code**:
  - `packages/uicore/` → Split into 7 new packages
  - `packages/uikit-contracts/` → Removed
  - `packages/uikit/` → Unchanged (standalone, CLI default)
  - `packages/cli/` → New scaffold commands, AI sync
  - `.ai/` → All guidelines updated, hai3dev-* vs hai3-* separation
- **Breaking changes**: None for existing apps (uicore re-exports maintained)
- **New packages**: state, screensets, api, i18n, framework, react (6 public packages)
- **Internal packages**: @hai3/eslint-config, @hai3/depcruise-config (private, not published)
- **SOLID compliance**: Full alignment with all 5 principles

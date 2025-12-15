# @hai3/framework

Plugin-based application framework for HAI3 applications. Orchestrates SDK packages into cohesive applications.

## Framework Layer

This package is part of the **Framework Layer (L2)** - it depends on all SDK packages (@hai3/events, @hai3/store, @hai3/layout, @hai3/api, @hai3/i18n) and provides the plugin architecture.

## Core Concepts

### Plugin Architecture

Build applications by composing plugins:

```typescript
import { createHAI3, screensets, themes, layout, navigation, i18n } from '@hai3/framework';

const app = createHAI3()
  .use(screensets())
  .use(themes())
  .use(layout())
  .use(navigation())
  .use(i18n())
  .build();
```

### Presets

Pre-configured plugin combinations:

```typescript
import { createHAI3App, presets } from '@hai3/framework';

// Full preset (default) - all plugins
const fullApp = createHAI3App();

// Or explicitly use presets
const minimalApp = createHAI3()
  .use(presets.minimal())  // screensets + themes only
  .build();

const headlessApp = createHAI3()
  .use(presets.headless()) // screensets only
  .build();
```

### Available Plugins

| Plugin | Provides | Dependencies |
|--------|----------|--------------|
| `screensets()` | screensetRegistry, screenSlice | - |
| `themes()` | themeRegistry, changeTheme action | - |
| `layout()` | header, footer, menu, sidebar, popup, overlay slices | screensets |
| `navigation()` | navigateToScreen, navigateToScreenset actions | screensets, routing |
| `routing()` | routeRegistry, URL sync | screensets |
| `i18n()` | i18nRegistry, setLanguage action | - |
| `effects()` | Core effect coordination | - |

### Built Application

After calling `.build()`, access registries and actions:

```typescript
const app = createHAI3App();

// Access registries
app.screensetRegistry.getAll();
app.themeRegistry.getCurrent();
app.routeRegistry.hasScreen('demo', 'home');
app.i18nRegistry.t('common:title');

// Access store
const state = app.store.getState();
app.store.dispatch(someAction);

// Access actions
app.actions.navigateToScreen({ screensetId: 'demo', screenId: 'home' });
app.actions.changeTheme({ themeId: 'dark' });
app.actions.setLanguage({ language: 'es' });

// Cleanup
app.destroy();
```

## Creating Custom Plugins

Extend HAI3 with custom functionality:

```typescript
import type { HAI3Plugin } from '@hai3/framework';

export function myPlugin(): HAI3Plugin {
  return {
    name: 'my-plugin',
    dependencies: ['screensets'], // Optional dependencies
    provides: {
      registries: { myRegistry: createMyRegistry() },
      slices: [mySlice],
      effects: [initMyEffects],
      actions: { myAction: createAction('my-plugin/action', handler) },
    },
    onInit(app) {
      // Initialize after app is built
    },
    onDestroy(app) {
      // Cleanup when app is destroyed
    },
  };
}
```

## Key Rules

1. **Use presets for common cases** - `createHAI3App()` for full apps
2. **Compose plugins for customization** - Use `createHAI3().use()` pattern
3. **Dependencies are auto-resolved** - Plugin order doesn't matter
4. **Access via app instance** - All registries and actions on `app.*`
5. **NO React in this package** - Framework is headless, use @hai3/react for React bindings

## Re-exports

For convenience, this package re-exports from SDK packages:

- From @hai3/events: `eventBus`, `createAction`
- From @hai3/store: `createStore`, `getStore`, `registerSlice`, `hasSlice`, `createSlice`
- From @hai3/layout: All domain slices, actions, and selectors
- From @hai3/api: `apiRegistry`, `BaseApiService`, `RestProtocol`, `MockPlugin`
- From @hai3/i18n: `i18nRegistry`, `Language`, `SUPPORTED_LANGUAGES`, `getLanguageMetadata`

## Exports

### Core
- `createHAI3` - App builder factory
- `createHAI3App` - Convenience function (full preset)
- `presets` - Available presets (full, minimal, headless)

### Plugins
- `screensets`, `themes`, `layout`, `navigation`, `routing`, `i18n`, `effects`

### Registries
- `createScreensetRegistry`, `createThemeRegistry`, `createRouteRegistry`

### Types
- `HAI3Config`, `HAI3Plugin`, `HAI3App`, `HAI3AppBuilder`
- `PluginFactory`, `PluginProvides`, `PluginLifecycle`
- `Preset`, `Presets`, `ScreensetsConfig`
- All re-exported types from SDK packages

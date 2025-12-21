# @hai3/screensets

Pure TypeScript contracts and registry for HAI3 screenset management.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has **ZERO dependencies** and can be used independently. It contains only TypeScript types and a simple registry implementation.

## What This Package Contains

| Export | Description |
|--------|-------------|
| `screensetRegistry` | Singleton registry for screenset registration |
| `LayoutDomain` | Enum of layout domains (header, footer, menu, etc.) |
| `ScreensetCategory` | Enum for three-stage workflow (Drafts, Mockups, Production) |
| `ScreensetDefinition` | Complete screenset configuration type |
| `MenuItemConfig` | Menu item structure type |
| `ScreenLoader` | Lazy screen loader function type |

## What This Package Does NOT Contain

- **NO translation types** - Use `@hai3/i18n` for translation types
- **NO Redux slices** - Layout state management is in `@hai3/framework`
- **NO selectors** - State selectors are in `@hai3/framework`
- **NO dependencies** - Pure TypeScript, zero runtime dependencies

## Screenset Registry

The registry is a pure storage implementation (~20 lines, Map wrapper) with no side effects:

```typescript
import { screensetRegistry, ScreensetDefinition, ScreensetCategory } from '@hai3/screensets';

const myScreenset: ScreensetDefinition = {
  id: 'myApp',
  name: 'My Application',
  category: ScreensetCategory.Production,
  defaultScreen: 'home',
  menu: [
    { menuItem: { id: 'home', label: 'Home' }, screen: () => import('./HomeScreen') }
  ]
};

// Register
screensetRegistry.register(myScreenset);

// Query
screensetRegistry.get('myApp');      // ScreensetDefinition | undefined
screensetRegistry.getAll();          // ScreensetDefinition[]
screensetRegistry.has('myApp');      // boolean
```

## Translations

Screensets register translations directly with `i18nRegistry` from `@hai3/framework`:

```typescript
import { i18nRegistry, I18nRegistry, Language } from '@hai3/framework';
import { SCREENSET_ID } from './ids';

// Register translations (not on screenset config)
i18nRegistry.registerLoader(
  `screenset.${SCREENSET_ID}`,
  I18nRegistry.createLoader({
    [Language.English]: () => import('./i18n/en.json'),
    [Language.Spanish]: () => import('./i18n/es.json'),
    // ... all 36 languages
  })
);
```

## Layout Domains

HAI3 defines 7 layout domains that screensets can use:

| Domain | Description |
|--------|-------------|
| `header` | Top navigation bar |
| `footer` | Bottom bar |
| `menu` | Side navigation menu |
| `sidebar` | Collapsible side panel |
| `screen` | Main content area |
| `popup` | Modal dialogs |
| `overlay` | Full-screen overlays |

```typescript
import { LayoutDomain } from '@hai3/screensets';

// Use in screenset configuration
const visibleDomains = [LayoutDomain.Header, LayoutDomain.Menu, LayoutDomain.Screen];
```

## Screenset Definition

Complete definition of a screenset:

```typescript
import {
  ScreensetDefinition,
  ScreensetCategory,
  MenuScreenItem
} from '@hai3/screensets';

const demoScreenset: ScreensetDefinition = {
  id: 'demo',                          // Unique identifier
  name: 'Demo Screenset',              // Display name
  category: ScreensetCategory.Drafts,  // Workflow stage
  defaultScreen: 'home',               // Default screen to show
  menu: [                              // Menu items with screens
    { menuItem: homeMenuItem, screen: () => import('./HomeScreen') }
  ]
};
```

**Note:** Translations are registered separately via `i18nRegistry`, not on the screenset definition.

## Key Rules

1. **This package is contracts only** - No business logic, no state management
2. **ZERO dependencies** - Keep it pure TypeScript, no @hai3 inter-dependencies
3. **Registry is pure storage** - No side effects, just a Map wrapper
4. **Use for screenset definitions** - Import types to define your screensets
5. **Translations via i18n** - Screensets register translations directly with `i18nRegistry`
6. **Import layout state from @hai3/framework** - HeaderState, MenuState, selectors are there

## Package Relationship

```
@hai3/screensets (SDK L1)           @hai3/framework (L2)
├── Contracts (types)        ──>    ├── Re-exports contracts
├── screensetRegistry        ──>    ├── Re-exports registry
└── ZERO dependencies               ├── Layout state shapes
                                    ├── Layout slices
                                    └── i18nRegistry (from @hai3/i18n)
```

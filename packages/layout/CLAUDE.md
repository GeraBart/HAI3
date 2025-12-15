# @hai3/layout

Layout domain definitions and state management for HAI3 applications.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has zero @hai3 dependencies and can be used independently. It has `@reduxjs/toolkit` as a peer dependency.

## Layout Domains

HAI3 defines 7 layout domains:

| Domain | Description |
|--------|-------------|
| `header` | Top navigation bar |
| `footer` | Bottom bar |
| `menu` | Side navigation menu |
| `sidebar` | Collapsible side panel |
| `screen` | Main content area |
| `popup` | Modal dialogs |
| `overlay` | Full-screen overlays |

## Core Concepts

### Layout Reducer

Combine all domain reducers:

```typescript
import { layoutReducer, LAYOUT_SLICE_NAME } from '@hai3/layout';

// Use in store configuration
const store = configureStore({
  reducer: {
    [LAYOUT_SLICE_NAME]: layoutReducer,
    // other reducers...
  }
});
```

### Domain Slices

Each domain has its own slice with actions:

```typescript
import {
  headerActions,
  menuActions,
  popupActions,
  screenActions
} from '@hai3/layout';

// Header
dispatch(headerActions.setVisible(false));
dispatch(headerActions.setUser({ id: '1', name: 'John' }));

// Menu
dispatch(menuActions.setCollapsed(true));
dispatch(menuActions.setItems(menuItems));

// Popup
dispatch(popupActions.open({ id: 'confirm', title: 'Confirm' }));
dispatch(popupActions.close());

// Screen
dispatch(screenActions.navigateTo('dashboard'));
```

### Selectors

Type-safe selectors for all domains:

```typescript
import {
  selectHeaderVisible,
  selectMenuCollapsed,
  selectActiveScreen,
  selectHasPopup
} from '@hai3/layout';

// In components (with react-redux)
const isHeaderVisible = useSelector(selectHeaderVisible);
const isMenuCollapsed = useSelector(selectMenuCollapsed);
const currentScreen = useSelector(selectActiveScreen);
const hasOpenPopup = useSelector(selectHasPopup);
```

## Screenset Types

Define screenset configurations:

```typescript
import {
  ScreensetDefinition,
  ScreensetCategory,
  MenuItemConfig
} from '@hai3/layout';

const demoScreenset: ScreensetDefinition = {
  id: 'demo',
  name: 'Demo Screenset',
  category: ScreensetCategory.Drafts,
  defaultScreen: 'home',
  localization: loadTranslations,
  menu: [
    { menuItem: homeMenuItem, screen: () => import('./HomeScreen') }
  ]
};
```

## Type Safety via Module Augmentation

Extend `RootStateWithLayout` for type-safe selectors:

```typescript
import type { RootStateWithLayout } from '@hai3/layout';

// Your app's RootState should extend this
interface RootState extends RootStateWithLayout {
  // other slices...
}
```

## Key Types

- `LayoutDomain` - Enum of layout domains
- `ScreensetCategory` - Drafts, Mockups, Production
- `ScreensetDefinition` - Complete screenset config
- `MenuItemConfig` - Menu item structure
- `ScreenLoader` - Lazy screen loader function
- `PopupConfig` - Popup configuration
- `OverlayConfig` - Overlay configuration

## Key Rules

1. **Use selectors** - Don't access state directly
2. **Dispatch through actions** - Don't call slice reducers directly from components
3. **Follow naming conventions** - Screen IDs should be camelCase
4. **Lazy load screens** - Use `ScreenLoader` for code splitting

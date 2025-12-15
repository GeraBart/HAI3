# State Structure Migration Guide

## Overview

This document describes the state structure migration from the nested `state.uicore.*` pattern (current) to the flat domain-based pattern (new SDK architecture).

## Current State Structure (@hai3/uicore)

All core framework state is nested under the `uicore` key:

```typescript
// Current: Nested under uicore
RootState = {
  uicore: {
    app: AppState;          // User, language, loading
    layout: LayoutState;    // Theme, currentScreenset, selectedScreen
    header: HeaderState;    // Empty placeholder
    footer: FooterState;    // Screenset options, visible
    menu: MenuState;        // Collapsed, items, visible
    sidebar: SidebarState;  // Collapsed, position, title, content, visible
    screen: ScreenState;    // ActiveScreen, loading
    popup: PopupState;      // Stack of open popups
    overlay: OverlayState;  // Visible
  };
  // Dynamic screenset slices at root level
  'chat/threads': ChatThreadsState;
  'chat/messages': ChatMessagesState;
}
```

### Current Access Patterns

```typescript
// Selectors use nested uicore path
const user = state.uicore.app.user;
const theme = state.uicore.layout.theme;
const menuCollapsed = state.uicore.menu.collapsed;
const currentScreenset = state.uicore.layout.currentScreenset;
const selectedScreen = state.uicore.layout.selectedScreen;
const popupStack = state.uicore.popup.stack;
```

## New State Structure (@hai3/layout + @hai3/framework)

The new architecture uses flat, domain-based keys:

```typescript
// New: Flat domain-based keys
RootState = {
  // @hai3/layout domain slices (from layout() plugin)
  'layout/header': HeaderState;
  'layout/footer': FooterState;
  'layout/menu': MenuState;
  'layout/sidebar': SidebarState;
  'layout/screen': ScreenState;
  'layout/popup': PopupState;
  'layout/overlay': OverlayState;

  // @hai3/framework app slice (from screensets() plugin)
  'app': AppState;  // Or 'framework/app'

  // Dynamic screenset slices (unchanged)
  'chat/threads': ChatThreadsState;
  'chat/messages': ChatMessagesState;
}
```

### New Access Patterns

```typescript
// Using exported selectors from @hai3/layout
import {
  selectHeaderState,
  selectMenuState,
  selectScreenState,
  selectPopupStack
} from '@hai3/layout';

// Or direct access with flat keys
const menuState = state['layout/menu'];
const screenState = state['layout/screen'];
```

## Migration Mapping

| Current Path | New Path | Package |
|-------------|----------|---------|
| `state.uicore.app` | `state.app` | @hai3/framework |
| `state.uicore.layout` | Split into domains | @hai3/framework |
| `state.uicore.layout.theme` | Managed by themes plugin | @hai3/framework |
| `state.uicore.layout.currentScreenset` | `state.app.currentScreenset` | @hai3/framework |
| `state.uicore.layout.selectedScreen` | `state['layout/screen'].activeScreen` | @hai3/layout |
| `state.uicore.header` | `state['layout/header']` | @hai3/layout |
| `state.uicore.footer` | `state['layout/footer']` | @hai3/layout |
| `state.uicore.menu` | `state['layout/menu']` | @hai3/layout |
| `state.uicore.sidebar` | `state['layout/sidebar']` | @hai3/layout |
| `state.uicore.screen` | `state['layout/screen']` | @hai3/layout |
| `state.uicore.popup` | `state['layout/popup']` | @hai3/layout |
| `state.uicore.overlay` | `state['layout/overlay']` | @hai3/layout |

## Slice Name Changes

| Current Slice Name | New Slice Name |
|-------------------|----------------|
| `uicore/app` | `app` |
| `uicore/layout` | Removed (split into domains) |
| `uicore/header` | `layout/header` |
| `uicore/footer` | `layout/footer` |
| `uicore/menu` | `layout/menu` |
| `uicore/sidebar` | `layout/sidebar` |
| `uicore/screen` | `layout/screen` |
| `uicore/popup` | `layout/popup` |
| `uicore/overlay` | `layout/overlay` |

## Backward Compatibility Strategy

### 1. Legacy Selectors

The deprecated `@hai3/uicore` package will provide legacy selectors that map old paths to new:

```typescript
// @hai3/uicore (deprecated) - provides backward compat selectors
export const selectUicoreApp = (state: RootState) => {
  console.warn('[DEPRECATED] selectUicoreApp: Use selectors from @hai3/framework instead');
  return state.app;
};

export const selectUicoreMenu = (state: RootState) => {
  console.warn('[DEPRECATED] selectUicoreMenu: Use selectMenuState from @hai3/layout');
  return state['layout/menu'];
};
```

### 2. createLegacySelector Helper

For apps with many selectors, a helper function maps old paths:

```typescript
import { createLegacySelector } from '@hai3/uicore';

// Wraps existing selectors with deprecation warnings
const legacyMenuSelector = createLegacySelector(
  (state) => state.uicore.menu.collapsed,
  (state) => state['layout/menu'].collapsed,
  'Use selectMenuCollapsed from @hai3/layout'
);
```

### 3. State Shape Shim (Development Only)

In development mode, `@hai3/uicore` can expose a proxy that intercepts `state.uicore.*` access:

```typescript
// Development only - logs deprecation warnings
if (process.env.NODE_ENV === 'development') {
  const handler = {
    get(target, prop) {
      if (prop === 'uicore') {
        console.warn('[DEPRECATED] state.uicore.* access pattern. Migrate to flat keys.');
        // Return shimmed object that maps to new paths
        return createUicoreShim(target);
      }
      return target[prop];
    }
  };
}
```

## Migration Steps for Existing Apps

### Step 1: Update Dependencies

```bash
# Update to latest packages
npm update @hai3/uicore @hai3/cli

# Or install new packages directly
npm install @hai3/framework @hai3/react @hai3/layout
```

### Step 2: Run AI Sync

```bash
# Updates AI configuration files
npx hai3 ai sync
```

### Step 3: Update Imports (Gradual)

```typescript
// Before (deprecated)
import { useAppSelector, useAppDispatch } from '@hai3/uicore';
const menuCollapsed = useAppSelector(state => state.uicore.menu.collapsed);

// After (recommended)
import { useAppSelector, useAppDispatch } from '@hai3/react';
import { selectMenuCollapsed } from '@hai3/layout';
const menuCollapsed = useAppSelector(selectMenuCollapsed);
```

### Step 4: Update Direct State Access

```typescript
// Before
const theme = state.uicore.layout.theme;
const selectedScreen = state.uicore.layout.selectedScreen;

// After
const theme = state.app.theme;  // Or use themeRegistry
const selectedScreen = state['layout/screen'].activeScreen;
```

### Step 5: Address Deprecation Warnings

During development, watch for console warnings indicating deprecated access patterns. Update each instance to use the new path or selector.

## Selector Migration Reference

### Common Selectors

```typescript
// Language (AppState)
// Before: state.uicore.app.language
// After:  state.app.language
import { selectLanguage } from '@hai3/framework';

// Theme
// Before: state.uicore.layout.theme
// After:  state.app.theme (or use themeRegistry)
import { selectTheme } from '@hai3/framework';

// Current Screenset
// Before: state.uicore.layout.currentScreenset
// After:  state.app.currentScreenset
import { selectCurrentScreenset } from '@hai3/framework';

// Selected Screen
// Before: state.uicore.layout.selectedScreen
// After:  state['layout/screen'].activeScreen
import { selectActiveScreen } from '@hai3/layout';

// Menu State
// Before: state.uicore.menu
// After:  state['layout/menu']
import { selectMenuState, selectMenuCollapsed, selectMenuItems } from '@hai3/layout';

// Popup Stack
// Before: state.uicore.popup.stack
// After:  state['layout/popup'].stack
import { selectPopupStack } from '@hai3/layout';
```

## Timeline

1. **Now**: `@hai3/uicore` continues to work with nested structure
2. **v1.0**: New packages available, uicore re-exports with deprecation warnings
3. **v2.0**: `state.uicore.*` access removed, direct imports from new packages required

## FAQ

### Q: Will my existing app break?

No. The deprecated `@hai3/uicore` package maintains backward compatibility by:
1. Re-exporting from new packages
2. Providing legacy selectors with warnings
3. Maintaining the same public API

### Q: Do I need to migrate immediately?

No. You can continue using `@hai3/uicore` imports. However, you'll see deprecation warnings in development mode encouraging migration.

### Q: What about dynamic screenset slices?

Dynamic screenset slices (`chat/threads`, `chat/messages`, etc.) are **unchanged**. They already use the flat domain-based key pattern.

### Q: How do I silence deprecation warnings temporarily?

```typescript
// Not recommended, but available for gradual migration
import { silenceDeprecationWarnings } from '@hai3/uicore';
silenceDeprecationWarnings(); // Development only
```

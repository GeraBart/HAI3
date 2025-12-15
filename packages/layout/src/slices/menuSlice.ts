/**
 * Menu Slice - State management for menu domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuState, MenuItemConfig } from '../types';

/**
 * Initial menu state
 */
const initialState: MenuState = {
  collapsed: false,
  items: [],
  visible: true,
};

/**
 * Menu slice
 */
export const menuSlice = createSlice({
  name: 'layout/menu',
  initialState,
  reducers: {
    /**
     * Set menu collapsed state
     */
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    },

    /**
     * Toggle menu collapsed state
     */
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },

    /**
     * Set menu visibility
     */
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    /**
     * Set menu items
     */
    setItems(state, action: PayloadAction<MenuItemConfig[]>) {
      state.items = action.payload;
    },

    /**
     * Add menu item
     */
    addItem(state, action: PayloadAction<MenuItemConfig>) {
      state.items.push(action.payload);
    },

    /**
     * Remove menu item by ID
     */
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    /**
     * Update menu item badge
     */
    updateBadge(state, action: PayloadAction<{ id: string; badge?: string | number }>) {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.badge = action.payload.badge;
      }
    },

    /**
     * Reset menu state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const menuActions = menuSlice.actions;

// Export reducer
export default menuSlice.reducer;

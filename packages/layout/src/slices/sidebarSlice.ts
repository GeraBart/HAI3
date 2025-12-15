/**
 * Sidebar Slice - State management for sidebar domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SidebarState } from '../types';

/**
 * Default sidebar width in pixels
 */
const DEFAULT_SIDEBAR_WIDTH = 320;

/**
 * Initial sidebar state
 */
const initialState: SidebarState = {
  visible: false,
  collapsed: false,
  width: DEFAULT_SIDEBAR_WIDTH,
  config: {},
};

/**
 * Sidebar slice
 */
export const sidebarSlice = createSlice({
  name: 'layout/sidebar',
  initialState,
  reducers: {
    /**
     * Set sidebar visibility
     */
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    /**
     * Toggle sidebar visibility
     */
    toggleVisible(state) {
      state.visible = !state.visible;
    },

    /**
     * Set sidebar collapsed state
     */
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    },

    /**
     * Toggle sidebar collapsed state
     */
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },

    /**
     * Set sidebar width
     */
    setWidth(state, action: PayloadAction<number>) {
      state.width = action.payload;
    },

    /**
     * Update sidebar configuration
     */
    setConfig(state, action: PayloadAction<Record<string, unknown>>) {
      state.config = { ...state.config, ...action.payload };
    },

    /**
     * Reset sidebar state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const sidebarActions = sidebarSlice.actions;

// Export reducer
export default sidebarSlice.reducer;

/**
 * Overlay Slice - State management for overlay domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OverlayState, OverlayConfig } from '../types';

/**
 * Initial overlay state
 */
const initialState: OverlayState = {
  stack: [],
  active: null,
};

/**
 * Overlay slice
 */
export const overlaySlice = createSlice({
  name: 'layout/overlay',
  initialState,
  reducers: {
    /**
     * Show an overlay (push to stack)
     */
    show(state, action: PayloadAction<OverlayConfig>) {
      state.stack.push(action.payload);
      state.active = action.payload;
    },

    /**
     * Hide current overlay (pop from stack)
     */
    hide(state) {
      state.stack.pop();
      state.active = state.stack.length > 0
        ? state.stack[state.stack.length - 1]
        : null;
    },

    /**
     * Hide overlay by ID
     */
    hideById(state, action: PayloadAction<string>) {
      state.stack = state.stack.filter(o => o.id !== action.payload);
      state.active = state.stack.length > 0
        ? state.stack[state.stack.length - 1]
        : null;
    },

    /**
     * Hide all overlays
     */
    hideAll(state) {
      state.stack = [];
      state.active = null;
    },

    /**
     * Update overlay config
     */
    updateConfig(state, action: PayloadAction<{ id: string; config: Partial<OverlayConfig> }>) {
      const overlay = state.stack.find(o => o.id === action.payload.id);
      if (overlay) {
        Object.assign(overlay, action.payload.config);
        if (state.active?.id === action.payload.id) {
          state.active = overlay;
        }
      }
    },

    /**
     * Reset overlay state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const overlayActions = overlaySlice.actions;

// Export reducer
export default overlaySlice.reducer;

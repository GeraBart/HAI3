/**
 * Popup Slice - State management for popup domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PopupState, PopupConfig } from '../types';

/**
 * Initial popup state
 */
const initialState: PopupState = {
  stack: [],
  active: null,
};

/**
 * Popup slice
 */
export const popupSlice = createSlice({
  name: 'layout/popup',
  initialState,
  reducers: {
    /**
     * Open a popup (push to stack)
     */
    open(state, action: PayloadAction<PopupConfig>) {
      state.stack.push(action.payload);
      state.active = action.payload;
    },

    /**
     * Close current popup (pop from stack)
     */
    close(state) {
      state.stack.pop();
      state.active = state.stack.length > 0
        ? state.stack[state.stack.length - 1]
        : null;
    },

    /**
     * Close popup by ID
     */
    closeById(state, action: PayloadAction<string>) {
      state.stack = state.stack.filter(p => p.id !== action.payload);
      state.active = state.stack.length > 0
        ? state.stack[state.stack.length - 1]
        : null;
    },

    /**
     * Close all popups
     */
    closeAll(state) {
      state.stack = [];
      state.active = null;
    },

    /**
     * Update popup config
     */
    updateConfig(state, action: PayloadAction<{ id: string; config: Partial<PopupConfig> }>) {
      const popup = state.stack.find(p => p.id === action.payload.id);
      if (popup) {
        Object.assign(popup, action.payload.config);
        if (state.active?.id === action.payload.id) {
          state.active = popup;
        }
      }
    },

    /**
     * Reset popup state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const popupActions = popupSlice.actions;

// Export reducer
export default popupSlice.reducer;

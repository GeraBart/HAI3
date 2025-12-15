/**
 * Footer Slice - State management for footer domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FooterState, FooterConfig } from '../types';

/**
 * Initial footer state
 */
const initialState: FooterState = {
  visible: true,
  config: {},
};

/**
 * Footer slice
 */
export const footerSlice = createSlice({
  name: 'layout/footer',
  initialState,
  reducers: {
    /**
     * Set footer visibility
     */
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    /**
     * Update footer configuration
     */
    setConfig(state, action: PayloadAction<Partial<FooterConfig>>) {
      state.config = { ...state.config, ...action.payload };
    },

    /**
     * Reset footer state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const footerActions = footerSlice.actions;

// Export reducer
export default footerSlice.reducer;

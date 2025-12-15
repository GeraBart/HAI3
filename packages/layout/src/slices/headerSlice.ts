/**
 * Header Slice - State management for header domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HeaderState, HeaderConfig } from '../types';

/**
 * Initial header state
 */
const initialState: HeaderState = {
  visible: true,
  config: {
    showUserMenu: true,
  },
  user: undefined,
};

/**
 * Header slice
 */
export const headerSlice = createSlice({
  name: 'layout/header',
  initialState,
  reducers: {
    /**
     * Set header visibility
     */
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    /**
     * Update header configuration
     */
    setConfig(state, action: PayloadAction<Partial<HeaderConfig>>) {
      state.config = { ...state.config, ...action.payload };
    },

    /**
     * Set user info
     */
    setUser(
      state,
      action: PayloadAction<HeaderState['user'] | undefined>
    ) {
      state.user = action.payload;
    },

    /**
     * Reset header state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const headerActions = headerSlice.actions;

// Export reducer
export default headerSlice.reducer;

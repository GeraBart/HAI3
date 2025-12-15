/**
 * Screen Slice - State management for screen domain
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ScreenState } from '../types';

/**
 * Initial screen state
 */
const initialState: ScreenState = {
  activeScreen: null,
  loading: false,
};

/**
 * Screen slice
 */
export const screenSlice = createSlice({
  name: 'layout/screen',
  initialState,
  reducers: {
    /**
     * Set active screen
     */
    setActiveScreen(state, action: PayloadAction<string | null>) {
      state.activeScreen = action.payload;
    },

    /**
     * Set loading state
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    /**
     * Navigate to screen (sets screen + loading)
     */
    navigateTo(state, action: PayloadAction<string>) {
      state.activeScreen = action.payload;
      state.loading = true;
    },

    /**
     * Mark screen as loaded
     */
    screenLoaded(state) {
      state.loading = false;
    },

    /**
     * Reset screen state
     */
    reset() {
      return initialState;
    },
  },
});

// Export actions
export const screenActions = screenSlice.actions;

// Export reducer
export default screenSlice.reducer;

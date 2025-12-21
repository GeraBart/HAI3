import { createSlice, type ReducerPayload } from '@hai3/state';
import type { ScreenState } from '../layoutTypes';

/**
 * Screen slice for managing screen state
 */

const SLICE_KEY = 'layout/screen' as const;

const initialState: ScreenState = {
  activeScreen: null,
  loading: false,
};

const { slice, setActiveScreen, setScreenLoading, navigateTo, clearActiveScreen } = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    setActiveScreen: (state, action: ReducerPayload<string>) => {
      state.activeScreen = action.payload;
    },
    setScreenLoading: (state, action: ReducerPayload<boolean>) => {
      state.loading = action.payload;
    },
    navigateTo: (state, action: ReducerPayload<string>) => {
      state.activeScreen = action.payload;
    },
    clearActiveScreen: (state) => {
      state.activeScreen = null;
    },
  },
});

export const screenSlice = slice;
export { setActiveScreen, setScreenLoading, navigateTo, clearActiveScreen };
export const screenActions = { setActiveScreen, setScreenLoading, navigateTo, clearActiveScreen };

export default slice.reducer;

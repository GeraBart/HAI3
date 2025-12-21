import { createSlice, type ReducerPayload } from '@hai3/state';
import type { PopupState } from '../layoutTypes';

/**
 * Popup slice for managing popup state
 */

const SLICE_KEY = 'layout/popup' as const;

export interface PopupSliceState {
  stack: PopupState[];
}

const initialState: PopupSliceState = {
  stack: [],
};

const { slice, openPopup, closePopup, closeTopPopup, closeAllPopups } = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    openPopup: (state, action: ReducerPayload<Omit<PopupState, 'zIndex'>>) => {
      const zIndex = 1000 + state.stack.length * 10;
      state.stack.push({ ...action.payload, zIndex });
    },
    closePopup: (state, action: ReducerPayload<string>) => {
      state.stack = state.stack.filter((popup) => popup.id !== action.payload);
    },
    closeTopPopup: (state) => {
      state.stack.pop();
    },
    closeAllPopups: (state) => {
      state.stack = [];
    },
  },
});

export const popupSlice = slice;
export { openPopup, closePopup, closeTopPopup, closeAllPopups };
export const popupActions = { openPopup, closePopup, closeTopPopup, closeAllPopups };

export default slice.reducer;

/**
 * _blank Slice
 * Redux state management for this screenset
 * Following Flux: Effects dispatch these reducers after listening to events
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@hai3/react';
import { _BLANK_SCREENSET_ID } from '../ids';

const SLICE_KEY = `${_BLANK_SCREENSET_ID}/_blank` as const;

/**
 * State interface
 * Add your state properties here
 */
export interface _BlankState {
  /** Placeholder property - remove when adding real state */
  _placeholder?: never;
}

const initialState: _BlankState = {
  // Initialize your state here
};

export const _blankSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    // Add your reducers here
    // Example:
    // setData: (state, action: PayloadAction<Data>) => {
    //   state.data = action.payload;
    // },
  },
});

// Export actions
// export const { } = _blankSlice.actions;

// Export the slice object (not just the reducer) for registerSlice()
export default _blankSlice;

// Module augmentation - extends uicore RootState
declare module '@hai3/react' {
  interface RootState {
    [SLICE_KEY]: _BlankState;
  }
}

/**
 * Type-safe selector for this slice's state
 */
export const select_BlankState = (state: RootState): _BlankState => {
  return state[SLICE_KEY];
};

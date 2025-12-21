import { createSlice, type ReducerPayload } from '@hai3/state';
import type { MenuItem, MenuState } from '../layoutTypes';

/**
 * Menu slice for managing menu state and configuration
 * MenuItem type is defined in layoutTypes.ts
 */

const SLICE_KEY = 'layout/menu' as const;

const initialState: MenuState = {
  collapsed: false,
  items: [],
  visible: true,
};

const { slice, toggleMenu, setMenuCollapsed, setMenuItems, setMenuVisible, setMenuConfig } = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.collapsed = !state.collapsed;
    },
    setMenuCollapsed: (state, action: ReducerPayload<boolean>) => {
      state.collapsed = action.payload;
    },
    setMenuItems: (state, action: ReducerPayload<MenuItem[]>) => {
      state.items = action.payload;
    },
    setMenuVisible: (state, action: ReducerPayload<boolean>) => {
      state.visible = action.payload;
    },
    setMenuConfig: (state, action: ReducerPayload<Partial<MenuState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const menuSlice = slice;
export { toggleMenu, setMenuCollapsed, setMenuItems, setMenuVisible, setMenuConfig };
export const menuActions = { toggleMenu, setMenuCollapsed, setMenuItems, setMenuVisible, setMenuConfig };

export default slice.reducer;

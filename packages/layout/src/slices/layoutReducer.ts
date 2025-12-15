/**
 * Layout Reducer - Combined reducer for all layout domains
 *
 * SDK Layer: L1 (Only peer dependency on @reduxjs/toolkit)
 */

import { combineReducers, type Reducer } from '@reduxjs/toolkit';
import type {
  LayoutState,
  HeaderState,
  FooterState,
  MenuState,
  SidebarState,
  ScreenState,
  PopupState,
  OverlayState,
} from '../types';
import headerReducer from './headerSlice';
import footerReducer from './footerSlice';
import menuReducer from './menuSlice';
import sidebarReducer from './sidebarSlice';
import screenReducer from './screenSlice';
import popupReducer from './popupSlice';
import overlayReducer from './overlaySlice';

/**
 * Layout slice name constant
 */
export const LAYOUT_SLICE_NAME = 'layout' as const;

/**
 * Domain reducers map type
 */
export interface LayoutDomainReducers {
  readonly header: Reducer<HeaderState>;
  readonly footer: Reducer<FooterState>;
  readonly menu: Reducer<MenuState>;
  readonly sidebar: Reducer<SidebarState>;
  readonly screen: Reducer<ScreenState>;
  readonly popup: Reducer<PopupState>;
  readonly overlay: Reducer<OverlayState>;
}

/**
 * Get individual domain reducers for flexible integration
 */
export const layoutDomainReducers: LayoutDomainReducers = {
  header: headerReducer,
  footer: footerReducer,
  menu: menuReducer,
  sidebar: sidebarReducer,
  screen: screenReducer,
  popup: popupReducer,
  overlay: overlayReducer,
};

/**
 * Combined layout reducer
 * Combines all layout domain reducers into a single reducer.
 */
export const layoutReducer: Reducer<LayoutState> = combineReducers(layoutDomainReducers);

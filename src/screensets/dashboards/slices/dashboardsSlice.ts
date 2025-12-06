/**
 * dashboards Slice
 * Redux state management for this screenset
 * Following Flux: Effects dispatch these reducers after listening to events
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@hai3/uicore';
import { DASHBOARDS_SCREENSET_ID } from '../ids';

const SLICE_KEY = `${DASHBOARDS_SCREENSET_ID}/dashboards` as const;

/**
 * Chart IDs for drag-drop ordering
 */
export const CHART_IDS = {
  STATS: 'stats',
  REVENUE: 'revenue',
  TRAFFIC: 'traffic',
  DEVICES: 'devices',
  ACTIVITY: 'activity',
} as const;

export type ChartId = (typeof CHART_IDS)[keyof typeof CHART_IDS];

/**
 * State interface
 */
export interface DashboardsState {
  chartOrder: ChartId[];
}

const initialState: DashboardsState = {
  chartOrder: [
    CHART_IDS.STATS,
    CHART_IDS.REVENUE,
    CHART_IDS.TRAFFIC,
    CHART_IDS.DEVICES,
    CHART_IDS.ACTIVITY,
  ],
};

export const dashboardsSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    setChartOrder: (state, action: PayloadAction<ChartId[]>) => {
      state.chartOrder = action.payload;
    },
  },
});

// Export actions
export const { setChartOrder } = dashboardsSlice.actions;

// Export the slice object (not just the reducer) for registerSlice()
export default dashboardsSlice;

// Module augmentation - extends uicore RootState
declare module '@hai3/uicore' {
  interface RootState {
    [SLICE_KEY]: DashboardsState;
  }
}

/**
 * Type-safe selectors
 */
export const selectDashboardsState = (state: RootState): DashboardsState => {
  return state[SLICE_KEY];
};

export const selectChartOrder = (state: RootState): ChartId[] => {
  return state[SLICE_KEY].chartOrder;
};

/**
 * dashboards Effects
 * Listen to events and update slice
 * Following Flux: Effects subscribe to events and update their own slice only
 */

import { type AppDispatch, eventBus } from '@hai3/uicore';
import { DashboardsEvents } from '../events/dashboardsEvents';
import { setChartOrder, type ChartId } from '../slices/dashboardsSlice';

/**
 * Initialize effects
 * Called once during slice registration
 */
export const initializeDashboardsEffects = (appDispatch: AppDispatch): void => {
  const dispatch = appDispatch;

  // Listen for chart reorder events
  eventBus.on(DashboardsEvents.ChartsReordered, ({ newOrder }) => {
    dispatch(setChartOrder(newOrder as ChartId[]));
  });
};

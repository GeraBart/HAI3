/**
 * dashboards Actions
 * Emit events AND interact with APIs (Flux pattern)
 * Following Flux: Actions emit events for effects to update Redux, and call APIs
 */

import { eventBus } from '@hai3/uicore';
import { DashboardsEvents } from '../events/dashboardsEvents';

/**
 * Reorder charts on the dashboard
 */
export const reorderCharts = (newOrder: string[]): void => {
  eventBus.emit(DashboardsEvents.ChartsReordered, { newOrder });
};

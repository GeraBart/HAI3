/**
 * dashboards Events
 * Domain-specific events for this screenset
 */

import '@hai3/uicore';
import { DASHBOARDS_SCREENSET_ID } from '../ids';

const DOMAIN_ID = 'dashboards';

/**
 * Events enum
 */
export enum DashboardsEvents {
  ChartsReordered = `${DASHBOARDS_SCREENSET_ID}/${DOMAIN_ID}/chartsReordered`,
}

/**
 * Module augmentation for type-safe event payloads
 */
declare module '@hai3/uicore' {
  interface EventPayloadMap {
    [DashboardsEvents.ChartsReordered]: { newOrder: string[] };
  }
}

/**
 * dashboards API Service
 * Domain-specific API service for this screenset
 */

import { BaseApiService, RestProtocol, apiRegistry, type MockMap } from '@hai3/uicore';
import { DASHBOARDS_SCREENSET_ID } from '../ids';

export const DASHBOARDS_DOMAIN = `${DASHBOARDS_SCREENSET_ID}:api` as const;

/**
 * API request/response types
 * Add your API types here
 */

/**
 * dashboards API Service
 * Extends BaseApiService with domain-specific methods
 */
export class dashboardsApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/dashboards' },
      new RestProtocol({
        timeout: 30000,
      })
    );
  }

  /**
   * Get mock map from registry
   */
  protected getMockMap(): MockMap {
    return apiRegistry.getMockMap(DASHBOARDS_DOMAIN);
  }

  /**
   * Add your API methods here
   *
   * Example:
   * async getItems(): Promise<Item[]> {
   *   return this.protocol(RestProtocol).get<Item[]>('/items');
   * }
   */
}

// Register API service
apiRegistry.register(DASHBOARDS_DOMAIN, dashboardsApiService);

// Module augmentation - extends uicore ApiServicesMap
declare module '@hai3/uicore' {
  interface ApiServicesMap {
    [DASHBOARDS_DOMAIN]: dashboardsApiService;
  }
}

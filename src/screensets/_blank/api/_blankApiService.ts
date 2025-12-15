/**
 * _blank API Service
 * Domain-specific API service for this screenset
 */

import { BaseApiService, RestProtocol, apiRegistry, type MockMap } from '@hai3/uicore';
import { _BLANK_SCREENSET_ID } from '../ids';

export const _BLANK_DOMAIN = `${_BLANK_SCREENSET_ID}:api` as const;

/**
 * API request/response types
 * Add your API types here
 */

/**
 * _blank API Service
 * Extends BaseApiService with domain-specific methods
 */
export class _blankApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/_blank' },
      new RestProtocol()
    );
  }

  /**
   * Get mock map from registry
   */
  protected getMockMap(): MockMap {
    return apiRegistry.getMockMap(_BLANK_DOMAIN);
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
apiRegistry.register(_BLANK_DOMAIN, _blankApiService);

// Module augmentation - extends uicore ApiServicesMap
declare module '@hai3/uicore' {
  interface ApiServicesMap {
    [_BLANK_DOMAIN]: _blankApiService;
  }
}

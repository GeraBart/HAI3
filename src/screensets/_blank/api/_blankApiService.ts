/**
 * _blank API Service
 * Domain-specific API service for this screenset
 */

import { BaseApiService, RestProtocol, apiRegistry } from '@hai3/react';

/**
 * API request/response types
 * Add your API types here
 */

/**
 * _blank API Service
 * Extends BaseApiService with domain-specific methods
 */
export class _BlankApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/_blank' },
      new RestProtocol()
    );
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

// Register API service using class-based registration
apiRegistry.register(_BlankApiService);

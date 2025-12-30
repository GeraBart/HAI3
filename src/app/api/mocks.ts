/**
 * Accounts Domain - Mock Data
 * Mock responses for accounts service endpoints
 *
 * Used with MockPlugin for development and testing.
 * Keys are full URL patterns (including baseURL path).
 */

import type { MockMap } from '@hai3/api';
import { Language } from '@hai3/i18n';
import { UserRole, type ApiUser, type GetCurrentUserResponse } from './types';

/**
 * Mock user data
 */
const mockUser: ApiUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.Admin,
  language: Language.English,
  avatarUrl: 'https://i.pravatar.cc/150?u=john.doe',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Accounts mock map
 * Keys are full URL patterns (including /api/accounts baseURL)
 */
export const accountsMockMap: MockMap = {
  'GET /api/accounts/user/current': (): GetCurrentUserResponse => ({
    user: mockUser,
  }),
};

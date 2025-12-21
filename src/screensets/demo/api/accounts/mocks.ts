/**
 * Mock data for accounts service
 */

import { Language, type MockMap } from '@hai3/react';
import { UserRole, type ApiUser, type GetCurrentUserResponse } from '@/api';
import './extra';

export const mockDemoUser: ApiUser = {
  id: 'mock-user-001',
  email: 'demo@hai3.org',
  firstName: 'Demo',
  lastName: 'User',
  role: UserRole.Admin,
  language: Language.English,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  updatedAt: new Date('2024-12-01T00:00:00Z').toISOString(),
  extra: {
    department: 'Engineering',
  },
};

/**
 * Mock responses for accounts service endpoints
 * Type-safe mapping of endpoints to response factories
 */
export const accountsMockMap = {
  'GET /user/current': () => ({ user: mockDemoUser } satisfies GetCurrentUserResponse),
} satisfies MockMap;

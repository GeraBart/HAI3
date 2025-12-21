/**
 * Accounts Domain - API Types
 * Type definitions for accounts service endpoints
 * (users, tenants, authentication, permissions)
 *
 * Application-specific types (copied from CLI template)
 */

import type { Language } from '@hai3/i18n';

/**
 * User Extra Properties
 * Applications extend this via module augmentation for platform-specific fields
 */
export interface UserExtra {
  // Applications add their types via module augmentation
  // Empty by default
  [key: string]: unknown;
}

/**
 * User entity from API
 */
export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  language: Language;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  extra?: UserExtra;
}

/**
 * User roles
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

/**
 * Get current user response
 */
export interface GetCurrentUserResponse {
  user: ApiUser;
}

/**
 * API error response (shared across all domains)
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean | null>;
}

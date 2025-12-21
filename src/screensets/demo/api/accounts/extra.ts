/**
 * User Extra Properties
 * Platform-specific user fields via module augmentation
 */

import '@/api';

declare module '@/api' {
  interface UserExtra {
    department: string;
  }
}

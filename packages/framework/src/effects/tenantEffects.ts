/**
 * Tenant Effects
 *
 * Listens for tenant events and updates the tenant slice.
 * Event-driven architecture: consuming apps emit events, effects handle state updates.
 */

import { eventBus, getStore } from '@hai3/state';
import { setTenant, setTenantLoading, clearTenant } from '../slices/tenantSlice';
import type { Tenant } from '../layoutTypes';

// ============================================================================
// Event Types
// ============================================================================

/** Tenant event names */
export const TenantEvents = {
  Changed: 'app/tenant/changed',
  Cleared: 'app/tenant/cleared',
} as const;

/** Payload for tenant changed event */
export interface TenantChangedPayload {
  tenant: Tenant;
}

/** Payload for tenant cleared event */
export interface TenantClearedPayload {
  // Empty payload
}

// ============================================================================
// Module Augmentation for Type-Safe Events
// ============================================================================

declare module '@hai3/state' {
  interface EventPayloadMap {
    'app/tenant/changed': TenantChangedPayload;
    'app/tenant/cleared': TenantClearedPayload;
  }
}

// ============================================================================
// Effect Registration
// ============================================================================

/**
 * Initialize tenant effects
 * Call this once during app bootstrap to start listening for tenant events.
 */
export function initTenantEffects(): () => void {
  const store = getStore();

  // Listen for tenant changed event
  const subChanged = eventBus.on(TenantEvents.Changed, (payload) => {
    store.dispatch(setTenant(payload.tenant));
  });

  // Listen for tenant cleared event
  const subCleared = eventBus.on(TenantEvents.Cleared, () => {
    store.dispatch(clearTenant());
  });

  // Return cleanup function
  return () => {
    subChanged.unsubscribe();
    subCleared.unsubscribe();
  };
}

// ============================================================================
// Helper Actions (for consuming apps)
// ============================================================================

/**
 * Set tenant via event bus
 * This is the recommended way for consuming apps to set tenant.
 *
 * @example
 * ```typescript
 * import { changeTenant } from '@hai3/framework';
 * changeTenant({ id: 'tenant-123' });
 * ```
 */
export function changeTenant(tenant: Tenant): void {
  eventBus.emit(TenantEvents.Changed, { tenant });
}

/**
 * Clear tenant via event bus
 */
export function clearTenantAction(): void {
  eventBus.emit(TenantEvents.Cleared, {});
}

/**
 * Set tenant loading state (direct dispatch, for internal use)
 */
export function setTenantLoadingState(loading: boolean): void {
  getStore().dispatch(setTenantLoading(loading));
}

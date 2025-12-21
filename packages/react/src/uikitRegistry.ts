/**
 * UI Kit Registry Service
 * Unified registry for UI components and icons
 * Allows applications to register UI Kit implementations at runtime
 *
 * OPEN/CLOSED PRINCIPLE:
 * - Registry is CLOSED for modification
 * - UI elements register themselves at app level
 * - UI Core depends on interfaces, not implementations
 */

import type { UiKitComponentMap, ComponentName } from '@hai3/uikit';
import { UiKitIcon } from '@hai3/uikit';
import type { ReactNode } from 'react';

class UiKitRegistry {
  private components: Partial<UiKitComponentMap> = {};
  private icons: Map<string, ReactNode> = new Map();

  // ============================================
  // COMPONENT REGISTRATION
  // ============================================

  /**
   * Register a component implementation
   */
  registerComponent<K extends ComponentName>(
    name: K,
    component: UiKitComponentMap[K]
  ): void {
    if (this.components[name]) {
      console.warn(`Component "${name}" is already registered. Overwriting.`);
    }
    this.components[name] = component;
  }

  /**
   * Register multiple components at once
   * Type-safe: only accepts components defined in UiKitComponentMap
   */
  registerComponents(components: Partial<UiKitComponentMap>): void {
    (Object.keys(components) as ComponentName[]).forEach((name) => {
      const component = components[name];
      if (component) {
        this.registerComponent(name, component);
      }
    });
  }

  /**
   * Get a component by name
   */
  getComponent<K extends ComponentName>(name: K): UiKitComponentMap[K] {
    const component = this.components[name];
    if (!component) {
      throw new Error(
        `Component "${name}" not found in UI Kit registry. ` +
        `Make sure to register it before using it. ` +
        `Check your UI Kit registration file (e.g., src/uikit/uikitRegistry.ts).`
      );
    }
    return component as UiKitComponentMap[K];
  }

  /**
   * Check if a component is registered
   */
  hasComponent(name: ComponentName): boolean {
    return !!this.components[name];
  }

  /**
   * Get all registered component names
   */
  getRegisteredComponents(): ComponentName[] {
    return Object.keys(this.components) as ComponentName[];
  }

  // ============================================
  // ICON REGISTRATION
  // ============================================

  /**
   * Register an icon
   * Only accepts UiKitIcon enum or exported string constants
   * NO hardcoded string literals
   */
  registerIcon(id: UiKitIcon | string, icon: ReactNode): void {
    if (this.icons.has(id)) {
      console.warn(`Icon "${id}" is already registered. Overwriting.`);
    }
    this.icons.set(id, icon);
  }

  /**
   * Register multiple icons at once
   * Only accepts UiKitIcon enum or exported string constants
   * NO hardcoded string literals
   */
  registerIcons(icons: Record<string, ReactNode>): void {
    Object.entries(icons).forEach(([id, icon]) => {
      this.registerIcon(id, icon);
    });
  }

  /**
   * Get an icon by ID
   * Accepts UiKitIcon enum or exported string constants
   */
  getIcon(id: UiKitIcon | string): ReactNode | undefined {
    return this.icons.get(id);
  }

  /**
   * Get all registered icons
   */
  getAllIcons(): Record<string, ReactNode> {
    return Object.fromEntries(this.icons);
  }

  /**
   * Check if an icon is registered
   * Accepts UiKitIcon enum or exported string constants
   */
  hasIcon(id: UiKitIcon | string): boolean {
    return this.icons.has(id);
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.components = {};
    this.icons.clear();
  }
}

// Export singleton instance
export const uikitRegistry = new UiKitRegistry();

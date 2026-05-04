/**
 * MFE Runtime - ScreensetsRegistry Factory and Configuration
 *
 * This module exports the core runtime components for the MFE system.
 *
 * Key exports:
 * - ScreensetsRegistry (abstract class) - The public API contract
 * - ScreensetsRegistryFactory (abstract class) - Factory contract
 * - screensetsRegistryFactory (singleton) - Factory instance for building registry
 * - ScreensetsRegistryConfig (interface) - Registry configuration
 * - Abstract mount strategy classes and shipped concrete strategies
 * - DomainContext interface and related types
 *
 * NOTE: Default* concrete classes are NOT exported. They are internal implementation details.
 *
 * @packageDocumentation
 */

import { DefaultScreensetsRegistryFactory } from './DefaultScreensetsRegistryFactory';
import type { ScreensetsRegistryFactory } from './ScreensetsRegistryFactory';

export { ScreensetsRegistry } from './ScreensetsRegistry';
export { ScreensetsRegistryFactory } from './ScreensetsRegistryFactory';
export type { ScreensetsRegistryConfig } from './config';

// Mount strategy abstractions and shipped implementations
export { MountStrategy } from './mount-strategy';
export type { ContainerHooks, ActionPayload } from './mount-strategy';
export { ConcurrentMountStrategy, OptionalMountStrategy, ExclusiveMountStrategy } from './mount-strategies';

// Domain implementation abstractions
export { ExtensionDomainImplementation } from './ExtensionDomainImplementation';
export { ExtensionDomainImplementationFactory } from './ExtensionDomainImplementationFactory';
export { ExtensionMounter } from './ExtensionMounter';
export { DomainLifecycleTrigger } from './DomainLifecycleTrigger';

// DomainContext interface (domain authors see only the interface)
export type { DomainContext } from './DomainContext';

/**
 * Singleton ScreensetsRegistryFactory instance.
 *
 * This is the primary way to obtain a ScreensetsRegistry instance.
 *
 * @example
 * ```typescript
 * import { screensetsRegistryFactory, gtsPlugin } from '@cyberfabric/screensets';
 *
 * const registry = screensetsRegistryFactory.build({ typeSystem: gtsPlugin });
 * registry.registerDomain(myDomain, new MyDomainFactory());
 * await registry.registerExtension(myExtension);
 * ```
 */
export const screensetsRegistryFactory: ScreensetsRegistryFactory = new DefaultScreensetsRegistryFactory();

/**
 * HAI3 ESLint Configuration Package
 *
 * Layered configuration for the HAI3 SDK architecture:
 * - L0 (base): Universal rules for all code
 * - L1 (sdk): SDK packages with zero @hai3 dependencies
 * - L2 (framework): Framework package with only SDK deps
 * - L3 (react): React adapter with only framework dep
 * - L4 (screenset): User code with flux rules and isolation
 */

export { baseConfig } from './base.js';
export { sdkConfig } from './sdk.js';
export { frameworkConfig } from './framework.js';
export { reactConfig } from './react.js';
export { screensetConfig, createScreensetConfig } from './screenset.js';

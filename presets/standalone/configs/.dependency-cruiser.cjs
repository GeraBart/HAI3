/**
 * HAI3 Dependency Cruiser Configuration (Standalone)
 * Base rules for HAI3 projects - screenset isolation and flux architecture
 *
 * This configuration uses the layered @hai3/depcruise-config package (L4: screenset layer)
 * which includes ALL screenset isolation rules and flux architecture rules.
 *
 * Hierarchy:
 * - @hai3/depcruise-config/screenset.cjs (L4) - All screenset and flux rules
 *   └── @hai3/depcruise-config/base.cjs (L0) - Universal rules (no-circular, no-orphans)
 *
 * This is the single source of truth for standalone project dependency rules.
 * - Monorepo extends this via presets/monorepo/configs/.dependency-cruiser.cjs
 * - CLI copies this to new projects via copy-templates.ts
 *
 * Note: Uses $1, $2 for backreferences (not \1, \2) per dependency-cruiser docs
 */

const screensetConfig = require('@hai3/depcruise-config/screenset');

module.exports = screensetConfig;

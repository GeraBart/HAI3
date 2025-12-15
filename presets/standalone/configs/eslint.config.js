/**
 * HAI3 ESLint Configuration (Standalone)
 * Base rules for HAI3 projects - screenset architecture and flux pattern
 *
 * This configuration uses the layered @hai3/eslint-config package (L4: screenset layer)
 * which includes ALL flux architecture rules, screenset isolation, and domain-based rules.
 *
 * Hierarchy:
 * - @hai3/eslint-config/screenset.js (L4) - All flux rules, isolation, domain rules
 *   └── @hai3/eslint-config/base.js (L0) - Universal rules (no-any, unused-imports, etc.)
 *
 * This is the single source of truth for standalone project ESLint rules.
 * - Monorepo extends this via presets/monorepo/configs/eslint.config.js
 * - CLI copies this to new projects via copy-templates.ts
 */

import { createScreensetConfig } from '@hai3/eslint-config/screenset';
import { createRequire } from 'module';

// Local plugin uses CommonJS, need to require it
// eslint-plugin-local is in presets/standalone/ (sibling to configs/)
const localPlugin = createRequire(import.meta.url)('../eslint-plugin-local');

// Create screenset config with local plugin for domain-based rules
const screensetConfig = createScreensetConfig({ localPlugin });

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Additional ignores specific to standalone projects
  {
    ignores: [
      'scripts/**',
      'presets/standalone/scripts/**',
      'eslint-plugin-local/**', // ESLint plugin is CommonJS, has its own linting
      'vite.config.ts',
    ],
  },

  // Use the full screenset config from @hai3/eslint-config
  ...screensetConfig,
];

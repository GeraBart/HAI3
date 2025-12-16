/**
 * @hai3/flux ESLint Configuration
 * Extends SDK layer config - enforces zero @hai3 dependencies and no React
 */

import { sdkConfig } from '@hai3/eslint-config/sdk.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...sdkConfig,

  // Package-specific ignores
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Allow 'any' in specific files where Redux typing requires it
  // replaceReducer has known typing limitations with dynamic reducers
  {
    files: ['src/store.ts', 'src/types.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

/**
 * @hai3/store ESLint Configuration
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

  // Allow 'any' in types.ts for SliceObject<TState = any>
  // This follows Redux Toolkit's pattern: Slice<State = any>
  // Required for heterogeneous slice collections where type safety
  // comes from individual slice definitions, not collection type.
  // See: https://github.com/reduxjs/redux-toolkit
  {
    files: ['src/types.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

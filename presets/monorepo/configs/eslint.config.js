/**
 * HAI3 ESLint Configuration (Monorepo)
 * Extends standalone rules + adds monorepo-specific rules
 *
 * This extends presets/standalone/configs/eslint.config.js
 * Root eslint.config.js re-exports this for the monorepo
 */

import standaloneConfig from '../../standalone/configs/eslint.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Include all standalone configs
  ...standaloneConfig,

  // Additional monorepo ignores
  {
    ignores: [
      'packages/**/dist/**',
      'packages/**/templates/**', // CLI templates are build artifacts
      'presets/**/scripts/**',
      'presets/**/eslint-plugin-local/**', // ESLint plugin is CommonJS, linted separately
      // Legacy config files (still used by dependency-cruiser)
      '.dependency-cruiser.cjs',
      'presets/**/.dependency-cruiser.cjs',
    ],
  },

  // Monorepo-specific: Package internals and @/ aliases
  {
    files: ['packages/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@hai3/*/src/**'],
              message:
                'MONOREPO VIOLATION: Import from package root, not internal paths.',
            },
            {
              group: ['@/*'],
              message:
                'PACKAGE VIOLATION: Use relative imports within packages. @/ aliases are only for app code (src/).',
            },
          ],
        },
      ],
    },
  },

  // App: Studio should only be imported via HAI3Provider (auto-detection)
  {
    files: ['src/**/*'],
    ignores: ['src/main.tsx', '**/HAI3Provider.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@hai3/studio', '@hai3/studio/**'],
              message:
                'STUDIO VIOLATION: Studio should not be imported directly in app code. HAI3Provider auto-detects and loads Studio in development mode.',
            },
          ],
        },
      ],
    },
  },

  // Studio: Exclude from inline styles rule (dev-only package with intentional glassmorphic effects)
  {
    files: ['packages/studio/**/*.tsx'],
    rules: {
      'local/no-inline-styles': 'off',
    },
  },

  // SDK packages: Allow explicit any for type casting (Redux/TypeScript compatibility)
  // These packages require `any` for: Redux replaceReducer, plugin constructors, event bus emit
  {
    files: [
      'packages/events/**/*.ts',
      'packages/store/**/*.ts',
      'packages/layout/**/*.ts',
      'packages/api/**/*.ts',
      'packages/i18n/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Monorepo: uicore components must also follow flux rules (no direct slice dispatch)
  {
    files: [
      'packages/uicore/src/components/**/*.tsx',
      'packages/uicore/src/layout/domains/**/*.tsx',
    ],
    ignores: ['**/*.test.*', '**/*.spec.*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='dispatch'] CallExpression[callee.name=/^set[A-Z]/]",
          message:
            'FLUX VIOLATION: Components cannot call slice reducers (setXxx functions). Use actions from /actions/ instead.',
        },
        {
          selector:
            "CallExpression[callee.object.name=/Store$/][callee.property.name!='getState']",
          message:
            'FLUX VIOLATION: Components cannot call custom store methods directly. Use Redux actions and useSelector.',
        },
      ],
    },
  },
];

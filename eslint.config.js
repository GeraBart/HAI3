/**
 * HAI3 ESLint Configuration (Monorepo Root)
 *
 * This file contains the complete ESLint rules for the HAI3 monorepo:
 * - Standalone rules from packages/cli/template-sources/project/configs/eslint.config.js
 * - Monorepo-specific package boundary rules
 * - SDK/Framework package exceptions (unknown type is required for generic code)
 *
 * For standalone projects, use packages/cli/template-sources/project/configs/eslint.config.js
 */

import standaloneConfig from './packages/cli/template-sources/project/configs/eslint.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Include all standalone configs
  ...standaloneConfig,

  // Additional monorepo ignores
  {
    ignores: [
      'packages/**/dist/**',
      'packages/**/templates/**', // CLI templates are build artifacts
      'packages/cli/template-sources/**', // CLI template sources (linted separately in standalone)
      'scripts/**', // Monorepo scripts
      // Legacy config files (still used by dependency-cruiser)
      '.dependency-cruiser.cjs',
    ],
  },

  // SDK packages: Allow unknown/object types (required for generic event bus, store, etc.)
  // These packages use generics and need flexible typing for consumer code to augment
  {
    files: [
      'packages/state/**/*.ts',
      'packages/api/**/*.ts',
      'packages/i18n/**/*.ts',
      'packages/screensets/**/*.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Framework package: Allow unknown/object types (wraps SDK with plugin architecture)
  {
    files: ['packages/framework/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // React package: Allow unknown types for hook generics
  {
    files: ['packages/react/**/*.ts', 'packages/react/**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // CLI package: Allow unknown types for dynamic command handling
  {
    files: ['packages/cli/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // Layout components: Allow unknown types for API registry type assertions
  {
    files: ['src/layout/**/*.tsx', 'src/layout/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        // Keep flux/lodash rules but remove TSUnknownKeyword restriction
        {
          selector: "CallExpression[callee.name='dispatch'] > MemberExpression[object.name='store']",
          message: 'FLUX VIOLATION: Components must not call store.dispatch directly. Use actions instead.',
        },
      ],
    },
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
  // NOTE: Exclude action/effect files to preserve flux architecture rules from screenset.js
  // NOTE: App.tsx in monorepo root is the demo app entrypoint and intentionally imports Studio
  {
    files: ['src/**/*'],
    ignores: [
      'src/main.tsx',
      'src/App.tsx', // Monorepo demo app - intentionally imports Studio
      '**/HAI3Provider.tsx',
      '**/*Actions.ts',
      '**/*Actions.tsx',
      '**/actions/**/*',
      '**/*Effects.ts',
      '**/*Effects.tsx',
      '**/effects/**/*',
    ],
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

import type { GeneratedFile } from '../core/types.js';
import type { LayerType } from '../commands/create/index.js';

/**
 * Input for layer package generation
 */
export interface LayerPackageInput {
  /** Package name (npm package name format) */
  packageName: string;
  /** SDK layer */
  layer: LayerType;
}

/**
 * Get dependencies for a layer
 */
function getLayerDependencies(layer: LayerType): {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  // Common ESLint dev dependencies for self-contained configs
  const eslintDevDeps: Record<string, string> = {
    '@eslint/js': '^9.0.0',
    'typescript-eslint': '^8.0.0',
    'eslint-plugin-unused-imports': '^4.0.0',
    globals: '^15.0.0',
    eslint: '^9.0.0',
  };

  switch (layer) {
    case 'sdk':
      // SDK layer has no HAI3 dependencies
      return {
        dependencies: {},
        peerDependencies: {},
        devDependencies: {
          ...eslintDevDeps,
          typescript: '^5.4.0',
          tsup: '^8.0.0',
        },
      };

    case 'framework':
      // Framework layer depends only on SDK packages
      return {
        dependencies: {},
        peerDependencies: {
          '@hai3/events': 'alpha',
          '@hai3/store': 'alpha',
        },
        devDependencies: {
          ...eslintDevDeps,
          '@hai3/events': 'alpha',
          '@hai3/store': 'alpha',
          typescript: '^5.4.0',
          tsup: '^8.0.0',
        },
      };

    case 'react':
      // React layer depends on Framework and React
      return {
        dependencies: {},
        peerDependencies: {
          '@hai3/framework': 'alpha',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
        devDependencies: {
          ...eslintDevDeps,
          'eslint-plugin-react-hooks': '^5.0.0',
          '@hai3/framework': 'alpha',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          react: '^18.3.0',
          'react-dom': '^18.3.0',
          typescript: '^5.4.0',
          tsup: '^8.0.0',
        },
      };

    default:
      return {
        dependencies: {},
        peerDependencies: {},
        devDependencies: {},
      };
  }
}

/**
 * Get ESLint config content for a layer
 * Generates self-contained configs that don't depend on @hai3/eslint-config
 */
function getEslintConfig(layer: LayerType): string {
  const baseConfig = `import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.*'],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
    },
  },
`;

  if (layer === 'sdk') {
    // SDK layer: base config with no-react restriction
    return `${baseConfig}
  // SDK layer: No React imports allowed
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: 'SDK layer cannot import React. This is a framework-agnostic layer.',
            },
          ],
        },
      ],
    },
  },
];
`;
  }

  if (layer === 'framework') {
    // Framework layer: base config with no-react restriction
    return `${baseConfig}
  // Framework layer: No React imports allowed
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: 'Framework layer cannot import React directly. Use @hai3/react for React bindings.',
            },
          ],
        },
      ],
    },
  },
];
`;
  }

  if (layer === 'react') {
    // React layer: base config + react-hooks
    return `import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.*'],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];
`;
  }

  // Default fallback
  return `${baseConfig}];
`;
}

/**
 * Get tsconfig content for a layer
 */
function getTsConfig(layer: LayerType): string {
  const compilerOptions: Record<string, unknown> = {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'bundler',
    lib: ['ES2022'],
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    declaration: true,
    declarationMap: true,
    outDir: './dist',
    rootDir: './src',
  };

  if (layer === 'react') {
    compilerOptions.lib = ['ES2022', 'DOM', 'DOM.Iterable'];
    compilerOptions.jsx = 'react-jsx';
  }

  return JSON.stringify(
    {
      compilerOptions,
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
    null,
    2
  );
}

/**
 * Generate files for a layer package
 */
export function generateLayerPackage(input: LayerPackageInput): GeneratedFile[] {
  const { packageName, layer } = input;
  const files: GeneratedFile[] = [];
  const deps = getLayerDependencies(layer);

  // package.json
  const packageJson = {
    name: packageName,
    version: '0.1.0',
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        import: './dist/index.js',
        require: './dist/index.cjs',
        types: './dist/index.d.ts',
      },
    },
    files: ['dist'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      lint: 'eslint src/',
      'type-check': 'tsc --noEmit',
    },
    dependencies: deps.dependencies,
    peerDependencies: deps.peerDependencies,
    devDependencies: deps.devDependencies,
  };
  files.push({
    path: 'package.json',
    content: JSON.stringify(packageJson, null, 2) + '\n',
  });

  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: getTsConfig(layer) + '\n',
  });

  // eslint.config.js
  files.push({
    path: 'eslint.config.js',
    content: getEslintConfig(layer),
  });

  // tsup.config.ts
  files.push({
    path: 'tsup.config.ts',
    content: `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
`,
  });

  // src/index.ts
  files.push({
    path: 'src/index.ts',
    content: `/**
 * ${packageName}
 *
 * A HAI3 ${layer}-layer package.
 */

export const VERSION = '0.1.0';

// Add your exports here
`,
  });

  // .gitignore
  files.push({
    path: '.gitignore',
    content: `node_modules/
dist/
*.log
.DS_Store
`,
  });

  // README.md
  files.push({
    path: 'README.md',
    content: `# ${packageName}

A HAI3 ${layer}-layer package.

## Installation

\`\`\`bash
npm install ${packageName}
\`\`\`

## Usage

\`\`\`typescript
import { VERSION } from '${packageName}';

console.log(VERSION);
\`\`\`

## Development

\`\`\`bash
npm run dev     # Watch mode
npm run build   # Production build
npm run lint    # ESLint
npm run type-check  # TypeScript check
\`\`\`

## Layer: ${layer}

This package follows HAI3's ${layer}-layer architecture conventions:
${layer === 'sdk' ? '- No HAI3 package dependencies\n- No React dependencies' : ''}${layer === 'framework' ? '- Can depend on SDK packages (@hai3/events, @hai3/store, etc.)\n- No React dependencies' : ''}${layer === 'react' ? '- Can depend on Framework packages (@hai3/framework)\n- React peer dependency' : ''}

## License

Apache-2.0
`,
  });

  // .ai/rules/_meta.json (layer metadata for ai sync)
  files.push({
    path: '.ai/rules/_meta.json',
    content: JSON.stringify(
      {
        layer,
        version: '1.0',
      },
      null,
      2
    ) + '\n',
  });

  // .ai/GUIDELINES.md
  files.push({
    path: '.ai/GUIDELINES.md',
    content: `# ${packageName} Development Guidelines

## Layer: ${layer}

This package follows HAI3's ${layer}-layer architecture.

### Dependency Rules

${layer === 'sdk' ? `- ❌ Cannot import from other @hai3 packages
- ❌ Cannot import React or React DOM
- ✅ Can use pure TypeScript/JavaScript` : ''}${layer === 'framework' ? `- ✅ Can import from @hai3/events, @hai3/store, @hai3/layout, @hai3/api, @hai3/i18n
- ❌ Cannot import from @hai3/react, @hai3/uikit, @hai3/uicore
- ❌ Cannot import React or React DOM` : ''}${layer === 'react' ? `- ✅ Can import from @hai3/framework
- ✅ Can import React and React DOM
- ❌ Cannot import directly from SDK packages (use Framework re-exports)` : ''}

### Code Style

- Use TypeScript strict mode
- Export types alongside implementations
- Document public APIs with JSDoc
`,
  });

  return files;
}

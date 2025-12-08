import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  dts: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react-redux',
    'react-router-dom',
    '@reduxjs/toolkit',
    'axios',
    '@hai3/uikit',
    'use-sync-external-store',
    'use-sync-external-store/shim',
    'use-sync-external-store/shim/index.js',
    'use-sync-external-store/shim/with-selector',
  ],
  noExternal: [],
  treeshake: true,
  splitting: false,
  esbuildOptions(options) {
    options.alias = {
      '@/core': path.resolve(__dirname, 'src'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
    };
  },
});

import { defineConfig } from 'tsup';

export default defineConfig([
  // Main build (index + types)
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    sourcemap: true,
    splitting: false,
    external: [
      '@hai3/state',
      '@hai3/screensets',
      '@hai3/api',
      '@hai3/i18n',
      '@reduxjs/toolkit',
      'react',
    ],
  },
  // Types-only build with DTS
  {
    entry: {
      types: 'src/types.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: false, // Don't clean - we want to keep index build artifacts
    sourcemap: true,
    external: [
      '@hai3/state',
      '@hai3/screensets',
      '@hai3/api',
      '@hai3/i18n',
      '@reduxjs/toolkit',
      'react',
    ],
  },
]);

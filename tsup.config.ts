import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: true,
    external: ['react', 'react-dom'],
    injectStyle: false,
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  {
    entry: { tokvista: 'src/bin/tokvista.ts' },
    outDir: 'dist/bin',
    format: ['esm'],
    platform: 'node',
    target: 'node16',
    splitting: false,
    sourcemap: false,
    clean: false,
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: { browser: 'src/cli/browser.tsx' },
    outDir: 'dist/cli',
    format: ['esm'],
    platform: 'browser',
    target: 'es2020',
    noExternal: [/^react$/, /^react-dom$/, /^react-dom\//, /^react\/jsx-runtime$/],
    splitting: false,
    sourcemap: false,
    clean: false,
    minify: true,
  },
]);

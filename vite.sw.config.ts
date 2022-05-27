import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfig from './tsconfig.json';

const alias: Record<string, string> = {};

Object.entries(tsconfig.compilerOptions.paths).forEach(item => {
  const key = item[0].replace(/\/\*$/, '');
  const val = item[1][0].replace(/\/\*$/, '');
  alias[key] = resolve(__dirname, val);
});

const pagesDir = alias['@/pages'];
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

export default defineConfig({
  resolve: {
    alias, // alias defined in tsconfig.json/compilerOptions.paths
  },
  publicDir,
  build: {
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    outDir,
    rollupOptions: {
      input: {
        sw: resolve(pagesDir, 'sw', 'firebase-messaging-sw.js'),
      },
      output: {
        entryFileNames: () => `firebase-messaging-sw.js`,
      },
    },
  },
});

import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'es2018',
});

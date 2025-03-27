import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'examples/*.ts'],
  format: ['esm', 'cjs'],
  dts: {
    entry: './src/index.ts',
    resolve: true  // ✅ resolves aliases like magiclogger/*
  },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json'
});

import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isBrowser = options.platform === 'browser';
  const isESM = options.format === 'esm';

  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Always build both
    dts: {
      // Generate declaration files
      entry: './src/index.ts',
      resolve: true,
      // Optional: generate separate declaration files for ESM and CJS
      options: {
        // Customize declaration file generation if needed
        declarationMap: true,
      },
    },
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    minify: isBrowser,
    target: 'es2022',
    tsconfig: 'tsconfig.build.json',

    // Ensure consistent file extensions
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.js' : '.cjs',
      };
    },

    esbuildOptions: config => {
      if (isBrowser || isESM) {
        config.define = {
          'process.env.NODE_ENV': '"production"',
          'process.platform': '"browser"',
        };

        // Stub out Node.js specific modules
        // config.define['require'] = 'global.require || function() { throw new Error("Dynamic require not supported") }';
      }
    },

    // External modules strategy
    external: ['fs', 'path', 'os', 'util', 'tty', 'module'],

    // Conditions and platform handling
    conditions: isBrowser || isESM ? ['browser', 'module'] : ['node'],
    platform: isBrowser ? 'browser' : 'node',
  };
});

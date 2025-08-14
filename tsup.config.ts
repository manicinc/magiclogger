import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isBrowser = options.platform === 'browser';
  const isESM = options.format === 'esm';

  // NOTE: We explicitly list all public entry points referenced in package.json "exports".
  // This allows bundlers to tree-shake by importing only the specific sub-path.
  // Object keys map directly to output file paths under dist/ (without extension).
  const entry = {
    // Root API
    index: 'src/index.ts',

    // Aggregated transports & individual transports
    transports: 'src/transports.ts',
    'transports/console': 'src/transports/console.ts',
    'transports/file': 'src/transports/file.ts',
    'transports/http': 'src/transports/http.ts',
    'transports/s3': 'src/transports/s3.ts',
    'transports/mongodb': 'src/transports/mongodb.ts',
    'transports/stream': 'src/transports/stream.ts',
    'transports/websocket': 'src/transports/websocket.ts',
  'transports/otlp': 'src/transports/otlp.ts',
    'transports/base': 'src/transports/index.ts', // registry + base classes

    // Compatibility layers
    'compatibility/index': 'src/compatibility/index.ts',
    'compatibility/winston': 'src/compatibility/winston.ts',
    'compatibility/bunyan': 'src/compatibility/bunyan.ts',
    'compatibility/pino': 'src/compatibility/pino.ts',
    'compatibility/console': 'src/compatibility/console.ts',
    'compatibility/base': 'src/compatibility/base.ts',

    // Theme system
    'theme/theme': 'src/theme/theme.ts',

    // Core focused entry-points (lowercase per exports map expectation)
    'core/colorizer': 'src/core/Colorizer.ts',
    'core/context-manager': 'src/core/ContextManager.ts',
    'core/tag-manager': 'src/core/TagManager.ts',
    'core/formatter': 'src/core/Formatter.ts',

    // Async utilities
    'async/logger': 'src/async/AsyncLogger.ts',
    'async/buffer': 'src/async/AsyncBuffer.ts',

    // Types runtime stubs (optional – most are type-only, small cost)
    'types/index': 'src/types/index.ts',
  } as const;

  return {
    entry,
    format: ['cjs', 'esm'],
    splitting: true, // enable code-splitting for ESM builds
    treeshake: true,
    dts: {
      entry: './src/index.ts',
      resolve: true,
      options: {
        declarationMap: true,
      },
    },
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    minify: false, // keep readable for analysis; can enable in release pipeline
    target: 'es2022',
    tsconfig: 'tsconfig.build.json',
    keepNames: true,

    outExtension({ format }) {
      return { js: format === 'esm' ? '.js' : '.cjs' };
    },

    esbuildOptions: config => {
      if (isBrowser || isESM) {
        config.define = {
          'process.env.NODE_ENV': '"production"',
          'process.platform': '"browser"',
        };
      }
    },

    // Node built-ins we never want bundled
    external: ['fs', 'path', 'os', 'util', 'tty', 'module'],

    conditions: isBrowser || isESM ? ['browser', 'module'] : ['node'],
    platform: isBrowser ? 'browser' : 'node',
  };
});

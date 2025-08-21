import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isBrowser = options.platform === 'browser';

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
    'transports/null': 'src/transports/null.ts',
    'transports/otlp': 'src/transports/otlp.ts',
    'transports/postgresql': 'src/transports/postgresql.ts',
    'transports/base': 'src/transports/index.ts', // registry + base classes

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

    // Utils (tree-shakeable, optional)
    'utils/sampler': 'src/utils/Sampler.ts',
    'utils/rate-limiter': 'src/utils/RateLimiter.ts',
    'utils/redactor': 'src/utils/Redactor.ts',
    'utils/queue-manager': 'src/utils/QueueManager.ts',
    'utils/enhanced-console': 'src/utils/EnhancedConsole.ts',
  } as const;

  return {
    entry,
    format: ['cjs', 'esm'],
    splitting: true, // enable code-splitting for ESM builds
    treeshake: true,
    dts: {
      entry: [
        './src/index.ts',
        './src/types/index.ts',
        './src/transports/postgresql.ts',
        './src/utils/Sampler.ts',
        './src/utils/RateLimiter.ts',
        './src/utils/Redactor.ts',
        './src/utils/QueueManager.ts',
      ],
      resolve: true,
      options: {
        declarationMap: true,
      },
    },
    sourcemap: true,
    clean: true,
    outDir: isBrowser ? 'dist/browser' : 'dist',
    minify: false, // keep readable for analysis; can enable in release pipeline
    target: 'es2022',
    tsconfig: 'tsconfig.build.json',
    keepNames: true,

    outExtension({ format }) {
      return { js: format === 'esm' ? '.js' : '.cjs' };
    },

    esbuildOptions: config => {
      if (isBrowser) {
        config.define = {
          'process.env.NODE_ENV': '"production"',
          'process.platform': '"browser"',
        };
      }
    },

    // Node built-ins we never want bundled in Node builds
    // Also mark 'events' external for Node so esbuild doesn't try to resolve it during ESM build
    external: isBrowser ? [] : ['fs', 'path', 'os', 'util', 'tty', 'module', 'events'],

    conditions: isBrowser ? ['browser', 'module'] : ['node'],
    platform: isBrowser ? 'browser' : 'node',
  };
});

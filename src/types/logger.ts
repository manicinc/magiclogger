import type { ColorName } from './colors';
import type { ThemeDefinition as RichThemeDefinition } from './theme';
import type { Transport } from './transport';
export type { ThemeDefinition } from './theme';

/**
 * A theme defines color/style mappings for log levels.
 *
 * Each key represents a log level or category, and the value is
 * an array of `ColorName` styles applied to messages of that level.
 *
 * @example
 * {
 *   info: ['cyan', 'bold'],
 *   error: ['brightRed', 'bold'],
 *   header: ['brightWhite', 'bgBlue', 'bold']
 * }
 */
// Back-compat alias for previous simple theme shape; prefer RichThemeDefinition everywhere.
// Note: RichThemeDefinition supports 'tags' and preset keys; it's a superset of the simple map.
export type SimpleThemeDefinition = Record<string, ColorName[]>;

/**
 * Configuration options for a MagicLogger instance.
 * These settings control the logger's behavior, output format, identity, and destination.
 */
export interface LoggerOptions {
  /**
   * Unique identifier for the logger instance.
   * Used for filtering logs across services or systems.
   *
   * @example 'auth-service'
   */
  id?: string;

  /**
   * Optional static tags applied to all logs from this logger.
   * Helps group or filter logs by functional or organizational tag.
   *
   * @example ['api', 'auth']
   */
  tags?: string[];

  /**
   * Optional default context applied to all logs.
   * Can include environment metadata, user data, etc.
   * Individual log calls may override this.
   *
   * @example { env: 'staging', region: 'us-east-1' }
   */
  context?: Record<string, unknown>;

  /**
   * Minimum log level to output.
   * Messages below this level will be filtered out.
   *
   * @example 'info' // Only info, warn, error, fatal will be logged
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * If enabled, debug-level logs will be shown.
   *
   * @default false
   */
  verbose?: boolean;

  /**
   * Enables or disables terminal or console color output.
   *
   * @default true
   */
  useColors?: boolean;

  /**
   * Enable performance mode to disable styling for maximum throughput.
   * When enabled, all styling is bypassed for 3x+ performance improvement.
   * 
   * @default false
   */
  performanceMode?: boolean;

  /**
   * Writes logs to disk in timestamped `.log` files (Node only).
   * Ignored in browsers.
   *
   * @default false
   */
  writeToDisk?: boolean;

  /**
   * Directory to store log files in (Node only).
   *
   * @default 'logs'
   */
  logDir?: string;

  /**
   * Number of days to retain log files before pruning (Node only).
   *
   * @default 30
   */
  logRetentionDays?: number;

  /**
   * Enforces strict log level behavior.
   * If true, unknown levels passed to `.log()` will throw.
   * If false, unknown levels are treated as custom and passed to `.custom()`.
   *
   * @default false
   */
  strictLevels?: boolean;

  /**
   * Theme used to style logger output.
   * Can be a string (theme name from ThemeManager) or a full object.
   *
   * @example 'dark'
   * @example {
   *   info: ['cyan', 'bold'],
   *   error: ['brightRed', 'bold'],
   *   header: ['brightWhite', 'bgBlue', 'bold']
   * }
   */
  theme?: string | RichThemeDefinition;

  /**
   * Optional mapping of tags to theme names. When provided, if a logger has
   * any tag present in this map and no explicit theme is set, the mapped theme
   * will be auto-applied. This enables brand/company-specific themes via tags.
   *
   * @example { acme: 'acme', contoso: 'contoso-dark' }
   */
  themeByTag?: Record<string, string>;

  /**
   * Whether to store logs in browser storage when in browser environment.
   * Has no effect in Node.js environments.
   *
   * @default false
   */
  storeInBrowser?: boolean;

  /**
   * Maximum number of log entries to keep in browser storage.
   * Has no effect in Node.js environments.
   *
   * @default 1000
   */
  maxStoredLogs?: number;

  /**
   * Name to use for browser storage (localStorage key or IndexedDB name).
   * Has no effect in Node.js environments.
   *
   * @default 'magiclogger-logs'
   */
  storageName?: string;

  /**
   * Whether to use localStorage (true) or IndexedDB (false) for browser storage.
   * Has no effect in Node.js environments.
   *
   * @default true
   */
  useLocalStorage?: boolean;

  /**
   * File path for log output (SyncLogger only).
   * When provided, logs will be written to this file synchronously.
   *
   * @example './audit.log'
   */
  file?: string;

  /**
   * Force flush to disk after each write (SyncLogger only).
   * Uses fsync to ensure data is written to disk.
   *
   * @default true
   */
  forceFlush?: boolean;

  /**
   * Array of transports to use for logging.
   * @type {Transport[]}
   * @default []
   */
  transports?: Transport[]; // Use Transport[] from types/transport

  /**
   * Custom ID generator function for log entries.
   */
  idGenerator?: () => string;

  /**
   * Whether to automatically create default transports.
   * @default false
   */
  useDefaultTransports?: boolean;

  /**
   * Whether to use console transport by default.
   * Set to false to disable automatic console output.
   * @default true
   */
  useConsole?: boolean;

  /**
   * Pretty-printing mode for non-string variadic args.
   * 'inspect' uses util.inspect in Node (with colors when enabled);
   * 'json' uses JSON.stringify; default is 'inspect'.
   */
  prettyPrint?: 'inspect' | 'json';

  /**
   * When true, and verbose mode is enabled, append a compact [meta] summary
   * of selected keys after the printed message. Meta remains structured for transports.
   * Default: false
   */
  printMetaInDebug?: boolean;

  // ==========================================
  // PERFORMANCE & MODE CONFIGURATION
  // ==========================================

  /**
   * Logger performance mode configuration.
   * - 'sync': Always synchronous (immediate output)
   * - 'async': Always asynchronous (uses internal AsyncLogger)
   * - 'auto': Smart detection based on environment
   * - 'balanced': Micro-async buffer with sync fallback
   *
   * @default 'sync'
   */
  mode?: 'sync' | 'async' | 'auto' | 'balanced';

  /**
   * Performance target hint for auto mode detection.
   * - 'features': Prioritize rich styling and features (sync)
   * - 'speed': Prioritize throughput (async)
   * - 'balanced': Balance between features and speed
   *
   * @default 'balanced'
   */
  performance?: 'features' | 'speed' | 'balanced';

  /**
   * Fallback to synchronous logging when async buffers are full.
   * Only applies when mode is 'async' or 'balanced'.
   *
   * @default true
   */
  fallbackToSync?: boolean;

  // ==========================================
  // OPERATIONAL UTILITIES INTEGRATION
  // ==========================================

  /**
   * Rate limiting configuration for log throttling.
   * Can be a RateLimiter instance or options to create one.
   *
   * @example
   * // Using options
   * rateLimiter: { max: 1000, window: 60000, strategy: 'sliding' }
   *
   * // Using instance
   * rateLimiter: new RateLimiter({ max: 100, window: 10000 })
   */
  rateLimiter?:
    | import('../extensions/RateLimiter').RateLimiter
    | import('../extensions/RateLimiter').RateLimiterOptions;

  /**
   * PII and sensitive data redaction configuration.
   * Can be a Redactor instance or options to create one.
   *
   * @example
   * // Using preset
   * redactor: { preset: 'strict' }
   *
   * // Using instance
   * redactor: new Redactor({ preset: 'paranoid', auditTrail: true })
   */
  redactor?:
    | import('../extensions/Redactor').Redactor
    | import('../extensions/Redactor').RedactorOptions;

  /**
   * Statistical sampling configuration for volume control.
   * Can be a Sampler instance or options to create one.
   *
   * @example
   * // Using options
   * sampler: { rate: 0.1, strategy: 'adaptive', targetRate: 1000 }
   *
   * // Using instance
   * sampler: createSamplerPreset('production')
   */
  sampler?:
    | import('../extensions/Sampler').Sampler
    | import('../extensions/Sampler').SamplerOptions;

  /**
   * Queue management configuration for handling backpressure.
   * Can be a QueueManager instance or options to create one.
   *
   * @example
   * // Using options
   * queueManager: { maxSize: 10000, dropPolicy: 'tail', highWaterMark: 0.8 }
   *
   * // Using instance
   * queueManager: new QueueManager({ maxSize: 5000, dropPolicy: 'priority' })
   */
  queueManager?:
    | import('../extensions/QueueManager').QueueManager
    | import('../extensions/QueueManager').QueueManagerOptions;

}

/**
 * Supported log levels for structured logging.
 * Additional custom levels are allowed unless strictLevels is true.
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success' | string;

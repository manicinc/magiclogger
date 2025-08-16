import type { ColorName } from './colors';
import type { ThemeDefinition as RichThemeDefinition } from './theme';
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
}

/**
 * Supported log levels for structured logging.
 * Additional custom levels are allowed unless strictLevels is true.
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success' | string;

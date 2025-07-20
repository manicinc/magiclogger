// File: src/types/logger.ts

/**
 * Logger-specific type definitions.
 */

/**
 * Log levels supported by the logger.
 * Can be extended with custom levels.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | string;

/**
 * ID generator function type.
 */
export type IdGenerator = () => string;

/**
 * Base logger options.
 */
export interface LoggerOptions {
  /**
   * Logger instance identifier.
   */
  id?: string;

  /**
   * Tags for categorizing logs.
   */
  tags?: string[];

  /**
   * Global context data.
   */
  context?: Record<string, any>;

  /**
   * Enable verbose (debug) logging.
   * @default false
   */
  verbose?: boolean;

  /**
   * Enable colored output.
   * @default true
   */
  useColors?: boolean;

  /**
   * Enforce strict log levels.
   * @default false
   */
  strictLevels?: boolean;

  /**
   * Write logs to disk (Node.js only).
   * @default false
   */
  writeToDisk?: boolean;

  /**
   * Directory for log files.
   * @default 'logs'
   */
  logDir?: string;

  /**
   * Log retention period in days.
   * @default 30
   */
  logRetentionDays?: number;

  /**
   * Store logs in browser storage.
   * @default false
   */
  storeInBrowser?: boolean;

  /**
   * Browser storage key name.
   * @default 'logger_logs'
   */
  storageName?: string;

  /**
   * Maximum stored logs in browser.
   * @default 1000
   */
  maxStoredLogs?: number;

  /**
   * Use localStorage instead of IndexedDB.
   * @default true
   */
  useLocalStorage?: boolean;

  /**
   * Theme name or custom theme object.
   */
  theme?: string | Record<string, ColorName[]>;
}

// Re-export types from other modules for convenience
export type { ColorName } from './colors';
export type { StylePreset } from './preset';
export type { ThemeDefinition } from './theme';
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
  context?: Record<string, any>;

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
   * The name of the theme to apply to logger output.
   * If undefined, uses the default theme.
   *
   * @example 'dark'
   */
  theme?: string;
}

/**
 * Supported log levels for structured logging.
 * Additional custom levels are allowed unless strictLevels is true.
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success' | string; // Custom levels (e.g. 'trace', 'audit') unless strictLevels is enforced

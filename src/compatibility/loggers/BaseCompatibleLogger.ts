// File: src/compatibility/loggers/BaseCompatibleLogger.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from '../../Logger';
import type { LoggerOptions, LogLevel } from '../../types';
import { Transport } from '../../transports/base/Transport';
import type { ExtendedLoggerOptions } from '../../Logger';

/**
 * Base options for compatibility logger implementations.
 * Extends LoggerOptions with compatibility-specific configuration.
 *
 * @interface LogCompatibilityOptions
 * @extends {LoggerOptions}
 */
export interface LogCompatibilityOptions extends LoggerOptions {
  /** Logger name for identification. @default 'app' */
  name?: string;

  /** Array of transports to use for logging */
  transports?: Transport[];

  /** Output format type. @default 'plain' */
  format?: 'json' | 'plain' | 'custom';

  /** Whether to enforce strict level checking. @default false */
  strictLevels?: boolean;

  /** Custom formatter function for log entries */
  formatter?: (entry: any) => string;

  /** Whether to write logs to disk. @default false */
  writeToDisk?: boolean;

  /** Directory for log files. @default './logs' */
  logDir?: string;

  /** Number of days to retain log files. @default 30 */
  logRetentionDays?: number;

  /** Array of tags for categorizing log entries */
  tags?: string[];

  /** Additional context data for log entries */
  context?: Record<string, unknown>;
}

/**
 * Abstract base class for logger compatibility layers.
 * Provides common functionality for Winston, Bunyan, and Pino compatibility implementations.
 *
 * Features:
 * - Shared configuration management
 * - Common method implementations
 * - Underlying MagicLogger instance management
 * - Transport management
 * - Metadata enhancement
 * - Child logger support
 *
 * @abstract
 * @class BaseCompatibleLogger
 *
 * @example
 * ```typescript
 * class MyCompatibleLogger extends BaseCompatibleLogger {
 *   public info(message: string): void {
 *     this.logger.info(message);
 *   }
 *   // ... implement other abstract methods
 * }
 * ```
 */
export abstract class BaseCompatibleLogger {
  /** Underlying MagicLogger instance */
  protected logger: Logger;

  /** Logger name identifier */
  protected name: string;

  /** Output format type */
  protected format: 'json' | 'plain' | 'custom';

  /** Custom formatter function */
  protected formatter?: (entry: any) => string;

  /** Verbose mode flag */
  protected _verbose: boolean;

  /** Whether to use colors in output */
  protected useColors: boolean;

  /** Whether to write logs to disk */
  protected writeToDisk: boolean;

  /** Log directory path */
  protected logDir: string;

  /** Log retention period in days */
  protected logRetentionDays: number;

  /** Whether to enforce strict level checking */
  protected strictLevels: boolean;

  /** Array of tags for categorizing log entries */
  protected tags: string[];

  /** Additional context data for log entries */
  protected context: Record<string, unknown>;

  /** Storage for child logger references */
  protected children: WeakMap<object, BaseCompatibleLogger> = new WeakMap();

  /**
   * Creates a new BaseCompatibleLogger instance.
   *
   * @constructor
   * @param {LogCompatibilityOptions} [options={}] - Logger configuration options
   */
  constructor(options: LogCompatibilityOptions = {}) {
    this.name = options.name !== undefined ? options.name : 'app';
    this.format = options.format || 'plain';
    this.formatter = options.formatter;
    this._verbose = options.verbose || false;
    this.useColors = options.useColors !== false;
    this.writeToDisk = options.writeToDisk || false;
    this.logDir = options.logDir || './logs';
    this.logRetentionDays = options.logRetentionDays || 30;
    this.strictLevels = options.strictLevels || false;
    this.tags = options.tags || [];
    this.context = options.context || {};

    const loggerOptions: ExtendedLoggerOptions = {
      ...options,
      verbose: this._verbose,
      useColors: this.useColors,
      transports: options.transports || [],
    };

    this.logger = new Logger(loggerOptions);

    if (this.writeToDisk) {
      this.logger.setFileLogging(true);
      this.logger.setLogDir(this.logDir);
      this.logger.setLogRetentionDays(this.logRetentionDays);
    }
  }

  /**
   * Gets the logger name.
   *
   * @public
   * @returns {string} Logger name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Sets the logger name.
   *
   * @public
   * @param {string} name - New logger name
   */
  public setName(name: string): void {
    this.name = name;
  }

  /**
   * Gets the current logger configuration.
   *
   * @protected
   * @returns {LogCompatibilityOptions} Current configuration object
   */
  protected getConfig(): LogCompatibilityOptions {
    return {
      name: this.name,
      format: this.format,
      formatter: this.formatter,
      verbose: this._verbose,
      useColors: this.useColors,
      writeToDisk: this.writeToDisk,
      logDir: this.logDir,
      logRetentionDays: this.logRetentionDays,
      strictLevels: this.strictLevels,
    };
  }

  /**
   * Sets verbose mode.
   *
   * @public
   * @param {boolean} enabled - Whether to enable verbose mode
   */
  public setVerbose(enabled: boolean): void {
    this._verbose = enabled;
    this.logger.setVerbose(enabled);
  }

  /**
   * Checks if verbose mode is enabled.
   *
   * @public
   * @returns {boolean} True if verbose mode is enabled
   */
  public isVerbose(): boolean {
    return this._verbose;
  }

  /**
   * Enables or disables color output.
   *
   * @public
   * @param {boolean} enabled - Whether to enable colors
   */
  public setColors(enabled: boolean): void {
    this.useColors = enabled;
    this.logger.setColorsEnabled(enabled);
  }

  /**
   * Checks if colors are enabled.
   *
   * @public
   * @returns {boolean} True if colors are enabled
   */
  public hasColors(): boolean {
    return this.useColors;
  }

  /**
   * Sets the output format.
   *
   * @public
   * @param {'json' | 'plain' | 'custom'} format - Output format type
   */
  public setFormat(format: 'json' | 'plain' | 'custom'): void {
    this.format = format;
  }

  /**
   * Gets the current output format.
   *
   * @public
   * @returns {string} Current output format
   */
  public getFormat(): string {
    return this.format;
  }

  /**
   * Safely serializes an object to JSON, handling circular references.
   *
   * @protected
   * @param {any} obj - Object to serialize
   * @returns {string} JSON string or error message
   */
  protected safeSerialize(obj: any): string {
    try {
      return JSON.stringify(obj, this.getCircularReplacer());
    } catch (error) {
      return `[Unable to serialize: ${error}]`;
    }
  }

  /**
   * Creates a replacer function for JSON.stringify that handles circular references.
   *
   * @private
   * @returns {(key: string, value: any) => any} Replacer function
   */
  private getCircularReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }

  /**
   * Formats a log entry based on the configured format.
   *
   * @protected
   * @param {any} entry - Log entry to format
   * @returns {string} Formatted entry string
   */
  protected formatEntry(entry: any): string {
    switch (this.format) {
      case 'json':
        return this.safeSerialize(entry);

      case 'custom':
        if (this.formatter) {
          try {
            return this.formatter(entry);
          } catch (error) {
            // Fall through to plain format on error
          }
        }
        // If no formatter or formatter failed, use plain format
        return this.formatAsPlain(entry);

      case 'plain':
      default:
        return this.formatAsPlain(entry);
    }
  }

  /**
   * Format entry as plain text.
   * @private
   */
  private formatAsPlain(entry: unknown): string {
    if (typeof entry === 'string') {
      return entry;
    }
    if (typeof entry === 'object' && entry && 'message' in entry) {
      return String((entry as { message: unknown }).message);
    }
    return this.safeSerialize(entry);
  }

  /**
   * Adds a transport to the underlying logger.
   *
   * @public
   * @param {Transport} transport - Transport to add
   * @returns {Promise<void>} Promise that resolves when transport is added
   */
  public async addTransport(transport: Transport): Promise<void> {
    await this.logger.addTransport(transport);
  }

  /**
   * Removes a transport from the underlying logger.
   *
   * @public
   * @param {string} name - Name of the transport to remove
   * @returns {Promise<void>} Promise that resolves when transport is removed
   */
  public async removeTransport(name: string): Promise<void> {
    await this.logger.removeTransport(name);
  }

  /**
   * Clears all transports from the underlying logger.
   *
   * @public
   */
  public clearTransports(): void {
    const transportNames = this.logger.listTransports();
    transportNames.forEach(name => {
      this.logger.removeTransport(name);
    });
  }

  /**
   * Gets all configured transports.
   *
   * @public
   * @returns {Transport[]} Array of transport instances
   */
  public getTransports(): Transport[] {
    const transportNames = this.logger.listTransports();
    return transportNames
      .map(name => this.logger.getTransport(name))
      .filter((transport): transport is Transport => transport !== undefined) as Transport[];
  }

  /**
   * Flushes all transports.
   * Since the Logger class doesn't have a direct flush method,
   * this provides a no-op implementation that can be overridden.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when flush completes
   */
  public async flush(): Promise<void> {
    // No-op implementation since Logger doesn't expose flush
    // This maintains compatibility with tests expecting this method
    return Promise.resolve();
  }

  /**
   * Closes the logger and all transports.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when logger is closed
   */
  public async close(): Promise<void> {
    return this.logger.close();
  }

  /**
   * Pauses logging (compatibility method).
   * Note: The underlying Logger doesn't support pausing.
   *
   * @public
   */
  public pause(): void {
    console.warn('pause() is not implemented in the underlying Logger');
  }

  /**
   * Resumes logging (compatibility method).
   * Note: The underlying Logger doesn't support resuming.
   *
   * @public
   */
  public resume(): void {
    console.warn('resume() is not implemented in the underlying Logger');
  }

  /**
   * Checks if logger is paused.
   * Note: Always returns false as pausing is not supported.
   *
   * @public
   * @returns {boolean} Always returns false
   */
  public isPaused(): boolean {
    return false;
  }

  /**
   * Gets the underlying MagicLogger instance.
   *
   * @public
   * @returns {Logger} MagicLogger instance
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Enhances metadata with timestamp and logger name.
   *
   * @protected
   * @param {any} meta - Original metadata
   * @returns {any} Enhanced metadata with additional fields
   */
  protected enhanceMetadata(meta: any): any {
    const enhanced = { ...meta };

    if (!enhanced.timestamp) {
      enhanced.timestamp = new Date().toISOString();
    }

    if (!enhanced.logger && this.name) {
      enhanced.logger = this.name;
    }

    return enhanced;
  }

  /**
   * Validates if a log level is valid.
   *
   * @protected
   * @param {string} level - Level to validate
   * @returns {boolean} True if level is valid
   */
  protected isValidLevel(level: string): boolean {
    if (!level || typeof level !== 'string') return false;
    const validLevels = ['debug', 'info', 'warn', 'error', 'success'];
    return validLevels.includes(level.toLowerCase());
  }

  /**
   * Normalizes level aliases to standard level names.
   *
   * @protected
   * @param {string} level - Level to normalize
   * @returns {LogLevel} Normalized level name
   *
   * @example
   * normalizeLevel('warning') // returns 'warn'
   * normalizeLevel('err') // returns 'error'
   * normalizeLevel('log') // returns 'info'
   */
  protected normalizeLevel(level: string): LogLevel {
    const normalized = level.toLowerCase();

    switch (normalized) {
      case 'warning':
        return 'warn';
      case 'err':
        return 'error';
      case 'log':
        return 'info';
      default:
        return normalized as LogLevel;
    }
  }

  /**
   * Logs an info-level message.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {...any[]} args - Log arguments
   */
  public abstract info(...args: any[]): void;

  /**
   * Logs a warning-level message.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {...any[]} args - Log arguments
   */
  public abstract warn(...args: any[]): void;

  /**
   * Logs an error-level message.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {...any[]} args - Log arguments
   */
  public abstract error(...args: any[]): void;

  /**
   * Logs a debug-level message.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {...any[]} args - Log arguments
   */
  public abstract debug(...args: any[]): void;

  /**
   * Generic log method with level specification.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {string} level - Log level
   * @param {...any[]} args - Log arguments
   */
  public abstract log(level: string, ...args: any[]): void;

  /**
   * Creates a child logger with additional context.
   * Must be implemented by subclasses.
   *
   * @abstract
   * @public
   * @param {any} options - Child logger options
   * @returns {BaseCompatibleLogger} Child logger instance
   */
  public abstract child(options: any): BaseCompatibleLogger;
}

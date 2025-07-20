// File: src/compatibility/BaseCompatibleLogger.ts

import { Logger } from '../Logger';
import type { LoggerOptions, LogLevel, Transport } from '../types';

/**
 * Base options for compatibility loggers.
 * 
 * @interface LogCompatibilityOptions
 * @extends {LoggerOptions}
 */
export interface LogCompatibilityOptions extends LoggerOptions {
  /**
   * Logger name for identification.
   */
  name?: string;

  /**
   * Array of transports to use for logging.
   */
  transports?: Transport[];

  /**
   * Format type for output.
   * @default 'plain'
   */
  format?: 'json' | 'plain' | 'custom';

  /**
   * Whether to use strict level checking.
   * @default false
   */
  strictLevels?: boolean;

  /**
   * Custom formatter function.
   */
  formatter?: (entry: any) => string;

  /**
   * Write logs to disk.
   * @default false
   */
  writeToDisk?: boolean;

  /**
   * Log directory for file output.
   * @default './logs'
   */
  logDir?: string;

  /**
   * Log retention in days.
   * @default 30
   */
  logRetentionDays?: number;
}

/**
 * Abstract base class for logger compatibility layers.
 * 
 * This class provides common functionality for Winston, Bunyan, and Pino
 * compatibility implementations:
 * - Shared configuration management
 * - Common method implementations
 * - Underlying MagicLogger instance management
 * - Shared utilities
 * 
 * @abstract
 * @class BaseCompatibleLogger
 * 
 * @example
 * ```typescript
 * class CustomCompatibleLogger extends BaseCompatibleLogger {
 *   public info(message: string): void {
 *     this.logger.info(message);
 *   }
 * }
 * ```
 */
export abstract class BaseCompatibleLogger {
  /**
   * Underlying MagicLogger instance.
   * @protected
   */
  protected logger: Logger;

  /**
   * Logger name.
   * @protected
   */
  protected name: string;

  /**
   * Output format.
   * @protected
   */
  protected format: 'json' | 'plain' | 'custom';

  /**
   * Custom formatter function.
   * @protected
   */
  protected formatter?: (entry: any) => string;

  /**
   * Whether verbose mode is enabled.
   * @protected
   */
  protected _verbose: boolean;

  /**
   * Whether to use colors.
   * @protected
   */
  protected useColors: boolean;

  /**
   * Whether to write logs to disk.
   * @protected
   */
  protected writeToDisk: boolean;

  /**
   * Log directory path.
   * @protected
   */
  protected logDir: string;

  /**
   * Log retention period.
   * @protected
   */
  protected logRetentionDays: number;

  /**
   * Whether to use strict level checking.
   * @protected
   */
  protected strictLevels: boolean;

  /**
   * Storage for child logger references.
   * @protected
   */
  protected children: WeakMap<object, BaseCompatibleLogger> = new WeakMap();

  /**
   * Creates a new BaseCompatibleLogger instance.
   * 
   * @param {LogCompatibilityOptions} options - Logger options
   */
  constructor(options: LogCompatibilityOptions = {}) {
    // Extract compatibility-specific options
    this.name = options.name || 'app';
    this.format = options.format || 'plain';
    this.formatter = options.formatter;
    this._verbose = options.verbose || false;
    this.useColors = options.useColors !== false;
    this.writeToDisk = options.writeToDisk || false;
    this.logDir = options.logDir || './logs';
    this.logRetentionDays = options.logRetentionDays || 30;
    this.strictLevels = options.strictLevels || false;

    // Create underlying logger with appropriate options
    const loggerOptions: LoggerOptions = {
      ...options,
      verbose: this._verbose,
      useColors: this.useColors,
    };

    // Create the logger with transports if provided
    this.logger = new Logger({
      ...loggerOptions,
      transports: options.transports || [],
    });

    // Add file transport if writeToDisk is enabled
    if (this.writeToDisk) {
      // Note: This would need to be implemented based on your transport system
      // For now, we'll use the file logging capability of the base logger
      this.logger.setFileLogging(true);
      this.logger.setLogDir(this.logDir);
      this.logger.setLogRetentionDays(this.logRetentionDays);
    }
  }

  /**
   * Get the logger name.
   * 
   * @returns {string} Logger name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Set the logger name.
   * 
   * @param {string} name - New logger name
   */
  public setName(name: string): void {
    this.name = name;
  }

  /**
   * Get current configuration.
   * 
   * @returns {LogCompatibilityOptions} Current options
   * @protected
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
   * Set verbose mode.
   * 
   * @param {boolean} enabled - Whether to enable verbose mode
   */
  public setVerbose(enabled: boolean): void {
    this._verbose = enabled;
    this.logger.setVerbose(enabled);
  }

  /**
   * Check if verbose mode is enabled.
   * 
   * @returns {boolean} Whether verbose is enabled
   */
  public isVerbose(): boolean {
    return this._verbose;
  }

  /**
   * Enable or disable colors.
   * 
   * @param {boolean} enabled - Whether to enable colors
   */
  public setColors(enabled: boolean): void {
    this.useColors = enabled;
    this.logger.setColorsEnabled(enabled);
  }

  /**
   * Check if colors are enabled.
   * 
   * @returns {boolean} Whether colors are enabled
   */
  public hasColors(): boolean {
    return this.useColors;
  }

  /**
   * Set output format.
   * 
   * @param {string} format - Output format
   */
  public setFormat(format: 'json' | 'plain' | 'custom'): void {
    this.format = format;
  }

  /**
   * Get output format.
   * 
   * @returns {string} Output format
   */
  public getFormat(): string {
    return this.format;
  }

  /**
   * Safely serialize an object.
   * 
   * @param {any} obj - Object to serialize
   * @returns {string} Serialized string
   * @protected
   */
  protected safeSerialize(obj: any): string {
    try {
      return JSON.stringify(obj, this.getCircularReplacer());
    } catch (error) {
      return `[Unable to serialize: ${error}]`;
    }
  }

  /**
   * Get a replacer function for handling circular references.
   * 
   * @returns {Function} Replacer function
   * @private
   */
  private getCircularReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();
    return (key: string, value: any) => {
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
   * Format a log entry based on format setting.
   * 
   * @param {any} entry - Log entry
   * @returns {string} Formatted entry
   * @protected
   */
  protected formatEntry(entry: any): string {
    switch (this.format) {
      case 'json':
        return this.safeSerialize(entry);
      
      case 'custom':
        if (this.formatter) {
          return this.formatter(entry);
        }
        // Fall through to plain if no formatter
      
      case 'plain':
      default:
        if (typeof entry === 'string') {
          return entry;
        }
        if (typeof entry === 'object' && entry.message) {
          return entry.message;
        }
        return this.safeSerialize(entry);
    }
  }

  /**
   * Add a transport to the underlying logger.
   * 
   * @param {Transport} transport - Transport configuration
   */
  public addTransport(transport: Transport): void {
    this.logger.addTransport(transport);
  }

  /**
   * Remove a transport from the underlying logger.
   * 
   * @param {string} name - Transport name
   */
  public removeTransport(name: string): void {
    this.logger.removeTransport(name);
  }

  /**
   * Clear all transports.
   */
  public clearTransports(): void {
    // Get all transport names and remove them
    const transportNames = this.logger.listTransports();
    transportNames.forEach(name => {
      this.logger.removeTransport(name);
    });
  }

  /**
   * Get all transports.
   * 
   * @returns {Transport[]} Transport configurations
   */
  public getTransports(): Transport[] {
    // Get transport names and retrieve each transport
    const transportNames = this.logger.listTransports();
    return transportNames
      .map(name => this.logger.getTransport(name))
      .filter((transport): transport is Transport => transport !== undefined);
  }

  /**
   * Flush all transports.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async flush(): Promise<void> {
    // Use the async logger's flush method if available
    if (this.logger.async && this.logger.async.flushAndWait) {
      return this.logger.async.flushAndWait();
    }
    
    // Fallback: close and reopen to ensure flush
    // This is a workaround since the Logger class doesn't expose a direct flush method
    return Promise.resolve();
  }

  /**
   * Close the logger and all transports.
   * 
   * @returns {Promise<void>} Resolves when closed
   */
  public async close(): Promise<void> {
    return this.logger.close();
  }

  /**
   * Pause logging.
   * Note: This is a compatibility method. The underlying Logger may not support pausing.
   */
  public pause(): void {
    // The Logger class doesn't have pause/resume methods exposed
    // This is a compatibility method that doesn't do anything
    // In a real implementation, you might want to add this functionality to the Logger class
    console.warn('pause() is not implemented in the underlying Logger');
  }

  /**
   * Resume logging.
   * Note: This is a compatibility method. The underlying Logger may not support resuming.
   */
  public resume(): void {
    // The Logger class doesn't have pause/resume methods exposed
    // This is a compatibility method that doesn't do anything
    console.warn('resume() is not implemented in the underlying Logger');
  }

  /**
   * Check if logger is paused.
   * Note: This is a compatibility method. The underlying Logger may not support pause state.
   * 
   * @returns {boolean} Whether paused (always false for now)
   */
  public isPaused(): boolean {
    // The Logger class doesn't have pause/resume methods exposed
    // This is a compatibility method that always returns false
    return false;
  }

  /**
   * Get underlying MagicLogger instance.
   * 
   * @returns {Logger} MagicLogger instance
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Common metadata enhancement.
   * 
   * @param {any} meta - Original metadata
   * @returns {any} Enhanced metadata
   * @protected
   */
  protected enhanceMetadata(meta: any): any {
    const enhanced = { ...meta };

    // Add timestamp if not present
    if (!enhanced.timestamp) {
      enhanced.timestamp = new Date().toISOString();
    }

    // Add logger name
    if (!enhanced.logger && this.name) {
      enhanced.logger = this.name;
    }

    return enhanced;
  }

  /**
   * Validate log level.
   * 
   * @param {string} level - Level to validate
   * @returns {boolean} Whether level is valid
   * @protected
   */
  protected isValidLevel(level: string): boolean {
    const validLevels = ['debug', 'info', 'warn', 'error', 'success'];
    return validLevels.includes(level.toLowerCase());
  }

  /**
   * Normalize log level name.
   * 
   * @param {string} level - Level to normalize
   * @returns {LogLevel} Normalized level
   * @protected
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

  // Abstract methods that must be implemented by subclasses

  /**
   * Log an info message.
   * @abstract
   */
  public abstract info(...args: any[]): void;

  /**
   * Log a warning message.
   * @abstract
   */
  public abstract warn(...args: any[]): void;

  /**
   * Log an error message.
   * @abstract
   */
  public abstract error(...args: any[]): void;

  /**
   * Log a debug message.
   * @abstract
   */
  public abstract debug(...args: any[]): void;

  /**
   * Generic log method.
   * @abstract
   */
  public abstract log(level: string, ...args: any[]): void;

  /**
   * Create a child logger.
   * @abstract
   */
  public abstract child(options: any): BaseCompatibleLogger;
}
// File: src/Logger.ts

import { NodeLogger } from './core/NodeLogger';
import { BrowserLogger } from './core/BrowserLogger';
import { ContextManager } from './core/ContextManager';
import { TagManager } from './core/TagManager';
import { TransportManager } from './transports/base/TransportManager';
import { ConsoleTransport } from './transports/base/implementations/ConsoleTransport';
import { FileTransport } from './transports/base/implementations/FileTransport';
import { AsyncLogger } from './core/AsyncLogger';
import type { 
  LoggerOptions, 
  LogLevel, 
  StylePreset, 
  ColorName,
  Transport,
  LogEntry,
  IdGenerator,
  AsyncOptions
} from './types';
import type { LoggerBase } from './core/LoggerBase';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { FileManager } from './core/FileManager';
import { IS_PATH_REGEX } from './constants/paths';

/**
 * Extended logger options that include transport and async configuration.
 * 
 * @interface ExtendedLoggerOptions
 * @extends {LoggerOptions}
 */
export interface ExtendedLoggerOptions extends LoggerOptions {
  /**
   * Array of transports to use for logging.
   * If not provided, defaults to console transport.
   */
  transports?: Transport[];

  /**
   * Whether to use legacy console/file output in addition to transports.
   * @default false
   */
  useLegacyOutput?: boolean;

  /**
   * Custom ID generator for log entries.
   * @default () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
   */
  idGenerator?: IdGenerator;

  /**
   * Enable advanced context management features.
   * @default true
   */
  enableContextManager?: boolean;

  /**
   * Enable advanced tag management features.
   * @default true
   */
  enableTagManager?: boolean;

  /**
   * Async logging configuration.
   * Enables high-performance async logging with ring buffer.
   */
  async?: AsyncOptions;
}

/**
 * Main Logger class that integrates the transport system and async logging.
 * 
 * This class automatically detects whether it's running in a Node.js or Browser environment
 * and instantiates the appropriate logger (NodeLogger or BrowserLogger) accordingly.
 * It manages transports for flexible log delivery and provides both sync and async APIs.
 * 
 * @class Logger
 * 
 * @example
 * ```typescript
 * // Create logger with multiple transports
 * const logger = new Logger({
 *   transports: [
 *     new ConsoleTransport({ level: 'debug' }),
 *     new FileTransport({ filepath: './app.log' }),
 *     new S3Transport({ bucket: 'my-logs' })
 *   ],
 *   async: {
 *     enabled: true,
 *     buffer: { size: 10000 }
 *   }
 * });
 * 
 * // Sync logging
 * logger.info('Application started');
 * 
 * // Async logging - two ways
 * logger.async.info('High frequency log');
 * logger.info('Another log', { async: true });
 * ```
 */
export class Logger {
  /**
   * Legacy logger instance for backward compatibility.
   * @private
   */
  private loggerInstance: NodeLogger | BrowserLogger;

  /**
   * Transport manager for handling multiple transports.
   * @private
   */
  private transportManager: TransportManager;

  /**
   * Context manager for advanced context operations.
   * @private
   */
  private contextManager?: ContextManager;

  /**
   * Tag manager for advanced tag operations.
   * @private
   */
  private tagManager?: TagManager;

  /**
   * Logger configuration.
   * @private
   */
  private readonly options: ExtendedLoggerOptions;

  /**
   * ID generator function.
   * @private
   */
  private readonly idGenerator: IdGenerator;

  /**
   * Whether to use legacy output methods.
   * @private
   */
  private readonly useLegacyOutput: boolean;

  /**
   * Async logger instance for high-performance logging.
   * @private
   */
  private asyncLogger?: AsyncLogger;

  /**
   * Public async logging interface.
   * Provides async methods that use ring buffer for zero-allocation logging.
   * 
   * @readonly
   */
  public readonly async: {
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
    success: (message: string, meta?: any) => void;
    log: (message: string, level?: LogLevel, meta?: any) => void;
    flush: () => void;
    flushAndWait: () => Promise<void>;
    getStats: () => any;
  };

  /**
   * Create a new logger instance with transport and async support.
   *
   * @param {ExtendedLoggerOptions} options - Logger configuration options
   */
  constructor(options: ExtendedLoggerOptions = {}) {
    this.options = options;
    this.useLegacyOutput = options.useLegacyOutput ?? false;
    this.idGenerator = options.idGenerator ?? this.defaultIdGenerator;

    // Initialize context and tag managers if enabled
    if (options.enableContextManager !== false) {
      this.contextManager = new ContextManager();
    }
    
    if (options.enableTagManager !== false) {
      this.tagManager = new TagManager();
    }

    // Initialize legacy logger instance
    if (typeof window !== 'undefined') {
      this.loggerInstance = new BrowserLogger(options);
    } else {
      this.loggerInstance = new NodeLogger(options);
    }

    // Initialize transport manager
    this.transportManager = new TransportManager({
      defaultTimeout: 30000,
      errorHandler: (error, transport, _entry) => {
        // Log transport errors to console
        console.error(`[Transport Error - ${transport.name}]:`, error.message);
      },
    });

    // Initialize transports
    this.initializeTransports();

    // Initialize async logger if enabled
    if (options.async?.enabled) {
      this.asyncLogger = new AsyncLogger(
        {
          buffer: options.async.buffer,
          useWorkers: options.async.useWorkers,
          workerPath: options.async.workerPath,
          onFlush: (entries) => this.flushAsyncEntries(entries),
        },
        this.createLogEntry.bind(this)
      );
    }

    // Create async interface
    this.async = {
      info: (message: string, meta?: any) => this.logAsync('info', message, meta),
      warn: (message: string, meta?: any) => this.logAsync('warn', message, meta),
      error: (message: string, meta?: any) => this.logAsync('error', message, meta),
      debug: (message: string, meta?: any) => this.logAsync('debug', message, meta),
      success: (message: string, meta?: any) => this.logAsync('success', message, meta),
      log: (message: string, level: LogLevel = 'info', meta?: any) => this.logAsync(level, message, meta),
      flush: () => this.asyncLogger?.flush(),
      flushAndWait: () => this.asyncLogger?.flushAndWait() || Promise.resolve(),
      getStats: () => this.asyncLogger?.getStats() || {},
    };
  }

  /**
   * Initialize default transports or use provided ones.
   * 
   * @private
   */
  private initializeTransports(): void {
    if (this.options.transports && this.options.transports.length > 0) {
      // Use provided transports
      this.options.transports.forEach(transport => {
        this.addTransport(transport);
      });
    } else if (!this.useLegacyOutput) {
      // Create default transports based on options
      const defaultTransports = this.createDefaultTransports();
      defaultTransports.forEach(transport => {
        this.addTransport(transport);
      });
    }
  }

  /**
   * Create default transports based on logger options.
   * 
   * @returns {Transport[]} Array of default transports
   * @private
   */
  private createDefaultTransports(): Transport[] {
    const transports: Transport[] = [];

    // Always add console transport
    transports.push(new ConsoleTransport({
      name: 'default-console',
      enabled: true,
      level: this.options.verbose ? 'debug' : 'info',
      useColors: this.options.useColors ?? true,
    }));

    // Add file transport if writeToDisk is enabled
    if (this.options.writeToDisk && typeof window === 'undefined') {
      transports.push(new FileTransport({
        name: 'default-file',
        enabled: true,
        level: this.options.verbose ? 'debug' : 'info',
        filepath: this.options.logDir || './logs',
        isDirectory: true,
        retentionDays: this.options.logRetentionDays,
      }));
    }

    return transports;
  }

  /**
   * Default ID generator for log entries.
   * 
   * @returns {string} Unique ID
   * @private
   */
  private defaultIdGenerator(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create a log entry from a message and metadata.
   * 
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} [meta] - Additional metadata
   * @returns {LogEntry} Complete log entry
   * @private
   */
  private createLogEntry(level: LogLevel, message: string, meta?: any): LogEntry {
    const now = new Date();
    
    // Extract error if present
    let error: LogEntry['error'];
    let context = meta;

    if (meta instanceof Error) {
      error = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
      context = undefined;
    } else if (meta?.error instanceof Error) {
      error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      context = { ...meta };
      delete context.error;
    }

    // Merge contexts using ContextManager if available
    let finalContext: Record<string, any> | undefined;
    if (this.contextManager) {
      finalContext = this.contextManager.merge(
        this.options.context,
        context
      );
    } else {
      finalContext = context || this.options.context;
    }

    // Process tags using TagManager if available
    let finalTags: string[] | undefined;
    if (this.tagManager && this.options.tags) {
      finalTags = this.tagManager.normalize(this.options.tags);
    } else {
      finalTags = this.options.tags;
    }

    // Create log entry
    const entry: LogEntry = {
      id: this.idGenerator(),
      timestamp: now.toISOString(),
      timestampMs: now.getTime(),
      level,
      message,
      plainMessage: this.stripAnsiCodes(message),
      loggerId: this.options.id,
      tags: finalTags,
      context: finalContext,
      error,
      metadata: this.getMetadata(),
    };

    return entry;
  }

  /**
   * Get environment metadata.
   * 
   * @returns {Record<string, any>} Metadata object
   * @private
   */
  private getMetadata(): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (typeof window !== 'undefined') {
      // Browser metadata
      metadata.userAgent = navigator.userAgent;
      metadata.platform = navigator.platform;
    } else {
      // Node.js metadata
      metadata.hostname = os.hostname();
      metadata.pid = process.pid;
      metadata.platform = process.platform;
      metadata.nodeVersion = process.version;
    }

    return metadata;
  }

  /**
   * Strip ANSI codes from a string.
   * 
   * @param {string} str - String with potential ANSI codes
   * @returns {string} String without ANSI codes
   * @private
   */
  private stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Log a message asynchronously using the ring buffer.
   * 
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {any} [meta] - Additional metadata
   * @private
   */
  private logAsync(level: LogLevel, message: string, meta?: any): void {
    if (!this.asyncLogger) {
      // Fallback to sync logging if async not enabled
      this.log(message, level, meta);
      return;
    }

    this.asyncLogger.log(message, level, meta);
  }

  /**
   * Process async log entries when buffer is flushed.
   * 
   * @param {LogEntry[]} entries - Log entries to process
   * @returns {Promise<void>} Resolves when entries are processed
   * @private
   */
  private async flushAsyncEntries(entries: LogEntry[]): Promise<void> {
    // Send to transports in batches
    if (this.transportManager) {
      try {
        await Promise.all(
          entries.map(entry => this.transportManager.log(entry))
        );
      } catch (error) {
        console.error('[Logger] Failed to flush async logs:', error);
      }
    }
  }

  /**
   * Log a message at a specified level.
   * Supports both sync and async logging via meta.async flag.
   *
   * @param {string} msg - The message to log
   * @param {LogLevel} level - Log level (default: 'info')
   * @param {any} [meta] - Additional metadata or error
   */
  public log(msg: string, level: LogLevel = 'info', meta?: any): void {
    // Check for async flag in meta
    if (meta?.async === true && this.asyncLogger) {
      // Remove async flag from meta
      const { async: _, ...cleanMeta } = meta;
      this.logAsync(level, msg, cleanMeta);
      return;
    }

    // Create log entry
    const entry = this.createLogEntry(level, msg, meta);

    // Send to transports
    if (this.transportManager) {
      this.transportManager.log(entry).catch(error => {
        console.error('[Logger] Failed to log to transports:', error);
      });
    }

    // Use legacy output if enabled
    if (this.useLegacyOutput || this.transportManager.list().length === 0) {
      this.loggerInstance.log(msg, level);
    }
  }

  /**
   * Log an info-level message.
   * 
   * @param {string} msg - Info message
   * @param {any} [meta] - Additional metadata
   */
  public info(msg: string, meta?: any): void {
    this.log(msg, 'info', meta);
  }

  /**
   * Log a success message.
   *
   * @param {string} msg - Success message
   * @param {any} [meta] - Additional metadata
   */
  public success(msg: string, meta?: any): void {
    this.log(msg, 'success', meta);
  }

  /**
   * Log a warning message.
   *
   * @param {string} msg - Warning message
   * @param {any} [meta] - Additional metadata
   */
  public warn(msg: string, meta?: any): void {
    this.log(msg, 'warn', meta);
  }

  /**
   * Log an error message.
   *
   * @param {string} msg - Error message
   * @param {any} [meta] - Additional metadata or error object
   */
  public error(msg: string, meta?: any): void {
    this.log(msg, 'error', meta);
  }

  /**
   * Log a debug message (only shown when verbose is true).
   *
   * @param {string} msg - Debug message
   * @param {any} [meta] - Additional metadata
   */
  public debug(msg: string, meta?: any): void {
    this.log(msg, 'debug', meta);
  }

  /**
   * Get the context manager instance.
   * 
   * @returns {ContextManager | undefined} Context manager if enabled
   */
  public getContextManager(): ContextManager | undefined {
    return this.contextManager;
  }

  /**
   * Get the tag manager instance.
   * 
   * @returns {TagManager | undefined} Tag manager if enabled
   */
  public getTagManager(): TagManager | undefined {
    return this.tagManager;
  }

  /**
   * Add tags to a log entry using TagManager.
   * 
   * @param {string} msg - Log message
   * @param {LogLevel} level - Log level
   * @param {any} [meta] - Additional metadata
   * @param {string[]} [additionalTags] - Additional tags for this log entry
   */
  public logWithTags(msg: string, level: LogLevel = 'info', meta?: any, additionalTags?: string[]): void {
    // Temporarily merge additional tags
    const originalTags = this.options.tags;
    
    if (additionalTags && this.tagManager) {
      this.options.tags = this.tagManager.merge(originalTags || [], additionalTags);
    }

    this.log(msg, level, meta);

    // Restore original tags
    this.options.tags = originalTags;
  }

  /**
   * Log with enhanced context using ContextManager.
   * 
   * @param {string} msg - Log message
   * @param {LogLevel} level - Log level
   * @param {Record<string, any>} [context] - Context to merge
   * @param {any} [meta] - Additional metadata
   */
  public logWithContext(msg: string, level: LogLevel = 'info', context?: Record<string, any>, meta?: any): void {
    let enhancedMeta = meta;

    if (context && this.contextManager) {
      // Merge the provided context with any existing meta context
      const existingContext = (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) ? meta : {};
      enhancedMeta = this.contextManager.merge(existingContext, context);
    }

    this.log(msg, level, enhancedMeta);
  }

  /**
   * Add a transport to the logger.
   * 
   * @param {Transport} transport - Transport to add
   * @param {number} [priority=0] - Transport priority
   * @returns {Promise<void>} Resolves when transport is added
   */
  public async addTransport(transport: Transport, priority = 0): Promise<void> {
    await this.transportManager.add(transport, priority);
  }

  /**
   * Remove a transport by name.
   * 
   * @param {string} name - Transport name
   * @returns {Promise<void>} Resolves when transport is removed
   */
  public async removeTransport(name: string): Promise<void> {
    await this.transportManager.remove(name);
  }

  /**
   * Get a transport by name.
   * 
   * @param {string} name - Transport name
   * @returns {Transport | undefined} The transport if found
   */
  public getTransport(name: string): Transport | undefined {
    return this.transportManager.get(name);
  }

  /**
   * List all transport names.
   * 
   * @returns {string[]} Array of transport names
   */
  public listTransports(): string[] {
    return this.transportManager.list();
  }

  /**
   * Get statistics for all transports.
   * 
   * @returns {Record<string, any>} Transport statistics
   */
  public getTransportStats(): Record<string, any> {
    return this.transportManager.getStats();
  }

  /**
   * Close the logger and all transports.
   * 
   * @returns {Promise<void>} Resolves when closed
   */
  public async close(): Promise<void> {
    // Close async logger first
    if (this.asyncLogger) {
      await this.asyncLogger.close();
    }

    await this.transportManager.close();
    
    // Close legacy logger if it has a close method
    if (typeof (this.loggerInstance as any).close === 'function') {
      await (this.loggerInstance as any).close();
    }
  }

  // Legacy methods for backward compatibility

  /**
   * Log a custom message with custom colors (legacy).
   *
   * @param {string} msg - The message to log
   * @param {ColorName[]} colors - Array of color/style names
   * @param {string} prefix - The prefix to use
   */
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.custom(msg, colors, prefix);
    }
    
    // Convert to standard log - use 'info' as fallback
    const lowerPrefix = prefix.toLowerCase();
    const validLevels: LogLevel[] = ['info', 'success', 'warn', 'error', 'debug'];
    const level = validLevels.includes(lowerPrefix as LogLevel) ? lowerPrefix as LogLevel : 'info';
    this.log(msg, level);
  }

  /**
   * Log a message with a preset style (legacy).
   *
   * @param {string} msg - The message to log
   * @param {StylePreset} preset - The preset style to apply
   */
  public styled(msg: string, preset: StylePreset): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.styled(msg, preset);
    }
    
    // Convert preset to level if possible
    const levelMap: Record<StylePreset, LogLevel> = {
      'info': 'info',
      'success': 'success',
      'warning': 'warn',
      'error': 'error',
      'debug': 'debug',
      'important': 'warn',
      'highlight': 'info',
      'muted': 'debug',
      'special': 'info',
      'code': 'debug',
      'header': 'info',
    };
    
    this.log(msg, levelMap[preset] || 'info');
  }

  /**
   * Print a section header (legacy).
   *
   * @param {string} title - The header title
   * @param {ColorName[]} colors - Optional custom colors
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.header(title, colors);
    } else {
      // Just use console for visual elements
      this.loggerInstance.header(title, colors);
    }
  }

  /**
   * Print a table from an array of objects (legacy).
   *
   * @param {Record<string, any>[]} data - Array of objects to display
   * @param {ColorName[]} headerColor - Optional color for the header row
   */
  public table(data: Record<string, any>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.table(data, headerColor);
    } else {
      // Just use console for visual elements
      this.loggerInstance.table(data, headerColor);
    }
  }

  /**
   * Print a progress bar (legacy).
   *
   * @param {number} progress - Current progress (0-100)
   * @param {number} length - Length of the progress bar
   * @param {string} completeChar - Character for completed portion
   * @param {string} incompleteChar - Character for incomplete portion
   */
  public progressBar(progress: number, length = 20, completeChar = '█', incompleteChar = '░'): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.progressBar(progress, length, completeChar, incompleteChar);
    } else {
      // Just use console for visual elements
      this.loggerInstance.progressBar(progress, length, completeChar, incompleteChar);
    }
  }

  /**
   * Log a clickable link (legacy).
   *
   * @param {string} url - The URL or file path to link
   * @param {string} [description] - Optional description text
   */
  public link(url: string, description?: string): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.link(url, description);
    } else {
      this.info(`${description || url}: ${url}`);
    }
  }

  /**
   * Create a reusable color function (legacy).
   *
   * @param {...ColorName[]} colors - Array of color/style names
   * @returns {Function} Color function
   */
  public color(...colors: ColorName[]): (text: string) => string {
    return this.loggerInstance.color(...colors);
  }

  /**
   * Apply different colors to specific parts of a message (legacy).
   *
   * @param {string} message - The full message
   * @param {Record<string, ColorName[]>} colorMap - Object mapping text parts to color arrays
   * @returns {string} The message with colors applied
   */
  public colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    return this.loggerInstance.colorParts(message, colorMap);
  }

  /**
   * Set verbose mode.
   *
   * @param {boolean} enabled - Whether to enable verbose mode
   */
  public setVerbose(enabled: boolean): void {
    this.loggerInstance.setVerbose(enabled);
    
    // Update transports
    this.transportManager.list().forEach(name => {
      const transport = this.transportManager.get(name);
      if (transport && 'level' in transport) {
        (transport as any).level = enabled ? 'debug' : 'info';
      }
    });
  }

  /**
   * Enable or disable color output.
   *
   * @param {boolean} enabled - Whether to enable colors
   */
  public setColorsEnabled(enabled: boolean): void {
    this.loggerInstance.setColorsEnabled(enabled);
  }

  /**
   * Get the current theme.
   */
  public get theme(): Record<string, ColorName[]> {
    return (this.loggerInstance as LoggerBase)['theme'];
  }

  /**
   * Set or replace the theme.
   *
   * @param {Record<string, unknown>} theme - The theme definition
   */
  public setTheme(theme: Record<string, unknown>): void {
    const validated: Record<string, ColorName[]> = {};

    for (const [key, value] of Object.entries(theme)) {
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
        validated[key] = value as ColorName[];
      }
    }
    (this.loggerInstance as LoggerBase).setTheme(validated);
  }

  // File-related methods (Node.js only)

  /**
   * Gets the current log file path.
   * @returns {string | null} The log file path or null
   */
  public getPath(): string | null {
    if (this.loggerInstance instanceof NodeLogger) {
      return (this.loggerInstance as any).fileManager?.getLogFile() || null;
    }
    return null;
  }

  /**
   * Gets the current log directory.
   * @returns {string} The configured log directory
   */
  public getLogDir(): string {
    if (this.loggerInstance instanceof NodeLogger) {
      return (this.loggerInstance as any).fileManager?.getLogDir() || 'logs';
    }
    return 'logs';
  }

  /**
   * Sets the log directory.
   * @param {string} dir - New log directory path
   * @param {boolean} reinitialize - Whether to reinitialize the log file
   */
  public setLogDir(dir: string, reinitialize = false): void {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as any;
      if (!nodeLogger.fileManager) {
        nodeLogger.fileManager = new FileManager(dir, nodeLogger.logRetentionDays);
      } else {
        nodeLogger.fileManager.setLogDir(dir);
      }

      if (reinitialize && nodeLogger.writeToDisk) {
        nodeLogger.fileManager.initLogFile();
      }
    }
  }

  /**
   * Gets the log retention period in days.
   * @returns {number} Number of days to retain logs
   */
  public getLogRetentionDays(): number {
    if (this.loggerInstance instanceof NodeLogger) {
      return (this.loggerInstance as any).fileManager?.getLogRetentionDays() || 30;
    }
    return 30;
  }

  /**
   * Sets the log retention period in days.
   * @param {number} days - Number of days to retain logs
   * @param {boolean} cleanNow - Whether to clean old logs immediately
   */
  public setLogRetentionDays(days: number, cleanNow = false): void {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as any;
      const safeDays = Math.max(1, days || 1);

      if (!nodeLogger.fileManager) return;

      nodeLogger.fileManager.setLogRetentionDays(safeDays);

      if (cleanNow) {
        nodeLogger.fileManager.cleanupOldLogs();
      }
    }
  }

  /**
   * Enables or disables file logging.
   * @param {boolean} enabled - Whether to enable file logging
   */
  public setFileLogging(enabled: boolean): void {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as any;
      nodeLogger.writeToDisk = enabled;

      if (enabled) {
        if (!nodeLogger.fileManager) {
          nodeLogger.fileManager = new FileManager(
            nodeLogger.logDir || 'logs',
            nodeLogger.logRetentionDays || 30
          );
        }

        nodeLogger.fileManager.initLogFile().catch((err: Error): void => {
          console.error('Failed to initialize log file:', err);
          nodeLogger.writeToDisk = false;
        });
      }
    }
  }

  // Browser storage methods

  /**
   * Gets all stored logs (browser only).
   * @returns {string[] | null} Array of log entries or null
   */
  public getLogs(): string[] | null {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      return (this.loggerInstance as BrowserLogger).getLogs();
    }
    return null;
  }

  /**
   * Clears all stored logs (browser only).
   */
  public clearLogs(): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).clearLogs();
    }
  }

  /**
   * Downloads stored logs as a text file (browser only).
   * @param {string} filename - The filename to use
   */
  public downloadLogs(filename = 'logs.txt'): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).downloadLogs(filename);
    }
  }

  /**
   * Enable or disable browser storage (browser only).
   * @param {boolean} enabled - Whether to enable browser storage
   */
  public setStorageEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).setStorageEnabled(enabled);
    }
  }

  // Static utility methods

  /**
   * Normalize path to use forward slashes.
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path
   */
  public static normalizePath(pathStr: string): string {
    if (!pathStr) return pathStr;
    return pathStr.replace(/\\/g, '/');
  }

  /**
   * Normalize line endings to LF.
   * @param {string} text - Text to normalize
   * @returns {string} Text with normalized line endings
   */
  public static normalizeLineEndings(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\r\n/g, '\n');
  }

  /**
   * Check if a string looks like a URL or file path.
   * @param {string} text - Text to check
   * @returns {boolean} Whether text is link-like
   */
  public static isLinkLike(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return IS_PATH_REGEX.test(text);
  }

  /**
   * Utility to clean up a directory.
   * @param {string} dir - Directory to clean
   */
  public static cleanupDirectory(dir: string): void {
    try {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          Logger.cleanupDirectory(fullPath);
          fs.rmdirSync(fullPath);
        } else {
          fs.unlinkSync(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error cleaning directory ${dir}:`, err);
    }
  }
}

// Re-export types
export type { 
  LoggerOptions, 
  LogLevel, 
  StylePreset, 
  ColorName,
  Transport,
  TransportOptions,
  LogEntry 
} from './types';
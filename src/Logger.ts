// File: src/Logger.ts

import { NodeLogger } from './core/NodeLogger';
import { BrowserLogger } from './core/BrowserLogger';
import { TransportManager } from './transports/base/TransportManager';
import { ConsoleTransport } from './transports/base/implementations/ConsoleTransport';
import { FileTransport } from './transports/base/implementations/FileTransport';
import { Transport } from './transports/base/Transport';
import type { 
  LoggerOptions, 
  LogLevel, 
  StylePreset, 
  ColorName,
  LogEntry
} from './types';
import type { LoggerBase } from './core/LoggerBase';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { FileManager } from './core/FileManager';
import { IS_PATH_REGEX } from './constants/paths';

/**
 * ID generator function type.
 */
export type IdGenerator = () => string;

/**
 * Extended logger instance with optional close method.
 */
interface ExtendedLoggerInstance {
  close?: () => Promise<void>;
}

/**
 * Extended node logger instance for file operations.
 */
interface ExtendedNodeLogger extends ExtendedLoggerInstance {
  fileManager?: FileManager;
  writeToDisk?: boolean;
  logDir?: string;
  logRetentionDays?: number;
}

/**
 * Metadata for log entries.
 */
export type LogMetadata = Record<string, unknown>;

/**
 * Log entry metadata including error or additional context.
 */
export type LogEntryMeta = LogMetadata | Error | { error?: Error; [key: string]: unknown };

/**
 * Extended logger options that include transport configuration.
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
   * @default () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
   */
  idGenerator?: IdGenerator;
}

/**
 * Main Logger class that integrates the transport system.
 * 
 * This class automatically detects whether it's running in a Node.js or Browser environment
 * and instantiates the appropriate logger (NodeLogger or BrowserLogger) accordingly.
 * It also manages transports for flexible log delivery to various destinations.
 * 
 * @example
 * ```typescript
 * // Create logger with multiple transports
 * const logger = new Logger({
 *   transports: [
 *     new ConsoleTransport({ level: 'debug' }),
 *     new FileTransport({ filepath: './app.log' }),
 *     new S3Transport({ bucket: 'my-logs' })
 *   ]
 * });
 * 
 * // Log messages are sent to all transports
 * logger.info('Application started');
 * logger.error('Database connection failed', { error: err });
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
   * Create a new logger instance with transport support.
   *
   * @param {ExtendedLoggerOptions} options - Logger configuration options
   */
  constructor(options: ExtendedLoggerOptions = {}) {
    this.options = options;
    this.useLegacyOutput = options.useLegacyOutput ?? false;
    this.idGenerator = options.idGenerator ?? this.defaultIdGenerator;

    // Initialize legacy logger instance
    if (typeof window !== 'undefined') {
      this.loggerInstance = new BrowserLogger(options);
    } else {
      this.loggerInstance = new NodeLogger(options);
    }

    // Initialize transport manager
    this.transportManager = new TransportManager();

    // Initialize transports
    this.initializeTransports();
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
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a log entry from a message and metadata.
   * 
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {LogEntryMeta} [meta] - Additional metadata
   * @returns {LogEntry} Complete log entry
   * @private
   */
  private createLogEntry(level: LogLevel, message: string, meta?: LogEntryMeta): LogEntry {
    const now = new Date();
    
    // Extract error if present
    let error: LogEntry['error'];
    let context: Record<string, unknown> | undefined;

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
    } else {
      context = meta as Record<string, unknown> | undefined;
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
      tags: this.options.tags,
      context: context || this.options.context,
      error,
      metadata: this.getMetadata(),
    };

    return entry;
  }

  /**
   * Get environment metadata.
   * 
   * @returns {LogMetadata} Metadata object
   * @private
   */
  private getMetadata(): LogMetadata {
    const metadata: LogMetadata = {};

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
   * Log a message at a specified level.
   *
   * @param {string} msg - The message to log
   * @param {LogLevel} level - Log level (default: 'info')
   * @param {LogEntryMeta} [meta] - Additional metadata or error
   */
  public log(msg: string, level: LogLevel = 'info', meta?: LogEntryMeta): void {
    // Create log entry
    const entry = this.createLogEntry(level, msg, meta);

    // Send to transports
    if (this.transportManager) {
      this.transportManager.log(entry).catch(error => {
        console.error('[Logger] Failed to log to transports:', error);
      });
    }

    // Use legacy output if enabled
    if (this.useLegacyOutput || this.transportManager.getTransportNames().length === 0) {
      this.loggerInstance.log(msg, level);
    }
  }

  /**
   * Log an info-level message.
   * 
   * @param {string} msg - Info message
   * @param {LogEntryMeta} [meta] - Additional metadata
   */
  public info(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'info', meta);
  }

  /**
   * Log a success message.
   *
   * @param {string} msg - Success message
   * @param {LogEntryMeta} [meta] - Additional metadata
   */
  public success(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'success', meta);
  }

  /**
   * Log a warning message.
   *
   * @param {string} msg - Warning message
   * @param {LogEntryMeta} [meta] - Additional metadata
   */
  public warn(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'warn', meta);
  }

  /**
   * Log an error message.
   *
   * @param {string} msg - Error message
   * @param {LogEntryMeta} [meta] - Additional metadata or error object
   */
  public error(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'error', meta);
  }

  /**
   * Log a debug message (only shown when verbose is true).
   *
   * @param {string} msg - Debug message
   * @param {LogEntryMeta} [meta] - Additional metadata
   */
  public debug(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'debug', meta);
  }

  /**
   * Add a transport to the logger.
   * 
   * @param {Transport} transport - Transport to add
   * @returns {Promise<void>} Resolves when transport is added
   */
  public async addTransport(transport: Transport): Promise<void> {
    await this.transportManager.registerTransport(transport);
  }

  /**
   * Remove a transport by name.
   * 
   * @param {string} name - Transport name
   * @returns {Promise<void>} Resolves when transport is removed
   */
  public async removeTransport(name: string): Promise<void> {
    await this.transportManager.removeTransport(name);
  }

  /**
   * Get a transport by name.
   * 
   * @param {string} name - Transport name
   * @returns {Transport | undefined} The transport if found
   */
  public getTransport(name: string): Transport | undefined {
    return this.transportManager.getTransport(name);
  }

  /**
   * List all transport names.
   * 
   * @returns {string[]} Array of transport names
   */
  public listTransports(): string[] {
    return this.transportManager.getTransportNames();
  }

  /**
   * Get statistics for all transports.
   * 
   * @returns {Record<string, unknown>} Transport statistics
   */
  public getTransportStats(): Record<string, unknown> {
    return this.transportManager.getStats();
  }

  /**
   * Close the logger and all transports.
   * 
   * @returns {Promise<void>} Resolves when closed
   */
  public async close(): Promise<void> {
    await this.transportManager.close();
    
    // Close legacy logger if it has a close method
    const extendedLogger = this.loggerInstance as ExtendedLoggerInstance;
    if (typeof extendedLogger.close === 'function') {
      await extendedLogger.close();
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
    
    // Convert to standard log
    this.log(msg, prefix.toLowerCase());
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
   * @param {Record<string, unknown>[]} data - Array of objects to display
   * @param {ColorName[]} headerColor - Optional color for the header row
   */
  public table(data: Record<string, unknown>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
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
    this.transportManager.getTransportNames().forEach((name: string) => {
      const transport = this.transportManager.getTransport(name);
      if (transport && 'level' in transport) {
        const transportWithLevel = transport as unknown as { level: string };
        transportWithLevel.level = enabled ? 'debug' : 'info';
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
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      return nodeLogger.fileManager?.getLogFile() || null;
    }
    return null;
  }

  /**
   * Gets the current log directory.
   * @returns {string} The configured log directory
   */
  public getLogDir(): string {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      return nodeLogger.fileManager?.getLogDir() || 'logs';
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
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      if (!nodeLogger.fileManager) {
        nodeLogger.fileManager = new FileManager(dir, nodeLogger.logRetentionDays || 30) as ExtendedNodeLogger['fileManager'];
      } else {
        nodeLogger.fileManager.setLogDir(dir);
      }

      if (reinitialize && nodeLogger.writeToDisk && nodeLogger.fileManager) {
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
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      return nodeLogger.fileManager?.getLogRetentionDays() || 30;
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
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
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
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      nodeLogger.writeToDisk = enabled;

      if (enabled) {
        if (!nodeLogger.fileManager) {
          nodeLogger.fileManager = new FileManager(
            nodeLogger.logDir || 'logs',
            nodeLogger.logRetentionDays || 30
          ) as ExtendedNodeLogger['fileManager'];
        }

        if (nodeLogger.fileManager) {
          nodeLogger.fileManager.initLogFile().catch((err: Error): void => {
            console.error('Failed to initialize log file:', err);
            nodeLogger.writeToDisk = false;
          });
        }
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
  public static normalizePath(path: string): string {
    if (!path) return path;
    return path.replace(/\\/g, '/');
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
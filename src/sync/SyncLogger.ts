// File: src/sync/SyncLogger.ts

/**
 * @fileoverview True synchronous logger implementation.
 * 
 * This logger provides BLOCKING, immediate output with guaranteed delivery.
 * All operations complete before the method returns - no buffering, no async.
 * 
 * Use Cases:
 * - Security auditing where every log must be written immediately
 * - Debugging where you need to see logs instantly
 * - CLI tools where output order matters
 * - Crash scenarios where buffered logs might be lost
 * 
 * Trade-offs:
 * - Lower performance due to blocking I/O
 * - Can cause application pauses during disk writes
 * - Not suitable for high-throughput scenarios
 * 
 * @module sync/SyncLogger
 */

import { TransportManager } from '../transports/base/TransportManager';
import type { Transport } from '../types/transport';
import { Colorizer } from '../core/Colorizer';
import { Formatter } from '../core/Formatter';
import { StyleBuilder } from '../core/StyleBuilder';
import { TemplateParser } from '../parsers/TemplateParser';
import { TextStyler } from '../utils/TextStyler';
import type { LoggerOptions, LogLevel } from '../types/logger';
import type { StylePreset } from '../types/preset';
import type { ColorName } from '../types/colors';
import type { LogEntry } from '../types/transport';
import type { StyledPart, WordStyleMap, TemplateFormatter, IStyleBuilder } from '../types/styling';
import { IS_PATH_REGEX } from '../constants/paths';
import { META_WRAPPER, type MetaArg } from '../utils/meta';
import { ThemeManager } from '../theme/ThemeManager';
import type { ThemeDefinition } from '../types/theme';

// Node.js imports for synchronous file operations
let fs: typeof import('fs') | undefined;
let path: typeof import('path') | undefined;
let os: typeof import('os') | undefined;

if (typeof process !== 'undefined' && typeof require !== 'undefined') {
  try {
    fs = require('fs');
    path = require('path');
    os = require('os');
  } catch {
    // Ignore in browser environments
  }
}

type LogEntryMeta = Record<string, unknown>;

/**
 * True synchronous logger with blocking I/O for guaranteed delivery.
 * 
 * All operations are synchronous and blocking. Methods do not return until
 * the log has been written to all outputs (console, file, custom handlers).
 * This guarantees delivery but at the cost of blocking your application.
 * 
 * @class SyncLogger
 * @public
 * 
 * @remarks
 * Use SyncLogger when you need:
 * - Guaranteed log delivery (security auditing)
 * - Exact log ordering (debugging race conditions)
 * - Immediate visibility (development/debugging)
 * - Crash resilience (logs written before crash)
 * 
 * Trade-offs:
 * - Lower performance (~70k ops/sec vs 250k+ for async)
 * - Blocks application execution during I/O
 * - Can cause noticeable pauses with slow disks
 * - Not suitable for high-throughput scenarios
 * 
 * @example Basic synchronous logging
 * ```typescript
 * import { SyncLogger } from 'magiclogger';
 * 
 * const logger = new SyncLogger();
 * logger.info('Step 1');  // Blocks until written to console
 * logger.info('Step 2');  // Only runs after Step 1 is written
 * console.log('Done');    // Only runs after all logs are written
 * ```
 * 
 * @example Security audit logging with guaranteed disk writes
 * ```typescript
 * const auditLogger = new SyncLogger({
 *   file: './audit.log',    // Synchronous file writes
 *   forceFlush: true,       // fsync after each write
 *   useConsole: false       // Disable console for security
 * });
 * 
 * auditLogger.info('User login', { userId: 123 });
 * // Log is guaranteed on disk before next line executes
 * // If system crashes here, log is already persisted
 * ```
 * 
 * @example Development debugging with immediate output
 * ```typescript
 * const debug = new SyncLogger({ 
 *   useColors: true,
 *   verbose: true 
 * });
 * 
 * debug.info('Before API call');
 * const result = await apiCall();  // If this hangs...
 * debug.info('After API call');    // You already saw the first log
 * ```
 */
export class SyncLogger {
  private readonly options: LoggerOptions;
  private readonly colorizer: Colorizer;
  private readonly formatter: Formatter;
  private readonly styleBuilder: StyleBuilder;
  private readonly templateParser: TemplateParser;
  private readonly textStyler: TextStyler;
  private readonly themeManager: ThemeManager;
  private fileDescriptor?: number;
  private readonly filePath?: string;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      useColors: options.useColors ?? true,
      useConsole: options.useConsole ?? true,
      verbose: options.verbose ?? false,
      ...options
    };

    // Initialize styling components
    this.colorizer = new Colorizer();
    this.formatter = new Formatter();
    this.styleBuilder = new StyleBuilder();
    this.templateParser = new TemplateParser(this.styleBuilder);
    this.textStyler = new TextStyler(this.colorizer);
    this.themeManager = new ThemeManager();

    // Setup file output if requested
    if (options.file && fs) {
      this.filePath = options.file;
      try {
        // Open file synchronously for append
        this.fileDescriptor = fs.openSync(this.filePath, 'a');
      } catch (error) {
        console.error(`[SyncLogger] Failed to open log file: ${this.filePath}`, error);
      }
    }

    // Apply theme if provided
    if (options.theme) {
      this.themeManager.loadTheme(options.theme);
    }
  }

  /**
   * Core synchronous logging method that blocks until written.
   * 
   * @private
   * @param {string} message - The message to log
   * @param {LogLevel} level - Severity level of the log
   * @param {LogEntryMeta} [meta] - Optional structured metadata
   * 
   * @remarks
   * Execution order:
   * 1. Parse styling (angle brackets)
   * 2. Write to console (if enabled) - blocks
   * 3. Write to file (if configured) - blocks with fsync
   * 4. Call custom handler (if provided) - blocks
   * 
   * All operations complete before method returns.
   */
  private logSync(message: string, level: LogLevel = 'info', meta?: LogEntryMeta): void {
    // Parse angle bracket syntax
    if (message && message.includes('<')) {
      message = this.parseBrackets(message);
    }

    // Create timestamp
    const timestamp = new Date().toISOString();
    const timestampMs = Date.now();

    // Format message for console
    const levelColor = this.getLevelColor(level);
    const levelPrefix = this.options.useColors 
      ? this.colorizer.colorize(`[${level.toUpperCase()}]`, levelColor)
      : `[${level.toUpperCase()}]`;
    
    const consoleMessage = `${timestamp} ${levelPrefix} ${message}`;

    // Write to console synchronously
    if (this.options.useConsole) {
      switch (level) {
        case 'error':
          console.error(consoleMessage);
          break;
        case 'warn':
          console.warn(consoleMessage);
          break;
        case 'debug':
          if (this.options.verbose) {
            console.debug(consoleMessage);
          }
          break;
        default:
          console.log(consoleMessage);
      }
    }

    // Write to file synchronously
    if (this.fileDescriptor && fs) {
      const logEntry = {
        timestamp,
        timestampMs,
        level,
        message,
        plainMessage: this.stripAnsi(message),
        meta,
        pid: process?.pid,
        hostname: os?.hostname()
      };

      const line = JSON.stringify(logEntry) + '\n';
      
      try {
        // Synchronous write - blocks until complete
        fs.writeSync(this.fileDescriptor, line);
        
        // Force flush to disk (fsync)
        if (this.options.forceFlush !== false) {
          fs.fsyncSync(this.fileDescriptor);
        }
      } catch (error) {
        console.error('[SyncLogger] Failed to write to log file:', error);
      }
    }

    // Call custom sync handler if provided
    if (this.options.onLog) {
      try {
        this.options.onLog({
          id: `${timestampMs}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          timestampMs,
          level,
          message,
          plainMessage: this.stripAnsi(message),
          context: meta
        });
      } catch (error) {
        console.error('[SyncLogger] Custom handler error:', error);
      }
    }
  }

  /**
   * Parse angle bracket syntax for styling
   */
  private parseBrackets(text: string): string {
    return text.replace(/<([^>]+)>([^<]*)<\/>/g, (match, style, content) => {
      if (!this.options.useColors) return content;
      
      const styles = style.split('.');
      let result = content;
      
      for (const s of styles) {
        if (this.colorizer.isValidColor(s as ColorName)) {
          result = this.colorizer.colorize(result, s as ColorName);
        }
      }
      
      return result;
    });
  }

  /**
   * Strip ANSI codes from text
   */
  private stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: LogLevel): ColorName {
    const colors: Record<LogLevel, ColorName> = {
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      success: 'green',
      debug: 'gray',
      trace: 'gray',
      fatal: 'red',
      verbose: 'blue',
      silly: 'magenta'
    };
    return colors[level] || 'white';
  }

  // ==========================================
  // PUBLIC LOGGING METHODS - ALL SYNCHRONOUS
  // ==========================================

  /**
   * Logs an info-level message synchronously.
   * 
   * @public
   * @param {string} message - The message to log
   * @param {LogEntryMeta} [meta] - Optional metadata object
   * 
   * @remarks
   * Blocks until the message is written to all outputs.
   * Use for general informational messages.
   * 
   * @example
   * ```typescript
   * logger.info('Server started', { port: 3000 });
   * // Execution pauses here until log is written
   * ```
   */
  public info(message: string, meta?: LogEntryMeta): void {
    this.logSync(message, 'info', meta);
  }

  /**
   * Logs an error-level message synchronously with optional Error object.
   * 
   * @public
   * @param {string} message - The error message
   * @param {Error | LogEntryMeta} [error] - Error object or metadata
   * @param {LogEntryMeta} [meta] - Additional metadata if error is an Error
   * 
   * @remarks
   * Blocks until written. Automatically extracts stack traces from Error objects.
   * Critical for debugging as the error is guaranteed to be logged before continuing.
   * 
   * @example
   * ```typescript
   * try {
   *   dangerousOperation();
   * } catch (err) {
   *   logger.error('Operation failed', err);
   *   // Error is guaranteed logged before cleanup
   * }
   * ```
   */
  public error(message: string, error?: Error | LogEntryMeta, meta?: LogEntryMeta): void {
    if (error instanceof Error) {
      const errorMeta = {
        ...meta,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };
      this.logSync(message, 'error', errorMeta);
    } else {
      this.logSync(message, 'error', error || meta);
    }
  }

  /**
   * Logs a warning-level message synchronously.
   * 
   * @public
   * @param {string} message - The warning message
   * @param {LogEntryMeta} [meta] - Optional metadata
   * 
   * @remarks
   * Blocks until written. Use for potentially problematic situations
   * that don't prevent operation but should be addressed.
   * 
   * @example
   * ```typescript
   * if (cacheSize > threshold) {
   *   logger.warn('Cache size exceeding threshold', { 
   *     size: cacheSize, 
   *     threshold 
   *   });
   *   // Warning guaranteed logged before continuing
   * }
   * ```
   */
  public warn(message: string, meta?: LogEntryMeta): void {
    this.logSync(message, 'warn', meta);
  }

  /**
   * Log debug message (blocking)
   */
  public debug(message: string, meta?: LogEntryMeta): void {
    this.logSync(message, 'debug', meta);
  }

  /**
   * Log success message (blocking)
   */
  public success(message: string, meta?: LogEntryMeta): void {
    this.logSync(message, 'success', meta);
  }

  /**
   * Generic log method (blocking)
   */
  public log(message: string, level: LogLevel = 'info', meta?: LogEntryMeta): void {
    this.logSync(message, level, meta);
  }

  /**
   * Closes file handles and performs cleanup.
   * 
   * @public
   * 
   * @remarks
   * Always call this when done logging to:
   * - Close file descriptors
   * - Flush any pending writes
   * - Free system resources
   * 
   * @example
   * ```typescript
   * const logger = new SyncLogger({ file: './app.log' });
   * try {
   *   logger.info('Processing');
   * } finally {
   *   logger.close();  // Always cleanup
   * }
   * ```
   */
  public close(): void {
    if (this.fileDescriptor && fs) {
      try {
        fs.closeSync(this.fileDescriptor);
        this.fileDescriptor = undefined;
      } catch (error) {
        console.error('[SyncLogger] Failed to close log file:', error);
      }
    }
  }

  /**
   * Forces an fsync to ensure all data is written to disk.
   * 
   * @public
   * 
   * @remarks
   * Usually not needed as SyncLogger flushes after each write by default.
   * Use this if you disabled forceFlush in options but need to ensure
   * a critical log is persisted.
   * 
   * @example
   * ```typescript
   * const logger = new SyncLogger({ 
   *   file: './app.log',
   *   forceFlush: false  // Disabled for performance
   * });
   * 
   * logger.info('Normal log');  // May be buffered by OS
   * logger.error('Critical error');
   * logger.flush();  // Force critical error to disk
   * ```
   */
  public flush(): void {
    if (this.fileDescriptor && fs) {
      try {
        fs.fsyncSync(this.fileDescriptor);
      } catch (error) {
        console.error('[SyncLogger] Failed to flush log file:', error);
      }
    }
  }

  // ==========================================
  // STYLING API (same as Logger)
  // ==========================================

  /**
   * Chainable style builder
   */
  public get s(): IStyleBuilder {
    return this.styleBuilder;
  }

  /**
   * Template literal styling
   */
  public fmt(strings: TemplateStringsArray, ...values: unknown[]): string {
    return this.templateParser.parse(strings, ...values);
  }

  /**
   * Visual elements
   */
  public header(text: string, styles?: ColorName[]): void {
    const width = 60;
    const separator = '='.repeat(width);
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    const centeredText = ' '.repeat(padding) + text;
    
    let output = `\n${separator}\n${centeredText}\n${separator}`;
    
    if (styles && this.options.useColors) {
      for (const style of styles) {
        output = this.colorizer.colorize(output, style);
      }
    }
    
    console.log(output);
  }

  public separator(char: string = '-', length: number = 60): void {
    console.log(char.repeat(length));
  }

  public progressBar(percentage: number, width: number = 40, fillChar: string = '█', emptyChar: string = '░'): void {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);
    const output = `[${bar}] ${percentage}%`;
    console.log(output);
  }
}

/**
 * Type guard to check if a logger is synchronous
 */
export function isSyncLogger(logger: unknown): logger is SyncLogger {
  return logger instanceof SyncLogger;
}

/**
 * Create a synchronous logger instance
 */
export function createSyncLogger(options: LoggerOptions = {}): SyncLogger {
  return new SyncLogger(options);
}
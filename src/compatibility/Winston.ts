// File: src/compatibility/Winston.ts

import { BaseCompatibleLogger } from './BaseCompatibleLogger';
import type { LoggerOptions, Transport, ColorName } from '../types';

/**
 * Winston-compatible logger options
 * @interface WinstonCompatibleOptions
 * @extends {LoggerOptions}
 */
export interface WinstonCompatibleOptions extends LoggerOptions {
  /**
   * Log level for the logger
   * @type {'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'}
   * @default 'info'
   */
  level?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
  
  /**
   * Custom levels configuration
   * @type {Record<string, number>}
   */
  levels?: Record<string, number>;
  
  /**
   * Whether to exit on error
   * @type {boolean}
   * @default true
   */
  exitOnError?: boolean;
  
  /**
   * Array of transports
   * @type {Transport[]}
   */
  transports?: Transport[];
  
  /**
   * Exception handlers
   * @type {Transport[]}
   */
  exceptionHandlers?: Transport[];
  
  /**
   * Rejection handlers
   * @type {Transport[]}
   */
  rejectionHandlers?: Transport[];
  
  /**
   * Silent mode - no output
   * @type {boolean}
   * @default false
   */
  silent?: boolean;
  
  /**
   * Enable printf-style formatting
   * @type {boolean}
   * @default false
   */
  printfFormatting?: boolean;
  
  /**
   * Default metadata for all logs
   * @type {Record<string, unknown>}
   */
  defaultMeta?: Record<string, unknown>;
  
  /**
   * Default context (alias for defaultMeta)
   * @type {Record<string, unknown>}
   */
  defaultContext?: Record<string, unknown>;
  
  /**
   * Whether to add timestamps to logs
   * @type {boolean}
   * @default false
   */
  timestamp?: boolean;
  
  /**
   * Exception handling configuration
   * @type {object}
   */
  exceptions?: {
    /**
     * Whether to handle exceptions
     * @type {boolean}
     */
    handle?: boolean;
    /**
     * Whether to humanize error output
     * @type {boolean}
     */
    humanizeErrors?: boolean;
  };
  
  /**
   * Rejection handling configuration
   * @type {object}
   */
  rejections?: {
    /**
     * Whether to handle rejections
     * @type {boolean}
     */
    handle?: boolean;
    /**
     * Whether to humanize error output
     * @type {boolean}
     */
    humanizeErrors?: boolean;
  };
}

/**
 * Timer object for profiling
 * @interface Timer
 */
interface Timer {
  /**
   * Timer name
   * @type {string}
   */
  name: string;
  /**
   * Start time
   * @type {number}
   */
  start: number;
  /**
   * Timer metadata
   * @type {Record<string, unknown>}
   */
  metadata?: Record<string, unknown>;
}

/**
 * Simple sprintf implementation for Winston compatibility
 * @param {string} format - Format string
 * @param {...unknown[]} args - Arguments to format
 * @returns {string} Formatted string
 */
function sprintf(format: string, ...args: unknown[]): string {
  let i = 0;
  return format.replace(/%[sdj%]/g, (match) => {
    if (match === '%%') return '%';
    if (i >= args.length) return match;
    
    const arg = args[i++];
    switch (match) {
      case '%s': return String(arg);
      case '%d': return Number(arg).toString();
      case '%j':
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Circular]';
        }
      default:
        return match;
    }
  });
}

/**
 * Winston-compatible logger implementation.
 * Provides full compatibility with the Winston logging library API.
 * 
 * @class WinstonCompatibleLogger
 * @extends {BaseCompatibleLogger}
 * 
 * @example
 * ```typescript
 * const logger = createWinstonCompatible({
 *   level: 'info',
 *   printfFormatting: true,
 *   defaultMeta: { service: 'user-service' }
 * });
 * 
 * logger.info('User %s logged in', userId);
 * logger.error('Failed to connect', { error: err });
 * logger.verbose('Debug information');
 * ```
 */
export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  /**
   * Current log level
   * @protected
   * @type {string}
   */
  protected level: string;
  
  /**
   * Level configuration
   * @protected
   * @type {Record<string, number>}
   */
  protected levels: Record<string, number>;
  
  /**
   * Exit on error flag
   * @protected
   * @type {boolean}
   */
  protected exitOnError: boolean;
  
  /**
   * Silent mode flag
   * @protected
   * @type {boolean}
   */
  protected silent: boolean;
  
  /**
   * Printf formatting flag
   * @protected
   * @type {boolean}
   */
  protected printfFormatting: boolean;
  
  /**
   * Default metadata
   * @protected
   * @type {Record<string, unknown>}
   */
  protected defaultMeta: Record<string, unknown>;
  
  /**
   * Active timers
   * @protected
   * @type {Map<string, Timer>}
   */
  protected timers: Map<string, Timer>;
  
  /**
   * Timestamp flag
   * @protected
   * @type {boolean}
   */
  protected timestamp: boolean;

  /**
   * Creates a new Winston-compatible logger
   * @constructor
   * @param {Partial<WinstonCompatibleOptions>} options - Logger options
   */
  constructor(options: Partial<WinstonCompatibleOptions> = {}) {
    // Extract format property before passing to base class
    const { timestamp, ...baseOptions } = options;
    super(baseOptions);
    
    this.level = options.level || 'info';
    this.levels = options.levels || {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    };
    this.exitOnError = options.exitOnError ?? true;
    this.silent = options.silent || false;
    this.printfFormatting = options.printfFormatting || false;
    this.defaultMeta = options.defaultMeta || options.defaultContext || {};
    this.timers = new Map();
    this.timestamp = timestamp ?? false;

    // Handle exception and rejection handlers
    if (options.exceptions?.handle || options.exceptionHandlers?.length) {
      this.setupExceptionHandlers(options.exceptionHandlers);
    }
    
    if (options.rejections?.handle || options.rejectionHandlers?.length) {
      this.setupRejectionHandlers(options.rejectionHandlers);
    }
  }

  /**
   * Winston's flexible log method
   * @public
   * @param {string} level - Log level
   * @param {string | Record<string, unknown>} message - Message or metadata object
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  log(level: string, message: string | Record<string, unknown>, ...args: unknown[]): void {
    if (this.silent || !this.isLevelEnabled(level)) {
      return;
    }

    let msg: string;
    let meta: Record<string, unknown> = { ...this.defaultMeta };

    // Handle different argument patterns
    if (typeof message === 'object' && message !== null) {
      // Object with message property
      const obj = message as Record<string, unknown>;
      msg = String(obj.message || '');
      meta = { ...meta, ...obj };
      delete meta.message;
    } else {
      msg = String(message);
      
      // Extract metadata from args
      args.forEach(arg => {
        if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
          Object.assign(meta, arg);
        }
      });
    }

    // Apply printf formatting if enabled
    if (this.printfFormatting && args.length > 0) {
      const formatArgs = args.filter(arg => 
        typeof arg !== 'object' || Array.isArray(arg)
      );
      if (formatArgs.length > 0) {
        msg = sprintf(msg, ...formatArgs);
      }
    }

    // Add timestamp if enabled
    if (this.timestamp) {
      msg = `[${new Date().toISOString()}] ${msg}`;
    }

    // Route to appropriate method
    this.routeToMethod(level, msg, meta);
  }

  /**
   * Route log to appropriate method based on level
   * @protected
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Record<string, unknown>} meta - Metadata
   * @returns {void}
   */
  protected routeToMethod(level: string, message: string, meta: Record<string, unknown>): void {
    switch (level) {
      case 'error':
        this.logger.error(message, meta);
        break;
      case 'warn':
        this.logger.warn(message, meta);
        break;
      case 'info':
        this.logger.info(message, meta);
        break;
      case 'http':
        this.logger.info(`HTTP: ${message}`, meta);
        break;
      case 'verbose':
        this.logger.debug(message, meta);
        break;
      case 'debug':
        this.logger.debug(message, meta);
        break;
      case 'silly':
        this.logger.debug(`SILLY: ${message}`, meta);
        break;
      default: {
        // Custom level
        const colors: ColorName[] = this.getColorsForLevel(level);
        this.logger.custom(message, colors, level.toUpperCase());
        break;
      }
    }
  }

  /**
   * Get colors for custom log level
   * @protected
   * @param {string} level - Log level
   * @returns {ColorName[]} Array of color names
   */
  protected getColorsForLevel(level: string): ColorName[] {
    const levelColors: Record<string, ColorName[]> = {
      emergency: ['red', 'bold', 'bgYellow'],
      alert: ['yellow', 'bold', 'bgRed'],
      critical: ['red', 'bold'],
      notice: ['white'],
      trace: ['gray'],
    };
    
    return levelColors[level] || ['white'];
  }

  /**
   * Check if a level is enabled
   * @protected
   * @param {string} level - Level to check
   * @returns {boolean} True if level is enabled
   */
  protected isLevelEnabled(level: string): boolean {
    const currentLevelValue = this.levels[this.level] ?? Infinity;
    const targetLevelValue = this.levels[level] ?? -1;
    return targetLevelValue <= currentLevelValue;
  }

  /**
   * Log error message
   * @public
   * @param {string | Error | Record<string, unknown>} message - Error message or object
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  error(message: string | Error | Record<string, unknown>, ...args: unknown[]): void {
    if (message instanceof Error) {
      this.log('error', message.message, { error: message, ...args[0] as Record<string, unknown> });
    } else {
      this.log('error', message as string, ...args);
    }
  }

  /**
   * Log warning message
   * @public
   * @param {string | Record<string, unknown>} message - Warning message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  warn(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('warn', message as string, ...args);
  }

  /**
   * Log info message
   * @public
   * @param {string | Record<string, unknown>} message - Info message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  info(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('info', message as string, ...args);
  }

  /**
   * Log HTTP message
   * @public
   * @param {string | Record<string, unknown>} message - HTTP message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  http(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('http', message as string, ...args);
  }

  /**
   * Log verbose message
   * @public
   * @param {string | Record<string, unknown>} message - Verbose message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  verbose(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('verbose', message as string, ...args);
  }

  /**
   * Log debug message
   * @public
   * @param {string | Record<string, unknown>} message - Debug message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  debug(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('debug', message as string, ...args);
  }

  /**
   * Log silly message
   * @public
   * @param {string | Record<string, unknown>} message - Silly message
   * @param {...unknown[]} args - Additional arguments
   * @returns {void}
   */
  silly(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('silly', message as string, ...args);
  }

  /**
   * Add header method for compatibility
   * @public
   * @param {string} title - Header title
   * @param {ColorName[]} colors - Optional colors
   * @returns {void}
   */
  header(title: string, colors?: ColorName[]): void {
    const headerColors = colors || ['brightWhite', 'bgBlue', 'bold'];
    this.logger.header(title, headerColors);
  }

  /**
   * Create a child logger with additional context
   * @public
   * @param {Partial<WinstonCompatibleOptions>} options - Child logger options
   * @returns {WinstonCompatibleLogger} New child logger instance
   */
  child(options: Partial<WinstonCompatibleOptions>): WinstonCompatibleLogger {
    const childOptions = {
      ...this.getOptions(),
      ...options,
      defaultMeta: {
        ...this.defaultMeta,
        ...(options.defaultMeta || {}),
        ...(options.defaultContext || {}),
      },
    };
    
    return new WinstonCompatibleLogger(childOptions);
  }

  /**
   * Start a timer for profiling
   * @public
   * @returns {{ done: (info?: { message?: string; [key: string]: unknown }) => void }} Timer object
   */
  startTimer(): { done: (info?: { message?: string; [key: string]: unknown }) => void } {
    const start = Date.now();
    
    return {
      done: (info?: { message?: string; [key: string]: unknown }) => {
        const duration = Date.now() - start;
        const message = info?.message || 'Timer';
        const meta = { ...info, duration };
        delete meta.message;
        
        this.info(`${message} (${duration}ms)`, meta);
      },
    };
  }

  /**
   * Profile a named operation
   * @public
   * @param {string} name - Profile name
   * @param {Record<string, unknown>} meta - Optional metadata
   * @returns {void}
   */
  profile(name: string, meta?: Record<string, unknown>): void {
    if (this.timers.has(name)) {
      // End profiling
      const timer = this.timers.get(name);
      if (timer) {
        const duration = Date.now() - timer.start;
        this.timers.delete(name);
        
        this.info(`Profiling '${name}' (${duration}ms)`, {
          ...timer.metadata,
          ...meta,
          duration,
        });
      }
    } else {
      // Start profiling
      this.timers.set(name, {
        name,
        start: Date.now(),
        metadata: meta,
      });
    }
  }

  /**
   * Query logs (not implemented - for API compatibility)
   * @public
   * @param {Record<string, unknown>} _options - Query options
   * @param {(err: Error | null, results: unknown) => void} callback - Callback function
   * @returns {void}
   */
  query(_options?: Record<string, unknown>, callback?: (err: Error | null, results: unknown) => void): void {
    const err = new Error('Query method not implemented in compatibility layer');
    if (callback) {
      callback(err, null);
    }
  }

  /**
   * Stream logs (not implemented - for API compatibility)
   * @public
   * @param {Record<string, unknown>} _options - Stream options
   * @returns {NodeJS.ReadableStream} Readable stream
   * @throws {Error} Not implemented
   */
  stream(_options?: Record<string, unknown>): NodeJS.ReadableStream {
    throw new Error('Stream method not implemented in compatibility layer');
  }

  /**
   * Clear all logs (no-op for compatibility)
   * @public
   * @returns {void}
   */
  clear(): void {
    // No-op for compatibility
  }

  /**
   * Setup exception handlers
   * @protected
   * @param {Transport[]} _handlers - Exception handlers
   * @returns {void}
   */
  protected setupExceptionHandlers(_handlers?: Transport[]): void {
    if (typeof process !== 'undefined' && process.on) {
      process.on('uncaughtException', (error: Error) => {
        this.error('Uncaught Exception', { error });
        if (this.exitOnError) {
          process.exit(1);
        }
      });
    }
  }

  /**
   * Setup rejection handlers
   * @protected
   * @param {Transport[]} _handlers - Rejection handlers
   * @returns {void}
   */
  protected setupRejectionHandlers(_handlers?: Transport[]): void {
    if (typeof process !== 'undefined' && process.on) {
      process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
        this.error('Unhandled Rejection', { reason, promise });
        if (this.exitOnError) {
          process.exit(1);
        }
      });
    }
  }

  /**
   * Get current logger options
   * @protected
   * @returns {Partial<WinstonCompatibleOptions>} Current options
   */
  protected getOptions(): Partial<WinstonCompatibleOptions> {
    return {
      level: this.level as WinstonCompatibleOptions['level'],
      levels: this.levels,
      exitOnError: this.exitOnError,
      silent: this.silent,
      printfFormatting: this.printfFormatting,
      defaultMeta: this.defaultMeta,
      verbose: this._verbose,
      useColors: this.useColors,
      timestamp: this.timestamp,
    };
  }

  /**
   * Configure the logger
   * @public
   * @param {Partial<WinstonCompatibleOptions>} options - Configuration options
   * @returns {void}
   */
  configure(options: Partial<WinstonCompatibleOptions>): void {
    if (options.level) this.level = options.level;
    if (options.levels) this.levels = options.levels;
    if (options.exitOnError !== undefined) this.exitOnError = options.exitOnError;
    if (options.silent !== undefined) this.silent = options.silent;
    if (options.printfFormatting !== undefined) this.printfFormatting = options.printfFormatting;
    if (options.defaultMeta) this.defaultMeta = { ...this.defaultMeta, ...options.defaultMeta };
    if (options.verbose !== undefined) this.setVerbose(options.verbose);
    if (options.useColors !== undefined) this.useColors = options.useColors;
    if (options.timestamp !== undefined) this.timestamp = options.timestamp;
  }

  /**
   * Add metadata to all future logs
   * @public
   * @param {string} target - Target (e.g., 'metadata')
   * @param {...unknown[]} args - Arguments
   * @returns {this} Logger instance for chaining
   */
  add(target: string, ...args: unknown[]): this {
    if (target === 'metadata' && args[0]) {
      this.defaultMeta = { ...this.defaultMeta, ...args[0] as Record<string, unknown> };
    }
    return this;
  }

  /**
   * Remove metadata
   * @public
   * @param {string} target - Target to remove
   * @returns {this} Logger instance for chaining
   */
  remove(target: string): this {
    if (target === 'metadata') {
      this.defaultMeta = {};
    }
    return this;
  }
}

/**
 * Factory function to create a Winston-compatible logger
 * @function createWinstonCompatible
 * @param {Partial<WinstonCompatibleOptions>} options - Logger options
 * @returns {WinstonCompatibleLogger} New Winston-compatible logger instance
 * 
 * @example
 * ```typescript
 * const logger = createWinstonCompatible({
 *   level: 'info',
 *   defaultMeta: { service: 'api' }
 * });
 * ```
 */
export function createWinstonCompatible(options?: Partial<WinstonCompatibleOptions>): WinstonCompatibleLogger {
  return new WinstonCompatibleLogger(options);
}
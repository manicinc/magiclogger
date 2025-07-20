// File: src/compatibility/Winston.ts

import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

/**
 * Winston-style metadata interface.
 * 
 * @interface WinstonMetadata
 */
type WinstonMetadata = Record<string, unknown>;

/**
 * Winston log method signature.
 * 
 * @type WinstonLogMethod
 */
type WinstonLogMethod = {
  (message: string): void;
  (message: string, meta: WinstonMetadata): void;
  (message: string, ...splat: unknown[]): void;
  (infoObject: WinstonMetadata): void;
};

/**
 * Winston-compatible logger options.
 * 
 * @interface WinstonCompatibleOptions
 */
export interface WinstonCompatibleOptions extends Omit<LogCompatibilityOptions, 'format'> {
  /**
   * Default Winston log level.
   * @default 'info'
   */
  level?: string;

  /**
   * Whether to prepend timestamps to each log.
   * @default false
   */
  timestamp?: boolean;

  /**
   * Format for timestamps.
   * @default 'HH:mm:ss'
   */
  timestampFormat?: string;

  /**
   * Default tags to apply to all log entries.
   */
  defaultTags?: string[];

  /**
   * Default context to apply to all log entries.
   */
  defaultContext?: Record<string, unknown>;

  /**
   * Whether to enable Winston's printf-style formatting.
   * @default true
   */
  printfFormatting?: boolean;

  /**
   * Whether to handle exceptions.
   * @default false
   */
  handleExceptions?: boolean;

  /**
   * Whether to handle rejections.
   * @default false
   */
  handleRejections?: boolean;

  /**
   * Winston-style format function.
   */
  format?: (info: WinstonMetadata) => string;

  /**
   * Exit on error.
   * @default true
   */
  exitOnError?: boolean;

  /**
   * Output format for BaseCompatibleLogger
   */
  outputFormat?: 'json' | 'plain' | 'custom';
}

/**
 * Winston-compatible logger implementation.
 * 
 * Provides a Winston-style API on top of MagicLogger with:
 * - Winston method signatures
 * - Metadata and splat support
 * - Winston-style formatting
 * - Exception handling
 * - Query interface
 * - Child loggers
 * 
 * @class WinstonCompatibleLogger
 * @extends {BaseCompatibleLogger}
 * 
 * @example
 * ```typescript
 * const logger = createWinstonCompatible({
 *   level: 'info',
 *   timestamp: true,
 *   defaultTags: ['app']
 * });
 * 
 * // Winston-style logging
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Database error', { error: err, query: sql });
 * logger.log('debug', 'Debug message', { data });
 * 
 * // Query logs
 * const logs = await logger.query({
 *   from: new Date() - 24 * 60 * 60 * 1000,
 *   until: new Date(),
 *   level: 'error'
 * });
 * ```
 */
export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  private level: string;
  private timestamp: boolean;
  private timestampFormat: string;
  private defaultTags?: string[];
  private defaultContext?: Record<string, unknown>;
  private printfFormatting: boolean;
  private handleExceptions: boolean;
  private handleRejections: boolean;
  private formatFn?: (info: WinstonMetadata) => string;
  private exitOnError: boolean;
  private queryHandlers: Array<(options: WinstonMetadata) => Promise<WinstonMetadata[]>> = [];

  /**
   * Creates a new Winston-compatible logger.
   * 
   * @param {WinstonCompatibleOptions} options - Logger options
   */
  constructor(options: WinstonCompatibleOptions = {}) {
    const baseOptions: LogCompatibilityOptions = {
      ...options,
      format: options.outputFormat || 'plain',
    };
    super(baseOptions);
    this.level = options.level || 'info';
    this.timestamp = options.timestamp || false;
    this.timestampFormat = options.timestampFormat || 'HH:mm:ss';
    this.defaultTags = options.defaultTags;
    this.defaultContext = options.defaultContext;
    this.printfFormatting = options.printfFormatting !== false;
    this.handleExceptions = options.handleExceptions || false;
    this.handleRejections = options.handleRejections || false;
    this.formatFn = options.format;
    this.exitOnError = options.exitOnError !== false;

    // Set up exception handling
    if (this.handleExceptions) {
      this.setupExceptionHandling();
    }

    if (this.handleRejections) {
      this.setupRejectionHandling();
    }
  }

  /**
   * Returns a formatted timestamp string based on `timestampFormat`.
   * 
   * @returns {string} Formatted timestamp
   * @private
   */
  private getTimestamp(): string {
    if (!this.timestamp) return '';
    const now = new Date();

    switch (this.timestampFormat) {
      case 'ISO':
        return `[${now.toISOString()}] `;
      case 'epoch':
        return `[${now.getTime()}] `;
      default: {
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `[${h}:${m}:${s}] `;
      }
    }
  }

  /**
   * Set up exception handling.
   * @private
   */
  private setupExceptionHandling(): void {
    process.on('uncaughtException', (error: Error) => {
      this.error('Uncaught Exception', { error: this.serializeError(error) });
      
      if (this.exitOnError) {
        process.exit(1);
      }
    });
  }

  /**
   * Set up rejection handling.
   * @private
   */
  private setupRejectionHandling(): void {
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      this.error('Unhandled Rejection', {
        reason: reason instanceof Error ? this.serializeError(reason) : reason,
        promise: promise.toString(),
      });

      if (this.exitOnError) {
        process.exit(1);
      }
    });
  }

  /**
   * Serialize error object for logging.
   * 
   * @param {Error} error - Error to serialize
   * @returns {object} Serialized error
   * @private
   */
  private serializeError(error: Error): WinstonMetadata {
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...error,
    };
  }

  /**
   * Parse Winston-style arguments.
   * 
   * @param {any[]} args - Arguments to parse
   * @returns {object} Parsed message and metadata
   * @private
   */
  private parseArgs(args: unknown[]): { message: string; meta: WinstonMetadata } {
    if (args.length === 0) {
      return { message: '', meta: {} };
    }

    // Single object argument
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const obj = args[0] as WinstonMetadata;
      
      // Check if it has a message property
      if ('message' in obj) {
        const { message, ...meta } = obj;
        return { message: String(message), meta };
      }
      
      // Otherwise use the whole object as meta
      return { message: this.safeSerialize(obj), meta: obj };
    }

    // String message with optional metadata
    if (typeof args[0] === 'string') {
      const message = args[0];
      let meta: WinstonMetadata = {};

      // Check for metadata object
      if (args.length >= 2 && typeof args[1] === 'object' && args[1] !== null) {
        meta = args[1] as WinstonMetadata;
        
        // Handle splat args
        if (args.length > 2) {
          meta.splat = args.slice(2);
        }
      } else if (args.length > 1) {
        // All additional args go to splat
        meta.splat = args.slice(1);
      }

      // Apply printf formatting if enabled
      if (this.printfFormatting && meta.splat) {
        return {
          message: this.printf(message, ...(meta.splat as unknown[])),
          meta: { ...meta, splat: undefined },
        };
      }

      return { message, meta };
    }

    // Fallback
    return { message: String(args[0]), meta: {} };
  }

  /**
   * Printf-style formatting.
   * 
   * @param {string} format - Format string
   * @param {...any} args - Format arguments
   * @returns {string} Formatted string
   * @private
   */
  private printf(format: string, ...args: unknown[]): string {
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
   * Winston-like `.verbose()` method.
   * 
   * @param {...any} args - Log arguments
   */
  public verbose(...args: unknown[]): void {
    if (!this._verbose) return;
    
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    this.logger.debug(formattedMsg, this.enhanceMeta(meta));
  }

  /**
   * Winston-like `.silly()` method.
   * 
   * @param {...any} args - Log arguments
   */
  public silly(...args: unknown[]): void {
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + `SILLY: ${message}`;
    this.logger.debug(formattedMsg, this.enhanceMeta(meta));
  }

  /**
   * Winston info method with full signature support.
   */
  public info: WinstonLogMethod = (...args: unknown[]): void => {
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    this.logger.info(formattedMsg, this.enhanceMeta(meta));
  };

  /**
   * Winston warn method with full signature support.
   */
  public warn: WinstonLogMethod = (...args: unknown[]): void => {
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    this.logger.warn(formattedMsg, this.enhanceMeta(meta));
  };

  /**
   * Winston error method with full signature support.
   */
  public error: WinstonLogMethod = (...args: unknown[]): void => {
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    
    // Special error handling
    if (meta.error instanceof Error) {
      meta.error = this.serializeError(meta.error);
    }
    
    this.logger.error(formattedMsg, this.enhanceMeta(meta));
  };

  /**
   * Winston debug method with full signature support.
   */
  public debug: WinstonLogMethod = (...args: unknown[]): void => {
    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    this.logger.debug(formattedMsg, this.enhanceMeta(meta));
  };

  /**
   * Winston-compatible log method with context and tags support.
   * 
   * @param {string} level - Log level
   * @param {...any} args - Log arguments
   */
  public log(level: string, ...args: unknown[]): void {
    // Handle special Winston levels
    if (level.toLowerCase() === 'verbose') {
      this.verbose(...args);
      return;
    }

    if (level.toLowerCase() === 'silly') {
      this.silly(...args);
      return;
    }

    const { message, meta } = this.parseArgs(args);
    const formattedMsg = this.getTimestamp() + message;
    
    // Apply custom format if provided
    let finalMessage = formattedMsg;
    if (this.formatFn) {
      const info = {
        level,
        message: formattedMsg,
        timestamp: new Date().toISOString(),
        ...meta,
      };
      finalMessage = this.formatFn(info);
    }

    const enhancedMeta = this.enhanceMeta(meta);
    const normalized = level.toLowerCase();

    // Use the underlying logger's methods
    switch (normalized) {
      case 'info':
        this.logger.info(finalMessage, enhancedMeta);
        break;
      case 'warn':
      case 'warning':
        this.logger.warn(finalMessage, enhancedMeta);
        break;
      case 'error':
        this.logger.error(finalMessage, enhancedMeta);
        break;
      case 'debug':
        this.logger.debug(finalMessage, enhancedMeta);
        break;
      default:
        if (this.strictLevels) {
          throw new Error(`Unknown log level: ${level}`);
        }
        this.logger.custom(finalMessage, ['white'], level.toUpperCase());
    }
  }

  /**
   * Enhance metadata with defaults.
   * 
   * @param {any} meta - Original metadata
   * @returns {any} Enhanced metadata
   * @private
   */
  private enhanceMeta(meta: WinstonMetadata): WinstonMetadata {
    const enhanced: WinstonMetadata = { ...meta };

    // Add default context
    if (this.defaultContext) {
      Object.assign(enhanced, this.defaultContext);
    }

    // Handle tags
    const tags = [...(this.defaultTags || []), ...((meta.tags as string[]) || [])];
    if (tags.length > 0) {
      enhanced.tags = tags;
    }

    return enhanced;
  }

  /**
   * Create a child logger with additional context.
   * 
   * @param {object} options - Child logger options
   * @returns {WinstonCompatibleLogger} Child logger
   */
  public child(options: Partial<WinstonCompatibleOptions> = {}): WinstonCompatibleLogger {
    const currentConfig = this.getConfig();
    const childOptions: WinstonCompatibleOptions = {
      ...currentConfig,
      ...options,
      defaultTags: [...(this.defaultTags || []), ...(options.defaultTags || [])],
      defaultContext: { ...this.defaultContext, ...options.defaultContext },
      outputFormat: currentConfig.format,
      format: this.formatFn,
    };

    return new WinstonCompatibleLogger(childOptions);
  }

  /**
   * Add a transport (compatibility method).
   * 
   * @param {any} _transport - Transport to add
   */
  public add(_transport: unknown): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Remove a transport (compatibility method).
   * 
   * @param {any} _transport - Transport to remove
   */
  public remove(_transport: unknown): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Clear all transports (compatibility method).
   */
  public clear(): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Query logs (requires query handler setup).
   * 
   * @param {object} options - Query options
   * @returns {Promise<any[]>} Query results
   */
  public async query(options: WinstonMetadata): Promise<WinstonMetadata[]> {
    if (this.queryHandlers.length === 0) {
      console.warn('[Winston Compatibility] No query handlers registered');
      return [];
    }

    const results = await Promise.all(
      this.queryHandlers.map(handler => handler(options))
    );

    return results.flat();
  }

  /**
   * Stream logs (compatibility method).
   * 
   * @param {object} _options - Stream options
   * @returns {any} Stream
   */
  public stream(_options: WinstonMetadata = {}): { on: () => WinstonCompatibleLogger; destroy: () => void } {
    console.warn('[Winston Compatibility] Streaming not implemented');
    return {
      on: () => this,
      destroy: () => { /* noop */ },
    };
  }

  /**
   * Register a query handler.
   * 
   * @param {Function} handler - Query handler function
   */
  public addQueryHandler(handler: (options: WinstonMetadata) => Promise<WinstonMetadata[]>): void {
    this.queryHandlers.push(handler);
  }

  /**
   * Profile a function or code block.
   * 
   * @param {string} id - Profile ID
   * @param {any} meta - Optional metadata
   */
  public profile(id: string, meta?: WinstonMetadata): void {
    const time = Date.now();
    const existing = this.profileData.get(id);

    if (existing) {
      // End profiling
      const duration = time - existing.start;
      this.profileData.delete(id);

      this.info(`Profiling [${id}]`, {
        ...meta,
        duration,
        durationHuman: this.formatDuration(duration),
      });
    } else {
      // Start profiling
      this.profileData.set(id, { start: time });
    }
  }

  /**
   * Profile data storage.
   * @private
   */
  private profileData: Map<string, { start: number }> = new Map();

  /**
   * Format duration for human reading.
   * 
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   * @private
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  /**
   * Start a timer (Winston compatibility).
   * 
   * @returns {object} Timer object
   */
  public startTimer(): { done: (info?: WinstonMetadata) => void } {
    const start = Date.now();

    return {
      done: (info?: WinstonMetadata) => {
        const duration = Date.now() - start;
        this.info('Timer', {
          ...info,
          duration,
          durationHuman: this.formatDuration(duration),
        });
      },
    };
  }

  /**
   * Check if a level is enabled.
   * 
   * @param {string} level - Level to check
   * @returns {boolean} Whether level is enabled
   */
  public isLevelEnabled(level: string): boolean {
    const levels: Record<string, number> = {
      silly: 0,
      debug: 1,
      verbose: 2,
      info: 3,
      warn: 4,
      error: 5,
    };

    const currentLevel = levels[this.level] || 3;
    const checkLevel = levels[level] || 0;

    return checkLevel >= currentLevel;
  }

  /**
   * Winston levels getter.
   */
  public get levels(): Record<string, number> {
    return {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    };
  }
}

/**
 * Factory function that returns a WinstonCompatibleLogger instance.
 * 
 * @param {WinstonCompatibleOptions} options - Logger options
 * @returns {WinstonCompatibleLogger} Winston-compatible logger
 */
export function createWinstonCompatible(
  options?: WinstonCompatibleOptions
): WinstonCompatibleLogger {
  return new WinstonCompatibleLogger(options);
}
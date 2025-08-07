// File: src/compatibility/loggers/WinstonCompatibleLogger.ts

import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';
import type { ColorName } from '../../types';
import type { Transport } from '../../transports/base/Transport';

/**
 * Winston-compatible options interface.
 * Extends LogCompatibilityOptions with Winston-specific configuration.
 *
 * @interface WinstonCompatibleOptions
 * @extends {LogCompatibilityOptions}
 */
export interface WinstonCompatibleOptions extends Omit<LogCompatibilityOptions, 'format'> {
  /** Winston log level */
  level?: string;

  /** Winston levels object mapping level names to priorities */
  levels?: Record<string, number>;

  /** Whether to exit on error */
  exitOnError?: boolean;

  /** Silent mode flag */
  silent?: boolean;

  /** Printf-style formatting enabled */
  printfFormatting?: boolean;

  /** Default metadata for all logs */
  defaultMeta?: Record<string, unknown>;

  /** Default context object */
  defaultContext?: Record<string, unknown>;

  /** Default tags array */
  defaultTags?: string[];

  /** Timestamp configuration */
  timestamp?: boolean;

  /** Timestamp format style */
  timestampFormat?: 'ISO' | 'epoch' | 'HH:mm:ss';

  /** Exception handling configuration */
  handleExceptions?: boolean;
  exceptions?: { handle?: boolean };
  exceptionHandlers?: Transport[];

  /** Rejection handling configuration */
  handleRejections?: boolean;
  rejections?: { handle?: boolean };
  rejectionHandlers?: Transport[];

  /** Custom format function (Winston-specific) */
  format?: (info: LogInfo) => string;
}

/**
 * Log info object structure for Winston compatibility.
 *
 * @interface LogInfo
 */
export interface LogInfo {
  /** Log level */
  level: string;

  /** Log message */
  message: string;

  /** Timestamp string */
  timestamp: string;

  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Timer interface for profiling operations.
 *
 * @interface Timer
 */
interface Timer {
  /** Timer name identifier */
  name: string;
  /** Start timestamp in milliseconds */
  start: number;
  /** Optional metadata associated with the timer */
  metadata?: Record<string, unknown>;
}

/**
 * Query options interface.
 *
 * @interface QueryOptions
 */
interface QueryOptions {
  /** Start date for query */
  from?: Date;
  /** End date for query */
  until?: Date;
  /** Log level filter */
  level?: string;
  /** Additional query parameters */
  [key: string]: unknown;
}

/**
 * Query handler function type for Winston query API.
 *
 * @typedef {Function} QueryHandler
 * @param {QueryOptions} options - Query options
 * @returns {Promise<unknown[]>} Promise resolving to array of log entries
 */
type QueryHandler = (options: QueryOptions) => Promise<unknown[]>;

/**
 * Simple sprintf implementation for Winston printf-style formatting.
 * Supports %s (string), %d (number), %j (JSON), and %% (literal %).
 *
 * @function sprintf
 * @param {string} format - Format string with placeholders
 * @param {...unknown[]} args - Arguments to substitute
 * @returns {string} Formatted string
 *
 * @example
 * sprintf('Hello %s, you have %d messages', 'John', 5)
 * // Returns: 'Hello John, you have 5 messages'
 */
function sprintf(format: string, ...args: unknown[]): string {
  let i = 0;
  return format.replace(/%[sdj%]/g, match => {
    if (match === '%%') return '%';
    if (i >= args.length) return match;

    const arg = args[i++];
    switch (match) {
      case '%s':
        return String(arg);
      case '%d':
        return Number(arg).toString();
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
 * Provides a Winston-style API on top of MagicLogger.
 *
 * @class WinstonCompatibleLogger
 * @extends {BaseCompatibleLogger}
 *
 * @example
 * ```typescript
 * const logger = createWinstonCompatible({
 *   level: 'info',
 *   timestamp: true,
 *   format: (info) => `[${info.level}] ${info.message}`
 * });
 *
 * logger.info('Server started on port %d', 3000);
 * logger.error('Database connection failed', { error: err });
 * ```
 */
export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  /** Current log level */
  protected level: string;

  /** Whether to exit process on error */
  protected exitOnError: boolean;

  /** Silent mode flag */
  protected silent: boolean;

  /** Printf formatting flag */
  protected printfFormatting: boolean;

  /** Default metadata for all logs */
  protected defaultMeta: Record<string, unknown>;

  /** Default tags array */
  protected defaultTags: string[];

  /** Default context object */
  protected defaultContext: Record<string, unknown>;

  /** Active timers map */
  protected timers: Map<string, Timer>;

  /** Timestamp enabled flag */
  protected timestamp: boolean;

  /** Timestamp format style */
  protected timestampFormat: 'ISO' | 'epoch' | 'HH:mm:ss';

  /** Exception handling flag */
  protected handleExceptions: boolean;

  /** Rejection handling flag */
  protected handleRejections: boolean;

  /** Custom format function */
  protected formatFn?: (info: LogInfo) => string;

  /** Query handlers array */
  protected queryHandlers: QueryHandler[] = [];

  /** Verbose mode enabled flag (renamed from verbose to avoid conflict) */
  protected verboseEnabled: boolean;

  /** Strict levels flag */
  protected strictLevels: boolean;

  /** Public profile data map for Winston compatibility */
  public profileData: Map<string, { start: number; metadata?: Record<string, unknown> }>;

  /** Public levels object for Winston compatibility */
  public levels: Record<string, number>;

  /**
   * Creates a new Winston-compatible logger instance.
   *
   * @constructor
   * @param {Partial<WinstonCompatibleOptions>} [options={}] - Configuration options
   */
  constructor(options: Partial<WinstonCompatibleOptions> = {}) {
    const {
      timestamp,
      timestampFormat,
      format,
      handleExceptions,
      handleRejections,
      defaultTags,
      ...baseOptions
    } = options;
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
    this.printfFormatting = options.printfFormatting ?? true;
    this.defaultMeta = options.defaultMeta || options.defaultContext || {};
    this.defaultTags = defaultTags || [];
    this.defaultContext = options.defaultContext || {};
    this.timers = new Map();
    this.timestamp = timestamp ?? false;
    this.timestampFormat = timestampFormat || 'HH:mm:ss';
    this.handleExceptions = handleExceptions || options.exceptions?.handle || false;
    this.handleRejections = handleRejections || options.rejections?.handle || false;
    this.formatFn = format;
    this.profileData = new Map();
    this.verboseEnabled = options.verbose || false;
    this.strictLevels = options.strictLevels || false;

    // Handle exception and rejection handlers
    if (this.handleExceptions) {
      this.setupExceptionHandlers(options.exceptionHandlers);
    }

    if (this.handleRejections) {
      this.setupRejectionHandlers(options.rejectionHandlers);
    }
  }

  /**
   * Formats a timestamp according to the configured format.
   *
   * @private
   * @param {Date} date - Date to format
   * @returns {string} Formatted timestamp string
   */
  private formatTimestamp(date: Date): string {
    switch (this.timestampFormat) {
      case 'ISO':
        return date.toISOString();
      case 'epoch':
        return date.getTime().toString();
      case 'HH:mm:ss':
      default: {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
    }
  }

  /**
   * Formats a duration in milliseconds to human-readable format.
   *
   * @public
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Human-readable duration (e.g., "123ms", "1.23s", "2.05m")
   *
   * @example
   * logger.formatDuration(150) // "150ms"
   * logger.formatDuration(1500) // "1.50s"
   * logger.formatDuration(65000) // "1.08m"
   */
  public formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  /**
   * Checks if a given log level is enabled based on current logger level.
   *
   * @public
   * @param {string} level - Level to check
   * @returns {boolean} True if the level is enabled
   *
   * @example
   * logger.isLevelEnabled('debug') // false if logger level is 'info'
   * logger.isLevelEnabled('error') // true if logger level is 'info'
   */
  public isLevelEnabled(level: string): boolean {
    const currentLevelValue = this.levels[this.level] ?? Infinity;
    const targetLevelValue = this.levels[level];
    
    // Return false for unknown levels
    if (targetLevelValue === undefined) {
      return false;
    }
    
    return targetLevelValue <= currentLevelValue;
  }

  /**
   * Winston's flexible log method supporting multiple argument patterns.
   * Handles string messages, objects with message property, and printf-style formatting.
   *
   * @public
   * @param {string} level - Log level
   * @param {string | Record<string, unknown>} message - Message or object with message property
   * @param {...unknown[]} args - Additional arguments for formatting or metadata
   *
   * @example
   * logger.log('info', 'Simple message');
   * logger.log('info', 'User %s logged in', 'john');
   * logger.log('info', { message: 'User action', userId: 123 });
   */
  public log(level: string, message: string | Record<string, unknown>, ...args: unknown[]): void {
    if (this.silent) {
      return;
    }

    // Check for strict levels
    if (this.strictLevels && this.levels[level] === undefined) {
      throw new Error(`Unknown log level: ${level}`);
    }

    // Special handling for verbose level - check verboseEnabled flag
    if (level === 'verbose' && !this.verboseEnabled && !this.isLevelEnabled(level)) {
      return;
    } else if (level !== 'verbose' && level !== 'silly' && this.levels[level] !== undefined && !this.isLevelEnabled(level)) {
      // Only filter out known levels that are disabled (except verbose and silly which have special handling)
      return;
    }
    // Unknown levels and silly are allowed to pass through

    let msg: string;
    let meta: Record<string, unknown> = { ...this.defaultMeta };

    // Handle different argument patterns
    if (typeof message === 'object' && message !== null) {
      const obj = message as Record<string, unknown>;
      msg = String(obj.message || '');
      meta = { ...meta, ...obj };
      delete meta.message;
    } else {
      msg = String(message);

      // Extract metadata from args
      const splatArgs: unknown[] = [];
      args.forEach(arg => {
        if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
          Object.assign(meta, arg);
        } else {
          splatArgs.push(arg);
        }
      });

      // Apply printf formatting if enabled
      if (this.printfFormatting && splatArgs.length > 0) {
        msg = sprintf(msg, ...splatArgs);
      } else if (splatArgs.length > 0) {
        // Store splat args in metadata
        meta.splat = splatArgs;
      }
    }

    // Add timestamp if enabled
    const timestampStr = this.timestamp ? `[${this.formatTimestamp(new Date())}] ` : '';
    msg = timestampStr + msg;

    // Add tags
    if (this.defaultTags.length > 0) {
      const existingTags = (meta.tags as string[]) || [];
      meta.tags = [...this.defaultTags, ...existingTags];
    }

    // Apply custom format if provided
    if (this.formatFn) {
      const info: LogInfo = {
        level,
        message: msg,
        timestamp: new Date().toISOString(),
        ...meta,
      };
      msg = this.formatFn(info);
    }

    // Route to appropriate method
    this.routeToMethod(level, msg, meta);
  }

  /**
   * Routes log entries to the appropriate underlying logger method.
   *
   * @protected
   * @param {string} level - Log level
   * @param {string} message - Formatted message
   * @param {Record<string, unknown>} meta - Metadata object
   */
  protected routeToMethod(level: string, message: string, meta: Record<string, unknown>): void {
    const normalizedLevel = this.normalizeLevel(level);

    switch (normalizedLevel) {
      case 'error':
        this.serializeErrors(meta);
        this.logger.error(message, meta);
        break;
      case 'warn':
        this.logger.warn(message, meta);
        break;
      case 'info':
        this.logger.info(message, meta);
        break;
      case 'debug':
        this.logger.debug(message, meta);
        break;
      default:
        if (level === 'verbose') {
          this.logger.debug(message, meta);
        } else if (level === 'silly') {
          this.logger.debug(`SILLY: ${message}`, meta);
        } else if (level === 'http') {
          this.logger.info(`HTTP: ${message}`, meta);
        } else {
          const colors: ColorName[] = this.getColorsForLevel(level);
          this.logger.custom(message, colors, level.toUpperCase());
        }
        break;
    }
  }

  /**
   * Serializes Error objects in metadata to plain objects.
   * Preserves error name, message, stack, and additional properties.
   *
   * @private
   * @param {Record<string, unknown>} meta - Metadata object potentially containing errors
   */
  private serializeErrors(meta: Record<string, unknown>): void {
    if (meta.error instanceof Error) {
      const err = meta.error;
      meta.error = {
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        ...Object.getOwnPropertyNames(err).reduce((acc, key) => {
          if (!['name', 'message', 'stack'].includes(key)) {
            acc[key] = (err as unknown as Record<string, unknown>)[key];
          }
          return acc;
        }, {} as Record<string, unknown>),
      };
    }
  }

  /**
   * Gets color configuration for custom log levels.
   *
   * @protected
   * @param {string} level - Log level name
   * @returns {ColorName[]} Array of color names for the level
   */
  protected getColorsForLevel(level: string): ColorName[] {
    const levelColors: Record<string, ColorName[]> = {
      emergency: ['red', 'bold', 'bgYellow'],
      alert: ['yellow', 'bold', 'bgRed'],
      critical: ['red', 'bold'],
      notice: ['white'],
      trace: ['gray'],
      http: ['cyan'],
      verbose: ['cyan'],
      silly: ['magenta'],
    };

    return levelColors[level] || ['white'];
  }

  /**
   * Normalizes level aliases to standard level names.
   *
   * @protected
   * @param {string} level - Level name to normalize
   * @returns {string} Normalized level name
   */
  protected normalizeLevel(level: string): string {
    if (level === 'warning') return 'warn';
    return level;
  }

  /**
   * Logs an error message.
   *
   * @public
   * @param {string | Error | Record<string, unknown>} message - Error message, Error object, or metadata
   * @param {...unknown[]} args - Additional arguments
   *
   * @example
   * logger.error('Failed to connect');
   * logger.error(new Error('Connection timeout'));
   * logger.error('Operation failed', { code: 'TIMEOUT', retry: 3 });
   */
  public error(message: string | Error | Record<string, unknown>, ...args: unknown[]): void {
    if (message instanceof Error) {
      this.log('error', message.message, {
        error: message,
        ...(args[0] as Record<string, unknown>),
      });
    } else {
      this.log('error', message as string, ...args);
    }
  }

  /**
   * Logs a warning message.
   *
   * @public
   * @param {string | Record<string, unknown>} message - Warning message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public warn(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('warn', message as string, ...args);
  }

  /**
   * Logs an info message.
   *
   * @public
   * @param {string | Record<string, unknown>} message - Info message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public info(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('info', message as string, ...args);
  }

  /**
   * Logs an HTTP message.
   *
   * @public
   * @param {string | Record<string, unknown>} message - HTTP message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public http(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('http', message as string, ...args);
  }

  /**
   * Logs a verbose message.
   * Only logs if verbose mode is enabled or verbose level is enabled.
   *
   * @public
   * @param {string | Record<string, unknown>} message - Verbose message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public verbose(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('verbose', message as string, ...args);
  }

  /**
   * Logs a debug message.
   *
   * @public
   * @param {string | Record<string, unknown>} message - Debug message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public debug(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('debug', message as string, ...args);
  }

  /**
   * Logs a silly message.
   *
   * @public
   * @param {string | Record<string, unknown>} message - Silly message or metadata
   * @param {...unknown[]} args - Additional arguments
   */
  public silly(message: string | Record<string, unknown>, ...args: unknown[]): void {
    this.log('silly', message as string, ...args);
  }

  /**
   * Displays a header with optional custom colors.
   *
   * @public
   * @param {string} title - Header title text
   * @param {ColorName[]} [colors] - Optional array of colors to apply
   */
  public header(title: string, colors?: ColorName[]): void {
    const headerColors = colors || ['brightWhite', 'bgBlue', 'bold'];
    this.logger.header(title, headerColors);
  }

  /**
   * Creates a child logger with additional context.
   *
   * @public
   * @param {Partial<WinstonCompatibleOptions> | Record<string, unknown>} options - Child logger options or metadata
   * @returns {WinstonCompatibleLogger} New child logger instance
   *
   * @example
   * const child = logger.child({ requestId: '123', userId: 'john' });
   * child.info('Processing request'); // Includes requestId and userId
   */
  public child(
    options: Partial<WinstonCompatibleOptions> | Record<string, unknown>
  ): WinstonCompatibleLogger {
    // If options looks like plain metadata (no known WinstonCompatibleOptions properties)
    const isPlainMetadata =
      options &&
      typeof options === 'object' &&
      !(
        'level' in options ||
        'transports' in options ||
        'defaultMeta' in options ||
        'defaultTags' in options ||
        'defaultContext' in options ||
        'format' in options
      );

    let childOptions: Partial<WinstonCompatibleOptions>;

    if (isPlainMetadata) {
      // Treat as metadata to be added to defaultMeta
      childOptions = {
        ...this.getOptions(),
        defaultMeta: {
          ...this.defaultMeta,
          ...(options as Record<string, unknown>),
        },
      };
    } else {
      // Treat as WinstonCompatibleOptions
      const winstonOptions = options as Partial<WinstonCompatibleOptions>;
      childOptions = {
        ...this.getOptions(),
        ...winstonOptions,
        defaultMeta: {
          ...this.defaultMeta,
          ...(winstonOptions.defaultMeta || {}),
          ...(winstonOptions.defaultContext || {}),
        },
        defaultTags: [...(this.defaultTags || []), ...(winstonOptions.defaultTags || [])],
        defaultContext: {
          ...this.defaultContext,
          ...(winstonOptions.defaultContext || {}),
        },
      };
    }

    return new WinstonCompatibleLogger(childOptions);
  }

  /**
   * Starts a timer for measuring operation duration.
   *
   * @public
   * @returns {{ done: (info?: { message?: string; [key: string]: unknown }) => void }} Timer object with done method
   *
   * @example
   * const timer = logger.startTimer();
   * // ... perform operation ...
   * timer.done({ message: 'Operation completed', operationId: '123' });
   */
  public startTimer(): { done: (info?: { message?: string; [key: string]: unknown }) => void } {
    const start = Date.now();

    return {
      done: (info?: { message?: string; [key: string]: unknown }) => {
        const duration = Date.now() - start;
        const message = info?.message || 'Timer';
        const meta = {
          ...info,
          duration,
          durationHuman: this.formatDuration(duration),
        };
        delete meta.message;

        this.info(message, meta);
      },
    };
  }

  /**
   * Profiles a named operation.
   * First call starts profiling, second call logs the duration.
   *
   * @public
   * @param {string} name - Profile identifier
   * @param {Record<string, unknown>} [meta] - Optional metadata
   *
   * @example
   * logger.profile('database-query');
   * // ... perform query ...
   * logger.profile('database-query'); // Logs: "Profiling [database-query] (123ms)"
   */
  public profile(name: string, meta?: Record<string, unknown>): void {
    if (this.profileData.has(name)) {
      const profile = this.profileData.get(name);
      if (profile) {
        const duration = Date.now() - profile.start;
        this.profileData.delete(name);

        this.info(`Profiling [${name}]`, {
          ...profile.metadata,
          ...meta,
          duration,
          durationHuman: this.formatDuration(duration),
        });
      }
    } else {
      this.profileData.set(name, {
        start: Date.now(),
        metadata: meta,
      });
    }
  }

  /**
   * Adds a query handler for the query API.
   *
   * @public
   * @param {QueryHandler} handler - Query handler function
   *
   * @example
   * logger.addQueryHandler(async (options) => {
   *   // Return logs from your storage
   *   return await database.query(options);
   * });
   */
  public addQueryHandler(handler: QueryHandler): void {
    this.queryHandlers.push(handler);
  }

  /**
   * Queries logs using registered query handlers.
   *
   * @public
   * @param {QueryOptions} [options] - Query options
   * @returns {Promise<unknown[]>} Promise resolving to array of log entries
   *
   * @example
   * const logs = await logger.query({
   *   from: new Date('2024-01-01'),
   *   until: new Date(),
   *   level: 'error'
   * });
   */
  public async query(options?: QueryOptions): Promise<unknown[]> {
    if (this.queryHandlers.length === 0) {
      console.warn('[Winston Compatibility] No query handlers registered');
      return [];
    }

    const results = await Promise.all(this.queryHandlers.map(handler => handler(options || {})));

    return results.flat();
  }

  /**
   * Creates a stream for log entries (stub implementation).
   *
   * @public
   * @param {Record<string, unknown>} [_options] - Stream options (unused)
   * @returns {{ on: () => WinstonCompatibleLogger; destroy: () => void }} Stream-like object
   */
  public stream(_options?: Record<string, unknown>): {
    on: () => WinstonCompatibleLogger;
    destroy: () => void;
  } {
    console.warn('[Winston Compatibility] Streaming not implemented');

    return {
      on: () => this,
      destroy: () => undefined,
    };
  }

  /**
   * Adds a transport (Winston compatibility stub).
   *
   * @public
   * @param {Transport} _transport - Transport to add (unused)
   * @returns {this} Logger instance for chaining
   */
  public add(_transport: Transport): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Removes a transport (Winston compatibility stub).
   *
   * @public
   * @param {Transport} _transport - Transport to remove (unused)
   * @returns {this} Logger instance for chaining
   */
  public remove(_transport: Transport): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Clears all transports (Winston compatibility stub).
   *
   * @public
   * @returns {this} Logger instance for chaining
   */
  public clear(): this {
    console.warn('[Winston Compatibility] Transport management should be done through MagicLogger');
    return this;
  }

  /**
   * Sets up handlers for uncaught exceptions.
   *
   * @protected
   * @param {Transport[]} [_handlers] - Exception handler transports (unused)
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
   * Sets up handlers for unhandled promise rejections.
   *
   * @protected
   * @param {Transport[]} [_handlers] - Rejection handler transports (unused)
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
   * Gets the current logger configuration.
   *
   * @protected
   * @returns {Partial<WinstonCompatibleOptions>} Current configuration
   */
  protected getOptions(): Partial<WinstonCompatibleOptions> {
    return {
      level: this.level as WinstonCompatibleOptions['level'],
      levels: this.levels,
      exitOnError: this.exitOnError,
      silent: this.silent,
      printfFormatting: this.printfFormatting,
      defaultMeta: this.defaultMeta,
      defaultTags: this.defaultTags,
      verbose: this.verboseEnabled,
      useColors: this.useColors,
      timestamp: this.timestamp,
      timestampFormat: this.timestampFormat,
      handleExceptions: this.handleExceptions,
      handleRejections: this.handleRejections,
      format: this.formatFn,
    };
  }

  /**
   * Reconfigures the logger with new options.
   *
   * @public
   * @param {Partial<WinstonCompatibleOptions>} options - New configuration options
   */
  public configure(options: Partial<WinstonCompatibleOptions>): void {
    if (options.level) this.level = options.level;
    if (options.levels) this.levels = options.levels;
    if (options.exitOnError !== undefined) this.exitOnError = options.exitOnError;
    if (options.silent !== undefined) this.silent = options.silent;
    if (options.printfFormatting !== undefined) this.printfFormatting = options.printfFormatting;
    if (options.defaultMeta) this.defaultMeta = { ...this.defaultMeta, ...options.defaultMeta };
    if (options.verbose !== undefined) this.setVerbose(options.verbose);
    if (options.useColors !== undefined) this.useColors = options.useColors;
    if (options.timestamp !== undefined) this.timestamp = options.timestamp;
    if (options.timestampFormat !== undefined) this.timestampFormat = options.timestampFormat;
  }

  // Explicitly re-export base class methods that conflict with Winston's verbose() method
  // These methods are inherited from BaseCompatibleLogger but TypeScript needs explicit declarations
  // due to the method name collision with verbose()

  /**
   * Sets verbose mode (inherited from BaseCompatibleLogger).
   * Note: This is different from the verbose() log method.
   *
   * @public
   * @param {boolean} enabled - Whether to enable verbose mode
   */
  public setVerbose(enabled: boolean): void {
    super.setVerbose(enabled);
  }

  /**
   * Checks if verbose mode is enabled (inherited from BaseCompatibleLogger).
   * Note: This is different from the verbose() log method.
   *
   * @public
   * @returns {boolean} True if verbose mode is enabled
   */
  public isVerbose(): boolean {
    return super.isVerbose();
  }

  /**
   * Enables or disables color output (inherited from BaseCompatibleLogger).
   *
   * @public
   * @param {boolean} enabled - Whether to enable colors
   */
  public setColors(enabled: boolean): void {
    super.setColors(enabled);
  }

  /**
   * Checks if colors are enabled (inherited from BaseCompatibleLogger).
   *
   * @public
   * @returns {boolean} True if colors are enabled
   */
  public hasColors(): boolean {
    return super.hasColors();
  }

  /**
   * Sets the logger name (inherited from BaseCompatibleLogger).
   *
   * @public
   * @param {string} name - New logger name
   */
  public setName(name: string): void {
    super.setName(name);
  }

  /**
   * Gets the logger name (inherited from BaseCompatibleLogger).
   *
   * @public
   * @returns {string} Logger name
   */
  public getName(): string {
    return super.getName();
  }
}

/**
 * Factory function to create a Winston-compatible logger instance.
 *
 * @function createWinstonCompatible
 * @param {Partial<WinstonCompatibleOptions>} [options] - Logger configuration options
 * @returns {WinstonCompatibleLogger} New Winston-compatible logger instance
 *
 * @example
 * ```typescript
 * const logger = createWinstonCompatible({
 *   level: 'info',
 *   timestamp: true,
 *   defaultMeta: { service: 'api' }
 * });
 *
 * logger.info('Server started', { port: 3000 });
 * ```
 */
export function createWinstonCompatible(
  options?: Partial<WinstonCompatibleOptions>
): WinstonCompatibleLogger {
  return new WinstonCompatibleLogger(options);
}

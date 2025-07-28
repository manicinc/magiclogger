// File: src/Logger.ts

import { NodeLogger } from './core/NodeLogger';
import { BrowserLogger } from './core/BrowserLogger';
import { TransportManager } from './transports/base/TransportManager';
import { Transport } from './transports/base/Transport';
import { Colorizer } from './core/Colorizer';
import { Formatter } from './core/Formatter';
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
 * ID generator function type for creating unique log entry identifiers.
 * 
 * @typedef {Function} IdGenerator
 * @returns {string} A unique identifier string
 * 
 * @example
 * ```typescript
 * const customIdGenerator: IdGenerator = () => {
 *   return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 * };
 * ```
 */
export type IdGenerator = () => string;

/**
 * Extended logger instance interface with optional close method.
 * Used internally for type augmentation of logger implementations.
 * 
 * @interface ExtendedLoggerInstance
 * @internal
 */
interface ExtendedLoggerInstance {
  /**
   * Optional close method for cleanup operations.
   * @returns {Promise<void>} Promise that resolves when logger is closed
   */
  close?: () => Promise<void>;
}

/**
 * Extended node logger instance interface for file operations.
 * Adds file management capabilities to the base logger interface.
 * 
 * @interface ExtendedNodeLogger
 * @extends {ExtendedLoggerInstance}
 * @internal
 */
interface ExtendedNodeLogger extends ExtendedLoggerInstance {
  /** File manager instance for handling log files */
  fileManager?: FileManager;
  /** Whether to write logs to disk */
  writeToDisk?: boolean;
  /** Directory path for log files */
  logDir?: string;
  /** Number of days to retain log files */
  logRetentionDays?: number;
}

/**
 * Metadata type for log entries.
 * Can contain any key-value pairs for additional context.
 * 
 * @typedef {Object} LogMetadata
 * 
 * @example
 * ```typescript
 * const metadata: LogMetadata = {
 *   userId: '12345',
 *   requestId: 'abc-def-ghi',
 *   environment: 'production'
 * };
 * ```
 */
export type LogMetadata = Record<string, unknown>;

/**
 * Log entry metadata type that can be an Error, metadata object, or object containing an error.
 * Provides flexibility in how errors and metadata are passed to log methods.
 * 
 * @typedef {LogMetadata | Error | { error?: Error; [key: string]: unknown }} LogEntryMeta
 * 
 * @example
 * ```typescript
 * // Pass an error directly
 * logger.error('Operation failed', new Error('Connection timeout'));
 * 
 * // Pass metadata with an error
 * logger.error('Operation failed', { 
 *   error: new Error('Connection timeout'),
 *   retryCount: 3,
 *   userId: '12345'
 * });
 * ```
 */
export type LogEntryMeta = LogMetadata | Error | { error?: Error; [key: string]: unknown };

/**
 * Extended logger options that include transport configuration.
 * Extends the base LoggerOptions with transport-specific settings.
 * 
 * @interface ExtendedLoggerOptions
 * @extends {LoggerOptions}
 * 
 * @example
 * ```typescript
 * const options: ExtendedLoggerOptions = {
 *   transports: [
 *     new ConsoleTransport({ level: 'debug' }),
 *     new FileTransport({ filepath: './logs/app.log' })
 *   ],
 *   useLegacyOutput: false,
 *   idGenerator: () => `custom-${Date.now()}`
 * };
 * ```
 */
export interface ExtendedLoggerOptions extends LoggerOptions {
  /**
   * Array of transports to use for logging.
   * If not provided and useLegacyOutput is false, no transports are added by default.
   * This ensures tree-shaking works properly.
   * @type {Transport[]}
   * @default []
   */
  transports?: Transport[];

  /**
   * Whether to use legacy console/file output in addition to transports.
   * When true, logs are sent to both the legacy logger and transports.
   * @type {boolean}
   * @default false
   */
  useLegacyOutput?: boolean;

  /**
   * Custom ID generator function for log entries.
   * Allows customization of how unique IDs are generated for each log entry.
   * @type {IdGenerator}
   * @default () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
   */
  idGenerator?: IdGenerator;

  /**
   * Whether to automatically create default transports.
   * When true, creates console and optionally file transports based on options.
   * Set to false for complete control over transports (recommended for tree-shaking).
   * @type {boolean}
   * @default false
   * @since 0.2.0
   */
  useDefaultTransports?: boolean;
}

/**
 * Main Logger class that provides a unified logging interface.
 * 
 * This class automatically detects the runtime environment (Node.js or Browser)
 * and instantiates the appropriate underlying logger implementation.
 * It manages transports for flexible log delivery to various destinations.
 * 
 * ## Features
 * - Environment detection (Node.js/Browser)
 * - Transport management for flexible log routing
 * - Structured logging with metadata
 * - Legacy compatibility methods
 * - Tree-shakeable design (transports loaded on-demand)
 * 
 * ## Tree-Shaking Note
 * As of v0.2.0, the Logger class no longer automatically imports default transports.
 * This ensures proper tree-shaking. You must explicitly add transports:
 * 
 * @class Logger
 * 
 * @example
 * ```typescript
 * // Basic usage (no transports - logs go nowhere)
 * const logger = new Logger();
 * 
 * // Add transports explicitly for tree-shaking
 * import { ConsoleTransport } from 'magiclogger/transports/console';
 * import { FileTransport } from 'magiclogger/transports/file';
 * 
 * const logger = new Logger({
 *   transports: [
 *     new ConsoleTransport({ level: 'debug' }),
 *     new FileTransport({ filepath: './app.log' })
 *   ]
 * });
 * 
 * // Log with metadata
 * logger.info('User logged in', { userId: '12345', ip: '192.168.1.1' });
 * logger.error('Database error', { error: err, query: 'SELECT * FROM users' });
 * ```
 */
export class Logger {
  /**
   * Legacy logger instance for backward compatibility.
   * Provides environment-specific logging capabilities.
   * @private
   * @type {NodeLogger | BrowserLogger}
   */
  private loggerInstance: NodeLogger | BrowserLogger;

  /**
   * Transport manager for handling multiple log destinations.
   * Manages routing, filtering, and delivery of log entries.
   * @private
   * @type {TransportManager}
   */
  private transportManager: TransportManager;

  /**
   * Logger configuration options.
   * @private
   * @readonly
   * @type {ExtendedLoggerOptions}
   */
  private readonly options: ExtendedLoggerOptions;

  /**
   * Function for generating unique IDs for log entries.
   * @private
   * @readonly
   * @type {IdGenerator}
   */
  private readonly idGenerator: IdGenerator;

  /**
   * Whether to use legacy output methods in addition to transports.
   * @private
   * @readonly
   * @type {boolean}
   */
  private readonly useLegacyOutput: boolean;

  /**
   * Creates a new Logger instance with the specified options.
   * 
   * The logger automatically detects the runtime environment and creates
   * the appropriate underlying logger (NodeLogger for Node.js, BrowserLogger for browsers).
   * 
   * @constructor
   * @param {ExtendedLoggerOptions | boolean} [options={}] - Logger configuration options or verbose flag (backward compatibility)
   * @param {boolean} [writeToDisk] - Whether to write to disk (backward compatibility)
   * @param {boolean} [useColors] - Whether to use colors (backward compatibility)
   * 
   * @example
   * ```typescript
   * // Simple logger with console output
   * import { ConsoleTransport } from 'magiclogger/transports/console';
   * const logger = new Logger({
   *   transports: [new ConsoleTransport()]
   * });
   * 
   * // Advanced configuration
   * const logger = new Logger({
   *   id: 'my-app',
   *   tags: ['production'],
   *   context: { version: '1.0.0' },
   *   transports: [...],
   *   idGenerator: () => crypto.randomUUID()
   * });
   * 
   * // Backward compatibility with boolean parameters
   * const logger = new Logger(true, true, false); // verbose, writeToDisk, useColors
   * ```
   */
  constructor(
    options: ExtendedLoggerOptions | boolean = {}, 
    writeToDisk?: boolean, 
    useColors?: boolean
  ) {
    // Handle backward compatibility with boolean constructor
    if (typeof options === 'boolean') {
      const verbose = options;
      this.options = {
        verbose,
        writeToDisk: writeToDisk ?? false,
        useColors: useColors ?? true,
      };
    } else {
      // Process environment variables and merge with options
      this.options = this.processOptions(options);
    }

    // Validate and normalize options
    this.options = this.validateOptions(this.options);

    this.useLegacyOutput = this.options.useLegacyOutput ?? false;
    this.idGenerator = this.options.idGenerator ?? this.defaultIdGenerator;

    // Initialize legacy logger instance based on environment
    if (typeof window !== 'undefined') {
      this.loggerInstance = new BrowserLogger(this.options);
    } else {
      this.loggerInstance = new NodeLogger(this.options);
    }

    // Initialize transport manager
    this.transportManager = new TransportManager();

    // Initialize transports
    this.initializeTransports();
  }

  /**
   * Processes constructor options and environment variables.
   * 
   * @private
   * @param {ExtendedLoggerOptions} options - Raw options
   * @returns {ExtendedLoggerOptions} Processed options
   */
  private processOptions(options: ExtendedLoggerOptions): ExtendedLoggerOptions {
    const processed = { ...options };

    // Read environment variables if properties are not explicitly set
    if (typeof process !== 'undefined' && process.env) {
      // Handle LOG_VERBOSE environment variable
      if (processed.verbose === undefined) {
        const envVerbose = process.env.LOG_VERBOSE;
        if (envVerbose !== undefined) {
          processed.verbose = this.parseBooleanEnv(envVerbose);
        }
      }

      // Handle LOG_TO_FILE environment variable
      if (processed.writeToDisk === undefined) {
        const envToFile = process.env.LOG_TO_FILE;
        if (envToFile !== undefined) {
          processed.writeToDisk = this.parseBooleanEnv(envToFile);
        }
      }
    }

    // Set defaults for undefined values
    return {
      verbose: false,
      writeToDisk: false,
      useColors: true,
      logRetentionDays: 30,
      logDir: 'logs',
      ...processed,
    };
  }

  /**
   * Validates and normalizes logger options.
   * 
   * @private
   * @param {ExtendedLoggerOptions} options - Options to validate
   * @returns {ExtendedLoggerOptions} Validated options
   */
  private validateOptions(options: ExtendedLoggerOptions): ExtendedLoggerOptions {
    const validated = { ...options };

    // Validate logRetentionDays - must be at least 1
    if (validated.logRetentionDays !== undefined) {
      if (typeof validated.logRetentionDays !== 'number' || validated.logRetentionDays < 1) {
        console.warn(`[Logger] Invalid logRetentionDays: ${validated.logRetentionDays}. Using default: 30`);
        validated.logRetentionDays = 30;
      }
    }

    // Normalize log directory path
    if (validated.logDir && typeof validated.logDir === 'string') {
      validated.logDir = path.resolve(validated.logDir);
    }

    return validated;
  }

  /**
   * Parses a boolean environment variable value.
   * 
   * @private
   * @param {string} value - Environment variable value
   * @returns {boolean} Parsed boolean value
   */
  private parseBooleanEnv(value: string): boolean {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  /**
   * Initializes transports based on configuration.
   * If transports are provided in options, uses those.
   * If useDefaultTransports is true, attempts to create default transports.
   * Otherwise, no transports are added (for tree-shaking).
   * 
   * @private
   * @returns {void}
   */
  private initializeTransports(): void {
    if (this.options.transports && this.options.transports.length > 0) {
      // Use provided transports
      this.options.transports.forEach(transport => {
        this.addTransport(transport);
      });
    } else if (this.options.useDefaultTransports) {
      // Only create default transports if explicitly requested
      this.createDefaultTransportsAsync();
    }
    // If neither, no transports are added (tree-shakeable)
  }

  /**
   * Asynchronously creates and adds default transports.
   * Uses dynamic imports to maintain tree-shaking capabilities.
   * Only imports transports if actually needed.
   * 
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async createDefaultTransportsAsync(): Promise<void> {
    try {
      // Dynamically import console transport
      const { ConsoleTransport } = await import('./transports/base/implementations/ConsoleTransport');
      
      const consoleTransport = new ConsoleTransport({
        name: 'default-console',
        enabled: true,
        level: this.options.verbose ? 'debug' : 'info',
        useColors: this.options.useColors ?? true,
      });
      
      await this.addTransport(consoleTransport);

      // Add file transport if writeToDisk is enabled (Node.js only)
      if (this.options.writeToDisk && typeof window === 'undefined') {
        const { FileTransport } = await import('./transports/base/implementations/FileTransport');
        
        const fileTransport = new FileTransport({
          name: 'default-file',
          enabled: true,
          level: this.options.verbose ? 'debug' : 'info',
          filepath: this.options.logDir || './logs',
          isDirectory: true,
          retentionDays: this.options.logRetentionDays,
        });
        
        await this.addTransport(fileTransport);
      }
    } catch (error) {
      // If dynamic import fails, log warning but continue
      console.warn('[Logger] Failed to create default transports:', error);
    }
  }

  /**
   * Default ID generator for log entries.
   * Creates a unique identifier using timestamp and random string.
   * 
   * @private
   * @returns {string} Unique identifier in format: "timestamp-randomstring"
   * 
   * @example
   * ```typescript
   * // Returns something like: "1634567890123-a1b2c3d4e"
   * const id = this.defaultIdGenerator();
   * ```
   */
  private defaultIdGenerator(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a structured log entry from raw log data.
   * Processes the message and metadata to create a complete LogEntry object
   * with all required fields and proper error handling.
   * 
   * @private
   * @param {LogLevel} level - Log level (e.g., 'info', 'error', 'debug')
   * @param {string} message - Log message
   * @param {LogEntryMeta} [meta] - Additional metadata, error, or context
   * @returns {LogEntry} Complete log entry object
   * 
   * @example
   * ```typescript
   * const entry = this.createLogEntry('error', 'Database connection failed', {
   *   error: new Error('ECONNREFUSED'),
   *   host: 'localhost',
   *   port: 5432
   * });
   * ```
   */
  private createLogEntry(level: LogLevel, message: string, meta?: LogEntryMeta): LogEntry {
    const now = new Date();
    
    // Extract error and context from metadata
    let error: LogEntry['error'];
    let context: Record<string, unknown> | undefined;

    if (meta instanceof Error) {
      // Direct error object
      error = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
      context = undefined;
    } else if (meta?.error instanceof Error) {
      // Metadata object containing an error
      error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      context = { ...meta };
      delete context.error;
    } else {
      // Plain metadata object
      context = meta as Record<string, unknown> | undefined;
    }

    // Create complete log entry
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
   * Gathers environment metadata for log entries.
   * Collects platform-specific information about the runtime environment.
   * 
   * @private
   * @returns {LogMetadata} Object containing environment information
   * 
   * @example
   * ```typescript
   * // In Node.js:
   * // { hostname: 'server-01', pid: 12345, platform: 'linux', nodeVersion: 'v16.0.0' }
   * 
   * // In Browser:
   * // { userAgent: 'Mozilla/5.0...', platform: 'MacIntel' }
   * ```
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
   * Strips ANSI escape codes from a string.
   * Used to create plain text versions of colorized messages.
   * 
   * @private
   * @param {string} str - String potentially containing ANSI codes
   * @returns {string} String with all ANSI codes removed
   * 
   * @example
   * ```typescript
   * const colored = '\x1b[31mError\x1b[0m: Something went wrong';
   * const plain = this.stripAnsiCodes(colored);
   * // Returns: 'Error: Something went wrong'
   * ```
   */
  private stripAnsiCodes(str: string): string {
    // Handle non-string inputs
    if (typeof str !== 'string') {
      str = String(str);
    }
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Core logging method that handles all log operations.
   * Creates a structured log entry and sends it to all configured transports.
   * Falls back to legacy output if no transports are configured.
   * 
   * @public
   * @param {string} msg - The message to log
   * @param {LogLevel} [level='info'] - Log level
   * @param {LogEntryMeta} [meta] - Additional metadata or error
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Basic logging
   * logger.log('User action', 'info');
   * 
   * // With metadata
   * logger.log('Database query', 'debug', {
   *   query: 'SELECT * FROM users',
   *   duration: 145
   * });
   * 
   * // With error
   * logger.log('Operation failed', 'error', new Error('Timeout'));
   * ```
   */
  public log(msg: string, level: LogLevel = 'info', meta?: LogEntryMeta): void {
    // Create structured log entry
    const entry = this.createLogEntry(level, msg, meta);

    // Send to transports if available
    if (this.transportManager && this.transportManager.getTransportNames().length > 0) {
      this.transportManager.log(entry).catch(error => {
        console.error('[Logger] Failed to log to transports:', error);
      });
    }

    // Use legacy output if enabled or no transports configured
    if (this.useLegacyOutput || this.transportManager.getTransportNames().length === 0) {
      this.loggerInstance.log(msg, level);
    }
  }

  /**
   * Logs an info-level message.
   * Used for general informational messages about application flow.
   * 
   * @public
   * @param {string} msg - Info message
   * @param {LogEntryMeta} [meta] - Additional metadata
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.info('Server started', { port: 3000, env: 'production' });
   * logger.info('User logged in', { userId: '12345', ip: '192.168.1.1' });
   * ```
   */
  public info(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'info', meta);
  }

  /**
   * Logs a success message.
   * Used to indicate successful completion of operations.
   * 
   * @public
   * @param {string} msg - Success message
   * @param {LogEntryMeta} [meta] - Additional metadata
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.success('Database migration completed');
   * logger.success('File uploaded', { filename: 'report.pdf', size: 1024000 });
   * ```
   */
  public success(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'success', meta);
  }

  /**
   * Logs a warning message.
   * Used for potentially problematic situations that don't prevent operation.
   * 
   * @public
   * @param {string} msg - Warning message
   * @param {LogEntryMeta} [meta] - Additional metadata
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', { remaining: 100, resetAt: '2023-01-01T00:00:00Z' });
   * logger.warn('Deprecated function called', { function: 'oldMethod', alternative: 'newMethod' });
   * ```
   */
  public warn(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'warn', meta);
  }

  /**
   * Logs an error message.
   * Used for error conditions that require attention.
   * 
   * @public
   * @param {string} msg - Error message
   * @param {LogEntryMeta} [meta] - Additional metadata or error object
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Log with error object
   * logger.error('Database connection failed', new Error('ECONNREFUSED'));
   * 
   * // Log with error and additional context
   * logger.error('API request failed', {
   *   error: new Error('Network error'),
   *   endpoint: '/api/users',
   *   retryCount: 3
   * });
   * ```
   */
  public error(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'error', meta);
  }

  /**
   * Logs a debug message.
   * Only shown when verbose mode is enabled. Used for detailed debugging information.
   * 
   * @public
   * @param {string} msg - Debug message
   * @param {LogEntryMeta} [meta] - Additional metadata
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.debug('Function entry', { args: [1, 2, 3], caller: 'processData' });
   * logger.debug('Cache hit', { key: 'user:12345', ttl: 3600 });
   * ```
   */
  public debug(msg: string, meta?: LogEntryMeta): void {
    this.log(msg, 'debug', meta);
  }

  /**
   * Adds a transport to the logger.
   * Transports handle the actual delivery of log messages to their destinations.
   * 
   * @public
   * @async
   * @param {Transport} transport - Transport instance to add
   * @returns {Promise<void>} Resolves when transport is successfully added
   * @throws {Error} If transport with the same name already exists
   * 
   * @example
   * ```typescript
   * // Add console transport
   * import { ConsoleTransport } from 'magiclogger/transports/console';
   * await logger.addTransport(new ConsoleTransport({ level: 'debug' }));
   * 
   * // Add file transport
   * import { FileTransport } from 'magiclogger/transports/file';
   * await logger.addTransport(new FileTransport({ 
   *   filepath: './logs/app.log',
   *   maxFileSize: 10485760 // 10MB
   * }));
   * ```
   */
  public async addTransport(transport: Transport): Promise<void> {
    await this.transportManager.registerTransport(transport);
  }

  /**
   * Removes a transport by name.
   * The transport is properly closed before removal.
   * 
   * @public
   * @async
   * @param {string} name - Name of the transport to remove
   * @returns {Promise<void>} Resolves when transport is removed
   * @throws {Error} If transport with given name is not found
   * 
   * @example
   * ```typescript
   * // Remove a specific transport
   * await logger.removeTransport('console');
   * await logger.removeTransport('file-app-log');
   * ```
   */
  public async removeTransport(name: string): Promise<void> {
    await this.transportManager.removeTransport(name);
  }

  /**
   * Gets a transport by name.
   * Useful for runtime transport configuration or inspection.
   * 
   * @public
   * @param {string} name - Transport name
   * @returns {Transport | undefined} The transport instance if found, undefined otherwise
   * 
   * @example
   * ```typescript
   * const consoleTransport = logger.getTransport('console');
   * if (consoleTransport) {
   *   console.log('Console transport is configured');
   * }
   * ```
   */
  public getTransport(name: string): Transport | undefined {
    return this.transportManager.getTransport(name);
  }

  /**
   * Lists all configured transport names.
   * Useful for debugging or dynamic transport management.
   * 
   * @public
   * @returns {string[]} Array of transport names
   * 
   * @example
   * ```typescript
   * const transports = logger.listTransports();
   * console.log('Active transports:', transports);
   * // Output: ['console', 'file-app-log', 'http-api']
   * ```
   */
  public listTransports(): string[] {
    return this.transportManager.getTransportNames();
  }

  /**
   * Gets statistics for all transports.
   * Provides insights into transport performance and health.
   * 
   * @public
   * @returns {Record<string, unknown>} Object containing statistics for each transport
   * 
   * @example
   * ```typescript
   * const stats = logger.getTransportStats();
   * console.log('Transport statistics:', stats);
   * // {
   * //   'console': { processed: 1000, errors: 0, lastError: null },
   * //   'file': { processed: 1000, errors: 2, lastError: 'ENOSPC' }
   * // }
   * ```
   */
  public getTransportStats(): Record<string, unknown> {
    return this.transportManager.getStats();
  }

  /**
   * Closes the logger and all transports.
   * Ensures all pending logs are flushed and resources are cleaned up.
   * 
   * @public
   * @async
   * @returns {Promise<void>} Resolves when logger and all transports are closed
   * 
   * @example
   * ```typescript
   * // Graceful shutdown
   * process.on('SIGTERM', async () => {
   *   await logger.close();
   *   process.exit(0);
   * });
   * ```
   */
  public async close(): Promise<void> {
    await this.transportManager.close();
    
    // Close legacy logger if it has a close method
    const extendedLogger = this.loggerInstance as ExtendedLoggerInstance;
    if (typeof extendedLogger.close === 'function') {
      await extendedLogger.close();
    }
  }

  // ============================================================
  // Legacy Methods for Backward Compatibility
  // ============================================================

  /**
   * Logs a custom message with custom colors (legacy method).
   * Primarily used for backward compatibility with older versions.
   * 
   * @public
   * @param {string} msg - The message to log
   * @param {ColorName[]} [colors=['white']] - Array of color/style names
   * @param {string} [prefix='LOG'] - The prefix to use
   * @returns {void}
   * 
   * @deprecated Use standard log methods with transports for better control
   * 
   * @example
   * ```typescript
   * logger.custom('Important message', ['red', 'bold'], 'ALERT');
   * logger.custom('Debug info', ['gray'], 'DEBUG');
   * ```
   */
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.custom(msg, colors, prefix);
    }
    
    // Convert to standard log
    this.log(msg, prefix.toLowerCase() as LogLevel);
  }

  /**
   * Logs a message with a preset style (legacy method).
   * Maps preset styles to standard log levels where possible.
   * 
   * @public
   * @param {string} msg - The message to log
   * @param {StylePreset} preset - The preset style to apply
   * @returns {void}
   * 
   * @deprecated Use standard log methods for better consistency
   * 
   * @example
   * ```typescript
   * logger.styled('Server ready', 'success');
   * logger.styled('Configuration loaded', 'highlight');
   * ```
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
   * Prints a section header (legacy method).
   * Creates a visually prominent header in the console output.
   * 
   * @public
   * @param {string} title - The header title
   * @param {ColorName[]} [colors=['brightWhite', 'bgBlue', 'bold']] - Optional custom colors
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.header('Application Configuration');
   * logger.header('Test Results', ['green', 'bold']);
   * ```
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    // Always use console for visual elements
    this.loggerInstance.header(title, colors);
  }

  /**
   * Prints a table from an array of objects (legacy method).
   * Creates a formatted table in the console output.
   * 
   * @public
   * @param {Record<string, unknown>[]} data - Array of objects to display
   * @param {ColorName[]} [headerColor=['brightWhite', 'bold']] - Optional color for the header row
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.table([
   *   { name: 'John', age: 30, city: 'New York' },
   *   { name: 'Jane', age: 25, city: 'London' }
   * ]);
   * ```
   */
  public table(data: Record<string, unknown>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
    // Always use console for visual elements
    this.loggerInstance.table(data, headerColor);
  }

  /**
   * Prints a progress bar (legacy method).
   * Displays a visual progress indicator in the console.
   * 
   * @public
   * @param {number} progress - Current progress (0-100)
   * @param {number} [length=20] - Length of the progress bar in characters
   * @param {string} [completeChar='█'] - Character for completed portion
   * @param {string} [incompleteChar='░'] - Character for incomplete portion
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Show 75% progress
   * logger.progressBar(75);
   * 
   * // Custom progress bar
   * logger.progressBar(50, 30, '=', '-');
   * ```
   */
  public progressBar(progress: number, length = 20, completeChar = '█', incompleteChar = '░'): void {
    // Always use console for visual elements
    this.loggerInstance.progressBar(progress, length, completeChar, incompleteChar);
  }

  /**
   * Logs a clickable link (legacy method).
   * Creates a clickable link in terminals that support it.
   * 
   * @public
   * @param {string} url - The URL or file path to link
   * @param {string} [description] - Optional description text
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.link('https://github.com/user/repo');
   * logger.link('file:///var/log/app.log', 'View log file');
   * ```
   */
  public link(url: string, description?: string): void {
    if (this.useLegacyOutput) {
      this.loggerInstance.link(url, description);
    } else {
      this.info(`${description || url}: ${url}`);
    }
  }

  /**
   * Creates a reusable color function (legacy method).
   * Returns a function that applies the specified colors to text.
   * 
   * @public
   * @param {...ColorName[]} colors - Array of color/style names
   * @returns {(text: string) => string} Function that applies colors to text
   * 
   * @example
   * ```typescript
   * const errorStyle = logger.color('red', 'bold');
   * console.log(errorStyle('Error:'), 'Something went wrong');
   * 
   * const highlight = logger.color('yellow', 'bgBlack');
   * console.log(highlight('Important notice'));
   * ```
   */
  public color(...colors: ColorName[]): (text: string) => string {
    return this.loggerInstance.color(...colors);
  }

  /**
   * Applies different colors to specific parts of a message (legacy method).
   * Allows fine-grained control over text coloring.
   * 
   * @public
   * @param {string} message - The full message
   * @param {Record<string, ColorName[]>} colorMap - Object mapping text parts to color arrays
   * @returns {string} The message with colors applied
   * 
   * @example
   * ```typescript
   * const colored = logger.colorParts('Status: OK, Errors: 0', {
   *   'Status:': ['blue', 'bold'],
   *   'OK': ['green'],
   *   'Errors:': ['red', 'bold'],
   *   '0': ['green']
   * });
   * console.log(colored);
   * ```
   */
  public colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    return this.loggerInstance.colorParts(message, colorMap);
  }

  /**
   * Sets verbose mode for the logger.
   * When enabled, debug messages are shown.
   * 
   * @public
   * @param {boolean} enabled - Whether to enable verbose mode
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Enable verbose logging
   * logger.setVerbose(true);
   * logger.debug('This will now be visible');
   * 
   * // Disable verbose logging
   * logger.setVerbose(false);
   * logger.debug('This will not be visible');
   * ```
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
   * Enables or disables color output.
   * Affects console output and legacy logging methods.
   * 
   * @public
   * @param {boolean} enabled - Whether to enable colors
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Disable colors (useful for log files or CI environments)
   * logger.setColorsEnabled(false);
   * 
   * // Re-enable colors
   * logger.setColorsEnabled(true);
   * ```
   */
  public setColorsEnabled(enabled: boolean): void {
    this.loggerInstance.setColorsEnabled(enabled);
  }

  /**
   * Gets the current theme configuration.
   * Themes define color schemes for different log elements.
   * 
   * @public
   * @returns {Record<string, ColorName[]>} Current theme configuration
   * 
   * @example
   * ```typescript
   * const theme = logger.theme;
   * console.log('Info colors:', theme.info);
   * // Output: ['blue']
   * ```
   */
  public get theme(): Record<string, ColorName[]> {
    return (this.loggerInstance as LoggerBase).getTheme();
  }

  /**
   * Sets or replaces the theme configuration.
   * Allows customization of colors for different log levels and elements.
   * 
   * @public
   * @param {Record<string, unknown>} theme - The theme definition
   * @returns {void}
   * 
   * @example
   * ```typescript
   * logger.setTheme({
   *   info: ['cyan'],
   *   success: ['green', 'bold'],
   *   error: ['red', 'underline'],
   *   warning: ['yellow', 'bgBlack']
   * });
   * ```
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

  // ============================================================
  // Property Getters for Backward Compatibility
  // ============================================================

  /**
   * Gets the verbose mode setting.
   * @returns {boolean} Whether verbose mode is enabled
   */
  public get verbose(): boolean {
    return (this.loggerInstance as LoggerBase).isVerbose();
  }

  /**
   * Gets the write-to-disk setting (Node.js only).
   * @returns {boolean} Whether file logging is enabled
   */
  public get writeToDisk(): boolean {
    if (this.loggerInstance instanceof NodeLogger) {
      return this.loggerInstance.isWriteToDiskEnabled();
    }
    return false;
  }

  /**
   * Gets the colors enabled setting.
   * @returns {boolean} Whether colors are enabled
   */
  public get useColors(): boolean {
    return (this.loggerInstance as LoggerBase).areColorsEnabled();
  }

  /**
   * Gets the log retention days setting (Node.js only).
   * @returns {number} Number of days to retain logs
   */
  public get logRetentionDays(): number {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      return nodeLogger.logRetentionDays || 30;
    }
    return 30;
  }

  /**
   * Gets the log directory path (Node.js only).
   * @returns {string} Log directory path
   */
  public get logDir(): string {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      return nodeLogger.logDir || 'logs';
    }
    return 'logs';
  }

  /**
   * Gets the current log file path (Node.js only).
   * @returns {string | null} Current log file path or null
   */
  public get logFile(): string | null {
    return this.getPath();
  }

  // ============================================================
  // Color and Formatting Methods
  // ============================================================

  /**
   * Applies colors to text using ANSI escape codes.
   * Internal method exposed for compatibility.
   * 
   * @public
   * @param {string} text - Text to colorize
   * @param {ColorName[]} colors - Array of color names
   * @returns {string} Colored text
   */
  public colorize(text: string, colors: ColorName[]): string {
    try {
      return Colorizer.applyColors(text, colors, this.useColors);
    } catch {
      return text;
    }
  }

  /**
   * Preserves links in text during formatting.
   * Internal method exposed for compatibility.
   * 
   * @public
   * @param {string} text - Text that may contain links
   * @returns {string} Text with preserved links
   */
  public preserveLinks(text: string): string {
    try {
      const formatter = new Formatter(this.useColors);
      return formatter.preserveLinks(text);
    } catch {
      return text;
    }
  }

  /**
   * Applies a preset style to text.
   * Internal method exposed for compatibility.
   * 
   * @public
   * @param {string} text - Text to style
   * @param {StylePreset} preset - Style preset to apply
   * @returns {string} Styled text
   */
  public applyPreset(text: string, preset: StylePreset): string {
    // Use the Colorizer class that was imported at the top
    if (this.useColors) {
      return Colorizer.applyPreset(text, preset, this.useColors);
    }
    return text;
  }

  /**
   * Normalizes path separators to use forward slashes.
   * Instance method for backward compatibility.
   * 
   * @public
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path with forward slashes
   */
  public normalizePath(path: string): string {
    return Logger.normalizePath(path);
  }

  /**
   * Initializes log file (Node.js only).
   * Internal method exposed for compatibility.
   * 
   * @public
   * @returns {void}
   */
  public initLogFile(): void {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as unknown as ExtendedNodeLogger;
      if (nodeLogger.fileManager) {
        nodeLogger.fileManager.initLogFile().catch((err: Error) => {
          console.error('Failed to initialize log file:', err);
          nodeLogger.writeToDisk = false;
        });
      }
    }
  }

  /**
   * Cleans up old log files (Node.js only).
   * Internal method exposed for compatibility.
   * 
   * @public
   * @returns {void}
   */
  public cleanupOldLogs(): void {
    if (this.loggerInstance instanceof NodeLogger) {
      this.loggerInstance.cleanupOldLogs();
    }
  }

  // ============================================================
  // File-related Methods (Node.js only)
  // ============================================================

  /**
   * Gets the current log file path (Node.js only).
   * Returns null if file logging is not enabled or in browser environment.
   * 
   * @public
   * @returns {string | null} The log file path or null
   * 
   * @example
   * ```typescript
   * const logPath = logger.getPath();
   * if (logPath) {
   *   console.log('Logging to:', logPath);
   * }
   * ```
   */
  public getPath(): string | null {
    // Check if logFile property is set (for testing or manual override)
    if ('logFile' in this && this.logFile) {
      return this.logFile as string;
    }
    
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as NodeLogger;
      return nodeLogger.getLogFilePath();
    }
    return null;
  }

  /**
   * Gets the current log directory (Node.js only).
   * Returns the configured directory path for log files.
   * 
   * @public
   * @returns {string} The configured log directory
   * 
   * @example
   * ```typescript
   * const logDir = logger.getLogDir();
   * console.log('Log directory:', logDir);
   * // Output: './logs' or configured path
   * ```
   */
  public getLogDir(): string {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as NodeLogger;
      return nodeLogger.getLogDirectory();
    }
    return 'logs';
  }

  /**
   * Sets the log directory (Node.js only).
   * Changes where log files are stored on disk.
   * 
   * @public
   * @param {string} dir - New log directory path
   * @param {boolean} [reinitialize=false] - Whether to reinitialize the log file
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Change log directory
   * logger.setLogDir('/var/log/myapp');
   * 
   * // Change and reinitialize
   * logger.setLogDir('./logs/production', true);
   * ```
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
   * Gets the log retention period in days (Node.js only).
   * Returns the number of days log files are kept before deletion.
   * 
   * @public
   * @returns {number} Number of days to retain logs
   * 
   * @example
   * ```typescript
   * const retention = logger.getLogRetentionDays();
   * console.log(`Logs are kept for ${retention} days`);
   * ```
   */
  public getLogRetentionDays(): number {
    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as NodeLogger;
      return nodeLogger.getLogRetentionDays();
    }
    return 30;
  }

  /**
   * Sets the log retention period in days (Node.js only).
   * Configures how long log files are kept before automatic deletion.
   * 
   * @public
   * @param {number} days - Number of days to retain logs (minimum: 1)
   * @param {boolean} [cleanNow=false] - Whether to clean old logs immediately
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Set 7-day retention
   * logger.setLogRetentionDays(7);
   * 
   * // Set retention and clean immediately
   * logger.setLogRetentionDays(3, true);
   * ```
   */
  public setLogRetentionDays(days: number, cleanNow = false): void {
    // Validate days parameter - minimum 1 day
    const validDays = Math.max(1, Math.floor(days) || 1);
    if (validDays !== days && days !== undefined) {
      console.warn(`[Logger] Invalid logRetentionDays: ${days}. Using: ${validDays}`);
    }

    if (this.loggerInstance instanceof NodeLogger) {
      const nodeLogger = this.loggerInstance as NodeLogger;
      // Set retention days without cleaning now - we'll handle cleanup separately
      nodeLogger.setLogRetentionDays(validDays, false);
      
      // Handle cleanup at Logger level so spy can catch it
      if (cleanNow) {
        this.cleanupOldLogs();
      }
    }
  }

  /**
   * Enables or disables file logging (Node.js only).
   * Controls whether logs are written to disk in addition to other transports.
   * 
   * @public
   * @param {boolean} enabled - Whether to enable file logging
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Enable file logging
   * logger.setFileLogging(true);
   * 
   * // Disable file logging
   * logger.setFileLogging(false);
   * ```
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

  // ============================================================
  // Browser Storage Methods (Browser only)
  // ============================================================

  /**
   * Gets all stored logs from browser storage (browser only).
   * Returns null in Node.js environment.
   * 
   * @public
   * @returns {string[] | null} Array of log entries or null
   * 
   * @example
   * ```typescript
   * const logs = logger.getLogs();
   * if (logs) {
   *   console.log(`Found ${logs.length} stored logs`);
   *   logs.forEach(log => console.log(log));
   * }
   * ```
   */
  public getLogs(): string[] | null {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      return (this.loggerInstance as BrowserLogger).getLogs();
    }
    return null;
  }

  /**
   * Clears all stored logs from browser storage (browser only).
   * No effect in Node.js environment.
   * 
   * @public
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Clear browser log storage
   * logger.clearLogs();
   * console.log('Browser logs cleared');
   * ```
   */
  public clearLogs(): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).clearLogs();
    }
  }

  /**
   * Downloads stored logs as a text file (browser only).
   * Triggers a file download in the browser with all stored logs.
   * 
   * @public
   * @param {string} [filename='logs.txt'] - The filename to use for download
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Download logs with default filename
   * logger.downloadLogs();
   * 
   * // Download with custom filename
   * logger.downloadLogs('debug-logs-2023-01-01.txt');
   * ```
   */
  public downloadLogs(filename = 'logs.txt'): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).downloadLogs(filename);
    }
  }

  /**
   * Enables or disables browser storage (browser only).
   * Controls whether logs are stored in browser localStorage.
   * 
   * @public
   * @param {boolean} enabled - Whether to enable browser storage
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Enable browser storage
   * logger.setStorageEnabled(true);
   * 
   * // Disable browser storage (for sensitive environments)
   * logger.setStorageEnabled(false);
   * ```
   */
  public setStorageEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined' && this.loggerInstance instanceof BrowserLogger) {
      (this.loggerInstance as BrowserLogger).setStorageEnabled(enabled);
    }
  }

  // ============================================================
  // Static Utility Methods
  // ============================================================

  /**
   * Normalizes path separators to use forward slashes.
   * Ensures consistent path handling across platforms.
   * 
   * @static
   * @public
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path with forward slashes
   * 
   * @example
   * ```typescript
   * const normalized = Logger.normalizePath('C:\\Users\\John\\logs');
   * // Returns: 'C:/Users/John/logs'
   * ```
   */
  public static normalizePath(path: string): string {
    if (!path) return path;
    return path.replace(/\\/g, '/');
  }

  /**
   * Normalizes line endings to LF (\\n).
   * Ensures consistent line endings across platforms.
   * 
   * @static
   * @public
   * @param {string} text - Text to normalize
   * @returns {string} Text with normalized line endings
   * 
   * @example
   * ```typescript
   * const normalized = Logger.normalizeLineEndings('Hello\r\nWorld\r\n');
   * // Returns: 'Hello\nWorld\n'
   * ```
   */
  public static normalizeLineEndings(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\r\n/g, '\n');
  }

  /**
   * Checks if a string looks like a URL or file path.
   * Used for automatic link detection in log messages.
   * 
   * @static
   * @public
   * @param {string} text - Text to check
   * @returns {boolean} True if text appears to be a link or path
   * 
   * @example
   * ```typescript
   * Logger.isLinkLike('https://example.com'); // true
   * Logger.isLinkLike('file:///home/user/file.txt'); // true
   * Logger.isLinkLike('/var/log/app.log'); // true
   * Logger.isLinkLike('Just a normal message'); // false
   * ```
   */
  public static isLinkLike(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return IS_PATH_REGEX.test(text);
  }

  /**
   * Recursively cleans up a directory and its contents.
   * Used for log directory maintenance and cleanup operations.
   * 
   * @static
   * @public
   * @param {string} dir - Directory path to clean
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Clean up old log directory
   * Logger.cleanupDirectory('./logs/old');
   * ```
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

// ============================================================
// Type Re-exports
// ============================================================

/**
 * Re-export commonly used types for convenience.
 * This allows users to import types alongside the Logger class.
 */
export type { 
  LoggerOptions, 
  LogLevel, 
  StylePreset, 
  ColorName,
  Transport,
  TransportOptions,
  LogEntry 
} from './types';
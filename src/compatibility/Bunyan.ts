// File: src/compatibility/Bunyan.ts

import { isBrowserEnvironment } from '../utils/environment';
import { BROWSER_POLYFILLS } from '../utils/browser-polyfills';
import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

/**
 * Bunyan log record interface.
 * 
 * @interface BunyanRecord
 */
interface BunyanRecord {
  v: number;
  level: number;
  name: string;
  hostname: string;
  pid: number;
  time: string;
  msg: string;
  src?: {
    file: string;
    line: number;
    func?: string;
  };
  err?: {
    message: string;
    name: string;
    stack: string;
    code?: string;
  };
  [key: string]: unknown;
}

/**
 * Bunyan serializer functions.
 * 
 * @interface BunyanSerializers
 */
interface BunyanSerializers {
  [key: string]: (value: unknown) => unknown;
}

/**
 * Bunyan stream configuration.
 * 
 * @interface BunyanStream
 */
interface BunyanStream {
  level?: string | number;
  stream?: NodeJS.WritableStream;
  type?: 'stream' | 'file' | 'rotating-file';
  path?: string;
  period?: string;
  count?: number;
}

/**
 * Configuration options for Bunyan-compatible logger.
 * 
 * @interface BunyanCompatibleOptions
 * @extends {LogCompatibilityOptions}
 */
export interface BunyanCompatibleOptions extends LogCompatibilityOptions {
  /**
   * Logger name (required in Bunyan).
   */
  name: string;

  /**
   * Log level as string or number.
   * @default 'info'
   */
  level?: string | number;

  /**
   * Whether to show logger name in output.
   * @default true
   */
  showName?: boolean;

  /**
   * Whether to show process ID.
   * @default false
   */
  showPid?: boolean;

  /**
   * Whether to show hostname.
   * @default false
   */
  showHostname?: boolean;

  /**
   * Default tags to apply to all log entries.
   */
  defaultTags?: string[];

  /**
   * Default context to apply to all log entries.
   */
  defaultContext?: Record<string, unknown>;

  /**
   * Custom serializers for objects.
   */
  serializers?: BunyanSerializers;

  /**
   * Output streams configuration.
   */
  streams?: BunyanStream[];

  /**
   * Source code location tracking.
   * @default false
   */
  src?: boolean;

  /**
   * Additional fields to include in every log.
   */
  fields?: Record<string, unknown>;
}

/**
 * Extended NodeJS error type
 */
interface ExtendedError extends NodeJS.ErrnoException {
  signal?: NodeJS.Signals;
}

/**
 * Bunyan-compatible logger implementation.
 * 
 * Provides a Bunyan-style API with:
 * - Bunyan log record format
 * - Level numbers (10-60)
 * - Serializers support
 * - Child logger support
 * - Source location tracking
 * - Multiple output streams
 * 
 * @class BunyanCompatibleLogger
 * @extends {BaseCompatibleLogger}
 * 
 * @example
 * ```typescript
 * const logger = createBunyanCompatible({
 *   name: 'myapp',
 *   level: 'debug',
 *   serializers: {
 *     err: bunyan.stdSerializers.err,
 *     req: bunyan.stdSerializers.req
 *   }
 * });
 * 
 * // Bunyan-style logging
 * logger.info('User login');
 * logger.info({ user: 'john' }, 'User login');
 * logger.error(err, 'Database connection failed');
 * 
 * // Child loggers
 * const child = logger.child({ component: 'auth' });
 * child.info('Authentication started');
 * ```
 */
export class BunyanCompatibleLogger extends BaseCompatibleLogger {
  private showName: boolean;
  private showPid: boolean;
  private showHostname: boolean;
  private defaultTags?: string[];
  private defaultContext?: Record<string, unknown>;
  private serializers: BunyanSerializers;
  private streams: BunyanStream[];
  private src: boolean;
  private _fields: Record<string, unknown>;
  private os: { hostname?: () => string } | undefined;
  private _level: number;

  /**
   * Bunyan level names to numbers.
   * @private
   * @static
   */
  private static readonly levelFromName: Record<string, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  };

  /**
   * Bunyan level numbers to names.
   * @private
   * @static
   */
  private static readonly nameFromLevel: Record<number, string> = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  };

  /**
   * Standard Bunyan serializers.
   * @static
   */
  public static stdSerializers = {
    err: (err: Error | unknown): unknown => {
      if (!err || !(err instanceof Error) || !err.stack) {
        return err;
      }
      const extErr = err as ExtendedError;
      return {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: extErr.code,
        signal: extErr.signal,
      };
    },
    
    req: (req: unknown): unknown => {
      const request = req as Record<string, unknown>;
      if (!request || !request.method) {
        return req;
      }
      return {
        method: request.method,
        url: request.url,
        headers: request.headers,
        remoteAddress: (request.connection as Record<string, unknown>)?.remoteAddress,
        remotePort: (request.connection as Record<string, unknown>)?.remotePort,
      };
    },

    res: (res: unknown): unknown => {
      const response = res as Record<string, unknown>;
      if (!response || !response.statusCode) {
        return res;
      }
      return {
        statusCode: response.statusCode,
        headers: typeof response.getHeaders === 'function' ? response.getHeaders() : undefined,
      };
    },
  };

  /**
   * Creates a new Bunyan-compatible logger.
   * 
   * @param {BunyanCompatibleOptions} options - Logger options
   */
  constructor(options: BunyanCompatibleOptions) {
    const opts = { ...options, name: options?.name || 'app' };
    super(opts);

    this.showName = opts.showName !== false;
    this.showPid = opts.showPid === true;
    this.showHostname = opts.showHostname === true;
    this.defaultTags = opts.defaultTags;
    this.defaultContext = opts.defaultContext;
    this.serializers = { ...BunyanCompatibleLogger.stdSerializers, ...opts.serializers };
    this.streams = opts.streams || [];
    this.src = opts.src || false;
    this._fields = opts.fields || {};

    // Set level
    if (typeof opts.level === 'number') {
      this._level = opts.level;
    } else {
      this._level = BunyanCompatibleLogger.levelFromName[opts.level || 'info'] || 30;
    }

    this.initOsModule();
  }

  /**
   * Dynamically loads the OS module or polyfill for compatibility.
   * @private
   */
  private async initOsModule(): Promise<void> {
    if (!this.os) {
      this.os = isBrowserEnvironment()
        ? BROWSER_POLYFILLS.os
        : (await import('os')).default || (await import('os'));
    }
  }

  /**
   * Get current log level number.
   */
  public level(): number;
  public level(value: number | string): void;
  public level(value?: number | string): number | void {
    if (value === undefined) {
      return this._level;
    }

    if (typeof value === 'number') {
      this._level = value;
    } else {
      this._level = BunyanCompatibleLogger.levelFromName[value] || 30;
    }
  }

  /**
   * Create a Bunyan log record.
   * 
   * @param {number} level - Log level number
   * @param {any} msgOrFields - Message or fields object
   * @param {string} [msg] - Optional message
   * @returns {BunyanRecord} Bunyan record
   * @private
   */
  private createRecord(level: number, msgOrFields: unknown, msg?: string): BunyanRecord {
    const time = new Date();
    const record: BunyanRecord = {
      v: 0, // Bunyan format version
      level,
      name: this.name,
      hostname: this.getHostname(),
      pid: process.pid || 0,
      time: time.toISOString(),
      msg: '',
      ...this._fields,
    };

    // Handle different argument patterns
    let fields: Record<string, unknown> = {};
    
    if (typeof msgOrFields === 'string') {
      record.msg = msgOrFields;
    } else if (msgOrFields instanceof Error) {
      record.msg = msgOrFields.message;
      if (this.serializers.err) {
        record.err = this.serializers.err(msgOrFields) as BunyanRecord['err'];
      } else {
        record.err = {
          message: msgOrFields.message,
          name: msgOrFields.name,
          stack: msgOrFields.stack || '',
        };
      }
    } else if (typeof msgOrFields === 'object' && msgOrFields !== null) {
      fields = msgOrFields as Record<string, unknown>;
      record.msg = msg || '';
    }

    // Apply serializers
    for (const [key, value] of Object.entries(fields)) {
      if (this.serializers[key]) {
        record[key] = this.serializers[key](value);
      } else {
        record[key] = value;
      }
    }

    // Add source info if enabled
    if (this.src) {
      record.src = this.getCaller();
    }

    // Add tags and context
    if (this.defaultTags || fields.tags) {
      record.tags = [...(this.defaultTags || []), ...((fields.tags as string[]) || [])];
    }

    if (this.defaultContext || fields.context) {
      Object.assign(record, this.defaultContext, fields.context);
    }

    return record;
  }

  /**
   * Get hostname with caching.
   * 
   * @returns {string} Hostname
   * @private
   */
  private getHostname(): string {
    if (!this.showHostname) return 'localhost';
    
    try {
      return this.os?.hostname?.() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get source location of log call.
   * 
   * @returns {object} Source info
   * @private
   */
  private getCaller(): BunyanRecord['src'] {
    const err = new Error();
    const stack = err.stack?.split('\n') || [];
    
    // Find the first stack frame outside this file
    for (let i = 3; i < stack.length; i++) {
      const line = stack[i];
      if (line.includes('BunyanCompatibleLogger')) continue;
      
      const match = line.match(/at\s+(?:(.+?)\s+)?\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          file: match[2],
          line: parseInt(match[3], 10),
          func: match[1],
        };
      }
    }

    return { file: 'unknown', line: 0 };
  }

  /**
   * Format and output a Bunyan record.
   * 
   * @param {BunyanRecord} record - Record to output
   * @private
   */
  private outputRecord(record: BunyanRecord): void {
    // Check level filtering
    if (record.level < this._level) return;

    // Format output
    let output: string;
    
    if (this.format === 'json') {
      output = JSON.stringify(record);
    } else {
      // Bunyan-style formatted output
      const levelName = BunyanCompatibleLogger.nameFromLevel[record.level] || 'unknown';
      const parts: string[] = [record.time];
      
      if (this.showName) parts.push(`[${record.name}]`);
      if (this.showPid) parts.push(`[${record.pid}]`);
      
      parts.push(levelName.toUpperCase());
      parts.push(record.msg);

      // Add additional fields - create a copy to avoid mutating
      const displayFields: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(record)) {
        if (!['v', 'level', 'name', 'hostname', 'pid', 'time', 'msg', 'src'].includes(key)) {
          displayFields[key] = value;
        }
      }
      
      if (Object.keys(displayFields).length > 0) {
        parts.push(JSON.stringify(displayFields));
      }

      output = parts.join(' ');
    }

    // Send to streams
    if (this.streams.length > 0) {
      for (const stream of this.streams) {
        if (stream.level && record.level < this.resolveLevel(stream.level)) {
          continue;
        }

        if (stream.stream) {
          stream.stream.write(output + '\n');
        }
      }
    } else {
      // Use underlying logger
      const levelName = BunyanCompatibleLogger.nameFromLevel[record.level];
      this.logToUnderlying(levelName || 'info', output);
    }
  }

  /**
   * Resolve level string/number to number.
   * 
   * @param {string | number} level - Level to resolve
   * @returns {number} Level number
   * @private
   */
  private resolveLevel(level: string | number): number {
    if (typeof level === 'number') return level;
    return BunyanCompatibleLogger.levelFromName[level] || 30;
  }

  /**
   * Log to underlying logger.
   * 
   * @param {string} level - Level name
   * @param {string} message - Message to log
   * @private
   */
  private logToUnderlying(level: string, message: string): void {
    switch (level) {
      case 'trace':
        this.logger.debug(`TRACE: ${message}`);
        break;
      case 'debug':
        this.logger.debug(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      case 'error':
        this.logger.error(message);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${message}`);
        break;
      default:
        this.logger.info(message);
    }
  }

  /**
   * Generic log method implementation.
   * 
   * @param {string} level - Log level
   * @param {...any} args - Log arguments
   */
  public log(level: string, ...args: unknown[]): void {
    const levelNum = BunyanCompatibleLogger.levelFromName[level.toLowerCase()] || 30;
    const record = this.createRecord(levelNum, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan trace method.
   */
  public trace(): void;
  public trace(error: Error, ...params: unknown[]): void;
  public trace(obj: Record<string, unknown>, ...params: unknown[]): void;
  public trace(format: string, ...params: unknown[]): void;
  public trace(...args: unknown[]): void {
    const record = this.createRecord(10, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan debug method.
   */
  public debug(): void;
  public debug(error: Error, ...params: unknown[]): void;
  public debug(obj: Record<string, unknown>, ...params: unknown[]): void;
  public debug(format: string, ...params: unknown[]): void;
  public debug(...args: unknown[]): void {
    const record = this.createRecord(20, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan info method.
   */
  public info(): void;
  public info(error: Error, ...params: unknown[]): void;
  public info(obj: Record<string, unknown>, ...params: unknown[]): void;
  public info(format: string, ...params: unknown[]): void;
  public info(...args: unknown[]): void {
    const record = this.createRecord(30, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan warn method.
   */
  public warn(): void;
  public warn(error: Error, ...params: unknown[]): void;
  public warn(obj: Record<string, unknown>, ...params: unknown[]): void;
  public warn(format: string, ...params: unknown[]): void;
  public warn(...args: unknown[]): void {
    const record = this.createRecord(40, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan error method.
   */
  public error(): void;
  public error(error: Error, ...params: unknown[]): void;
  public error(obj: Record<string, unknown>, ...params: unknown[]): void;
  public error(format: string, ...params: unknown[]): void;
  public error(...args: unknown[]): void {
    const record = this.createRecord(50, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Bunyan fatal method.
   */
  public fatal(): void;
  public fatal(error: Error, ...params: unknown[]): void;
  public fatal(obj: Record<string, unknown>, ...params: unknown[]): void;
  public fatal(format: string, ...params: unknown[]): void;
  public fatal(...args: unknown[]): void {
    const record = this.createRecord(60, args[0], args[1] as string | undefined);
    this.outputRecord(record);
  }

  /**
   * Create a child logger with additional fields.
   * 
   * @param {object} fields - Additional fields
   * @returns {BunyanCompatibleLogger} Child logger
   */
  public child(fields: Record<string, unknown>): BunyanCompatibleLogger {
    const childOptions: BunyanCompatibleOptions = {
      ...this.getConfig(),
      name: this.name,
      level: this._level,
      showName: this.showName,
      showPid: this.showPid,
      showHostname: this.showHostname,
      defaultTags: this.defaultTags,
      defaultContext: this.defaultContext,
      serializers: this.serializers,
      streams: this.streams,
      src: this.src,
      fields: { ...this._fields, ...fields },
    };

    return new BunyanCompatibleLogger(childOptions);
  }

  /**
   * Add a stream to the logger.
   * 
   * @param {BunyanStream} stream - Stream configuration
   * @returns {void}
   */
  public addStream(stream: BunyanStream): void {
    this.streams.push(stream);
  }

  /**
   * Add serializers to the logger.
   * 
   * @param {BunyanSerializers} serializers - Serializers to add
   * @returns {void}
   */
  public addSerializers(serializers: BunyanSerializers): void {
    Object.assign(this.serializers, serializers);
  }

  /**
   * Reopen file streams (for log rotation).
   */
  public reopenFileStreams(): void {
    // This would be implemented if we supported file streams
    console.log('[Bunyan] Reopening file streams');
  }

  /**
   * Check if a given level is enabled.
   * 
   * @param {number | string} level - Level to check
   * @returns {boolean} Whether level is enabled
   */
  public isLevelEnabled(level: number | string): boolean {
    const levelNum = typeof level === 'number' ? level : BunyanCompatibleLogger.levelFromName[level] || 30;
    return levelNum >= this._level;
  }

  /**
   * Bunyan-style levels property.
   */
  public get levels() {
    return {
      TRACE: 10,
      DEBUG: 20,
      INFO: 30,
      WARN: 40,
      ERROR: 50,
      FATAL: 60,
    };
  }

  /**
   * Get logger fields.
   */
  public get fields(): Record<string, unknown> {
    return { ...this._fields };
  }
}

/**
 * Factory to create a Bunyan-compatible logger instance.
 * 
 * @param {BunyanCompatibleOptions} options - Logger options
 * @returns {BunyanCompatibleLogger} Bunyan-compatible logger
 */
export function createBunyanCompatible(
  options: BunyanCompatibleOptions
): BunyanCompatibleLogger {
  return new BunyanCompatibleLogger(options);
}
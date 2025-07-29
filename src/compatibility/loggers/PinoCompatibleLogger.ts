// File: src/compatibility/loggers/PinoCompatibleLogger.ts

import { BaseCompatibleLogger } from './BaseCompatibleLogger';
import type { LoggerOptions } from '../../types';

/**
 * Pino log method type with all supported signatures
 */
type PinoLogMethod = {
  (msg: string): void;
  (obj: object): void;
  (obj: object, msg: string): void;
  (error: Error): void;
  (error: Error, msg: string): void;
  (msg: string, ...args: unknown[]): void;
};

/**
 * Pino serializer function type
 */
type Serializer = (value: unknown) => unknown;

/**
 * Pino censor function type
 */
type CensorFunction = (value: unknown, path: string[]) => unknown;

/**
 * Pino redaction options
 */
interface RedactOptions {
  paths: string[];
  censor?: string | CensorFunction;
  remove?: boolean;
}

/**
 * Pino formatter functions
 */
interface Formatters {
  level?: (label: string, number: number) => object;
  bindings?: (bindings: Record<string, unknown>) => object;
  log?: (object: Record<string, unknown>) => object;
}

/**
 * Pino-compatible logger options
 * @interface PinoCompatibleOptions
 * @extends {LoggerOptions}
 */
export interface PinoCompatibleOptions extends LoggerOptions {
  /**
   * Log level (string or number)
   * @type {string | number}
   * @default 'info'
   */
  level?: string | number;

  /**
   * Pretty print output
   * @type {boolean}
   * @default true
   */
  prettyPrint?: boolean;

  /**
   * Include timestamp
   * @type {boolean}
   * @default false
   */
  timestamp?: boolean;

  /**
   * Base object to include in all logs
   * @type {Record<string, unknown>}
   */
  base?: Record<string, unknown>;

  /**
   * Message key name
   * @type {string}
   * @default 'msg'
   */
  messageKey?: string;

  /**
   * Level key name
   * @type {string}
   * @default 'level'
   */
  levelKey?: string;

  /**
   * Timestamp key name
   * @type {string}
   * @default 'time'
   */
  timestampKey?: string;

  /**
   * Use only message in output
   * @type {boolean}
   * @default false
   */
  onlyMessage?: boolean;

  /**
   * Whether logger is enabled
   * @type {boolean}
   * @default true
   */
  enabled?: boolean;

  /**
   * Redaction configuration
   * @type {RedactOptions}
   */
  redact?: RedactOptions;

  /**
   * Custom serializers
   * @type {Record<string, Serializer>}
   */
  serializers?: Record<string, Serializer>;

  /**
   * Mixin function to add properties to each log
   * @type {(mergeObject?: object, level?: number) => object}
   */
  mixin?: (mergeObject?: object, level?: number) => object;

  /**
   * Formatter functions
   * @type {Formatters}
   */
  formatters?: Formatters;

  /**
   * Browser configuration
   * @type {object}
   */
  browser?: {
    serialize?: boolean | string[];
    asObject?: boolean;
    transmit?: {
      level?: string;
      send: (level: string, logEvent: object) => void;
    };
  };
}

/**
 * Pino-compatible logger implementation.
 * Provides full compatibility with the Pino logging library API.
 *
 * @class PinoCompatibleLogger
 * @extends {BaseCompatibleLogger}
 *
 * @example
 * ```typescript
 * const logger = createPinoCompatible({
 *   level: 'debug',
 *   timestamp: true,
 *   base: { pid: process.pid },
 *   prettyPrint: true
 * });
 *
 * // Pino-style logging
 * logger.info('Hello world');
 * logger.info({ user: 'john' }, 'User logged in');
 * logger.error(new Error('Oops'), 'An error occurred');
 *
 * // Child loggers
 * const child = logger.child({ component: 'auth' });
 * child.info('Processing auth request');
 * ```
 */
export class PinoCompatibleLogger extends BaseCompatibleLogger {
  /**
   * Pino level string to number mapping
   * @static
   * @readonly
   */
  public static readonly levels: Record<string, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    silent: Infinity,
  };

  /**
   * Current log level string
   * @private
   */
  private _level: string;

  /**
   * Current log level number
   * @private
   */
  private _levelNum: number;

  /**
   * Configuration options
   * @private
   */
  protected timestamp: boolean;
  protected prettyPrint: boolean;
  protected base: Record<string, unknown>;
  protected messageKey: string;
  protected levelKey: string;
  protected timestampKey: string;
  protected onlyMessage: boolean;
  protected enabled: boolean;
  protected redact?: RedactOptions;
  protected serializers: Record<string, Serializer>;
  protected mixin?: (mergeObject?: object, level?: number) => object;
  protected formatters?: Formatters;

  /**
   * Default error serializer
   * @private
   * @static
   */
  private static readonly stdSerializers = {
    err: (err: unknown): unknown => {
      if (!err || typeof err !== 'object') return err;
      const e = err as Error;
      return {
        type: e.constructor?.name || 'Error',
        message: e.message,
        stack: e.stack,
      };
    },
    error: (err: unknown): unknown => PinoCompatibleLogger.stdSerializers.err(err),
  };

  /**
   * Creates a new Pino-compatible logger
   * @constructor
   * @param {PinoCompatibleOptions} options - Logger options
   */
  constructor(options: PinoCompatibleOptions = {}) {
    super(options);

    // Handle numeric level
    if (typeof options.level === 'number') {
      this._levelNum = options.level;
      this._level = this.getLevelName(options.level);
    } else {
      this._level = options.level || 'info';
      this._levelNum = PinoCompatibleLogger.levels[this._level] || 30;
    }

    this.timestamp = options.timestamp ?? false;
    this.prettyPrint = options.prettyPrint !== false;
    this.base = options.base || {};
    this.messageKey = options.messageKey || 'msg';
    this.levelKey = options.levelKey || 'level';
    this.timestampKey = options.timestampKey || 'time';
    this.onlyMessage = options.onlyMessage || false;
    this.enabled = options.enabled !== false;
    this.redact = options.redact;
    this.serializers = {
      ...PinoCompatibleLogger.stdSerializers,
      ...(options.serializers || {}),
    };
    this.mixin = options.mixin;
    this.formatters = options.formatters;
  }

  /**
   * Get level name from number
   * @private
   * @param {number} levelNum - Level number
   * @returns {string} Level name
   */
  private getLevelName(levelNum: number): string {
    const entries = Object.entries(PinoCompatibleLogger.levels);
    const found = entries.find(([_, num]) => num === levelNum);
    return found ? found[0] : 'info';
  }

  /**
   * Format a log record
   * @private
   * @param {string} level - Log level
   * @param {unknown} objOrMsg - Object or message
   * @param {string} msg - Optional message
   * @returns {object | null} Formatted record
   */
  private formatRecord(level: string, objOrMsg: unknown, msg?: string): object | null {
    if (!this.enabled) return null;

    const levelNum = PinoCompatibleLogger.levels[level] || 30;

    // Skip if below current level
    if (levelNum < this._levelNum) {
      return null;
    }

    let record: Record<string, unknown> = {};

    // Add timestamp
    if (this.timestamp) {
      record[this.timestampKey] = Date.now();
    }

    // Add level
    if (this.formatters?.level) {
      Object.assign(record, this.formatters.level(level, levelNum));
    } else {
      record[this.levelKey] = level;
    }

    // Add base properties
    if (this.formatters?.bindings) {
      Object.assign(record, this.formatters.bindings(this.base));
    } else {
      Object.assign(record, this.base);
    }

    // Add mixin properties
    if (this.mixin) {
      const mixinProps = this.mixin(record, levelNum);
      Object.assign(record, mixinProps);
    }

    // Handle arguments
    let message = '';
    let fields: Record<string, unknown> = {};

    if (typeof objOrMsg === 'string') {
      message = objOrMsg;
    } else if (objOrMsg instanceof Error) {
      message = msg || objOrMsg.message;
      fields.err = objOrMsg;
    } else if (typeof objOrMsg === 'object' && objOrMsg !== null) {
      fields = objOrMsg as Record<string, unknown>;
      message = msg || '';
    }

    // Apply serializers
    fields = this.applySerializers(fields);

    // Merge fields
    Object.assign(record, fields);

    // Add message
    if (message) {
      record[this.messageKey] = message;
    }

    // Apply formatters.log
    if (this.formatters?.log) {
      const formattedRecord = this.formatters.log(record);
      record = formattedRecord as Record<string, unknown>;
    }

    // Apply redaction
    if (this.redact) {
      record = this.applyRedaction(record);
    }

    return record;
  }

  /**
   * Apply serializers to fields
   * @protected
   * @param {Record<string, unknown>} fields - Fields to serialize
   * @returns {Record<string, unknown>} Serialized fields
   */
  protected applySerializers(fields: Record<string, unknown>): Record<string, unknown> {
    const serialized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (this.serializers[key]) {
        serialized[key] = this.serializers[key](value);
      } else {
        serialized[key] = value;
      }
    }

    return serialized;
  }

  /**
   * Apply redaction to record
   * @protected
   * @param {Record<string, unknown>} record - Record to redact
   * @returns {Record<string, unknown>} Redacted record
   */
  protected applyRedaction(record: Record<string, unknown>): Record<string, unknown> {
    if (!this.redact) return record;

    const result = JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
    const { paths, censor = '[REDACTED]' } = this.redact;

    for (const path of paths) {
      this.redactPath(result, path.split('.'), censor);
    }

    return result;
  }

  /**
   * Redact a specific path in an object
   * @private
   * @param {Record<string, unknown>} obj - Object to redact in
   * @param {string[]} pathParts - Path parts
   * @param {string | CensorFunction} censor - Censor value or function
   */
  private redactPath(
    obj: Record<string, unknown>,
    pathParts: string[],
    censor: string | CensorFunction
  ): void {
    if (!obj || typeof obj !== 'object') return;

    const [current, ...rest] = pathParts;

    // Check if current path part exists
    if (!current) return;

    // Handle wildcards
    if (current === '*') {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (typeof item === 'object' && item !== null) {
            this.redactPath(item as Record<string, unknown>, rest, censor);
          }
        }
      } else {
        for (const key in obj) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            this.redactPath(value as Record<string, unknown>, rest, censor);
          }
        }
      }
      return;
    }

    // Handle array notation
    const arrayMatch = current.match(/^(.+)\[\*\]$/);
    if (arrayMatch && arrayMatch[1]) {
      const arrayKey = arrayMatch[1];
      if (arrayKey in obj && Array.isArray(obj[arrayKey])) {
        const arr = obj[arrayKey] as unknown[];
        for (const item of arr) {
          if (typeof item === 'object' && item !== null) {
            this.redactPath(item as Record<string, unknown>, rest, censor);
          }
        }
      }
      return;
    }

    // Final path part
    if (rest.length === 0) {
      if (current in obj) {
        obj[current] = typeof censor === 'function' ? censor(obj[current], pathParts) : censor;
      }
    } else if (current in obj) {
      const value = obj[current];
      if (typeof value === 'object' && value !== null) {
        this.redactPath(value as Record<string, unknown>, rest, censor);
      }
    }
  }

  /**
   * Output a log record
   * @private
   * @param {string} level - Log level
   * @param {object | null} record - Log record
   */
  private output(level: string, record: object | null): void {
    if (!record) return;

    let output: string;
    let metadata: Record<string, unknown> = {};

    if (this.onlyMessage) {
      output = ((record as Record<string, unknown>)[this.messageKey] as string) || '';
    } else if (this.prettyPrint) {
      const result = this.prettyFormat(level, record);
      output = result.message;
      metadata = result.metadata;
    } else {
      output = JSON.stringify(record);
    }

    // Route to appropriate logger method
    switch (level) {
      case 'trace':
        this.logger.debug(this.prettyPrint ? output : `TRACE: ${output}`, metadata);
        break;
      case 'debug':
        this.logger.debug(output, metadata);
        break;
      case 'info':
        this.logger.info(output, metadata);
        break;
      case 'warn':
        this.logger.warn(output, metadata);
        break;
      case 'error':
        this.logger.error(output, metadata);
        break;
      case 'fatal':
        this.logger.error(this.prettyPrint ? output : `FATAL: ${output}`, metadata);
        break;
    }
  }

  /**
   * Pretty format a record
   * @private
   * @param {string} level - Log level
   * @param {object} record - Log record
   * @returns {{ message: string, metadata: Record<string, unknown> }} Formatted output
   */
  private prettyFormat(
    level: string,
    record: object
  ): { message: string; metadata: Record<string, unknown> } {
    const rec = record as Record<string, unknown>;
    const parts: string[] = [];
    const metadata: Record<string, unknown> = {};

    // Timestamp
    if (rec[this.timestampKey]) {
      const time = new Date(rec[this.timestampKey] as number).toISOString();
      parts.push(`[${time}]`);
    }

    // Level
    parts.push(`[${level.toUpperCase()}]`);

    // Message or object content
    if (rec[this.messageKey]) {
      parts.push(rec[this.messageKey] as string);
    } else {
      // If no message, include the object content for object-only logging
      const objContent = { ...rec };
      delete objContent[this.timestampKey];
      delete objContent[this.levelKey];
      delete objContent[this.messageKey];
      
      if (Object.keys(objContent).length > 0) {
        parts.push(JSON.stringify(objContent));
      }
    }

    // Additional fields (only when there's an explicit message)
    if (rec[this.messageKey]) {
      for (const [key, value] of Object.entries(rec)) {
        if (key !== this.timestampKey && key !== this.levelKey && key !== this.messageKey) {
          metadata[key] = value;
        }
      }
    }

    return { message: parts.join(' '), metadata };
  }

  // Pino logging methods
  /**
   * Log trace message
   * @public
   */
  public trace: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('trace', objOrMsg, msg as string | undefined);
    this.output('trace', record);
  };

  /**
   * Log debug message
   * @public
   */
  public debug: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('debug', objOrMsg, msg as string | undefined);
    this.output('debug', record);
  };

  /**
   * Log info message
   * @public
   */
  public info: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('info', objOrMsg, msg as string | undefined);
    this.output('info', record);
  };

  /**
   * Log warning message
   * @public
   */
  public warn: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('warn', objOrMsg, msg as string | undefined);
    this.output('warn', record);
  };

  /**
   * Log error message
   * @public
   */
  public error: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('error', objOrMsg, msg as string | undefined);
    this.output('error', record);
  };

  /**
   * Log fatal message
   * @public
   */
  public fatal: PinoLogMethod = (...args: unknown[]): void => {
    const [objOrMsg, msg] = args;
    const record = this.formatRecord('fatal', objOrMsg, msg as string | undefined);
    this.output('fatal', record);
  };

  /**
   * Create a child logger with additional bindings
   * @public
   * @param {Record<string, unknown>} bindings - Additional bindings
   * @returns {PinoCompatibleLogger} Child logger
   */
  public child(bindings: Record<string, unknown>): PinoCompatibleLogger {
    const childOptions: PinoCompatibleOptions = {
      ...this.getConfig(),
      base: { ...this.base, ...bindings },
      level: this._level,
      timestamp: this.timestamp,
      prettyPrint: this.prettyPrint,
      messageKey: this.messageKey,
      levelKey: this.levelKey,
      timestampKey: this.timestampKey,
      onlyMessage: this.onlyMessage,
      enabled: this.enabled,
      redact: this.redact,
      serializers: this.serializers,
      mixin: this.mixin,
      formatters: this.formatters,
    };

    return new PinoCompatibleLogger(childOptions);
  }

  /**
   * Check if level is enabled
   * @public
   * @param {string | number} level - Level to check
   * @returns {boolean} Whether level is enabled
   */
  public isLevelEnabled(level: string | number): boolean {
    const levelNum = typeof level === 'number' ? level : PinoCompatibleLogger.levels[level] || 30;

    return levelNum >= this._levelNum;
  }

  /**
   * Get current configuration
   * @protected
   * @returns {PinoCompatibleOptions} Current configuration
   */
  protected getConfig(): PinoCompatibleOptions {
    return {
      verbose: this._verbose,
      useColors: this.useColors,
    };
  }

  // Getters and setters
  /**
   * Get or set the level
   * @public
   */
  public get level(): string {
    return this._level;
  }

  public set level(value: string | number) {
    if (typeof value === 'number') {
      // For invalid numeric levels, find the closest valid level or default to info
      const validLevels = Object.values(PinoCompatibleLogger.levels).sort((a, b) => a - b);
      const closestLevel = validLevels.find(level => level >= value) || 30; // Default to info (30)
      this._levelNum = closestLevel;
      this._level = this.getLevelName(closestLevel);
    } else {
      this._level = value;
      this._levelNum = PinoCompatibleLogger.levels[value] || 30;
    }
  }

  /**
   * Get level value
   * @public
   */
  public get levelVal(): number {
    return this._levelNum;
  }

  /**
   * Get bindings
   * @public
   * @returns {Record<string, unknown>} Current bindings
   */
  public bindings(): Record<string, unknown> {
    return { ...this.base };
  }

  /**
   * Set bindings
   * @public
   * @param {Record<string, unknown>} bindings - New bindings
   */
  public setBindings(bindings: Record<string, unknown>): void {
    this.base = { ...bindings };
  }

  /**
   * Flush logs (delegates to base class)
   * @public
   * @returns {Promise<void>}
   */
  public async flush(): Promise<void> {
    await super.flush();
  }

  /**
   * Generic log method
   * @public
   * @param {string} level - Log level
   * @param {...unknown[]} args - Log arguments
   */
  public log(level: string, ...args: unknown[]): void {
    const method = this[level as keyof this];
    if (typeof method === 'function') {
      method.apply(this, args);
    }
  }

  /**
   * Silent logging (no-op)
   * @public
   */
  public silent(..._args: unknown[]): void {
    // No-op
  }
}

/**
 * Factory function to create a Pino-compatible logger
 * @function createPinoCompatible
 * @param {PinoCompatibleOptions} options - Logger options
 * @returns {PinoCompatibleLogger} New Pino-compatible logger instance
 *
 * @example
 * ```typescript
 * const logger = createPinoCompatible({
 *   level: 'info',
 *   base: { service: 'api' }
 * });
 * ```
 */
export function createPinoCompatible(options?: PinoCompatibleOptions): PinoCompatibleLogger {
  return new PinoCompatibleLogger(options);
}

// File: src/compatibility/Pino.ts

import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

/**
 * Pino log method type.
 */
type PinoLogMethod = {
  (msg: string): void;
  (obj: object): void;
  (obj: object, msg: string): void;
  (error: Error): void;
  (error: Error, msg: string): void;
};

/**
 * Pino configuration options.
 * 
 * @interface PinoCompatibleOptions
 * @extends {LogCompatibilityOptions}
 */
export interface PinoCompatibleOptions extends LogCompatibilityOptions {
  /**
   * Log level.
   * @default 'info'
   */
  level?: string;

  /**
   * Pretty print output.
   * @default true
   */
  prettyPrint?: boolean;

  /**
   * Include timestamp.
   * @default false
   */
  timestamp?: boolean;

  /**
   * Include level value (number).
   * @default false
   */
  levelVal?: boolean;

  /**
   * Base object to include in all logs.
   */
  base?: Record<string, unknown>;

  /**
   * Message key name.
   * @default 'msg'
   */
  messageKey?: string;

  /**
   * Level key name.
   * @default 'level'
   */
  levelKey?: string;

  /**
   * Timestamp key name.
   * @default 'time'
   */
  timestampKey?: string;

  /**
   * Use only message.
   * @default false
   */
  onlyMessage?: boolean;

  /**
   * Redact paths in logs.
   */
  redact?: string[] | {
    paths: string[];
    censor?: string | ((value: unknown) => unknown);
  };

  /**
   * Custom serializers.
   */
  serializers?: Record<string, (value: unknown) => unknown>;

  /**
   * Mixin function to add properties.
   */
  mixin?: () => Record<string, unknown>;

  /**
   * Format level function.
   */
  formatLevel?: (label: string, number: number) => object;
}

/**
 * Pino-compatible logger implementation.
 * 
 * Provides a Pino-style API with:
 * - Pino method signatures
 * - Child loggers with bindings
 * - Fast JSON output
 * - Level values
 * - Redaction support
 * - Serializers
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
  private timestamp: boolean;
  private prettyPrint: boolean;
  private base: Record<string, unknown>;
  private messageKey: string;
  private levelKey: string;
  private timestampKey: string;
  private onlyMessage: boolean;
  private redact?: PinoCompatibleOptions['redact'];
  private serializers: Record<string, (value: unknown) => unknown>;
  private mixin?: () => Record<string, unknown>;
  private formatLevel?: (label: string, number: number) => object;
  private _level: string;
  private _levelNum: number;
  private _levelVal: boolean;

  /**
   * Pino level string to number mapping.
   * @private
   * @static
   */
  private static readonly levels: Record<string, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    silent: Infinity,
  };

  /**
   * Default serializers.
   * @private
   * @static
   */
  private static readonly stdSerializers: Record<string, (value: unknown) => unknown> = {
    err: (err: unknown): unknown => {
      if (!err || !(err instanceof Error)) {
        return err;
      }
      return {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
      };
    },
    error: (err: unknown): unknown => {
      return PinoCompatibleLogger.stdSerializers.err(err);
    },
  };

  /**
   * Creates a new Pino-compatible logger.
   * 
   * @param {PinoCompatibleOptions} options - Logger options
   */
  constructor(options: PinoCompatibleOptions = {}) {
    super(options || {});
    
    this._level = options?.level || 'info';
    this._levelNum = PinoCompatibleLogger.levels[this._level] || 30;
    this._levelVal = options?.levelVal || false;
    this.timestamp = options?.timestamp || false;
    this.prettyPrint = options?.prettyPrint !== false;
    this.base = options?.base || {};
    this.messageKey = options?.messageKey || 'msg';
    this.levelKey = options?.levelKey || 'level';
    this.timestampKey = options?.timestampKey || 'time';
    this.onlyMessage = options?.onlyMessage || false;
    this.redact = options?.redact;
    this.serializers = { 
      ...PinoCompatibleLogger.stdSerializers, 
      ...options?.serializers 
    };
    this.mixin = options?.mixin;
    this.formatLevel = options?.formatLevel;
  }

  /**
   * Get timestamp for log.
   * 
   * @returns {number | string} Timestamp
   * @private
   */
  private getTimestamp(): number | string {
    return this.timestamp ? Date.now() : '';
  }

  /**
   * Format a Pino log record.
   * 
   * @param {string} level - Log level
   * @param {any} objOrMsg - Object or message
   * @param {string} [msg] - Optional message
   * @returns {object} Formatted record
   * @private
   */
  private formatRecord(level: string, objOrMsg: unknown, msg?: string): object | null {
    const levelNum = PinoCompatibleLogger.levels[level] || 30;
    
    // Skip if below current level
    if (levelNum < this._levelNum) {
      return null;
    }

    const record: Record<string, unknown> = {};

    // Add timestamp
    if (this.timestamp) {
      record[this.timestampKey] = this.getTimestamp();
    }

    // Add level
    if (this.formatLevel) {
      Object.assign(record, this.formatLevel(level, levelNum));
    } else {
      record[this.levelKey] = this._levelVal ? levelNum : level;
    }

    // Add base properties
    Object.assign(record, this.base);

    // Add mixin properties
    if (this.mixin) {
      Object.assign(record, this.mixin());
    }

    // Handle arguments
    let message = '';
    let fields: Record<string, unknown> = {};

    if (typeof objOrMsg === 'string') {
      message = objOrMsg;
    } else if (objOrMsg instanceof Error) {
      message = objOrMsg.message;
      if (this.serializers.err) {
        fields.err = this.serializers.err(objOrMsg);
      }
    } else if (typeof objOrMsg === 'object' && objOrMsg !== null) {
      fields = objOrMsg as Record<string, unknown>;
      message = msg || '';
    }

    // Apply serializers
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (this.serializers[key]) {
        serialized[key] = this.serializers[key](value);
      } else {
        serialized[key] = value;
      }
    }

    // Merge fields
    Object.assign(record, serialized);

    // Add message
    if (message) {
      record[this.messageKey] = message;
    }

    // Apply redaction
    if (this.redact) {
      this.applyRedaction(record);
    }

    return record;
  }

  /**
   * Apply redaction to record.
   * 
   * @param {object} record - Record to redact
   * @private
   */
  private applyRedaction(record: Record<string, unknown>): void {
    if (!this.redact) return;

    const paths = Array.isArray(this.redact) ? this.redact : this.redact.paths;
    const censor = Array.isArray(this.redact) ? '[Redacted]' : this.redact.censor || '[Redacted]';

    for (const path of paths) {
      const parts = path.split('.');
      let current: unknown = record;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (current && typeof current === 'object' && parts[i] in current) {
          current = (current as Record<string, unknown>)[parts[i]];
        } else {
          break;
        }
      }

      const lastPart = parts[parts.length - 1];
      if (current && typeof current === 'object' && lastPart in current) {
        const obj = current as Record<string, unknown>;
        obj[lastPart] = typeof censor === 'function' ? censor(obj[lastPart]) : censor;
      }
    }
  }

  /**
   * Output a log record.
   * 
   * @param {string} level - Log level
   * @param {object} record - Log record
   * @private
   */
  private output(level: string, record: object | null): void {
    if (!record) return;

    let output: string;

    if (this.onlyMessage) {
      output = (record as Record<string, unknown>)[this.messageKey] as string || '';
    } else if (this.prettyPrint) {
      output = this.prettyFormat(level, record);
    } else {
      output = JSON.stringify(record);
    }

    // Use underlying logger
    switch (level) {
      case 'trace':
        this.logger.debug(`TRACE: ${output}`);
        break;
      case 'debug':
        this.logger.debug(output);
        break;
      case 'info':
        this.logger.info(output);
        break;
      case 'warn':
        this.logger.warn(output);
        break;
      case 'error':
        this.logger.error(output);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${output}`);
        break;
    }
  }

  /**
   * Pretty format a record.
   * 
   * @param {string} level - Log level
   * @param {object} record - Log record
   * @returns {string} Formatted output
   * @private
   */
  private prettyFormat(level: string, record: object): string {
    const rec = record as Record<string, unknown>;
    const parts: string[] = [];

    // Timestamp
    if (rec[this.timestampKey]) {
      const time = new Date(rec[this.timestampKey] as number).toISOString();
      parts.push(`[${time}]`);
    }

    // Level
    if (this._levelVal && rec[this.levelKey]) {
      parts.push(`[${rec[this.levelKey]}]`);
    } else {
      parts.push(`[${level.toUpperCase()}]`);
    }

    // Message
    if (rec[this.messageKey]) {
      parts.push(rec[this.messageKey] as string);
    }

    // Additional fields - create a clean copy without system fields
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rec)) {
      if (key !== this.timestampKey && key !== this.levelKey && key !== this.messageKey) {
        fields[key] = value;
      }
    }

    if (Object.keys(fields).length > 0) {
      parts.push(JSON.stringify(fields));
    }

    return parts.join(' ');
  }

  /**
   * Generic log method.
   * 
   * @param {string} level - Log level
   * @param {...any} args - Log arguments
   */
  public log(level: string, ...args: unknown[]): void {
    const record = this.formatRecord(level, args[0], args[1] as string | undefined);
    this.output(level, record);
  }

  // Pino logging methods with overloads

  public trace: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('trace', objOrMsg, msg);
    this.output('trace', record);
  };

  public debug: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('debug', objOrMsg, msg);
    this.output('debug', record);
  };

  public info: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('info', objOrMsg, msg);
    this.output('info', record);
  };

  public warn: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('warn', objOrMsg, msg);
    this.output('warn', record);
  };

  public error: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('error', objOrMsg, msg);
    this.output('error', record);
  };

  public fatal: PinoLogMethod = (objOrMsg: unknown, msg?: string): void => {
    const record = this.formatRecord('fatal', objOrMsg, msg);
    this.output('fatal', record);
  };

  /**
   * Create a child logger with additional bindings.
   * 
   * @param {Record<string, unknown>} bindings - Additional bindings
   * @returns {PinoCompatibleLogger} Child logger
   */
  public child(bindings: Record<string, unknown>): PinoCompatibleLogger {
    const mergedBase = { ...this.base, ...bindings };

    const childOptions: PinoCompatibleOptions = {
      verbose: this._verbose,
      writeToDisk: this.writeToDisk,
      useColors: this.useColors,
      logDir: this.logDir,
      logRetentionDays: this.logRetentionDays,
      level: this._level,
      levelVal: this._levelVal,
      timestamp: this.timestamp,
      prettyPrint: this.prettyPrint,
      base: mergedBase,
      messageKey: this.messageKey,
      levelKey: this.levelKey,
      timestampKey: this.timestampKey,
      onlyMessage: this.onlyMessage,
      redact: this.redact,
      serializers: this.serializers,
      mixin: this.mixin,
      formatLevel: this.formatLevel,
      strictLevels: this.strictLevels,
    };

    return new PinoCompatibleLogger(childOptions);
  }

  /**
   * Flush any buffered logs.
   */
  public async flush(): Promise<void> {
    // MagicLogger handles this
    await super.flush();
  }

  /**
   * Check if level is enabled.
   * 
   * @param {string | number} level - Level to check
   * @returns {boolean} Whether level is enabled
   */
  public isLevelEnabled(level: string | number): boolean {
    const levelNum = typeof level === 'number' 
      ? level 
      : PinoCompatibleLogger.levels[level] || 30;
    
    return levelNum >= this._levelNum;
  }

  /**
   * Get or set the level.
   */
  public get level(): string {
    return this._level;
  }

  public set level(value: string) {
    this._level = value;
    this._levelNum = PinoCompatibleLogger.levels[value] || 30;
  }

  /**
   * Get level value.
   */
  public get levelVal(): number {
    return this._levelNum;
  }

  /**
   * Pino levels object.
   */
  public get levels() {
    return {
      values: PinoCompatibleLogger.levels,
      labels: Object.entries(PinoCompatibleLogger.levels).reduce(
        (acc, [label, value]) => {
          acc[value] = label;
          return acc;
        },
        {} as Record<number, string>
      ),
    };
  }

  /**
   * Bindings getter.
   */
  public bindings(): Record<string, unknown> {
    return { ...this.base };
  }

  /**
   * Set bindings.
   * 
   * @param {Record<string, unknown>} bindings - New bindings
   */
  public setBindings(bindings: Record<string, unknown>): void {
    this.base = { ...bindings };
  }
}

/**
 * Factory to create a Pino-compatible logger.
 * 
 * @param {PinoCompatibleOptions} options - Logger options
 * @returns {PinoCompatibleLogger} Pino-compatible logger
 */
export function createPinoCompatible(
  options: PinoCompatibleOptions = {}
): PinoCompatibleLogger {
  return new PinoCompatibleLogger(options);
}
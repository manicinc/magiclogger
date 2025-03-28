import { Logger } from '../Logger';
import { LoggerOptions, LogLevel } from '../types';

/**
 * Interface for compatibility logger options.
 * Extends LoggerOptions to include options specific to compatibility with other loggers.
 */
export interface LogCompatibilityOptions extends LoggerOptions {
  name?: string; // Optional name for the logger (used by some libraries)
  level?: string; // Default log level (string format)
  serializeObjects?: boolean; // Whether to serialize objects automatically when logging
  maxSerializationDepth?: number; // Maximum depth for object serialization
  serializer?: (obj: unknown) => string; // Custom object serializer function
}

/**
 * Compatibility base logger class
 * Ensures that common properties like verbose, useColors, writeToDisk, etc., are available
 */
export class BaseCompatibleLogger {
  protected _verbose: boolean;
  protected writeToDisk: boolean;
  protected useColors: boolean;
  protected logDir: string;
  protected logRetentionDays: number;
  protected strictLevels: boolean;
  protected color: (text: string) => string;
  protected logger: Logger;
  protected name: string;

  constructor(options: LogCompatibilityOptions = {}) {
    this._verbose = options.verbose ?? false;
    this.writeToDisk = options.writeToDisk ?? false;
    this.useColors = options.useColors ?? true;
    this.logDir = options.logDir ?? 'logs';
    this.logRetentionDays = options.logRetentionDays ?? 30;
    this.strictLevels = options.strictLevels ?? false;
    this.name = options.name ?? 'app';

    this.logger = new Logger(options);
    this.color = this.useColors ? this.getColorFunction() : () => '';
  }

  /**
   * A method that returns a placeholder color function (can be expanded).
   */
  private getColorFunction(): (text: string) => string {
    return (text: string): string => `\x1b[36m${text}\x1b[39m`;
  }

  /**
   * Utility method to safely serialize objects for logging.
   */
  protected safeSerialize(obj: unknown): string {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      return `[Object serialization failed: ${err}]`;
    }
  }

  /**
   * Utility method to format different types of messages.
   */
  protected formatMessage(msgOrObj: unknown, msgStr?: string): string {
    if (typeof msgOrObj === 'string') {
      return msgOrObj;
    } else if (msgStr) {
      return `${msgStr} ${this.safeSerialize(msgOrObj)}`;
    } else {
      return this.safeSerialize(msgOrObj);
    }
  }

  /**
   * Generic log method.
   */
  log(msg: string, level: LogLevel = 'info'): void {
    console.log(`${this.color(`[${level}]`)} ${msg}`);
  }

  info(msg: string): void {
    this.log(msg, 'info');
  }

  warn(msg: string): void {
    this.log(msg, 'warn');
  }

  error(msg: string): void {
    this.log(msg, 'error');
  }

  success(msg: string): void {
    this.log(msg, 'success');
  }

  debug(msg: string): void {
    if (this._verbose) {
      this.log(msg, 'debug');
    }
  }

  get verbose(): boolean {
    return this._verbose;
  }

  set verbose(value: boolean) {
    this._verbose = value;
  }
}

// Re-export these types for consumers of this module
export type { LoggerOptions, LogLevel };

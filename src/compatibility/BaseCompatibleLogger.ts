import { Logger } from '../Logger';
import { LoggerOptions, LogLevel } from '../types';

/**
 * Interface for compatibility logger options.
 * Extends LoggerOptions to include options specific to compatibility with other loggers.
 */
export interface LogCompatibilityOptions extends LoggerOptions {
  /**
   * Optional name for the logger (used by some libraries).
   * @default 'app'
   */
  name?: string;

  /**
   * Default log level (string format).
   * @default 'info'
   */
  level?: string;

  /**
   * Whether to serialize objects automatically when logging.
   * @default true
   */
  serializeObjects?: boolean;

  /**
   * Maximum depth for object serialization.
   * @default 3
   */
  maxSerializationDepth?: number;

  /**
   * Custom object serializer function.
   * Used to modify how objects are serialized in the log output.
   */
  serializer?: (obj: unknown) => string;
}

/**
 * Compatibility base logger class.
 * Ensures that common properties like `_verbose`, `useColors`, `writeToDisk`, etc., are available.
 *
 * Note: We deliberately do NOT define a `public verbose` accessor here, because Winston
 * wants a method called `.verbose()`. That would collide in TypeScript.
 * Instead, we store the verbosity flag in `_verbose` and let child classes do what they want.
 */
export class BaseCompatibleLogger {
  protected _verbose: boolean; // Flag to enable verbose logging
  protected writeToDisk: boolean; // Whether to write logs to disk
  protected useColors: boolean; // Whether to enable colored output
  protected logDir: string; // Directory for log files
  protected logRetentionDays: number;
  protected strictLevels: boolean;
  protected color: (text: string) => string; // Color function for console output
  protected logger: Logger; // Core Logger instance
  protected name: string; // Logger name

  /**
   * Constructs a new BaseCompatibleLogger with the provided options.
   * @param options - Logger options including verbosity, color usage, disk writing, etc.
   */
  constructor(options: LogCompatibilityOptions = {}) {
    this._verbose = options.verbose ?? false;
    this.writeToDisk = options.writeToDisk ?? false;
    this.useColors = options.useColors ?? true;
    this.logDir = options.logDir ?? 'logs';
    this.logRetentionDays = options.logRetentionDays ?? 30;
    this.strictLevels = options.strictLevels ?? false;
    this.name = options.name ?? 'app';

    // Create our core Logger instance
    this.logger = new Logger(options);

    // Determine color function
    this.color = this.useColors ? this.getColorFunction() : () => '';
  }

  /**
   * Simple example color function that applies ANSI cyan to text.
   */
  private getColorFunction(): (text: string) => string {
    return (text: string): string => `\x1b[36m${text}\x1b[39m`; // cyan
  }

  /**
   * Safely serialize an object. If serialization fails, returns an error string.
   */
  protected safeSerialize(obj: unknown): string {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      return `[Object serialization failed: ${err}]`;
    }
  }

  /**
   * Formats either a string or an object+string into one string for logging.
   */
  protected formatMessage(msgOrObj: unknown, msgStr?: string): string {
    if (typeof msgOrObj === 'string') {
      return msgOrObj;
    } else if (msgStr) {
      return `${msgStr} ${this.safeSerialize(msgOrObj)}`;
    }
    return this.safeSerialize(msgOrObj);
  }

  /**
   * Generic logger at any level. Subclasses can override or call `super.log(...).`
   */
  public log(msg: string, level: LogLevel = 'info'): void {
    console.log(`${this.color(`[${level}]`)} ${msg}`);
  }

  /**
   * Convenience methods for specific log levels:
   */
  public info(msg: string): void {
    this.log(msg, 'info');
  }

  public warn(msg: string): void {
    this.log(msg, 'warn');
  }

  public error(msg: string): void {
    this.log(msg, 'error');
  }

  public success(msg: string): void {
    this.log(msg, 'success');
  }

  /**
   * If `_verbose` is true, logs at 'debug' level; otherwise does nothing.
   */
  public debug(msg: string): void {
    if (this._verbose) {
      this.log(msg, 'debug');
    }
  }
}

export type { LoggerOptions, LogLevel };

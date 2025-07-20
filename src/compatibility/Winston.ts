import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

type WinstonMetadata = Record<string, unknown>;

export interface WinstonCompatibleOptions extends LogCompatibilityOptions {
  /**
   * Default Winston log level, e.g. 'info', 'verbose', etc.
   * @default 'info'
   */
  level?: string;

  /**
   * Whether to prepend timestamps to each log.
   * @default false
   */
  timestamp?: boolean;

  /**
   * Format for timestamps. Supported:
   *   - 'ISO'   => e.g. [2025-01-01T00:00:00.000Z]
   *   - 'epoch' => e.g. [1735689600000]
   *   - 'HH:mm:ss' => e.g. [13:37:42] (default)
   */
  timestampFormat?: string;
}

export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  private level: string;
  private timestamp: boolean;
  private timestampFormat: string;

  constructor(options: WinstonCompatibleOptions = {}) {
    super(options || {});
    this.level = options.level || 'info';
    this.timestamp = options.timestamp || false;
    this.timestampFormat = options.timestampFormat || 'HH:mm:ss';
  }

  /**
   * Returns a formatted timestamp string based on `timestampFormat`.
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
   * Winston-like `.verbose()` method, which we funnel into our
   * underlying logger’s debug method IF `this._verbose` is true.
   */
  public verbose(msgOrObj: unknown, msgStr?: string): void {
    // Do nothing if user has not enabled "verbose" logging
    if (!this._verbose) return;
    let formattedMsg = this.formatMessage(msgOrObj, msgStr);
    formattedMsg = this.getTimestamp() + formattedMsg;
    this.logger.debug(formattedMsg);
  }

  /**
   * Winston-like `.silly()` method, also funneled into debug but
   * prefixed to indicate "silly" level.
   */
  public silly(msgOrObj: unknown, msgStr?: string): void {
    let formattedMsg = this.formatMessage(msgOrObj, msgStr);
    formattedMsg = this.getTimestamp() + `SILLY: ${formattedMsg}`;
    this.logger.debug(formattedMsg);
  }

  /**
   * Custom demonstration method for a "header". Not a Winston default,
   * but included in your snippet for illustration.
   */
  public header(message: string): void {
    const formattedMsg = this.getTimestamp() + `HEADER: ${message}`;
    this.logger.header(formattedMsg);
  }

  /**
   * Main Winston-compatible log method:
   * `logger.log('info', 'some message', {optionalMeta})`.
   */
  public log(level: string, message: string, metadata?: WinstonMetadata): void {
    // If user calls `.log('verbose', 'something')`,
    // just redirect to our dedicated .verbose() method:
    if (level.toLowerCase() === 'verbose') {
      // Combine message + metadata (if any)
      if (metadata && Object.keys(metadata).length > 0) {
        const combined = `${message} ${this.safeSerialize(metadata)}`;
        this.verbose(combined);
      } else {
        this.verbose(message);
      }
      return;
    }

    let formattedMsg = this.getTimestamp() + message;
    if (metadata && Object.keys(metadata).length > 0) {
      formattedMsg += ` ${this.safeSerialize(metadata)}`;
    }

    const normalized = level.toLowerCase();
    const isStrict = this.strictLevels;

    switch (normalized) {
      case 'info':
        this.logger.log(formattedMsg);
        break;
      case 'warn':
      case 'warning':
        this.logger.warn(formattedMsg);
        break;
      case 'error':
        this.logger.error(formattedMsg);
        break;
      case 'debug':
        this.logger.debug(formattedMsg);
        break;
      case 'silly':
        // Winston’s “silly” => typically the lowest level, also debug
        this.logger.debug(`SILLY: ${formattedMsg}`);
        break;
      default:
        // If strict mode is on, throw for unknown levels
        if (isStrict) {
          throw new Error(`Unknown log level: ${level}`);
        }
        // Otherwise treat as custom
        this.logger.custom(formattedMsg, ['white'], level.toUpperCase());
    }
  }
}

/**
 * Factory function that returns a WinstonCompatibleLogger instance.
 */
export function createWinstonCompatible(
  options?: WinstonCompatibleOptions
): WinstonCompatibleLogger {
  return new WinstonCompatibleLogger(options);
}

import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

type WinstonMetadata = Record<string, unknown>;

export interface WinstonCompatibleOptions extends LogCompatibilityOptions {
  level?: string;
  timestamp?: boolean;
  timestampFormat?: string;
}

export class WinstonCompatibleLogger extends BaseCompatibleLogger {
  private level: string;
  private timestamp: boolean;
  private timestampFormat: string;

  constructor(options: WinstonCompatibleOptions = {}) {
    super(options || {});
    this.level = options?.level || 'info';
    this.timestamp = options?.timestamp || false;
    this.timestampFormat = options?.timestampFormat || 'HH:mm:ss';
  }

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

  // Use a differently named method to avoid conflict with the verbose property
  logVerbose(msgOrObj: unknown, msgStr?: string): void {
    const formattedMsg = this.formatMessage(msgOrObj, msgStr);
    this.logger.debug(formattedMsg);
  }

  silly(msgOrObj: unknown, msgStr?: string): void {
    const formattedMsg = this.formatMessage(msgOrObj, msgStr);
    this.logger.debug(`SILLY: ${formattedMsg}`);
  }

  // Add compatibility method for Winston's verbose logging
  // This avoids conflict by not defining a property with the same name
  log(level: string, message: string, metadata?: WinstonMetadata): void {
    // Handle 'verbose' level specifically
    if (level.toLowerCase() === 'verbose') {
      this.logVerbose(message);
      return;
    }

    // Rest of the implementation remains the same
    let formattedMsg = `${this.getTimestamp()}${message}`;
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
        this.logger.debug(`SILLY: ${formattedMsg}`);
        break;
      default:
        if (isStrict) throw new Error(`Unknown log level: ${level}`);
        this.logger.custom(formattedMsg, ['white'], level.toUpperCase());
    }
  }
}

export function createWinstonCompatible(
  options?: WinstonCompatibleOptions
): WinstonCompatibleLogger {
  return new WinstonCompatibleLogger(options);
}

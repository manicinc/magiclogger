import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

export interface PinoCompatibleOptions extends LogCompatibilityOptions {
  level?: string;
  prettyPrint?: boolean;
  timestamp?: boolean;
  levelVal?: boolean;
  base?: Record<string, unknown>;
}

export class PinoCompatibleLogger extends BaseCompatibleLogger {
  private levelVal: boolean;
  private timestamp: boolean;
  private prettyPrint: boolean;
  private base: Record<string, unknown>;

  constructor(options: PinoCompatibleOptions = {}) {
    super(options || {});
    this.levelVal = options?.levelVal || false;
    this.timestamp = options?.timestamp || false;
    this.prettyPrint = options?.prettyPrint !== false;
    this.base = options?.base || {};
  }

  private getTimestamp(): string {
    return this.timestamp ? `[${new Date().toISOString()}] ` : '';
  }

  private formatPinoMessage(level: string, msg: string): string {
    let result = this.getTimestamp();

    if (this.levelVal) {
      const levelMap: Record<string, number> = {
        trace: 10,
        debug: 20,
        info: 30,
        warn: 40,
        error: 50,
        fatal: 60,
      };
      const levelNumber = levelMap[level.toLowerCase()] || 30;
      result += `[${levelNumber}] `;
    }

    if (Object.keys(this.base).length > 0) {
      result += `${this.safeSerialize(this.base)} `;
    }

    return result + msg;
  }

  log(level: string, message: string): void {
    const formattedMsg = this.formatPinoMessage(level, message);
    const normalized = level.toLowerCase();
    const isStrict = this.strictLevels;

    switch (normalized) {
      case 'trace':
        this.logger.debug(`TRACE: ${formattedMsg}`);
        break;
      case 'debug':
        this.logger.debug(formattedMsg);
        break;
      case 'info':
        this.logger.log(formattedMsg);
        break;
      case 'warn':
        this.logger.warn(formattedMsg);
        break;
      case 'error':
        this.logger.error(formattedMsg);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${formattedMsg}`);
        break;
      default:
        if (isStrict) throw new Error(`Unknown log level: ${level}`);
        this.logger.custom(formattedMsg, ['white'], level.toUpperCase());
    }
  }

  child(bindings: Record<string, unknown>): PinoCompatibleLogger {
    const mergedBase = { ...this.base, ...bindings };

    const childOptions: PinoCompatibleOptions = {
      verbose: this._verbose,
      writeToDisk: this.writeToDisk,
      useColors: this.useColors,
      logDir: this.logDir,
      logRetentionDays: this.logRetentionDays,
      levelVal: this.levelVal,
      timestamp: this.timestamp,
      prettyPrint: this.prettyPrint,
      base: mergedBase,
      strictLevels: this.strictLevels,
    };

    return new PinoCompatibleLogger(childOptions);
  }
}

export function createPinoCompatible(options: PinoCompatibleOptions = {}): PinoCompatibleLogger {
  return new PinoCompatibleLogger(options);
}

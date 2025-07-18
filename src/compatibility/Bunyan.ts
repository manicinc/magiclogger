import { isBrowserEnvironment } from '../utils/environment';
import { BROWSER_POLYFILLS } from '../utils/browser-polyfills';
import { BaseCompatibleLogger, LogCompatibilityOptions } from './BaseCompatibleLogger';

/**
 * Configuration options for Bunyan-compatible logger.
 */
export interface BunyanCompatibleOptions extends LogCompatibilityOptions {
  name: string;
  level?: string;
  showName?: boolean;
  showPid?: boolean;
  showHostname?: boolean;
}

/**
 * A logger that mimics Bunyan-style output and formatting.
 * Inherits all standard logging methods from BaseCompatibleLogger.
 */
export class BunyanCompatibleLogger extends BaseCompatibleLogger {
  private showName: boolean;
  private showPid: boolean;
  private showHostname: boolean;
  private os: any;

  constructor(options: BunyanCompatibleOptions = { name: 'app' }) {
    const opts = { ...options, name: options?.name || 'app' };
    super(opts);

    this.showName = opts.showName !== false;
    this.showPid = opts.showPid === true;
    this.showHostname = opts.showHostname === true;

    this.initOsModule();
  }

  /**
   * Dynamically loads the OS module or polyfill for compatibility.
   */
  private async initOsModule(): Promise<void> {
    if (!this.os) {
      this.os = isBrowserEnvironment()
        ? BROWSER_POLYFILLS.os
        : (await import('os')).default || (await import('os'));
    }
  }

  /**
   * Formats a message with Bunyan-style context metadata.
   * Includes optional name, pid, and hostname.
   */
  private formatBunyanMessage(msg: string): string {
    const parts: string[] = [];

    if (this.showName) parts.push(`[${this.name}]`);
    if (this.showPid) parts.push(`[pid:${process.pid}]`);
    if (this.showHostname) {
      try {
        const hostname = this.os?.hostname?.() || 'unknown';
        parts.push(`[host:${hostname}]`);
      } catch {
        // Ignore hostname errors
      }
    }

    return parts.length ? `${parts.join(' ')} ${msg}` : msg;
  }

  /**
   * Asynchronous log dispatcher that supports dynamic OS info.
   * Called internally by overridden `log()` method.
   */
  public async logAsync(level: string, message: string): Promise<void> {
    if (!this.os) await this.initOsModule();

    const formattedMsg = this.formatBunyanMessage(message);
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

  /**
   * Synchronous wrapper for the async Bunyan-style log dispatcher.
   * Required for compatibility with inherited methods like `info()`.
   */
  public override log(msg: string, level = 'info'): void {
    // Don't await to preserve sync compatibility; fire and forget
    void this.logAsync(level, msg).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Bunyan-style info logging with optional object parameter
   */
  public override info(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    this.log(message, 'info');
  }

  /**
   * Bunyan-style warn logging with optional object parameter
   */
  public override warn(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    this.log(message, 'warn');
  }

  /**
   * Bunyan-style error logging with optional object parameter
   */
  public override error(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    this.log(message, 'error');
  }

  /**
   * Bunyan-style debug logging with optional object parameter
   */
  public override debug(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    this.log(message, 'debug');
  }

  /**
   * Public getter for the logger name
   */
  public get loggerName(): string {
    return this.name;
  }
}

/**
 * Factory to create a Bunyan-compatible logger instance.
 */
export function createBunyanCompatible(
  options: BunyanCompatibleOptions = { name: 'app' }
): BunyanCompatibleLogger {
  return new BunyanCompatibleLogger(options);
}

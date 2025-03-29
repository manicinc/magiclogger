import { isBrowserEnvironment } from '../../../src/utils/environment';
import { BROWSER_POLYFILLS } from '../../../src/utils/browser-polyfills';
import {
  BaseCompatibleLogger,
  LogCompatibilityOptions,
} from '../../../src/compatibility/BaseCompatibleLogger';

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
   * Synchronous wrapper for Bunyan-compatible logging.
   * Accepts string messages or object + message pairs.
   *
   * @param objOrMsg The message string or data object to log
   * @param msgStr Optional additional message
   */
  public override log(objOrMsg: unknown, msgStr?: string): void {
    const level = typeof objOrMsg === 'string' && !msgStr ? 'info' : 'info';
    const message = this.formatMessage(objOrMsg, msgStr);

    // Fire-and-forget async handling
    void this.logAsync(level, message).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Async dispatcher for log levels, with optional bunyan-style prefixing.
   * @param level Log level string
   * @param message Final message to log
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
}

/**
 * Factory to create a Bunyan-compatible logger instance.
 */
export function createBunyanCompatible(
  options: BunyanCompatibleOptions = { name: 'app' }
): BunyanCompatibleLogger {
  return new BunyanCompatibleLogger(options);
}

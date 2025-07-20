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
  /**
   * Default tags to apply to all log entries.
   */
  defaultTags?: string[];
  /**
   * Default context to apply to all log entries.
   */
  defaultContext?: Record<string, any>;
}

/**
 * A logger that mimics Bunyan-style output and formatting.
 * Inherits all standard logging methods from BaseCompatibleLogger.
 */
export class BunyanCompatibleLogger extends BaseCompatibleLogger {
  private showName: boolean;
  private showPid: boolean;
  private showHostname: boolean;
  private defaultTags?: string[];
  private defaultContext?: Record<string, any>;
  private os: { hostname?: () => string } | undefined;

  constructor(options: BunyanCompatibleOptions = { name: 'app' }) {
    const opts = { ...options, name: options?.name || 'app' };
    super(opts);

    this.showName = opts.showName !== false;
    this.showPid = opts.showPid === true;
    this.showHostname = opts.showHostname === true;
    this.defaultTags = opts.defaultTags;
    this.defaultContext = opts.defaultContext;

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
   * Asynchronous log dispatcher that supports dynamic OS info and enhanced metadata.
   */
  public async logAsync(level: string, message: string, meta?: any): Promise<void> {
    if (!this.os) await this.initOsModule();

    const formattedMsg = this.formatBunyanMessage(message);
    const normalized = level.toLowerCase();
    const isStrict = this.strictLevels;

    switch (normalized) {
      case 'trace':
        this.logger.debug(`TRACE: ${formattedMsg}`, meta);
        break;
      case 'debug':
        this.logger.debug(formattedMsg, meta);
        break;
      case 'info':
        this.logger.info(formattedMsg, meta);
        break;
      case 'warn':
        this.logger.warn(formattedMsg, meta);
        break;
      case 'error':
        this.logger.error(formattedMsg, meta);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${formattedMsg}`, meta);
        break;
      default:
        if (isStrict) throw new Error(`Unknown log level: ${level}`);
        this.logger.custom(formattedMsg, ['white'], level.toUpperCase());
    }
  }

  /**
   * Bunyan-style log method that accepts level and message/object with context and tags support
   */
  public log(level: string, msgOrObj: unknown & { context?: Record<string, any>; tags?: string[] }): void {
    let message: string;
    let context: Record<string, any> | undefined;
    let tags: string[] | undefined;
    
    // Handle JSON string parsing for Bunyan-style object logging
    if (typeof msgOrObj === 'string') {
      try {
        // Try to parse as JSON to extract message and other fields
        const parsed = JSON.parse(msgOrObj);
        if (typeof parsed === 'object' && parsed !== null) {
          // Extract message field if it exists, otherwise stringify the whole object
          message = parsed.message || JSON.stringify(parsed);
          context = parsed.context || this.defaultContext;
          tags = parsed.tags || this.defaultTags;
        } else {
          message = msgOrObj;
        }
      } catch {
        // Not valid JSON, treat as regular string
        message = msgOrObj;
      }
    } else if (typeof msgOrObj === 'object' && msgOrObj !== null) {
      const obj = msgOrObj as any;
      message = obj.message || this.safeSerialize(msgOrObj);
      context = obj.context || this.defaultContext;
      tags = obj.tags || this.defaultTags;
    } else {
      message = this.safeSerialize(msgOrObj);
    }

    // Create enhanced metadata
    const enhancedMeta: any = {};
    if (context) {
      Object.assign(enhancedMeta, context);
    }

    // Don't await to preserve sync compatibility; fire and forget
    void this.logAsync(level, message, enhancedMeta).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Log with explicit context and tags.
   */
  public logWithContext(level: string, message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log(level, { message, context, tags });
  }

  /**
   * Bunyan-style info logging with optional object parameter
   */
  public override info(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    void this.logAsync('info', message).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Bunyan-style warn logging with optional object parameter
   */
  public override warn(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    void this.logAsync('warn', message).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Bunyan-style error logging with optional object parameter
   */
  public override error(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    void this.logAsync('error', message).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
  }

  /**
   * Bunyan-style debug logging with optional object parameter
   */
  public override debug(msgOrObj: unknown, msg?: string): void {
    const message = this.formatMessage(msgOrObj, msg);
    void this.logAsync('debug', message).catch(err => {
      console.error('Bunyan logger failed:', err);
    });
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

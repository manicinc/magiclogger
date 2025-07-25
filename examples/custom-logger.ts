/**
 * Custom Logger Adapter Example
 *
 * This example demonstrates how to create a custom compatibility adapter
 * for a fictional 'SimpleLogger' library.
 */

import { BaseCompatibleLogger, LogCompatibilityOptions } from 'magiclogger/compatibility/base';
// import { ColorName } from 'magiclogger/types';

/**
 * Custom options for SimpleLogger compatibility
 */
export interface SimpleLoggerOptions extends LogCompatibilityOptions {
  /**
   * Application identifier
   * @default 'myapp'
   */
  appId?: string;

  /**
   * Whether to include timestamp in logs
   * @default true
   */
  withTimestamp?: boolean;

  /**
   * Custom format style when using 'custom' format
   * @default 'standard'
   */
  customFormat?: 'standard' | 'compact' | 'detailed';
}

/**
 * SimpleLogger compatible adapter
 * This is a fictional example of creating a custom adapter
 */
export class SimpleLoggerAdapter extends BaseCompatibleLogger {
  /**
   * Application identifier
   */
  private appId: string;

  /**
   * Whether to include timestamps
   */
  private withTimestamp: boolean;

  /**
   * Custom output format style
   */
  private customFormat: 'standard' | 'compact' | 'detailed';

  /**
   * Stored options for child logger creation
   */
  private options: SimpleLoggerOptions;

  /**
   * Creates a new SimpleLogger adapter
   *
   * @param options - Configuration options
   */
  constructor(options?: SimpleLoggerOptions) {
    super(options);

    this.options = options || {};
    this.appId = options?.appId || 'myapp';
    this.withTimestamp = options?.withTimestamp !== false;
    this.customFormat = options?.customFormat || 'standard';
  }

  /**
   * Get current timestamp string
   *
   * @returns Formatted timestamp
   * @private
   */
  private getTimestamp(): string {
    if (!this.withTimestamp) return '';

    const now = new Date();
    const timestamp = now.toISOString();
    return `[${timestamp}] `;
  }

  /**
   * Format message according to selected custom format
   *
   * @param level - Log level
   * @param message - Message to format
   * @returns Formatted message
   * @private
   */
  protected formatMessage(level: string, message: string): string {
    const timestamp = this.getTimestamp();

    switch (this.customFormat) {
      case 'compact':
        return `${timestamp}[${level[0].toUpperCase()}] ${message}`;

      case 'detailed':
        return `${timestamp}[${this.appId}] [${level.toUpperCase()}] ${message}`;

      case 'standard':
      default:
        return `${timestamp}[${level.toUpperCase()}] ${message}`;
    }
  }

  /**
   * Implementation of the abstract log method
   *
   * @param level - Log level
   * @param message - Message to log
   */
  log(level: string, message: string): void {
    const formattedMessage = this.formatMessage(level, message);

    switch (level.toLowerCase()) {
      case 'debug':
        this.logger.debug(formattedMessage);
        break;
      case 'info':
        this.logger.log(formattedMessage);
        break;
      case 'warning':
      case 'warn':
        this.logger.warn(formattedMessage);
        break;
      case 'error':
        this.logger.error(formattedMessage);
        break;
      case 'critical':
        this.logger.error(`CRITICAL: ${formattedMessage}`);
        break;
      default:
        this.logger.custom(formattedMessage, ['white'], level.toUpperCase());
    }
  }

  /**
   * SimpleLogger-specific debug method
   *
   * @param message - Message to log
   */
  debug(message: string): void {
    this.log('debug', message);
  }

  /**
   * SimpleLogger-specific info method
   *
   * @param message - Message to log
   */
  info(message: string): void {
    this.log('info', message);
  }

  /**
   * SimpleLogger-specific warning method
   *
   * @param message - Message to log
   */
  warning(message: string): void {
    this.log('warning', message);
  }

  /**
   * SimpleLogger-specific error method
   *
   * @param message - Message to log
   */
  error(message: string): void {
    this.log('error', message);
  }

  /**
   * SimpleLogger-specific critical method
   *
   * @param message - Message to log
   */
  critical(message: string): void {
    this.log('critical', message);
  }

  /**
   * Warning method (required by BaseCompatibleLogger)
   *
   * @param args - Arguments to log
   */
  warn(...args: unknown[]): void {
    const message = args.join(' ');
    this.log('warning', message);
  }

  /**
   * Create a child logger (required by BaseCompatibleLogger)
   *
   * @param options - Child logger options
   * @returns New child logger instance
   */
  child(options: Record<string, unknown>): BaseCompatibleLogger {
    const childOptions: SimpleLoggerOptions = {
      ...this.options,
      appId: (options.appId as string) || this.appId,
      customFormat: this.customFormat,
    };
    return new SimpleLoggerAdapter(childOptions);
  }

  /**
   * SimpleLogger-specific method for structured logging
   *
   * @param level - Log level
   * @param data - Data object to log
   * @param message - Optional message
   */
  logStructured(level: string, data: Record<string, unknown>, message?: string): void {
    const serializedData = this.safeSerialize(data);
    const fullMessage = message ? `${message} ${serializedData}` : serializedData;

    this.log(level, fullMessage);
  }

  /**
   * Set the application identifier
   *
   * @param appId - New application identifier
   * @returns This instance for chaining
   */
  setAppId(appId: string): this {
    this.appId = appId;
    return this;
  }

  /**
   * Enable or disable timestamps
   *
   * @param enabled - Whether timestamps should be enabled
   * @returns This instance for chaining
   */
  setTimestamp(enabled: boolean): this {
    this.withTimestamp = enabled;
    return this;
  }

  /**
   * Set the output format - override base implementation
   * Maps compatibility formats to SimpleLogger formats
   *
   * @param format - Base format type
   */
  public setFormat(format: 'json' | 'plain' | 'custom'): void {
    // Map base formats to SimpleLogger formats
    switch (format) {
      case 'json':
        this.customFormat = 'detailed';
        break;
      case 'plain':
        this.customFormat = 'standard';
        break;
      case 'custom':
        this.customFormat = 'compact';
        break;
    }
    super.setFormat(format);
  }
}

/**
 * Factory function to create a SimpleLogger adapter
 *
 * @param options - Configuration options
 * @returns SimpleLogger adapter instance
 */
export function createSimpleLogger(options?: SimpleLoggerOptions): SimpleLoggerAdapter {
  return new SimpleLoggerAdapter(options);
}

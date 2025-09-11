/**
 * Fully synchronous console transport for immediate output.
 *
 * This transport implements the correct architecture where console
 * output is completely synchronous with no promises, callbacks, or
 * async operations. Perfect for development and debugging.
 *
 * @module transports/SyncConsoleTransport
 */

import { Transport } from './base/Transport';
import type { LogEntry, LogLevel } from '../types/transport';

/**
 * Configuration options for SyncConsoleTransport.
 *
 * @interface SyncConsoleTransportOptions
 */
export interface SyncConsoleTransportOptions {
  /**
   * Transport name.
   * @default 'sync-console'
   */
  name?: string;

  /**
   * Whether the transport is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to use colors.
   * @default true
   */
  useColors?: boolean;

  /**
   * Whether to show timestamps.
   * @default false
   */
  showTimestamp?: boolean;

  /**
   * Whether to show log level.
   * @default true
   */
  showLevel?: boolean;

  /**
   * Whether to show metadata.
   * @default false
   */
  showMetadata?: boolean;

  /**
   * Minimum log level.
   * @default 'debug'
   */
  level?: LogLevel;

  /**
   * Custom prefix for all logs.
   */
  prefix?: string;
}

/**
 * Fully synchronous console transport.
 *
 * This transport writes directly to console with no async operations,
 * promises, or callbacks. It provides immediate feedback which is
 * essential for development and debugging.
 *
 * @class SyncConsoleTransport
 * @extends {Transport}
 *
 * @example
 * ```typescript
 * const consoleTransport = new SyncConsoleTransport({
 *   useColors: true,
 *   showTimestamp: true,
 *   showLevel: true
 * });
 *
 * // Direct, synchronous output
 * consoleTransport.log(entry);  // Appears immediately
 * ```
 */
export class SyncConsoleTransport extends Transport {
  /**
   * Console-specific options.
   * @private
   */
  private readonly consoleOptions: SyncConsoleTransportOptions;

  /**
   * ANSI color codes for each log level.
   * @private
   */
  private readonly levelColors: Record<LogLevel, string> = {
    trace: '\x1b[90m', // gray
    debug: '\x1b[36m', // cyan
    info: '\x1b[37m', // white
    success: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    fatal: '\x1b[35m', // magenta
  };

  /**
   * Console methods for each log level.
   * @private
   */
  private readonly consoleMethods: Record<LogLevel, 'log' | 'info' | 'warn' | 'error' | 'debug'> = {
    trace: 'log',
    debug: 'debug',
    info: 'log',
    success: 'log',
    warn: 'warn',
    error: 'error',
    fatal: 'error',
  };

  /**
   * Creates a new SyncConsoleTransport instance.
   *
   * @param {SyncConsoleTransportOptions} [options] - Transport configuration.
   */
  constructor(options: SyncConsoleTransportOptions = {}) {
    super({
      name: options.name || 'sync-console',
      enabled: options.enabled !== false,
      level: options.level || 'debug',
      format: 'plain', // Console should use plain format by default
    });

    this.consoleOptions = {
      useColors: options.useColors !== false,
      showTimestamp: options.showTimestamp || false,
      showLevel: options.showLevel !== false,
      showMetadata: options.showMetadata !== false, // Default to true for compatibility
      level: options.level || 'debug',
      prefix: options.prefix,
      ...options,
    };
  }

  /**
   * Logs an entry synchronously to the console.
   *
   * This is the key method that demonstrates the correct architecture:
   * completely synchronous with no promises or async operations.
   *
   * @param {LogEntry} entry - The log entry.
   * @returns {Promise<void>} Resolves immediately since this is synchronous.
   * @protected
   * @override
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    // Format the log line
    const line = this.formatConsoleEntry(entry);

    // Get the appropriate console method
    const method = this.consoleMethods[entry.level] || 'log';

    // Direct, synchronous output
    console[method](line);
  }

  /**
   * High-performance synchronous log method.
   *
   * Called directly by TransportManager.logSync() to avoid async overhead.
   * This method provides maximum performance by skipping Promise allocation.
   *
   * @param {LogEntry} entry - The log entry.
   * @returns {void}
   * @public
   */
  public logSync(entry: LogEntry): void {
    if (!this.enabled || !this.shouldLog(entry)) {
      return;
    }

    this.stats.processed++;

    try {
      // Format the log line
      const line = this.formatConsoleEntry(entry);

      // Get the appropriate console method
      const method = this.consoleMethods[entry.level] || 'log';

      // Direct, synchronous output
      console[method](line);

      this.stats.succeeded++;
    } catch (error) {
      this.stats.failed++;
      this.handleError(error as Error);
    }
  }

  /**
   * Formats a log entry for console output.
   *
   * @param {LogEntry} entry - The log entry.
   * @returns {string} Formatted log line.
   * @private
   */
  private formatConsoleEntry(entry: LogEntry): string {
    const parts: string[] = [];

    // Add prefix if configured
    if (this.consoleOptions.prefix) {
      parts.push(this.consoleOptions.prefix);
    }

    // Add timestamp if configured
    if (this.consoleOptions.showTimestamp) {
      const timestamp = entry.timestamp || new Date().toISOString();
      if (this.consoleOptions.useColors) {
        parts.push(`\x1b[90m${timestamp}\x1b[0m`);
      } else {
        parts.push(`[${timestamp}]`);
      }
    }

    // Add log level if configured
    if (this.consoleOptions.showLevel) {
      const level = entry.level.toUpperCase().padEnd(7);
      if (this.consoleOptions.useColors) {
        const color = this.levelColors[entry.level] || '\x1b[37m';
        parts.push(`${color}${level}\x1b[0m`);
      } else {
        parts.push(`[${level}]`);
      }
    }

    // Add message
    parts.push(entry.message);

    // Add metadata if configured
    if (this.consoleOptions.showMetadata && entry.context) {
      const meta = this.formatMetadata(entry.context);
      if (meta) {
        parts.push(meta);
      }
    }

    // Add error stack if present - check both entry.error and entry.context.err
    const error = entry.error || (entry.context && (entry.context as any).err);
    if (error) {
      // Format error display
      if (typeof error === 'object' && 'message' in error) {
        // Display as "Error - message" format
        const errorObj = error as { message: string; stack?: string };
        parts.push(`Error - ${errorObj.message}`);
        if (errorObj.stack) {
          parts.push('\n' + errorObj.stack);
        }
      } else if (typeof error === 'object' && 'stack' in error) {
        const errorObj = error as { stack: string };
        parts.push('\n' + errorObj.stack);
      }
    }

    return parts.join(' ');
  }

  /**
   * Formats metadata for display.
   *
   * @param {any} metadata - The metadata to format.
   * @returns {string} Formatted metadata.
   * @private
   */
  private formatMetadata(metadata: any): string {
    if (!metadata || typeof metadata !== 'object') {
      return '';
    }

    // Filter out internal fields and error (which is displayed separately)
    const filteredMeta = { ...metadata };
    delete filteredMeta.err;
    delete filteredMeta.error;
    delete filteredMeta.level;
    delete filteredMeta.time;
    delete filteredMeta.msg;
    delete filteredMeta.loggerId;

    // For simple objects, inline them
    const keys = Object.keys(filteredMeta);
    if (keys.length === 0) {
      return '';
    }

    if (keys.length <= 3) {
      const pairs = keys.map(key => {
        const value = filteredMeta[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return `${key}=${value}`;
        }
        return `${key}=[object]`;
      });

      if (this.consoleOptions.useColors) {
        return `\x1b[90m{${pairs.join(', ')}}\x1b[0m`;
      } else {
        return `{${pairs.join(', ')}}`;
      }
    }

    // For complex objects, use JSON
    try {
      const json = JSON.stringify(filteredMeta, null, 2);
      if (this.consoleOptions.useColors) {
        return `\n\x1b[90m${json}\x1b[0m`;
      } else {
        return `\n${json}`;
      }
    } catch {
      return '[circular]';
    }
  }

  /**
   * Initializes the transport.
   * No-op for console transport.
   *
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  protected async doInit(): Promise<void> {
    // No initialization needed for console
  }

  /**
   * Closes the transport.
   * No-op for console transport.
   *
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  protected async doClose(): Promise<void> {
    // No cleanup needed for console
  }
}

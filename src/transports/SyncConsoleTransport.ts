/**
 * Fully synchronous console transport for immediate output.
 * 
 * This transport implements the correct architecture where console
 * output is completely synchronous with no promises, callbacks, or
 * async operations. Perfect for development and debugging.
 * 
 * @module transports/SyncConsoleTransport
 */

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
export class SyncConsoleTransport {
  /**
   * Transport name.
   */
  public readonly name: string;
  
  /**
   * Configuration options.
   * @private
   */
  private readonly options: SyncConsoleTransportOptions;
  
  /**
   * Log level priority map.
   * @private
   */
  private readonly levelPriority: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    success: 2,
    warn: 3,
    error: 4,
    fatal: 5
  };
  
  /**
   * ANSI color codes for each log level.
   * @private
   */
  private readonly levelColors: Record<LogLevel, string> = {
    trace: '\x1b[90m',    // gray
    debug: '\x1b[36m',    // cyan
    info: '\x1b[37m',     // white
    success: '\x1b[32m',  // green
    warn: '\x1b[33m',     // yellow
    error: '\x1b[31m',    // red
    fatal: '\x1b[35m'     // magenta
  };
  
  /**
   * Console methods for each log level.
   * @private
   */
  private readonly consoleMethods: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
    trace: 'log',
    debug: 'log',
    info: 'info',
    success: 'log',
    warn: 'warn',
    error: 'error',
    fatal: 'error'
  };

  /**
   * Creates a new SyncConsoleTransport instance.
   * 
   * @param {SyncConsoleTransportOptions} [options] - Transport configuration.
   */
  constructor(options: SyncConsoleTransportOptions = {}) {
    this.name = options.name || 'sync-console';
    this.options = {
      useColors: options.useColors !== false,
      showTimestamp: options.showTimestamp || false,
      showLevel: options.showLevel !== false,
      showMetadata: options.showMetadata || false,
      level: options.level || 'debug',
      prefix: options.prefix,
      ...options
    };
  }

  /**
   * Logs an entry synchronously to the console.
   * 
   * This is the key method that demonstrates the correct architecture:
   * completely synchronous with no promises or async operations.
   * 
   * @param {LogEntry} entry - The log entry.
   * @returns {void} Nothing - this is a synchronous operation.
   */
  public log(entry: LogEntry): void {
    // Check log level
    if (!this.shouldLog(entry.level)) {
      return;
    }
    
    // Format the log line
    const line = this.formatEntry(entry);
    
    // Get the appropriate console method
    const method = this.consoleMethods[entry.level] || 'log';
    
    // Direct, synchronous output
    console[method](line);
  }

  /**
   * Checks if a log level should be logged.
   * 
   * @param {LogLevel} level - The log level to check.
   * @returns {boolean} True if should log.
   * @private
   */
  private shouldLog(level: LogLevel): boolean {
    const entryPriority = this.levelPriority[level] ?? 2;
    const configPriority = this.levelPriority[this.options.level!] ?? 0;
    return entryPriority >= configPriority;
  }

  /**
   * Formats a log entry for console output.
   * 
   * @param {LogEntry} entry - The log entry.
   * @returns {string} Formatted log line.
   * @private
   */
  private formatEntry(entry: LogEntry): string {
    const parts: string[] = [];
    
    // Add prefix if configured
    if (this.options.prefix) {
      parts.push(this.options.prefix);
    }
    
    // Add timestamp if configured
    if (this.options.showTimestamp) {
      const timestamp = entry.timestamp || new Date().toISOString();
      if (this.options.useColors) {
        parts.push(`\x1b[90m${timestamp}\x1b[0m`);
      } else {
        parts.push(`[${timestamp}]`);
      }
    }
    
    // Add log level if configured
    if (this.options.showLevel) {
      const level = entry.level.toUpperCase().padEnd(7);
      if (this.options.useColors) {
        const color = this.levelColors[entry.level] || '\x1b[37m';
        parts.push(`${color}${level}\x1b[0m`);
      } else {
        parts.push(`[${level}]`);
      }
    }
    
    // Add message
    parts.push(entry.message);
    
    // Add metadata if configured
    if (this.options.showMetadata && entry.context) {
      const meta = this.formatMetadata(entry.context);
      if (meta) {
        parts.push(meta);
      }
    }
    
    // Add error stack if present
    if (entry.error && entry.error.stack) {
      parts.push('\n' + entry.error.stack);
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
    
    // For simple objects, inline them
    const keys = Object.keys(metadata);
    if (keys.length === 0) {
      return '';
    }
    
    if (keys.length <= 3) {
      const pairs = keys.map(key => {
        const value = metadata[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return `${key}=${value}`;
        }
        return `${key}=[object]`;
      });
      
      if (this.options.useColors) {
        return `\x1b[90m{${pairs.join(', ')}}\x1b[0m`;
      } else {
        return `{${pairs.join(', ')}}`;
      }
    }
    
    // For complex objects, use JSON
    try {
      const json = JSON.stringify(metadata, null, 2);
      if (this.options.useColors) {
        return `\n\x1b[90m${json}\x1b[0m`;
      } else {
        return `\n${json}`;
      }
    } catch {
      return '[circular]';
    }
  }

  /**
   * Checks if transport is enabled.
   * This transport is always enabled unless explicitly disabled.
   * 
   * @returns {boolean} True if enabled.
   */
  public get enabled(): boolean {
    return true;
  }

  /**
   * Initializes the transport.
   * No-op for console transport.
   * 
   * @returns {void}
   */
  public init(): void {
    // No initialization needed for console
  }

  /**
   * Closes the transport.
   * No-op for console transport.
   * 
   * @returns {void}
   */
  public close(): void {
    // No cleanup needed for console
  }

  /**
   * Flushes any pending output.
   * No-op for console transport since it's always synchronous.
   * 
   * @returns {void}
   */
  public flush(): void {
    // Console is always synchronous, nothing to flush
  }

  /**
   * Gets transport statistics.
   * 
   * @returns {object} Transport stats.
   */
  public getStats(): object {
    return {
      name: this.name,
      type: 'sync-console',
      enabled: true
    };
  }
}
// File: src/transports/implementations/ConsoleTransport.ts

import { Transport } from '../Transport';
import { Formatter } from '../../../core/Formatter';
import type { LogEntry, TransportStats, ConsoleTransportOptions } from '../../../types/transport';

/**
 * Transport that outputs logs to the console.
 * 
 * The ConsoleTransport provides flexible console output with:
 * - Color support for better readability
 * - Configurable output format
 * - Level-based console method selection
 * - Metadata and context display
 * - Cross-platform compatibility
 * 
 * This transport is ideal for:
 * - Development environments
 * - CLI applications
 * - Real-time log monitoring
 * - Debugging and troubleshooting
 * 
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const consoleTransport = new ConsoleTransport({
 *   name: 'console',
 *   level: 'debug',
 *   useColors: true,
 *   showTimestamp: true,
 *   showTags: true
 * });
 * 
 * await consoleTransport.log({
 *   level: 'info',
 *   message: 'Application started',
 *   tags: ['startup']
 * });
 * ```
 */
export class ConsoleTransport extends Transport {
  /**
   * Formatter instance for applying colors and styles.
   * @private
   */
  private colorFormatter: Formatter;

  /**
   * Console output configuration.
   * @private
   */
  private readonly useColors: boolean;
  private readonly showTimestamp: boolean;
  private readonly showLevel: boolean;
  private readonly showLoggerId: boolean;
  private readonly showTags: boolean;
  private readonly showMetadata: boolean;
  private readonly prefix?: string;
  private readonly consoleMethods: Required<NonNullable<ConsoleTransportOptions['consoleMethods']>>;

  /**
   * Creates a new ConsoleTransport instance.
   * 
   * @param {ConsoleTransportOptions} options - Transport configuration
   */
  constructor(options: ConsoleTransportOptions) {
    super(options);

    // Initialize configuration with defaults
    this.useColors = options.useColors ?? true;
    this.showTimestamp = options.showTimestamp ?? true;
    this.showLevel = options.showLevel ?? true;
    this.showLoggerId = options.showLoggerId ?? false;
    this.showTags = options.showTags ?? false;
    this.showMetadata = options.showMetadata ?? true;
    this.prefix = options.prefix;

    // Set up console methods mapping
    this.consoleMethods = {
      debug: options.consoleMethods?.debug ?? 'debug',
      info: options.consoleMethods?.info ?? 'info',
      warn: options.consoleMethods?.warn ?? 'warn',
      error: options.consoleMethods?.error ?? 'error',
      default: options.consoleMethods?.default ?? 'log',
    };

    // Initialize formatter
    this.colorFormatter = new Formatter(this.useColors);
  }

  /**
   * Initialize the console transport.
   * 
   * @returns {Promise<void>} Resolves immediately as no setup needed
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Console transport doesn't need initialization
    // But we can verify console methods exist
    this.validateConsoleMethods();
  }

  /**
   * Validate that configured console methods exist.
   * 
   * @throws {Error} If a configured console method doesn't exist
   * @private
   */
  private validateConsoleMethods(): void {
    const methods = Object.values(this.consoleMethods);
    const uniqueMethods = [...new Set(methods)];

    for (const method of uniqueMethods) {
      if (typeof console[method] !== 'function') {
        throw new Error(`Console method '${method}' does not exist`);
      }
    }
  }

  /**
   * Log an entry to the console.
   * 
   * @param {LogEntry} entry - The log entry to output
   * @returns {Promise<void>} Resolves when logged
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    // Format the log entry
    const formatted = this.formatConsoleOutput(entry);

    // Determine console method to use and call it directly
    const method = this.getConsoleMethod(entry.level);
    
    // Use type-safe console method calls
    switch (method) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
      default:
        console.log(formatted);
        break;
    }

    // Log additional data if present
    if (this.showMetadata) {
      this.logMetadata(entry, method);
    }
  }

  /**
   * Format a log entry for console output.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted console output
   * @private
   */
  private formatConsoleOutput(entry: LogEntry): string {
    const parts: string[] = [];

    // Add custom prefix if configured
    if (this.prefix) {
      parts.push(this.formatPrefix(this.prefix));
    }

    // Add timestamp
    if (this.showTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    // Add log level
    if (this.showLevel) {
      parts.push(this.formatLevel(entry.level));
    }

    // Add logger ID
    if (this.showLoggerId && entry.loggerId) {
      parts.push(this.formatLoggerId(entry.loggerId));
    }

    // Add tags
    if (this.showTags && entry.tags && entry.tags.length > 0) {
      parts.push(this.formatTags(entry.tags));
    }

    // Add the message
    const message = this.useColors ? entry.message : (entry.plainMessage || entry.message);
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Format a custom prefix.
   * 
   * @param {string} prefix - The prefix to format
   * @returns {string} Formatted prefix
   * @private
   */
  private formatPrefix(prefix: string): string {
    if (!this.useColors) {
      return `[${prefix}]`;
    }

        return this.colorFormatter.colorize(`[${prefix}]`, ['magenta', 'bold']);
  }

  /**
   * Format a timestamp for display.
   * 
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   * @private
   */
  private formatTimestamp(timestamp: string): string {
    // Convert to local time for console display
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    if (!this.useColors) {
      return `[${time}]`;
    }

    return this.colorFormatter.colorize(`[${time}]`, ['gray']);
  }

  /**
   * Format a log level for display.
   * 
   * @param {string} level - The log level
   * @returns {string} Formatted level
   * @private
   */
  private formatLevel(level: string): string {
    const paddedLevel = level.toUpperCase().padEnd(7);
    
    if (!this.useColors) {
      return `[${paddedLevel}]`;
    }

    // Choose color based on level
    const colorMap: Record<string, any[]> = {
      debug: ['gray', 'italic'],
      info: ['cyan', 'bold'],
      warn: ['yellow', 'bold'],
      warning: ['yellow', 'bold'],
      error: ['brightRed', 'bold'],
      success: ['green', 'bold'],
    };

    const colors = colorMap[level.toLowerCase()] || ['white'];
    return this.colorFormatter.colorize(`[${paddedLevel}]`, colors);
  }

  /**
   * Format a logger ID for display.
   * 
   * @param {string} loggerId - The logger ID
   * @returns {string} Formatted logger ID
   * @private
   */
  private formatLoggerId(loggerId: string): string {
    if (!this.useColors) {
      return `[${loggerId}]`;
    }

    return this.colorFormatter.colorize(`[${loggerId}]`, ['blue']);
  }

  /**
   * Format tags for display.
   * 
   * @param {string[]} tags - Array of tags
   * @returns {string} Formatted tags
   * @private
   */
  private formatTags(tags: string[]): string {
    const tagStr = tags.join(',');
    
    if (!this.useColors) {
      return `[${tagStr}]`;
    }

    return this.colorFormatter.colorize(`[${tagStr}]`, ['magenta']);
  }

  /**
   * Log metadata (context, error details) if present.
   * 
   * @param {LogEntry} entry - The log entry
   * @param {string} method - Console method to use
   * @private
   */
  private logMetadata(entry: LogEntry, method: string): void {
    // Helper function to get the appropriate console method
    const getConsoleMethod = (methodName: string) => {
      switch (methodName) {
        case 'debug': return console.debug;
        case 'info': return console.info;
        case 'warn': return console.warn;
        case 'error': return console.error;
        default: return console.log;
      }
    };
    
    const consoleMethod = getConsoleMethod(method);
    
    // Log error details if present
    if (entry.error) {
      const errorLabel = this.useColors 
        ? this.colorFormatter.colorize('Error:', ['red', 'bold'])
        : 'Error:';
      
      consoleMethod(errorLabel, entry.error.message);
      
      if (entry.error.stack) {
        consoleMethod(entry.error.stack);
      }

      // Log additional error properties
      const { name, message, stack, ...additionalProps } = entry.error;
      if (Object.keys(additionalProps).length > 0) {
        const propsLabel = this.useColors
          ? this.colorFormatter.colorize('Error Details:', ['red'])
          : 'Error Details:';
        consoleMethod(propsLabel, additionalProps);
      }
    }

    // Log context if present and not empty
    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextLabel = this.useColors
        ? this.colorFormatter.colorize('Context:', ['blue'])
        : 'Context:';
      consoleMethod(contextLabel, entry.context);
    }

    // Log metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      const metadataLabel = this.useColors
        ? this.colorFormatter.colorize('Metadata:', ['gray'])
        : 'Metadata:';
      consoleMethod(metadataLabel, entry.metadata);
    }
  }

  /**
   * Determine which console method to use for a log level.
   * 
   * @param {string} level - The log level
   * @returns {keyof Console} Console method name
   * @private
   */
  private getConsoleMethod(level: string): keyof Console {
    const normalizedLevel = level.toLowerCase();

    // Check if we have a specific mapping for this level
    if (normalizedLevel in this.consoleMethods) {
      return this.consoleMethods[normalizedLevel as keyof typeof this.consoleMethods] as keyof Console;
    }

    // Use default method for unknown levels
    return this.consoleMethods.default as keyof Console;
  }

  /**
   * Format entry according to transport configuration.
   * 
   * Overrides base implementation to handle console-specific formatting.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted entry
   * @protected
   */
  protected formatEntry(entry: LogEntry): string {
    switch (this.format) {
      case 'json':
        // For JSON format, return the full entry
        return JSON.stringify(entry, null, 2);
      
      case 'plain':
        // Use console-specific plain format
        return this.formatConsoleOutput(entry);
      
      case 'custom':
        if (!this.colorFormatter) {
          throw new Error('Custom formatter not provided');
        }
        return this.colorFormatter.colorize(entry.message, []) as string;
      
      default:
        return this.formatConsoleOutput(entry);
    }
  }

  /**
   * Clean up console transport resources.
   * 
   * @returns {Promise<void>} Resolves immediately as no cleanup needed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Console transport doesn't need cleanup
    // But we can log a final message if in debug mode
    if (this.level === 'debug' && this.enabled) {
      console.debug(`[${this.name}] Console transport closed`);
    }
  }

  /**
   * Get transport statistics with console-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add console-specific stats
    stats.custom = {
      ...stats.custom,
      useColors: this.useColors,
      showTimestamp: this.showTimestamp,
      showLevel: this.showLevel,
      showLoggerId: this.showLoggerId,
      showTags: this.showTags,
      showMetadata: this.showMetadata,
    };

    return stats;
  }
}

/**
 * Factory function to create a console transport with common defaults.
 * 
 * @param {Partial<ConsoleTransportOptions>} [options={}] - Transport options
 * @returns {ConsoleTransport} Configured console transport
 */
export function createConsoleTransport(
  options: Partial<ConsoleTransportOptions> = {}
): ConsoleTransport {
  return new ConsoleTransport({
    name: 'console',
    enabled: true,
    level: 'info',
    useColors: true,
    showTimestamp: true,
    showLevel: true,
    ...options,
  });
}

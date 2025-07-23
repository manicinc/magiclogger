// File: src/transports/base/implementations/ConsoleTransport.ts

import { Transport } from '../Transport';
import type { LogEntry } from '../../../types/transport';
import * as colorette from 'colorette';

// Define the options interface directly here since TypeScript is having issues finding it
interface ConsoleTransportOptions {
  name: string;
  enabled?: boolean;
  level?: string;
  levels?: string[];
  tags?: string[];
  excludeTags?: string[];
  filter?: (entry: LogEntry) => boolean;
  silent?: boolean;
  timeout?: number;
  format?: 'json' | 'plain' | 'custom';
  formatter?: (entry: LogEntry) => string | Buffer;
  useColors?: boolean;
  showTimestamp?: boolean;
  showLevel?: boolean;
  showLoggerId?: boolean;
  showTags?: boolean;
  showMetadata?: boolean;
  prefix?: string;
  consoleMethods?: {
    debug?: keyof Console;
    info?: keyof Console;
    warn?: keyof Console;
    error?: keyof Console;
    default?: keyof Console;
    [key: string]: keyof Console | undefined;
  };
}

/**
 * Console transport for outputting logs to stdout/stderr.
 * 
 * Features:
 * - Color-coded output by log level
 * - Pretty printing with indentation
 * - Error stack trace formatting
 * - Metadata and context display
 * - Custom formatters
 * - Browser console API support
 * 
 * @class ConsoleTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const consoleTransport = new ConsoleTransport({
 *   name: 'console',
 *   useColors: true,
 *   showTimestamp: true,
 *   showLevel: true
 * });
 * ```
 */
export class ConsoleTransport extends Transport {
  /**
   * Whether to use colors in output.
   * @private
   */
  private readonly useColors: boolean;

  /**
   * Whether to show timestamps.
   * @private
   */
  private readonly showTimestamp: boolean;

  /**
   * Whether to show log level.
   * @private
   */
  private readonly showLevel: boolean;

  /**
   * Whether to show logger ID.
   * @private
   */
  private readonly showLoggerId: boolean;

  /**
   * Whether to show tags.
   * @private
   */
  private readonly showTags: boolean;

  /**
   * Whether to show metadata.
   * @private
   */
  private readonly showMetadata: boolean;

  /**
   * Custom prefix for all logs.
   * @private
   */
  private readonly prefix?: string;

  /**
   * Color functions for each log level.
   * @private
   */
  private readonly levelColors: Record<string, (str: string) => string>;

  /**
   * Console methods for each log level.
   * @private
   */
  private readonly consoleMethods: Record<string, keyof Console>;

  /**
   * Creates a new ConsoleTransport instance.
   * 
   * @param {ConsoleTransportOptions} options - Transport configuration
   */
  constructor(options: ConsoleTransportOptions) {
    super(options);

    this.useColors = options.useColors ?? true;
    this.showTimestamp = options.showTimestamp ?? true;
    this.showLevel = options.showLevel ?? true;
    this.showLoggerId = options.showLoggerId ?? true;
    this.showTags = options.showTags ?? true;
    this.showMetadata = options.showMetadata ?? false;
    this.prefix = options.prefix;

    // Set up color mapping
    this.levelColors = {
      debug: colorette.gray,
      info: colorette.blue,
      warn: colorette.yellow,
      error: colorette.red,
      success: colorette.green,
    };

    // Set up console method mapping
    const defaultMethods: Record<string, keyof Console> = {
      debug: 'debug',
      info: 'info',
      warn: 'warn',
      error: 'error',
      success: 'log',
    };

    // Filter out undefined values from options.consoleMethods
    const customMethods: Record<string, keyof Console> = {};
    if (options.consoleMethods) {
      for (const [key, value] of Object.entries(options.consoleMethods)) {
        if (value !== undefined) {
          customMethods[key] = value;
        }
      }
    }

    this.consoleMethods = {
      ...defaultMethods,
      ...customMethods,
    };
  }

  /**
   * Initialize console transport (no-op).
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async doInit(): Promise<void> {
    // No initialization needed for console
  }

  /**
   * Log entry to console.
   * 
   * @param {LogEntry} entry - Log entry to output
   * @returns {Promise<void>} Resolves when logged
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    const output = this.formatEntry(entry);
    this.writeToConsole(entry.level, output);
  }

  /**
   * Format log entry for console output.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted output
   * @protected
   */
  protected formatEntry(entry: LogEntry): string | Buffer {
    if (this.formatter) {
      return this.formatter(entry);
    }

    switch (this.format) {
      case 'json':
        return this.formatJson(entry);
      
      case 'plain':
        return this.formatPlain(entry);
      
      case 'custom':
        return this.formatPlain(entry); // Fallback if no formatter
      
      default:
        return this.formatPlain(entry);
    }
  }

  /**
   * Format entry as JSON.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {string} JSON formatted output
   * @private
   */
  private formatJson(entry: LogEntry): string {
    const output: Record<string, unknown> = {};

    if (this.showTimestamp) {
      output.timestamp = entry.timestamp;
    }

    if (this.showLevel) {
      output.level = entry.level;
    }

    output.message = entry.message;

    if (this.showLoggerId && entry.loggerId) {
      output.loggerId = entry.loggerId;
    }

    if (this.showTags && entry.tags && entry.tags.length > 0) {
      output.tags = entry.tags;
    }

    if (entry.error) {
      output.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      };
    }

    if (this.showMetadata) {
      if (entry.context && Object.keys(entry.context).length > 0) {
        output.context = entry.context;
      }

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        output.metadata = entry.metadata;
      }
    }

    return JSON.stringify(output);
  }

  /**
   * Format entry as plain text.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {string} Plain text output
   * @protected
   */
  protected formatPlain(entry: LogEntry): string {
    const parts: string[] = [];

    // Prefix
    if (this.prefix) {
      parts.push(this.prefix);
    }

    // Timestamp
    if (this.showTimestamp) {
      const timestamp = this.useColors 
        ? colorette.gray(entry.timestamp)
        : entry.timestamp;
      parts.push(timestamp);
    }

    // Level
    if (this.showLevel) {
      const levelStr = entry.level.toUpperCase().padEnd(7);
      const level = this.useColors && this.levelColors[entry.level]
        ? this.levelColors[entry.level](levelStr)
        : levelStr;
      parts.push(level);
    }

    // Logger ID
    if (this.showLoggerId && entry.loggerId) {
      const loggerId = this.useColors
        ? colorette.cyan(`[${entry.loggerId}]`)
        : `[${entry.loggerId}]`;
      parts.push(loggerId);
    }

    // Tags
    if (this.showTags && entry.tags && entry.tags.length > 0) {
      const tags = this.useColors
        ? colorette.magenta(`{${entry.tags.join(', ')}}`)
        : `{${entry.tags.join(', ')}}`;
      parts.push(tags);
    }

    // Message - use plain message if available to avoid double coloring
    parts.push(entry.plainMessage || entry.message);

    let output = parts.join(' ');

    // Error details
    if (entry.error) {
      const errorOutput = this.formatError(entry.error);
      output += '\n' + errorOutput;
    }

    // Metadata
    if (this.showMetadata) {
      if (entry.context && Object.keys(entry.context).length > 0) {
        output += '\n' + this.formatMetadata('Context', entry.context);
      }

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        output += '\n' + this.formatMetadata('Metadata', entry.metadata);
      }
    }

    return output;
  }

  /**
   * Format error for output.
   * 
   * @param {object} error - Error object
   * @returns {string} Formatted error
   * @private
   */
  private formatError(error: NonNullable<LogEntry['error']>): string {
    const lines: string[] = [];

    // Error name and message
    const header = this.useColors
      ? colorette.red(`Error: ${error.name} - ${error.message}`)
      : `Error: ${error.name} - ${error.message}`;
    lines.push(header);

    // Stack trace
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1); // Skip first line (already in header)
      
      if (this.useColors) {
        stackLines.forEach(line => {
          if (line.includes('at ')) {
            // Highlight function names
            const colored = line.replace(
              /at\s+([^\s]+)/,
              (match, func) => `at ${colorette.yellow(func)}`
            );
            lines.push(colorette.gray(colored));
          } else {
            lines.push(colorette.gray(line));
          }
        });
      } else {
        lines.push(...stackLines);
      }
    }

    return lines.map(line => '  ' + line).join('\n');
  }

  /**
   * Format metadata for output.
   * 
   * @param {string} label - Label for the metadata
   * @param {object} data - Metadata object
   * @returns {string} Formatted metadata
   * @private
   */
  private formatMetadata(label: string, data: Record<string, unknown>): string {
    const header = this.useColors
      ? colorette.gray(`${label}:`)
      : `${label}:`;
    
    const json = JSON.stringify(data, null, 2);
    const indented = json.split('\n').map(line => '  ' + line).join('\n');
    
    return header + '\n' + (this.useColors ? colorette.gray(indented) : indented);
  }

  /**
   * Write output to console.
   * 
   * @param {string} level - Log level
   * @param {string | Buffer} output - Output to write
   * @private
   */
  private writeToConsole(level: string, output: string | Buffer): void {
    const outputStr = output instanceof Buffer ? output.toString() : output;
    
    // Determine which console method to use
    const methodKey = this.consoleMethods[level] || this.consoleMethods.default || 'log';
    
    // Use direct method calls instead of dynamic access
    switch (methodKey) {
      case 'debug':
        console.debug(outputStr);
        break;
      case 'info':
        console.info(outputStr);
        break;
      case 'warn':
        console.warn(outputStr);
        break;
      case 'error':
        console.error(outputStr);
        break;
      case 'log':
      default:
        console.log(outputStr);
        break;
    }
  }

  /**
   * Batch log entries.
   * 
   * @param {LogEntry[]} entries - Entries to log
   * @returns {Promise<void>} Resolves when all logged
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // Group consecutive entries for cleaner output
    if (this.format === 'json' && typeof console.group === 'function') {
      console.group(`Batch of ${entries.length} logs`);
      for (const entry of entries) {
        await this.doLog(entry);
      }
      console.groupEnd();
    } else {
      // Log each entry normally
      for (const entry of entries) {
        await this.doLog(entry);
      }
    }
  }

  /**
   * Close console transport (no-op).
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async doClose(): Promise<void> {
    // No cleanup needed for console
  }

  /**
   * Clear console output.
   */
  public clear(): void {
    if (typeof console.clear === 'function') {
      console.clear();
    }
  }
}

/**
 * Factory function to create a ConsoleTransport instance.
 * 
 * @param {Partial<ConsoleTransportOptions>} [options] - Console transport configuration options
 * @returns {ConsoleTransport} New ConsoleTransport instance
 * 
 * @example
 * ```typescript
 * const transport = createConsoleTransport({
 *   useColors: true,
 *   showTimestamp: true
 * });
 * ```
 */
export function createConsoleTransport(options: Partial<ConsoleTransportOptions> = {}): ConsoleTransport {
  const defaultOptions: ConsoleTransportOptions = {
    name: 'console',
    enabled: true,
    useColors: true,
    showTimestamp: true,
    showLevel: true,
    showLoggerId: false,
    showTags: true,
    showMetadata: false,
    prefix: '',
    ...options
  };
  
  return new ConsoleTransport(defaultOptions);
}
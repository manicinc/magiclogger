// File: src/transports/base/implementations/ConsoleTransport.ts

import { Transport } from '../Transport';
import type { LogEntry } from '../../../types/transport';
import { Colorizer } from '../../../core/Colorizer';
import type { ColorName } from '../../../types/colors';
import { isBrowserEnvironment } from '../../../utils/environment';

// Align options with shared transport types and allow a few extras for console formatting.
import type { ConsoleTransportOptions as ConsoleTransportOptionsBase } from '../../../types/transport';
export interface ConsoleTransportOptions extends ConsoleTransportOptionsBase {
  // Extras specific to formatting/visibility in this implementation
  showTimestamp?: boolean;
  showLevel?: boolean;
  showLoggerId?: boolean;
  showTags?: boolean;
  showMetadata?: boolean;
  prefix?: string;
  // Accept both naming conventions
  useColors?: boolean; // preferred in impl
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
  private readonly consoleMethods: Record<string, 'log' | 'info' | 'warn' | 'error' | 'debug'>;

  /**
   * Creates a new ConsoleTransport instance.
   *
   * @param {ConsoleTransportOptions} options - Transport configuration
   */
  constructor(options: ConsoleTransportOptions) {
    // Default to 'debug' level for console to ensure all logs are visible unless overridden
    super({ ...options, level: options.level ?? 'debug' });

    // Support both `useColors` and legacy `colorize`
    const colorizeOption = (options as unknown as { colorize?: boolean }).colorize;
    this.useColors = options.useColors ?? colorizeOption ?? true;
    this.showTimestamp = options.showTimestamp ?? true;
    this.showLevel = options.showLevel ?? true;
    this.showLoggerId = options.showLoggerId ?? true;
    this.showTags = options.showTags ?? true;
    this.showMetadata = options.showMetadata ?? false;
    this.prefix = options.prefix;

    // Helper to bind a color function using internal Colorizer
    const colorFn = (name: ColorName) => (str: string) =>
      this.useColors ? Colorizer.color(str, name, true) : str;

    // Set up color mapping using internal Colorizer
    this.levelColors = {
      debug: colorFn('gray'),
      info: colorFn('blue'),
      warn: colorFn('yellow'),
      error: colorFn('red'),
      success: colorFn('green'),
    };

    // Set up console method mapping
    const defaultMethods: Record<string, 'log' | 'info' | 'warn' | 'error' | 'debug'> = {
      debug: 'debug',
      info: 'info',
      warn: 'warn',
      error: 'error',
      success: 'log',
      log: 'log',
      default: 'log',
    };

    // Sanitize and merge any provided custom methods
    const customInput = (options.consoleMethods ?? {}) as Record<string, unknown>;
    const methodEntries = Object.entries(customInput).filter(
      (entry): entry is [string, 'log' | 'info' | 'warn' | 'error' | 'debug'] => {
        const v = entry[1];
        return v === 'log' || v === 'info' || v === 'warn' || v === 'error' || v === 'debug';
      }
    );
    const customMethods = Object.fromEntries(methodEntries) as Record<
      string,
      'log' | 'info' | 'warn' | 'error' | 'debug'
    >;

    this.consoleMethods = { ...defaultMethods, ...customMethods } as Record<
      string,
      'log' | 'info' | 'warn' | 'error' | 'debug'
    >;
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
   * Console is not a batching transport; let base class handle per-log stats.
   */
  public supportsBatching(): boolean {
    return false;
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
    // Signal immediate success to the base class by not throwing.
    // Base Transport.log will increment succeeded/lastSuccess for non-batching transports.
  }

  /**
   * Format log entry for console output.
   *
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted output
   * @protected
   */
  protected formatEntry(entry: LogEntry): string | Buffer {
    if (typeof this.formatter === 'function') {
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
        ? Colorizer.color(entry.timestamp, 'gray', true)
        : entry.timestamp;
      parts.push(timestamp);
    }

    // Level
    if (this.showLevel) {
      const levelStr = entry.level.toUpperCase().padEnd(7);
      const colorFn =
        this.useColors && this.levelColors ? this.levelColors[entry.level] : undefined;
      const level = typeof colorFn === 'function' ? colorFn(levelStr) : levelStr;
      parts.push(level);
    }

    // Logger ID
    if (this.showLoggerId && entry.loggerId) {
      const loggerId = this.useColors
        ? Colorizer.color(`[${entry.loggerId}]`, 'cyan', true)
        : `[${entry.loggerId}]`;
      parts.push(loggerId);
    }

    // Tags
    if (this.showTags && entry.tags && entry.tags.length > 0) {
      const tags = this.useColors
        ? Colorizer.color(`{${entry.tags.join(', ')}}`, 'magenta', true)
        : `{${entry.tags.join(', ')}}`;
      parts.push(tags);
    }

    // Message - reconstruct styled message if styles are available
    let messageOutput: string;

    if ((entry as unknown as Record<string, unknown>)._styledMessage) {
      // Use pre-styled message if available (temporary backward compat)
      messageOutput = String((entry as unknown as Record<string, unknown>)._styledMessage);
    } else if (entry.styles && entry.styles.length > 0 && this.useColors) {
      // Reconstruct styled message from plain text and style ranges
      messageOutput = this.applyStylesToMessage(entry.message, entry.styles);
    } else {
      // Use plain message
      messageOutput = String(entry.message ?? '');
    }

    parts.push(messageOutput);

    let output = parts.join(' ');

    // Error details - check multiple locations where error might be stored
    const error =
      entry.error ||
      (entry.context &&
        ((entry.context as Record<string, unknown>).err ||
          (entry.context as Record<string, unknown>).error));
    if (error) {
      // Display as "Error: name - message" format
      if (typeof error === 'object' && 'message' in error) {
        const errorName = (error as any).name || 'Error';
        const errorLine = this.useColors
          ? Colorizer.color(`Error: ${errorName} - ${error.message}`, 'red', true)
          : `Error: ${errorName} - ${error.message}`;
        output += ' ' + errorLine;
        if ((error as any).stack) {
          output += '\n' + (error as any).stack;
        }
      } else {
        try {
          const errorOutput =
            typeof this.formatError === 'function' ? this.formatError(error as any) : String(error);
          output += '\n' + errorOutput;
        } catch {
          /* ignore formatting errors */
        }
      }
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
      ? Colorizer.color(`Error: ${error.name} - ${error.message}`, 'red', true)
      : `Error: ${error.name} - ${error.message}`;
    lines.push(header);

    // Stack trace
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1); // Skip first line (already in header)

      if (this.useColors) {
        stackLines.forEach(line => {
          // Keep entire stack line gray for readability.
          lines.push(Colorizer.color(line, 'gray', true));
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
  private formatMetadata(label: string, data?: Record<string, unknown>): string {
    // Filter out internal fields and error (which is displayed separately)
    const filteredData = { ...data } as Record<string, unknown>;
    delete filteredData.err;
    delete filteredData.error;
    delete filteredData.level;
    delete filteredData.time;
    delete filteredData.msg;
    delete filteredData.plainMsg;
    delete filteredData.loggerId;
    delete filteredData.styles;

    // Skip if no data left after filtering
    if (Object.keys(filteredData).length === 0) {
      return '';
    }

    const header = this.useColors ? Colorizer.color(`${label}:`, 'gray', true) : `${label}:`;

    const json = JSON.stringify(filteredData, null, 2);
    const indented = json
      .split('\n')
      .map(line => '  ' + line)
      .join('\n');

    return header + '\n' + (this.useColors ? Colorizer.color(indented, 'gray', true) : indented);
  }

  /**
   * Strip ANSI color codes from a string.
   *
   * @param {string} str - String containing ANSI codes
   * @returns {string} String without ANSI codes
   * @private
   */
  private stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Write output to console.
   *
   * @param {string} level - Log level
   * @param {string | Buffer} output - Output to write
   * @private
   */
  private writeToConsole(level: string, output: string | Buffer): void {
    const outputStr = output instanceof Buffer ? output.toString() : (output as string);

    // In browser environments, strip ANSI codes as they don't work in browser console
    // Browser console uses CSS styling with %c prefix instead
    let finalOutput = outputStr;
    if (isBrowserEnvironment() && this.useColors) {
      // Strip ANSI codes but keep the text
      finalOutput = this.stripAnsiCodes(outputStr);
      // Note: For proper browser console colors, use BrowserLogger or a browser-specific transport
    }

    // Determine which console method to use
    const methodKey = this.consoleMethods[level] ?? this.consoleMethods['default'] ?? 'log';

    // Use direct method calls instead of dynamic access
    try {
      switch (methodKey) {
        case 'debug':
          console.debug?.(finalOutput);
          break;
        case 'info':
          console.info?.(finalOutput);
          break;
        case 'warn':
          console.warn?.(finalOutput);
          break;
        case 'error':
          console.error?.(finalOutput);
          break;
        case 'log':
        default:
          console.log?.(finalOutput);
          break;
      }
    } catch {
      // Swallow logging errors
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
    // No error thrown means base Transport.logBatch will count successes for non-batching transports.
  }

  /**
   * Apply styles to a plain message using style ranges.
   * Reconstructs styled output for console display.
   *
   * @param {string} plainText - Plain text message
   * @param {Array} styles - Style ranges [start, end, style]
   * @returns {string} Styled text with ANSI codes
   * @private
   */
  private applyStylesToMessage(plainText: string, styles: Array<[number, number, string]>): string {
    if (!styles || styles.length === 0) {
      return plainText;
    }

    // Import required modules
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Colorizer } = require('../../../core/Colorizer');

    // Sort styles by start index
    const sortedStyles = [...styles].sort((a, b) => a[0] - b[0]);

    let result = '';
    let lastEnd = 0;

    for (const [start, end, styleStr] of sortedStyles) {
      // Add unstyled text before this range
      result += plainText.slice(lastEnd, start);

      // Parse style string (e.g., "red.bold" → ["red", "bold"])
      const styleNames = styleStr.split('.');

      // Apply styles to the text segment
      const styledSegment = Colorizer.applyColors(
        plainText.slice(start, end),
        styleNames,
        true // useColors
      );

      result += styledSegment;
      lastEnd = end;
    }

    // Add any remaining unstyled text
    result += plainText.slice(lastEnd);

    return result;
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
export function createConsoleTransport(
  options: Partial<ConsoleTransportOptions> = {}
): ConsoleTransport {
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
    ...options,
  };

  return new ConsoleTransport(defaultOptions);
}

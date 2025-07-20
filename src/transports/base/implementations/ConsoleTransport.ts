// File: src/transports/base/implementations/ConsoleTransport.ts

import { Transport } from '../Transport';
import { Formatter } from '../../../core/Formatter';
import { Colorizer } from '../../../core/Colorizer';
import type { 
  ConsoleTransportOptions, 
  LogEntry, 
  LogLevel,
  ColorName 
} from '../../../types/transport';

/**
 * Console transport for outputting logs to the console.
 * 
 * This transport provides rich console output with:
 * - ANSI color support for terminals
 * - Structured output with timestamps and levels
 * - Metadata and error stack trace display
 * - Customizable formatting options
 * - Different console methods for different levels
 * 
 * @class ConsoleTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const consoleTransport = new ConsoleTransport({
 *   name: 'console',
 *   level: 'debug',
 *   useColors: true,
 *   showTimestamp: true,
 *   showMetadata: true
 * });
 * 
 * logger.addTransport(consoleTransport);
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
   * Custom prefix for all messages.
   * @private
   */
  private readonly prefix?: string;

  /**
   * Console methods mapping.
   * @private
   */
  private readonly consoleMethods: Record<string, keyof Console>;

  /**
   * Formatter instance.
   * @private
   */
  private formatter: Formatter;

  /**
   * Level colors mapping.
   * @private
   */
  private readonly levelColors: Record<LogLevel, ColorName[]> = {
    debug: ['gray'],
    info: ['brightCyan'],
    warn: ['brightYellow'],
    error: ['brightRed'],
    success: ['brightGreen'],
  };

  /**
   * Store original console methods to prevent recursion.
   * @private
   */
  private readonly originalConsole = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

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
    this.showLoggerId = options.showLoggerId ?? false;
    this.showTags = options.showTags ?? false;
    this.showMetadata = options.showMetadata ?? true;
    this.prefix = options.prefix;

    // Set up console methods
    this.consoleMethods = {
      debug: options.consoleMethods?.debug || 'debug',
      info: options.consoleMethods?.info || 'log',
      warn: options.consoleMethods?.warn || 'warn',
      error: options.consoleMethods?.error || 'error',
      default: options.consoleMethods?.default || 'log',
      ...options.consoleMethods,
    };

    this.formatter = new Formatter(this.useColors);
  }

  /**
   * Initialize the transport.
   * Console transport doesn't need initialization.
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async doInit(): Promise<void> {
    // No initialization needed for console
  }

  /**
   * Log a single entry to the console.
   * 
   * @param {LogEntry} entry - The log entry to output
   * @returns {Promise<void>} Resolves when logged
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    const output = this.formatConsoleOutput(entry);
    const method = this.getConsoleMethod(entry.level);
    
    // Use the bound original console method
    this.originalConsole[method as keyof typeof this.originalConsole]?.(output) || 
    this.originalConsole.log(output);
  }

  /**
   * Log multiple entries efficiently.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {Promise<void>} Resolves when all logged
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // Group by console method for efficiency
    const grouped = new Map<string, string[]>();

    for (const entry of entries) {
      const output = this.formatConsoleOutput(entry);
      const method = this.getConsoleMethod(entry.level);
      
      if (!grouped.has(method)) {
        grouped.set(method, []);
      }
      grouped.get(method)!.push(output);
    }

    // Log each group
    for (const [method, outputs] of grouped) {
      const consoleMethod = this.originalConsole[method as keyof typeof this.originalConsole] || 
                           this.originalConsole.log;
      consoleMethod(...outputs);
    }
  }

  /**
   * Format a log entry for console output.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted output string
   * @private
   */
  private formatConsoleOutput(entry: LogEntry): string {
    const parts: string[] = [];

    // Add prefix if configured
    if (this.prefix) {
      parts.push(this.colorize(this.prefix, ['dim']));
    }

    // Add timestamp
    if (this.showTimestamp) {
      const timestamp = this.formatTimestamp(entry.timestamp);
      parts.push(this.colorize(timestamp, ['dim']));
    }

    // Add log level
    if (this.showLevel) {
      const level = this.formatLevel(entry.level);
      const colors = this.levelColors[entry.level] || ['white'];
      parts.push(this.colorize(level, colors));
    }

    // Add logger ID
    if (this.showLoggerId && entry.loggerId) {
      parts.push(this.colorize(`[${entry.loggerId}]`, ['magenta']));
    }

    // Add tags
    if (this.showTags && entry.tags && entry.tags.length > 0) {
      const tags = `[${entry.tags.join(',')}]`;
      parts.push(this.colorize(tags, ['cyan']));
    }

    // Add the main message
    parts.push(entry.plainMessage || entry.message);

    // Build the main line
    let output = parts.join(' ');

    // Add metadata on new lines
    if (this.showMetadata) {
      // Add error details
      if (entry.error) {
        output += '\n' + this.formatError(entry.error);
      }

      // Add context
      if (entry.context && Object.keys(entry.context).length > 0) {
        output += '\n' + this.formatContext(entry.context);
      }

      // Add metadata
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        output += '\n' + this.formatMetadata(entry.metadata);
      }
    }

    return output;
  }

  /**
   * Format timestamp for display.
   * 
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   * @private
   */
  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    
    return `[${hours}:${minutes}:${seconds}.${ms}]`;
  }

  /**
   * Format log level for display.
   * 
   * @param {LogLevel} level - The log level
   * @returns {string} Formatted level
   * @private
   */
  private formatLevel(level: LogLevel): string {
    return `[${level.toUpperCase().padEnd(7)}]`;
  }

  /**
   * Format error object for display.
   * 
   * @param {LogEntry['error']} error - Error object
   * @returns {string} Formatted error
   * @private
   */
  private formatError(error: LogEntry['error']): string {
    if (!error) return '';

    let output = this.colorize('  Error: ', ['red', 'bold']);
    output += this.colorize(error.message, ['red']);

    if (error.code) {
      output += this.colorize(` (${error.code})`, ['dim']);
    }

    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1); // Skip first line (message)
      output += '\n' + this.colorize('  Stack:', ['red', 'dim']);
      
      for (const line of stackLines) {
        output += '\n' + this.colorize('    ' + line.trim(), ['dim']);
      }
    }

    return output;
  }

  /**
   * Format context object for display.
   * 
   * @param {Record<string, any>} context - Context object
   * @returns {string} Formatted context
   * @private
   */
  private formatContext(context: Record<string, any>): string {
    let output = this.colorize('  Context:', ['blue', 'bold']);
    
    for (const [key, value] of Object.entries(context)) {
      const formattedValue = this.formatValue(value);
      output += '\n' + this.colorize(`    ${key}: `, ['blue']);
      output += formattedValue;
    }

    return output;
  }

  /**
   * Format metadata object for display.
   * 
   * @param {Record<string, any>} metadata - Metadata object
   * @returns {string} Formatted metadata
   * @private
   */
  private formatMetadata(metadata: Record<string, any>): string {
    let output = this.colorize('  Metadata:', ['gray', 'bold']);
    
    for (const [key, value] of Object.entries(metadata)) {
      const formattedValue = this.formatValue(value);
      output += '\n' + this.colorize(`    ${key}: `, ['gray']);
      output += this.colorize(formattedValue, ['dim']);
    }

    return output;
  }

  /**
   * Format a value for display.
   * 
   * @param {any} value - Value to format
   * @returns {string} Formatted value
   * @private
   */
  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2)
          .split('\n')
          .map((line, i) => i === 0 ? line : '    ' + line)
          .join('\n');
      } catch {
        return '[Circular]';
      }
    }

    return String(value);
  }

  /**
   * Apply colors to text if colors are enabled.
   * 
   * @param {string} text - Text to colorize
   * @param {ColorName[]} colors - Colors to apply
   * @returns {string} Colorized text
   * @private
   */
  private colorize(text: string, colors: ColorName[]): string {
    if (!this.useColors) return text;
    return Colorizer.applyColors(text, colors);
  }

  /**
   * Get the appropriate console method for a log level.
   * 
   * @param {LogLevel} level - The log level
   * @returns {string} Console method name
   * @private
   */
  private getConsoleMethod(level: LogLevel): string {
    return this.consoleMethods[level] || this.consoleMethods.default || 'log';
  }

  /**
   * Close the transport.
   * Console transport doesn't need cleanup.
   * 
   * @returns {Promise<void>} Resolves immediately
   * @protected
   */
  protected async doClose(): Promise<void> {
    // No cleanup needed for console
  }

  /**
   * Update color settings.
   * 
   * @param {boolean} useColors - Whether to use colors
   */
  public setUseColors(useColors: boolean): void {
    (this as any).useColors = useColors;
    this.formatter = new Formatter(useColors);
  }
}
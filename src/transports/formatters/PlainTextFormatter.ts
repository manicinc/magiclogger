// File: src/transports/formatters/PlainTextFormatter.ts

import type { LogEntry } from '../../types/transport';

/**
 * Options for plain text formatting.
 */
export interface PlainTextFormatterOptions {
  /**
   * Timestamp format.
   * @default 'ISO' - ISO 8601 format
   */
  timestampFormat?: 'ISO' | 'unix' | 'locale' | 'custom';

  /**
   * Custom timestamp formatter function.
   * Used when timestampFormat is 'custom'.
   */
  customTimestamp?: (date: Date) => string;

  /**
   * Whether to include timestamp.
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Whether to include log level.
   * @default true
   */
  includeLevel?: boolean;

  /**
   * Whether to uppercase log level.
   * @default true
   */
  uppercaseLevel?: boolean;

  /**
   * Whether to include logger ID.
   * @default true
   */
  includeLoggerId?: boolean;

  /**
   * Whether to include tags.
   * @default true
   */
  includeTags?: boolean;

  /**
   * Separator for tags.
   * @default ','
   */
  tagSeparator?: string;

  /**
   * Whether to include error stack traces.
   * @default true
   */
  includeStack?: boolean;

  /**
   * Whether to include context data.
   * @default true
   */
  includeContext?: boolean;

  /**
   * Whether to include metadata.
   * @default false
   */
  includeMetadata?: boolean;

  /**
   * Field separator.
   * @default ' '
   */
  fieldSeparator?: string;

  /**
   * Line ending character.
   * @default '\n'
   */
  eol?: string;

  /**
   * Maximum line length (0 = no limit).
   * @default 0
   */
  maxLineLength?: number;

  /**
   * Truncation indicator.
   * @default '...'
   */
  truncationIndicator?: string;

  /**
   * Template string for custom formatting.
   * Supports placeholders: {timestamp}, {level}, {message}, etc.
   */
  template?: string;
}

/**
 * Formats log entries as human-readable plain text.
 *
 * The PlainTextFormatter provides flexible text output with:
 * - Customizable timestamp formats
 * - Field inclusion/exclusion
 * - Template-based formatting
 * - Line length limits
 * - Stack trace formatting
 *
 * @example
 * ```typescript
 * const formatter = new PlainTextFormatter({
 *   timestampFormat: 'locale',
 *   includeStack: true,
 *   template: '[{timestamp}] [{level}] {message}'
 * });
 *
 * const output = formatter.format(logEntry);
 * console.log(output);
 * ```
 */
export class PlainTextFormatter {
  /**
   * Formatter configuration.
   * @private
   */
  private readonly options: {
    timestampFormat: 'ISO' | 'UTC' | 'locale' | 'unix' | 'custom';
    customTimestamp?: (date: Date) => string;
    includeTimestamp: boolean;
    includeLevel: boolean;
    uppercaseLevel: boolean;
    includeLoggerId: boolean;
    includeTags: boolean;
    tagSeparator: string;
    includeStack: boolean;
    includeContext: boolean;
    includeMetadata: boolean;
    fieldSeparator: string;
    eol: string;
    maxLineLength: number;
    truncationIndicator: string;
    template?: string;
  };

  // (Unused DEFAULT_TEMPLATE constant removed to satisfy TS6133)

  /**
   * Creates a new PlainTextFormatter instance.
   *
   * @param {PlainTextFormatterOptions} [options={}] - Formatter options
   */
  constructor(options: PlainTextFormatterOptions = {}) {
    this.options = {
      timestampFormat: options.timestampFormat ?? 'ISO',
      customTimestamp: options.customTimestamp,
      includeTimestamp: options.includeTimestamp ?? true,
      includeLevel: options.includeLevel ?? true,
      uppercaseLevel: options.uppercaseLevel ?? true,
      includeLoggerId: options.includeLoggerId ?? true,
      includeTags: options.includeTags ?? true,
      tagSeparator: options.tagSeparator ?? ',',
      includeStack: options.includeStack ?? true,
      includeContext: options.includeContext ?? true,
      includeMetadata: options.includeMetadata ?? false,
      fieldSeparator: options.fieldSeparator ?? ' ',
      eol: options.eol ?? '\n',
      maxLineLength: options.maxLineLength ?? 0,
      truncationIndicator: options.truncationIndicator ?? '...',
      template: options.template,
    };
  }

  /**
   * Format a log entry as plain text.
   *
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Plain text formatted string
   */
  public format(entry: LogEntry): string {
    if (this.options.template) {
      return this.formatWithTemplate(entry);
    }

    return this.formatDefault(entry);
  }

  /**
   * Format multiple log entries.
   *
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string} Formatted entries joined by EOL
   */
  public formatBatch(entries: LogEntry[]): string {
    return entries.map(entry => this.format(entry)).join(this.options.eol) + this.options.eol;
  }

  /**
   * Format using default field-based approach.
   *
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted string
   * @private
   */
  private formatDefault(entry: LogEntry): string {
    const parts: string[] = [];

    // Timestamp
    if (this.options.includeTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    // Level
    if (this.options.includeLevel) {
      const level = this.options.uppercaseLevel ? entry.level.toUpperCase() : entry.level;
      parts.push(`[${level.padEnd(7)}]`);
    }

    // Logger ID
    if (this.options.includeLoggerId && entry.loggerId) {
      parts.push(`[${entry.loggerId}]`);
    }

    // Tags
    if (this.options.includeTags && entry.tags && entry.tags.length > 0) {
      parts.push(`[${entry.tags.join(this.options.tagSeparator)}]`);
    }

    // Message
    parts.push(entry.plainMessage || entry.message);

    // Build main line
    let mainLine = parts.join(this.options.fieldSeparator);

    // Apply line length limit if configured
    if (this.options.maxLineLength > 0 && mainLine.length > this.options.maxLineLength) {
      mainLine = this.truncateLine(mainLine);
    }

    const lines: string[] = [mainLine];

    // Error details
    if (entry.error) {
      lines.push(this.formatError(entry.error));
    }

    // Context
    if (this.options.includeContext && entry.context && Object.keys(entry.context).length > 0) {
      lines.push(this.formatContext(entry.context));
    }

    // Metadata
    if (this.options.includeMetadata && entry.metadata && Object.keys(entry.metadata).length > 0) {
      lines.push(this.formatMetadata(entry.metadata));
    }

    return lines.join(this.options.eol);
  }

  /**
   * Format using template string.
   *
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted string
   * @private
   */
  private formatWithTemplate(entry: LogEntry): string {
    if (!this.options.template) {
      return this.formatDefault(entry);
    }

    let result = this.options.template;

    // Replace placeholders
    const replacements: Record<string, string> = {
      timestamp: this.formatTimestamp(entry.timestamp),
      level: this.options.uppercaseLevel ? entry.level.toUpperCase() : entry.level,
      message: entry.plainMessage || entry.message,
      loggerId: entry.loggerId || '',
      tags: entry.tags?.join(this.options.tagSeparator) || '',
    };

    // Replace basic placeholders
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    // Handle context placeholders
    if (entry.context) {
      for (const [key, value] of Object.entries(entry.context)) {
        result = result.replace(new RegExp(`\\{context\\.${key}\\}`, 'g'), String(value));
      }
    }

    // Handle metadata placeholders
    if (entry.metadata) {
      for (const [key, value] of Object.entries(entry.metadata)) {
        result = result.replace(new RegExp(`\\{metadata\\.${key}\\}`, 'g'), String(value));
      }
    }

    // Apply line length limit
    if (this.options.maxLineLength > 0 && result.length > this.options.maxLineLength) {
      result = this.truncateLine(result);
    }

    // Append error and additional info if present
    const additionalLines: string[] = [];

    if (entry.error) {
      additionalLines.push(this.formatError(entry.error));
    }

    if (additionalLines.length > 0) {
      result += this.options.eol + additionalLines.join(this.options.eol);
    }

    return result;
  }

  /**
   * Format timestamp based on configuration.
   *
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted timestamp
   * @private
   */
  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    switch (this.options.timestampFormat) {
      case 'ISO':
        return timestamp;

      case 'unix':
        return String(Math.floor(date.getTime() / 1000));

      case 'locale':
        return date.toLocaleString();

      case 'custom':
        if (this.options.customTimestamp) {
          return this.options.customTimestamp(date);
        }
        return timestamp;

      default:
        return timestamp;
    }
  }

  /**
   * Format error object.
   *
   * @param {LogEntry['error']} error - Error object
   * @returns {string} Formatted error
   * @private
   */
  private formatError(error: NonNullable<LogEntry['error']>): string {
    const lines: string[] = [];

    lines.push(`  Error: ${error.message}`);
    // Narrow to objects that may have a code property
    const hasCode = typeof (error as { code?: unknown }).code !== 'undefined';
    if (hasCode) {
      const code = (error as { code?: string }).code;
      if (typeof code === 'string' && code) {
        lines.push(`  Code: ${code}`);
      }
    }

    if (this.options.includeStack && error.stack) {
      lines.push('  Stack:');
      const stackLines = error.stack.split('\n');

      stackLines.forEach(line => {
        lines.push(`    ${line.trim()}`);
      });
    }

    // Include additional error properties
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, message, stack, ...additional } = error as Record<string, unknown>;

    if (Object.keys(additional).length > 0) {
      lines.push(`  Details: ${JSON.stringify(additional)}`);
    }

    return lines.join(this.options.eol);
  }

  /**
   * Format context object.
   *
   * @param {Record<string, any>} context - Context object
   * @returns {string} Formatted context
   * @private
   */
  private formatContext(context: Record<string, unknown>): string {
    const formatted = this.formatObject(context, '  ');
    return `  Context:${this.options.eol}${formatted}`;
  }

  /**
   * Format metadata object.
   *
   * @param {Record<string, any>} metadata - Metadata object
   * @returns {string} Formatted metadata
   * @private
   */
  private formatMetadata(metadata: Record<string, unknown>): string {
    const formatted = this.formatObject(metadata, '  ');
    return `  Metadata:${this.options.eol}${formatted}`;
  }

  /**
   * Format an object with indentation.
   *
   * @param {Record<string, any>} obj - Object to format
   * @param {string} indent - Indentation string
   * @returns {string} Formatted object
   * @private
   */
  private formatObject(obj: Record<string, unknown>, indent = ''): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        lines.push(`${indent}  ${key}: ${value}`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent}  ${key}:`);
        lines.push(this.formatObject(value as Record<string, unknown>, indent + '  '));
      } else if (Array.isArray(value)) {
        lines.push(`${indent}  ${key}: [${value.join(', ')}]`);
      } else {
        lines.push(`${indent}  ${key}: ${value}`);
      }
    }

    return lines.join(this.options.eol);
  }

  /**
   * Truncate a line to the maximum length.
   *
   * @param {string} line - Line to truncate
   * @returns {string} Truncated line
   * @private
   */
  private truncateLine(line: string): string {
    if (line.length <= this.options.maxLineLength) {
      return line;
    }

    const truncateAt = this.options.maxLineLength - this.options.truncationIndicator.length;
    return line.substring(0, truncateAt) + this.options.truncationIndicator;
  }
}

/**
 * Create plain text formatters with common presets.
 */
export const PlainTextFormatters = {
  /**
   * Simple single-line format.
   */
  simple: () =>
    new PlainTextFormatter({
      includeStack: false,
      includeContext: false,
      includeMetadata: false,
    }),

  /**
   * Detailed multi-line format.
   */
  detailed: () =>
    new PlainTextFormatter({
      includeStack: true,
      includeContext: true,
      includeMetadata: true,
    }),

  /**
   * Syslog-style format.
   */
  syslog: () =>
    new PlainTextFormatter({
      timestampFormat: 'custom',
      customTimestamp: date => {
        const iso = date.toISOString();
        const time = iso.split('T')[1] || iso; // defensive
        const part = time.split('.')[0];
        return part || iso;
      },
      template: '{timestamp} {loggerId} {level}: {message}',
    }),

  /**
   * Apache-style access log format.
   */
  apache: () =>
    new PlainTextFormatter({
      template:
        '[{timestamp}] {context.method} {context.path} {context.status} {context.duration}ms',
      timestampFormat: 'custom',
      customTimestamp: date => date.toUTCString() || date.toISOString() || '',
    }),

  /**
   * Minimal format with just timestamp and message.
   */
  minimal: () =>
    new PlainTextFormatter({
      template: '[{timestamp}] {message}',
      timestampFormat: 'locale',
    }),
};

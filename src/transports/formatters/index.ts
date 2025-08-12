/**
 * Custom formatter implementations for MagicLogger.
 * 
 * This module provides additional formatters beyond JSON and plain text,
 * including XML, CSV, and a base class for creating custom formatters.
 * 
 * @module formatters/custom
 */

import type { LogEntry } from '../../types/transport';
export { XMLFormatter } from './XMLFormatter';

/**
 * Interface for custom formatter implementations.
 * 
 * @interface ICustomFormatter
 */
export interface ICustomFormatter {
  /**
   * Format a single log entry.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted output
   */
  format(entry: LogEntry): string | Buffer;
  
  /**
   * Format multiple log entries.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string | Buffer} Formatted output
   */
  formatBatch?(entries: LogEntry[]): string | Buffer;
}

/**
 * Base class for custom formatters.
 * 
 * Provides common functionality and utilities for formatter implementations.
 * 
 * @abstract
 * @class CustomFormatter
 * @implements {ICustomFormatter}
 * 
 * @example
 * ```typescript
 * class YAMLFormatter extends CustomFormatter {
 *   format(entry: LogEntry): string {
 *     return this.toYAML(entry);
 *   }
 * }
 * ```
 */
export abstract class CustomFormatter implements ICustomFormatter {
  /**
   * Format a single log entry.
   * Subclasses must implement this method.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted output
   * @abstract
   */
  abstract format(entry: LogEntry): string | Buffer;
  
  /**
   * Format multiple log entries.
   * Default implementation calls format() for each entry.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string | Buffer} Formatted output
   */
  formatBatch(entries: LogEntry[]): string | Buffer {
    return entries.map(entry => this.format(entry)).join('\n');
  }
  
  /**
   * Escape special characters for the target format.
   * 
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @protected
   */
  protected escape(str: string): string {
    return str;
  }
  
  /**
   * Convert a value to a safe string representation.
   * 
   * @param {unknown} value - Value to convert
   * @returns {string} String representation
   * @protected
   */
  protected stringify(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }
}


/**
 * CSV formatter for log entries.
 * 
 * Formats log entries as CSV with configurable columns and escaping.
 * 
 * @class CSVFormatter
 * @extends {CustomFormatter}
 * 
 * @example
 * ```typescript
 * const formatter = new CSVFormatter();
 * const csv = formatter.formatBatch(entries);
 * // timestamp,level,message,loggerId,tags
 * // 2024-01-20T10:30:00Z,info,"User logged in",api-server,"auth,user"
 * ```
 */
export class CSVFormatter extends CustomFormatter {
  /**
   * Column definitions.
   * @private
   */
  private readonly columns = [
    'timestamp',
    'level',
    'message',
    'loggerId',
    'tags',
    'error.name',
    'error.message',
    'context',
    'metadata'
  ];
  
  /**
   * Whether to include headers.
   * @private
   */
  private readonly includeHeaders: boolean;
  
  /**
   * CSV delimiter.
   * @private
   */
  private readonly delimiter = ',';
  
  /**
  * Creates a new CSV formatter.
  *
  * The CSV formatter outputs a stable comma-separated representation of each
  * log entry with optional header row. Nested data (context / metadata) is
  * JSON-stringified for preservation. Error name & message are exposed as
  * dedicated columns via `error.name` & `error.message`.
  *
  * Escaping rules:
  *  - Commas, quotes, CR or LF trigger wrapping the field in double quotes
  *  - Embedded double quotes are doubled per RFC 4180
  *  - Undefined / null values become empty fields
  *
  * @param {boolean} [includeHeaders=true] - Include the header line on first batch
  *
  * @example
  * ```ts
  * const formatter = new CSVFormatter();
  * const line = formatter.format(entry); // single row (no header state tracked here)
  * const csv = formatter.formatBatch([entryA, entryB]);
  * // id,timestamp,level,message,loggerId,...
  * // 123,2024-01-01T00:00:00.000Z,info,"User logged in",,
  * ```
   */
  constructor(includeHeaders = true) {
    super();
    this.includeHeaders = includeHeaders;
  }
  
  /**
  * Format a single log entry as a CSV row (no trailing newline).
  * Does not write headers; call {@link formatBatch} for multi-row documents.
  *
  * @param {LogEntry} entry - Log entry to render.
  * @returns {string} CSV row (without line terminator)
   */
  format(entry: LogEntry): string {
    const values = this.columns.map(col => {
      let value: unknown = '';
      
      // Handle nested properties
      if (col.includes('.')) {
        const [parent, child] = col.split('.');
        if (parent === 'error' && entry.error) {
          value = (entry.error as Record<string, unknown>)[child];
        }
      } else if (col === 'tags' && entry.tags) {
        value = entry.tags.join(';');
      } else if ((col === 'context' || col === 'metadata') && entry[col]) {
        value = JSON.stringify(entry[col]);
      } else {
        value = (entry as unknown as Record<string, unknown>)[col];
      }
      
      return this.escapeValue(value);
    });
    
    return values.join(this.delimiter);
  }
  
  /**
  * Format an array of entries as a CSV document.
  * Adds a header row (column names) when `includeHeaders` is true.
  * Always terminates with a single trailing `\n` to simplify streaming append.
  *
  * @param {LogEntry[]} entries - Entries to format
  * @returns {string} Full CSV document
   */
  formatBatch(entries: LogEntry[]): string {
    const rows: string[] = [];
    
    if (this.includeHeaders) {
      rows.push(this.columns.join(this.delimiter));
    }
    
    entries.forEach(entry => {
      rows.push(this.format(entry));
    });
    
    return rows.join('\n') + '\n';
  }
  
  /**
  * Escape an arbitrary value for safe insertion into a CSV field.
  * Applies RFC 4180 quoting. Objects / arrays are JSON stringified via
  * {@link stringify} inherited helper.
  *
  * @param {unknown} value - Value to escape
  * @returns {string} Escaped scalar
  * @private
   */
  private escapeValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    
    const strValue = this.stringify(value);
    
    // Check if value needs escaping
    if (strValue.includes(this.delimiter) || 
        strValue.includes('"') || 
        strValue.includes('\n') ||
        strValue.includes('\r')) {
      // Escape quotes and wrap in quotes
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    
    return strValue;
  }
}

/**
 * Lightweight wrapper formatter that accepts a formatting function instead of subclassing.
 * Useful for quick one-off custom output without defining a new class.
 *
 * @example
 * ```ts
 * import { FunctionFormatter } from 'magiclogger/transports/formatters';
 * const formatter = new FunctionFormatter(entry => `${entry.level.toUpperCase()}: ${entry.message}`);
 * transport.setFormatter(formatter);
 * ```
 */
export class FunctionFormatter extends CustomFormatter {
  private readonly fn: (entry: LogEntry) => string | Buffer;
  constructor(fn: (entry: LogEntry) => string | Buffer) {
    super();
    this.fn = fn;
  }
  format(entry: LogEntry): string | Buffer {
    return this.fn(entry);
  }
}
/**
 * Custom formatter implementations for MagicLogger.
 * 
 * This module provides additional formatters beyond JSON and plain text,
 * including XML, CSV, and a base class for creating custom formatters.
 * 
 * @module formatters/custom
 */

import type { LogEntry } from '../../types/transport';

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
 * XML formatter for log entries.
 * 
 * Formats log entries as XML documents with proper escaping and structure.
 * 
 * @class XMLFormatter
 * @extends {CustomFormatter}
 * 
 * @example
 * ```typescript
 * const formatter = new XMLFormatter();
 * const xml = formatter.format(logEntry);
 * // <log level="info" timestamp="2024-01-20T10:30:00Z">...</log>
 * ```
 */
export class XMLFormatter extends CustomFormatter {
  /**
   * XML declaration.
   * @private
   */
  private readonly xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
  
  /**
   * Format a log entry as XML.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} XML formatted string
   */
  format(entry: LogEntry): string {
    const lines: string[] = [];
    
    lines.push(`<log level="${this.escapeXml(entry.level)}" timestamp="${this.escapeXml(entry.timestamp)}">`);
    lines.push(`  <id>${this.escapeXml(entry.id)}</id>`);
    
    if (entry.loggerId) {
      lines.push(`  <loggerId>${this.escapeXml(entry.loggerId)}</loggerId>`);
    }
    
    lines.push(`  <message>${this.escapeXml(entry.plainMessage || entry.message)}</message>`);
    
    if (entry.tags && entry.tags.length > 0) {
      lines.push('  <tags>');
      entry.tags.forEach(tag => {
        lines.push(`    <tag>${this.escapeXml(tag)}</tag>`);
      });
      lines.push('  </tags>');
    }
    
    if (entry.error) {
      lines.push('  <error>');
      lines.push(`    <name>${this.escapeXml(entry.error.name)}</name>`);
      lines.push(`    <message>${this.escapeXml(entry.error.message)}</message>`);
      if (entry.error.stack) {
        lines.push(`    <stack><![CDATA[${entry.error.stack}]]></stack>`);
      }
      if (entry.error.code) {
        lines.push(`    <code>${this.escapeXml(entry.error.code)}</code>`);
      }
      lines.push('  </error>');
    }
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      lines.push('  <context>');
      this.formatObject(entry.context, lines, '    ');
      lines.push('  </context>');
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      lines.push('  <metadata>');
      this.formatObject(entry.metadata, lines, '    ');
      lines.push('  </metadata>');
    }
    
    lines.push('</log>');
    
    return lines.join('\n');
  }
  
  /**
   * Format multiple entries as an XML document.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string} XML document
   */
  formatBatch(entries: LogEntry[]): string {
    const lines: string[] = [
      this.xmlDeclaration,
      '<logs>'
    ];
    
    entries.forEach(entry => {
      const formatted = this.format(entry);
      // Indent each line
      formatted.split('\n').forEach(line => {
        lines.push('  ' + line);
      });
    });
    
    lines.push('</logs>');
    
    return lines.join('\n');
  }
  
  /**
   * Format an object as XML elements.
   * 
   * @param {Record<string, unknown>} obj - Object to format
   * @param {string[]} lines - Array to append lines to
   * @param {string} indent - Current indentation
   * @private
   */
  private formatObject(obj: Record<string, unknown>, lines: string[], indent: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = this.sanitizeXmlTag(key);
      
      if (value === null || value === undefined) {
        lines.push(`${indent}<${safeKey} />`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent}<${safeKey}>`);
        this.formatObject(value as Record<string, unknown>, lines, indent + '  ');
        lines.push(`${indent}</${safeKey}>`);
      } else if (Array.isArray(value)) {
        lines.push(`${indent}<${safeKey}>`);
        value.forEach(item => {
          lines.push(`${indent}  <item>${this.escapeXml(this.stringify(item))}</item>`);
        });
        lines.push(`${indent}</${safeKey}>`);
      } else {
        lines.push(`${indent}<${safeKey}>${this.escapeXml(this.stringify(value))}</${safeKey}>`);
      }
    }
  }
  
  /**
   * Escape special XML characters.
   * 
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @private
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Sanitize a string to be a valid XML tag name.
   * 
   * @param {string} str - String to sanitize
   * @returns {string} Valid XML tag name
   * @private
   */
  private sanitizeXmlTag(str: string): string {
    // Replace invalid characters with underscores
    return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[0-9-]/, '_');
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
   * @param {boolean} [includeHeaders=true] - Whether to include column headers
   */
  constructor(includeHeaders = true) {
    super();
    this.includeHeaders = includeHeaders;
  }
  
  /**
   * Format a single log entry as CSV row.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} CSV row
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
   * Format multiple entries as CSV document.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string} CSV document
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
   * Escape a CSV value.
   * 
   * @param {unknown} value - Value to escape
   * @returns {string} Escaped value
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
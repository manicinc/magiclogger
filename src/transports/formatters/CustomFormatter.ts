// File: src/transports/formatters/CustomFormatter.ts

import type { LogEntry } from '../../types/transport';

/**
 * Interface for custom formatters.
 */
export interface ICustomFormatter {
  format(entry: LogEntry): string | Buffer;
}

/**
 * Custom formatter class that accepts a formatting function.
 */
export class CustomFormatter implements ICustomFormatter {
  private formatFunction: (entry: LogEntry) => string | Buffer;

  constructor(formatFunction: (entry: LogEntry) => string | Buffer) {
    this.formatFunction = formatFunction;
  }

  format(entry: LogEntry): string | Buffer {
    return this.formatFunction(entry);
  }
}

/**
 * XML formatter for log entries.
 */
export class XMLFormatter implements ICustomFormatter {
  format(entry: LogEntry): string {
    const xmlEntries: string[] = [];
    
    xmlEntries.push(`<log>`);
    xmlEntries.push(`  <id>${this.escapeXml(entry.id)}</id>`);
    xmlEntries.push(`  <timestamp>${this.escapeXml(entry.timestamp)}</timestamp>`);
    xmlEntries.push(`  <level>${this.escapeXml(entry.level)}</level>`);
    xmlEntries.push(`  <message>${this.escapeXml(entry.message)}</message>`);
    
    if (entry.loggerId) {
      xmlEntries.push(`  <loggerId>${this.escapeXml(entry.loggerId)}</loggerId>`);
    }
    
    if (entry.tags && entry.tags.length > 0) {
      xmlEntries.push(`  <tags>`);
      entry.tags.forEach(tag => {
        xmlEntries.push(`    <tag>${this.escapeXml(tag)}</tag>`);
      });
      xmlEntries.push(`  </tags>`);
    }
    
    if (entry.context) {
      xmlEntries.push(`  <context>`);
      Object.entries(entry.context).forEach(([key, value]) => {
        xmlEntries.push(`    <${key}>${this.escapeXml(String(value))}</${key}>`);
      });
      xmlEntries.push(`  </context>`);
    }
    
    if (entry.error) {
      xmlEntries.push(`  <error>`);
      xmlEntries.push(`    <name>${this.escapeXml(entry.error.name)}</name>`);
      xmlEntries.push(`    <message>${this.escapeXml(entry.error.message)}</message>`);
      if (entry.error.stack) {
        xmlEntries.push(`    <stack>${this.escapeXml(entry.error.stack)}</stack>`);
      }
      xmlEntries.push(`  </error>`);
    }
    
    xmlEntries.push(`</log>`);
    
    return xmlEntries.join('\n');
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

/**
 * CSV formatter for log entries.
 */
export class CSVFormatter implements ICustomFormatter {
  private includeHeaders: boolean;
  private headerWritten = false;

  constructor(includeHeaders = true) {
    this.includeHeaders = includeHeaders;
  }

  format(entry: LogEntry): string {
    const lines: string[] = [];
    
    // Write header if this is the first entry and headers are requested
    if (this.includeHeaders && !this.headerWritten) {
      lines.push(this.getHeader());
      this.headerWritten = true;
    }
    
    // Format the entry
    const values = [
      this.escapeCsv(entry.id),
      this.escapeCsv(entry.timestamp),
      this.escapeCsv(entry.level),
      this.escapeCsv(entry.message),
      this.escapeCsv(entry.loggerId || ''),
      this.escapeCsv(entry.tags ? entry.tags.join(';') : ''),
      this.escapeCsv(entry.context ? JSON.stringify(entry.context) : ''),
      this.escapeCsv(entry.error ? `${entry.error.name}: ${entry.error.message}` : '')
    ];
    
    lines.push(values.join(','));
    
    return lines.join('\n');
  }

  private getHeader(): string {
    return 'id,timestamp,level,message,loggerId,tags,context,error';
  }

  private escapeCsv(value: string): string {
    // Escape double quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    
    // Wrap in quotes if contains comma, quote, or newline
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
      return `"${escaped}"`;
    }
    
    return escaped;
  }
}

/**
 * Formatter exports: CSV plus base & XML.
 */
import type { LogEntry } from '../../types/transport';
import { CustomFormatter } from './BaseFormatter';
export { CustomFormatter, FunctionFormatter, type ICustomFormatter } from './BaseFormatter';
export { XMLFormatter } from './XMLFormatter';

/**
 * CSV formatter for log entries.
 *
 * Formats log entries as CSV with configurable columns and escaping.
 */
export class CSVFormatter extends CustomFormatter {
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
  private readonly includeHeaders: boolean;
  private readonly delimiter = ',';

  constructor(includeHeaders = true) {
    super();
    this.includeHeaders = includeHeaders;
  }

  format(entry: LogEntry): string {
    const values = this.columns.map(col => {
      let value: unknown = '';
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

  formatBatch(entries: LogEntry[]): string {
    const rows: string[] = [];
    if (this.includeHeaders) rows.push(this.columns.join(this.delimiter));
    for (const e of entries) rows.push(this.format(e));
    return rows.join('\n') + '\n';
  }

  private escapeValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const strValue = typeof value === 'string' ? value : (() => {
      try { return JSON.stringify(value); } catch { return String(value); }
    })();
    if (strValue.includes(this.delimiter) || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  }
}
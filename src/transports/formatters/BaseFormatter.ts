/**
 * Base formatter abstractions (ICustomFormatter, CustomFormatter, FunctionFormatter).
 * Separated to avoid circular dependencies between index exports and
 * individual formatter implementation files (e.g. XMLFormatter).
 */
import type { LogEntry } from '../../types/transport';

export interface ICustomFormatter {
  format(entry: LogEntry): string | Buffer;
  formatBatch?(entries: LogEntry[]): string | Buffer;
}

export abstract class CustomFormatter implements ICustomFormatter {
  abstract format(entry: LogEntry): string | Buffer;
  formatBatch(entries: LogEntry[]): string | Buffer {
    return entries.map(e => this.format(e)).join('\n');
  }
  protected escape(str: string): string {
    return str;
  }
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

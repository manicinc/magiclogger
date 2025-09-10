/**
 * @fileoverview Lazy serialization utilities for deferred JSON conversion
 * 
 * This module provides lazy serialization capabilities to defer the
 * expensive JSON.stringify operation until actually needed by transports.
 */

import type { LogEntry } from '../types/transport';

/**
 * Lazy log entry that defers serialization
 */
export class LazyLogEntry {
  private serialized: string | null = null;
  private readonly entry: LogEntry;
  
  constructor(entry: LogEntry) {
    this.entry = entry;
  }
  
  /**
   * Get the raw log entry without serialization
   */
  getRaw(): LogEntry {
    return this.entry;
  }
  
  /**
   * Get the serialized JSON string (cached after first call)
   */
  toJSON(): string {
    if (this.serialized === null) {
      // Handle circular references
      const seen = new WeakSet();
      this.serialized = JSON.stringify(this.entry, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
    }
    return this.serialized;
  }
  
  /**
   * Get specific fields without full serialization
   */
  getField<K extends keyof LogEntry>(field: K): LogEntry[K] {
    return this.entry[field];
  }
  
  /**
   * Check if entry matches filter criteria without serialization
   */
  matches(filter: Partial<LogEntry>): boolean {
    for (const key in filter) {
      if (this.entry[key as keyof LogEntry] !== filter[key as keyof LogEntry]) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Schema-based serialization for faster JSON generation
 */
export class SchemaSerializer {
  private readonly schema: string[];
  
  constructor() {
    // Define the expected schema order for optimal serialization
    this.schema = [
      'id',
      'timestamp',
      'timestampMs', 
      'level',
      'message',
      'styles',
      'loggerId',
      'tags',
      'context',
      'error',
      'metadata'
    ];
  }
  
  /**
   * Fast serialization using predefined schema
   */
  serialize(entry: LogEntry): string {
    const parts: string[] = ['{'];
    let first = true;
    
    for (const key of this.schema) {
      const value = entry[key as keyof LogEntry];
      if (value !== undefined) {
        if (!first) parts.push(',');
        parts.push(`"${key}":`);
        parts.push(this.stringifyValue(value));
        first = false;
      }
    }
    
    parts.push('}');
    return parts.join('');
  }
  
  private stringifyValue(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'bigint') return `"${value.toString()}"`;
    if (value instanceof Date) return `"${value.toISOString()}"`;
    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack
      });
    }
    // Fallback to JSON.stringify for complex objects with circular reference handling
    const seen = new WeakSet();
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'bigint') {
        return val.toString();
      }
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    });
  }
}
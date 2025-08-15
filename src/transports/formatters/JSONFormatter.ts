// File: src/transports/formatters/JSONFormatter.ts

import type { LogEntry } from '../../types/transport';

/**
 * Options for JSON formatting.
 */
export interface JSONFormatterOptions {
  /**
   * Whether to pretty-print JSON with indentation.
   * @default false
   */
  pretty?: boolean;

  /**
   * Number of spaces for indentation when pretty-printing.
   * @default 2
   */
  indent?: number;

  /**
   * Fields to include in the output.
   * If not specified, all fields are included.
   */
  includeFields?: Array<keyof LogEntry>;

  /**
   * Fields to exclude from the output.
   * Takes precedence over includeFields.
   */
  excludeFields?: Array<keyof LogEntry>;

  /**
   * Whether to flatten nested objects.
   * @default false
   */
  flatten?: boolean;

  /**
   * Separator for flattened keys.
   * @default '.'
   */
  flattenSeparator?: string;

  /**
   * Maximum depth for flattening.
   * @default 3
   */
  maxFlattenDepth?: number;

  /**
   * Custom replacer function for JSON.stringify.
   */
  replacer?: (key: string, value: unknown) => unknown;

  /**
   * Whether to include a schema version.
   * @default true
   */
  includeSchema?: boolean;

  /**
   * Schema version string.
   * @default '1.0'
   */
  schemaVersion?: string;
}

/**
 * Formats log entries as JSON with various options.
 *
 * The JSONFormatter provides flexible JSON output with:
 * - Field filtering and exclusion
 * - Object flattening for easier parsing
 * - Custom replacer functions
 * - Pretty printing for readability
 * - Schema versioning
 *
 * @example
 * ```typescript
 * const formatter = new JSONFormatter({
 *   pretty: true,
 *   excludeFields: ['metadata'],
 *   flatten: true
 * });
 *
 * const output = formatter.format(logEntry);
 * console.log(output);
 * ```
 */
export class JSONFormatter {
  /**
   * Formatter configuration.
   * @private
   */
  private readonly options: {
    pretty: boolean;
    indent: number;
    includeFields?: Array<keyof LogEntry>;
    excludeFields?: Array<keyof LogEntry>;
    flatten: boolean;
    flattenSeparator: string;
    maxFlattenDepth: number;
    replacer?: (key: string, value: unknown) => unknown;
    includeSchema: boolean;
    schemaVersion: string;
  };

  /**
   * Creates a new JSONFormatter instance.
   *
   * @param {JSONFormatterOptions} [options={}] - Formatter options
   */
  constructor(options: JSONFormatterOptions = {}) {
    this.options = {
      pretty: options.pretty ?? false,
      indent: options.indent ?? 2,
      includeFields: options.includeFields,
      excludeFields: options.excludeFields,
      flatten: options.flatten ?? false,
      flattenSeparator: options.flattenSeparator ?? '.',
      maxFlattenDepth: options.maxFlattenDepth ?? 3,
      replacer: options.replacer,
      includeSchema: options.includeSchema ?? true,
      schemaVersion: options.schemaVersion ?? '1.0',
    };
  }

  /**
   * Format a log entry as JSON.
   *
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} JSON formatted string
   */
  public format(entry: LogEntry): string {
    // Apply field filtering
    const filtered = this.filterFields(entry);

    // Add schema if configured
    const output = this.options.includeSchema
      ? { _schema: this.options.schemaVersion, ...filtered }
      : filtered;

    // Flatten if configured
    const processed = this.options.flatten ? this.flattenObject(output) : output;

    // Convert to JSON
    return JSON.stringify(
      processed,
      this.options.replacer,
      this.options.pretty ? this.options.indent : 0
    );
  }

  /**
   * Format multiple log entries as a JSON array.
   *
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string} JSON array string
   */
  public formatBatch(entries: LogEntry[]): string {
    const formatted = entries.map(entry => {
      const filtered = this.filterFields(entry);

      if (this.options.includeSchema) {
        return { _schema: this.options.schemaVersion, ...filtered };
      }

      return filtered;
    });

    const processed = this.options.flatten
      ? formatted.map(entry => this.flattenObject(entry))
      : formatted;

    return JSON.stringify(
      processed,
      this.options.replacer,
      this.options.pretty ? this.options.indent : 0
    );
  }

  /**
   * Format entries as newline-delimited JSON (NDJSON).
   *
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {string} NDJSON string
   */
  public formatNDJSON(entries: LogEntry[]): string {
    return entries.map(entry => this.format(entry)).join('\n') + '\n';
  }

  /**
   * Filter fields based on include/exclude configuration.
   *
   * @param {LogEntry} entry - Entry to filter
   * @returns {Partial<LogEntry>} Filtered entry
   * @private
   */
  private filterFields(entry: LogEntry): Partial<LogEntry> {
    // Start with all fields
    let result: Record<string, unknown> = { ...entry };

    // Apply include filter if specified
    if (this.options.includeFields) {
      const included: Record<string, unknown> = {};

      for (const field of this.options.includeFields) {
        if (field in entry) {
          included[field] = entry[field];
        }
      }

      result = included;
    }

    // Apply exclude filter (takes precedence)
    if (this.options.excludeFields) {
      for (const field of this.options.excludeFields) {
        delete result[field];
      }
    }

    return result;
  }

  /**
   * Flatten a nested object.
   *
   * @param {any} obj - Object to flatten
   * @param {string} [prefix=''] - Key prefix
   * @param {number} [depth=0] - Current depth
   * @returns {Record<string, any>} Flattened object
   * @private
   */
  private flattenObject(
    obj: Record<string, unknown>,
    prefix = '',
    depth = 0
  ): Record<string, unknown> {
    // Stop flattening only when current depth exceeds the configured max.
    // Using '>' (not '>=') allows keys at the max depth to still be expanded,
    // matching test expectation for a key like 'context.a.b' when maxFlattenDepth=2.
    if (depth > this.options.maxFlattenDepth) {
      return prefix ? { [prefix]: obj } : obj;
    }

    const flattened: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}${this.options.flattenSeparator}${key}` : key;

      if (value === null || value === undefined) {
        flattened[newKey] = value;
      } else if (Array.isArray(value)) {
        // Don't flatten arrays by default
        flattened[newKey] = value;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        // Recursively flatten objects
        Object.assign(
          flattened,
          this.flattenObject(value as Record<string, unknown>, newKey, depth + 1)
        );
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  /**
   * Create a custom replacer function that combines with user replacer.
   *
   * @param {Function} [userReplacer] - User-provided replacer
   * @returns {Function} Combined replacer function
   */
  public createReplacer(
    userReplacer?: (key: string, value: unknown) => unknown
  ): (key: string, value: unknown) => unknown {
    return (key: string, value: unknown) => {
      // Handle special types
      if (value instanceof Error) {
        return {
          ...value,
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }

      // Handle circular references
      if (value === '[Circular]') {
        return '[Circular Reference]';
      }

      // Apply user replacer if provided
      if (userReplacer) {
        value = userReplacer(key, value);
      }

      return value;
    };
  }

  /**
   * Get a streaming formatter function for use with streams.
   *
   * @returns {Function} Formatter function
   */
  public getStreamFormatter(): (entry: LogEntry) => string {
    return (entry: LogEntry) => this.format(entry) + '\n';
  }
}

/**
 * Create a JSON formatter with common presets.
 */
export const JSONFormatters = {
  /**
   * Compact single-line JSON for production.
   */
  compact: () =>
    new JSONFormatter({
      pretty: false,
      includeSchema: false,
    }),

  /**
   * Pretty-printed JSON for development.
   */
  pretty: () =>
    new JSONFormatter({
      pretty: true,
      indent: 2,
    }),

  /**
   * Flattened JSON for easier parsing.
   */
  flat: () =>
    new JSONFormatter({
      flatten: true,
      includeSchema: false,
    }),

  /**
   * Minimal JSON with only essential fields.
   */
  minimal: () =>
    new JSONFormatter({
      includeFields: ['timestamp', 'level', 'message', 'error'],
      includeSchema: false,
    }),

  /**
   * Extended JSON with all fields.
   */
  extended: () =>
    new JSONFormatter({
      pretty: true,
      includeSchema: true,
    }),
};

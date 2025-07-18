// File: src/transports/formatters/index.ts

/**
 * MagicLogger Formatter System
 * 
 * This module exports all formatter-related functionality for MagicLogger.
 * Formatters are responsible for converting log entries into various output
 * formats suitable for different transports and use cases.
 * 
 * @module formatters
 */

// Import types
import type { LogEntry } from '../../types/transport';

// Import formatter classes for factory functions
import { JSONFormatter, JSONFormatters } from './JSONFormatter';
import { PlainTextFormatter, PlainTextFormatters } from './PlainTextFormatter';
import { XMLFormatter, CSVFormatter, ICustomFormatter } from './CustomFormatter';

// Export formatter implementations
export { JSONFormatter, JSONFormatters } from './JSONFormatter';
export { PlainTextFormatter, PlainTextFormatters } from './PlainTextFormatter';
export { CustomFormatter, XMLFormatter, CSVFormatter } from './CustomFormatter';

// Export formatter types
export type {
  JSONFormatterOptions,
} from './JSONFormatter';

export type {
  PlainTextFormatterOptions,
} from './PlainTextFormatter';

export type {
  ICustomFormatter,
} from './CustomFormatter';

// Re-export LogEntry type for formatter implementations
export type { LogEntry } from '../../types/transport';

/**
 * Create a formatter based on format type.
 * 
 * @param {string} format - Format type
 * @param {any} [options] - Formatter options
 * @returns {ICustomFormatter} Formatter instance
 * 
 * @example
 * ```typescript
 * const formatter = createFormatter('json', { pretty: true });
 * const output = formatter.format(logEntry);
 * ```
 */
export function createFormatter(
  format: 'json' | 'plain' | 'xml' | 'csv',
  options?: Record<string, unknown>
): ICustomFormatter {
  switch (format) {
    case 'json':
      return new JSONFormatter(options);
    
    case 'plain':
      return new PlainTextFormatter(options);
    
    case 'xml':
      return new XMLFormatter();
    
    case 'csv':
      return new CSVFormatter(typeof options?.includeHeaders === 'boolean' ? options.includeHeaders : undefined);
    
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

/**
 * Built-in formatter functions for use with transports.
 * 
 * These functions can be passed directly to transport formatter options.
 * 
 * @example
 * ```typescript
 * const transport = new FileTransport({
 *   name: 'json-file',
 *   filepath: './logs/app.json',
 *   formatter: Formatters.json.pretty
 * });
 * ```
 */
export const Formatters = {
  /**
   * JSON formatters
   */
  json: {
    /**
     * Compact single-line JSON
     */
    compact: (entry: LogEntry) => JSONFormatters.compact().format(entry),
    
    /**
     * Pretty-printed JSON
     */
    pretty: (entry: LogEntry) => JSONFormatters.pretty().format(entry),
    
    /**
     * Flattened JSON
     */
    flat: (entry: LogEntry) => JSONFormatters.flat().format(entry),
    
    /**
     * Minimal JSON with essential fields
     */
    minimal: (entry: LogEntry) => JSONFormatters.minimal().format(entry),
  },

  /**
   * Plain text formatters
   */
  plain: {
    /**
     * Simple single-line format
     */
    simple: (entry: LogEntry) => PlainTextFormatters.simple().format(entry),
    
    /**
     * Detailed multi-line format
     */
    detailed: (entry: LogEntry) => PlainTextFormatters.detailed().format(entry),
    
    /**
     * Syslog-style format
     */
    syslog: (entry: LogEntry) => PlainTextFormatters.syslog().format(entry),
    
    /**
     * Apache-style access log format
     */
    apache: (entry: LogEntry) => PlainTextFormatters.apache().format(entry),
  },

  /**
   * XML formatter
   */
  xml: (entry: LogEntry) => new XMLFormatter().format(entry),

  /**
   * CSV formatter
   */
  csv: (entry: LogEntry) => new CSVFormatter(false).format(entry),
};

/**
 * Utility function to create a chained formatter.
 * 
 * Chains multiple formatters together, passing the output
 * of one formatter as input to the next.
 * 
 * @param {...Function} formatters - Formatter functions
 * @returns {Function} Chained formatter function
 * 
 * @example
 * ```typescript
 * const formatter = chainFormatters(
 *   (entry) => addTimestamp(entry),
 *   (entry) => maskSensitiveData(entry),
 *   Formatters.json.pretty
 * );
 * ```
 */
export function chainFormatters(
  ...formatters: Array<(input: any) => any>
): (entry: LogEntry) => string | Buffer {
  return (entry: LogEntry) => {
    let result: any = entry;
    
    for (const formatter of formatters) {
      result = formatter(result);
    }
    
    return result;
  };
}

/**
 * Utility function to create a conditional formatter.
 * 
 * Applies different formatters based on a condition.
 * 
 * @param {Function} condition - Condition function
 * @param {Function} trueFormatter - Formatter for true condition
 * @param {Function} falseFormatter - Formatter for false condition
 * @returns {Function} Conditional formatter function
 * 
 * @example
 * ```typescript
 * const formatter = conditionalFormatter(
 *   (entry) => entry.level === 'error',
 *   Formatters.plain.detailed,
 *   Formatters.plain.simple
 * );
 * ```
 */
export function conditionalFormatter(
  condition: (entry: LogEntry) => boolean,
  trueFormatter: (entry: LogEntry) => string | Buffer,
  falseFormatter: (entry: LogEntry) => string | Buffer
): (entry: LogEntry) => string | Buffer {
  return (entry: LogEntry) => {
    if (condition(entry)) {
      return trueFormatter(entry);
    } else {
      return falseFormatter(entry);
    }
  };
}

/**
 * Utility function to transform log entries before formatting.
 * 
 * @param {Function} transformer - Transformation function
 * @param {Function} formatter - Formatter function
 * @returns {Function} Transformed formatter function
 * 
 * @example
 * ```typescript
 * const formatter = transformFormatter(
 *   (entry) => ({
 *     ...entry,
 *     message: entry.message.toUpperCase()
 *   }),
 *   Formatters.json.compact
 * );
 * ```
 */
export function transformFormatter(
  transformer: (entry: LogEntry) => LogEntry,
  formatter: (entry: LogEntry) => string | Buffer
): (entry: LogEntry) => string | Buffer {
  return (entry: LogEntry) => {
    const transformed = transformer(entry);
    return formatter(transformed);
  };
}
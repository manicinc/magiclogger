/**
 * @fileoverview Null transport for benchmarking and testing.
 * 
 * This transport discards all log entries without performing any I/O,
 * useful for measuring logging overhead without serialization.
 * 
 * @module transports/null
 * @author MagicLogger Contributors
 * @copyright 2024 MagicLogger
 * @license MIT
 */

import type { Transport, LogEntry } from '../../types/transport';

/**
 * Null transport that discards all logs without any I/O operations.
 * 
 * This transport is primarily used for:
 * - Performance benchmarking to measure logging overhead
 * - Testing logger behavior without side effects
 * - Disabling logging in specific environments
 * 
 * @class NullTransport
 * @implements {Transport}
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Use for benchmarking pure logging overhead
 * const logger = new Logger({
 *   transports: [new NullTransport()]
 * });
 * 
 * // All logs are discarded with minimal overhead
 * logger.info('This will be discarded');
 * ```
 */
export class NullTransport implements Transport {
  /**
   * Transport name identifier.
   * @readonly
   */
  name = 'null' as const;
  
  /**
   * Whether the transport is enabled.
   * @type {boolean}
   */
  enabled = true;
  
  /**
   * Initializes the transport (no-op for null transport).
   * 
   * @returns {Promise<void>} Resolves immediately
   */
  async init(): Promise<void> {
    // No initialization needed
  }
  
  /**
   * Closes the transport (no-op for null transport).
   * 
   * @returns {Promise<void>} Resolves immediately
   */
  async close(): Promise<void> {
    // No cleanup needed
  }
  
  /**
   * Determines if a log entry should be processed.
   * 
   * @param {LogEntry} _entry - Log entry to check (unused)
   * @returns {boolean} Whether transport is enabled
   */
  shouldLog(_entry?: LogEntry): boolean {
    return this.enabled;
  }
  
  /**
   * Discards a log entry without any processing.
   * 
   * @param {LogEntry} _entry - Log entry to discard
   * @returns {Promise<void>} Resolves immediately
   */
  log(_entry: LogEntry): Promise<void> {
    // Return pre-resolved promise for maximum performance
    // Using Promise.resolve() is faster than async function
    return Promise.resolve();
  }
  
  /**
   * Flushes any buffered logs (no-op for null transport).
   * 
   * @returns {Promise<void>} Resolves immediately
   */
  async flush(): Promise<void> {
    // No buffering, nothing to flush
  }
}
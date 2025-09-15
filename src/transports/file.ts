/**
 * @fileoverview File Transport Module
 *
 * High-performance file transport using sonic-boom for non-blocking I/O.
 * FileTransport is an alias for AsyncFileTransport, providing the best
 * performance for production applications.
 *
 * @module transports/file
 *
 * @example
 * ```typescript
 * import { FileTransport } from 'magiclogger/transports/file';
 *
 * const fileTransport = new FileTransport({
 *   filepath: './logs/app.log',
 *   minLength: 4096,           // Buffer before auto-flush
 *   maxWrite: 16384            // Max bytes per write
 * });
 *
 * // Non-blocking high-performance logging
 * fileTransport.log(entry);
 * ```
 */

// FileTransport is an alias for AsyncFileTransport (the best default)
export { AsyncFileTransport as FileTransport } from './AsyncFileTransport';
export type { AsyncFileTransportOptions as FileTransportOptions } from './AsyncFileTransport';

// Also export the worker-based transport for explicit use
export { WorkerFileTransport } from './WorkerFileTransport';
export type { WorkerFileTransportOptions } from './WorkerFileTransport';

// Export ultra-fast transport for benchmarks
export { UltraFastFileTransport } from './UltraFastFileTransport';
export type { UltraFastFileTransportOptions } from './UltraFastFileTransport';

// Import for internal use
import { AsyncFileTransport as FileTransport } from './AsyncFileTransport';

/**
 * Creates a high-performance file transport using sonic-boom.
 *
 * Uses non-blocking I/O with intelligent batching for optimal performance.
 * This is the recommended file transport for production applications.
 *
 * @param {string} filepath - Path to the log file
 * @param {Record<string, unknown>} [options] - Transport options
 * @returns {FileTransport} High-performance file transport
 *
 * @example
 * ```typescript
 * const transport = createFileTransport('./logs/app.log', {
 *   minLength: 4096,  // Buffer before auto-flush
 *   maxWrite: 16384,  // Max bytes per write
 *   format: 'json'    // NDJSON format
 * });
 * ```
 */
export function createFileTransport(filepath: string, options?: Record<string, unknown>) {
  const sanitizedName = filepath.replace(/[^\w-]/g, '-');
  return new FileTransport({
    name: `file-${sanitizedName}`,
    filepath,
    ...options,
  });
}

/**
 * Alias for createFileTransport.
 * @see {@link createFileTransport}
 */
export const createFile = createFileTransport;

// Register with TransportRegistry for factory support
import { TransportRegistry } from './index';

TransportRegistry.register('file', config => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, format, ...fileOptions } = config;
  if (!fileOptions.filepath) {
    throw new Error('FileTransport requires filepath option');
  }
  // Only pass format if it's 'json' or 'plain'
  const validFormat = format === 'json' || format === 'plain' ? format : undefined;
  return new FileTransport({
    name: config.name || 'file',
    filepath: fileOptions.filepath as string,
    ...(validFormat && { format: validFormat }),
    ...fileOptions,
  });
});

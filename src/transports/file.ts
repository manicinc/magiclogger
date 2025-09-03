/**
 * @fileoverview File Transport Module
 *
 * Production-ready file transport using worker threads for all I/O operations.
 * This ensures zero blocking of the main thread event loop.
 *
 * @module transports/file
 * 
 * @example
 * ```typescript
 * import { FileTransport } from 'magiclogger/transports/file';
 * 
 * const fileTransport = new FileTransport({
 *   filepath: './logs/app.log',
 *   maxFileSize: 100_000_000,  // 100MB rotation
 *   compress: true,             // Gzip rotated files
 *   bufferSize: 10000,          // Buffer in worker
 *   flushInterval: 100          // Flush every 100ms
 * });
 * 
 * // Main thread just passes entries - no blocking
 * fileTransport.log(entry);
 * ```
 */

// Export the file transport
export { FileTransport } from './FileTransport';
export type { FileTransportOptions } from './FileTransport';

// Import for internal use
import { FileTransport } from './FileTransport';

/**
 * Creates a file transport using worker threads.
 * 
 * All file I/O operations happen in a dedicated worker thread,
 * ensuring the main thread remains responsive.
 * 
 * @param {string} filepath - Path to the log file
 * @param {Record<string, unknown>} [options] - Transport options
 * @returns {FileTransport} Worker-based file transport
 * 
 * @example
 * ```typescript
 * const transport = createFileTransport('./logs/app.log', {
 *   maxFileSize: 50_000_000,  // 50MB
 *   compress: true,
 *   format: 'json'
 * });
 * ```
 */
export function createFileTransport(filepath: string, options?: Record<string, unknown>) {
  const sanitizedName = filepath.replace(/[^\w-]/g, '-');
  return new FileTransport({ 
    name: `file-${sanitizedName}`, 
    filepath, 
    ...options 
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
  const { type, ...fileOptions } = config;
  if (!fileOptions.filepath) {
    throw new Error('FileTransport requires filepath option');
  }
  return new FileTransport({
    name: config.name || 'file',
    filepath: fileOptions.filepath as string,
    ...fileOptions,
  });
});
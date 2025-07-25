/**
 * File Transport Entry Point
 * 
 * This module provides file transport functionality for MagicLogger.
 * Import this module directly for optimal tree-shaking.
 * 
 * @module transports/file
 */

// Re-export file transport functionality
export { FileTransport } from './base/implementations/FileTransport';
export type { FileTransportOptions } from './base/implementations/FileTransport';

// Import for internal use
import { FileTransport } from './base/implementations/FileTransport';

// Factory function for convenience
export function createFileTransport(filepath: string, options?: Record<string, unknown>) {
  const sanitizedName = filepath.replace(/[^\w-]/g, '-');
  return new FileTransport({ name: `file-${sanitizedName}`, filepath, ...options });
}

// Register with TransportRegistry for factory support
import { TransportRegistry } from './index';

TransportRegistry.register('file', (config) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...fileOptions } = config;
  if (!fileOptions.filepath) {
    throw new Error('FileTransport requires filepath option');
  }
  return new FileTransport({ 
    name: config.name || 'file', 
    filepath: fileOptions.filepath as string,
    ...fileOptions 
  });
});

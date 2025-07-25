/**
 * Transport Module Entry Point
 *
 * This is the main entry point for all transport functionality.
 * For optimal tree-shaking, prefer importing from specific transport modules.
 */

// Re-export all transport classes
export { ConsoleTransport } from './transports/console';
export { FileTransport } from './transports/file';
export { StreamTransport } from './transports/stream';
export { HTTPTransport } from './transports/http';
export { S3Transport } from './transports/s3';
export { MongoDBTransport } from './transports/mongodb';
export { WebSocketTransport } from './transports/websocket';

// Base transport functionality
export { Transport, TransportManager } from './transports/base';

// Import transport classes for factory functions
import { ConsoleTransport } from './transports/console';
import { FileTransport } from './transports/file';
import { StreamTransport } from './transports/stream';
import { HTTPTransport } from './transports/http';

// Factory functions
export function createConsole(options?: Record<string, unknown>) {
  return new ConsoleTransport({ name: 'console', ...options });
}

export function createFile(filepath: string, options?: Record<string, unknown>) {
  const sanitizedName = filepath.replace(/[^\w-]/g, '-');
  return new FileTransport({ name: `file-${sanitizedName}`, filepath, ...options });
}

export function createStream(stream: NodeJS.WritableStream, options?: Record<string, unknown>) {
  return new StreamTransport({ name: 'stream', stream, ...options });
}

export function createHTTP(url: string, options?: Record<string, unknown>) {
  const hostname = new URL(url).hostname.replace(/\./g, '-');
  return new HTTPTransport({ name: `http-${hostname}`, url, ...options });
}

// Legacy exports for compatibility
export const TransportRegistry = {};
export class NetworkTransport {}
export class BatchingTransport {}

// Types
export type { TransportOptions, TransportEvents } from './types/transport';

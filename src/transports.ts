// File: src/transports.ts

/**
 * Tree-Shakeable Transport Exports
 * 
 * Import transports individually for optimal bundle size:
 * 
 * @example
 * ```typescript
 * // Core transports (no external dependencies)
 * import { ConsoleTransport, FileTransport, StreamTransport, HTTPTransport } from 'magiclogger/transports';
 * 
 * // Optional transports (external dependencies)
 * import { S3Transport, MongoDBTransport, WebSocketTransport } from 'magiclogger/transports';
 * 
 * // Convenience factories
 * import { createConsole, createFile } from 'magiclogger/transports';
 * ```
 */

// ==============================================
// CORE TRANSPORTS (Always available)
// ==============================================

// Console Transport - Terminal output with colors
export { ConsoleTransport } from './transports/base/implementations/ConsoleTransport';

// File Transport - Log to files with rotation
export { FileTransport } from './transports/base/implementations/FileTransport';

// Stream Transport - Log to any Node.js stream
export { StreamTransport } from './transports/base/implementations/StreamTransport';

// HTTP Transport - REST API endpoints (built-in http/https)
export { HTTPTransport } from './transports/base/implementations/HttpTransport';

// Base classes
export { Transport } from './transports/base/Transport';
export { NetworkTransport } from './transports/base/NetworkTransport';

// Transport registry for dynamic transport creation
export { TransportRegistry } from './transports/index';

// ==============================================
// OPTIONAL TRANSPORTS (External dependencies)
// ==============================================

// S3 Transport - AWS S3 storage (requires aws-sdk)
export { S3Transport } from './transports/base/implementations/S3Transport';

// MongoDB Transport - MongoDB storage (requires mongodb)
export { MongoDBTransport } from './transports/base/implementations/MongoDBTransport';

// WebSocket Transport - Real-time streaming (requires ws)
export { WebSocketTransport } from './transports/base/implementations/WebSocketTransport';

// ==============================================
// CONVENIENCE FACTORIES
// ==============================================

/**
 * Create a console transport with sensible defaults
 */
export async function createConsole(options: Partial<import('./types/transport').ConsoleTransportOptions> = {}) {
  const { ConsoleTransport } = await import('./transports/base/implementations/ConsoleTransport');
  return new ConsoleTransport({
    name: 'console',
    ...options,
  });
}

/**
 * Create a file transport with sensible defaults
 */
export async function createFile(filepath: string, options: Partial<import('./types/transport').FileTransportOptions> = {}) {
  const { FileTransport } = await import('./transports/base/implementations/FileTransport');
  return new FileTransport({
    name: `file-${filepath.replace(/[^a-zA-Z0-9]/g, '-')}`,
    filepath,
    ...options,
  });
}

/**
 * Create an HTTP transport with sensible defaults
 */
export async function createHTTP(url: string, options: Partial<import('./types/transport').HTTPTransportOptions> = {}) {
  const { HTTPTransport } = await import('./transports/base/implementations/HttpTransport');
  return new HTTPTransport({
    name: `http-${new URL(url).hostname}`,
    url,
    ...options,
  });
}

/**
 * Create a stream transport with sensible defaults
 */
export async function createStream(stream: NodeJS.WritableStream, options: Partial<import('./types/transport').StreamTransportOptions> = {}) {
  const { StreamTransport } = await import('./transports/base/implementations/StreamTransport');
  return new StreamTransport({
    name: 'stream',
    stream,
    ...options,
  });
}

// ==============================================
// TYPE EXPORTS
// ==============================================

// Re-export transport types for convenience
export type {
  LogEntry,
  Transport as ITransport,
  TransportOptions,
  TransportConfig,
  TransportType,
  TransportStats,
  ConsoleTransportOptions,
  FileTransportOptions,
  HTTPTransportOptions,
  StreamTransportOptions,
  S3TransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
} from './types/transport';

// ==============================================
// BUNDLING INFORMATION
// ==============================================

/**
 * Bundle Size Analysis:
 * 
 * Core Transports (zero external dependencies):
 * - ConsoleTransport: ~2KB (colors, formatting)
 * - FileTransport: ~3KB (fs operations, rotation)
 * - StreamTransport: ~1KB (stream writing)
 * - HTTPTransport: ~4KB (built-in http/https)
 * 
 * Optional Transports (with external dependencies):
 * - S3Transport: ~15KB + aws-sdk (~500KB)
 * - MongoDBTransport: ~8KB + mongodb (~2MB)
 * - WebSocketTransport: ~6KB + ws (~50KB)
 * 
 * Tree-shaking ensures you only bundle what you import.
 */

// File: src/transports/index.ts

/**
 * MagicLogger Transport System
 * 
 * This module exports all transport-related functionality for MagicLogger.
 * Transports are responsible for delivering log entries to various destinations
 * such as files, databases, network endpoints, or streams.
 * 
 * @module transports
 */

// Base classes
export { Transport } from './base/Transport';
export { BatchingTransport } from './base/BatchingTransport';
export { NetworkTransport } from './base/NetworkTransport';
export { TransportManager } from './base/TransportManager';

// Transport implementations
export { ConsoleTransport } from './base/implementations/ConsoleTransport';
export { FileTransport } from './base/implementations/FileTransport';
export { S3Transport } from './base/implementations/S3Transport';
export { HTTPTransport } from './base/implementations/HttpTransport';
export { MongoDBTransport } from './base/implementations/MongoDBTransport';
export { WebSocketTransport } from './base/implementations/WebSocketTransport';
export { StreamTransport } from './base/implementations/StreamTransport';

// Import classes and types for factory functions
import { Transport } from './base/Transport';
import { BatchingTransport } from './base/BatchingTransport';
import { NetworkTransport } from './base/NetworkTransport';
import { TransportManager } from './base/TransportManager';
import { ConsoleTransport } from './base/implementations/ConsoleTransport';
import { FileTransport } from './base/implementations/FileTransport';
import { S3Transport } from './base/implementations/S3Transport';
import { HTTPTransport } from './base/implementations/HttpTransport';
import { MongoDBTransport } from './base/implementations/MongoDBTransport';
import { WebSocketTransport } from './base/implementations/WebSocketTransport';
import { StreamTransport } from './base/implementations/StreamTransport';

import type {
  ConsoleTransportOptions,
  FileTransportOptions,
  S3TransportOptions,
  HTTPTransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,
  TransportManagerOptions,
} from '../types/transport';

// Re-export transport types
export type {
  // Core interfaces
  Transport as ITransport,
  TransportOptions,
  TransportEvents,
  TransportStats,
  LogEntry,
  AggregationStats,
  
  // Batching
  BatchingOptions,
  
  // Network
  NetworkTransportOptions,
  RetryOptions,
  
  // Implementation-specific
  ConsoleTransportOptions,
  FileTransportOptions,
  S3TransportOptions,
  HTTPTransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,
  
} from '../types/transport';

/**
 * Convenience function to create a pre-configured transport manager
 * with commonly used transports.
 * 
 * @param {Partial<TransportManagerOptions>} options - Manager options
 * @returns {TransportManager} Configured transport manager
 * 
 * @example
 * ```typescript
 * const manager = createDefaultTransportManager({
 *   enableAggregation: true
 * });
 * 
 * // Add console transport
 * await manager.add(createConsoleTransport());
 * 
 * // Add file transport
 * await manager.add(createFileTransport({
 *   filepath: './logs',
 *   rotation: 'daily'
 * }));
 * ```
 */
export function createDefaultTransportManager(
  options: Partial<TransportManagerOptions> = {}
): TransportManager {
  return new TransportManager();
}

/**
 * Utility function to create multiple transports from configuration.
 * 
 * @param {TransportConfig[]} configs - Array of transport configurations
 * @returns {Promise<Transport[]>} Array of initialized transports
 * 
 * @example
 * ```typescript
 * const transports = await createTransportsFromConfig([
 *   { type: 'console', options: { level: 'debug' } },
 *   { type: 'file', options: { filepath: './app.log' } },
 *   { type: 's3', options: { bucket: 'my-logs' } }
 * ]);
 * ```
 */
export async function createTransportsFromConfig(
  configs: Array<{
    type: 'console' | 'file' | 's3' | 'http' | 'mongodb' | 'websocket' | 'stream';
    options: Record<string, unknown>;
  }>
): Promise<Transport[]> {
  const transports: Transport[] = [];

  for (const config of configs) {
    let transport: Transport;

    switch (config.type) {
      case 'console':
        transport = createConsoleTransport(config.options);
        break;

      case 'file':
        transport = createFileTransport(config.options);
        break;

      case 's3':
        transport = createS3Transport(config.options);
        break;

      case 'http':
        transport = createHTTPTransport(config.options);
        break;

      case 'mongodb':
        transport = createMongoDBTransport(config.options);
        break;

      case 'websocket':
        transport = createWebSocketTransport(config.options);
        break;

      case 'stream':
        if (!config.options.stream) {
          throw new Error('Stream transport requires stream option');
        }
        transport = createStreamTransport(config.options.stream as NodeJS.WritableStream, config.options);
        break;

      default:
        throw new Error(`Unknown transport type: ${config.type}`);
    }

    // Initialize transport
    if (transport.init) {
      await transport.init();
    }

    transports.push(transport);
  }

  return transports;
}

/**
 * Type guard to check if a transport supports batching.
 * 
 * @param {Transport} transport - Transport to check
 * @returns {boolean} True if transport supports batching
 */
export function isBatchingTransport(transport: Transport): transport is BatchingTransport {
  return 'flush' in transport && 
         typeof (transport as BatchingTransport).flush === 'function' &&
         transport.supportsBatching();
}

/**
 * Type guard to check if a transport is network-based.
 * 
 * @param {Transport} transport - Transport to check
 * @returns {boolean} True if transport is network-based
 */
export function isNetworkTransport(transport: Transport): transport is NetworkTransport {
  return transport instanceof NetworkTransport;
}

// Factory functions for creating transport instances

/**
 * Create a console transport instance.
 */
export function createConsoleTransport(options: Partial<ConsoleTransportOptions> = {}): ConsoleTransport {
  return new ConsoleTransport({
    name: 'console',
    ...options,
  });
}

/**
 * Create a file transport instance.
 */
export function createFileTransport(options: Partial<FileTransportOptions> = {}): FileTransport {
  return new FileTransport({
    name: 'file',
    filepath: './logs',
    ...options,
  });
}

/**
 * Create an S3 transport instance.
 */
export function createS3Transport(options: Partial<S3TransportOptions> = {}): S3Transport {
  return new S3Transport({
    name: 's3',
    bucket: options.bucket || 'default-logs',
    ...options,
  });
}

/**
 * Create an HTTP transport instance.
 */
export function createHTTPTransport(options: Partial<HTTPTransportOptions> = {}): HTTPTransport {
  return new HTTPTransport({
    name: 'http',
    url: options.url || 'http://localhost:3000/logs',
    ...options,
  });
}

/**
 * Create a MongoDB transport instance.
 */
export function createMongoDBTransport(options: Partial<MongoDBTransportOptions> = {}): MongoDBTransport {
  return new MongoDBTransport({
    name: 'mongodb',
    uri: options.uri || 'mongodb://localhost:27017/logs',
    ...options,
  });
}

/**
 * Create a WebSocket transport instance.
 */
export function createWebSocketTransport(options: Partial<WebSocketTransportOptions> = {}): WebSocketTransport {
  return new WebSocketTransport({
    name: 'websocket',
    url: options.url || 'ws://localhost:8080/logs',
    ...options,
  });
}

/**
 * Create a stream transport instance.
 */
export function createStreamTransport(stream: NodeJS.WritableStream, options: Partial<StreamTransportOptions> = {}): StreamTransport {
  return new StreamTransport({
    name: 'stream',
    stream,
    ...options,
  });
}
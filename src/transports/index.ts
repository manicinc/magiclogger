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
  S3TransportOptions,
  HTTPTransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,
  
  // Manager
  TransportManagerOptions,
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
 * await manager.add(new ConsoleTransport({ name: 'console' }));
 * 
 * // Add file transport
 * await manager.add(new FileTransport({
 *   name: 'file',
 *   filepath: './logs',
 *   rotation: 'daily'
 * }));
 * ```
 */
export function createDefaultTransportManager(
  _options: Partial<import('../types/transport').TransportManagerOptions> = {}
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        transport = new ConsoleTransport(config.options as unknown as import('../types/transport').TransportOptions);
        break;

      case 'file':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transport = new FileTransport(config.options as any);
        break;

      case 's3':
        transport = new S3Transport(config.options as unknown as import('../types/transport').S3TransportOptions);
        break;

      case 'http':
        transport = new HTTPTransport(config.options as unknown as import('../types/transport').HTTPTransportOptions);
        break;

      case 'mongodb':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transport = new MongoDBTransport(config.options as any) as any;
        break;

      case 'websocket':
        transport = new WebSocketTransport(config.options as unknown as import('../types/transport').WebSocketTransportOptions);
        break;

      case 'stream':
        if (!config.options.stream) {
          throw new Error('Stream transport requires stream option');
        }
        transport = new StreamTransport(config.options as unknown as import('../types/transport').StreamTransportOptions);
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
  return 'maxBatchSize' in transport && typeof (transport as unknown as BatchingTransport).flush === 'function';
}

/**
 * Type guard to check if a transport is network-based.
 * 
 * @param {Transport} transport - Transport to check
 * @returns {boolean} True if transport is network-based
 */
export function isNetworkTransport(transport: Transport): transport is NetworkTransport {
  return 'retryOptions' in transport && 'performNetworkRequest' in transport;
}
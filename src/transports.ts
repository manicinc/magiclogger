/**
 * Transport Module Entry Point
 *
 * This is the main entry point for all transport functionality.
 * For optimal tree-shaking, prefer importing from specific transport modules.
 */

// Re-export all transport classes
export { ConsoleTransport } from './transports/console';
export { FileTransport, WorkerFileTransport } from './transports/file';
export { AsyncFileTransport } from './transports/AsyncFileTransport';
export { SyncFileTransport } from './transports/SyncFileTransport';
export { StreamTransport } from './transports/stream';
export { HTTPTransport } from './transports/http';
export { NullTransport } from './transports/null';
export { S3Transport } from './transports/s3';
export { MongoDBTransport } from './transports/mongodb';
export { WebSocketTransport } from './transports/websocket';
// OpenTelemetry (OTLP) transport and helpers
export {
  OTLPTransport,
  createOTLPTransport,
  createJaegerTransport,
  createGrafanaCloudTransport,
  createNewRelicTransport,
  createHoneycombTransport,
  createXRayTransport,
  createGoogleCloudTransport,
  createDatadogTransport,
  createElasticAPMTransport,
} from './transports/otlp';

// Base transport functionality
export { Transport, TransportManager } from './transports/base';

// Additional transport classes for specialized use cases
import { Transport } from './transports/base';
import type { TransportOptions, LogEntry } from './types/transport';

export class NetworkTransport extends Transport {
  constructor(options: TransportOptions) {
    super(options);
  }

  protected async doInit(): Promise<void> {
    // Network transport initialization
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    // Network transport logging implementation
    console.log('NetworkTransport:', entry);
  }

  protected async doClose(): Promise<void> {
    // Network transport cleanup
  }
}

export class BatchingTransport extends Transport {
  constructor(options: TransportOptions) {
    super(options);
  }

  protected async doInit(): Promise<void> {
    // Batching transport initialization
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    // Batching transport logging implementation
    console.log('BatchingTransport:', entry);
  }

  protected async doClose(): Promise<void> {
    // Batching transport cleanup
  }
}

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
  const sanitizedName = filepath.replace(/[^a-zA-Z0-9-]/g, '-');
  return new FileTransport({ name: `file-${sanitizedName}`, filepath, ...options });
}

export function createStream(stream: NodeJS.WritableStream, options?: Record<string, unknown>) {
  return new StreamTransport({ name: 'stream', stream, ...options });
}

export function createHTTP(url: string, options?: Record<string, unknown>) {
  try {
    const hostname = new URL(url).hostname;
    // HTTPTransport expects 'endpoint' not 'url'
    return new HTTPTransport({ name: `http-${hostname}`, endpoint: url, ...options });
  } catch (error) {
    throw new Error(`Invalid URL provided: ${url}`);
  }
}

// Export TransportRegistry from the main transports module
export { TransportRegistry } from './transports/index';

// Types  
export type {
  TransportOptions,
  TransportEvents,
  LogEntry,
  ConsoleTransportOptions,
  HTTPTransportOptions,
  StreamTransportOptions,
} from './types/transport';
export type { AsyncFileTransportOptions as FileTransportOptions } from './transports/AsyncFileTransport';
export type { WorkerFileTransportOptions } from './transports/WorkerFileTransport';
export type { OTLPTransportOptions } from './transports/otlp';

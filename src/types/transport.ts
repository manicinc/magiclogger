// File: src/types/transport.ts

import type { LogLevel } from './logger';
import type { ColorName } from './colors';

// Re-export types that transports need
export type { LogLevel, ColorName };

/**
 * Log entry structure used by all transports.
 */
export interface LogEntry {
  /** Unique identifier for this log entry */
  id: string;
  /** ISO timestamp string */
  timestamp: string;
  /** Timestamp in milliseconds */
  timestampMs: number;
  /** Log level */
  level: LogLevel;
  /** Formatted message with colors/styles */
  message: string;
  /** Plain message without formatting */
  plainMessage?: string;
  /** Logger instance ID */
  loggerId?: string;
  /** Associated tags */
  tags?: string[];
  /** Contextual data */
  context?: Record<string, unknown>;
  /** Error information */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Base transport interface.
 */
export interface Transport {
  /** Transport name */
  readonly name: string;
  /** Whether transport is enabled */
  enabled: boolean;
  
  /** Initialize the transport */
  init(): Promise<void>;
  /** Log a single entry */
  log(entry: LogEntry): Promise<void>;
  /** Log multiple entries */
  logBatch?(entries: LogEntry[]): Promise<void>;
  /** Check if entry should be logged */
  shouldLog(entry: LogEntry): boolean;
  /** Flush any buffered logs */
  flush?(): Promise<void>;
  /** Close the transport */
  close(): Promise<void>;
  /** Get transport statistics */
  getStats(): TransportStats;
  /** Check if transport is healthy */
  isHealthy(): Promise<boolean>;
  /** Check if batching is supported */
  supportsBatching(): boolean;
  /** Enable the transport */
  enable(): void;
  /** Disable the transport */
  disable(): void;
  /** Reset statistics */
  resetStats(): void;
  /** Check if enabled */
  isEnabled(): boolean;
}

/**
 * Transport configuration options.
 */
export interface TransportOptions {
  /** Transport name */
  name: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Minimum log level */
  level?: LogLevel;
  /** Specific levels to handle */
  levels?: LogLevel[];
  /** Required tags */
  tags?: string[];
  /** Excluded tags */
  excludeTags?: string[];
  /** Custom filter function */
  filter?: (entry: LogEntry) => boolean;
  /** Suppress errors */
  silent?: boolean;
  /** Operation timeout */
  timeout?: number;
  /** Output format */
  format?: 'json' | 'plain' | 'custom';
  /** Custom formatter - updated signature */
  formatter?: (entry: LogEntry) => string | Buffer;
}

/**
 * Formatter interface for transports.
 */
export interface Formatter {
  format(entry: LogEntry): string | Buffer;
}

/**
 * Transport statistics.
 */
export interface TransportStats {
  /** Total processed */
  processed: number;
  /** Successfully sent */
  succeeded: number;
  /** Failed to send */
  failed: number;
  /** Currently queued */
  queued: number;
  /** Last success time */
  lastSuccess?: Date;
  /** Last error info */
  lastError?: {
    timestamp: Date;
    message: string;
    count: number;
  };
  /** Custom stats */
  custom?: Record<string, unknown>;
}

/**
 * Transport events interface.
 */
export interface TransportEvents {
  ready: () => void;
  error: (error: Error, entry?: LogEntry) => void;
  logged: (entry: LogEntry) => void;
  batch: (entries: LogEntry[], count: number) => void;
  closing: () => void;
  closed: () => void;
  enabled: () => void;
  disabled: () => void;
}

/**
 * Batching options for transports.
 */
export interface BatchingOptions {
  /** Maximum batch size */
  maxBatchSize?: number;
  /** Maximum time to wait before flushing */
  maxBatchTime?: number;
  /** Maximum batch size in bytes */
  maxBatchBytes?: number;
  /** Enable compression */
  compress?: boolean;
}

/**
 * Retry options for network transports.
 */
export interface RetryOptions {
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Initial retry delay in ms */
  retryDelay?: number;
  /** Whether to retry on failure */
  retryOnFailure?: boolean;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Maximum retry delay */
  maxRetryDelay?: number;
  /** Custom retry condition */
  retryCondition?: (error: Error) => boolean;
}

/**
 * Aggregation stats for transport manager.
 */
export interface AggregationStats {
  /** Total entries processed */
  totalProcessed: number;
  /** Total successful */
  totalSucceeded: number;
  /** Total failed */
  totalFailed: number;
  /** By transport stats */
  byTransport: Record<string, TransportStats>;
}

/**
 * Transport manager options.
 */
export interface TransportManagerOptions {
  /** Default timeout for all transports */
  defaultTimeout?: number;
  /** Stop on first successful transport */
  stopOnSuccess?: boolean;
  /** Enable aggregation stats */
  enableAggregation?: boolean;
  /** Health check interval */
  healthCheckInterval?: number;
  /** Maximum pause queue size */
  maxPauseQueueSize?: number;
}

/**
 * Console transport options.
 */
export interface ConsoleTransportOptions extends TransportOptions {
  /** Use colors in output */
  useColors?: boolean;
  /** Show timestamps */
  showTimestamp?: boolean;
  /** Show log level */
  showLevel?: boolean;
  /** Show logger ID */
  showLoggerId?: boolean;
  /** Show tags */
  showTags?: boolean;
  /** Show metadata */
  showMetadata?: boolean;
  /** Custom prefix */
  prefix?: string;
  /** Console method mapping */
  consoleMethods?: {
    debug?: keyof Console;
    info?: keyof Console;
    warn?: keyof Console;
    error?: keyof Console;
    default?: keyof Console;
    [key: string]: keyof Console | undefined;
  };
}

/**
 * File transport options.
 */
export interface FileTransportOptions extends TransportOptions {
  /** File or directory path */
  filepath: string;
  /** Whether filepath is a directory */
  isDirectory?: boolean;
  /** Max file size before rotation */
  maxFileSize?: number;
  /** Max number of backup files */
  maxFiles?: number;
  /** Compress rotated files */
  compress?: boolean;
  /** Rotation strategy */
  rotation?: 'size' | 'daily' | 'hourly' | 'none';
  /** Append to existing file */
  append?: boolean;
  /** File encoding */
  encoding?: BufferEncoding;
  /** Include timestamp in log lines */
  includeTimestamp?: boolean;
  /** Create directory if missing */
  createDir?: boolean;
  /** Log retention in days */
  retentionDays?: number;
  /** Line ending */
  eol?: string;
  /** Batching options */
  maxBatchSize?: number;
  maxBatchTime?: number;
}

/**
 * Batching transport options.
 */
export interface BatchingTransportOptions extends TransportOptions, BatchingOptions {
  /** Alias for maxBatchSize */
  batchSize?: number;
  /** Alias for maxBatchTime */
  flushInterval?: number;
  /** Max retries */
  maxRetries?: number;
  /** Retry delay */
  retryDelay?: number;
  /** Retry on failure */
  retryOnFailure?: boolean;
  /** Max queue size */
  maxQueueSize?: number;
}

/**
 * Network transport options.
 */
export interface NetworkTransportOptions extends BatchingTransportOptions {
  /** Network endpoint URL */
  url?: string;
  /** Connection timeout */
  connectionTimeout?: number;
  /** Request timeout */
  requestTimeout?: number;
  /** Max reconnect attempts */
  maxReconnectAttempts?: number;
  /** Reconnect delay */
  reconnectDelay?: number;
  /** Max offline queue size */
  maxOfflineQueueSize?: number;
  /** Queue when offline */
  queueWhenOffline?: boolean;
  /** Health check interval */
  healthCheckInterval?: number;
  /** Keep-alive interval */
  keepAliveInterval?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** TLS options */
  tls?: {
    rejectUnauthorized?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
  };
}

/**
 * HTTP transport options.
 */
export interface HTTPTransportOptions extends NetworkTransportOptions {
  /** Target URL */
  url: string;
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Authentication */
  auth?: {
    type: 'basic' | 'bearer' | 'apikey' | 'custom';
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    headers?: Record<string, string>;
    customAuth?: () => Promise<Record<string, string>>;
  };
  /** Body format */
  bodyFormat?: 'json' | 'ndjson' | 'form' | 'custom';
  /** Transform request */
  transformRequest?: (entries: LogEntry[]) => string | Buffer;
}

/**
 * Stream transport options.
 */
export interface StreamTransportOptions extends TransportOptions {
  /** Target stream */
  stream: NodeJS.WritableStream;
  /** Auto close stream */
  autoClose?: boolean;
  /** Stream encoding */
  encoding?: BufferEncoding;
}

/**
 * WebSocket transport options.
 */
export interface WebSocketTransportOptions extends TransportOptions {
  /** WebSocket URL */
  url: string;
  /** Reconnection config */
  reconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
  };
  /** Authentication */
  auth?: {
    token?: string;
    headers?: Record<string, string>;
  };
  /** Subprotocol */
  protocol?: string | string[];
  /** Message encoding */
  encoding?: 'json' | 'msgpack' | 'protobuf';
}

/**
 * MongoDB transport options.
 */
export interface MongoDBTransportOptions extends NetworkTransportOptions {
  /** MongoDB URI */
  uri: string;
  /** Database name */
  database?: string;
  /** Collection name */
  collection?: string;
  /** Client options */
  clientOptions?: Record<string, unknown>;
  /** Create indexes */
  createIndexes?: boolean;
  /** TTL in seconds */
  ttl?: number;
  /** Transform document */
  transformDocument?: (entry: LogEntry) => Record<string, unknown>;
}

/**
 * S3 transport options.
 */
export interface S3TransportOptions extends NetworkTransportOptions {
  /** S3 bucket */
  bucket: string;
  /** Key prefix */
  prefix?: string;
  /** AWS region */
  region?: string;
  /** AWS credentials */
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
  /** Storage class */
  storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'GLACIER' | 'DEEP_ARCHIVE' | 'INTELLIGENT_TIERING';
  /** Encryption */
  encryption?: {
    type: 'AES256' | 'KMS';
    kmsKeyId?: string;
  };
  /** Key strategy */
  keyStrategy?: 'timestamp' | 'date-hierarchy' | 'hourly' | 'custom';
  /** Custom key generator */
  keyGenerator?: (entries: LogEntry[]) => string;
  /** File format */
  fileFormat?: 'json' | 'jsonl' | 'csv' | 'parquet';
  /** Object tags */
  objectTags?: Record<string, string>;
}

/**
 * Connection state for network transports.
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'closing';

/**
 * Transport type enum.
 */
export type TransportType = 
  | 'console' 
  | 'file' 
  | 'http' 
  | 'stream' 
  | 's3' 
  | 'mongodb' 
  | 'websocket'
  | 'custom';

/**
 * Transport configuration for dynamic creation.
 */
export interface TransportConfig extends Record<string, unknown> {
  /** Transport type */
  type: TransportType;
  /** Transport name */
  name?: string;
  /** Enabled state */
  enabled?: boolean;
  /** Log level */
  level?: LogLevel;
}

/**
 * ID generator function.
 */
export type IdGenerator = () => string;

/**
 * Async logging options.
 */
export interface AsyncOptions {
  /** Enable async logging */
  enabled?: boolean;
  /** Buffer configuration */
  buffer?: {
    /** Buffer size */
    size?: number;
    /** Flush interval */
    flushInterval?: number;
    /** Flush size */
    flushSize?: number;
  };
  /** Use worker threads */
  useWorkers?: boolean;
  /** Worker path */
  workerPath?: string;
}
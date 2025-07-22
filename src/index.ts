/**
 * Transport type definitions for MagicLogger.
 * 
 * This module defines all transport-related types including log entry structure,
 * transport interfaces, and configuration options for various transport implementations.
 * 
 * @module types/transport
 */

import type { LogLevel } from './types/logger';

/**
 * Log entry structure used by all transports.
 * 
 * This is the canonical format for all log entries in MagicLogger.
 * Transports receive this structure and format it according to their needs.
 * 
 * @interface LogEntry
 */
export interface LogEntry {
  /** Unique identifier for this log entry */
  id: string;
  
  /** ISO timestamp string */
  timestamp: string;
  
  /** Timestamp in milliseconds since epoch */
  timestampMs: number;
  
  /** Log level (debug, info, warn, error, success, or custom) */
  level: LogLevel;
  
  /** Formatted message with colors/styles (for console output) */
  message: string;
  
  /** Plain message without formatting */
  plainMessage?: string;
  
  /** Logger instance ID */
  loggerId?: string;
  
  /** Associated tags for filtering and categorization */
  tags?: string[];
  
  /** Contextual data (merged from global and local context) */
  context?: Record<string, unknown>;
  
  /** Error information if an error was logged */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    [key: string]: unknown; // Allow additional error properties
  };
  
  /** Additional metadata (environment info, etc.) */
  metadata?: Record<string, unknown>;
  
  /** Async logging metadata */
  async?: {
    /** Whether this was logged asynchronously */
    isAsync: boolean;
    /** Queue priority (lower is higher priority) */
    priority?: number;
    /** Time spent in queue (ms) */
    queueTime?: number;
  };
}

/**
 * Base transport interface that all transports must implement.
 * 
 * @interface Transport
 */
export interface Transport {
  /** Transport name - must be unique within a logger instance */
  readonly name: string;
  
  /** Whether transport is currently enabled */
  enabled: boolean;
  
  /** Initialize the transport (open files, establish connections, etc.) */
  init(): Promise<void>;
  
  /** Log a single entry */
  log(entry: LogEntry): Promise<void>;
  
  /** Log multiple entries efficiently (optional - falls back to individual logs) */
  logBatch?(entries: LogEntry[]): Promise<void>;
  
  /** Check if this transport should handle a given log entry */
  shouldLog(entry: LogEntry): boolean;
  
  /** Flush any buffered logs immediately */
  flush?(): Promise<void>;
  
  /** Close the transport and clean up resources */
  close(): Promise<void>;
  
  /** Get current transport statistics */
  getStats(): TransportStats;
  
  /** Check if transport is healthy and operational */
  isHealthy(): Promise<boolean>;
  
  /** Check if transport supports batch operations */
  supportsBatching(): boolean;
  
  /** Enable the transport */
  enable(): void;
  
  /** Disable the transport */
  disable(): void;
  
  /** Reset statistics counters */
  resetStats(): void;
  
  /** Check if transport is enabled */
  isEnabled(): boolean;
  
  /** Event emitter methods (transports extend EventEmitter) */
  on?(event: string, listener: (...args: any[]) => void): this;
  emit?(event: string, ...args: any[]): boolean;
}

/**
 * Transport configuration options common to all transports.
 * 
 * @interface TransportOptions
 */
export interface TransportOptions {
  /** Transport name - must be unique */
  name: string;
  
  /** Whether transport is enabled */
  enabled?: boolean;
  
  /** Minimum log level to process */
  level?: LogLevel;
  
  /** Specific levels to handle (overrides level) */
  levels?: LogLevel[];
  
  /** Required tags - log must have at least one */
  tags?: string[];
  
  /** Excluded tags - log must not have any */
  excludeTags?: string[];
  
  /** Custom filter function for advanced filtering */
  filter?: (entry: LogEntry) => boolean;
  
  /** Suppress transport errors (still emits events) */
  silent?: boolean;
  
  /** Operation timeout in milliseconds */
  timeout?: number;
  
  /** Output format */
  format?: 'json' | 'plain' | 'custom';
  
  /** Custom formatter function */
  formatter?: (entry: LogEntry) => string | Buffer;
  
  /** Context requirements - entry must have these context keys */
  contextRequirements?: string[];
  
  /** Tag requirements mode */
  tagMode?: 'any' | 'all'; // any = at least one tag matches, all = all tags must match
}

/**
 * Formatter interface for custom formatters.
 * 
 * @interface Formatter
 */
export interface Formatter {
  format(entry: LogEntry): string | Buffer;
}

/**
 * Transport statistics for monitoring.
 * 
 * @interface TransportStats
 */
export interface TransportStats {
  /** Total log entries processed */
  processed: number;
  
  /** Successfully sent/written */
  succeeded: number;
  
  /** Failed to send/write */
  failed: number;
  
  /** Currently queued (for batching transports) */
  queued: number;
  
  /** Last successful operation time */
  lastSuccess?: Date;
  
  /** Last error information */
  lastError?: {
    timestamp: Date;
    message: string;
    count: number; // Number of consecutive errors
  };
  
  /** Transport-specific custom stats */
  custom?: Record<string, unknown>;
}

/**
 * Transport events interface for type-safe event handling.
 * 
 * @interface TransportEvents
 */
export interface TransportEvents {
  /** Emitted when transport is ready */
  ready: () => void;
  
  /** Emitted on transport error */
  error: (error: Error, entry?: LogEntry) => void;
  
  /** Emitted after successful log */
  logged: (entry: LogEntry) => void;
  
  /** Emitted after successful batch */
  batch: (entries: LogEntry[], count: number) => void;
  
  /** Emitted when transport is closing */
  closing: () => void;
  
  /** Emitted when transport is closed */
  closed: () => void;
  
  /** Emitted when transport is enabled */
  enabled: () => void;
  
  /** Emitted when transport is disabled */
  disabled: () => void;
}

/**
 * Options for batching transports.
 * 
 * @interface BatchingOptions
 */
export interface BatchingOptions {
  /** Maximum number of entries per batch */
  maxBatchSize?: number;
  
  /** Maximum time to wait before flushing (ms) */
  maxBatchTime?: number;
  
  /** Maximum batch size in bytes */
  maxBatchBytes?: number;
  
  /** Enable compression for batches */
  compress?: boolean;
  
  /** Compression type */
  compressionType?: 'gzip' | 'deflate' | 'brotli';
}

/**
 * Retry options for network transports.
 * 
 * @interface RetryOptions
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
 * 
 * @interface AggregationStats
 */
export interface AggregationStats {
  /** Total entries processed by all transports */
  totalProcessed: number;
  
  /** Total successful across all transports */
  totalSucceeded: number;
  
  /** Total failed across all transports */
  totalFailed: number;
  
  /** Stats by transport */
  byTransport: Record<string, TransportStats>;
}

/**
 * Transport manager options.
 * 
 * @interface TransportManagerOptions
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
  
  /** Global filters to apply to all transports */
  globalFilters?: Array<(entry: LogEntry) => boolean>;
  
  /** Global transformers to apply to all entries */
  globalTransformers?: Array<(entry: LogEntry) => LogEntry>;
}

/**
 * Console transport specific options.
 * 
 * @interface ConsoleTransportOptions
 */
export interface ConsoleTransportOptions extends TransportOptions {
  /** Use colors in output */
  useColors?: boolean;
  
  /** Show timestamps */
  showTimestamp?: boolean;
  
  /** Timestamp format */
  timestampFormat?: 'ISO' | 'locale' | 'unix' | 'relative';
  
  /** Show log level */
  showLevel?: boolean;
  
  /** Show logger ID */
  showLoggerId?: boolean;
  
  /** Show tags */
  showTags?: boolean;
  
  /** Show metadata */
  showMetadata?: boolean;
  
  /** Show context */
  showContext?: boolean;
  
  /** Custom prefix */
  prefix?: string;
  
  /** Console method mapping */
  consoleMethods?: {
    debug?: keyof Console;
    info?: keyof Console;
    warn?: keyof Console;
    error?: keyof Console;
    success?: keyof Console;
    default?: keyof Console;
    [key: string]: keyof Console | undefined;
  };
  
  /** Pretty print JSON data */
  prettyPrint?: boolean;
  
  /** Indentation for pretty print */
  indent?: number;
}

/**
 * File transport specific options.
 * 
 * @interface FileTransportOptions
 */
export interface FileTransportOptions extends TransportOptions {
  /** File or directory path */
  filepath: string;
  
  /** Whether filepath is a directory */
  isDirectory?: boolean;
  
  /** Filename pattern for directory mode */
  filenamePattern?: string; // e.g., 'app-{date}.log'
  
  /** Max file size before rotation (bytes) */
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
  
  /** File permissions (octal) */
  mode?: number;
  
  /** Batching options */
  maxBatchSize?: number;
  maxBatchTime?: number;
  
  /** Async write options */
  asyncWrite?: boolean;
  writeBufferSize?: number;
}

/**
 * Options for batching transport base class.
 * 
 * @interface BatchingTransportOptions
 */
export interface BatchingTransportOptions extends TransportOptions, BatchingOptions {
  /** Maximum queue size before dropping logs */
  maxQueueSize?: number;
  
  /** Queue overflow strategy */
  overflowStrategy?: 'drop-oldest' | 'drop-newest' | 'block';
  
  /** Alias for maxBatchSize */
  batchSize?: number;
  
  /** Alias for maxBatchTime */
  flushInterval?: number;
}

/**
 * Network transport base options.
 * 
 * @interface NetworkTransportOptions
 */
export interface NetworkTransportOptions extends BatchingTransportOptions, RetryOptions {
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
  
  /** Exponential backoff for reconnects */
  reconnectBackoff?: boolean;
  
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
  
  /** TLS/SSL options */
  tls?: {
    rejectUnauthorized?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
    passphrase?: string;
  };
  
  /** Circuit breaker options */
  circuitBreaker?: {
    enabled?: boolean;
    errorThreshold?: number;
    resetTimeout?: number;
  };
}

/**
 * HTTP transport specific options.
 * 
 * @interface HTTPTransportOptions
 */
export interface HTTPTransportOptions extends NetworkTransportOptions {
  /** Target URL (required) */
  url: string;
  
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH';
  
  /** Authentication configuration */
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
  
  /** Request body format */
  bodyFormat?: 'json' | 'ndjson' | 'form' | 'custom';
  
  /** Transform request before sending */
  transformRequest?: (entries: LogEntry[]) => string | Buffer;
  
  /** Transform response after receiving */
  transformResponse?: (response: any) => void;
  
  /** Follow redirects */
  followRedirects?: boolean;
  
  /** Max redirects to follow */
  maxRedirects?: number;
  
  /** Proxy configuration */
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

/**
 * Stream transport options.
 * 
 * @interface StreamTransportOptions
 */
export interface StreamTransportOptions extends TransportOptions {
  /** Target stream */
  stream: NodeJS.WritableStream;
  
  /** Auto close stream on transport close */
  autoClose?: boolean;
  
  /** Stream encoding */
  encoding?: BufferEncoding;
  
  /** High water mark for backpressure */
  highWaterMark?: number;
  
  /** Respect backpressure */
  respectBackpressure?: boolean;
}

/**
 * WebSocket transport options.
 * 
 * @interface WebSocketTransportOptions
 */
export interface WebSocketTransportOptions extends TransportOptions {
  /** WebSocket URL */
  url: string;
  
  /** Reconnection configuration */
  reconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  };
  
  /** Authentication */
  auth?: {
    token?: string;
    headers?: Record<string, string>;
  };
  
  /** WebSocket subprotocol */
  protocol?: string | string[];
  
  /** Message encoding */
  encoding?: 'json' | 'msgpack' | 'protobuf';
  
  /** Heartbeat configuration */
  heartbeat?: {
    enabled?: boolean;
    interval?: number;
    timeout?: number;
  };
  
  /** Binary message format */
  binaryType?: 'nodebuffer' | 'arraybuffer' | 'fragments';
}

/**
 * MongoDB transport options.
 * 
 * @interface MongoDBTransportOptions
 */
export interface MongoDBTransportOptions extends NetworkTransportOptions {
  /** MongoDB connection URI */
  uri: string;
  
  /** Database name */
  database?: string;
  
  /** Collection name */
  collection?: string;
  
  /** MongoDB client options */
  clientOptions?: Record<string, unknown>;
  
  /** Create indexes automatically */
  createIndexes?: boolean;
  
  /** Index configuration */
  indexes?: Array<{
    key: Record<string, 1 | -1 | 'text'>;
    options?: Record<string, unknown>;
  }>;
  
  /** TTL in seconds for automatic cleanup */
  ttl?: number;
  
  /** Transform document before insert */
  transformDocument?: (entry: LogEntry) => Record<string, unknown>;
  
  /** Capped collection options */
  capped?: {
    size?: number;
    max?: number;
  };
  
  /** Write concern */
  writeConcern?: {
    w?: number | 'majority';
    j?: boolean;
    wtimeout?: number;
  };
}

/**
 * S3 transport options.
 * 
 * @interface S3TransportOptions
 */
export interface S3TransportOptions extends NetworkTransportOptions {
  /** S3 bucket name */
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
  
  /** S3 endpoint (for S3-compatible services) */
  endpoint?: string;
  
  /** Force path style */
  forcePathStyle?: boolean;
  
  /** Storage class */
  storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'GLACIER' | 'DEEP_ARCHIVE' | 'INTELLIGENT_TIERING' | 'STANDARD_IA' | 'ONEZONE_IA';
  
  /** Server-side encryption */
  encryption?: {
    type: 'AES256' | 'KMS';
    kmsKeyId?: string;
  };
  
  /** Object ACL */
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  
  /** Key generation strategy */
  keyStrategy?: 'timestamp' | 'date-hierarchy' | 'hourly' | 'custom';
  
  /** Custom key generator */
  keyGenerator?: (entries: LogEntry[]) => string;
  
  /** File format for storage */
  fileFormat?: 'json' | 'jsonl' | 'csv' | 'parquet';
  
  /** Object tags */
  objectTags?: Record<string, string>;
  
  /** Object metadata */
  objectMetadata?: Record<string, string>;
  
  /** Enable compression before upload */
  compress?: boolean;
  
  /** Multipart upload threshold (bytes) */
  multipartThreshold?: number;
  
  /** Part size for multipart uploads */
  partSize?: number;
}

/**
 * Transport type enumeration.
 * 
 * @type TransportType
 */
export type TransportType = 
  | 'console' 
  | 'file' 
  | 'http' 
  | 'stream' 
  | 's3' 
  | 'mongodb' 
  | 'websocket'
  | 'syslog'
  | 'elasticsearch'
  | 'custom';

/**
 * Transport configuration for dynamic creation.
 * 
 * @interface TransportConfig
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
  
  /** All other transport-specific options */
  [key: string]: unknown;
}

/**
 * ID generator function type.
 * Generates unique identifiers for log entries.
 * 
 * @type IdGenerator
 */
export type IdGenerator = () => string;

/**
 * Async logging options.
 * 
 * @interface AsyncOptions
 */
export interface AsyncOptions {
  /** Enable async logging */
  enabled?: boolean;
  
  /** Buffer configuration */
  buffer?: {
    /** Ring buffer size (will be rounded to power of 2) */
    size?: number;
    
    /** Flush interval in milliseconds */
    flushInterval?: number;
    
    /** Flush when buffer reaches this size */
    flushSize?: number;
  };
  
  /** Use worker threads for processing */
  useWorkers?: boolean;
  
  /** Number of worker threads */
  workerCount?: number;
  
  /** Path to worker script */
  workerPath?: string;
}

/**
 * Context minification options for efficient storage/transmission.
 * 
 * @interface ContextMinificationOptions
 */
export interface ContextMinificationOptions {
  /** Enable context minification */
  enabled?: boolean;
  
  /** Minification rules mapping long keys to short keys */
  rules?: Record<string, string>;
  
  /** Compress context data */
  compress?: boolean;
}
// File: src/types/transport.ts

import type { LogLevel, ColorName } from './logger';

/**
 * Core log entry structure that flows through the transport system.
 * This interface represents a single log message with all its metadata.
 */
export interface LogEntry {
  /**
   * Unique identifier for this log entry.
   * Generated using timestamp + random component for uniqueness.
   */
  id: string;

  /**
   * ISO 8601 timestamp when the log was created.
   * @example "2024-01-15T10:30:45.123Z"
   */
  timestamp: string;

  /**
   * Unix timestamp in milliseconds for easier sorting/filtering.
   */
  timestampMs: number;

  /**
   * Log level of this entry.
   * Can be standard levels or custom strings.
   */
  level: LogLevel;

  /**
   * The actual log message content.
   */
  message: string;

  /**
   * Optional formatted message with ANSI codes stripped.
   * Used for transports that don't support terminal colors.
   */
  plainMessage?: string;

  /**
   * Logger instance ID that created this entry.
   * Useful for tracking logs from different services/components.
   */
  loggerId?: string;

  /**
   * Tags associated with this log entry.
   * Used for filtering and categorization.
   */
  tags?: string[];

  /**
   * Additional context data for this specific log entry.
   * Can contain any structured data relevant to the log.
   */
  context?: Record<string, any>;

  /**
   * Error object if this log entry represents an error.
   * Includes stack trace and error details.
   */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    [key: string]: any;
  };

  /**
   * Environment metadata captured at log time.
   */
  metadata?: {
    hostname?: string;
    pid?: number;
    platform?: string;
    nodeVersion?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

/**
 * Transport configuration base interface.
 * All transports must implement these core options.
 */
export interface TransportOptions {
  /**
   * Unique name identifier for this transport instance.
   * Used for managing multiple transports.
   */
  name: string;

  /**
   * Whether this transport is currently active.
   * Allows runtime enabling/disabling of transports.
   * @default true
   */
  enabled?: boolean;

  /**
   * Minimum log level this transport will handle.
   * Logs below this level are ignored by this transport.
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Custom levels this transport should handle.
   * Allows fine-grained control over what gets logged where.
   */
  levels?: LogLevel[];

  /**
   * Tags that must be present for this transport to handle a log.
   * If specified, only logs with at least one matching tag are processed.
   */
  tags?: string[];

  /**
   * Tags that exclude logs from this transport.
   * Logs with any of these tags are skipped.
   */
  excludeTags?: string[];

  /**
   * Custom filter function for advanced filtering logic.
   * Return true to process the log, false to skip.
   */
  filter?: (entry: LogEntry) => boolean;

  /**
   * Output format for this transport.
   * @default 'json'
   */
  format?: 'json' | 'plain' | 'custom';

  /**
   * Custom formatter function.
   * Used when format is 'custom'.
   */
  formatter?: (entry: LogEntry) => string | Buffer;

  /**
   * Whether to handle errors silently or propagate them.
   * @default true
   */
  silent?: boolean;

  /**
   * Timeout for transport operations in milliseconds.
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * Configuration for transports that batch logs before sending.
 */
export interface BatchingOptions {
  /**
   * Maximum number of logs to batch before sending.
   * @default 100
   */
  maxBatchSize?: number;

  /**
   * Maximum time to wait before sending a batch (milliseconds).
   * @default 5000 (5 seconds)
   */
  maxBatchTime?: number;

  /**
   * Maximum size in bytes before sending a batch.
   * @default 1048576 (1MB)
   */
  maxBatchBytes?: number;

  /**
   * Whether to send logs immediately without batching.
   * Overrides other batch settings when true.
   * @default false
   */
  immediate?: boolean;

  /**
   * Compress batches before sending (gzip).
   * @default false
   */
  compress?: boolean;
}

/**
 * Retry configuration for network transports.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds.
   * @default 1000 (1 second)
   */
  initialDelay?: number;

  /**
   * Maximum retry delay in milliseconds.
   * @default 30000 (30 seconds)
   */
  maxDelay?: number;

  /**
   * Exponential backoff factor.
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Add random jitter to retry delays to prevent thundering herd.
   * @default true
   */
  jitter?: boolean;

  /**
   * Which errors should trigger a retry.
   * Return true to retry, false to fail immediately.
   */
  retryCondition?: (error: Error) => boolean;
}

/**
 * Options for network-based transports (HTTP, S3, etc).
 */
export interface NetworkTransportOptions extends TransportOptions, BatchingOptions {
  /**
   * Retry configuration for failed requests.
   */
  retry?: RetryOptions;

  /**
   * Fallback transport to use when this transport fails.
   * Can be 'file', 'console', or a custom transport name.
   */
  fallback?: string | TransportOptions;

  /**
   * Dead letter queue configuration for failed logs.
   */
  dlq?: {
    enabled: boolean;
    filepath?: string;
    maxSize?: number;
    maxAge?: number;
  };

  /**
   * Request headers to include with all requests.
   */
  headers?: Record<string, string>;

  /**
   * TLS/SSL options for HTTPS connections.
   */
  tls?: {
    rejectUnauthorized?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
  };
}

/**
 * HTTP transport specific options.
 */
export interface HTTPTransportOptions extends NetworkTransportOptions {
  /**
   * Target URL endpoint for log delivery.
   */
  url: string;

  /**
   * HTTP method to use.
   * @default 'POST'
   */
  method?: 'POST' | 'PUT' | 'PATCH';

  /**
   * Authentication configuration.
   */
  auth?: {
    type: 'basic' | 'bearer' | 'apikey' | 'custom';
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    customAuth?: () => Promise<Record<string, string>>;
  };

  /**
   * Request body encoding.
   * @default 'json'
   */
  bodyFormat?: 'json' | 'ndjson' | 'form' | 'custom';

  /**
   * Custom request transformer.
   */
  transformRequest?: (logs: LogEntry[]) => any;
}

/**
 * S3 transport specific options.
 */
export interface S3TransportOptions extends NetworkTransportOptions {
  /**
   * S3 bucket name.
   */
  bucket: string;

  /**
   * S3 key prefix for log files.
   * @default 'logs/'
   */
  prefix?: string;

  /**
   * AWS region.
   * @default 'us-east-1'
   */
  region?: string;

  /**
   * AWS credentials.
   * If not provided, uses default credential chain.
   */
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };

  /**
   * S3 storage class.
   * @default 'STANDARD'
   */
  storageClass?: 'STANDARD' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER' | 'DEEP_ARCHIVE';

  /**
   * Server-side encryption settings.
   */
  encryption?: {
    type: 'AES256' | 'KMS';
    kmsKeyId?: string;
  };

  /**
   * Key naming strategy.
   * @default 'timestamp'
   */
  keyStrategy?: 'timestamp' | 'date-hierarchy' | 'hourly' | 'custom';

  /**
   * Custom key generator function.
   */
  keyGenerator?: (logs: LogEntry[]) => string;

  /**
   * File format for S3 objects.
   * @default 'jsonl'
   */
  fileFormat?: 'json' | 'jsonl' | 'csv' | 'parquet';

  /**
   * Tags to apply to S3 objects.
   */
  objectTags?: Record<string, string>;
}

/**
 * MongoDB transport options.
 */
export interface MongoDBTransportOptions extends NetworkTransportOptions {
  /**
   * MongoDB connection string.
   */
  uri: string;

  /**
   * Database name.
   * @default 'logs'
   */
  database?: string;

  /**
   * Collection name.
   * @default 'entries'
   */
  collection?: string;

  /**
   * MongoDB client options.
   */
  clientOptions?: Record<string, any>;

  /**
   * Whether to create indexes for common queries.
   * @default true
   */
  createIndexes?: boolean;

  /**
   * TTL (time to live) for log entries in seconds.
   * Automatically deletes old logs.
   */
  ttl?: number;

  /**
   * Custom document transformer before insertion.
   */
  transformDocument?: (entry: LogEntry) => Record<string, any>;
}

/**
 * WebSocket transport options.
 */
export interface WebSocketTransportOptions extends TransportOptions {
  /**
   * WebSocket server URL.
   */
  url: string;

  /**
   * Reconnection options.
   */
  reconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
  };

  /**
   * Authentication token or credentials.
   */
  auth?: {
    token?: string;
    headers?: Record<string, string>;
  };

  /**
   * WebSocket protocol to use.
   */
  protocol?: string | string[];

  /**
   * Message encoding.
   * @default 'json'
   */
  encoding?: 'json' | 'msgpack' | 'protobuf';
}

/**
 * Stream transport options for Node.js streams.
 */
export interface StreamTransportOptions extends TransportOptions {
  /**
   * Target writable stream.
   */
  stream: NodeJS.WritableStream;

  /**
   * Whether to close the stream when transport is closed.
   * @default false
   */
  autoClose?: boolean;

  /**
   * Stream encoding.
   * @default 'utf8'
   */
  encoding?: BufferEncoding;
}

/**
 * Transport lifecycle events.
 */
export interface TransportEvents {
  /**
   * Emitted when transport is ready to accept logs.
   */
  ready: () => void;

  /**
   * Emitted when a log is successfully sent.
   */
  logged: (entry: LogEntry) => void;

  /**
   * Emitted when a batch is sent (for batching transports).
   */
  batch: (entries: LogEntry[], size: number) => void;

  /**
   * Emitted on transport errors.
   */
  error: (error: Error, entry?: LogEntry) => void;

  /**
   * Emitted when transport is closing.
   */
  closing: () => void;

  /**
   * Emitted when transport is closed.
   */
  closed: () => void;
}

/**
 * Core transport interface that all transports must implement.
 */
export interface Transport {
  /**
   * Unique name of this transport instance.
   */
  readonly name: string;

  /**
   * Whether this transport is currently enabled.
   */
  enabled: boolean;

  /**
   * Log a single entry.
   * Should handle the entry according to transport's configuration.
   */
  log(entry: LogEntry): void | Promise<void>;

  /**
   * Log multiple entries at once (for batch support).
   */
  logBatch?(entries: LogEntry[]): void | Promise<void>;

  /**
   * Initialize the transport.
   * Called when transport is added to logger.
   */
  init?(): void | Promise<void>;

  /**
   * Close the transport and clean up resources.
   * Should flush any pending logs.
   */
  close(): void | Promise<void>;

  /**
   * Flush any buffered logs immediately.
   */
  flush?(): void | Promise<void>;

  /**
   * Check if transport should handle this log entry.
   */
  shouldLog(entry: LogEntry): boolean;

  /**
   * Get transport statistics.
   */
  getStats?(): TransportStats;

  /**
   * Event emitter methods (optional but recommended).
   */
  on?(event: keyof TransportEvents, listener: Function): void;
  off?(event: keyof TransportEvents, listener: Function): void;
  emit?(event: keyof TransportEvents, ...args: any[]): void;
}

/**
 * Transport statistics for monitoring.
 */
export interface TransportStats {
  /**
   * Total logs processed by this transport.
   */
  processed: number;

  /**
   * Total logs successfully sent.
   */
  succeeded: number;

  /**
   * Total logs that failed to send.
   */
  failed: number;

  /**
   * Current number of logs in queue (if applicable).
   */
  queued?: number;

  /**
   * Last successful log timestamp.
   */
  lastSuccess?: Date;

  /**
   * Last error that occurred.
   */
  lastError?: {
    timestamp: Date;
    message: string;
    count: number;
  };

  /**
   * Transport-specific metrics.
   */
  custom?: Record<string, any>;
}

/**
 * Transport manager configuration.
 */
export interface TransportManagerOptions {
  /**
   * Default timeout for all transports.
   * @default 30000
   */
  defaultTimeout?: number;

  /**
   * Whether to stop on first transport success (fail-fast).
   * @default false
   */
  stopOnSuccess?: boolean;

  /**
   * Global error handler for all transports.
   */
  errorHandler?: (error: Error, transport: Transport, entry?: LogEntry) => void;

  /**
   * Whether to aggregate logs from multiple sources.
   * @default false
   */
  enableAggregation?: boolean;

  /**
   * Aggregation configuration.
   */
  aggregation?: {
    /**
     * Interval for aggregation reports in milliseconds.
     * @default 60000 (1 minute)
     */
    interval?: number;

    /**
     * Transports to send aggregated data to.
     */
    targets?: string[];

    /**
     * Fields to aggregate.
     */
    fields?: Array<'level' | 'tags' | 'loggerId' | 'custom'>;
  };
}

/**
 * Log aggregation statistics.
 */
export interface AggregationStats {
  /**
   * Time period for these stats.
   */
  period: {
    start: Date;
    end: Date;
  };

  /**
   * Total log count.
   */
  total: number;

  /**
   * Breakdown by log level.
   */
  byLevel: Record<LogLevel, number>;

  /**
   * Breakdown by logger ID.
   */
  byLogger?: Record<string, number>;

  /**
   * Breakdown by tags.
   */
  byTags?: Record<string, number>;

  /**
   * Error rate.
   */
  errorRate: number;

  /**
   * Average log size in bytes.
   */
  avgSize?: number;

  /**
   * Custom aggregated metrics.
   */
  custom?: Record<string, any>;
}
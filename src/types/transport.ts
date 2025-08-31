// File: src/types/transport.ts

import type { LogLevel } from './logger';

// Re-export LogLevel for convenience
export type { LogLevel };

/**
 * Style range for efficient storage of formatting information.
 * Tuple format: [startIndex, endIndex, styleDescriptor]
 */
export type StyleRange = [number, number, string];

/**
 * Connection state for network transports.
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'closing'
  | 'reconnecting';

/**
 * MAGIC Schema v1 - Core log entry structure.
 *
 * This interface implements the MAGIC Schema specification for
 * cross-language compatibility and seamless observability integration.
 *
 * @see https://github.com/magiclogger/magiclog-schema
 */
export interface LogEntry {
  // === IDENTITY & TIMING ===
  /**
   * Unique identifier for this log entry.
   * Format: "timestamp-randomComponent" (e.g., "1733938475123-abc123xyz")
   */
  id: string;

  /**
   * ISO 8601 timestamp when the log was created.
   * @example "2025-08-14T12:34:35.123Z"
   */
  timestamp: string;

  /**
   * Unix timestamp in milliseconds for efficient sorting/filtering.
   */
  timestampMs: number;

  /**
   * MAGIC schema version for compatibility.
   * @default "v1"
   */
  schemaVersion?: 'v1';

  // === CORE CONTENT ===
  /**
   * Log level following syslog RFC5424 severity.
   */
  level: LogLevel;

  /**
   * Plain text log message without any formatting codes.
   * This is the primary message content for all transports.
   */
  message: string;

  /**
   * Optional style ranges for reconstructing formatted output.
   * Each entry is [startIndex, endIndex, styleDescriptor].
   * Example: [[0, 6, "red.bold"], [12, 29, "cyan"]]
   */
  styles?: Array<[number, number, string]>;

  // === LOGGER CONTEXT ===
  /**
   * Logger instance identifier.
   * Useful for multi-logger applications.
   */
  loggerId?: string;

  /**
   * Service name for microservice architectures.
   * Maps to service.name in OpenTelemetry.
   */
  service?: string;

  /**
   * Deployment environment.
   * @example "development" | "staging" | "production"
   */
  environment?: string;

  /**
   * Categorization tags for filtering and routing.
   */
  tags?: string[];

  // === STRUCTURED DATA ===
  /**
   * User-provided structured context data.
   * Can contain any application-specific data.
   */
  context?: Record<string, unknown>;

  /**
   * Structured error information.
   */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: unknown;
  };

  // === RUNTIME METADATA ===
  /**
   * Automatically collected runtime information.
   */
  metadata?: {
    hostname?: string;
    pid?: number;
    platform?: string;
    nodeVersion?: string;
    userAgent?: string;

    // Additional metadata for observability
    trace?: {
      traceId?: string;
      spanId?: string;
      parentSpanId?: string;
      traceFlags?: string;
      traceState?: string;
    };

    // Resource utilization (optional)
    resources?: {
      memory?: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
      };
      cpu?: {
        user: number;
        system: number;
      };
    };

    // Health indicators (optional)
    health?: {
      timestamp: number;
      uptime?: number;
      pid?: number;
    };

    [key: string]: unknown;
  };

  // === DISTRIBUTED TRACING (OpenTelemetry compatible) ===
  /**
   * Distributed tracing context.
   * Follows OpenTelemetry trace context specification.
   */
  trace?: {
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    traceFlags?: string;
    traceState?: string;
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
  name?: string;

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
 * Combined options for batching transports.
 */
export interface BatchingTransportOptions extends TransportOptions, BatchingOptions {
  /**
   * Maximum retry attempts for failed batches.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds.
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Whether to retry on failure.
   * @default true
   */
  retryOnFailure?: boolean;

  /**
   * Maximum queue size.
   * @default 10000
   */
  maxQueueSize?: number;
}

/**
 * Transport type enumeration.
 * Defines all supported transport types for the logger.
 */
export type TransportType =
  | 'console'
  | 'file'
  | 'http'
  | 'stream'
  | 's3'
  | 'mongodb'
  | 'websocket'
  | 'otlp'
  | 'postgresql'
  | 'syslog'
  | 'elasticsearch'
  | 'custom';

/**
 * Transport configuration for dynamic creation.
 * Base configuration interface that all transport configs extend.
 */
export interface TransportConfig extends Record<string, unknown> {
  /** Transport type identifier */
  type: TransportType;

  /** Optional transport name (auto-generated if not provided) */
  name?: string;

  /** Whether the transport is enabled */
  enabled?: boolean;

  /** Minimum log level to handle */
  level?: LogLevel;

  /** Specific levels to handle (overrides level if provided) */
  levels?: LogLevel[];

  /** Tags to filter on */
  tags?: string[];

  /** Tags to exclude */
  excludeTags?: string[];

  /** Custom filter function */
  filter?: (entry: LogEntry) => boolean;

  /** Output format */
  format?: 'json' | 'plain' | 'custom';

  /** Custom formatter */
  formatter?: (entry: LogEntry) => string | Buffer;

  /** Silent mode */
  silent?: boolean;

  /** Operation timeout */
  timeout?: number;
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
export interface NetworkTransportOptions extends BatchingTransportOptions {
  /**
   * Network endpoint URL.
   */
  url?: string;

  /**
   * Connection timeout in milliseconds.
   */
  connectionTimeout?: number;

  /**
   * Request timeout in milliseconds.
   */
  requestTimeout?: number;

  /**
   * Maximum reconnection attempts.
   */
  maxReconnectAttempts?: number;

  /**
   * Delay between reconnection attempts.
   */
  reconnectDelay?: number;

  /**
   * Whether to use exponential backoff for reconnects.
   */
  reconnectBackoff?: boolean;

  /**
   * Maximum offline queue size.
   */
  maxOfflineQueueSize?: number;

  /**
   * Whether to queue logs when offline.
   */
  queueWhenOffline?: boolean;

  /**
   * Health check interval in milliseconds.
   */
  healthCheckInterval?: number;

  /**
   * Keep-alive interval in milliseconds.
   */
  keepAliveInterval?: number;

  /**
   * Circuit breaker configuration.
   */
  circuitBreaker?: {
    enabled: boolean;
    errorThreshold?: number;
    resetTimeout?: number;
  };

  /**
   * Retry configuration for failed requests.
   */
  retry?: RetryOptions;

  /**
   * Fallback transport to use when this transport fails.
   * Can be 'file', 'console', or a Transport instance.
   */
  fallback?: string | Transport;

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
 * PostgreSQL transport configuration options.
 */
export interface PostgreSQLTransportOptions extends BatchingTransportOptions {
  /** Full connection string, or provide discrete connection fields */
  connectionString?: string;
  /** Hostname of the PostgreSQL server */
  host?: string;
  /** Port number */
  port?: number;
  /** Database name */
  database?: string;
  /** Username */
  user?: string;
  /** Password */
  password?: string;
  /** Enable SSL */
  ssl?: boolean;
  /** Schema name (default: public) */
  schema?: string;
  /** Table name (default: logs) */
  table?: string;
  /** Create table if it does not exist (default: true) */
  createTable?: boolean;
  /** JSON/JSONB columns to store structured fields */
  jsonColumns?: string[];
  /** Columns to create indexes on */
  indexes?: string[];
  /** Connection pool size */
  poolSize?: number;
  /** Flush interval override for batching (ms) */
  flushInterval?: number;
  /** Logical batch size override */
  batchSize?: number;
  /** Optional simple partitioning configuration */
  partitioning?: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    retention: number; // days to retain
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
  transformRequest?: (logs: LogEntry[]) => unknown;

  /**
   * Custom response transformer.
   */
  transformResponse?: (response: unknown) => void;

  /**
   * Whether to follow HTTP redirects.
   * @default true
   */
  followRedirects?: boolean;

  /**
   * Maximum number of redirects to follow.
   * @default 5
   */
  maxRedirects?: number;

  /**
   * Proxy configuration.
   */
  proxy?: {
    host: string;
    port: number;
    protocol?: string;
    auth?: {
      username: string;
      password: string;
    };
  };

  /**
   * Circuit breaker specific thresholds for HTTP transport.
   */
  circuitBreakerThreshold?: number;
  circuitBreakerResetTimeout?: number;
  circuitBreakerSuccessThreshold?: number;

  /**
   * HTTP agent configuration.
   */
  maxSockets?: number;
  maxFreeSockets?: number;
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
  storageClass?:
    | 'STANDARD'
    | 'STANDARD_IA'
    | 'ONEZONE_IA'
    | 'INTELLIGENT_TIERING'
    | 'GLACIER'
    | 'DEEP_ARCHIVE';

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
 * Console transport specific options.
 */
export interface ConsoleTransportOptions extends TransportOptions {
  /**
   * Whether to use colors in console output.
   * @default true (when terminal supports it)
   */
  colorize?: boolean;

  /**
   * Whether to use stderr for error/warn levels.
   * @default true
   */
  stderrLevels?: LogLevel[] | boolean;

  /**
   * Whether to inspect objects deeply.
   * @default false
   */
  debugStdout?: boolean;

  /**
   * Console method mapping for different log levels.
   */
  consoleMethods?: Record<LogLevel, 'log' | 'info' | 'warn' | 'error' | 'debug'>;
}

/**
 * File transport specific options.
 */
export interface FileTransportOptions extends TransportOptions {
  /**
   * Path to the log file.
   */
  filepath: string;

  /**
   * Whether the filepath is a directory.
   * @default false
   */
  isDirectory?: boolean;

  /**
   * Maximum size of log file before rotation (in bytes).
   * @default 10485760 (10MB)
   */
  maxFileSize?: number;

  /**
   * Maximum number of files to keep.
   * @default 5
   */
  maxFiles?: number;

  /**
   * Whether to compress archived files.
   * @default false
   */
  compress?: boolean;

  /**
   * Rotation strategy.
   * @default 'none'
   */
  rotation?: 'size' | 'daily' | 'hourly' | 'none';

  /**
   * Whether to append to existing files.
   * @default true
   */
  append?: boolean;

  /**
   * File encoding.
   * @default 'utf8'
   */
  encoding?: BufferEncoding;

  /**
   * Whether to include timestamp in log lines.
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Whether to create directories if they don't exist.
   * @default true
   */
  createDir?: boolean;

  /**
   * Number of days to retain log files.
   */
  retentionDays?: number;

  /**
   * Line ending to use.
   * @default '\n'
   */
  eol?: string;

  /**
   * Maximum batch size for batching.
   */
  maxBatchSize?: number;

  /**
   * Maximum batch time for batching.
   */
  maxBatchTime?: number;
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
  clientOptions?: Record<string, unknown>;

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
  transformDocument?: (entry: LogEntry) => Record<string, unknown>;
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

  /**
   * Maximum internal queue size before dropping/handling backpressure.
   * Defaults to 1000 if not provided.
   */
  maxQueueSize?: number;
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

  /**
   * Emitted when transport is enabled.
   */
  enabled: () => void;

  /**
   * Emitted when transport is disabled.
   */
  disabled: () => void;

  // Network transport specific events
  /**
   * Emitted when connected.
   */
  connected?: (info?: unknown) => void;

  /**
   * Emitted on connection error.
   */
  connectionError?: (error: Error) => void;

  /**
   * Emitted when connection fails after all retries.
   */
  connectionFailed?: (info: { attempts: number; error: Error }) => void;

  /**
   * Emitted when reconnecting.
   */
  reconnecting?: (info: { attempt: number; delay: number }) => void;

  /**
   * Emitted when processing offline queue.
   */
  processingOfflineQueue?: (info: { count: number }) => void;

  /**
   * Emitted when offline queue is processed.
   */
  offlineQueueProcessed?: (info: { count: number }) => void;

  /**
   * Emitted when health check passes.
   */
  healthCheckPassed?: () => void;

  /**
   * Emitted when health check fails.
   */
  healthCheckFailed?: (error: unknown) => void;

  /**
   * Emitted when keep-alive fails.
   */
  keepAliveFailed?: (error: unknown) => void;

  /**
   * Emitted on retry attempt.
   */
  retry?: (info: {
    transport: string;
    batch: string;
    attempt: number;
    delay: number;
    error: string;
  }) => void;

  /**
   * Emitted when circuit breaker opens.
   */
  circuitBreakerOpen?: (info: { transport: string; failures: number; until: Date }) => void;

  /**
   * Emitted when using fallback transport.
   */
  fallback?: (info: { transport: string; fallback: string; count: number }) => void;

  /**
   * Emitted when offline queue is full.
   */
  offlineQueueFull?: (info: { dropped: number }) => void;

  /**
   * Emitted when offline queue overflows.
   */
  offlineQueueOverflow?: (info: { queued: number; dropped: number }) => void;

  // Transport-specific events
  /**
   * Emitted when a message/data is successfully sent.
   */
  sent?: (info: unknown) => void;

  /**
   * Emitted when disconnected.
   */
  disconnected?: (info: unknown) => void;

  /**
   * Emitted when upload/data transfer is complete.
   */
  uploaded?: (info: unknown) => void;

  /**
   * Emitted when a WebSocket message is acknowledged.
   */
  acknowledged?: (message: unknown) => void;

  /**
   * Emitted when configuration is received.
   */
  config?: (config: unknown) => void;

  /**
   * Emitted when a message is received.
   */
  message?: (message: unknown) => void;

  /**
   * Emitted when a stream is closed.
   */
  streamClosed?: () => void;

  /**
   * Emitted when a stream is finished.
   */
  streamFinished?: () => void;

  /**
   * Emitted when a stream is piped.
   */
  piped?: (info: { source: unknown }) => void;

  /**
   * Emitted when a stream is unpiped.
   */
  unpipe?: (info: { source: unknown }) => void;

  /**
   * Emitted when backpressure occurs.
   */
  backpressure?: (info: unknown) => void;

  /**
   * Emitted when MongoDB indexes are created.
   */
  indexesCreated?: (info: unknown) => void;

  /**
   * Emitted when MongoDB insert occurs.
   */
  mongoInsert?: (info: unknown) => void;

  /**
   * Emitted when data is inserted.
   */
  inserted?: (info: unknown) => void;
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
   * Check if transport is currently enabled.
   * Matches class Transport API for structural typing.
   */
  isEnabled?(): boolean;

  /**
   * Get the transport name.
   * Matches class Transport API for structural typing.
   */
  getName?(): string;

  /**
   * Whether this transport supports batching (optional).
   */
  supportsBatching?(): boolean;

  /**
   * Optional health check method.
   */
  isHealthy?(): Promise<boolean>;

  /** Enable this transport (optional). */
  enable?(): void;

  /** Disable this transport (optional). */
  disable?(): void;

  /**
   * Get transport statistics.
   */
  getStats?(): TransportStats;

  /**
   * Event emitter methods (optional but recommended).
   */
  on?(event: keyof TransportEvents, listener: (...args: unknown[]) => void): this;
  off?(event: keyof TransportEvents, listener: (...args: unknown[]) => void): this;
  emit?(event: keyof TransportEvents, ...args: unknown[]): boolean;
  /** Optional event helpers common on Node.js EventEmitter */
  once?(event: keyof TransportEvents, listener: (...args: unknown[]) => void): this;
  removeListener?(event: keyof TransportEvents, listener: (...args: unknown[]) => void): this;

  /** Reset transport statistics (optional, but used by manager when available). */
  resetStats?(): void;
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
  custom?: Record<string, unknown>;

  /**
   * Optional transport identifier for convenience in tests/metrics.
   */
  name?: string;

  /**
   * Alias for succeeded count, provided for readability in some consumers/tests.
   */
  logged?: number;

  /**
   * Additional alias for succeeded count expected by some tests/consumers.
   */
  sent?: number;
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
  custom?: Record<string, unknown>;
}

/**
 * @fileoverview MagicLogger - High-performance, async-first logging library.
 *
 * MagicLogger provides two distinct logging modes:
 * - **Logger** (default): Async with buffering for high performance
 * - **SyncLogger**: True synchronous I/O for guaranteed delivery
 *
 * @module magiclogger
 * @example
 * ```typescript
 * // Default async logger - recommended for production
 * import { Logger } from 'magiclogger';
 * const logger = new Logger();
 *
 * // Explicit sync logger - for debugging/auditing
 * import { SyncLogger } from 'magiclogger';
 * const syncLogger = new SyncLogger();
 * ```
 */

// ==========================================
// Core Logger Exports
// ==========================================

/**
 * Main Logger class - the full-featured logger with all styling methods.
 * This is what users expect when they import Logger.
 */
export { Logger } from './Logger';
export type { LoggerOptions } from './types/logger';

/**
 * Async logger implementation for high-performance buffering.
 * Use this when you explicitly need async/buffered logging.
 */
export { AsyncLogger } from './async/AsyncLogger';
export type { AsyncLoggerOptions } from './async/AsyncLogger';


/**
 * Synchronous logger with blocking I/O.
 * All operations complete before returning.
 */
export { SyncLogger } from './sync/SyncLogger';

/**
 * Core types
 */
export type { LogLevel } from './types/logger';
export type { LogEntry } from './types/transport';

// ==========================================
// Factory Functions
// ==========================================

import { Logger } from './Logger';
import { AsyncLogger } from './async/AsyncLogger';
import { SyncLogger } from './sync/SyncLogger';
import type { AsyncLoggerOptions } from './async/AsyncLogger';
import type { LoggerOptions } from './types/logger';
import type { LogEntry } from './types/transport';
import type { LogLevel } from './types/logger';

/**
 * Creates a logger with configurable behavior.
 *
 * @param options - Configuration options
 * @param options.mode - Logger mode: 'async' (default), 'sync', 'auto', or 'balanced'
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * // Default async logger for high performance
 * const logger = createLogger();
 *
 * // Explicit async mode
 * const asyncLogger = createLogger({ mode: 'async' });
 *
 * // Sync logger for debugging or auditing
 * const syncLogger = createLogger({ mode: 'sync' });
 *
 * // Auto-detect based on environment
 * const autoLogger = createLogger({ mode: 'auto' });
 * ```
 */
export function createLogger(
  options: Partial<LoggerOptions & AsyncLoggerOptions> = {}
): Logger | AsyncLogger | SyncLogger {
  const mode = options.mode ?? 'async';

  // For backward compatibility with tests, return actual AsyncLogger/SyncLogger instances
  if (mode === 'async') {
    // Return AsyncLogger for async mode
    return createAsyncLogger(options as Partial<AsyncLoggerOptions>);
  } else if (mode === 'sync') {
    // Return SyncLogger for sync mode
    return new SyncLogger(options);
  } else if (mode === 'auto') {
    // Auto-detect based on environment
    const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
    const isInteractive = typeof process !== 'undefined' && process.stdout?.isTTY;
    const isTesting =
      typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.CI);

    const useAsync = isProduction || (!isInteractive && !isTesting);
    return useAsync
      ? createAsyncLogger(options as Partial<AsyncLoggerOptions>)
      : new SyncLogger(options);
  } else {
    // Default to Logger class for balanced mode or unknown
    return new Logger(options);
  }
}

/**
 * Creates a synchronous logger with blocking I/O.
 * @deprecated Use createLogger({ mode: 'sync' }) instead
 *
 * @param options - Configuration options
 * @returns Logger instance in sync mode
 */
export function createSyncLogger(options: Partial<LoggerOptions> = {}): SyncLogger {
  return new SyncLogger(options);
}

// ==========================================
// Default Export
// ==========================================

/**
 * Default export - creates an async logger.
 *
 * @example
 * ```typescript
 * import logger from 'magiclogger';
 * const log = logger();
 * log.info('Hello world');
 * ```
 */
export default function magiclogger(
  options: Partial<LoggerOptions & AsyncLoggerOptions> = {}
): Logger | AsyncLogger | SyncLogger {
  return createLogger(options);
}

// ==========================================
// Styling & Theming
// ==========================================

export { COLORS } from './constants/colors';
export { ANSI } from './constants/ansi';
export { PRESETS } from './constants/preset';
export { Colorizer } from './core/Colorizer';
export { StyleBuilder } from './core/StyleBuilder';
export { ContextManager } from './core/ContextManager';
export { meta, err } from './utils/meta';

export type { ColorName } from './types/colors';
export type { StylePreset } from './types/preset';
export type { ThemeDefinition } from './types/theme';

// ==========================================
// Optional Extensions
// ==========================================

/**
 * Queue management for handling backpressure.
 */
export { QueueManager } from './extensions/QueueManager';
export type { QueueManagerOptions, QueueStats, DropPolicy } from './extensions/QueueManager';

/**
 * Rate limiting for log throttling.
 */
export { RateLimiter } from './extensions/RateLimiter';
export type { RateLimiterOptions, RateLimitStrategy } from './extensions/RateLimiter';

/**
 * PII and sensitive data redaction.
 */
export { Redactor, createRedactorPreset } from './extensions/Redactor';
export type {
  RedactorOptions,
  RedactionPattern,
  RedactionPreset,
  RedactionStrategy,
} from './extensions/Redactor';

/**
 * Statistical sampling for volume control.
 */
export { Sampler, createSamplerPreset } from './extensions/Sampler';
export type { SamplerOptions, SamplingStrategy } from './extensions/Sampler';

/**
 * Enhanced console functionality.
 */
export { EnhancedConsole, enhanceConsole } from './utils/EnhancedConsole';
export type { EnhanceConsoleOptions } from './utils/EnhancedConsole';

/**
 * Table formatting utilities for beautiful tables, boxes, and lists.
 */
export { TableFormatter } from './utils/TableFormatter';
export type { TableOptions } from './utils/TableFormatter';

/**
 * Style extraction and reconstruction utilities for MAGIC schema.
 * These functions enable parsing styled text and reconstructing it from MAGIC log entries.
 */
export {
  extractStyles,
  applyStyles,
  optimizeStyleRanges,
  validateStyleRanges
} from './utils/style-extractor';

// ==========================================
// Transport Types
// ==========================================

export type {
  Transport,
  TransportOptions,
  TransportConfig,
  TransportType,
  TransportStats,
  TransportEvents,
  BatchingOptions,
  RetryOptions,
  ConnectionState,
  ConsoleTransportOptions,
  FileTransportOptions,
  BatchingTransportOptions,
  NetworkTransportOptions,
  HTTPTransportOptions,
  StreamTransportOptions,
  WebSocketTransportOptions,
  MongoDBTransportOptions,
  S3TransportOptions,
} from './types/transport';

// ==========================================
// Utility Types
// ==========================================

export type { AddResult, BufferStats } from './async/AsyncBuffer';

/**
 * Type guard to check if a logger is async.
 */
export function isAsyncLogger(logger: unknown): logger is AsyncLogger {
  return logger instanceof AsyncLogger;
}

/**
 * Type guard to check if a logger is sync.
 */
export function isSyncLogger(logger: unknown): logger is SyncLogger {
  return logger instanceof SyncLogger;
}

// ==========================================
// Legacy Exports and Aliases
// ==========================================

/**
 * Creates an async logger with high-performance buffering.
 * @deprecated Use createLogger() which defaults to async
 *
 * @param options - Configuration options for async logger
 * @returns AsyncLogger instance
 */
export function createAsyncLogger(options: Partial<AsyncLoggerOptions> = {}): AsyncLogger {
  // For backward compatibility, create AsyncLogger directly
  const defaultBuffer = {
    size: options.buffer?.size ?? 16384,
    flushInterval: options.buffer?.flushInterval ?? 50,
    flushSize: options.buffer?.flushSize ?? 2000,
  };

  const defaultOnFlush = async (_entries: LogEntry[]) => {
    // Default: entries are already logged to console immediately
  };

  const createLogEntry = (level: LogLevel, message: string, meta?: Record<string, unknown>) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level,
    message,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    // Note: styles extraction could be added here in the future
    context: meta,
  });

  return new AsyncLogger(
    {
      buffer: defaultBuffer,
      onFlush: options.onFlush ?? defaultOnFlush,
      enableMetrics: options.enableMetrics ?? false,
      redactor: options.redactor,
      rateLimiter: options.rateLimiter,
      sampler: options.sampler,
      queueManager: options.queueManager,
      fallbackToSync: options.fallbackToSync ?? false,
      flushOnHighWater: options.flushOnHighWater ?? true,
    },
    createLogEntry
  );
}

/**
 * Transport manager for managing multiple transports.
 */
export { TransportManager } from './transports/base/TransportManager';

/**
 * Default logger and singleton management.
 */
let defaultLogger: AsyncLogger | SyncLogger | Logger | null = null;

export function getDefaultLogger(): AsyncLogger | SyncLogger | Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }
  return defaultLogger;
}

export function setDefaultLogger(logger: AsyncLogger | SyncLogger): void {
  defaultLogger = logger;
}

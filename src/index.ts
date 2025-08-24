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
 * Default async logger with high-performance buffering.
 * Console output is immediate, file/network writes are batched.
 */
export { AsyncLogger as Logger } from './async/AsyncLogger';
export type { AsyncLoggerOptions as LoggerOptions } from './async/AsyncLogger';

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

import { AsyncLogger } from './async/AsyncLogger';
import { SyncLogger } from './sync/SyncLogger';
import type { AsyncLoggerOptions } from './async/AsyncLogger';
import type { LoggerOptions as SyncLoggerOptions } from './types/logger';
import type { LogEntry } from './types/transport';
import type { LogLevel } from './types/logger';

/**
 * Creates an async logger with high-performance buffering.
 * 
 * @param options - Configuration options
 * @param options.buffer - Buffer configuration
 * @param options.buffer.size - Maximum buffer size (default: 16384)
 * @param options.buffer.flushInterval - Flush interval in ms (default: 50)
 * @param options.buffer.flushSize - Flush when this many entries accumulate (default: 2000)
 * @param options.onFlush - Handler for batched log entries
 * @returns Async logger instance
 * 
 * @example
 * ```typescript
 * const logger = createLogger({
 *   buffer: {
 *     flushInterval: 100,  // Flush every 100ms
 *     flushSize: 1000      // Or when 1000 logs accumulate
 *   },
 *   onFlush: async (entries) => {
 *     await writeToFile(entries);
 *     await sendToNetwork(entries);
 *   }
 * });
 * ```
 */
export function createLogger(options: Partial<AsyncLoggerOptions> = {}): AsyncLogger {
  const defaultBuffer = {
    size: options.buffer?.size ?? 16384,
    flushInterval: options.buffer?.flushInterval ?? 50,
    flushSize: options.buffer?.flushSize ?? 2000,
  };

  const defaultOnFlush = async (entries: LogEntry[]) => {
    // Default: entries are already logged to console immediately
    // This handler is for additional processing
  };

  const createLogEntry = (level: LogLevel, message: string, meta?: Record<string, unknown>) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level,
    message,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    plainMessage: message.replace(/\x1b\[[0-9;]*m/g, ''), // Strip ANSI
    context: meta,
  });

  return new AsyncLogger({
    buffer: defaultBuffer,
    onFlush: options.onFlush ?? defaultOnFlush,
    enableMetrics: options.enableMetrics ?? false,
    redactor: options.redactor,
    rateLimiter: options.rateLimiter,
    sampler: options.sampler,
    queueManager: options.queueManager,
    fallbackToSync: options.fallbackToSync ?? false,
    flushOnHighWater: options.flushOnHighWater ?? true,
  }, createLogEntry);
}

/**
 * Creates a synchronous logger with blocking I/O.
 * 
 * @param options - Configuration options
 * @param options.file - Log file path for synchronous writes
 * @param options.useConsole - Enable console output (default: true)
 * @param options.forceFlush - Force fsync after each write (default: true)
 * @returns Synchronous logger instance
 * 
 * @example
 * ```typescript
 * const logger = createSyncLogger({
 *   file: './audit.log',
 *   forceFlush: true  // Guarantee disk writes
 * });
 * ```
 */
export function createSyncLogger(options: Partial<SyncLoggerOptions> = {}): SyncLogger {
  return new SyncLogger(options);
}

/**
 * Creates a smart logger that auto-detects the best mode.
 * 
 * @param options - Configuration options
 * @param options.target - Target environment ('auto', 'development', 'production')
 * @param options.mode - Force specific mode ('sync' or 'async')
 * @returns Logger instance (async or sync based on environment)
 * 
 * @example
 * ```typescript
 * const logger = createSmartLogger();
 * // Development: SyncLogger for immediate output
 * // Production: AsyncLogger for performance
 * ```
 */
export function createSmartLogger(options: {
  target?: 'auto' | 'development' | 'production';
  mode?: 'sync' | 'async';
  onFlush?: (entries: LogEntry[]) => Promise<void>;
} = {}): AsyncLogger | SyncLogger {
  const { target = 'auto', mode } = options;

  // Explicit mode override
  if (mode === 'sync') return createSyncLogger();
  if (mode === 'async') return createLogger(options);

  // Auto-detection
  let useAsync = false;
  
  if (target === 'production') {
    useAsync = true;
  } else if (target === 'development') {
    useAsync = false;
  } else if (target === 'auto') {
    const isProduction = process.env.NODE_ENV === 'production';
    const isInteractive = process.stdout?.isTTY;
    const isTesting = process.env.NODE_ENV === 'test' || process.env.CI;
    
    useAsync = isProduction && !isInteractive && !isTesting;
  }

  return useAsync ? createLogger(options) : createSyncLogger();
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
export default function magiclogger(options: Partial<AsyncLoggerOptions> = {}): AsyncLogger {
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
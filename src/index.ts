// File: src/index.ts

/**
 * MagicLogger - Tree-Shakeable Logging Library
 *
 * Main entry point for the MagicLogger library.
 * Exports only the essential components for optimal tree-shaking.
 *
 * @module magiclogger
 *
 * @example
 * ```typescript
 * // Basic usage
 * import { Logger } from 'magiclogger';
 * const logger = new Logger();
 *
 * // With transports (import separately for tree-shaking)
 * import { ConsoleTransport } from 'magiclogger/transports/console';
 * const logger = new Logger({
 *   transports: [new ConsoleTransport()]
 * });
 * ```
 */

// ==========================================
// CORE EXPORTS
// ==========================================

// Import types and classes for internal use
import { Logger } from './Logger';
import type { LoggerOptions, LogLevel } from './types/logger';
import type { LogEntry } from './types/transport';
import type { AsyncLoggerOptions } from './async/AsyncLogger';
import { AsyncLogger } from './async/AsyncLogger';

/**
 * Main Logger class - the primary interface for logging.
 * Tree-shakeable: Only imports what's needed, no default transports.
 */
export { Logger } from './Logger';
export type { LoggerOptions } from './types/logger';

/**
 * AsyncLogger for high-performance async logging with buffering.
 */
export { AsyncLogger } from './async/AsyncLogger';
export type { AsyncLoggerOptions } from './async/AsyncLogger';

/**
 * Core logger types
 */
export type { LogLevel } from './types/logger';

// ==========================================
// STYLING & THEMING EXPORTS
// ==========================================

/**
 * Color constants for terminal output
 */
export { COLORS } from './constants/colors';

/**
 * ANSI escape codes for direct terminal control
 */
export { ANSI } from './constants/ansi';

/**
 * Style presets for common log patterns
 */
export { PRESETS } from './constants/preset';

/**
 * Color and style types
 */
export type { ColorName } from './types/colors';
export type { StylePreset } from './types/preset';
export type { ThemeDefinition } from './types/theme';

// ==========================================
// UTILITY EXPORTS (Tree-Shakeable)
// ==========================================

/**
 * Colorizer utility for terminal colors.
 * Only imported when color functions are used.
 */
export { Colorizer } from './core/Colorizer';
export { StyleBuilder } from './core/StyleBuilder';
export { meta, err } from './utils/meta';

// ==========================================
// OPERATIONS/MONITORING UTILITIES
// ==========================================

/**
 * Queue management for handling backpressure and log overflow.
 * Tree-shakeable: Only imported when needed.
 */
export { QueueManager } from './utils/QueueManager';
export type { QueueManagerOptions, QueueStats, DropPolicy } from './utils/QueueManager';

/**
 * Rate limiting for log throttling and volume control.
 * Tree-shakeable: Only imported when needed.
 */
export { RateLimiter } from './utils/RateLimiter';
export type { RateLimiterOptions, RateLimitStrategy } from './utils/RateLimiter';

/**
 * PII and sensitive data redaction system.
 * Tree-shakeable: Only imported when needed.
 */
export { Redactor, createRedactorPreset } from './utils/Redactor';
export type {
  RedactorOptions,
  RedactionPattern,
  RedactionPreset,
  RedactionStrategy,
} from './utils/Redactor';

/**
 * Statistical sampling for log volume control.
 * Tree-shakeable: Only imported when needed.
 */
export { Sampler, createSamplerPreset } from './utils/Sampler';
export type { SamplerOptions, SamplingStrategy } from './utils/Sampler';

// ==========================================
// TRANSPORT TYPES ONLY
// ==========================================

/**
 * Transport-related types for TypeScript users.
 * These are just type definitions and don't affect bundle size.
 */
export type {
  // Core transport interfaces
  LogEntry,
  Transport,
  TransportOptions,
  TransportConfig,
  TransportType,
  TransportStats,
  TransportEvents,

  // Configuration types
  BatchingOptions,
  RetryOptions,
  ConnectionState,

  // Transport-specific options
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
// COMPATIBILITY FUNCTIONS
// ==========================================

/**
 * Console enhancement for adding custom log methods.
 * Import individually for better tree-shaking: 'magiclogger/compatibility/console'
 */
export { enhanceConsole } from './compatibility/loggers/EnhancedConsole';

/**
 * Winston-compatible logger creation.
 * Import individually for better tree-shaking: 'magiclogger/compatibility/winston'
 */
export { createWinstonCompatible } from './compatibility/loggers/WinstonCompatibleLogger';

/**
 * Bunyan-compatible logger creation.
 * Import individually for better tree-shaking: 'magiclogger/compatibility/bunyan'
 */
export { createBunyanCompatible } from './compatibility/loggers/BunyanCompatibleLogger';

/**
 * Pino-compatible logger creation.
 * Import individually for better tree-shaking: 'magiclogger/compatibility/pino'
 */
export { createPinoCompatible } from './compatibility/loggers/PinoCompatibleLogger';

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Creates a new logger instance with async by default.
 * This is the modern, high-performance API similar to Pino's approach.
 * For maximum stability and security audits, set async: false.
 *
 * @param {object} [options={}] - Logger options
 * @param {boolean} [options.async=true] - Use async logging by default (recommended)
 * @param {Function} [options.onFlush] - Required for async mode
 * @returns {Logger | AsyncLogger} Logger instance (async by default)
 *
 * @example
 * ```typescript
 * // Modern async-first API (recommended)
 * const logger = createLogger({
 *   id: 'my-app',
 *   tags: ['production'],
 *   onFlush: async (entries) => transport.sendBatch(entries)
 * });
 *
 * // For maximum stability/security audits (synchronous)
 * const syncLogger = createLogger({
 *   async: false,
 *   id: 'my-app'
 * });
 * ```
 */
export function createLogger(
  options: {
    async?: boolean;
    onFlush?: (entries: LogEntry[]) => Promise<void>;
    buffer?: { size?: number; flushInterval?: number; flushSize?: number };
    redactor?: any;
    rateLimiter?: any;
    sampler?: any;
    queueManager?: any;
  } & Partial<LoggerOptions> = {}
): Logger | AsyncLogger {
  const {
    async: useAsync = true,
    onFlush,
    buffer,
    redactor,
    rateLimiter,
    sampler,
    queueManager,
    ...loggerOptions
  } = options;

  if (useAsync) {
    if (!onFlush) {
      // Provide helpful error message
      throw new Error(
        'createLogger(): async mode requires onFlush handler. ' +
          'Either provide onFlush or set async: false for synchronous logging. ' +
          'See docs for transport setup: https://docs.magiclogger.dev/transports'
      );
    }

    return createAsyncLogger({
      buffer: buffer || { size: 8192, flushInterval: 100 },
      onFlush,
      redactor,
      rateLimiter,
      sampler,
      queueManager,
      fallbackToSync: true, // Graceful degradation
      flushOnHighWater: true,
    });
  }

  return new Logger(loggerOptions);
}

/**
 * Creates a synchronous logger for maximum stability and robustness.
 * Recommended for security audits, development, debugging, and when you need
 * guaranteed log delivery without async complexity.
 *
 * @param {Partial<LoggerOptions>} [options={}] - Logger options
 * @returns {Logger} Synchronous logger instance
 *
 * @example
 * ```typescript
 * // For development, debugging, security audits
 * const logger = createSyncLogger({
 *   id: 'my-app',
 *   tags: ['production'],
 *   useColors: true
 * });
 *
 * // Guaranteed immediate output, no async complexity
 * logger.info('Critical security event'); // Appears instantly
 * ```
 */
export function createSyncLogger(options: Partial<LoggerOptions> = {}): Logger {
  return new Logger({ ...options, mode: 'sync' });
}

/**
 * Creates a new AsyncLogger instance with the given options.
 * Convenience function for creating async loggers with operational utilities.
 *
 * @param {AsyncLoggerOptions} options - AsyncLogger options
 * @returns {AsyncLogger} New async logger instance
 *
 * @example
 * ```typescript
 * import { createAsyncLogger, Redactor, RateLimiter } from 'magiclogger';
 *
 * const redactor = new Redactor({ preset: 'strict' });
 * const rateLimiter = new RateLimiter({ max: 1000, window: 60000 });
 *
 * const asyncLogger = createAsyncLogger({
 *   buffer: { size: 8192, flushInterval: 100 },
 *   redactor,
 *   rateLimiter,
 *   onFlush: async (entries) => {
 *     // Process entries with built-in redaction and rate limiting
 *     await transport.sendBatch(entries);
 *   }
 * });
 * ```
 */
export function createAsyncLogger(options: AsyncLoggerOptions): AsyncLogger {
  // Create a simple log entry factory function
  const createLogEntry = (level: LogLevel, message: string, meta?: Record<string, unknown>) => ({
    id: `async-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level,
    message,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    plainMessage: message,
    context: meta,
  });

  return new AsyncLogger(options, createLogEntry);
}

/**
 * Creates a minimal, high-performance AsyncLogger with no operational utilities.
 * Optimized for maximum throughput - only ring buffer and flushing.
 *
 * @param {object} options - Minimal async logger options
 * @returns {AsyncLogger} High-performance async logger
 *
 * @example
 * ```typescript
 * const fastLogger = createFastAsyncLogger({
 *   buffer: { size: 16384, flushInterval: 50, flushSize: 2000 },
 *   onFlush: async (entries) => {
 *     await transport.sendBatchFast(entries);
 *   }
 * });
 *
 * // Minimal overhead - no utilities, no complex AddResult objects
 * fastLogger.info('High throughput logging');
 * ```
 */
export function createFastAsyncLogger(options: {
  buffer?: {
    size?: number;
    flushInterval?: number;
    flushSize?: number;
  };
  onFlush: (entries: LogEntry[]) => void | Promise<void>;
  enableMetrics?: boolean;
}): AsyncLogger {
  const optimizedOptions: AsyncLoggerOptions = {
    buffer: {
      size: options.buffer?.size || 16384,
      flushInterval: options.buffer?.flushInterval || 50,
      flushSize: options.buffer?.flushSize || 2000,
    },
    onFlush: options.onFlush,
    enableMetrics: options.enableMetrics || false,
    // No utilities for maximum performance
    rateLimiter: undefined,
    redactor: undefined,
    sampler: undefined,
    queueManager: undefined,
    fallbackToSync: false,
    flushOnHighWater: true,
  };

  // Optimized log entry factory - minimal allocations
  const createLogEntry = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const now = Date.now();
    return {
      id: `${now}-${Math.random().toString(36).substr(2, 6)}`,
      level,
      message,
      timestamp: new Date(now).toISOString(),
      timestampMs: now,
      plainMessage: message,
      context: meta,
    };
  };

  return new AsyncLogger(optimizedOptions, createLogEntry);
}

/**
 * Creates a logger with performance-aware defaults based on environment.
 * Smart factory that chooses sync/async based on target environment and usage.
 *
 * @param {object} options - Performance-aware logger options
 * @returns {Logger | AsyncLogger} Optimized logger instance
 *
 * @example
 * ```typescript
 * // Auto-selects based on NODE_ENV and TTY
 * const logger = createPerformantLogger({ target: 'auto' });
 *
 * // Explicit performance choice
 * const prodLogger = createPerformantLogger({
 *   target: 'production',  // Uses AsyncLogger
 *   onFlush: async (entries) => await transport.sendBatch(entries)
 * });
 *
 * const devLogger = createPerformantLogger({
 *   target: 'development' // Uses sync Logger
 * });
 * ```
 */
export function createPerformantLogger(
  options: {
    target?: 'auto' | 'development' | 'production';
    mode?: 'sync' | 'async';
    onFlush?: (entries: LogEntry[]) => Promise<void>;
    logger?: Partial<LoggerOptions>;
    async?: Partial<AsyncLoggerOptions>;
  } = {}
): Logger | AsyncLogger {
  const {
    target = 'auto',
    mode,
    onFlush,
    logger: loggerOptions = {},
    async: asyncOptions = {},
  } = options;

  // Non-empty default async flush handler to satisfy lint rules
  const DEFAULT_ON_FLUSH = async (entries: LogEntry[]): Promise<void> => {
    // Touch entries length to avoid empty async function lint error
    if (entries && entries.length > 0) {
      // no-op
    }
  };

  // Explicit mode override
  if (mode === 'sync') {
    return new Logger(loggerOptions);
  }
  if (mode === 'async') {
    return createAsyncLogger({
      onFlush: onFlush || DEFAULT_ON_FLUSH,
      ...asyncOptions,
    });
  }

  // Smart detection based on target
  let useAsync = false;

  if (target === 'production') {
    useAsync = true;
  } else if (target === 'development') {
    useAsync = false;
  } else if (target === 'auto') {
    // Auto-detection logic
    const isProduction = process.env.NODE_ENV === 'production';
    const isInteractive = process.stdout && process.stdout.isTTY;
    const isTesting = process.env.NODE_ENV === 'test' || process.env.CI;

    // Use async in production or non-interactive environments
    // Use sync for development, testing, or interactive shells
    useAsync = isProduction && !isInteractive && !isTesting;
  }

  if (useAsync) {
    return createAsyncLogger({
      onFlush: onFlush || DEFAULT_ON_FLUSH,
      buffer: { size: 1024, flushInterval: 100 },
      fallbackToSync: true,
      ...asyncOptions,
    });
  } else {
    return new Logger({
      mode: 'sync',
      ...loggerOptions,
    });
  }
}

// ==========================================
// ENHANCED ASYNC TYPES EXPORTS
// ==========================================

/**
 * Enhanced async buffer types for explicit backpressure handling
 */
export type { AddResult, BufferStats } from './async/AsyncBuffer';

// ==========================================
// DEFAULT LOGGER SINGLETON
// ==========================================

/**
 * Internal storage for the default logger instance
 * @private
 */
let defaultLogger: Logger | null = null;

/**
 * Gets the default logger instance (singleton pattern).
 * Creates one if it doesn't exist.
 *
 * @returns {Logger} The default logger instance
 *
 * @example
 * ```typescript
 * import { getDefaultLogger } from 'magiclogger';
 * const logger = getDefaultLogger();
 * logger.info('Using default logger');
 * ```
 */
export function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger();
  }
  return defaultLogger;
}

/**
 * Sets a custom default logger instance.
 * Useful for replacing the default logger with a pre-configured one.
 *
 * @param {Logger} logger - Logger instance to set as default
 *
 * @example
 * ```typescript
 * const customLogger = new Logger({ id: 'custom' });
 * setDefaultLogger(customLogger);
 * ```
 */
export function setDefaultLogger(logger: Logger): void {
  defaultLogger = logger;
}

// ==========================================
// DEPRECATED EXPORTS
// ==========================================

/**
 * @deprecated TransportManager should not be imported from main entry.
 * This will be removed in v1.0.0.
 * Import from 'magiclogger/transports/base' if needed.
 */
export { TransportManager } from './transports/base/TransportManager';

/**
 * Type re-export for TransportManager options
 * @deprecated Will be removed in v1.0.0
 */
export type { TransportManagerOptions } from './types/transport';

// ==========================================
// IMPORTANT NOTES
// ==========================================

/**
 * Tree-Shaking Guide:
 *
 * 1. Import transports individually:
 *    ```typescript
 *    import { ConsoleTransport } from 'magiclogger/transports/console';
 *    import { FileTransport } from 'magiclogger/transports/file';
 *    ```
 *
 * 2. Import compatibility layers individually:
 *    ```typescript
 *    import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
 *    import { createPinoCompatible } from 'magiclogger/compatibility/pino';
 *    ```
 *
 * 3. Import core utilities individually (if needed):
 *    ```typescript
 *    import { ContextManager } from 'magiclogger/core/context-manager';
 *    import { TagManager } from 'magiclogger/core/tag-manager';
 *    ```
 *
 * This ensures your bundle only includes the code you actually use.
 */

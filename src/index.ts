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
export { QueueManager } from './extensions/QueueManager';
export type { QueueManagerOptions, QueueStats, DropPolicy } from './extensions/QueueManager';

/**
 * Rate limiting for log throttling and volume control.
 * Tree-shakeable: Only imported when needed.
 */
export { RateLimiter } from './extensions/RateLimiter';
export type { RateLimiterOptions, RateLimitStrategy } from './extensions/RateLimiter';

/**
 * PII and sensitive data redaction system.
 * Tree-shakeable: Only imported when needed.
 */
export { Redactor, createRedactorPreset } from './extensions/Redactor';
export type {
  RedactorOptions,
  RedactionPattern,
  RedactionPreset,
  RedactionStrategy,
} from './extensions/Redactor';

/**
 * Statistical sampling for log volume control.
 * Tree-shakeable: Only imported when needed.
 */
export { Sampler, createSamplerPreset } from './extensions/Sampler';
export type { SamplerOptions, SamplingStrategy } from './extensions/Sampler';

/**
 * Enhanced console functionality for upgrading the global console.
 * Tree-shakeable: Only imported when needed.
 */
export { EnhancedConsole, enhanceConsole } from './utils/EnhancedConsole';
export type { EnhanceConsoleOptions } from './utils/EnhancedConsole';

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
    redactor?:
      | import('./extensions/Redactor').Redactor
      | import('./extensions/Redactor').RedactorOptions;
    rateLimiter?:
      | import('./extensions/RateLimiter').RateLimiter
      | import('./extensions/RateLimiter').RateLimiterOptions;
    sampler?:
      | import('./extensions/Sampler').Sampler
      | import('./extensions/Sampler').SamplerOptions;
    queueManager?:
      | import('./extensions/QueueManager').QueueManager
      | import('./extensions/QueueManager').QueueManagerOptions;
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
 * Creates a high-performance async logger with optional utilities.
 * Fast by default - utilities are opt-in for when you need them.
 *
 * @param {Partial<AsyncLoggerOptions>} options - AsyncLogger options
 * @returns {AsyncLogger} New async logger instance
 *
 * @example
 * ```typescript
 * // Zero config - fast and logs to console!
 * const logger = createAsyncLogger();
 * logger.info('Hello world'); // Goes to console
 *
 * // High throughput with larger buffer
 * const logger = createAsyncLogger({
 *   buffer: { size: 32768, flushInterval: 50 }
 * });
 *
 * // With custom transport (console still works)
 * const logger = createAsyncLogger({
 *   onFlush: async (entries) => {
 *     await writeToFile(entries); // Additional transport
 *   }
 * });
 *
 * // Production with opt-in utilities (only when needed)
 * const logger = createAsyncLogger({
 *   redactor: { preset: 'strict' },        // Optional: Auto-redact PII
 *   rateLimiter: { max: 1000, window: 60000 }, // Optional: Rate limiting
 *   sampler: { rate: 0.1, strategy: 'adaptive' }, // Optional: Sampling
 *   onFlush: async (entries) => {
 *     await sendToElasticsearch(entries);
 *   }
 * });
 * ```
 */
export function createAsyncLogger(options: Partial<AsyncLoggerOptions> = {}): AsyncLogger {
  // Fast default handler - minimal overhead console output
  const defaultOnFlush = async (entries: LogEntry[]) => {
    for (const entry of entries) {
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
    }
  };

  // Performance-optimized defaults
  const defaultBuffer = {
    size: options.buffer?.size ?? 16384, // Larger buffer by default (16K)
    flushInterval: options.buffer?.flushInterval ?? 50, // Fast flush (50ms)
    flushSize: options.buffer?.flushSize ?? 2000, // Larger batch size
  };

  // Merge defaults with user options - utilities are undefined by default (opt-in)
  const finalOptions: AsyncLoggerOptions = {
    buffer: defaultBuffer,
    onFlush: options.onFlush ?? defaultOnFlush,
    enableMetrics: options.enableMetrics ?? false,
    // Utilities are opt-in - only included if explicitly provided
    redactor: options.redactor,
    rateLimiter: options.rateLimiter,
    sampler: options.sampler,
    queueManager: options.queueManager,
    fallbackToSync: options.fallbackToSync ?? false,
    flushOnHighWater: options.flushOnHighWater ?? true,
  };

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

  return new AsyncLogger(finalOptions, createLogEntry);
}

/**
 * @deprecated Use createAsyncLogger() instead - it's fast by default!
 * This function now just calls createAsyncLogger() for backward compatibility.
 */
export function createFastAsyncLogger(
  options: {
    buffer?: {
      size?: number;
      flushInterval?: number;
      flushSize?: number;
    };
    onFlush?: (entries: LogEntry[]) => void | Promise<void>;
    enableMetrics?: boolean;
  } = {}
): AsyncLogger {
  return createAsyncLogger(options);
}

/**
 * Creates a smart logger that auto-detects the best mode for your environment.
 * Defaults to 'auto' which picks sync for dev/TTY, async for production.
 * Always includes console output by default.
 *
 * @param {object} options - Performance-aware logger options
 * @returns {Logger | AsyncLogger} Optimized logger instance
 *
 * @example
 * ```typescript
 * // Auto mode (default) - smart detection
 * const logger = createSmartLogger();
 * // In dev: uses sync Logger for immediate output
 * // In prod: uses AsyncLogger for performance
 *
 * // Explicit target
 * const prodLogger = createSmartLogger({ target: 'production' });
 * const devLogger = createSmartLogger({ target: 'development' });
 *
 * // With custom transport (console still included)
 * const logger = createSmartLogger({
 *   onFlush: async (entries) => {
 *     await sendToDatadog(entries);
 *   }
 * });
 *
 * // Override detection
 * const asyncLogger = createSmartLogger({ mode: 'async' });
 * const syncLogger = createSmartLogger({ mode: 'sync' });
 * ```
 */
export function createSmartLogger(
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

  // Default console flush handler
  const DEFAULT_ON_FLUSH = async (entries: LogEntry[]): Promise<void> => {
    const { ConsoleTransport } = await import('./transports/base/implementations/ConsoleTransport');
    const consoleTransport = new ConsoleTransport({
      name: 'smart-console',
      useColors: true,
    });

    for (const entry of entries) {
      await consoleTransport.log(entry);
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

/**
 * @deprecated Use createSmartLogger instead. Will be removed in v1.0.0.
 */
export const createPerformantLogger = createSmartLogger;

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
 * 2. Import core utilities individually (if needed):
 *    ```typescript
 *    import { ContextManager } from 'magiclogger/core/context-manager';
 *    import { TagManager } from 'magiclogger/core/tag-manager';
 *    ```
 *
 * This ensures your bundle only includes the code you actually use.
 */

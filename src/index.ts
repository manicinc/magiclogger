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
import { Logger, type LoggerOptions } from './Logger';

/**
 * Main Logger class - the primary interface for logging.
 * Tree-shakeable: Only imports what's needed, no default transports.
 */
export { Logger } from './Logger';
export type { LoggerOptions } from './Logger';

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
 * Creates a new Logger instance with the given options.
 * Convenience function for creating loggers.
 *
 * @param {Partial<LoggerOptions>} [options={}] - Logger options
 * @returns {Logger} New logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   id: 'my-app',
 *   tags: ['production']
 * });
 * ```
 */
export function createLogger(options: Partial<LoggerOptions> = {}): Logger {
  return new Logger(options);
}

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

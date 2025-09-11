// File: src/types/index.ts

/**
 * Core types for MagicLogger.
 *
 * This module exports all the type definitions used throughout the library.
 * Types are organized into logical groups for better maintainability.
 *
 * @module types
 */

// Re-export all types from specific type modules
// Avoid re-exporting logger to prevent circular chunking issues.
// Import specific types directly from './logger' where needed.
export * from './transport';
export * from './colors';
export * from './console';
export * from './terminal';
export * from './theme';
export * from './preset';

// Re-export constants that are commonly used with types
export { COLORS } from '../constants/colors';
export { PRESETS } from '../constants/preset';

// Async-specific types
export interface AsyncOptions {
  /**
   * Enable async logging.
   * @default false
   */
  enabled?: boolean;

  /**
   * Buffer configuration.
   */
  buffer?: {
    /**
     * Size of the ring buffer.
     * @default 10000
     */
    size?: number;

    /**
     * Flush interval in milliseconds.
     * @default 100
     */
    flushInterval?: number;

    /**
     * Number of entries to trigger flush.
     * @default 1000
     */
    flushSize?: number;
  };
}

// Context types
export interface ContextMinificationOptions {
  /**
   * Enable context minification.
   * @default false
   */
  enabled?: boolean;

  /**
   * Minification rules mapping long keys to short keys.
   */
  rules?: Record<string, string>;

  /**
   * Compress context data.
   * @default false
   */
  compress?: boolean;
}

// Re-export commonly used types at the top level for convenience
export type { LogLevel, LoggerOptions, ThemeDefinition } from './logger';

export type { ColorName } from './colors';

export type {
  Transport,
  TransportOptions,
  LogEntry,
  NetworkTransportOptions,
  HTTPTransportOptions,
  S3TransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,
  BatchingTransportOptions,
  TransportEvents,
  TransportStats,
} from './transport';

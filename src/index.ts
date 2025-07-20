// File: src/index.ts

/**
 * MagicLogger - Advanced TypeScript Logging Library
 * 
 * A powerful, cross-platform logging library with rich styling, 
 * multiple transports, and extensive customization options.
 * 
 * @packageDocumentation
 */

// Import types needed for convenience functions
import type { LogLevel } from './types';
import type { 
  Transport, 
  FileTransportOptions, 
  HTTPTransportOptions, 
  S3TransportOptions, 
  MongoDBTransportOptions 
} from './types/transport';

import { 
  createConsoleTransport, 
  createFileTransport, 
  createHTTPTransport, 
  createS3Transport, 
  createMongoDBTransport 
} from './transports';

// Core Logger
export { Logger } from './Logger';
export type { ExtendedLoggerOptions } from './Logger';

// Transports
export {
  // Base classes
  Transport,
  BatchingTransport,
  NetworkTransport,
  TransportManager,
  
  // Implementations
  ConsoleTransport,
  FileTransport,
  S3Transport,
  HTTPTransport,
  MongoDBTransport,
  WebSocketTransport,
  StreamTransport,
  
  // Factory functions
  createConsoleTransport,
  createFileTransport,
  createS3Transport,
  createHTTPTransport,
  createMongoDBTransport,
  createWebSocketTransport,
  createStreamTransport,
  createDefaultTransportManager,
  createTransportsFromConfig,
  
  // Utilities
  isBatchingTransport,
  isNetworkTransport,
} from './transports';

// Formatters
export {
  // Implementations
  JSONFormatter,
  PlainTextFormatter,
  CustomFormatter,
  XMLFormatter,
  CSVFormatter,
  
  // Presets
  JSONFormatters,
  PlainTextFormatters,
  Formatters,
  
  // Factory functions
  createFormatter,
  chainFormatters,
  conditionalFormatter,
  transformFormatter,
} from './transports/formatters';

// Transport Types
export type {
  // Core interfaces
  Transport as ITransport,
  TransportOptions,
  TransportEvents,
  TransportStats,
  LogEntry,
  AggregationStats,
  
  // Options
  BatchingOptions,
  NetworkTransportOptions,
  RetryOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  S3TransportOptions,
  HTTPTransportOptions,
  MongoDBTransportOptions,
  WebSocketTransportOptions,
  StreamTransportOptions,
  TransportManagerOptions,
} from './types/transport';

// Formatter Types
export type {
  ICustomFormatter,
  JSONFormatterOptions,
  PlainTextFormatterOptions,
} from './transports/formatters';

// Core Types
export type {
  LoggerOptions,
  LogLevel,
  ColorName,
  StylePreset,
  ThemeDefinition,
} from './types';

// Constants
export { COLORS, ANSI, PRESETS } from './constants';

// Terminal Support
export {
  getTerminalSupport,
  isStyleSupported,
} from './utils/terminal';

// Compatibility Layer
export {
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible,
  BaseCompatibleLogger,
} from './compatibility';

// Default Logger Instance
import { Logger } from './Logger';

/**
 * Default logger instance with console transport.
 * 
 * @example
 * ```typescript
 * import { logger } from 'magiclogger';
 * 
 * logger.info('Application started');
 * logger.error('Something went wrong', { error: err });
 * ```
 */
export const logger = new Logger({
  transports: [
    createConsoleTransport({
      level: process.env.LOG_LEVEL || 'info',
      useColors: true,
    }),
  ],
});

/**
 * Create a logger with common transport configurations.
 * 
 * @param {string} name - Logger name/ID
 * @param {object} options - Configuration options
 * @returns {Logger} Configured logger instance
 * 
 * @example
 * ```typescript
 * const appLogger = createLogger('my-app', {
 *   console: true,
 *   file: './logs/app.log',
 *   level: 'debug'
 * });
 * ```
 */
export function createLogger(
  name: string,
  options: {
    console?: boolean;
    file?: string | FileTransportOptions;
    http?: string | HTTPTransportOptions;
    s3?: S3TransportOptions;
    mongodb?: MongoDBTransportOptions;
    level?: LogLevel;
    tags?: string[];
  } = {}
): Logger {
  const transports: Transport[] = [];

  // Console transport
  if (options.console !== false) {
    transports.push(createConsoleTransport({
      name: `${name}-console`,
      level: options.level || 'info',
    }));
  }

  // File transport
  if (options.file) {
    const fileOptions = typeof options.file === 'string'
      ? { filepath: options.file }
      : options.file;
    
    transports.push(createFileTransport({
      name: `${name}-file`,
      level: options.level || 'info',
      ...fileOptions,
    }));
  }

  // HTTP transport
  if (options.http) {
    const httpOptions = typeof options.http === 'string'
      ? { url: options.http }
      : options.http;
    
    transports.push(createHTTPTransport({
      name: `${name}-http`,
      level: options.level || 'info',
      ...httpOptions,
    }));
  }

  // S3 transport
  if (options.s3) {
    transports.push(createS3Transport({
      level: options.level || 'info',
      ...options.s3,
      name: `${name}-s3`,
    }));
  }

  // MongoDB transport
  if (options.mongodb) {
    transports.push(createMongoDBTransport({
      level: options.level || 'info',
      ...options.mongodb,
      name: `${name}-mongodb`,
    }));
  }

  return new Logger({
    id: name,
    tags: options.tags,
    transports,
  });
}

// Version
export const VERSION = '0.1.0';

// Default export
export default Logger;


// Export core components
export {
  BrowserLogger,
  BrowserStorageManager,
  Colorizer,
  ContextManager,
  FileManager,
  Formatter,
  LoggerBase,
  NodeLogger,
  Printer,
  TagManager
} from './core';

// Export core types
export type {
  ContextManagerOptions,
  SanitizeMode,
  ContextValidationRules,
  ContextValidationResult,
  ContextSnapshot,
  TagManagerOptions,
  TagNormalizationRules,
  TagFilterOptions,
  TagMatchCriteria,
  TagExtractionOptions,
  TagValidationRules,
  TagValidationResult
} from './core';
// ==========================================
// MAIN EXPORTS FOR MAGICLOGGER
// ==========================================

// Core logger and types (imported first for dependency resolution)
import { Logger } from './Logger';
import type { LoggerOptions } from './types/logger';

// Core logger
export { Logger };

// Colors and styling
export { COLORS } from './constants/colors';
export { ANSI } from './constants/ansi';
export type { ColorName } from './types/colors';
export type { StylePreset } from './types/preset';

// Core functionality
export { Colorizer } from './core/Colorizer';
export { TransportManager } from './transports/base/TransportManager';

// Types
export type { LogLevel, LoggerOptions } from './types/logger';

// Transport types (re-export from transport types)
export type {
  LogEntry,
  Transport,
  TransportOptions,
  TransportConfig,
  TransportType,
  TransportStats,
  TransportEvents,
  BatchingOptions,
  RetryOptions,
  TransportManagerOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  BatchingTransportOptions,
  NetworkTransportOptions,
  HTTPTransportOptions,
  StreamTransportOptions,
  WebSocketTransportOptions,
  MongoDBTransportOptions,
  S3TransportOptions,
  ConnectionState,
} from './types/transport';

// Theme and preset exports  
export { PRESETS } from './constants/preset';
export type { ThemeDefinition } from './types/theme';

// Utility functions
export function createLogger(options: Partial<LoggerOptions> = {}): Logger {
  return new Logger(options);
}

// Default logger instance
let defaultLogger: Logger | null = null;

export function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger();
  }
  return defaultLogger;
}

export function setDefaultLogger(logger: Logger): void {
  defaultLogger = logger;
}
/**
 * Compatibility Layer Index
 *
 * Exports all compatibility adapters and base classes for easy access
 */

// Base compatibility layer
export { BaseCompatibleLogger } from './loggers/BaseCompatibleLogger';
export type { LogCompatibilityOptions } from './loggers/BaseCompatibleLogger';

// Console enhancement
export { enhanceConsole } from './loggers/EnhancedConsole';
export type {
  EnhancedConsole,
  EnhanceConsoleOptions,
} from './loggers/EnhancedConsole';

// Winston compatibility
export { createWinstonCompatible } from './loggers/WinstonCompatibleLogger';
export type { WinstonCompatibleLogger, WinstonCompatibleOptions } from './loggers/WinstonCompatibleLogger';

// Bunyan compatibility
export { createBunyanCompatible } from './loggers/BunyanCompatibleLogger';
export type { BunyanCompatibleLogger, BunyanCompatibleOptions } from './loggers/BunyanCompatibleLogger';

// Pino compatibility
export { createPinoCompatible } from './loggers/PinoCompatibleLogger';
export type { PinoCompatibleLogger, PinoCompatibleOptions } from './loggers/PinoCompatibleLogger';

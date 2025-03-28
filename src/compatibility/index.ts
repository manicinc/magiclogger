/**
 * Compatibility Layer Index
 *
 * Exports all compatibility adapters and base classes for easy access
 */

// Base compatibility layer
export { BaseCompatibleLogger } from './BaseCompatibleLogger';
export type { LogCompatibilityOptions } from './BaseCompatibleLogger';

// Console enhancement
export { enhanceConsole } from './EnhancedConsole';
export type {
  EnhancedConsole,
  EnhancedConsoleMethods,
  EnhanceConsoleOptions,
} from './EnhancedConsole';

// Winston compatibility
export { createWinstonCompatible } from './Winston';
export type { WinstonCompatibleLogger, WinstonCompatibleOptions } from './Winston';

// Bunyan compatibility
export { createBunyanCompatible } from './Bunyan';
export type { BunyanCompatibleLogger, BunyanCompatibleOptions } from './Bunyan';

// Pino compatibility
export { createPinoCompatible } from './Pino';
export type { PinoCompatibleLogger, PinoCompatibleOptions } from './Pino';

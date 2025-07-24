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
  EnhanceConsoleOptions,
} from './EnhancedConsole';

// Winston compatibility
export { createWinstonCompatible } from './WinstonCompatibleLogger';
export type { WinstonCompatibleLogger, WinstonCompatibleOptions } from './WinstonCompatibleLogger';

// Bunyan compatibility
export { createBunyanCompatible } from './BunyanCompatibleLogger';
export type { BunyanCompatibleLogger, BunyanCompatibleOptions } from './BunyanCompatibleLogger';

// Pino compatibility
export { createPinoCompatible } from './PinoCompatibleLogger';
export type { PinoCompatibleLogger, PinoCompatibleOptions } from './PinoCompatibleLogger';

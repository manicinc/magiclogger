// File: src/compatibility/pino.ts

/**
 * Pino Compatibility Module Entry Point
 * 
 * This module provides a Pino-compatible API for MagicLogger.
 * Import this module directly for optimal tree-shaking:
 * 
 * @example
 * ```typescript
 * // ✅ Optimal - Only imports Pino compatibility
 * import { createPinoCompatible } from 'magiclogger/compatibility/pino';
 * 
 * // ❌ Avoid - Imports all compatibility modules
 * import { createPinoCompatible } from 'magiclogger/compatibility';
 * ```
 * 
 * @module compatibility/pino
 */

// Re-export everything from the Pino implementation
export { 
  PinoCompatibleLogger,
  createPinoCompatible,
  type PinoCompatibleOptions 
} from './loggers/PinoCompatibleLogger';

// Re-export base types that Pino compatibility might need
export type { 
  LogCompatibilityOptions 
} from './loggers/BaseCompatibleLogger';

// Re-export static properties for Pino compatibility
export const levels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: Infinity,
} as const;

export const levelNames = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
} as const;
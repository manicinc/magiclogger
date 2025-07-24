// File: src/compatibility/winston.ts

/**
 * Winston Compatibility Module Entry Point
 * 
 * This module provides a Winston-compatible API for MagicLogger.
 * Import this module directly for optimal tree-shaking:
 * 
 * @example
 * ```typescript
 * // ✅ Optimal - Only imports Winston compatibility
 * import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
 * 
 * // ❌ Avoid - Imports all compatibility modules
 * import { createWinstonCompatible } from 'magiclogger/compatibility';
 * ```
 * 
 * @module compatibility/winston
 */

// Re-export everything from the Winston implementation
export { 
  WinstonCompatibleLogger,
  createWinstonCompatible,
  type WinstonCompatibleOptions 
} from './loggers/WinstonCompatibleLogger';

// Re-export base types that Winston compatibility might need
export type { 
  LogCompatibilityOptions 
} from './loggers/BaseCompatibleLogger';
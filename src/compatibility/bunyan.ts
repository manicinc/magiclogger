// File: src/compatibility/bunyan.ts

/**
 * Bunyan Compatibility Module Entry Point
 *
 * This module provides a Bunyan-compatible API for MagicLogger.
 * Import this module directly for optimal tree-shaking:
 *
 * @example
 * ```typescript
 * // ✅ Optimal - Only imports Bunyan compatibility
 * import { createBunyanCompatible } from 'magiclogger/compatibility/bunyan';
 *
 * // ❌ Avoid - Imports all compatibility modules
 * import { createBunyanCompatible } from 'magiclogger/compatibility';
 * ```
 *
 * @module compatibility/bunyan
 */

// Re-export everything from the Bunyan implementation
export {
  BunyanCompatibleLogger,
  createBunyanCompatible,
  type BunyanCompatibleOptions,
} from './loggers/BunyanCompatibleLogger';

// Re-export base types that Bunyan compatibility might need
export type { LogCompatibilityOptions } from './loggers/BaseCompatibleLogger';

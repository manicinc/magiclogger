// File: src/compatibility/console.ts

/**
 * Enhanced Console Module Entry Point
 * 
 * This module provides an enhanced console API with MagicLogger features.
 * Import this module directly for optimal tree-shaking:
 * 
 * @example
 * ```typescript
 * // ✅ Optimal - Only imports console enhancement
 * import { enhanceConsole } from 'magiclogger/compatibility/console';
 * 
 * // ❌ Avoid - Imports all compatibility modules
 * import { enhanceConsole } from 'magiclogger/compatibility';
 * ```
 * 
 * @module compatibility/console
 */

// Re-export everything from the EnhancedConsole implementation
export { 
  EnhancedConsole,
  enhanceConsole,
  type EnhanceConsoleOptions
} from './EnhancedConsole';
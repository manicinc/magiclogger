// File: src/core/index.ts

/**
 * Core Module Exports - TREE-SHAKING WARNING
 *
 * ⚠️ This file exports all core components which may prevent tree-shaking.
 * For optimal bundle size, import core modules directly:
 *
 * @example
 * ```typescript
 * // ❌ AVOID - Imports all core modules
 * import { Colorizer, ContextManager } from 'magiclogger/core';
 *
 * // ✅ RECOMMENDED - Import specific modules
 * import { Colorizer } from 'magiclogger/core/colorizer';
 * import { ContextManager } from 'magiclogger/core/context-manager';
 * ```
 *
 * @module core
 */

// Export all core components
// NOTE: These exports are kept for backward compatibility
// but importing from here will bundle all core modules

export { BrowserLogger } from './BrowserLogger';
export { BrowserStorageManager } from './BrowserStorageManager';
export { Colorizer } from './Colorizer';
export { ContextManager } from './ContextManager';
export { FileManager } from './FileManager';
export { Formatter } from './Formatter';
export { LoggerBase } from './LoggerBase';
export { NodeLogger } from './NodeLogger';
export { Printer } from './Printer';
export { TagManager } from './TagManager';

// Export types from ContextManager
export type {
  ContextManagerOptions,
  SanitizeMode,
  ContextValidationRules,
  ContextValidationResult,
  ContextSnapshot,
} from './ContextManager';

// Export types from TagManager
export type {
  TagManagerOptions,
  TagNormalizationRules,
  TagFilterOptions,
  TagMatchCriteria,
  TagExtractionOptions,
  TagValidationRules,
  TagValidationResult,
} from './TagManager';

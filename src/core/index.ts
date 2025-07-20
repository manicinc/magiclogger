// File: src/core/index.ts

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

// Export types
export type {
  ContextManagerOptions,
  SanitizeMode,
  ContextValidationRules,
  ContextValidationResult,
  ContextSnapshot
} from './ContextManager';

export type {
  TagManagerOptions,
  TagNormalizationRules,
  TagFilterOptions,
  TagMatchCriteria,
  TagExtractionOptions,
  TagValidationRules,
  TagValidationResult
} from './TagManager';
export * from './console';
export * from './terminal';
export * from './preset';
export * from './colors';
export type { LoggerOptions, LogLevel, IdGenerator } from './logger';
export type { ThemeDefinition, ThemeMap, ColorStyleMap } from './theme';
export type { Transport, LogEntry, TransportOptions } from './transport';

// Export context and tag manager types
export type {
  ContextManager,
  ContextManagerOptions,
  ContextValidationRules,
  ContextValidationResult,
  ContextSnapshot
} from '../core/ContextManager';

export type {
  TagManager,
  TagManagerOptions,
  TagNormalizationRules,
  TagFilterOptions,
  TagMatchCriteria,
  TagValidationRules,
  TagValidationResult
} from '../core/TagManager';

// Re-export constants for test compatibility
export { COLORS } from '../constants/colors';
export { PRESETS } from '../constants/preset';

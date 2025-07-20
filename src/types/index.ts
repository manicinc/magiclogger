export * from './console';
export * from './terminal';
export * from './preset';
export * from './colors';
export type { LoggerOptions, LogLevel, IdGenerator } from './logger';
export type { ThemeDefinition, ThemeMap, ColorStyleMap } from './theme';
export type { Transport, LogEntry, TransportOptions } from './transport';

// Re-export constants for test compatibility
export { COLORS } from '../constants/colors';
export { PRESETS } from '../constants/preset';

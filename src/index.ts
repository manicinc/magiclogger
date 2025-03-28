// Core Logger
export { Logger } from './Logger';

export { NodeLogger } from './core/NodeLogger';
export { BrowserLogger } from './core/BrowserLogger';

// Compatibility Layers
export { enhanceConsole } from './compatibility/EnhancedConsole';
export { createWinstonCompatible } from './compatibility/Winston';
export { createBunyanCompatible } from './compatibility/Bunyan';
export { createPinoCompatible } from './compatibility/Pino';

// Types
export type { ColorName } from './types';
export type { StylePreset } from './types';
export type { LogLevel } from './types';
export type { LoggerOptions } from './types';

// Interfaces and Utility Exports
export type {
  EnhancedConsole,
  EnhancedConsoleMethods,
  EnhanceConsoleOptions,
} from './compatibility/EnhancedConsole';
export type { WinstonCompatibleLogger, WinstonCompatibleOptions } from './compatibility/Winston';
export type { BunyanCompatibleLogger, BunyanCompatibleOptions } from './compatibility/Bunyan';
export type { PinoCompatibleLogger, PinoCompatibleOptions } from './compatibility/Pino';
export { BaseCompatibleLogger } from './compatibility/BaseCompatibleLogger';
export type { LogCompatibilityOptions } from './compatibility/BaseCompatibleLogger';

// Constants
export { COLORS, PRESETS } from './constants';

// Utility Functions
export { isStyleSupported, getFallbackStyle, getTerminalSupport } from './utils/terminal';

// Main Logger class
export { Logger } from './Logger';

// Value exports
export {
  COLORS,
  PRESETS,
} from './types';

// Type-only exports
export type {
  ColorName,
  StylePreset,
  LoggerOptions,
} from './types';

// Compatibility layers
export {
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible,
} from './compatibility';

import type { ColorName } from './colors';
import type { StylePreset } from './preset';

// Re-export ColorName so consumers can import from this module
export type { ColorName } from './colors';

/**
 * A theme definition maps log levels or style presets to arrays of color/style names.
 * Keys are StylePreset strings such as 'info', 'error', 'success', or custom presets.
 *
 * @example
 * {
 *   info: ['cyan', 'bold'],
 *   error: ['brightRed', 'bold'],
 *   header: ['brightWhite', 'bgBlue', 'bold']
 * }
 */
export type ThemeDefinition = Partial<Record<StylePreset | string, ColorName[]>>;

/**
 * A map of theme names to their corresponding theme definitions.
 * Used by ThemeManager to load and switch between preconfigured themes.
 *
 * @example
 * {
 *   default: { info: ['blue'], success: ['green', 'bold'] },
 *   dark:    { info: ['cyan'], error: ['brightRed'] }
 * }
 */
export type ThemeMap = Record<string, ThemeDefinition>;

/**
 * A map that overrides specific color names with CSS equivalents.
 * Used for browser console logging with CSS styles.
 *
 * @example
 * {
 *   red: 'color: red',
 *   bold: 'font-weight: bold'
 * }
 */
export type ColorStyleMap = Partial<Record<ColorName, string>>;

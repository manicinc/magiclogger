import type { ColorName } from './colors';
import type { StylePreset } from './preset';

// Re-export ColorName so consumers can import from this module
export type { ColorName } from './colors';

/**
 * A theme definition maps log levels, style presets, and tags to arrays of color/style names.
 * Keys are StylePreset strings such as 'info', 'error', 'success', or custom presets.
 * Tags can have associated styles that are automatically applied.
 *
 * @example
 * {
 *   info: ['cyan', 'bold'],
 *   error: ['brightRed', 'bold'],
 *   header: ['brightWhite', 'bgBlue', 'bold'],
 *   tags: {
 *     api: ['cyan', 'bold'],
 *     database: ['yellow'],
 *     critical: ['white', 'bgRed', 'bold']
 *   }
 * }
 */
export type ThemeDefinition = Partial<Record<StylePreset | string, ColorName[]>> & {
  /**
   * Tag-specific styles that are automatically applied when tags are used.
   * Maps tag names to arrays of color/style names.
   */
  tags?: Record<string, ColorName[]>;
};

/**
 * A map of theme names to their corresponding theme definitions.
 * Used by ThemeManager to load and switch between preconfigured themes.
 *
 * @example
 * {
 *   default: { 
 *     info: ['blue'], 
 *     success: ['green', 'bold'],
 *     tags: { api: ['cyan'], error: ['red', 'bold'] }
 *   },
 *   dark: { 
 *     info: ['cyan'], 
 *     error: ['brightRed'],
 *     tags: { warning: ['yellow'], debug: ['gray'] }
 *   }
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

/**
 * Theme configuration options for creating or extending themes.
 */
export interface ThemeConfig {
  /**
   * Base theme to extend from.
   */
  base?: string | ThemeDefinition;
  
  /**
   * Override specific styles.
   */
  overrides?: Partial<Record<StylePreset | string, ColorName[]>>;
  
  /**
   * Tag-specific style overrides.
   */
  tagOverrides?: Record<string, ColorName[]>;
  
  /**
   * Whether to merge with base theme or replace.
   * @default true
   */
  merge?: boolean;
}
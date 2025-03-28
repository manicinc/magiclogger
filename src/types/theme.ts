import type { ColorName } from './colors';
import type { StylePreset } from './preset';

/**
 * Represents a single style preset mapping
 */
export type ThemeDefinition = Partial<Record<StylePreset, ColorName[]>>;

/**
 * Represents a map of theme names to their definitions
 */
export type ThemeMap = Record<string, ThemeDefinition>;

/**
 * Optional color override map per theme
 */
export type ColorStyleMap = Partial<Record<ColorName, string>>;

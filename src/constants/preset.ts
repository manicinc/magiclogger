// File: src/constants/preset.ts

import type { StylePreset } from '../types/preset';
import type { ColorName } from '../types/colors';
import { getTheme } from '../theme';

/**
 * Default style presets mapping preset names to color/style arrays.
 * This is the default theme preset configuration.
 */
export const PRESETS = {
  info: ['cyan', 'bold'] as ColorName[],
  success: ['green', 'bold'] as ColorName[],
  warning: ['yellow', 'bold'] as ColorName[],
  error: ['brightRed', 'bold'] as ColorName[],
  debug: ['gray', 'italic'] as ColorName[],
  important: ['magenta', 'bold', 'underline'] as ColorName[],
  highlight: ['brightYellow', 'bold'] as ColorName[],
  muted: ['dim'] as ColorName[],
  special: ['brightCyan', 'bold'] as ColorName[],
  code: ['brightGreen'] as ColorName[],
  header: ['brightWhite', 'bgBlue', 'bold'] as ColorName[],
};

/**
 * Get preset colors from the current theme.
 *
 * @param {StylePreset | string} preset - Preset name
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {ColorName[]} Colors for the preset
 */
export function getPresetColors(preset: StylePreset | string, themeName = 'default'): ColorName[] {
  const theme = getTheme(themeName);
  if (!theme) {
    return ['white'];
  }
  // Narrow and avoid union with Record by using a local typed alias
  const t = theme as Record<string, ColorName[]>;
  const fromKey = t[preset as string];
  return (fromKey && fromKey.length ? fromKey : undefined) ?? ['white'];
}

/**
 * Get all available preset names from current theme.
 *
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {string[]} Preset names
 */
export function getPresetNames(themeName = 'default'): string[] {
  const theme = getTheme(themeName);
  if (!theme) {
    return [];
  }
  return Object.keys(theme);
}

/**
 * Check if a preset exists in the current theme.
 *
 * @param {string} name - Preset name
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {boolean} Whether preset exists
 */
export function hasPreset(name: string, themeName = 'default'): boolean {
  const theme = getTheme(themeName);
  if (!theme) {
    return false;
  }
  return name in theme;
}

/**
 * Get preset from the current theme.
 *
 * @param {string} name - Preset name
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {ColorName[] | undefined} Preset colors
 */
export function getPreset(name: string, themeName = 'default'): ColorName[] | undefined {
  const theme = getTheme(themeName);
  if (!theme) {
    return undefined;
  }
  const t = theme as Record<string, ColorName[]>;
  return t[name];
}

/**
 * Core presets that map to theme entries.
 * This provides backward compatibility with the PRESETS constant.
 *
 * @const PRESETS_COMPAT - For compatibility with existing code
 */
export const PRESETS_COMPAT = PRESETS;

/**
 * Extended presets for additional use cases.
 * These can be added to themes.json as needed.
 *
 * @const EXTENDED_PRESETS
 */
export const EXTENDED_PRESETS: Record<string, ColorName[]> = {
  // Status presets
  pending: ['yellow', 'dim'],
  processing: ['cyan'],
  complete: ['green', 'bold'],
  failed: ['red', 'bold'],
  cancelled: ['gray', 'strikethrough'],

  // Category presets
  database: ['blue', 'bold'],
  network: ['magenta'],
  security: ['red', 'underline'],
  performance: ['yellow'],
  system: ['cyan', 'dim'],

  // Action presets
  create: ['green'],
  update: ['yellow'],
  delete: ['red'],
  read: ['blue'],

  // Notification presets
  alert: ['red', 'bold', 'bgYellow'],
  notice: ['blue', 'bgWhite'],
  tip: ['green', 'italic'],

  // Development presets
  trace: ['gray', 'dim'],
  verbose: ['gray'],
  silly: ['magenta', 'dim'],
  fatal: ['white', 'bgRed', 'bold'],
};

/**
 * Get all presets from theme and extended presets.
 *
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {Record<string, ColorName[]>} All presets
 */
export function getAllPresets(themeName = 'default'): Record<string, ColorName[]> {
  const theme = getTheme(themeName);
  const allPresets: Record<string, ColorName[]> = {};

  if (theme) {
    // Add theme presets (exclude non-array entries like `tags`)
    const keys = Object.keys(theme) as string[];
    for (const key of keys) {
      const val: unknown = (theme as Record<string, unknown>)[key];
      if (Array.isArray(val)) {
        allPresets[key] = val as ColorName[];
      }
    }
  }

  // Add extended presets
  for (const [key, value] of Object.entries(EXTENDED_PRESETS)) {
    allPresets[key] = value;
  }

  return allPresets;
}

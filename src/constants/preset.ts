// File: src/constants/presets.ts

import type { StylePreset, ColorName } from '../types';
import { getTheme } from '../theme';

/**
 * Get preset colors from the current theme.
 * 
 * @param {StylePreset | string} preset - Preset name
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {ColorName[]} Colors for the preset
 */
export function getPresetColors(preset: StylePreset | string, themeName = 'default'): ColorName[] {
  const theme = getTheme(themeName);
  return theme[preset] || theme[preset as StylePreset] || ['white'];
}

/**
 * Get all available preset names from current theme.
 * 
 * @param {string} themeName - Theme name (defaults to 'default')
 * @returns {string[]} Preset names
 */
export function getPresetNames(themeName = 'default'): string[] {
  const theme = getTheme(themeName);
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
  return theme[name];
}

/**
 * Core presets that map to theme entries.
 * This provides backward compatibility with the PRESETS constant.
 * 
 * @const PRESETS
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
} as const;

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
  
  // Add theme presets
  for (const [key, value] of Object.entries(theme)) {
    if (value) {
      allPresets[key] = value;
    }
  }
  
  // Add extended presets
  for (const [key, value] of Object.entries(EXTENDED_PRESETS)) {
    allPresets[key] = value;
  }
  
  return allPresets;
}
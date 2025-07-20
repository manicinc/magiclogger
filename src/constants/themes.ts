// File: src/constants/themes.ts

import type { ColorName } from '../types';

/**
 * Default theme definition with comprehensive styling for all log levels and UI elements.
 */
export const DEFAULT_THEME: Record<string, ColorName[]> = {
  // Log levels
  info: ['cyan', 'bold'],
  success: ['green', 'bold'],
  warning: ['yellow', 'bold'],
  error: ['brightRed', 'bold'],
  debug: ['gray', 'italic'],
  
  // UI elements
  header: ['brightWhite', 'bgBlue', 'bold'],
  link: ['brightCyan', 'underline'],
  separator: ['gray'],
  
  // Data display
  key: ['cyan'],
  value: ['white'],
  number: ['yellow'],
  string: ['green'],
  boolean: ['magenta'],
  null: ['gray', 'italic'],
  
  // Status
  active: ['green', 'bold'],
  inactive: ['gray', 'dim'],
  pending: ['yellow'],
  complete: ['green'],
  failed: ['red'],
  
  // Special
  important: ['magenta', 'bold', 'underline'],
  highlight: ['brightYellow', 'bold'],
  muted: ['dim'],
  special: ['brightCyan', 'bold'],
  code: ['brightGreen'],
};

/**
 * Dark theme variant
 */
export const DARK_THEME: Record<string, ColorName[]> = {
  ...DEFAULT_THEME,
  info: ['brightCyan'],
  warn: ['brightYellow'],
  error: ['brightRed'],
  debug: ['gray'],
  success: ['brightGreen'],
};

/**
 * Light theme variant
 */
export const LIGHT_THEME: Record<string, ColorName[]> = {
  ...DEFAULT_THEME,
  info: ['blue'],
  warn: ['yellow'],
  error: ['red'],
  debug: ['gray'],
  success: ['green'],
};

/**
 * Minimal theme variant
 */
export const MINIMAL_THEME: Record<string, ColorName[]> = {
  ...DEFAULT_THEME,
  info: ['white'],
  warn: ['white'],
  error: ['white'],
  debug: ['white'],
  success: ['white'],
};
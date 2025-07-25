// File: src/theme.ts

/**
 * Theme Module Entry Point
 *
 * This module exports theme-related functions for optimal tree-shaking.
 * Import this module directly when working with themes.
 *
 * @module theme
 */

export { getTheme, listThemes, loadThemes } from './theme/index';
export type { ThemeDefinition } from './types/theme';

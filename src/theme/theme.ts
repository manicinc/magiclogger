/**
 * Theme Entry Point
 *
 * This module provides a direct import for theme functionality.
 * For optimal tree-shaking, import from this module when you only need theme utilities.
 *
 * @module theme
 */

// Re-export theme functionality
export { ThemeManager, DEFAULT_THEME } from './ThemeManager';
export { getTheme, listThemes, loadThemes } from './index';
export type { ThemeDefinition } from '../types/theme';

// Import for internal use
import { ThemeManager } from './ThemeManager';

// Factory function for convenience
export function createThemeManager() {
  return new ThemeManager();
}

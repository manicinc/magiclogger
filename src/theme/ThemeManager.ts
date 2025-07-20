// File: src/constants/themes.ts

import type { ThemeDefinition } from '../types';
import { getTheme as getThemeFromFile, listThemes as listThemesFromFile, loadThemes } from '../theme';

/**
 * Default theme definition.
 * This is used as a fallback if theme loading fails.
 * 
 * @const DEFAULT_THEME
 */
export const DEFAULT_THEME: ThemeDefinition = {
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
 * Theme registry cache.
 * @private
 */
let themesCache: Record<string, ThemeDefinition> | null = null;

/**
 * Load themes from file system.
 * @private
 */
function ensureThemesLoaded(): void {
  if (!themesCache) {
    try {
      themesCache = loadThemes();
    } catch (error) {
      console.warn('[Themes] Failed to load themes from file:', error);
      themesCache = { default: DEFAULT_THEME };
    }
  }
}

/**
 * Get theme by name.
 * 
 * @param {string} name - Theme name
 * @returns {ThemeDefinition | undefined} Theme definition
 */
export function getTheme(name: string): ThemeDefinition | undefined {
  ensureThemesLoaded();
  
  try {
    return getThemeFromFile(name);
  } catch {
    return themesCache?.[name] || (name === 'default' ? DEFAULT_THEME : undefined);
  }
}

/**
 * Register a custom theme.
 * 
 * @param {string} name - Theme name
 * @param {ThemeDefinition} theme - Theme definition
 */
export function registerTheme(name: string, theme: ThemeDefinition): void {
  ensureThemesLoaded();
  if (themesCache) {
    themesCache[name] = theme;
  }
}

/**
 * Get all theme names.
 * 
 * @returns {string[]} Theme names
 */
export function getThemeNames(): string[] {
  try {
    return listThemesFromFile();
  } catch {
    ensureThemesLoaded();
    return Object.keys(themesCache || { default: DEFAULT_THEME });
  }
}

/**
 * Pre-defined theme constants for easy access.
 * These map to the themes in themes.json.
 */
export const THEMES = {
  get DEFAULT() { return getTheme('default') || DEFAULT_THEME; },
  get DARK() { return getTheme('dark') || DEFAULT_THEME; },
  get SOLARIZED() { return getTheme('solarized') || DEFAULT_THEME; },
  get MATRIX() { return getTheme('matrix') || DEFAULT_THEME; },
  // cSpell:disable-next-line
  get VAPORWAVE() { return getTheme('vaporwave') || DEFAULT_THEME; },
  get CYBERPUNK() { return getTheme('cyberpunk') || DEFAULT_THEME; },
  get MIDNIGHT() { return getTheme('midnight') || DEFAULT_THEME; },
  get NEON() { return getTheme('neon') || DEFAULT_THEME; },
};

/**
 * Theme names enumeration.
 * 
 * @const THEME_NAMES
 */
export const THEME_NAMES = {
  default: 'default',
  dark: 'dark',
  solarized: 'solarized',
  matrix: 'matrix',
  // cSpell:disable-next-line
  vaporwave: 'vaporwave',
  cyberpunk: 'cyberpunk',
  midnight: 'midnight',
  neon: 'neon',
} as const;
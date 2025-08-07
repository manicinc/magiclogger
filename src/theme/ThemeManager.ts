// File: src/theme/ThemeManager.ts

import type { ThemeDefinition, ColorName } from '../types';
import { getTheme as getThemeFromFile, listThemes as listThemesFromFile, loadThemes } from './index';
import { COLORS } from '../constants';

/**
 * Default theme definition.
 * This is used as a fallback if theme loading fails.
 * 
 * @const DEFAULT_THEME
 */
export const DEFAULT_THEME: ThemeDefinition = {
  // Log levels
  info: ['cyan'],
  success: ['green'],
  warning: ['yellow'],
  error: ['red', 'bold'],
  debug: ['gray'],
  
  // UI elements
  header: ['brightWhite', 'bold'],
  footer: ['gray'],
  separator: ['blue'],
  highlight: ['brightYellow'],
  muted: ['gray', 'dim'],
};

/**
 * CSS style mappings for web environments
 */
const CSS_STYLE_MAP: Record<string, string> = {
  // Colors
  black: 'color: black',
  red: 'color: red',
  green: 'color: green',
  yellow: 'color: yellow',
  blue: 'color: blue',
  magenta: 'color: magenta',
  cyan: 'color: cyan',
  white: 'color: white',
  gray: 'color: gray',
  grey: 'color: gray',
  brightRed: 'color: red',
  brightGreen: 'color: green',
  brightYellow: 'color: yellow',
  brightBlue: 'color: blue',
  brightMagenta: 'color: magenta',
  brightCyan: 'color: cyan',
  brightWhite: 'color: white',
  
  // Text styles
  bold: 'font-weight: bold',
  dim: 'opacity: 0.7',
  italic: 'font-style: italic',
  underline: 'text-decoration: underline',
  
  // Background colors
  bgBlack: 'background-color: black',
  bgRed: 'background-color: red',
  bgGreen: 'background-color: green',
  bgYellow: 'background-color: yellow',
  bgBlue: 'background-color: blue',
  bgMagenta: 'background-color: magenta',
  bgCyan: 'background-color: cyan',
  bgWhite: 'background-color: white'
};

/**
 * ThemeManager handles theme loading, application, and CSS generation.
 * Provides both terminal ANSI and web CSS styling capabilities.
 */
export class ThemeManager {
  private currentTheme: ThemeDefinition = DEFAULT_THEME;
  private availableThemes: Record<string, ThemeDefinition> = {};

  constructor() {
    this.loadAvailableThemes();
    // Prefer loaded default theme as current theme when available
    if (this.availableThemes && this.availableThemes.default) {
      this.currentTheme = this.availableThemes.default;
    }
  }

  /**
   * Get all available themes
   */
  get themes(): Record<string, ThemeDefinition> {
    return this.availableThemes;
  }

  /**
   * Allow tests/consumers to override themes
   */
  set themes(value: Record<string, ThemeDefinition>) {
    this.availableThemes = value || {};
    // If a default theme exists in the provided set, use it; otherwise clear current theme
    if (this.availableThemes.default) {
      this.currentTheme = this.availableThemes.default;
    } else {
      this.currentTheme = {} as ThemeDefinition;
    }
  }

  /**
   * Load available themes from the file system
   */
  private loadAvailableThemes(): void {
    try {
      this.availableThemes = loadThemes();
      // If no themes were loaded, use default theme
      if (Object.keys(this.availableThemes).length === 0) {
        this.availableThemes = { default: DEFAULT_THEME };
      }
    } catch {
      // Fallback to default theme if loading fails
      this.availableThemes = { default: DEFAULT_THEME };
    }
  }

  /**
   * Get a theme by name
   */
  getTheme(name: string): ThemeDefinition | undefined {
    if (this.availableThemes[name]) return this.availableThemes[name];
    const fromFile = getThemeFromFile(name);
    if (fromFile) return fromFile;
    // Fallback to default theme when available
    if (this.availableThemes.default) return this.availableThemes.default;
    return {} as ThemeDefinition;
  }

  /**
   * List available theme names
   */
  listThemes(): string[] {
    const fileThemes = listThemesFromFile();
    const loadedThemes = Object.keys(this.availableThemes);
    return [...new Set([...fileThemes, ...loadedThemes])];
  }

  /**
   * Apply styles to a message using ANSI colors
   */
  applyStyles(styles: ColorName[], message: string): string {
    const msg = message as unknown as string;
    if (!Array.isArray(styles) || styles.length === 0) {
      return msg;
    }

    // Build a single ANSI prefix in provided order
    const codes: string[] = [];
    for (const style of styles) {
      const code = (COLORS as Record<string, string>)[style as string];
      if (typeof code === 'string' && code.length > 0) {
        codes.push(code);
      }
    }

    const prefix = codes.join('');
    const reset = (COLORS as Record<string, string>).reset || '\x1b[0m';
    return `${prefix}${msg}${reset}`;
  }

  /**
   * Get CSS styles for a given level
   */
  getCssStyles(level: string): string {
    if (typeof level !== 'string' || !level) return '';

    // Prefer current theme
    let styles = (this.currentTheme && (this.currentTheme as Record<string, ColorName[]>)[level]) as
      | ColorName[]
      | undefined;

    // Fallback to default theme if not found
    if (!styles && this.availableThemes && this.availableThemes.default) {
      styles = this.availableThemes.default[level];
    }

    // Do not fallback to other non-default themes when default is missing
    if (!Array.isArray(styles)) return '';

    const mapped = styles.map(s => CSS_STYLE_MAP[s as string] || '');
    if (mapped.every(v => v === '')) {
      return '; ';
    }
    return mapped.join('; ').trim();
  }

  /**
   * Set the current theme
   */
  setTheme(theme: ThemeDefinition | string): void {
    if (typeof theme === 'string') {
      const loadedTheme = this.getTheme(theme);
      if (loadedTheme) {
        this.currentTheme = loadedTheme;
      }
    } else {
      this.currentTheme = theme;
    }
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): ThemeDefinition {
    return this.currentTheme;
  }

  /**
   * Get CSS style mapping
   */
  get cssStyleMap(): Record<string, string> {
    return CSS_STYLE_MAP;
  }
}
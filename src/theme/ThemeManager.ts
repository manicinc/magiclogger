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
  info: ['cyan', 'bold'],
  success: ['green', 'bold'],
  warning: ['yellow', 'bold'],
  error: ['brightRed', 'bold'],
  debug: ['gray', 'italic'],
  
  // UI elements
  header: ['brightWhite', 'bgGreen', 'bold'],
  footer: ['gray'],
  separator: ['blue'],
  highlight: ['brightYellow'],
  muted: ['gray', 'dim'],
  
  // Status indicators
  ok: ['green'],
  fail: ['red'],
  skip: ['yellow']
};

/**
 * CSS style mappings for web environments
 */
const CSS_STYLE_MAP: Record<string, string> = {
  // Colors
  black: 'color: #000000',
  red: 'color: #aa0000',
  green: 'color: #00aa00',
  yellow: 'color: #aa5500',
  blue: 'color: #0000aa',
  magenta: 'color: #aa00aa',
  cyan: 'color: #00aaaa',
  white: 'color: #aaaaaa',
  gray: 'color: #808080',
  brightRed: 'color: #ff0000',
  brightGreen: 'color: #00ff00',
  brightYellow: 'color: #ffff00',
  brightBlue: 'color: #0000ff',
  brightMagenta: 'color: #ff00ff',
  brightCyan: 'color: #00ffff',
  brightWhite: 'color: #ffffff',
  
  // Text styles
  bold: 'font-weight: bold',
  dim: 'opacity: 0.7',
  italic: 'font-style: italic',
  underline: 'text-decoration: underline',
  
  // Background colors
  bgBlack: 'background-color: #000000',
  bgRed: 'background-color: #aa0000',
  bgGreen: 'background-color: #00aa00',
  bgYellow: 'background-color: #aa5500',
  bgBlue: 'background-color: #0000aa',
  bgMagenta: 'background-color: #aa00aa',
  bgCyan: 'background-color: #00aaaa',
  bgWhite: 'background-color: #aaaaaa'
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
  }

  /**
   * Load available themes from the file system
   */
  private loadAvailableThemes(): void {
    try {
      this.availableThemes = loadThemes();
    } catch (error) {
      // Fallback to default theme if loading fails
      this.availableThemes = { default: DEFAULT_THEME };
    }
  }

  /**
   * Get a theme by name
   */
  getTheme(name: string): ThemeDefinition | undefined {
    return this.availableThemes[name] || getThemeFromFile(name);
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
    if (!styles || styles.length === 0) {
      return message;
    }

    let styledMessage = message;
    for (const style of styles) {
      const ansiCode = COLORS[style];
      if (ansiCode) {
        styledMessage = `${ansiCode}${styledMessage}\x1b[0m`;
      }
    }
    return styledMessage;
  }

  /**
   * Get CSS styles for a given level
   */
  getCssStyles(level: string): string {
    const theme = this.currentTheme;
    if (!theme || typeof level !== 'string' || !theme[level]) {
      return '';
    }

    const styles = theme[level];
    if (!Array.isArray(styles) || styles.length === 0) {
      return '';
    }

    return styles
      .map(style => CSS_STYLE_MAP[style as string])
      .filter(Boolean)
      .join('; ');
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
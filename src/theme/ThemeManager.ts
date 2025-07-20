import type { ColorName } from '../types';
import { COLORS } from '../constants';
import { isBrowserEnvironment } from '../utils/environment';
import * as path from 'path';
import * as fs from 'fs';

// Embedded themes for browser compatibility
const EMBEDDED_THEMES = {
  "default": {
    "info": ["cyan", "bold"] as ColorName[],
    "success": ["green", "bold"] as ColorName[],
    "warning": ["yellow", "bold"] as ColorName[],
    "error": ["brightRed", "bold"] as ColorName[],
    "debug": ["gray", "italic"] as ColorName[],
    "important": ["magenta", "bold", "underline"] as ColorName[],
    "highlight": ["brightYellow", "bold"] as ColorName[],
    "muted": ["dim"] as ColorName[],
    "special": ["brightCyan", "bold"] as ColorName[],
    "code": ["brightGreen"] as ColorName[],
    "header": ["brightWhite", "bgBlue", "bold"] as ColorName[]
  },
  "dark": {
    "info": ["brightCyan"] as ColorName[],
    "success": ["brightGreen"] as ColorName[],
    "warning": ["brightYellow"] as ColorName[],
    "error": ["brightRed", "bold"] as ColorName[],
    "debug": ["gray", "italic"] as ColorName[],
    "header": ["brightWhite", "bgMagenta", "bold"] as ColorName[]
  },
  "solarized": {
    "info": ["blue"] as ColorName[],
    "success": ["green"] as ColorName[],
    "warning": ["yellow"] as ColorName[],
    "error": ["red", "bold"] as ColorName[],
    "debug": ["cyan", "italic"] as ColorName[],
    "muted": ["dim"] as ColorName[],
    "header": ["white", "bgBlue", "bold"] as ColorName[]
  },
  "matrix": {
    "info": ["green"] as ColorName[],
    "success": ["brightGreen"] as ColorName[],
    "warning": ["yellow"] as ColorName[],
    "error": ["brightRed", "bold"] as ColorName[],
    "debug": ["green", "dim"] as ColorName[],
    "header": ["black", "bgGreen", "bold"] as ColorName[],
    "special": ["brightGreen", "italic"] as ColorName[]
  },
  "vaporwave": {
    "info": ["magenta", "italic"] as ColorName[],
    "success": ["brightMagenta"] as ColorName[],
    "warning": ["brightYellow", "italic"] as ColorName[],
    "error": ["brightRed", "bold", "italic"] as ColorName[],
    "debug": ["cyan", "dim"] as ColorName[],
    "header": ["brightWhite", "bgMagenta", "bold"] as ColorName[],
    "highlight": ["brightCyan", "underline"] as ColorName[]
  },
  "cyberpunk": {
    "info": ["brightCyan"] as ColorName[],
    "success": ["brightGreen"] as ColorName[],
    "warning": ["brightYellow"] as ColorName[],
    "error": ["brightMagenta", "bold"] as ColorName[],
    "debug": ["gray", "italic"] as ColorName[],
    "header": ["black", "bgBrightMagenta", "bold"] as ColorName[],
    "special": ["magenta", "bold"] as ColorName[]
  },
  "midnight": {
    "info": ["blue"] as ColorName[],
    "success": ["green"] as ColorName[],
    "warning": ["yellow"] as ColorName[],
    "error": ["red", "bold"] as ColorName[],
    "debug": ["gray", "italic"] as ColorName[],
    "muted": ["dim"] as ColorName[],
    "header": ["brightWhite", "bgBlack", "bold"] as ColorName[]
  },
  "neon": {
    "info": ["brightCyan", "bold"] as ColorName[],
    "success": ["brightGreen", "bold"] as ColorName[],
    "warning": ["brightYellow", "bold"] as ColorName[],
    "error": ["brightRed", "bold"] as ColorName[],
    "debug": ["gray", "italic"] as ColorName[],
    "header": ["brightWhite", "bgBrightBlue", "bold"] as ColorName[]
  }
};

// Get current directory for theme path resolution (Node.js only)
function getCurrentDirname(): string {
  if (typeof __dirname !== 'undefined') {
    // CommonJS environment (e.g., Jest)
    return __dirname;
  } else {
    // ESM environment - fallback to a predictable path
    return path.resolve(process.cwd(), 'src', 'theme');
  }
}

export class ThemeManager {
  public themes: Record<string, Record<string, ColorName[]>> = {};
  private themePath?: string;

  constructor() {
    this.loadThemes();
  }

  private loadThemes(): void {
    if (isBrowserEnvironment()) {
      // In browser environment, use embedded themes
      this.themes = EMBEDDED_THEMES;
    } else {
      // In Node.js environment, load from file system
      this.loadThemesFromFile();
    }
  }

  private loadThemesFromFile(): void {
    try {
      const currentDirname = getCurrentDirname();
      this.themePath = path.resolve(currentDirname, 'themes.json');

      if (fs.existsSync(this.themePath)) {
        try {
          const data = fs.readFileSync(this.themePath, 'utf-8');
          this.themes = JSON.parse(data);
        } catch (err) {
          console.warn(`[ThemeManager] Failed to parse themes.json:`, err);
          this.themes = EMBEDDED_THEMES;
        }
      } else {
        console.warn(`[ThemeManager] Theme file not found at: ${this.themePath}`);
        this.themes = EMBEDDED_THEMES;
      }
    } catch (err) {
      // Fallback to embedded themes if Node.js modules are not available
      console.warn(`[ThemeManager] Failed to load themes from file system, using embedded themes:`, err);
      this.themes = EMBEDDED_THEMES;
    }
  }

  getTheme(themeName: string): Record<string, ColorName[]> {
    return this.themes[themeName] || this.themes['default'] || {};
  }

  applyStyles(styles: ColorName[], message: string): string {
    const ansiCodes = styles.map(style => COLORS[style]).join('');
    const resetCode = COLORS.reset;
    return `${ansiCodes}${message}${resetCode}`;
  }

  getCssStyles(level: string): string {
    const styles = this.themes['default']?.[level] || [];
    return styles.map(style => this.cssStyleMap(style)).join('; ');
  }

  private cssStyleMap(style: ColorName): string {
    const styleMap: Partial<Record<ColorName, string>> = {
      black: 'color: black',
      red: 'color: red',
      green: 'color: green',
      yellow: 'color: yellow',
      blue: 'color: blue',
      magenta: 'color: magenta',
      cyan: 'color: cyan',
      white: 'color: white',
      gray: 'color: gray',
      bold: 'font-weight: bold',
      dim: 'opacity: 0.7',
      italic: 'font-style: italic',
      underline: 'text-decoration: underline',
    };
    return styleMap[style] || '';
  }
}
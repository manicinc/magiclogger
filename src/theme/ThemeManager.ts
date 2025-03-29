import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import type { ColorName } from '../types';
import { COLORS } from '../constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ThemeManager {
  public themes: Record<string, Record<string, ColorName[]>> = {};
  private themePath = path.resolve(__dirname, '../../theme/themes.json');

  constructor() {
    this.loadThemes();
  }

  private loadThemes(): void {
    if (fs.existsSync(this.themePath)) {
      try {
        const data = fs.readFileSync(this.themePath, 'utf-8');
        this.themes = JSON.parse(data);
      } catch (err) {
        console.warn(`[ThemeManager] Failed to parse themes.json:`, err);
        this.themes = {};
      }
    } else {
      console.warn(`[ThemeManager] Theme file not found at: ${this.themePath}`);
      this.themes = {};
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
      green: 'green',
      yellow: 'yellow',
      blue: 'blue',
      magenta: 'magenta',
      cyan: 'cyan',
      white: 'white',
      gray: 'gray',
      bold: 'font-weight: bold',
      dim: 'opacity: 0.7',
      italic: 'font-style: italic',
      underline: 'text-decoration: underline',
    };
    return styleMap[style] || '';
  }
}

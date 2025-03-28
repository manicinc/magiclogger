import * as fs from 'fs';
import * as path from 'path';
import { ColorName } from '../types';
import { COLORS } from '../constants';

export class ThemeManager {
  private themes: Record<string, Record<string, ColorName[]>> = {};
  private themePath = path.resolve(__dirname, 'themes.json');

  constructor() {
    this.loadThemes();
  }

  private loadThemes(): void {
    if (fs.existsSync(this.themePath)) {
      const data = fs.readFileSync(this.themePath, 'utf-8');
      this.themes = JSON.parse(data);
    } else {
      throw new Error(`Theme file not found at: ${this.themePath}`);
    }
  }

  getTheme(themeName: string): Record<string, ColorName[]> {
    return this.themes[themeName] || this.themes['default'];
  }

  applyStyles(styles: ColorName[], message: string): string {
    const ansiCodes = styles.map(style => COLORS[style]).join('');
    const resetCode = COLORS.reset;
    return `${ansiCodes}${message}${resetCode}`;
  }

  getCssStyles(level: string): string {
    const styles = this.themes['default'][level] || [];
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
      // Add other styles as needed
    };
    return styleMap[style] || '';
  }
}

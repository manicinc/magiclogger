import { ColorName } from '../types';
import { COLORS, PRESETS } from '../constants';
import { getFallbackStyle } from '../utils/terminal';
import { PATH_REGEX } from '../constants';
import { StylePreset } from '../types';
import { StyleName } from '../types/terminal';

/**
 * Colorizer provides core utilities for applying colors and styles to strings.
 * This is a foundational utility class for working with terminal and browser colors.
 */
export class Colorizer {
  /**
   * Apply a single color or style to text
   *
   * @param text The text to colorize
   * @param color The color or style name to apply
   * @param useColors Whether to use colors (defaults to true)
   * @returns Formatted text with color codes
   */
  public static color(text: string, color: ColorName, useColors = true): string {
    if (!useColors || !text) return text;

    // Get color code, or empty string if color is invalid
    const colorCode = COLORS[color as keyof typeof COLORS] || '';
    return `${colorCode}${text}${COLORS.reset}`;
  }

  /**
   * Apply multiple colors to different parts of a string
   *
   * @param parts Array of objects containing text and color information
   * @param useColors Whether to use colors (defaults to true)
   * @returns Combined string with each part colored accordingly
   */
  public static colorParts(
    parts: Array<{ text: string; color: ColorName }>,
    useColors = true
  ): string {
    if (!useColors) return parts.map(part => part.text).join('');
    return parts.map(part => this.color(part.text, part.color, useColors)).join('');
  }

  /**
   * Apply an array of colors/styles to text
   *
   * @param text The text to format
   * @param colors Array of color names to apply
   * @param useColors Whether to use colors (defaults to true)
   * @returns Text with all styles applied
   */
  public static applyColors(text: string, colors: ColorName[], useColors = true): string {
    if (!useColors || !text || !colors || colors.length === 0) return text;

    let result = '';

    // Apply each color code in sequence
    for (const color of colors) {
      if (typeof color !== 'string') continue;

      // Check if the color exists in COLORS
      if (COLORS[color as keyof typeof COLORS]) {
        result += COLORS[color as keyof typeof COLORS];
      }
      // Handle styles that might need fallbacks
      else if (
        [
          'bold',
          'dim',
          'italic',
          'underline',
          'blink',
          'reverse',
          'hidden',
          'strikethrough',
        ].includes(color)
      ) {
        // Cast to StyleName for type safety
        const styleName = color as StyleName;
        const fallbackStyle = getFallbackStyle(styleName);

        if (COLORS[styleName as keyof typeof COLORS]) {
          result += COLORS[styleName as keyof typeof COLORS];
        } else if (fallbackStyle && COLORS[fallbackStyle as keyof typeof COLORS]) {
          result += COLORS[fallbackStyle as keyof typeof COLORS];
        }
      }
    }

    // Append the text and reset code
    return `${result}${text}${COLORS.reset}`;
  }

  /**
   * Apply colors from a preset style
   *
   * @param text The text to format
   * @param preset The preset style name
   * @param useColors Whether to use colors (defaults to true)
   * @returns Formatted text with preset colors applied
   */
  public static applyPreset(text: string, preset: StylePreset, useColors = true): string {
    if (!useColors) return text;

    // Get the preset colors array
    const presetColors = PRESETS[preset] || [];

    // Extract color names from ANSI codes
    const colorNames: ColorName[] = [];
    for (const [name, ,] of Object.entries(COLORS)) {
      if (presetColors.includes(name as ColorName)) {
        colorNames.push(name as ColorName);
      }
    }

    return this.applyColors(text, colorNames, useColors);
  }

  /**
   * Highlight specific matches in text with a given color
   *
   * @param text The source text
   * @param pattern RegExp or string to match
   * @param highlightColor Color to apply to matches
   * @param useColors Whether to use colors (defaults to true)
   * @returns Text with highlighted matches
   */
  public static highlight(
    text: string,
    pattern: RegExp | string,
    highlightColor: ColorName = 'yellow',
    useColors = true
  ): string {
    if (!useColors || !text) return text;

    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g');
    return text.replace(regex, match => this.color(match, highlightColor, useColors));
  }

  /**
   * Format a key-value pair with colored key
   *
   * @param key The key to display
   * @param value The value to display
   * @param keyColor Color for the key
   * @param useColors Whether to use colors (defaults to true)
   * @returns Formatted string like "key: value"
   */
  public static formatKeyValue(
    key: string,
    value: any,
    keyColor: ColorName = 'cyan',
    useColors = true
  ): string {
    return `${this.color(key, keyColor, useColors)}: ${value}`;
  }

  /**
   * Create a rainbow effect on text (each character gets a different color)
   *
   * @param text The text to rainbow-ify
   * @param useColors Whether to use colors (defaults to true)
   * @returns Text with rainbow colornpming
   */
  public static rainbow(text: string, useColors = true): string {
    if (!useColors || !text) return text;

    const rainbowColors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

    return Array.from(text)
      .map((char, index) => {
        const colorIndex = index % rainbowColors.length;
        return this.color(char, rainbowColors[colorIndex], useColors);
      })
      .join('');
  }

  /**
   * Utility: Check if a string looks like a URL or file path.
   * @param text The text to check.
   * @returns True if it is link-like.
   */
  public static isLinkLike(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return PATH_REGEX.test(text);
  }
}
// File: src/core/Colorizer.ts

import { ANSI_CODES } from '../constants/colors';
import type { ColorName } from '../types';

/**
 * Static utility class for applying ANSI color codes.
 * 
 * This class provides low-level color application functionality
 * used by other components. It handles:
 * - ANSI escape code generation
 * - Color validation
 * - Terminal capability detection
 * - Performance optimizations
 * 
 * @class Colorizer
 * 
 * @example
 * ```typescript
 * // Apply single color
 * const red = Colorizer.applyColor('Error', 'red');
 * 
 * // Apply multiple colors
 * const styled = Colorizer.applyColors('Important', ['yellow', 'bold', 'underline']);
 * 
 * // Check if colors are supported
 * if (Colorizer.supportsColor()) {
 *   console.log(Colorizer.red('Error message'));
 * }
 * ```
 */
export class Colorizer {
  /**
   * Cache for color code combinations.
   * @private
   * @static
   */
  private static codeCache: Map<string, string> = new Map();

  /**
   * Whether the terminal supports colors.
   * @private
   * @static
   */
  private static _supportsColor?: boolean;

  /**
   * Maximum cache size.
   * @private
   * @static
   */
  private static readonly MAX_CACHE_SIZE = 500;

  /**
   * Apply a single color to text.
   * 
   * @param {string} text - Text to colorize
   * @param {ColorName} color - Color to apply
   * @returns {string} Colorized text
   * @static
   */
  public static applyColor(text: string, color: ColorName): string {
    if (!this.supportsColor()) {
      return text;
    }

    const code = ANSI_CODES[color];
    if (!code) {
      return text;
    }

    const resetCode = this.getResetCode(color);
    return `${code}${text}${resetCode}`;
  }

  /**
   * Apply multiple colors to text.
   * 
   * @param {string} text - Text to colorize
   * @param {ColorName[]} colors - Colors to apply
   * @returns {string} Colorized text
   * @static
   */
  public static applyColors(text: string, colors: ColorName[]): string {
    if (!this.supportsColor() || colors.length === 0) {
      return text;
    }

    // Check cache
    const cacheKey = colors.join(',');
    let codes = this.codeCache.get(cacheKey);

    if (!codes) {
      // Build codes
      const startCodes: string[] = [];
      const endCodes: Set<string> = new Set();

      for (const color of colors) {
        const code = ANSI_CODES[color];
        if (code) {
          startCodes.push(code);
          endCodes.add(this.getResetCode(color));
        }
      }

      codes = startCodes.join('') + '{}' + Array.from(endCodes).join('');
      
      // Add to cache
      this.addToCache(cacheKey, codes);
    }

    // Apply codes
    return codes.replace('{}', text);
  }

  /**
   * Get the appropriate reset code for a color.
   * 
   * @param {ColorName} color - Color to get reset for
   * @returns {string} Reset code
   * @private
   * @static
   */
  private static getResetCode(color: ColorName): string {
    // Background colors
    if (color.startsWith('bg')) {
      return ANSI_CODES.bgReset;
    }

    // Style modifiers
    switch (color) {
      case 'bold':
        return ANSI_CODES.boldReset;
      case 'dim':
        return ANSI_CODES.dimReset;
      case 'italic':
        return ANSI_CODES.italicReset;
      case 'underline':
        return ANSI_CODES.underlineReset;
      case 'inverse':
        return ANSI_CODES.inverseReset;
      case 'hidden':
        return ANSI_CODES.hiddenReset;
      case 'strikethrough':
        return ANSI_CODES.strikethroughReset;
      default:
        // Foreground colors
        return ANSI_CODES.reset;
    }
  }

  /**
   * Check if the terminal supports color.
   * 
   * @returns {boolean} True if colors are supported
   * @static
   */
  public static supportsColor(): boolean {
    if (this._supportsColor !== undefined) {
      return this._supportsColor;
    }

    // Check various environment conditions
    if (typeof process === 'undefined') {
      // Browser environment
      this._supportsColor = false;
      return false;
    }

    // Check for explicit disable
    if (process.env.NO_COLOR) {
      this._supportsColor = false;
      return false;
    }

    // Check for explicit enable
    if (process.env.FORCE_COLOR) {
      this._supportsColor = true;
      return true;
    }

    // Check if stdout is a TTY
    if (process.stdout && !process.stdout.isTTY) {
      this._supportsColor = false;
      return false;
    }

    // Check TERM environment variable
    const term = process.env.TERM;
    if (term === 'dumb') {
      this._supportsColor = false;
      return false;
    }

    // Check platform-specific conditions
    if (process.platform === 'win32') {
      // Windows 10 build 14931+ supports ANSI
      const osRelease = require('os').release().split('.');
      const major = parseInt(osRelease[0], 10);
      const build = parseInt(osRelease[2], 10);
      this._supportsColor = major >= 10 && build >= 14931;
    } else {
      // Unix-like systems generally support colors
      this._supportsColor = true;
    }

    return this._supportsColor;
  }

  /**
   * Force color support on or off.
   * 
   * @param {boolean} supported - Whether colors are supported
   * @static
   */
  public static setColorSupport(supported: boolean): void {
    this._supportsColor = supported;
  }

  /**
   * Add to cache with size management.
   * 
   * @param {string} key - Cache key
   * @param {string} value - Cache value
   * @private
   * @static
   */
  private static addToCache(key: string, value: string): void {
    if (this.codeCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.codeCache.keys().next().value;
      this.codeCache.delete(firstKey);
    }

    this.codeCache.set(key, value);
  }

  /**
   * Clear the code cache.
   * @static
   */
  public static clearCache(): void {
    this.codeCache.clear();
  }

  /**
   * Strip ANSI codes from text.
   * 
   * @param {string} text - Text with ANSI codes
   * @returns {string} Plain text
   * @static
   */
  public static stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Get color level support.
   * 
   * @returns {number} Color level (0, 1, 2, or 3)
   * @static
   */
  public static getColorLevel(): number {
    if (!this.supportsColor()) {
      return 0;
    }

    if (process.env.TERM === 'dumb') {
      return 0;
    }

    // True color support
    if (process.env.COLORTERM === 'truecolor' || process.env.TERM_PROGRAM === 'iTerm.app') {
      return 3;
    }

    // 256 color support
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(process.env.TERM || '')) {
      return 2;
    }

    // Basic color support
    return 1;
  }

  // Convenience methods for common colors

  /**
   * Apply red color.
   * @static
   */
  public static red(text: string): string {
    return this.applyColor(text, 'red');
  }

  /**
   * Apply green color.
   * @static
   */
  public static green(text: string): string {
    return this.applyColor(text, 'green');
  }

  /**
   * Apply yellow color.
   * @static
   */
  public static yellow(text: string): string {
    return this.applyColor(text, 'yellow');
  }

  /**
   * Apply blue color.
   * @static
   */
  public static blue(text: string): string {
    return this.applyColor(text, 'blue');
  }

  /**
   * Apply magenta color.
   * @static
   */
  public static magenta(text: string): string {
    return this.applyColor(text, 'magenta');
  }

  /**
   * Apply cyan color.
   * @static
   */
  public static cyan(text: string): string {
    return this.applyColor(text, 'cyan');
  }

  /**
   * Apply white color.
   * @static
   */
  public static white(text: string): string {
    return this.applyColor(text, 'white');
  }

  /**
   * Apply gray color.
   * @static
   */
  public static gray(text: string): string {
    return this.applyColor(text, 'gray');
  }

  /**
   * Apply bright red color.
   * @static
   */
  public static brightRed(text: string): string {
    return this.applyColor(text, 'brightRed');
  }

  /**
   * Apply bright green color.
   * @static
   */
  public static brightGreen(text: string): string {
    return this.applyColor(text, 'brightGreen');
  }

  /**
   * Apply bright yellow color.
   * @static
   */
  public static brightYellow(text: string): string {
    return this.applyColor(text, 'brightYellow');
  }

  /**
   * Apply bright blue color.
   * @static
   */
  public static brightBlue(text: string): string {
    return this.applyColor(text, 'brightBlue');
  }

  /**
   * Apply bright magenta color.
   * @static
   */
  public static brightMagenta(text: string): string {
    return this.applyColor(text, 'brightMagenta');
  }

  /**
   * Apply bright cyan color.
   * @static
   */
  public static brightCyan(text: string): string {
    return this.applyColor(text, 'brightCyan');
  }

  /**
   * Apply bright white color.
   * @static
   */
  public static brightWhite(text: string): string {
    return this.applyColor(text, 'brightWhite');
  }

  /**
   * Apply bold style.
   * @static
   */
  public static bold(text: string): string {
    return this.applyColor(text, 'bold');
  }

  /**
   * Apply dim style.
   * @static
   */
  public static dim(text: string): string {
    return this.applyColor(text, 'dim');
  }

  /**
   * Apply italic style.
   * @static
   */
  public static italic(text: string): string {
    return this.applyColor(text, 'italic');
  }

  /**
   * Apply underline style.
   * @static
   */
  public static underline(text: string): string {
    return this.applyColor(text, 'underline');
  }

  /**
   * Apply inverse style.
   * @static
   */
  public static inverse(text: string): string {
    return this.applyColor(text, 'inverse');
  }

  /**
   * Apply strikethrough style.
   * @static
   */
  public static strikethrough(text: string): string {
    return this.applyColor(text, 'strikethrough');
  }

  /**
   * Create a color function for repeated use.
   * 
   * @param {...ColorName[]} colors - Colors to apply
   * @returns {Function} Color function
   * @static
   */
  public static createColorFunction(...colors: ColorName[]): (text: string) => string {
    return (text: string) => this.applyColors(text, colors);
  }

  /**
   * Check if text has ANSI codes.
   * 
   * @param {string} text - Text to check
   * @returns {boolean} True if has ANSI codes
   * @static
   */
  public static hasAnsi(text: string): boolean {
    return /\x1b\[[0-9;]*m/.test(text);
  }

  /**
   * Get visible length of text (excluding ANSI codes).
   * 
   * @param {string} text - Text to measure
   * @returns {number} Visible length
   * @static
   */
  public static visibleLength(text: string): number {
    return this.stripAnsi(text).length;
  }
}
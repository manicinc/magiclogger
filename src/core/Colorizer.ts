// File: src/core/Colorizer.ts

import { COLORS } from '../constants/colors';
import { PRESETS } from '../constants/preset';
import { IS_PATH_REGEX } from '../constants/paths';
// Use namespace import so jest.spyOn on terminal utils updates behavior dynamically
import * as terminalUtils from '../utils/terminal';
import { ANSI } from '../constants/ansi';
import type { ColorName, StylePreset } from '../types';

// Helper: raw ANSI map for styles (bypass conditional COLORS getters for fallbacks)
const RAW_STYLE_MAP: Record<string, string | undefined> = {
  bold: ANSI.BOLD,
  dim: ANSI.DIM,
  italic: ANSI.ITALIC,
  underline: ANSI.UNDERLINE,
  blink: ANSI.BLINK,
  reverse: ANSI.REVERSE,
  hidden: ANSI.HIDDEN,
  strikethrough: ANSI.STRIKETHROUGH,
};

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
    const colorCode = COLORS[color] || '';
    return colorCode ? `${colorCode}${text}${COLORS.reset}` : text;
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

  const cacheKey = colors.join(',');
  let cachedCodes = this.codeCache.get(cacheKey);

    if (!cachedCodes) {
      let result = '';

      // Apply each color code in sequence
      for (const color of colors) {
        if (typeof color !== 'string') continue;

        let colorCode: string | undefined;

        // Normalize common aliases so fallbacks like 'gray' are honored
        const normalized = ((): string => {
          switch (color) {
            case 'grey': return 'gray';
            case 'inverse': return 'reverse';
            default: return color as string;
          }
        })();

        // Use direct style/color if available; COLORS proxy already consults support
        const direct = COLORS[normalized as keyof typeof COLORS];
        if (direct) {
          colorCode = direct;
        } else {
          // Try fallback style. Prefer raw ANSI when it's a style (e.g., 'underline', 'dim').
          // If the fallback is a color (e.g., 'gray'), consult COLORS to obtain its code.
          const fallbackStyle = this.getFallbackStyleInternal(normalized);
          if (fallbackStyle) {
            if (RAW_STYLE_MAP[fallbackStyle]) {
              colorCode = RAW_STYLE_MAP[fallbackStyle];
            } else {
              const fbDirect = COLORS[fallbackStyle as keyof typeof COLORS];
              if (fbDirect) {
                colorCode = fbDirect;
              }
            }
          }
        }

        if (colorCode) {
          result += colorCode;
        }
      }

      cachedCodes = result;
      this.addToCache(cacheKey, cachedCodes);
    }

    // If no codes resolved (unsupported styles mapping to 'normal' etc.), return text unchanged
    if (!cachedCodes) {
      return text;
    }

    // Append the text and reset code
    return `${cachedCodes}${text}${COLORS.reset}`;
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

    // Get the preset colors array and convert to mutable array
    const presetColors = PRESETS[preset] || [];
    return this.applyColors(text, [...presetColors], useColors);
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
    value: unknown,
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
   * @returns Text with rainbow coloring
   */
  public static rainbow(text: string, useColors = true): string {
    if (!useColors || !text) return text;

    const rainbowColors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

    return Array.from(text)
      .map((char, index) => {
        const colorIndex = index % rainbowColors.length;
        const color = rainbowColors[colorIndex];
        return color ? this.color(char, color, useColors) : char;
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
    return IS_PATH_REGEX.test(text);
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
    if (typeof process !== 'undefined' && process.env && process.env.NO_COLOR) {
      this._supportsColor = false;
      return false;
    }

    // Check for explicit enable
    if (typeof process !== 'undefined' && process.env && process.env.FORCE_COLOR) {
      this._supportsColor = true;
      return true;
    }

    // Check if stdout is a TTY
    if (typeof process !== 'undefined' && process.stdout && !process.stdout.isTTY) {
      this._supportsColor = false;
      return false;
    }

    // Check TERM environment variable
    const term = typeof process !== 'undefined' && process.env ? process.env.TERM : undefined;
    if (term === 'dumb') {
      this._supportsColor = false;
      return false;
    }

    // Check platform-specific conditions
    if (typeof process !== 'undefined' && process.platform === 'win32') {
      // Windows 10 build 14931+ supports ANSI
      // Dynamic import to avoid bundler issues
      import('os')
        .then(os => {
          const osRelease = os.release().split('.');
          const major = parseInt(osRelease[0] || '0', 10);
          const build = parseInt(osRelease[2] || '0', 10);
          this._supportsColor = major >= 10 && build >= 14931;
        })
        .catch(() => {
          this._supportsColor = false;
        });
    } else {
      // Unix-like systems generally support colors
      this._supportsColor = true;
    }

    return this._supportsColor || false;
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
      const firstKey = this.codeCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) {
        this.codeCache.delete(firstKey);
      }
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
    // eslint-disable-next-line no-control-regex
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

    if (typeof process !== 'undefined' && process.env && process.env.TERM === 'dumb') {
      return 0;
    }

    // True color support
    if (typeof process !== 'undefined' && process.env && 
        (process.env.COLORTERM === 'truecolor' || process.env.TERM_PROGRAM === 'iTerm.app')) {
      return 3;
    }

    // 256 color support
    if (typeof process !== 'undefined' && process.env &&
      /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(process.env.TERM || '')
    ) {
      return 2;
    }

    // Basic color support
    return 1;
  }

  /**
   * Check if text has ANSI codes.
   *
   * @param {string} text - Text to check
   * @returns {boolean} True if has ANSI codes
   * @static
   */
  public static hasAnsi(text: string): boolean {
    // eslint-disable-next-line no-control-regex
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

  // Convenience methods for common colors

  /**
   * Apply red color.
   * @static
   */
  public static red(text: string): string {
    return this.color(text, 'red');
  }

  /**
   * Apply green color.
   * @static
   */
  public static green(text: string): string {
    return this.color(text, 'green');
  }

  /**
   * Apply yellow color.
   * @static
   */
  public static yellow(text: string): string {
    return this.color(text, 'yellow');
  }

  /**
   * Apply blue color.
   * @static
   */
  public static blue(text: string): string {
    return this.color(text, 'blue');
  }

  /**
   * Apply magenta color.
   * @static
   */
  public static magenta(text: string): string {
    return this.color(text, 'magenta');
  }

  /**
   * Apply cyan color.
   * @static
   */
  public static cyan(text: string): string {
    return this.color(text, 'cyan');
  }

  /**
   * Apply white color.
   * @static
   */
  public static white(text: string): string {
    return this.color(text, 'white');
  }

  /**
   * Apply gray color.
   * @static
   */
  public static gray(text: string): string {
    return this.color(text, 'gray');
  }

  /**
   * Apply bright red color.
   * @static
   */
  public static brightRed(text: string): string {
    return this.color(text, 'brightRed');
  }

  /**
   * Apply bright green color.
   * @static
   */
  public static brightGreen(text: string): string {
    return this.color(text, 'brightGreen');
  }

  /**
   * Apply bright yellow color.
   * @static
   */
  public static brightYellow(text: string): string {
    return this.color(text, 'brightYellow');
  }

  /**
   * Apply bright blue color.
   * @static
   */
  public static brightBlue(text: string): string {
    return this.color(text, 'brightBlue');
  }

  /**
   * Apply bright magenta color.
   * @static
   */
  public static brightMagenta(text: string): string {
    return this.color(text, 'brightMagenta');
  }

  /**
   * Apply bright cyan color.
   * @static
   */
  public static brightCyan(text: string): string {
    return this.color(text, 'brightCyan');
  }

  /**
   * Apply bright white color.
   * @static
   */
  public static brightWhite(text: string): string {
    return this.color(text, 'brightWhite');
  }

  /**
   * Apply bold style.
   * @static
   */
  public static bold(text: string): string {
    return this.color(text, 'bold');
  }

  /**
   * Apply dim style.
   * @static
   */
  public static dim(text: string): string {
    return this.color(text, 'dim');
  }

  /**
   * Apply italic style.
   * @static
   */
  public static italic(text: string): string {
    return this.color(text, 'italic');
  }

  /**
   * Apply underline style.
   * @static
   */
  public static underline(text: string): string {
    return this.color(text, 'underline');
  }

  /**
   * Apply inverse style.
   * @static
   */
  public static inverse(text: string): string {
    return this.color(text, 'inverse');
  }

  /**
   * Apply strikethrough style.
   * @static
   */
  public static strikethrough(text: string): string {
    return this.color(text, 'strikethrough');
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
   * Internal method to get fallback style with test environment override.
   * @private
   * @static
   */
  private static getFallbackStyleInternal(style: string): string {
  // Ask terminal utils for fallback; jest can override this via spy
  return terminalUtils.getFallbackStyle(style);
  }
}

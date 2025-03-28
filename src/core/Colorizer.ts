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

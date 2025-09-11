// File: src/utils/TextStyler.ts

import type { ColorName } from '../types/colors';
import type { StyleRange } from '../types/transport';
import { Colorizer } from '../core/Colorizer';
import { StyleCache } from './StyleCache';

/**
 * Part represents a piece of text with optional styles.
 * Used by the parts API for explicit style control.
 *
 * @type {Part}
 */
export type Part = [string, ...ColorName[]];

/**
 * StyleMap defines styles for specific word indices.
 * Used by the index-based styling API.
 *
 * @type {StyleMap}
 */
export type StyleMap = Record<number, ColorName[]>;

/**
 * TextStyler provides utility functions for various text styling operations.
 * This class contains the core logic for all styling APIs, ensuring consistency
 * across different styling methods.
 *
 * Now uses angle bracket syntax: <style>text</> instead of [[style]]text[[/]]
 *
 * @class TextStyler
 *
 * @example
 * ```typescript
 * // Style parts of text
 * const styled = TextStyler.styleParts([
 *   ['Error:', 'red', 'bold'],
 *   [' Something went wrong']
 * ]);
 *
 * // Style by word index
 * const styled = TextStyler.styleByIndex(
 *   'Error: Connection failed',
 *   { 0: ['red', 'bold'], 2: ['yellow'] }
 * );
 *
 * // Parse angle bracket syntax
 * const styled = TextStyler.parseBrackets(
 *   '<red.bold>Error:</> Failed'
 * );
 * ```
 */
export class TextStyler {
  // Pre-compiled regex patterns for performance
  // Non-backtracking regexes to prevent ReDoS attacks
  private static readonly BRACKET_REGEX = /<([^>]+)>([^<]*)<\/>/g;
  private static readonly BRACKET_STRIP_REGEX = /<([^>]+)>([^<]*)<\/>/g;
  private static readonly WORD_SPLIT_REGEX = /(\s+)/;
  private static readonly AT_TEMPLATE_REGEX = /@(\w+(?:\.\w+)*?)\{([^}]+)\}/g;
  private static readonly STYLE_DOT_REGEX = /\./;

  // Cache for parsed style strings to avoid repeated parsing
  private static readonly styleParseCache = new Map<string, ColorName[]>();

  // Hoisted valid styles set for parseStyleString checks
  private static readonly VALID_STYLES: Set<string> = new Set<string>([
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey',
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
    'brightblack',
    'brightred',
    'brightgreen',
    'brightyellow',
    'brightblue',
    'brightmagenta',
    'brightcyan',
    'brightwhite',
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgGray',
    'bgGrey',
    'bgblack',
    'bgred',
    'bggreen',
    'bgyellow',
    'bgblue',
    'bgmagenta',
    'bgcyan',
    'bgwhite',
    'bggray',
    'bggrey',
    'bgBrightBlack',
    'bgBrightRed',
    'bgBrightGreen',
    'bgBrightYellow',
    'bgBrightBlue',
    'bgBrightMagenta',
    'bgBrightCyan',
    'bgBrightWhite',
    'bgbrightblack',
    'bgbrightred',
    'bgbrightgreen',
    'bgbrightyellow',
    'bgbrightblue',
    'bgbrightmagenta',
    'bgbrightcyan',
    'bgbrightwhite',
    // Extra popular colors and their common variants
    'purple',
    'brightPurple',
    'bgPurple',
    'bgBrightPurple',
    'purple',
    'brightpurple',
    'bgpurple',
    'bgbrightpurple',
    'teal',
    'brightTeal',
    'bgTeal',
    'bgBrightTeal',
    'teal',
    'brightteal',
    'bgteal',
    'bgbrightteal',
    'lime',
    'brightLime',
    'bgLime',
    'bgBrightLime',
    'lime',
    'brightlime',
    'bglime',
    'bgbrightlime',
    'orange',
    'brightOrange',
    'bgOrange',
    'bgBrightOrange',
    'orange',
    'brightorange',
    'bgorange',
    'bgbrightorange',
    'pink',
    'brightPink',
    'bgPink',
    'bgBrightPink',
    'pink',
    'brightpink',
    'bgpink',
    'bgbrightpink',
    'brown',
    'brightBrown',
    'bgBrown',
    'bgBrightBrown',
    'brown',
    'brightbrown',
    'bgbrown',
    'bgbrightbrown',
    'indigo',
    'brightIndigo',
    'bgIndigo',
    'bgBrightIndigo',
    'indigo',
    'brightindigo',
    'bgindigo',
    'bgbrightindigo',
    'bold',
    'dim',
    'italic',
    'underline',
    'blink',
    'reverse',
    'inverse',
    'hidden',
    'strikethrough',
  ]);

  /**
   * Styles an array of text parts with their respective styles.
   * Each part is a tuple where the first element is text and
   * the rest are style names to apply.
   *
   * @param {Part[]} parts - Array of text parts with styles
   * @param {boolean} [useColors=true] - Whether to apply colors
   * @returns {string} Combined styled string
   *
   * @example
   * ```typescript
   * const result = TextStyler.styleParts([
   *   ['SUCCESS:', 'green', 'bold'],
   *   [' All tests passed'],
   *   [' (100%)', 'dim']
   * ]);
   * ```
   */
  public static styleParts(parts: Part[], useColors = true): string {
    if (!parts || parts.length === 0) {
      return '';
    }

    const styledParts: string[] = [];

    for (const part of parts) {
      if (!Array.isArray(part) || part.length === 0) {
        continue;
      }

      const [text, ...styles] = part;

      // Skip empty text
      if (!text) {
        continue;
      }

      // Apply styles if present and colors are enabled
      if (useColors && styles && styles.length > 0) {
        const validStyles = styles.filter(
          s => typeof s === 'string' && s.length > 0
        ) as ColorName[];

        if (validStyles.length > 0) {
          styledParts.push(Colorizer.applyColors(text, validStyles, useColors));
        } else {
          styledParts.push(text);
        }
      } else {
        styledParts.push(text);
      }
    }

    return styledParts.join('');
  }

  /**
   * Styles text by applying colors to specific word indices.
   * Words are split by whitespace and indexed starting from 0.
   *
   * @param {string} text - Text to style
   * @param {StyleMap} styleMap - Map of word indices to styles
   * @param {boolean} [useColors=true] - Whether to apply colors
   * @returns {string} Styled text
   *
   * @example
   * ```typescript
   * const result = TextStyler.styleByIndex(
   *   'GET /api/users 200 OK 45ms',
   *   {
   *     0: ['blue', 'bold'],      // "GET"
   *     1: ['cyan'],               // "/api/users"
   *     2: ['green', 'bold'],      // "200"
   *     3: ['green'],              // "OK"
   *     4: ['magenta']             // "45ms"
   *   }
   * );
   * ```
   */
  public static styleByIndex(text: string, styleMap: StyleMap, useColors = true): string {
    if (!text || !styleMap || Object.keys(styleMap).length === 0) {
      return text || '';
    }

    // Split text into words (preserving separators) and pre-mark whitespace tokens
    const raw = text.split(TextStyler.WORD_SPLIT_REGEX);
    const styledWords: string[] = new Array(raw.length);
    let wordIndex = 0;

    for (let i = 0; i < raw.length; i++) {
      const word = raw[i];
      const isSpace = (i & 1) === 1; // because split with capture alternates: word, space, word, space...
      if (isSpace) {
        styledWords[i] = word;
        continue;
      }

      // Check if this word index has styles
      const styles = styleMap[wordIndex];

      if (useColors && styles && styles.length > 0) {
        // Validate styles
        const validStyles = styles as ColorName[];

        if (validStyles.length > 0) {
          styledWords[i] = Colorizer.applyColors(word, validStyles, useColors);
        } else {
          styledWords[i] = word;
        }
      } else {
        styledWords[i] = word;
      }

      wordIndex++;
    }

    return styledWords.join('');
  }

  /**
   * Parses and applies angle bracket syntax styling <style>text</>.
   * Angle brackets are used to avoid conflicts with other syntax in text.
   *
   * @param {string} text - Text with angle bracket syntax
   * @param {boolean} [useColors=true] - Whether to apply colors
   * @returns {string} Styled text
   *
   * @example
   * ```typescript
   * const result = TextStyler.parseBrackets(
   *   '<green.bold>SUCCESS:</> All <yellow>10</> tests passed'
   * );
   * ```
   */
  public static parseBrackets(text: string, useColors = true): string {
    if (!text) {
      return '';
    }

    if (!useColors) {
      // Remove all angle bracket styling syntax
      return text.replace(TextStyler.BRACKET_STRIP_REGEX, '$2');
    }

    // Check cache first for performance
    const cache = StyleCache.getInstance();
    const cacheKey = StyleCache.makeKey(text, ['brackets'], useColors);
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached.styled;
    }

    // Process nested brackets by starting with innermost
    let result = text;
    let previousResult = '';
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (result !== previousResult && iterations < maxIterations) {
      previousResult = result;

      // Match <styles>content</> using pre-compiled regex
      result = result.replace(TextStyler.BRACKET_REGEX, (match, styleString, content) => {
        // Parse styles (dot-separated)
        const styles = TextStyler.parseStyleString(styleString);

        if (styles.length === 0) {
          return content;
        }

        return Colorizer.applyColors(content, styles, useColors);
      });

      iterations++;
    }

    // Cache the result for future use
    cache.set(cacheKey, result, text.replace(/<([^>]+)>([^<]*)<\/>/g, '$2'));

    return result;
  }

  /**
   * Parses angle bracket styled text and extracts both plain text and style ranges.
   * This is the enhanced version that supports the optimized MAGIC Schema format.
   *
   * @param {string} text - Text with angle bracket styling
   * @param {boolean} applyStyles - Whether to apply styles (for console) or extract them
   * @returns {object} Object with plain text, styled text, and style ranges
   *
   * @example
   * ```typescript
   * const result = TextStyler.parseBracketsWithExtraction(
   *   '<red.bold>Error:</> User <cyan>john@example.com</> not found'
   * );
   * // Returns: {
   * //   plainText: "Error: User john@example.com not found",
   * //   styledText: "\x1b[31m\x1b[1mError:\x1b[0m User \x1b[36mjohn@example.com\x1b[0m not found",
   * //   styles: [[0, 6, "red.bold"], [12, 29, "cyan"]]
   * // }
   * ```
   */
  public static parseBracketsWithExtraction(
    text: string,
    useColors = true
  ): { plainText: string; styledText: string; styles?: StyleRange[] } {
    if (!text) {
      return { plainText: '', styledText: '', styles: undefined };
    }

    // OPTIMIZATION: Fast path for text without styles (most common case)
    // Check for angle brackets first before any processing
    if (!text.includes('<') || !text.includes('>')) {
      return { plainText: text, styledText: text, styles: undefined };
    }

    // Check cache first - this is the hot path for styled text
    const cacheKey = StyleCache.makeKey(text, ['extraction'], useColors);
    const cache = StyleCache.getInstance();
    const cached = cache.get(cacheKey);
    if (cached) {
      // For extraction, we cache the entire result as JSON in the styled field
      // The plain field contains the plain text for quick access
      try {
        const cachedData = JSON.parse(cached.styled) as {
          plainText: string;
          styledText: string;
          styles?: StyleRange[];
        };
        return cachedData;
      } catch {
        // Cache corruption, continue with fresh computation
      }
    }

    // OPTIMIZATION: Single-pass processing for both nested and regular tags
    const styles: StyleRange[] = [];
    let plainText = '';
    let styledText = '';
    let lastIndex = 0;

    // OPTIMIZATION: Use a single optimized regex that handles both nested and regular tags
    // This regex is more efficient as it avoids the negative lookahead
    const regex = /<([^>]+)>([^<]*)<\/>/g;
    let match: RegExpExecArray | null;

    // Pre-process for nested tags in a single pass if needed
    let processedText = text;
    if (text.includes('</></>')) {
      // Only do nested processing if we detect nested closing tags
      const nestedPattern = /<([^>]+)><([^>]+)>([^<]*)<\/><\/>/g;
      processedText = text.replace(nestedPattern, (match, outerStyle, innerStyle, content) => {
        // Combine styles from nested tags
        const combinedStyle = `${outerStyle}.${innerStyle}`;
        return `<${combinedStyle}>${content}</>`;
      });
    }

    while ((match = regex.exec(processedText)) !== null) {
      const [fullMatch, styleString, content] = match;
      const matchStart = match.index;

      // Add text before the match
      const beforeText = processedText.slice(lastIndex, matchStart);
      plainText += beforeText;
      styledText += beforeText;

      // Parse styles
      const parsedStyles = TextStyler.parseStyleString(styleString);

      if (parsedStyles.length > 0) {
        // Even empty content should be handled
        // Record style range for MAGIC Schema
        const startIndex = plainText.length;
        const endIndex = startIndex + content.length;

        // Only add style range if there's actual content
        if (content.length > 0) {
          // Store the original style string for MAGIC schema compatibility
          styles.push([startIndex, endIndex, styleString]);
        }

        // Add content
        plainText += content;

        // Add styled content if colors are enabled
        if (useColors) {
          styledText += Colorizer.applyColors(content, parsedStyles, true);
        } else {
          styledText += content;
        }
      } else {
        // No valid styles, just add the content
        plainText += content;
        styledText += content;
      }

      lastIndex = matchStart + fullMatch.length;
    }

    // Add remaining text
    const remainingText = processedText.slice(lastIndex);
    plainText += remainingText;
    styledText += remainingText;

    // If no styles were found, return the original text with undefined styles
    if (styles.length === 0) {
      return {
        plainText: plainText || text,
        styledText: useColors ? styledText || text : plainText || text,
        styles: undefined,
      };
    }

    const result = { plainText, styledText, styles };

    // Cache the result for future use
    // Store the full result as JSON in styled field, plain text in plain field
    cache.set(cacheKey, JSON.stringify(result), plainText);

    return result;
  }

  /**
   * Parses a style string into an array of valid color names.
   * Handles dot-separated styles like "red.bold.underline".
   *
   * @param {string} styleString - Style string to parse
   * @returns {ColorName[]} Array of valid color names
   *
   * @example
   * ```typescript
   * const styles = TextStyler.parseStyleString('red.bold.underline');
   * // Returns: ['red', 'bold', 'underline']
   * ```
   */
  public static parseStyleString(styleString: string): ColorName[] {
    if (!styleString || styleString === '/' || styleString === '</>') {
      return [];
    }

    // Check cache first
    const cached = TextStyler.styleParseCache.get(styleString);
    if (cached) {
      return cached;
    }

    const validStyles = TextStyler.VALID_STYLES;

    // Split by dots and filter valid styles
    const styles = styleString.split('.');
    const result: ColorName[] = [];

    for (let i = 0; i < styles.length; i++) {
      const trimmed = styles[i].trim();
      if (!trimmed) continue;

      let styleToProcess = trimmed;

      // Check if this is 'bg' which should be combined with the next color
      if (trimmed.toLowerCase() === 'bg' && i + 1 < styles.length) {
        const nextStyle = styles[i + 1].trim();
        if (nextStyle) {
          // Combine bg with the next color and skip the next iteration
          styleToProcess = `bg${nextStyle.charAt(0).toUpperCase()}${nextStyle
            .slice(1)
            .toLowerCase()}`;
          i++; // Skip the next style since we've combined it
        }
      }

      // Normalize to lowercase for comparisons/tests
      const lower = styleToProcess.toLowerCase();
      let normalized: string | undefined;

      switch (lower) {
        case 'brightblack':
          normalized = 'brightBlack';
          break;
        case 'brightred':
          normalized = 'brightRed';
          break;
        case 'brightgreen':
          normalized = 'brightGreen';
          break;
        case 'brightyellow':
          normalized = 'brightYellow';
          break;
        case 'brightblue':
          normalized = 'brightBlue';
          break;
        case 'brightmagenta':
          normalized = 'brightMagenta';
          break;
        case 'brightcyan':
          normalized = 'brightCyan';
          break;
        case 'brightwhite':
          normalized = 'brightWhite';
          break;
        case 'bgbrightblack':
          normalized = 'bgBrightBlack';
          break;
        case 'bgbrightred':
          normalized = 'bgBrightRed';
          break;
        case 'bgbrightgreen':
          normalized = 'bgBrightGreen';
          break;
        case 'bgbrightyellow':
          normalized = 'bgBrightYellow';
          break;
        case 'bgbrightblue':
          normalized = 'bgBrightBlue';
          break;
        case 'bgbrightmagenta':
          normalized = 'bgBrightMagenta';
          break;
        case 'bgbrightcyan':
          normalized = 'bgBrightCyan';
          break;
        case 'bgbrightwhite':
          normalized = 'bgBrightWhite';
          break;
        // background lowercase variants to proper camel
        case 'bgblack':
          normalized = 'bgBlack';
          break;
        case 'bgred':
          normalized = 'bgRed';
          break;
        case 'bggreen':
          normalized = 'bgGreen';
          break;
        case 'bgyellow':
          normalized = 'bgYellow';
          break;
        case 'bgblue':
          normalized = 'bgBlue';
          break;
        case 'bgmagenta':
          normalized = 'bgMagenta';
          break;
        case 'bgcyan':
          normalized = 'bgCyan';
          break;
        case 'bgwhite':
          normalized = 'bgWhite';
          break;
        case 'bggray':
        case 'bggrey':
          normalized = 'bgGray';
          break;
        case 'grey':
          normalized = 'gray';
          break;
        default:
          normalized = lower;
      }

      // Check if the normalized or original style is valid
      if (validStyles.has(normalized)) {
        result.push(normalized as ColorName);
      } else if (validStyles.has(styleToProcess)) {
        result.push(styleToProcess as ColorName);
      }
    }

    // Cache the result
    TextStyler.styleParseCache.set(styleString, result);

    // Limit cache size to prevent memory issues
    if (TextStyler.styleParseCache.size > 1000) {
      // Clear the oldest half of entries
      const entries = Array.from(TextStyler.styleParseCache.entries());
      const toDelete = entries.slice(0, 500);
      toDelete.forEach(([key]) => TextStyler.styleParseCache.delete(key));
    }

    return result;
  }

  /**
   * Combines multiple styling methods in a single text.
   * Processes brackets first, then applies additional styling.
   *
   * @param {string} text - Text to style
   * @param {object} options - Styling options
   * @returns {string} Styled text
   *
   * @example
   * ```typescript
   * const result = TextStyler.combinedStyle(
   *   '<red>Error:</> Connection to <yellow>database</> failed',
   *   {
   *     additionalParts: [[' [CRITICAL]', 'red', 'bold', 'blink']],
   *     useColors: true
   *   }
   * );
   * ```
   */
  public static combinedStyle(
    text: string,
    options: {
      additionalParts?: Part[];
      styleMap?: StyleMap;
      useColors?: boolean;
    } = {}
  ): string {
    const { additionalParts, styleMap, useColors = true } = options;

    // First, parse any angle bracket syntax
    let result = TextStyler.parseBrackets(text, useColors);

    // Then apply index-based styling if provided
    if (styleMap && Object.keys(styleMap).length > 0) {
      result = TextStyler.styleByIndex(result, styleMap, useColors);
    }

    // Finally, append any additional parts
    if (additionalParts && additionalParts.length > 0) {
      result += TextStyler.styleParts(additionalParts, useColors);
    }

    return result;
  }

  /**
   * Strips all ANSI color codes from text.
   * Useful for getting plain text from styled strings.
   *
   * @param {string} text - Text with ANSI codes
   * @returns {string} Plain text
   *
   * @example
   * ```typescript
   * const plain = TextStyler.stripStyles(styledText);
   * ```
   */
  public static stripStyles(text: string): string {
    return Colorizer.stripAnsi(text);
  }

  /**
   * Counts visible characters in styled text (excluding ANSI codes).
   *
   * @param {string} text - Text with potential ANSI codes
   * @returns {number} Visible character count
   */
  public static visibleLength(text: string): number {
    return Colorizer.visibleLength(text);
  }

  /**
   * Validates a style map to ensure all indices are valid.
   *
   * @param {string} text - Text to validate against
   * @param {StyleMap} styleMap - Style map to validate
   * @returns {object} Validation result
   */
  public static validateStyleMap(
    text: string,
    styleMap: StyleMap
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!text) {
      errors.push('Text is empty');
      return { valid: false, errors };
    }

    // Count actual words (non-whitespace)
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    for (const [indexStr, styles] of Object.entries(styleMap)) {
      const index = parseInt(indexStr, 10);

      // Check if index is valid
      if (isNaN(index)) {
        errors.push(`Invalid index: ${indexStr}`);
        continue;
      }

      if (index < 0) {
        errors.push(`Negative index: ${index}`);
        continue;
      }

      if (index >= wordCount) {
        errors.push(`Index ${index} out of bounds (text has ${wordCount} words)`);
        continue;
      }

      // Validate styles
      if (!Array.isArray(styles)) {
        errors.push(`Styles for index ${index} must be an array`);
        continue;
      }

      for (const style of styles) {
        if (typeof style !== 'string') {
          errors.push(`Invalid style type at index ${index}: ${typeof style}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Escapes angle bracket syntax in text to display literal brackets.
   *
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  public static escapeBrackets(text: string): string {
    return text.replace(/</g, '\\<').replace(/>/g, '\\>');
  }

  /**
   * Unescapes angle bracket syntax in text.
   *
   * @param {string} text - Text to unescape
   * @returns {string} Unescaped text
   */
  public static unescapeBrackets(text: string): string {
    return text.replace(/\\</g, '<').replace(/\\>/g, '>');
  }
}

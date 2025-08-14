// File: src/parsers/TemplateParser.ts

import { ColorName } from '../types';
import { Colorizer } from '../core/Colorizer';

/**
 * Token types for template parsing.
 * @enum {string}
 * @private
 */
enum TokenType {
  TEXT = 'TEXT',
  STYLE_START = 'STYLE_START',
  STYLE_END = 'STYLE_END',
  VARIABLE = 'VARIABLE',
}

/**
 * Represents a parsed token from the template.
 * @interface Token
 * @private
 */
interface Token {
  type: TokenType;
  value: string;
  styles?: ColorName[];
  position?: number;
}

/**
 * TemplateParser handles parsing and formatting of template strings with style syntax.
 * Supports both @style{text} syntax and <style>text</> angle bracket syntax.
 * 
 * @class TemplateParser
 * 
 * @example
 * ```typescript
 * const parser = new TemplateParser();
 * 
 * // Parse template with @ syntax
 * const result = parser.parse`@red.bold{Error:} Message failed`;
 * 
 * // Parse with variables
 * const user = 'john';
 * const result = parser.parse`@green{User ${user}} logged in`;
 * 
 * // Parse with angle bracket syntax
 * const result = parser.parseString('<red.bold>Error:</> Connection failed');
 * 
 * // Parse complex nested styles
 * const result = parser.parse`
 *   @white.bgBlue.bold{ HEADER }
 *   @yellow{Warning:} System at @red{critical} state
 * `;
 * ```
 */
export class TemplateParser {
  /**
   * Whether to apply colors to output.
   * @private
   * @readonly
   */
  private readonly useColors: boolean;

  /**
   * Cache for parsed templates to improve performance.
   * @private
   * @static
   */
  private static templateCache = new Map<string, Token[]>();

  /**
   * Maximum cache size to prevent memory leaks.
   * @private
   * @static
   * @readonly
   */
  private static readonly MAX_CACHE_SIZE = 500;

  /**
   * Regular expression for matching @style{content} tags.
   * Matches: @style{content} or @style.modifier{content}
   * @private
   * @readonly
   */
  private readonly styleRegex = /@([\w.]+)\{([^}]*)\}/g;

  /**
   * Regular expression for matching angle bracket syntax.
   * Matches: <style>content</> or <style.modifier>content</>
   * @private
   * @readonly
   */
  private readonly angleBracketRegex = /<([^>]+?)>(.*?)<\/>/g;

  /**
   * Creates a new TemplateParser instance.
   * 
   * @param {boolean} [useColors=true] - Whether to apply colors to output
   */
  constructor(useColors = true) {
    this.useColors = useColors;
  }

  /**
   * Parses a template literal with @style{} syntax.
   * This is the main entry point for template literal parsing.
   * 
   * @param {TemplateStringsArray} strings - Template literal strings
   * @param {...unknown[]} values - Interpolated values
   * @returns {string} Formatted string with styles applied
   * 
   * @example
   * ```typescript
   * const result = parser.parse`
   *   @red.bold{Error:} ${errorMessage}
   *   @yellow{Warning:} System at @red{${criticalLevel}%}
   * `;
   * ```
   */
  public parse(strings: TemplateStringsArray, ...values: unknown[]): string {
    // Reconstruct the full template with placeholders
    let template = '';
    strings.forEach((str, i) => {
      template += str;
      if (i < values.length) {
        // Use a placeholder that won't conflict with style syntax
        template += `\${${i}}`;
      }
    });

    // Check cache
    const cacheKey = template;
    let tokens = TemplateParser.templateCache.get(cacheKey);

    if (!tokens) {
      tokens = this.tokenize(template);
      TemplateParser.addToCache(cacheKey, tokens);
    }

    // Apply values and format
    return this.format(tokens, values);
  }

  /**
   * Parses a string with style syntax (not a template literal).
   * Supports both @style{text} and <style>text</> syntax.
   * 
   * @param {string} text - Text with style syntax
   * @returns {string} Formatted string with styles applied
   * 
   * @example
   * ```typescript
   * // @ syntax
   * const result = parser.parseString('@red.bold{Error:} Connection failed');
   * 
   * // Angle bracket syntax
   * const result = parser.parseString('<red.bold>Error:</> Connection failed');
   * ```
   */
  public parseString(text: string): string {
    // First parse angle brackets, then @ syntax
  const result = this.parseAngleBrackets(text);
    
    const tokens = this.tokenize(result);
    return this.format(tokens, []);
  }

  /**
   * Parses a string with angle bracket syntax <style>text</>.
   * 
   * @param {string} text - Text with angle bracket syntax
   * @returns {string} Formatted string with styles applied
   * 
   * @example
   * ```typescript
   * const result = parser.parseAngleBrackets('<red.bold>Error:</> <yellow>Warning</> detected');
   * ```
   */
  public parseAngleBrackets(text: string): string {
    if (!this.useColors) {
      // Remove all angle bracket styling syntax
      return text.replace(this.angleBracketRegex, '$2');
    }

    // Replace angle bracket syntax with styled text
    return text.replace(this.angleBracketRegex, (match, styles, content) => {
      const styleArray = this.parseStyleString(styles);
      if (styleArray.length === 0) {
        return content;
      }
      return Colorizer.applyColors(content, styleArray, this.useColors);
    });
  }

  /**
   * Creates a bracket parser function bound to this parser.
   * Returns a function that parses angle bracket syntax.
   * 
   * @returns {Function} Angle bracket parser function
   * 
   * @example
   * ```typescript
   * const parseBrackets = parser.createBracketParser();
   * const result = parseBrackets('<red>Error:</> Failed');
   * ```
   */
  public createBracketParser(): (text: string) => string {
    return (text: string): string => {
      return this.parseAngleBrackets(text);
    };
  }

  /**
   * Tokenizes a template string into parseable tokens.
   * Processes @style{content} syntax.
   * 
   * @param {string} template - Template string to tokenize
   * @returns {Token[]} Array of tokens
   * @private
   */
  private tokenize(template: string): Token[] {
    const tokens: Token[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex state
    this.styleRegex.lastIndex = 0;

    while ((match = this.styleRegex.exec(template)) !== null) {
      // Add any text before the match
      if (match.index > lastIndex) {
        const text = template.substring(lastIndex, match.index);
        if (text) {
          tokens.push({
            type: TokenType.TEXT,
            value: text,
            position: lastIndex,
          });
        }
      }

      // Parse the style string
      const styleString = match[1];
      const content = match[2];
      const styles = this.parseStyleString(styleString);

      // Add styled content token
      tokens.push({
        type: TokenType.STYLE_START,
        value: content,
        styles: styles,
        position: match.index,
      });

      lastIndex = this.styleRegex.lastIndex;
    }

    // Add any remaining text
    if (lastIndex < template.length) {
      const text = template.substring(lastIndex);
      if (text) {
        tokens.push({
          type: TokenType.TEXT,
          value: text,
          position: lastIndex,
        });
      }
    }

    return tokens;
  }

  /**
   * Formats tokens with interpolated values.
   * 
   * @param {Token[]} tokens - Array of tokens to format
   * @param {unknown[]} values - Values to interpolate
   * @returns {string} Formatted string
   * @private
   */
  private format(tokens: Token[], values: unknown[]): string {
    let result = '';

    for (const token of tokens) {
      let text = token.value;

      // Replace placeholders with actual values
      text = text.replace(/\$\{(\d+)\}/g, (match, index) => {
        const idx = parseInt(index, 10);
        if (idx < values.length) {
          return String(values[idx]);
        }
        return match;
      });

      // Apply styles if present
      if (token.type === TokenType.STYLE_START && token.styles && token.styles.length > 0) {
        result += this.useColors 
          ? Colorizer.applyColors(text, token.styles, this.useColors)
          : text;
      } else {
        result += text;
      }
    }

    return result;
  }

  /**
   * Parses a style string into an array of color names.
   * Handles dot-separated styles like "red.bold.underline".
   * 
   * @param {string} styleString - Style string to parse
   * @returns {ColorName[]} Array of color names
   * @private
   * 
   * @example
   * ```typescript
   * const styles = parser.parseStyleString('red.bold.underline');
   * // Returns: ['red', 'bold', 'underline']
   * ```
   */
  private parseStyleString(styleString: string): ColorName[] {
    if (!styleString || styleString === '/' || styleString === '</>' || styleString === '</>') {
      return [];
    }

    // Split by dots and filter valid styles
    const styles = styleString.split('.');
    const validStyles: ColorName[] = [];

    for (const style of styles) {
      const trimmed = style.trim();
      if (trimmed && this.isValidStyle(trimmed)) {
        validStyles.push(trimmed as ColorName);
      }
    }

    return validStyles;
  }

  /**
   * Checks if a style name is valid.
   * 
   * @param {string} style - Style name to check
   * @returns {boolean} True if valid
   * @private
   */
  private isValidStyle(style: string): boolean {
    const validStyles = new Set<string>([
      // Foreground colors
      'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
      'gray', 'grey',
      
      // Bright foreground colors
      'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
      'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
      
      // Background colors
      'bgBlack', 'bgRed', 'bgGreen', 'bgYellow',
      'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite',
      'bgGray', 'bgGrey',
      
      // Bright background colors
      'bgBrightBlack', 'bgBrightRed', 'bgBrightGreen', 'bgBrightYellow',
      'bgBrightBlue', 'bgBrightMagenta', 'bgBrightCyan', 'bgBrightWhite',
      
      // Text styles
      'bold', 'dim', 'italic', 'underline', 'blink',
      'reverse', 'inverse', 'hidden', 'strikethrough',
    ]);

    return validStyles.has(style);
  }

  /**
   * Creates a formatter function bound to this parser.
   * Returns a tagged template literal function.
   * 
   * @returns {Function} Template literal tag function
   * 
   * @example
   * ```typescript
   * const fmt = parser.createFormatter();
   * const result = fmt`@red{Error:} ${message}`;
   * ```
   */
  public createFormatter(): (strings: TemplateStringsArray, ...values: unknown[]) => string {
    return (strings: TemplateStringsArray, ...values: unknown[]): string => {
      return this.parse(strings, ...values);
    };
  }

  /**
   * Adds tokens to cache with size management.
   * 
   * @param {string} key - Cache key
   * @param {Token[]} tokens - Tokens to cache
   * @private
   * @static
   */
  private static addToCache(key: string, tokens: Token[]): void {
    if (TemplateParser.templateCache.size >= TemplateParser.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = TemplateParser.templateCache.keys().next().value;
      if (firstKey !== undefined) {
        TemplateParser.templateCache.delete(firstKey);
      }
    }

    TemplateParser.templateCache.set(key, tokens);
  }

  /**
   * Clears the template cache.
   * Useful for testing or when color support changes.
   * 
   * @static
   * 
   * @example
   * ```typescript
   * TemplateParser.clearCache();
   * ```
   */
  public static clearCache(): void {
    TemplateParser.templateCache.clear();
  }

  /**
   * Escapes special characters in template syntax.
   * Use this when you want to display literal @{}, <>, or </> in output.
   * 
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @static
   * 
   * @example
   * ```typescript
   * const escaped = TemplateParser.escape('Use @{} or <> for styling');
   * // Returns: 'Use \\@{} or \\<\\> for styling'
   * ```
   */
  public static escape(text: string): string {
    return text
      .replace(/@/g, '\\@')
      .replace(/</g, '\\<')
      .replace(/>/g, '\\>');
  }

  /**
   * Unescapes special characters in template syntax.
   * 
   * @param {string} text - Text to unescape
   * @returns {string} Unescaped text
   * @static
   * 
   * @example
   * ```typescript
   * const unescaped = TemplateParser.unescape('Use \\@{} or \\<\\> for styling');
   * // Returns: 'Use @{} or <> for styling'
   * ```
   */
  public static unescape(text: string): string {
    return text
      .replace(/\\@/g, '@')
      .replace(/\\</g, '<')
      .replace(/\\>/g, '>');
  }

  /**
   * Validates template syntax without applying styles.
   * Useful for checking if a template is valid before use.
   * Supports both @{} and <> syntax.
   * 
   * @param {string} template - Template to validate
   * @returns {object} Validation result with any errors
   * @static
   * 
   * @example
   * ```typescript
   * const result = TemplateParser.validate('@red{text} <blue>other</>');
   * if (!result.valid) {
   *   console.error('Template errors:', result.errors);
   * }
   * ```
   */
  public static validate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let openBraces = 0;
    let openAngles = 0;
    let position = 0;

    // Check for unmatched braces and angle brackets
    for (const char of template) {
      if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces < 0) {
          errors.push(`Unexpected closing brace at position ${position}`);
        }
      } else if (char === '<' && template[position + 1] !== '/') {
        openAngles++;
      } else if (char === '<' && template.substring(position, position + 3) === '</>') {
        openAngles--;
        if (openAngles < 0) {
          errors.push(`Unexpected closing angle bracket at position ${position}`);
        }
      }
      position++;
    }

    if (openBraces > 0) {
      errors.push(`Unclosed brace(s) in template`);
    }

    if (openAngles > 0) {
      errors.push(`Unclosed angle bracket(s) in template`);
    }

    // Check for invalid @ style syntax
    const styleRegex = /@([\w.]+)\{/g;
    let match;
    while ((match = styleRegex.exec(template)) !== null) {
      const styles = match[1].split('.');
      for (const style of styles) {
        if (!style) {
          errors.push(`Empty style at position ${match.index}`);
        }
      }
    }

    // Check for invalid angle bracket style syntax
    const angleRegex = /<([^>]+?)>/g;
    while ((match = angleRegex.exec(template)) !== null) {
      // Skip closing tags
      if (match[1] === '/') continue;
      
      const styles = match[1].split('.');
      for (const style of styles) {
        if (!style) {
          errors.push(`Empty style in angle brackets at position ${match.index}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts between different style syntaxes.
   * 
   * @param {string} text - Text to convert
   * @param {string} from - Source syntax ('at' for @{}, 'angle' for <>)
   * @param {string} to - Target syntax ('at' for @{}, 'angle' for <>)
   * @returns {string} Converted text
   * @static
   * 
   * @example
   * ```typescript
   * // Convert @ syntax to angle brackets
   * const result = TemplateParser.convertSyntax(
   *   '@red{Error:} @yellow{Warning}',
   *   'at',
   *   'angle'
   * );
   * // Returns: '<red>Error:</> <yellow>Warning</>'
   * 
   * // Convert angle brackets to @ syntax
   * const result = TemplateParser.convertSyntax(
   *   '<red>Error:</> <yellow>Warning</>',
   *   'angle',
   *   'at'
   * );
   * // Returns: '@red{Error:} @yellow{Warning}'
   * ```
   */
  public static convertSyntax(text: string, from: 'at' | 'angle', to: 'at' | 'angle'): string {
    if (from === to) return text;

    if (from === 'at' && to === 'angle') {
      // Convert @style{content} to <style>content</>
      return text.replace(/@([\w.]+)\{([^}]*)\}/g, '<$1>$2</>');
    } else if (from === 'angle' && to === 'at') {
      // Convert <style>content</> to @style{content}
      return text.replace(/<([^>]+?)>(.*?)<\/>/g, '@$1{$2}');
    }

    return text;
  }

  /**
   * Combines multiple style syntaxes in a single text.
   * Processes both @{} and <> syntax.
   * 
   * @param {string} text - Text with mixed syntax
   * @returns {string} Formatted text with styles applied
   * 
   * @example
   * ```typescript
   * const result = parser.parseMixed(
   *   '@red{Error:} <yellow>Warning</> detected'
   * );
   * ```
   */
  public parseMixed(text: string): string {
    // First parse angle brackets, then @ syntax
  const result = this.parseAngleBrackets(text);
    
    // Then parse @ syntax
    const tokens = this.tokenize(result);
    return this.format(tokens, []);
  }
}
// File: src/core/StyleBuilder.ts

import { ColorName } from '../types';
import { Colorizer } from './Colorizer';

/**
 * StyleBuilder provides a chainable API for building styled strings.
 * Similar to popular libraries like Chalk, it allows intuitive chaining
 * of color and style modifiers.
 * 
 * @class StyleBuilder
 * 
 * @example
 * ```typescript
 * const style = new StyleBuilder();
 * 
 * // Chain multiple styles
 * const text = style.red.bold('Error message');
 * 
 * // Create reusable style functions
 * const errorStyle = style.red.bold.underline;
 * const successStyle = style.green.bold;
 * 
 * console.log(errorStyle('Critical error'));
 * console.log(successStyle('Operation complete'));
 * 
 * // Combine with template literals
 * const message = `${style.cyan('User')} ${style.yellow.bold('logged in')}`;
 * ```
 */
type StyleBuilderCallable = StyleBuilder & ((text: string) => string);

export class StyleBuilder {
  /**
   * Stack of styles to apply to text.
   * Accumulates as properties are accessed via the Proxy.
   * @private
   * @readonly
   */
  private readonly styles: ColorName[] = [];

  /**
   * Whether to apply colors or return plain text.
   * Can be toggled for environments that don't support colors.
   * @private
   * @readonly
   */
  private readonly useColors: boolean;

  /**
   * Cache for style combinations to improve performance.
   * Maps style arrays (as comma-separated strings) to StyleBuilder instances.
   * @private
   * @static
   */
  private static styleCache = new Map<string, StyleBuilder>();

  /**
   * Maximum number of cached style combinations.
   * Prevents memory leaks from unbounded cache growth.
   * @private
   * @static
   * @readonly
   */
  private static readonly MAX_CACHE_SIZE = 1000;

  /**
   * Creates a new StyleBuilder instance.
   * 
   * @param {boolean} [useColors=true] - Whether to apply colors to output
   * @param {ColorName[]} [initialStyles=[]] - Initial styles to apply (used internally for chaining)
   */
  constructor(useColors = true, initialStyles: ColorName[] = []) {
    this.useColors = useColors;
    this.styles = [...initialStyles];

    // Return a Proxy to enable property chaining
  return new Proxy(this, {
      /**
       * Proxy getter to handle style property access.
       * Allows chaining of style names as properties.
       * 
       * @param {StyleBuilder} target - The StyleBuilder instance
       * @param {string | symbol} prop - The property being accessed
       * @returns {any} StyleBuilder instance, function, or property value
       */
      get(target: StyleBuilder, prop: string | symbol): unknown {
        // Ensure call-style helpers always return the callable builder
        if (prop === 'valueOf' || prop === 'toString') {
          return () => target.buildFunction();
        }

        // Handle symbol properties and built-in methods
        if (typeof prop === 'symbol') {
          if (prop === Symbol.for('nodejs.util.inspect.custom')) {
            return () => target.buildFunction();
          }
          const value = Reflect.get(target as object, prop);
          if (typeof value === 'function') {
            const fn = value as (...args: unknown[]) => unknown;
            return fn.bind(target);
          }
          return value;
        }

        // Handle properties defined on the target instance
        if (prop in target) {
          const value = Reflect.get(target as object, prop);
          if (typeof value === 'function') {
            const fn = value as (...args: unknown[]) => unknown;
            return fn.bind(target);
          }
          return value;
        }

        // Handle color/style names
        if (StyleBuilder.isValidStyle(prop as string)) {
          return target.chain(prop as ColorName);
        }

        // Special case: if accessing a property that doesn't exist,
        // return a function that applies current styles
        return target.buildFunction();
      },

      /**
       * Proxy apply trap to make the StyleBuilder callable.
       * Allows using the builder as a function directly.
       * 
       * @param {StyleBuilder} target - The StyleBuilder instance
       * @param {any} _thisArg - The 'this' context (unused)
       * @param {any[]} args - Arguments passed to the function
       * @returns {string} The styled text
       */
      apply(target: StyleBuilder, _thisArg: unknown, args: unknown[]): string {
        const fn = target.buildFunction();
        return fn(String(args[0] ?? ''));
      },

      /**
       * Proxy has trap for property existence checks.
       * 
       * @param {StyleBuilder} target - The StyleBuilder instance
       * @param {string | symbol} prop - The property to check
       * @returns {boolean} Whether the property exists
       */
      has(target: StyleBuilder, prop: string | symbol): boolean {
        if (typeof prop === 'symbol') return prop in target;
        return StyleBuilder.isValidStyle(prop as string) || prop in target;
      }
  }) as unknown as StyleBuilderCallable;
  }

  /**
   * Chains a new style onto the current style stack.
   * Creates a new StyleBuilder instance with the accumulated styles.
   * 
   * @param {ColorName} style - The style to add to the chain
   * @returns {StyleBuilder} A new StyleBuilder with the added style
   * @private
   */
  private chain(style: ColorName): StyleBuilder {
    const newStyles = [...this.styles, style];
    const cacheKey = newStyles.join(',');

    // Check cache first
  const cached = StyleBuilder.styleCache.get(cacheKey);
    if (cached && cached.useColors === this.useColors) {
      return cached;
    }

    // Create new instance and cache it
    const newBuilder = new StyleBuilder(this.useColors, newStyles);
    StyleBuilder.addToCache(cacheKey, newBuilder);
    return newBuilder;
  }

  /**
   * Builds a function that applies the accumulated styles to text.
   * This is the terminal operation in the style chain.
   * 
   * @returns {Function} A function that takes text and returns styled text
   * @private
   */
  private buildFunction(): (text: string) => string {
    const styles = this.styles;
    const useColors = this.useColors;

    // Return a function that applies the accumulated styles
    return function styleFunction(text: string): string {
      if (!text || !useColors || styles.length === 0) {
        return String(text || '');
      }

      // Apply all accumulated styles using Colorizer
      return Colorizer.applyColors(String(text), styles, useColors);
    };
  }

  /**
   * Checks if a string is a valid style name.
   * Used to determine if a property access should create a new style chain.
   * 
   * @param {string} style - The style name to check
   * @returns {boolean} True if the style is valid
   * @static
   * @private
   */
  private static isValidStyle(style: string): boolean {
    const validStyles: Set<string> = new Set([
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
      'reverse', 'inverse', 'hidden', 'strikethrough'
    ]);

    return validStyles.has(style);
  }

  /**
   * Adds a style combination to the cache with size management.
   * Implements LRU-like behavior by removing oldest entries when cache is full.
   * 
   * @param {string} key - The cache key (comma-separated styles)
   * @param {StyleBuilder} builder - The StyleBuilder instance to cache
   * @static
   * @private
   */
  private static addToCache(key: string, builder: StyleBuilder): void {
    // Implement cache size limit
    if (StyleBuilder.styleCache.size >= StyleBuilder.MAX_CACHE_SIZE) {
      // Remove the oldest entry (first in map)
      const firstKey = StyleBuilder.styleCache.keys().next().value;
      if (firstKey !== undefined) {
        StyleBuilder.styleCache.delete(firstKey);
      }
    }

    StyleBuilder.styleCache.set(key, builder);
  }

  /**
   * Clears the style cache.
   * Useful for testing or when color support changes.
   * 
   * @static
   */
  public static clearCache(): void {
    StyleBuilder.styleCache.clear();
  }

  /**
   * Gets the current style stack.
   * Useful for debugging or introspection.
   * 
   * @returns {ColorName[]} Array of accumulated styles
   */
  public getStyles(): ColorName[] {
    return [...this.styles];
  }

  /**
   * Checks if colors are enabled for this builder.
   * 
   * @returns {boolean} Whether colors are enabled
   */
  public isColorEnabled(): boolean {
    return this.useColors;
  }

  /**
   * Creates a new StyleBuilder with specified color setting.
   * Useful for creating conditional styling based on environment.
   * 
   * @param {boolean} useColors - Whether to use colors
   * @returns {StyleBuilder} New StyleBuilder instance
   * @static
   */
  public static create(useColors: boolean): StyleBuilder {
    return new StyleBuilder(useColors);
  }

  // ============================================================
  // Convenience Methods for Direct Style Access
  // ============================================================

  /**
   * Apply red color.
   * @returns {StyleBuilder} New builder with red style
   */
  get red(): StyleBuilder { return this.chain('red'); }

  /**
   * Apply green color.
   * @returns {StyleBuilder} New builder with green style
   */
  get green(): StyleBuilder { return this.chain('green'); }

  /**
   * Apply yellow color.
   * @returns {StyleBuilder} New builder with yellow style
   */
  get yellow(): StyleBuilder { return this.chain('yellow'); }

  /**
   * Apply blue color.
   * @returns {StyleBuilder} New builder with blue style
   */
  get blue(): StyleBuilder { return this.chain('blue'); }

  /**
   * Apply magenta color.
   * @returns {StyleBuilder} New builder with magenta style
   */
  get magenta(): StyleBuilder { return this.chain('magenta'); }

  /**
   * Apply cyan color.
   * @returns {StyleBuilder} New builder with cyan style
   */
  get cyan(): StyleBuilder { return this.chain('cyan'); }

  /**
   * Apply white color.
   * @returns {StyleBuilder} New builder with white style
   */
  get white(): StyleBuilder { return this.chain('white'); }

  /**
   * Apply black color.
   * @returns {StyleBuilder} New builder with black style
   */
  get black(): StyleBuilder { return this.chain('black'); }

  /**
   * Apply gray color.
   * @returns {StyleBuilder} New builder with gray style
   */
  get gray(): StyleBuilder { return this.chain('gray'); }
  
  /**
   * Apply grey color (alias for gray).
   * @returns {StyleBuilder} New builder with grey style
   */
  get grey(): StyleBuilder { return this.chain('gray'); }

  // Bright colors
  get brightRed(): StyleBuilder { return this.chain('brightRed'); }
  get brightGreen(): StyleBuilder { return this.chain('brightGreen'); }
  get brightYellow(): StyleBuilder { return this.chain('brightYellow'); }
  get brightBlue(): StyleBuilder { return this.chain('brightBlue'); }
  get brightMagenta(): StyleBuilder { return this.chain('brightMagenta'); }
  get brightCyan(): StyleBuilder { return this.chain('brightCyan'); }
  get brightWhite(): StyleBuilder { return this.chain('brightWhite'); }
  get brightBlack(): StyleBuilder { return this.chain('brightBlack'); }

  // Background colors
  get bgRed(): StyleBuilder { return this.chain('bgRed'); }
  get bgGreen(): StyleBuilder { return this.chain('bgGreen'); }
  get bgYellow(): StyleBuilder { return this.chain('bgYellow'); }
  get bgBlue(): StyleBuilder { return this.chain('bgBlue'); }
  get bgMagenta(): StyleBuilder { return this.chain('bgMagenta'); }
  get bgCyan(): StyleBuilder { return this.chain('bgCyan'); }
  get bgWhite(): StyleBuilder { return this.chain('bgWhite'); }
  get bgBlack(): StyleBuilder { return this.chain('bgBlack'); }
  get bgGray(): StyleBuilder { return this.chain('bgGray'); }
  get bgGrey(): StyleBuilder { return this.chain('bgGray'); }

  // Bright background colors
  get bgBrightRed(): StyleBuilder { return this.chain('bgBrightRed'); }
  get bgBrightGreen(): StyleBuilder { return this.chain('bgBrightGreen'); }
  get bgBrightYellow(): StyleBuilder { return this.chain('bgBrightYellow'); }
  get bgBrightBlue(): StyleBuilder { return this.chain('bgBrightBlue'); }
  get bgBrightMagenta(): StyleBuilder { return this.chain('bgBrightMagenta'); }
  get bgBrightCyan(): StyleBuilder { return this.chain('bgBrightCyan'); }
  get bgBrightWhite(): StyleBuilder { return this.chain('bgBrightWhite'); }
  get bgBrightBlack(): StyleBuilder { return this.chain('bgBrightBlack'); }

  // Text styles
  get bold(): StyleBuilder { return this.chain('bold'); }
  get dim(): StyleBuilder { return this.chain('dim'); }
  get italic(): StyleBuilder { return this.chain('italic'); }
  get underline(): StyleBuilder { return this.chain('underline'); }
  get blink(): StyleBuilder { return this.chain('blink'); }
  get reverse(): StyleBuilder { return this.chain('reverse'); }
  get inverse(): StyleBuilder { return this.chain('inverse'); }
  get hidden(): StyleBuilder { return this.chain('hidden'); }
  get strikethrough(): StyleBuilder { return this.chain('strikethrough'); }
}
// File: src/core/StyleBuilder.ts

import type { ColorName } from '../types/colors';
import { Colorizer } from './Colorizer';

/**
 * Callable StyleBuilder type that combines the builder pattern with function calls.
 */
type StyleBuilderCallable = StyleBuilder & ((text: string) => string);

/**
 * StyleBuilder provides a chainable API for building styled strings.
 *
 * Similar to popular libraries like Chalk, it allows intuitive chaining
 * of color and style modifiers. The builder uses a Proxy-based approach
 * to provide dynamic property access and efficient caching of style combinations.
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
export class StyleBuilder {
  /**
   * Set of valid style names for fast lookup.
   *
   * @private
   * @static
   * @readonly
   */
  private static readonly VALID_STYLES: Set<string> = new Set([
    // Foreground colors
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
    // Bright foreground colors
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
    // Background colors
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
    // Bright background colors
    'bgBrightBlack',
    'bgBrightRed',
    'bgBrightGreen',
    'bgBrightYellow',
    'bgBrightBlue',
    'bgBrightMagenta',
    'bgBrightCyan',
    'bgBrightWhite',
    // Extra popular colors (aliases and 256-color picks)
    'purple',
    'brightPurple',
    'bgPurple',
    'bgBrightPurple',
    'teal',
    'brightTeal',
    'bgTeal',
    'bgBrightTeal',
    'lime',
    'brightLime',
    'bgLime',
    'bgBrightLime',
    'orange',
    'brightOrange',
    'bgOrange',
    'bgBrightOrange',
    'pink',
    'brightPink',
    'bgPink',
    'bgBrightPink',
    'brown',
    'brightBrown',
    'bgBrown',
    'bgBrightBrown',
    'indigo',
    'brightIndigo',
    'bgIndigo',
    'bgBrightIndigo',
    // Text styles
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
   * Local alias for faster access in hot paths.
   *
   * @private
   * @static
   * @readonly
   */
  private static readonly VALID = StyleBuilder.VALID_STYLES;

  /**
   * Alias mapping for alternative style names.
   *
   * @private
   * @static
   * @readonly
   */
  // Some keys are aliases; most properties won't exist, so mark as partial
  private static readonly ALIASES: Partial<Record<string, ColorName>> = {
    grey: 'gray',
    bgGrey: 'bgGray',
    inverse: 'reverse',
  };

  /**
   * Stack of styles to apply to text.
   *
   * Accumulates as properties are accessed via the Proxy.
   *
   * @private
   * @readonly
   */
  private readonly styles: ColorName[] = [];

  /**
   * Whether to apply colors or return plain text.
   *
   * Can be toggled for environments that don't support colors.
   *
   * @private
   * @readonly
   */
  private readonly useColors: boolean;

  /**
   * Cache for style combinations to improve performance.
   *
   * Maps style arrays (as comma-separated strings) to StyleBuilder instances.
   *
   * @private
   * @static
   */
  private static styleCache = new Map<string, StyleBuilder>();

  /**
   * Counter for cache size checks to avoid checking on every add.
   * @private
   * @static
   */
  private static cacheAddCount = 0;

  /**
   * Metadata for cached builders tracking their useColors state.
   *
   * @private
   * @static
   */
  private static cacheMeta = new WeakMap<StyleBuilder, { useColors: boolean }>();

  /**
   * Maximum number of cached style combinations.
   *
   * Prevents memory leaks from unbounded cache growth.
   *
   * @private
   * @static
   * @readonly
   */
  private static readonly MAX_CACHE_SIZE = 1000;

  /**
   * Creates a new StyleBuilder instance.
   *
   * @param {boolean} useColors - Whether to apply colors to output
   * @param {ColorName[]} initialStyles - Initial styles to apply (used internally for chaining)
   */
  constructor(useColors = true, initialStyles: ColorName[] = []) {
    this.useColors = useColors;
    this.styles = [...initialStyles];

    // Create local references for closure
    const styles = this.styles;
    const use = this.useColors;
    const key = styles.length ? styles.join(',') : '';

    // Per-instance cache of immediate child builders (style -> builder)
    const childrenCache: Record<string, StyleBuilderCallable> = Object.create(null);

    /**
     * Apply accumulated styles to text.
     *
     * @param {string} text - The text to style
     * @returns {string} The styled text
     */
    const call = (text: string): string => {
      const input = String(text ?? '');
      // Always route through Colorizer so integrations/tests can spy on calls.
      // Colorizer.applyColors will return the input unchanged when colors are
      // disabled or when there are no styles to apply.
      return Colorizer.applyColors(input, styles, use);
    };

    /**
     * Create a new builder with additional styles.
     *
     * @param {ColorName[]} next - The complete style stack for the new builder
     * @param {string} precomputedKey - Optional pre-computed cache key
     * @returns {StyleBuilderCallable} A new callable style builder
     */
    const createBuilder = (next: ColorName[], precomputedKey?: string): StyleBuilderCallable => {
      // Use cache when possible
      const cacheKey = precomputedKey ?? (next.length ? next.join(',') : '');

      // Skip cache lookup for empty key
      if (cacheKey) {
        const cached = StyleBuilder.styleCache.get(cacheKey);
        if (cached) {
          const meta = StyleBuilder.cacheMeta.get(cached);
          if (meta && meta.useColors === use) {
            return cached as unknown as StyleBuilderCallable;
          }
        }
      }

      const child = new StyleBuilder(use, next) as unknown as StyleBuilderCallable;
      const childSB = child as unknown as StyleBuilder;
      if (cacheKey) {
        StyleBuilder.addToCache(cacheKey, childSB);
        StyleBuilder.cacheMeta.set(childSB, { useColors: use });
      }
      return child;
    };

    /**
     * Proxy handler for dynamic property access and function calls.
     */
    const handler: ProxyHandler<(text: string) => string> = {
      /**
       * Handle property access for style chaining.
       *
       * @param {any} _target - The proxy target (unused)
       * @param {string | symbol} prop - The accessed property
       * @returns {any} The appropriate value or function for the property
       */
      get: (_target, prop: string | symbol): unknown => {
        // Fast path for string properties
        if (typeof prop === 'string') {
          // Fast path: check per-instance child cache first
          const hit = childrenCache[prop];
          if (hit) {
            return hit;
          }

          // Handle style properties
          const alias = StyleBuilder.ALIASES[prop];
          // Resolve alias if present, otherwise use property name
          const styleKey: string = alias !== undefined ? alias : prop;
          const styleName = styleKey as ColorName;

          if (StyleBuilder.VALID.has(styleKey)) {
            // Check global cache
            const nextKey = key ? key + ',' + styleKey : styleKey;
            const cached = StyleBuilder.styleCache.get(nextKey);

            if (cached) {
              const meta = StyleBuilder.cacheMeta.get(cached);
              if (meta && meta.useColors === use) {
                const asCallable = cached as unknown as StyleBuilderCallable;
                childrenCache[prop] = asCallable;
                return asCallable;
              }
            }

            // Build new style array using spread to avoid undefined reads under noUncheckedIndexedAccess
            const nextStyles = styles.length
              ? ([...styles, styleName] as ColorName[])
              : ([styleName] as ColorName[]);

            // Create and cache new builder
            const child = createBuilder(nextStyles, nextKey);
            childrenCache[prop] = child;
            return child;
          }

          // Expose helper methods
          if (prop === 'getStyles') {
            return () => [...styles];
          }
          if (prop === 'isColorEnabled') {
            return () => use;
          }
        }

        // Handle special methods
        if (prop === 'valueOf' || prop === 'toString') {
          return () => call;
        }

        if (prop === Symbol.for('nodejs.util.inspect.custom')) {
          return () => call;
        }

        // For symbol properties, return undefined (except for known symbols)
        if (typeof prop === 'symbol') {
          return undefined;
        }

        // Unknown property returns the callable function
        return call;
      },

      /**
       * Handle function calls on the proxy.
       *
       * @param {any} _target - The proxy target (unused)
       * @param {any} _thisArg - The this context (unused)
       * @param {any[]} args - The function arguments
       * @returns {string} The styled text
       */
      apply: (_target, _thisArg, args: unknown[]): string => {
        const txt = args[0] as unknown as string;
        return call(txt);
      },

      /**
       * Handle 'in' operator checks.
       *
       * @param {any} _target - The proxy target (unused)
       * @param {string | symbol} prop - The property to check
       * @returns {boolean} Whether the property exists
       */
      has: (_target, prop: string | symbol): boolean => {
        if (typeof prop !== 'string') return false;
        if (prop === 'getStyles' || prop === 'isColorEnabled') return true;
        return StyleBuilder.isValidStyle(prop);
      },
    };

    // Return a callable proxy with a properly typed target function
    const targetFn: (text: string) => string = call;
    return new Proxy(targetFn, handler) as unknown as StyleBuilderCallable;
  }

  /**
   * Chains a new style onto the current style stack.
   *
   * Creates a new StyleBuilder instance with the accumulated styles.
   *
   * @param {ColorName} style - The style to add to the chain
   * @returns {StyleBuilder} A new StyleBuilder with the added style
   * @private
   */
  private chain(style: ColorName): StyleBuilder {
    const cacheKey = this.styles.length ? `${this.styles.join(',')},${style}` : style;

    // Check cache first
    const cached = StyleBuilder.styleCache.get(cacheKey);
    if (cached) {
      const meta = StyleBuilder.cacheMeta.get(cached);
      if (meta && meta.useColors === this.useColors) {
        return cached;
      }
    }

    // Create new instance efficiently using spread to avoid undefined reads under noUncheckedIndexedAccess
    const nextStyles = this.styles.length
      ? ([...this.styles, style] as ColorName[])
      : ([style] as ColorName[]);

    // Create and cache new builder
    const newBuilder = new StyleBuilder(this.useColors, nextStyles);
    StyleBuilder.addToCache(cacheKey, newBuilder);
    StyleBuilder.cacheMeta.set(newBuilder, { useColors: this.useColors });
    return newBuilder;
  }

  /**
   * Checks if a string is a valid style name.
   *
   * Used to determine if a property access should create a new style chain.
   *
   * @param {string} style - The style name to check
   * @returns {boolean} True if the style is valid
   * @static
   * @private
   */
  private static isValidStyle(style: string): boolean {
    return StyleBuilder.VALID.has(style);
  }

  /**
   * Adds a style combination to the cache with size management.
   *
   * Implements LRU-like behavior by removing oldest entries when cache is full.
   *
   * @param {string} key - The cache key (comma-separated styles)
   * @param {StyleBuilder} builder - The StyleBuilder instance to cache
   * @static
   * @private
   */
  private static addToCache(key: string, builder: StyleBuilder): void {
    // Only check cache size periodically to improve performance
    if (++StyleBuilder.cacheAddCount % 100 === 0) {
      if (StyleBuilder.styleCache.size >= StyleBuilder.MAX_CACHE_SIZE) {
        // Clear 10% of cache when full
        const toRemove = Math.floor(StyleBuilder.MAX_CACHE_SIZE * 0.1);
        const iter = StyleBuilder.styleCache.keys();
        for (let i = 0; i < toRemove; i++) {
          const next = iter.next();
          if (!next.done) {
            StyleBuilder.styleCache.delete(next.value);
          }
        }
      }
    }

    StyleBuilder.styleCache.set(key, builder);
  }

  /**
   * Clears the style cache.
   *
   * Useful for testing or when color support changes.
   *
   * @static
   */
  public static clearCache(): void {
    StyleBuilder.styleCache.clear();
  }

  /**
   * Gets the current style stack.
   *
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
   *
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
   * Apply red foreground color.
   *
   * @returns {StyleBuilder} New builder with red style
   */
  get red(): StyleBuilder {
    return this.chain('red');
  }

  /**
   * Apply green foreground color.
   *
   * @returns {StyleBuilder} New builder with green style
   */
  get green(): StyleBuilder {
    return this.chain('green');
  }

  /**
   * Apply yellow foreground color.
   *
   * @returns {StyleBuilder} New builder with yellow style
   */
  get yellow(): StyleBuilder {
    return this.chain('yellow');
  }

  /**
   * Apply blue foreground color.
   *
   * @returns {StyleBuilder} New builder with blue style
   */
  get blue(): StyleBuilder {
    return this.chain('blue');
  }

  /**
   * Apply magenta foreground color.
   *
   * @returns {StyleBuilder} New builder with magenta style
   */
  get magenta(): StyleBuilder {
    return this.chain('magenta');
  }

  /**
   * Apply cyan foreground color.
   *
   * @returns {StyleBuilder} New builder with cyan style
   */
  get cyan(): StyleBuilder {
    return this.chain('cyan');
  }

  /**
   * Apply white foreground color.
   *
   * @returns {StyleBuilder} New builder with white style
   */
  get white(): StyleBuilder {
    return this.chain('white');
  }

  /**
   * Apply black foreground color.
   *
   * @returns {StyleBuilder} New builder with black style
   */
  get black(): StyleBuilder {
    return this.chain('black');
  }

  /**
   * Apply gray foreground color.
   *
   * @returns {StyleBuilder} New builder with gray style
   */
  get gray(): StyleBuilder {
    return this.chain('gray');
  }

  /**
   * Apply grey foreground color (alias for gray).
   *
   * @returns {StyleBuilder} New builder with grey style
   */
  get grey(): StyleBuilder {
    return this.chain('gray');
  }

  // ============================================================
  // Bright Foreground Colors
  // ============================================================

  /**
   * Apply bright red foreground color.
   *
   * @returns {StyleBuilder} New builder with bright red style
   */
  get brightRed(): StyleBuilder {
    return this.chain('brightRed');
  }

  /**
   * Apply bright green foreground color.
   *
   * @returns {StyleBuilder} New builder with bright green style
   */
  get brightGreen(): StyleBuilder {
    return this.chain('brightGreen');
  }

  /**
   * Apply bright yellow foreground color.
   *
   * @returns {StyleBuilder} New builder with bright yellow style
   */
  get brightYellow(): StyleBuilder {
    return this.chain('brightYellow');
  }

  /**
   * Apply bright blue foreground color.
   *
   * @returns {StyleBuilder} New builder with bright blue style
   */
  get brightBlue(): StyleBuilder {
    return this.chain('brightBlue');
  }

  /**
   * Apply bright magenta foreground color.
   *
   * @returns {StyleBuilder} New builder with bright magenta style
   */
  get brightMagenta(): StyleBuilder {
    return this.chain('brightMagenta');
  }

  /**
   * Apply bright cyan foreground color.
   *
   * @returns {StyleBuilder} New builder with bright cyan style
   */
  get brightCyan(): StyleBuilder {
    return this.chain('brightCyan');
  }

  /**
   * Apply bright white foreground color.
   *
   * @returns {StyleBuilder} New builder with bright white style
   */
  get brightWhite(): StyleBuilder {
    return this.chain('brightWhite');
  }

  /**
   * Apply bright black foreground color.
   *
   * @returns {StyleBuilder} New builder with bright black style
   */
  get brightBlack(): StyleBuilder {
    return this.chain('brightBlack');
  }

  // ============================================================
  // Background Colors
  // ============================================================

  /**
   * Apply red background color.
   *
   * @returns {StyleBuilder} New builder with red background
   */
  get bgRed(): StyleBuilder {
    return this.chain('bgRed');
  }

  /**
   * Apply green background color.
   *
   * @returns {StyleBuilder} New builder with green background
   */
  get bgGreen(): StyleBuilder {
    return this.chain('bgGreen');
  }

  /**
   * Apply yellow background color.
   *
   * @returns {StyleBuilder} New builder with yellow background
   */
  get bgYellow(): StyleBuilder {
    return this.chain('bgYellow');
  }

  /**
   * Apply blue background color.
   *
   * @returns {StyleBuilder} New builder with blue background
   */
  get bgBlue(): StyleBuilder {
    return this.chain('bgBlue');
  }

  /**
   * Apply magenta background color.
   *
   * @returns {StyleBuilder} New builder with magenta background
   */
  get bgMagenta(): StyleBuilder {
    return this.chain('bgMagenta');
  }

  /**
   * Apply cyan background color.
   *
   * @returns {StyleBuilder} New builder with cyan background
   */
  get bgCyan(): StyleBuilder {
    return this.chain('bgCyan');
  }

  /**
   * Apply white background color.
   *
   * @returns {StyleBuilder} New builder with white background
   */
  get bgWhite(): StyleBuilder {
    return this.chain('bgWhite');
  }

  /**
   * Apply black background color.
   *
   * @returns {StyleBuilder} New builder with black background
   */
  get bgBlack(): StyleBuilder {
    return this.chain('bgBlack');
  }

  /**
   * Apply gray background color.
   *
   * @returns {StyleBuilder} New builder with gray background
   */
  get bgGray(): StyleBuilder {
    return this.chain('bgGray');
  }

  /**
   * Apply grey background color (alias for bgGray).
   *
   * @returns {StyleBuilder} New builder with grey background
   */
  get bgGrey(): StyleBuilder {
    return this.chain('bgGray');
  }

  // ============================================================
  // Bright Background Colors
  // ============================================================

  /**
   * Apply bright red background color.
   *
   * @returns {StyleBuilder} New builder with bright red background
   */
  get bgBrightRed(): StyleBuilder {
    return this.chain('bgBrightRed');
  }

  /**
   * Apply bright green background color.
   *
   * @returns {StyleBuilder} New builder with bright green background
   */
  get bgBrightGreen(): StyleBuilder {
    return this.chain('bgBrightGreen');
  }

  /**
   * Apply bright yellow background color.
   *
   * @returns {StyleBuilder} New builder with bright yellow background
   */
  get bgBrightYellow(): StyleBuilder {
    return this.chain('bgBrightYellow');
  }

  /**
   * Apply bright blue background color.
   *
   * @returns {StyleBuilder} New builder with bright blue background
   */
  get bgBrightBlue(): StyleBuilder {
    return this.chain('bgBrightBlue');
  }

  /**
   * Apply bright magenta background color.
   *
   * @returns {StyleBuilder} New builder with bright magenta background
   */
  get bgBrightMagenta(): StyleBuilder {
    return this.chain('bgBrightMagenta');
  }

  /**
   * Apply bright cyan background color.
   *
   * @returns {StyleBuilder} New builder with bright cyan background
   */
  get bgBrightCyan(): StyleBuilder {
    return this.chain('bgBrightCyan');
  }

  /**
   * Apply bright white background color.
   *
   * @returns {StyleBuilder} New builder with bright white background
   */
  get bgBrightWhite(): StyleBuilder {
    return this.chain('bgBrightWhite');
  }

  /**
   * Apply bright black background color.
   *
   * @returns {StyleBuilder} New builder with bright black background
   */
  get bgBrightBlack(): StyleBuilder {
    return this.chain('bgBrightBlack');
  }

  // ============================================================
  // Extra Popular Colors (foreground/background + bright variants)
  // ============================================================

  // Orange
  get orange(): StyleBuilder {
    return this.chain('orange');
  }
  get brightOrange(): StyleBuilder {
    return this.chain('brightOrange');
  }
  get bgOrange(): StyleBuilder {
    return this.chain('bgOrange');
  }
  get bgBrightOrange(): StyleBuilder {
    return this.chain('bgBrightOrange');
  }

  // Purple (alias of magenta family)
  get purple(): StyleBuilder {
    return this.chain('purple');
  }
  get brightPurple(): StyleBuilder {
    return this.chain('brightPurple');
  }
  get bgPurple(): StyleBuilder {
    return this.chain('bgPurple');
  }
  get bgBrightPurple(): StyleBuilder {
    return this.chain('bgBrightPurple');
  }

  // Teal (alias of cyan family)
  get teal(): StyleBuilder {
    return this.chain('teal');
  }
  get brightTeal(): StyleBuilder {
    return this.chain('brightTeal');
  }
  get bgTeal(): StyleBuilder {
    return this.chain('bgTeal');
  }
  get bgBrightTeal(): StyleBuilder {
    return this.chain('bgBrightTeal');
  }

  // Pink
  get pink(): StyleBuilder {
    return this.chain('pink');
  }
  get brightPink(): StyleBuilder {
    return this.chain('brightPink');
  }
  get bgPink(): StyleBuilder {
    return this.chain('bgPink');
  }
  get bgBrightPink(): StyleBuilder {
    return this.chain('bgBrightPink');
  }

  // Brown
  get brown(): StyleBuilder {
    return this.chain('brown');
  }
  get brightBrown(): StyleBuilder {
    return this.chain('brightBrown');
  }
  get bgBrown(): StyleBuilder {
    return this.chain('bgBrown');
  }
  get bgBrightBrown(): StyleBuilder {
    return this.chain('bgBrightBrown');
  }

  // Indigo
  get indigo(): StyleBuilder {
    return this.chain('indigo');
  }
  get brightIndigo(): StyleBuilder {
    return this.chain('brightIndigo');
  }
  get bgIndigo(): StyleBuilder {
    return this.chain('bgIndigo');
  }
  get bgBrightIndigo(): StyleBuilder {
    return this.chain('bgBrightIndigo');
  }

  // Lime
  get lime(): StyleBuilder {
    return this.chain('lime');
  }
  get brightLime(): StyleBuilder {
    return this.chain('brightLime');
  }
  get bgLime(): StyleBuilder {
    return this.chain('bgLime');
  }
  get bgBrightLime(): StyleBuilder {
    return this.chain('bgBrightLime');
  }

  // ============================================================
  // Text Styles
  // ============================================================

  /**
   * Apply bold text style.
   *
   * @returns {StyleBuilder} New builder with bold style
   */
  get bold(): StyleBuilder {
    return this.chain('bold');
  }

  /**
   * Apply dim text style.
   *
   * @returns {StyleBuilder} New builder with dim style
   */
  get dim(): StyleBuilder {
    return this.chain('dim');
  }

  /**
   * Apply italic text style.
   *
   * @returns {StyleBuilder} New builder with italic style
   */
  get italic(): StyleBuilder {
    return this.chain('italic');
  }

  /**
   * Apply underline text style.
   *
   * @returns {StyleBuilder} New builder with underline style
   */
  get underline(): StyleBuilder {
    return this.chain('underline');
  }

  /**
   * Apply blink text style.
   *
   * @returns {StyleBuilder} New builder with blink style
   */
  get blink(): StyleBuilder {
    return this.chain('blink');
  }

  /**
   * Apply reverse text style (swap foreground and background colors).
   *
   * @returns {StyleBuilder} New builder with reverse style
   */
  get reverse(): StyleBuilder {
    return this.chain('reverse');
  }

  /**
   * Apply inverse text style (alias for reverse).
   *
   * @returns {StyleBuilder} New builder with inverse style
   */
  get inverse(): StyleBuilder {
    return this.chain('inverse');
  }

  /**
   * Apply hidden text style.
   *
   * @returns {StyleBuilder} New builder with hidden style
   */
  get hidden(): StyleBuilder {
    return this.chain('hidden');
  }

  /**
   * Apply strikethrough text style.
   *
   * @returns {StyleBuilder} New builder with strikethrough style
   */
  get strikethrough(): StyleBuilder {
    return this.chain('strikethrough');
  }
}

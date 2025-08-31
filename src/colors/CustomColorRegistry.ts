/**
 * @fileoverview Custom Color Registry for advanced color customization.
 *
 * ⚠️ WARNING: Custom colors may not work in all terminals!
 * Most terminals support only basic 16 colors. Extended features like RGB (24-bit)
 * and 256-color palette have limited support:
 * - ✅ Modern terminals: iTerm2, Windows Terminal, VS Code, Hyper
 * - ⚠️ Limited support: cmd.exe, PowerShell (legacy), older PuTTY
 * - ❌ No support: Some CI environments, older terminals
 *
 * Use predefined colors from the theme system for maximum compatibility.
 *
 * @module colors/CustomColorRegistry
 */

import { ANSI } from '../constants/ansi';
import * as terminalUtils from '../utils/terminal';

/**
 * Custom color definition supporting multiple formats.
 */
export interface CustomColorDefinition {
  /** ANSI escape sequence (e.g., '\x1b[38;2;255;87;51m') */
  ansi?: string;
  /** RGB values [r, g, b] for 24-bit color */
  rgb?: [number, number, number];
  /** 256-color palette code (0-255) */
  code256?: number;
  /** Hex color (e.g., '#FF5733') - will be converted to RGB */
  hex?: string;
  /** Fallback to use if terminal doesn't support this color */
  fallback?: string;
  /** Description for documentation */
  description?: string;
}

/**
 * Registry for custom color definitions.
 * This is a singleton that lazily initializes to avoid impacting bundle size.
 *
 * @class CustomColorRegistry
 * @example
 * ```typescript
 * // Only loaded when explicitly used
 * const registry = CustomColorRegistry.getInstance();
 *
 * // Add custom brand color with fallback
 * registry.registerColor('brandOrange', {
 *   rgb: [255, 87, 51],
 *   fallback: 'orange',
 *   description: 'Company brand orange'
 * });
 *
 * // Use in theme
 * logger.setTheme({
 *   header: ['brandOrange', 'bold']
 * });
 * ```
 */
export class CustomColorRegistry {
  private static instance: CustomColorRegistry | null = null;
  private customColors: Map<string, CustomColorDefinition> = new Map();
  private ansiCache: Map<string, string> = new Map();
  private terminalSupport: {
    rgb: boolean;
    color256: boolean;
    basic: boolean;
  } | null = null;

  private constructor() {
    this.detectTerminalSupport();
  }

  /**
   * Get or create the singleton instance.
   * @returns {CustomColorRegistry} The registry instance
   */
  public static getInstance(): CustomColorRegistry {
    if (!CustomColorRegistry.instance) {
      CustomColorRegistry.instance = new CustomColorRegistry();
    }
    return CustomColorRegistry.instance;
  }

  /**
   * Detect terminal color support levels.
   * @private
   */
  private detectTerminalSupport(): void {
    // Check for color support levels
    const termSupport = terminalUtils.getTerminalSupport();
    const hasBasicColors = termSupport.colors;
    const has256Colors = this.check256ColorSupport();
    const hasRGBColors = termSupport.rgb || this.checkRGBSupport();

    this.terminalSupport = {
      rgb: hasRGBColors,
      color256: has256Colors,
      basic: hasBasicColors,
    };

    // Log warning if advanced features aren't supported
    if (!hasRGBColors && !has256Colors && typeof console !== 'undefined') {
      console.warn(
        '[MagicLogger] Terminal has limited color support. Custom colors may fallback to basic colors.'
      );
    }
  }

  /**
   * Check if terminal supports 256 colors.
   * @private
   */
  private check256ColorSupport(): boolean {
    if (typeof process === 'undefined') return false;

    const term = process.env.TERM || '';
    const colorterm = process.env.COLORTERM || '';

    return term.includes('256') || colorterm === 'truecolor' || colorterm === '24bit';
  }

  /**
   * Check if terminal supports RGB (24-bit) colors.
   * @private
   */
  private checkRGBSupport(): boolean {
    if (typeof process === 'undefined') return false;

    const colorterm = process.env.COLORTERM || '';
    const termProgram = process.env.TERM_PROGRAM || '';

    return (
      colorterm === 'truecolor' ||
      colorterm === '24bit' ||
      termProgram === 'iTerm.app' ||
      termProgram === 'vscode'
    );
  }

  /**
   * Register a custom color.
   *
   * @param {string} name - Unique color name
   * @param {CustomColorDefinition} definition - Color definition
   * @throws {Error} If color name conflicts with existing colors
   *
   * @example
   * ```typescript
   * // RGB color
   * registry.registerColor('neonPink', {
   *   rgb: [255, 16, 240],
   *   fallback: 'magenta'
   * });
   *
   * // 256-color palette
   * registry.registerColor('darkOlive', {
   *   code256: 58,
   *   fallback: 'green'
   * });
   *
   * // Hex color
   * registry.registerColor('skyBlue', {
   *   hex: '#87CEEB',
   *   fallback: 'cyan'
   * });
   *
   * // Direct ANSI sequence (advanced)
   * registry.registerColor('customBlink', {
   *   ansi: '\x1b[5;38;2;255;255;0m',
   *   fallback: 'yellow',
   *   description: 'Blinking yellow text'
   * });
   * ```
   */
  public registerColor(name: string, definition: CustomColorDefinition): void {
    // Validate name doesn't conflict with built-ins
    if (this.isReservedColorName(name)) {
      throw new Error(
        `Cannot register color "${name}": conflicts with built-in color. ` +
          `Choose a different name or use theme to remap existing colors.`
      );
    }

    // Validate definition has at least one color format
    if (
      !definition.ansi &&
      !definition.rgb &&
      definition.code256 === undefined &&
      !definition.hex
    ) {
      throw new Error(
        `Color "${name}" must define at least one format: ansi, rgb, code256, or hex`
      );
    }

    // Convert hex to RGB if provided
    if (definition.hex && !definition.rgb) {
      definition.rgb = this.hexToRgb(definition.hex);
    }

    // Store the definition
    this.customColors.set(name, definition);

    // Clear cache for this color
    this.ansiCache.delete(name);
  }

  /**
   * Register multiple colors at once.
   *
   * @param {Record<string, CustomColorDefinition>} colors - Map of color definitions
   *
   * @example
   * ```typescript
   * registry.registerColors({
   *   brandPrimary: { hex: '#FF5733', fallback: 'orange' },
   *   brandSecondary: { hex: '#3366FF', fallback: 'blue' },
   *   brandAccent: { rgb: [0, 255, 127], fallback: 'green' }
   * });
   * ```
   */
  public registerColors(colors: Record<string, CustomColorDefinition>): void {
    for (const [name, definition] of Object.entries(colors)) {
      this.registerColor(name, definition);
    }
  }

  /**
   * Get ANSI escape sequence for a custom color.
   *
   * @param {string} name - Color name
   * @returns {string | undefined} ANSI escape sequence or undefined
   */
  public getColorCode(name: string): string | undefined {
    // Check cache first
    if (this.ansiCache.has(name)) {
      return this.ansiCache.get(name);
    }

    const definition = this.customColors.get(name);
    if (!definition) {
      return undefined;
    }

    // Generate ANSI code based on terminal support and definition
    let ansiCode: string | undefined;

    if (definition.ansi) {
      // Use provided ANSI sequence directly
      ansiCode = definition.ansi;
    } else if (definition.rgb && this.terminalSupport?.rgb) {
      // Use RGB if supported
      const [r, g, b] = definition.rgb;
      ansiCode = ANSI.FG_COLOR(r, g, b);
    } else if (definition.code256 !== undefined && this.terminalSupport?.color256) {
      // Use 256-color if supported
      ansiCode = ANSI.FG_COLOR_256(definition.code256);
    } else if (definition.rgb && this.terminalSupport?.color256) {
      // Fallback: convert RGB to nearest 256-color
      const code = this.rgbTo256(definition.rgb);
      ansiCode = ANSI.FG_COLOR_256(code);
    } else if (definition.code256 !== undefined) {
      // Even if terminal doesn't support 256 colors, still generate the code
      // Some terminals may support it even if detection fails
      ansiCode = ANSI.FG_COLOR_256(definition.code256);
    } else if (definition.rgb) {
      // Fallback: convert RGB to 256-color even without full support
      const code = this.rgbTo256(definition.rgb);
      ansiCode = ANSI.FG_COLOR_256(code);
    } else if (definition.hex) {
      // Convert hex to RGB then to 256-color
      const rgb = this.hexToRgb(definition.hex);
      if (rgb) {
        const code = this.rgbTo256(rgb);
        ansiCode = ANSI.FG_COLOR_256(code);
      }
    } else {
      // No compatible format, will use fallback
      ansiCode = undefined;
    }

    // Cache the result
    if (ansiCode) {
      this.ansiCache.set(name, ansiCode);
    }

    return ansiCode;
  }

  /**
   * Get fallback color name for a custom color.
   *
   * @param {string} name - Color name
   * @returns {string | undefined} Fallback color name
   */
  public getFallback(name: string): string | undefined {
    return this.customColors.get(name)?.fallback;
  }

  /**
   * Check if a color is registered.
   *
   * @param {string} name - Color name
   * @returns {boolean} True if registered
   */
  public hasColor(name: string): boolean {
    return this.customColors.has(name);
  }

  /**
   * Get all registered custom color names.
   *
   * @returns {string[]} Array of color names
   */
  public getColorNames(): string[] {
    return Array.from(this.customColors.keys());
  }

  /**
   * Clear all custom colors.
   */
  public clear(): void {
    this.customColors.clear();
    this.ansiCache.clear();
  }

  /**
   * Remove a specific custom color.
   *
   * @param {string} name - Color name to remove
   * @returns {boolean} True if removed
   */
  public removeColor(name: string): boolean {
    this.ansiCache.delete(name);
    return this.customColors.delete(name);
  }

  /**
   * Check if a name is reserved (built-in color).
   * @private
   */
  private isReservedColorName(name: string): boolean {
    const reserved = [
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
      'brightblack',
      'brightred',
      'brightgreen',
      'brightyellow',
      'brightblue',
      'brightmagenta',
      'brightcyan',
      'brightwhite',
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
      'bold',
      'dim',
      'italic',
      'underline',
      'blink',
      'reverse',
      'hidden',
      'strikethrough',
      'reset',
    ];
    return reserved.includes(name.toLowerCase());
  }

  /**
   * Convert hex color to RGB.
   * @private
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }

  /**
   * Convert RGB to nearest 256-color code.
   * @private
   */
  private rgbTo256([r, g, b]: [number, number, number]): number {
    // Grayscale check
    if (r === g && g === b) {
      if (r < 8) return 16;
      if (r > 248) return 231;
      return Math.round(((r - 8) / 247) * 24) + 232;
    }

    // Color cube (6x6x6)
    const levels = [0, 95, 135, 175, 215, 255];
    const findIndex = (value: number) => {
      let minDist = 255;
      let index = 0;
      for (let i = 0; i < levels.length; i++) {
        const dist = Math.abs(value - levels[i]);
        if (dist < minDist) {
          minDist = dist;
          index = i;
        }
      }
      return index;
    };

    const ri = findIndex(r);
    const gi = findIndex(g);
    const bi = findIndex(b);

    return 16 + 36 * ri + 6 * gi + bi;
  }

  /**
   * Export color definitions for debugging/documentation.
   *
   * @returns {Record<string, CustomColorDefinition>} All custom color definitions
   */
  public exportDefinitions(): Record<string, CustomColorDefinition> {
    const result: Record<string, CustomColorDefinition> = {};
    for (const [name, def] of this.customColors.entries()) {
      result[name] = { ...def };
    }
    return result;
  }

  /**
   * Get terminal support information.
   *
   * @returns {object} Terminal color support levels
   */
  public getTerminalSupport(): typeof CustomColorRegistry.prototype.terminalSupport {
    return this.terminalSupport;
  }
}

// Export a lazy getter for tree-shaking
let registryInstance: CustomColorRegistry | null = null;

/**
 * Get the custom color registry instance (lazy initialization).
 * This function ensures the registry is only created when actually used.
 *
 * @returns {CustomColorRegistry} The registry instance
 */
export function getCustomColorRegistry(): CustomColorRegistry {
  if (!registryInstance) {
    registryInstance = CustomColorRegistry.getInstance();
  }
  return registryInstance;
}

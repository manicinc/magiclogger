import { ColorName } from '../types';
import { StylePreset } from '../types';
import { PATH_REGEX } from '../constants';
import { Colorizer } from './Colorizer';
import { PRESETS, COLORS } from '../constants';

/**
 * Formatter provides methods to apply color and style formatting to log messages.
 * Uses the Colorizer utility for all color-related functionality.
 */
export class Formatter {
  /** Optional theme override for preset styles */
  private theme: Record<string, ColorName[]> = {};

  constructor(private useColors: boolean = true) {}

  /**
   * Sets a theme mapping for style presets and level overrides.
   * @param theme Theme object where each key is a preset name and the value is an array of ColorNames.
   */
  public setTheme(theme: Record<string, ColorName[]>): void {
    this.theme = theme ?? {};
  }

  /**
   * Applies the given array of color/style names to a message.
   * @param message The message to format.
   * @param colors Array of color/style names.
   * @returns The formatted message.
   */
  public colorize(message: string, colors: ColorName[]): string {
    if (!this.useColors) return message;

    // If the message looks like a link, preserve it
    if (Formatter.isLinkLike(message)) {
      return this.applyColors(message, colors);
    }

    return this.applyColors(message, colors);
  }

  /**
   * Applies a preset style to a message.
   * Uses theme override if available.
   * @param message The message to format.
   * @param preset The style preset name.
   * @returns The formatted message.
   */
  public applyPreset(message: string, preset: StylePreset): string {
    if (!this.useColors) return message;

    const presetColors = this.theme?.[preset] || PRESETS[preset] || [];

    return this.applyColors(message, presetColors);
  }

  /**
   * Preserves URLs or file paths in the message by applying special formatting.
   * @param message The message that may contain links.
   * @returns The message with links highlighted.
   */
  public preserveLinks(message: string): string {
    if (!message) return message;

    // First, replace markdown links [text](url) with url only.
    message = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, _text, url) => url);

    // Replace detected links with colorized version.
    return message.replace(PATH_REGEX, match =>
      this.colorize(match, ['brightCyan', 'underline'] as ColorName[])
    );
  }

  /**
   * Formats the complete log line with prefix and message.
   * @param prefix The log level or custom prefix (e.g. "[INFO]").
   * @param message The actual log message.
   * @returns The combined formatted log string.
   */
  public formatLine(prefix: string, message: string): string {
    return `${this.colorize(prefix, ['bold'] as ColorName[])} ${this.preserveLinks(message)}`;
  }

  /**
   * Helper: Apply color codes to a message.
   * @param message The message to colorize.
   * @param colors Array of color/style names.
   * @returns The styled string.
   */
  private applyColors(message: string, colors: ColorName[]): string {
    if (!this.useColors || !colors || colors.length === 0) return message;

    let result = '';
    for (const color of colors) {
      const code = COLORS[color as keyof typeof COLORS];
      if (code && code.length > 0) {
        result += code;
      }
    }

    result += message + COLORS.reset;
    return result;
  }

  /**
   * Utility: Check if a string looks like a URL or file path.
   * @param text The text to check.
   * @returns True if it is link-like.
   */
  public static isLinkLike(text: string): boolean {
    return Colorizer.isLinkLike(text);
  }
}

// File: src/types/styling.ts

import { ColorName } from './colors';

/**
 * Represents a styled text part with optional color/style modifiers.
 * Used by the parts API for explicit style control.
 *
 * @type {StyledPart}
 *
 * @example
 * ```typescript
 * const part: StyledPart = ['Error:', 'red', 'bold'];
 * const simplePart: StyledPart = ['Plain text'];
 * ```
 */
export type StyledPart = [text: string, ...styles: ColorName[]];

/**
 * Maps word indices to their respective styles.
 * Used by the index-based styling API.
 *
 * @type {WordStyleMap}
 *
 * @example
 * ```typescript
 * const styleMap: WordStyleMap = {
 *   0: ['red', 'bold'],    // First word
 *   2: ['yellow'],         // Third word
 *   5: ['cyan', 'underline'] // Sixth word
 * };
 * ```
 */
export type WordStyleMap = Record<number, ColorName[]>;

/**
 * Options for styling text.
 * Provides configuration for various styling operations.
 *
 * @interface StyleOptions
 */
export interface StyleOptions {
  /**
   * Whether to apply colors.
   * @default true
   */
  useColors?: boolean;

  /**
   * Whether to strip existing ANSI codes before styling.
   * @default false
   */
  stripExisting?: boolean;

  /**
   * Whether to preserve whitespace in output.
   * @default true
   */
  preserveWhitespace?: boolean;

  /**
   * Whether to cache styled results.
   * @default true
   */
  cache?: boolean;
}

/**
 * Result of parsing styled text.
 * Contains the styled output and metadata.
 *
 * @interface StyleResult
 */
export interface StyleResult {
  /**
   * The styled text output.
   */
  styled: string;

  /**
   * The plain text without styles.
   */
  plain: string;

  /**
   * Number of styles applied.
   */
  styleCount: number;

  /**
   * Whether colors were actually applied.
   */
  colorsApplied: boolean;

  /**
   * Visible character count (excluding ANSI codes).
   */
  visibleLength: number;
}

/**
 * Template literal tag function signature.
 * Used for the fmt`` template API.
 *
 * @type {TemplateFormatter}
 */
export type TemplateFormatter = (strings: TemplateStringsArray, ...values: unknown[]) => string;

/**
 * Style builder function signature.
 * Used for chainable style API.
 *
 * @type {StyleFunction}
 */
export type StyleFunction = (text: string) => string;

/**
 * Chainable style builder interface.
 * Provides fluent API for building styled strings.
 *
 * @interface IStyleBuilder
 */
export interface IStyleBuilder {
  // Color properties
  readonly red: IStyleBuilder;
  readonly green: IStyleBuilder;
  readonly yellow: IStyleBuilder;
  readonly blue: IStyleBuilder;
  readonly magenta: IStyleBuilder;
  readonly cyan: IStyleBuilder;
  readonly white: IStyleBuilder;
  readonly black: IStyleBuilder;
  readonly gray: IStyleBuilder;
  readonly grey: IStyleBuilder;

  // Bright colors
  readonly brightRed: IStyleBuilder;
  readonly brightGreen: IStyleBuilder;
  readonly brightYellow: IStyleBuilder;
  readonly brightBlue: IStyleBuilder;
  readonly brightMagenta: IStyleBuilder;
  readonly brightCyan: IStyleBuilder;
  readonly brightWhite: IStyleBuilder;
  readonly brightBlack: IStyleBuilder;

  // Background colors
  readonly bgRed: IStyleBuilder;
  readonly bgGreen: IStyleBuilder;
  readonly bgYellow: IStyleBuilder;
  readonly bgBlue: IStyleBuilder;
  readonly bgMagenta: IStyleBuilder;
  readonly bgCyan: IStyleBuilder;
  readonly bgWhite: IStyleBuilder;
  readonly bgBlack: IStyleBuilder;
  readonly bgGray: IStyleBuilder;
  readonly bgGrey: IStyleBuilder;

  // Bright background colors
  readonly bgBrightRed: IStyleBuilder;
  readonly bgBrightGreen: IStyleBuilder;
  readonly bgBrightYellow: IStyleBuilder;
  readonly bgBrightBlue: IStyleBuilder;
  readonly bgBrightMagenta: IStyleBuilder;
  readonly bgBrightCyan: IStyleBuilder;
  readonly bgBrightWhite: IStyleBuilder;
  readonly bgBrightBlack: IStyleBuilder;

  // Text styles
  readonly bold: IStyleBuilder;
  readonly dim: IStyleBuilder;
  readonly italic: IStyleBuilder;
  readonly underline: IStyleBuilder;
  readonly blink: IStyleBuilder;
  readonly reverse: IStyleBuilder;
  readonly inverse: IStyleBuilder;
  readonly hidden: IStyleBuilder;
  readonly strikethrough: IStyleBuilder;

  // Make it callable
  (text: string): string;
}

/**
 * Styling API interface.
 * Defines all styling methods available on a logger.
 *
 * @interface IStylingAPI
 */
export interface IStylingAPI {
  /**
   * Chainable style builder.
   * @example logger.s.red.bold('Error')
   */
  readonly s: IStyleBuilder;

  /**
   * Alias for style builder.
   * @example logger.style.green('Success')
   */
  readonly style: IStyleBuilder;

  /**
   * Template literal formatter.
   * @example logger.fmt`@red{Error}: ${message}`
   */
  fmt: TemplateFormatter;

  /**
   * Style parts of text explicitly.
   * @example logger.parts([['Error:', 'red', 'bold'], [' Failed']])
   */
  parts(parts: StyledPart[]): string;

  /**
   * Style by word index.
   * @example logger.styleByIndex('Error: Failed', { 0: ['red'] })
   */
  styleByIndex(text: string, styleMap: WordStyleMap): string;

  /**
   * Parse bracket syntax in text.
   * @example logger.parseBrackets('[[red]]Error:[[/]] Failed')
   */
  parseBrackets(text: string): string;
}

/**
 * Style validation result.
 * Contains validation status and any errors.
 *
 * @interface StyleValidation
 */
export interface StyleValidation {
  /**
   * Whether the style/template is valid.
   */
  valid: boolean;

  /**
   * List of validation errors if any.
   */
  errors: string[];

  /**
   * List of warnings if any.
   */
  warnings?: string[];

  /**
   * Suggested fixes for errors.
   */
  suggestions?: string[];
}

/**
 * Style statistics for a styled string.
 * Provides metrics about styling usage.
 *
 * @interface StyleStats
 */
export interface StyleStats {
  /**
   * Total character count (including ANSI codes).
   */
  totalLength: number;

  /**
   * Visible character count (excluding ANSI codes).
   */
  visibleLength: number;

  /**
   * Number of ANSI codes applied.
   */
  ansiCodeCount: number;

  /**
   * Number of different styles used.
   */
  uniqueStyleCount: number;

  /**
   * Most frequently used style.
   */
  mostUsedStyle?: ColorName;

  /**
   * Map of style usage counts.
   */
  styleUsage: Record<ColorName, number>;
}

/**
 * Configuration for bracket syntax parsing.
 *
 * @interface BracketParseOptions
 */
export interface BracketParseOptions {
  /**
   * Opening bracket sequence.
   * @default '[['
   */
  openBracket?: string;

  /**
   * Closing bracket sequence.
   * @default ']]'
   */
  closeBracket?: string;

  /**
   * Style separator within brackets.
   * @default '.'
   */
  styleSeparator?: string;

  /**
   * End tag for styled section.
   * @default '[[/]]'
   */
  endTag?: string;

  /**
   * Whether to allow nested brackets.
   * @default true
   */
  allowNested?: boolean;

  /**
   * Maximum nesting depth.
   * @default 10
   */
  maxNestingDepth?: number;
}

/**
 * Configuration for template parsing.
 *
 * @interface TemplateParseOptions
 */
export interface TemplateParseOptions {
  /**
   * Style prefix character.
   * @default '@'
   */
  stylePrefix?: string;

  /**
   * Style separator.
   * @default '.'
   */
  styleSeparator?: string;

  /**
   * Opening brace for styled content.
   * @default '{'
   */
  openBrace?: string;

  /**
   * Closing brace for styled content.
   * @default '}'
   */
  closeBrace?: string;

  /**
   * Whether to allow variable interpolation.
   * @default true
   */
  allowInterpolation?: boolean;

  /**
   * Whether to cache parsed templates.
   * @default true
   */
  cache?: boolean;
}

/**
 * Style preset definition.
 * Maps preset names to style combinations.
 *
 * @type {StylePresetMap}
 */
export type StylePresetMap = Record<string, ColorName[]>;

/**
 * Extended logger with styling capabilities.
 * Combines standard logging with styling APIs.
 *
 * @interface IStyledLogger
 */
export interface IStyledLogger {
  // Standard log levels
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  success(message: string, ...args: unknown[]): void;

  // Styling APIs
  s: IStyleBuilder;
  style: IStyleBuilder;
  fmt: TemplateFormatter;
  parts(parts: StyledPart[]): string;
  styleByIndex(text: string, styleMap: WordStyleMap): string;
  parseBrackets(text: string): string;

  // Configuration
  setColorsEnabled(enabled: boolean): void;
  areColorsEnabled(): boolean;
}

/**
 * Type guard to check if a value is a StyledPart.
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a StyledPart
 */
export function isStyledPart(value: unknown): value is StyledPart {
  if (!Array.isArray(value) || value.length < 1) return false;
  const [text, ...rest] = value;
  if (typeof text !== 'string') return false;
  return rest.every(item => typeof item === 'string');
}

/**
 * Type guard to check if a value is a WordStyleMap.
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a WordStyleMap
 */
export function isWordStyleMap(value: unknown): value is WordStyleMap {
  if (typeof value !== 'object' || value === null) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.every(([key, styles]) => {
    const index = Number(key);
    return (
      Number.isInteger(index) &&
      Array.isArray(styles) &&
      (styles as unknown[]).every(style => typeof style === 'string')
    );
  });
}

/**
 * Type guard to check if a value is a style builder.
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is an IStyleBuilder
 */
export function isStyleBuilder(value: unknown): value is IStyleBuilder {
  if (typeof value !== 'function') return false;
  const obj = value as unknown as Record<string, unknown>;
  return 'red' in obj && 'green' in obj && 'blue' in obj;
}

/**
 * Helper type for style method parameters.
 * Allows both direct strings and styled strings.
 *
 * @type {StylableString}
 */
export type StylableString = string | (() => string);

/**
 * Helper type for methods that can accept styled input.
 *
 * @type {StyleInput}
 */
export type StyleInput =
  | string
  | StyledPart[]
  | { text: string; styles: ColorName[] }
  | (() => string);

/**
 * Export all styling-related types for convenience.
 */
export * from './colors';

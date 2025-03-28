/**
 * Type definitions for the enhanced console
 *
 * This module extends the global Console interface to add Magic Logger's
 * enhanced logging capabilities. It provides TypeScript type definitions
 * that enable autocomplete and type checking when using the extended methods.
 *
 * Features added to the console:
 * - Styled header sections
 * - Progress bar visualization
 * - Success message formatting
 * - Custom color application
 * - Styled message presets
 * - Ability to restore the original console
 */

import { ColorName } from './colors';
import { StylePreset } from './preset';

/**
 * Global declaration to extend the Console interface
 *
 * This adds Magic Logger's methods to the standard console object,
 * enabling TypeScript to recognize them as valid methods.
 */
declare global {
  interface Console {
    /**
     * Display a styled header in the console
     *
     * @param title The header text to display
     * @param colors Optional array of colors/styles to apply (default: ['brightWhite', 'bgBlue', 'bold'])
     */
    header: (title: string, colors?: ColorName[]) => void;

    /**
     * Display a progress bar in the console
     *
     * @param progress The progress percentage (0-100)
     * @param length Optional length of the progress bar in characters (default: 20)
     * @param completeChar Optional character for completed portions (default: '█')
     * @param incompleteChar Optional character for incomplete portions (default: '░')
     */
    progress: (
      progress: number,
      length?: number,
      completeChar?: string,
      incompleteChar?: string
    ) => void;

    /**
     * Log a success message with green styling
     *
     * @param msg The success message to display
     */
    success: (msg: string) => void;

    /**
     * Create a function that applies specified colors to text
     *
     * @param colors One or more colors to apply to the text
     * @returns A function that accepts text and returns it with the specified colors applied
     *
     * @example
     * // Create a colorizer for red, bold text
     * const highlightText = console.colorize('red', 'bold');
     * console.log(highlightText('Important message'));
     */
    colorize: (...colors: ColorName[]) => (text: string) => string;

    /**
     * Colorize specific parts of a message with different colors
     *
     * @param message The complete message text
     * @param colorParts Object mapping text parts to arrays of colors
     *
     * @example
     * console.colorParts('Error in file.json: 400', {
     *   'file.json': ['cyan'],
     *   '400': ['red', 'bold']
     * });
     */
    colorParts: (message: string, colorParts: Record<string, ColorName[]>) => string;

    /**
     * Display a customized log message with specified colors and prefix
     *
     * @param msg The message to display
     * @param colors Optional array of colors for the prefix (default: ['white'])
     * @param prefix Optional prefix label (default: 'LOG')
     *
     * @example
     * console.custom('API request completed', ['green'], 'API');
     */
    custom: (msg: string, colors?: ColorName[], prefix?: string) => void;

    /**
     * Display a message with a predefined style preset
     *
     * @param msg The message to display
     * @param preset The style preset to apply (e.g., 'info', 'error', 'warning')
     *
     * @example
     * console.styled('Operation completed', 'success');
     */
    styled: (msg: string, preset: StylePreset) => void;

    /**
     * Restore the original console methods
     *
     * Removes all Magic Logger enhancements and returns the console
     * to its original state.
     */
    restoreOriginalConsole: () => void;
  }
}

/**
 * Export a dummy value to make this a proper module
 *
 * TypeScript requires a value export for the module to be recognized.
 * This constant serves no functional purpose beyond making the module valid.
 */
export const consoleTypes = true;

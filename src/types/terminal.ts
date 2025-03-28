/**
 * Terminal capability types
 *
 * Type definitions for terminal support and capabilities
 */

/**
 * Terminal support detection interface
 */
export interface TerminalSupport {
  // Basic flags
  basic: boolean;
  colors: boolean;
  brightColors: boolean;
  rgb: boolean;

  // Style support flags
  styles: {
    bold: boolean;
    dim: boolean;
    italic: boolean;
    underline: boolean;
    blink: boolean;
    reverse: boolean;
    hidden: boolean;
    strikethrough: boolean;
    doubleUnderline: boolean; // Some terminals support this (ESC[21m)
    curlyUnderline: boolean; // Some terminals support this (ESC[4:3m)
  };

  // Advanced features
  features: {
    hyperlinks: boolean; // OSC 8 hyperlink support
    cursorMovement: boolean; // Cursor movement sequences
    windowTitle: boolean; // OSC 0/1/2 window title support
    mouseTracking: boolean; // Mouse tracking support
  };
}

/**
 * Known terminal profile partial configuration
 */
export type TerminalProfile = Partial<TerminalSupport>;

/**
 * Style names
 */
export type StyleName = keyof TerminalSupport['styles'];

/**
 * Feature names
 */
export type FeatureName = keyof TerminalSupport['features'];

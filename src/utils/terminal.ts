/**
 * Terminal Capability Detection Utilities
 * 
 * This module provides tools to detect and manage terminal styling capabilities
 * across different operating systems and terminal emulators. It uses a combination
 * of environment variables and platform detection to determine what ANSI features
 * are supported by the current terminal.
 * 
 * Key capabilities:
 * - Detects support for colors, bright colors, and RGB/true color
 * - Identifies supported text styles (bold, italic, underline, etc.)
 * - Determines support for advanced features (hyperlinks, cursor movement, etc.)
 * - Provides fallback styles for unsupported features
 * 
 * The module uses a singleton pattern to ensure consistent terminal detection
 * across the application.
 */

import { TerminalSupport, TerminalProfile, StyleName } from '../types/terminal';

/**
 * Default terminal support settings
 * 
 * These are conservative baseline capabilities assumed for all terminals.
 * The detection process will enhance this with more capabilities when detected.
 * 
 * Most modern terminals support:
 * - Basic 16 colors
 * - Bold, underline, and reverse text styles
 * - Basic cursor movement
 */
const defaultSupport: TerminalSupport = {
  basic: true,
  colors: true,
  brightColors: true,
  rgb: false,
  
  styles: {
    bold: true,         // Bold text - widely supported
    dim: false,         // Dimmed text - less supported
    italic: false,      // Italic text - often not supported
    underline: true,    // Underlined text - widely supported
    blink: false,       // Blinking text - rarely supported
    reverse: true,      // Reversed colors - widely supported
    hidden: false,      // Hidden text - less supported
    strikethrough: false, // Strikethrough text - less supported
    doubleUnderline: false, // Double underline - rarely supported
    curlyUnderline: false   // Curly underline - rarely supported
  },
  
  features: {
    hyperlinks: false,     // Clickable links - supported in modern terminals
    cursorMovement: true,  // Cursor positioning - widely supported
    windowTitle: false,    // Setting window title - often supported
    mouseTracking: false   // Mouse event tracking - rarely supported
  }
};

/**
 * Terminal support profiles for known terminal emulators
 * 
 * These profiles define the capabilities of specific terminal applications.
 * Each profile overrides the default support with known capabilities.
 * 
 * Key terminals:
 * - VS Code integrated terminal
 * - iTerm2 (macOS)
 * - Windows CMD (command prompt)
 * - Windows Terminal (modern Windows terminal)
 */
const knownTerminals: Record<string, TerminalProfile> = {
  // VS Code integrated terminal
  'vscode': {
    colors: true,
    brightColors: true,
    rgb: true,           // Supports true color
    styles: {
      bold: true,
      dim: true,
      italic: false,      // No italic in VS Code terminal
      underline: true,
      blink: false,       // No blinking text support
      reverse: true,
      hidden: false,
      strikethrough: false,
      doubleUnderline: false,
      curlyUnderline: false
    },
    features: {
      hyperlinks: true,   // Supports clickable links
      cursorMovement: true,
      windowTitle: true,
      mouseTracking: false
    }
  },
  
  // iTerm2 terminal on macOS - highly capable
  'iterm2': {
    colors: true,
    brightColors: true,
    rgb: true,           // Full RGB color support
    styles: {
      bold: true,
      dim: true,
      italic: true,      // Full italic support
      underline: true,
      blink: true,       // Supports blinking text
      reverse: true,
      hidden: true,
      strikethrough: true,
      doubleUnderline: true,
      curlyUnderline: true
    },
    features: {
      hyperlinks: true,   // Full hyperlink support
      cursorMovement: true,
      windowTitle: true,
      mouseTracking: true // Supports mouse tracking
    }
  },
  
  // Windows Command Prompt - limited capabilities
  'windows-cmd': {
    colors: true,
    brightColors: true,
    rgb: false,          // No RGB support in CMD
    styles: {
      bold: false,       // No true bold support
      dim: false,        // No dim support
      italic: false,     // No italic support
      underline: false,  // No underline support
      blink: false,
      reverse: true,     // Reverse is supported
      hidden: false,
      strikethrough: false,
      doubleUnderline: false,
      curlyUnderline: false
    },
    features: {
      hyperlinks: false,
      cursorMovement: true,
      windowTitle: true,  // Can set window title
      mouseTracking: false
    }
  },
  
  // Windows Terminal - modern Windows terminal with better support
  'windows-terminal': {
    colors: true,
    brightColors: true,
    rgb: true,           // Full RGB support
    styles: {
      bold: true,
      dim: true,
      italic: true,
      underline: true,
      blink: false,      // No blink support
      reverse: true,
      hidden: true,
      strikethrough: true,
      doubleUnderline: false,
      curlyUnderline: false
    },
    features: {
      hyperlinks: true,
      cursorMovement: true,
      windowTitle: true,
      mouseTracking: false
    }
  }
};

/**
 * Terminal Capability Detector
 * 
 * Singleton class responsible for detecting terminal capabilities and
 * providing information about supported features. The detection happens
 * once during initialization, and the results are cached.
 */
class TerminalCapabilityDetector {
  /** Singleton instance */
  private static instance: TerminalCapabilityDetector;
  
  /** Detected terminal capabilities */
  private support: TerminalSupport;

  /**
   * Private constructor to enforce singleton pattern
   * Initializes with default support and detects actual capabilities
   */
  private constructor() {
    // Start with default support
    this.support = { ...defaultSupport };
    // Detect actual capabilities
    this.detect();
  }

  /**
   * Get the singleton instance of the detector
   * Creates the instance if it doesn't exist yet
   * 
   * @returns The singleton TerminalCapabilityDetector instance
   */
  public static getInstance(): TerminalCapabilityDetector {
    if (!TerminalCapabilityDetector.instance) {
      TerminalCapabilityDetector.instance = new TerminalCapabilityDetector();
    }
    return TerminalCapabilityDetector.instance;
  }

  /**
   * Detect terminal capabilities
   * 
   * Uses environment variables and platform detection to determine
   * what features the current terminal supports.
   * 
   * Detection approach:
   * 1. Check for known terminal types (VS Code, iTerm, etc.)
   * 2. Look for specific terminal environment variables
   * 3. Check platform-specific capabilities
   * 4. Apply special environment flags (like CI)
   */
  private detect(): void {
    // Get relevant environment variables
    const term = process.env.TERM || '';
    const termProgram = process.env.TERM_PROGRAM || '';
    const colorTerm = process.env.COLORTERM || '';

    // Check for known terminal programs
    if (termProgram === 'vscode') this.applyProfile('vscode');
    else if (termProgram === 'iTerm.app') this.applyProfile('iterm2');
    else if (termProgram === 'Windows Terminal') this.applyProfile('windows-terminal');

    // Check for xterm variants
    if (term.includes('xterm-256color') || term.includes('xterm-color')) {
      this.support.colors = true;
      this.support.brightColors = true;
      if (term.includes('256color')) this.support.rgb = true;
      this.support.styles.bold = true;
      this.support.styles.dim = true;
      this.support.styles.underline = true;
      this.support.styles.reverse = true;
    }

    // Check for Windows CMD
    if (process.platform === 'win32' && !termProgram && !colorTerm) {
      this.applyProfile('windows-cmd');
    }

    // Check for true color support
    if (colorTerm === '24bit' || colorTerm === 'truecolor') {
      this.support.rgb = true;
    }

    // Check for CI environments
    if (process.env.CI === 'true') {
      // Disable potentially disruptive styles in CI
      this.support.styles.blink = false;
      this.support.styles.hidden = false;
    }
  }

  /**
   * Apply a known terminal profile to the current support
   * 
   * Takes a profile name, looks it up in the knownTerminals dictionary,
   * and applies its settings to the current support object.
   * 
   * @param profileName Name of the profile to apply
   */
  private applyProfile(profileName: string): void {
    const profile = knownTerminals[profileName];
    if (!profile) return;

    // Apply top-level properties
    Object.entries(profile).forEach(([key, value]) => {
      if (key !== 'styles' && key !== 'features') {
        (this.support as any)[key] = value;
      }
    });

    // Apply style properties
    if (profile.styles) {
      Object.entries(profile.styles).forEach(([style, supported]) => {
        this.support.styles[style as StyleName] = supported;
      });
    }

    // Apply feature properties
    if (profile.features) {
      Object.entries(profile.features).forEach(([feature, supported]) => {
        this.support.features[feature as keyof typeof this.support.features] = supported;
      });
    }
  }

  /**
   * Get a copy of the terminal support information
   * 
   * @returns A copy of the TerminalSupport object
   */
  public getSupport(): TerminalSupport {
    return { ...this.support };
  }

  /**
   * Check if a specific style is supported
   * 
   * @param style The style name to check
   * @returns true if supported, false otherwise
   */
  public isStyleSupported(style: string): boolean {
    // Default to true for unknown styles to avoid breaking existing code
    return (this.support.styles as any)[style] ?? true;
  }

  /**
   * Get an appropriate fallback style for unsupported styles
   * 
   * @param style The original style to find a fallback for
   * @returns The fallback style name, or the original if supported
   */
  public getFallbackStyle(style: string): string {
    if (isStyleSupported(style)) return style;
  
    // Fallback mapping for unsupported styles
    const fallbacks: Record<string, string> = {
      'italic': terminalSupport.isStyleSupported('dim') ? 'dim' : 'normal',
      'dim': 'gray',
      'strikethrough': terminalSupport.isStyleSupported('dim') ? 'dim' : 'normal',
      'blink': 'bold',
      'hidden': terminalSupport.isStyleSupported('dim') ? 'dim' : 'normal',
      'doubleUnderline': 'underline',
      'curlyUnderline': 'underline'
    };
  
    // Return the fallback or 'normal' as a last resort
    return fallbacks[style] || 'normal';
  }
}

/**
 * Singleton instance of the terminal capability detector
 */
export const terminalSupport = TerminalCapabilityDetector.getInstance();

/**
 * Check if a specific text style is supported by the current terminal
 * 
 * @param style The style name to check
 * @returns true if supported, false otherwise
 */
export function isStyleSupported(style: string): boolean {
  return terminalSupport.isStyleSupported(style);
}

/**
 * Get an appropriate fallback style when a style is not supported
 * 
 * If the original style is supported, it will be returned unchanged.
 * Otherwise, a suitable fallback is provided based on what the terminal supports.
 * 
 * @param style The original style to find a fallback for
 * @returns The fallback style name, or the original if supported
 */
export function getFallbackStyle(style: string): string {
  return terminalSupport.getFallbackStyle(style);
}

/**
 * Get information about the terminal's capabilities
 * 
 * @returns A TerminalSupport object with information about supported features
 */
export function getTerminalSupport(): TerminalSupport {
  return terminalSupport.getSupport();
}
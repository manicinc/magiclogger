# Terminal Support and Capability Detection

Magiclogger includes advanced terminal capability detection to ensure your logs look great in any environment. This document explains how terminal detection works and how to leverage it in your applications.

## Table of Contents

- [Terminal Capability Detection](#terminal-capability-detection)
- [Supported Terminal Features](#supported-terminal-features)
- [Terminal Profiles](#terminal-profiles)
- [Testing Terminal Capabilities](#testing-terminal-capabilities)
- [ANSI Support Reference](#ansi-support-reference)
- [Using Terminal Support in Your Code](#using-terminal-support-in-your-code)
- [Creating Custom Terminal Profiles](#creating-custom-terminal-profiles)

## Terminal Capability Detection

Magiclogger automatically detects terminal capabilities when initialized, including:

- Support for basic and bright colors
- Support for RGB (true color) output
- Support for text styles (bold, italic, underline, etc.)
- Support for advanced features (hyperlinks, mouse tracking, etc.)

This detection is based on:

1. Environment variables (`TERM`, `TERM_PROGRAM`, `COLORTERM`)
2. Platform detection (Windows, macOS, Linux)
3. Known terminal profiles
4. Optional manual configuration

## Supported Terminal Features

Magiclogger detects and adapts to the following terminal features:

### Colors

- Basic 8 colors (black, red, green, yellow, blue, magenta, cyan, white)
- Bright variants of the 8 basic colors
- 256-color mode support
- RGB true color (16 million colors) support

### Text Styles

- Bold
- Dim/faint
- Italic
- Underline
- Blink
- Reverse/inverse
- Hidden/invisible
- Strikethrough
- Double underline
- Curly underline

### Advanced Features

- Hyperlinks (clickable URLs)
- Cursor movement and positioning
- Window title manipulation
- Mouse tracking
- Alternative screen buffer
- Line wrapping control

## Terminal Profiles

Magiclogger includes built-in profiles for common terminals:

### VS Code Terminal

```
Terminal: vscode
Colors: Standard + Bright + RGB
Styles: Bold, Dim, Underline, Reverse
Advanced: Hyperlinks, Window Title
```

### iTerm2

```
Terminal: iterm2
Colors: Standard + Bright + RGB
Styles: All styles supported
Advanced: All features supported
```

### Windows Terminal

```
Terminal: windows-terminal
Colors: Standard + Bright + RGB
Styles: Bold, Dim, Italic*, Underline, Reverse, Hidden, Strikethrough*
Advanced: Hyperlinks, Cursor Movement, Window Title
```
*Font dependent

### Windows CMD

```
Terminal: windows-cmd
Colors: Standard + Bright
Styles: Reverse only
Advanced: Cursor Movement, Window Title
```

## Testing Terminal Capabilities

Magiclogger includes a terminal tester to help you understand your terminal's capabilities:

```typescript
import { getTerminalSupport, ANSI } from 'magiclogger';

// Print terminal information
console.log('Terminal Information:');
console.log('TERM:', process.env.TERM);
console.log('TERM_PROGRAM:', process.env.TERM_PROGRAM);
console.log('COLORTERM:', process.env.COLORTERM);
console.log('Platform:', process.platform);

// Print detected capabilities
const support = getTerminalSupport();
console.log('Detected Terminal Capabilities:');
console.log(JSON.stringify(support, null, 2));

// Test style support
console.log('\nStyle Test:');
console.log(`${ANSI.BOLD}Bold${ANSI.RESET}`);
console.log(`${ANSI.ITALIC}Italic${ANSI.RESET}`);
console.log(`${ANSI.UNDERLINE}Underline${ANSI.RESET}`);
console.log(`${ANSI.STRIKETHROUGH}Strikethrough${ANSI.RESET}`);
console.log(`${ANSI.REVERSE}Reverse${ANSI.RESET}`);
```

## ANSI Support Reference

Magiclogger provides access to ANSI escape sequences through the `ANSI` constant:

```typescript
import { ANSI } from 'magiclogger';

// Text styles
console.log(`${ANSI.BOLD}Bold text${ANSI.RESET}`);
console.log(`${ANSI.ITALIC}Italic text${ANSI.RESET}`);
console.log(`${ANSI.UNDERLINE}Underlined text${ANSI.RESET}`);

// Cursor movement
process.stdout.write(ANSI.CURSOR_UP(2));  // Move cursor up 2 lines
process.stdout.write(ANSI.CURSOR_HOME);   // Move cursor to home position

// Colors
console.log(`${ANSI.FG_RED}Red text${ANSI.RESET}`);
console.log(`${ANSI.BG_BLUE}Text with blue background${ANSI.RESET}`);
console.log(`${ANSI.FG_COLOR(255, 128, 0)}Orange text${ANSI.RESET}`);

// Advanced features (with capability detection)
if (getTerminalSupport().features.hyperlinks) {
  console.log(ANSI.HYPERLINK('https://example.com', 'Example Link'));
}
```

## Using Terminal Support in Your Code

You can leverage terminal capability detection in your own code:

```typescript
import { getTerminalSupport, isStyleSupported, getFallbackStyle } from 'magiclogger';

// Check if a specific style is supported
if (isStyleSupported('italic')) {
  console.log('This terminal supports italic text!');
}

// Use fallback styles when needed
const textStyle = isStyleSupported('strikethrough') ? 'strikethrough' : getFallbackStyle('strikethrough');

// Check for RGB color support
if (getTerminalSupport().rgb) {
  // Use RGB colors
} else {
  // Fall back to basic colors
}

// Check for advanced features
if (getTerminalSupport().features.hyperlinks) {
  // Use clickable links
} else {
  // Show regular URLs
}
```

## Creating Custom Terminal Profiles

You can create custom terminal profiles for specific environments:

```typescript
import { getTerminalSupport } from 'magiclogger';

// Example showing how you could extend support detection
// (Note: This is demonstrative - Magiclogger handles this internally)
function extendTerminalSupport() {
  const support = getTerminalSupport();
  
  // Example: Detect a specific terminal by its environment variable
  const customTerminalVar = process.env.CUSTOM_TERMINAL;
  if (customTerminalVar === 'ACME_TERM') {
    // Update support for this specific terminal
    support.styles.italic = true;
    support.styles.strikethrough = true;
    support.features.hyperlinks = false;
  }
  
  return support;
}
```

Magiclogger's terminal detection ensures your logs have the best possible appearance across different environments, automatically adapting to the capabilities of each terminal.
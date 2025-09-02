# Custom Colors Guide

## Overview

MagicLogger supports custom color registration for advanced theming needs. This feature allows you to define colors using RGB, hex, or 256-color codes that aren't part of the predefined color set.

> ⚠️ **WARNING**: Custom colors require terminal support and may not work everywhere. Always provide fallbacks for maximum compatibility.

## Terminal Compatibility

### Color Support Levels

1. **Basic (16 colors)**: Universal support
2. **256-color palette**: Most modern terminals
3. **RGB/True Color (24-bit)**: Limited support

### Terminal Compatibility Matrix

| Terminal | Basic | 256 | RGB | Notes |
|----------|-------|-----|-----|-------|
| **Modern Terminals** |
| VS Code Terminal | ✅ | ✅ | ✅ | Full support |
| Windows Terminal | ✅ | ✅ | ✅ | Full support |
| iTerm2 (macOS) | ✅ | ✅ | ✅ | Full support |
| Hyper | ✅ | ✅ | ✅ | Full support |
| Alacritty | ✅ | ✅ | ✅ | Full support |
| kitty | ✅ | ✅ | ✅ | Full support |
| **Legacy/Limited** |
| Terminal.app (macOS) | ✅ | ✅ | ⚠️ | RGB support varies |
| cmd.exe | ✅ | ⚠️ | ❌ | Limited to 16 colors |
| PowerShell (legacy) | ✅ | ⚠️ | ❌ | Use Windows Terminal |
| PuTTY | ✅ | ✅ | ⚠️ | Depends on version |
| **CI/Cloud** |
| GitHub Actions | ✅ | ✅ | ⚠️ | Varies by runner |
| GitLab CI | ✅ | ⚠️ | ❌ | Basic colors only |
| Jenkins | ✅ | ⚠️ | ❌ | Depends on config |
| Docker | ✅ | ✅ | ⚠️ | Depends on host |

## Usage

### Basic Registration

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger();

// Register a single custom color
logger.registerCustomColor('brandOrange', {
  hex: '#FF5733',
  fallback: 'orange' // ALWAYS provide a fallback!
});
```

### Multiple Color Formats

```typescript
// RGB format (0-255 for each channel)
logger.registerCustomColor('neonPink', {
  rgb: [255, 16, 240],
  fallback: 'magenta'
});

// 256-color palette (0-255)
logger.registerCustomColor('darkOlive', {
  code256: 58,
  fallback: 'green'
});

// Hex format (automatically converted to RGB)
logger.registerCustomColor('skyBlue', {
  hex: '#87CEEB',
  fallback: 'cyan'
});

// Direct ANSI escape sequence (advanced users)
logger.registerCustomColor('customBlink', {
  ansi: '\x1b[5;38;2;255;255;0m', // Blinking yellow
  fallback: 'yellow',
  description: 'Blinking yellow text for critical alerts'
});
```

### Batch Registration

```typescript
logger.registerCustomColors({
  // Corporate brand colors
  brandPrimary: { 
    hex: '#003366', 
    fallback: 'blue',
    description: 'Main brand color' 
  },
  brandSecondary: { 
    hex: '#66CC00', 
    fallback: 'green',
    description: 'Secondary brand color'
  },
  brandAccent: { 
    rgb: [255, 152, 0], 
    fallback: 'yellow',
    description: 'Accent color for highlights'
  },
  
  // Status colors
  statusOnline: { 
    code256: 46,  // Bright green
    fallback: 'green' 
  },
  statusOffline: { 
    code256: 196, // Bright red
    fallback: 'red' 
  },
  statusAway: { 
    code256: 226, // Yellow
    fallback: 'yellow' 
  }
});
```

### Using Custom Colors in Themes

```typescript
// Set theme with custom colors
logger.setTheme({
  // Log levels
  info: ['brandPrimary'],
  success: ['statusOnline', 'bold'],
  warning: ['brandAccent'],
  error: ['statusOffline', 'bold'],
  
  // Custom categories
  header: ['brandPrimary', 'bold', 'underline'],
  footer: ['brandSecondary', 'dim'],
  link: ['skyBlue', 'underline'],
  
  // Application-specific
  api: ['brandPrimary'],
  database: ['darkOlive'],
  cache: ['neonPink']
});
```

### Using in Log Messages

```typescript
// Direct usage with angle bracket syntax
logger.info('<brandOrange>Welcome to our app!</>');

// Combined with built-in colors
logger.success('<statusOnline>●</> Server is <bold>online</> at <skyBlue>http://localhost:3000</>');

// With style methods
logger.info(logger.s.brandPrimary.bold('Important message'));
```

## Best Practices

### 1. Always Provide Fallbacks

```typescript
// ✅ GOOD: Has fallback
logger.registerCustomColor('customPurple', {
  hex: '#8B4F9F',
  fallback: 'magenta' // Will work everywhere
});

// ❌ BAD: No fallback
logger.registerCustomColor('customPurple', {
  hex: '#8B4F9F'
  // May show no color in limited terminals!
});
```

### 2. Test Terminal Support

```typescript
// Check terminal capabilities
async function checkColorSupport() {
  const { getCustomColorRegistry } = await import('magiclogger/colors/CustomColorRegistry');
  const registry = getCustomColorRegistry();
  const support = registry.getTerminalSupport();
  
  console.log('Terminal color support:');
  console.log('- Basic colors:', support.basic);
  console.log('- 256 colors:', support.color256);
  console.log('- RGB colors:', support.rgb);
  
  if (!support.rgb) {
    console.warn('⚠️ Limited color support - custom colors will use fallbacks');
  }
}
```

### 3. Use Semantic Names

```typescript
// ✅ GOOD: Semantic, meaningful names
logger.registerCustomColors({
  brandPrimary: { hex: '#003366', fallback: 'blue' },
  alertCritical: { hex: '#FF0000', fallback: 'red' },
  successGreen: { hex: '#00C851', fallback: 'green' }
});

// ❌ BAD: Arbitrary names
logger.registerCustomColors({
  color1: { hex: '#003366', fallback: 'blue' },
  myColor: { hex: '#FF0000', fallback: 'red' },
  temp: { hex: '#00C851', fallback: 'green' }
});
```

### 4. Document Your Colors

```typescript
logger.registerCustomColor('brandOrange', {
  hex: '#FF5733',
  fallback: 'orange',
  description: 'Company brand orange - used for headers and CTAs'
});

// Export color definitions for documentation
const customColors = await logger.getCustomColors();
console.log('Custom colors in use:', customColors);
```

## Performance Considerations

Custom colors are **lazily loaded** and **tree-shakeable**:

1. **No Bundle Impact**: The CustomColorRegistry is only loaded when you actually use custom colors
2. **Cached ANSI Codes**: Color codes are generated once and cached
3. **Minimal Overhead**: Fallback resolution is fast and efficient

```typescript
// This won't load CustomColorRegistry until registerCustomColor is called
const logger = new Logger();

// CustomColorRegistry loads here (first use)
logger.registerCustomColor('brand', { hex: '#FF5733', fallback: 'orange' });

// Subsequent uses are cached
logger.info('<brand>Fast!</>');
```

## Advanced Usage

### Dynamic Color Switching

```typescript
// Development vs Production colors
const isDev = process.env.NODE_ENV === 'development';

logger.registerCustomColors({
  debugColor: {
    hex: isDev ? '#00FF00' : '#808080', // Bright green in dev, gray in prod
    fallback: isDev ? 'green' : 'gray'
  }
});
```

### Color Palettes

```typescript
// Create a color palette generator
function generatePalette(baseHex: string, steps: number) {
  const colors: Record<string, any> = {};
  
  // Parse base color
  const rgb = hexToRgb(baseHex);
  
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    colors[`shade${i}`] = {
      rgb: [
        Math.round(rgb[0] * factor),
        Math.round(rgb[1] * factor),
        Math.round(rgb[2] * factor)
      ],
      fallback: factor > 0.5 ? 'white' : 'gray'
    };
  }
  
  return colors;
}

// Register a gradient palette
logger.registerCustomColors(generatePalette('#FF5733', 10));
```

### Removing Colors

```typescript
// Remove a single color
await logger.removeCustomColor('brandOrange');

// Clear all custom colors (useful for testing)
const { getCustomColorRegistry } = await import('magiclogger/colors/CustomColorRegistry');
const registry = getCustomColorRegistry();
registry.clear();
```

## Troubleshooting

### Colors Not Showing

1. **Check terminal support**: Some terminals don't support custom colors
2. **Verify fallback**: Ensure your fallback color is valid
3. **Clear cache**: `Colorizer.clearCache()` after registration
4. **Check color name**: Avoid conflicts with built-in colors

### Performance Issues

1. **Lazy load**: Only register colors when needed
2. **Batch registration**: Use `registerCustomColors()` for multiple colors
3. **Cache warming**: Register all colors at startup if known

### Testing

```typescript
// Test with different terminal capabilities
process.env.COLORTERM = ''; // Simulate basic terminal
logger.info('<brandOrange>Should show fallback</>');

process.env.COLORTERM = 'truecolor'; // Simulate modern terminal
logger.info('<brandOrange>Should show custom color</>');
```

## Migration Guide

### From Hardcoded ANSI

```typescript
// Before: Hardcoded ANSI
const orange = '\x1b[38;2;255;87;51m';
console.log(orange + 'Hello' + '\x1b[0m');

// After: Custom color with fallback
logger.registerCustomColor('orange', {
  rgb: [255, 87, 51],
  fallback: 'yellow'
});
logger.info('<orange>Hello</>');
```

### From Chalk or Similar Libraries

```typescript
// Before: Using Chalk
import chalk from 'chalk';
console.log(chalk.hex('#FF5733')('Hello'));

// After: MagicLogger custom colors
logger.registerCustomColor('customOrange', {
  hex: '#FF5733',
  fallback: 'yellow'
});
logger.info('<customOrange>Hello</>');
```

## API Reference

See the [API Reference](./api-reference.md#api-reference) for complete method signatures and options.
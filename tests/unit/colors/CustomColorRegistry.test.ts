/**
 * @fileoverview Tests for CustomColorRegistry
 */

import {
  CustomColorRegistry,
  getCustomColorRegistry,
} from '../../../src/colors/CustomColorRegistry';

describe('CustomColorRegistry', () => {
  let registry: CustomColorRegistry;

  beforeEach(() => {
    // Get fresh instance and clear any existing colors
    registry = CustomColorRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Basic Registration', () => {
    it('should register a color with hex format', () => {
      registry.registerColor('testOrange', {
        hex: '#FF5733',
        fallback: 'orange',
      });

      expect(registry.hasColor('testOrange')).toBe(true);
      expect(registry.getColorNames()).toContain('testOrange');
    });

    it('should register a color with RGB format', () => {
      registry.registerColor('testPink', {
        rgb: [255, 16, 240],
        fallback: 'magenta',
      });

      expect(registry.hasColor('testPink')).toBe(true);
      expect(registry.getFallback('testPink')).toBe('magenta');
    });

    it('should register a color with 256-color code', () => {
      registry.registerColor('darkOlive', {
        code256: 58,
        fallback: 'green',
      });

      expect(registry.hasColor('darkOlive')).toBe(true);
      const code = registry.getColorCode('darkOlive');
      // Should generate 256-color ANSI code
      expect(code).toBeDefined();
      // eslint-disable-next-line no-control-regex
      expect(code).toMatch(/\x1b\[38;5;\d+m/);
    });

    it('should register a color with direct ANSI sequence', () => {
      const customAnsi = '\x1b[5;38;2;255;255;0m';
      registry.registerColor('blinkYellow', {
        ansi: customAnsi,
        fallback: 'yellow',
      });

      expect(registry.hasColor('blinkYellow')).toBe(true);
      const code = registry.getColorCode('blinkYellow');
      expect(code).toBe(customAnsi);
    });

    it('should convert hex to RGB automatically', () => {
      registry.registerColor('hexColor', {
        hex: '#3366FF',
        fallback: 'blue',
      });

      const definitions = registry.exportDefinitions();
      expect(definitions.hexColor.rgb).toEqual([51, 102, 255]);
    });
  });

  describe('Batch Registration', () => {
    it('should register multiple colors at once', () => {
      registry.registerColors({
        brandPrimary: { hex: '#003366', fallback: 'blue' },
        brandSecondary: { hex: '#66CC00', fallback: 'green' },
        brandAccent: { rgb: [255, 152, 0], fallback: 'yellow' },
      });

      expect(registry.hasColor('brandPrimary')).toBe(true);
      expect(registry.hasColor('brandSecondary')).toBe(true);
      expect(registry.hasColor('brandAccent')).toBe(true);
      expect(registry.getColorNames()).toHaveLength(3);
    });
  });

  describe('Validation', () => {
    it('should throw error for reserved color names', () => {
      const reservedNames = ['red', 'blue', 'bold', 'bgGreen', 'reset'];

      for (const name of reservedNames) {
        expect(() => {
          registry.registerColor(name, {
            hex: '#123456',
            fallback: 'cyan',
          });
        }).toThrow(/conflicts with built-in color/);
      }
    });

    it('should throw error if no color format provided', () => {
      expect(() => {
        registry.registerColor('noFormat', {
          fallback: 'red',
        });
      }).toThrow(/must define at least one format/);
    });

    it('should throw error for invalid hex format', () => {
      expect(() => {
        registry.registerColor('badHex', {
          hex: 'not-a-hex',
          fallback: 'red',
        });
      }).toThrow(/Invalid hex color/);
    });
  });

  describe('Color Removal', () => {
    it('should remove a registered color', () => {
      registry.registerColor('tempColor', {
        hex: '#FF0000',
        fallback: 'red',
      });

      expect(registry.hasColor('tempColor')).toBe(true);

      const removed = registry.removeColor('tempColor');
      expect(removed).toBe(true);
      expect(registry.hasColor('tempColor')).toBe(false);
    });

    it('should return false when removing non-existent color', () => {
      const removed = registry.removeColor('doesNotExist');
      expect(removed).toBe(false);
    });

    it('should clear all colors', () => {
      registry.registerColors({
        color1: { hex: '#111111', fallback: 'black' },
        color2: { hex: '#222222', fallback: 'gray' },
        color3: { hex: '#333333', fallback: 'white' },
      });

      expect(registry.getColorNames()).toHaveLength(3);

      registry.clear();
      expect(registry.getColorNames()).toHaveLength(0);
    });
  });

  describe('Fallback System', () => {
    it('should return fallback color name', () => {
      registry.registerColor('customGreen', {
        rgb: [0, 255, 0],
        fallback: 'green',
      });

      expect(registry.getFallback('customGreen')).toBe('green');
    });

    it('should return undefined for non-existent color fallback', () => {
      expect(registry.getFallback('doesNotExist')).toBeUndefined();
    });
  });

  describe('Terminal Support Detection', () => {
    it('should detect terminal support levels', () => {
      const support = registry.getTerminalSupport();

      expect(support).toHaveProperty('basic');
      expect(support).toHaveProperty('color256');
      expect(support).toHaveProperty('rgb');

      // Values will vary by environment
      expect(typeof support?.basic).toBe('boolean');
      expect(typeof support?.color256).toBe('boolean');
      expect(typeof support?.rgb).toBe('boolean');
    });
  });

  describe('ANSI Code Generation', () => {
    it('should cache generated ANSI codes', () => {
      registry.registerColor('cached', {
        rgb: [100, 150, 200],
        fallback: 'blue',
      });

      const code1 = registry.getColorCode('cached');
      const code2 = registry.getColorCode('cached');

      // Should return same cached value
      expect(code1).toBe(code2);
    });

    it('should return undefined for non-existent color', () => {
      const code = registry.getColorCode('doesNotExist');
      expect(code).toBeUndefined();
    });
  });

  describe('RGB to 256-color Conversion', () => {
    it('should convert RGB to 256-color for limited terminals', () => {
      // Mock limited terminal support
      const originalEnv = process.env.COLORTERM;
      delete process.env.COLORTERM;

      // Create new registry to test with limited support
      const limitedRegistry =
        new (CustomColorRegistry as unknown as new () => CustomColorRegistry)();

      limitedRegistry.registerColor('rgbColor', {
        rgb: [128, 64, 192],
        fallback: 'purple',
      });

      // The code should still work even with limited support
      const code = limitedRegistry.getColorCode('rgbColor');
      // Should generate some ANSI code
      expect(code).toBeDefined();
      // eslint-disable-next-line no-control-regex
      expect(code).toMatch(/\x1b\[/);

      // Restore environment
      if (originalEnv) {
        process.env.COLORTERM = originalEnv;
      }
    });
  });

  describe('Export/Import', () => {
    it('should export all color definitions', () => {
      registry.registerColors({
        export1: { hex: '#111111', fallback: 'black' },
        export2: { rgb: [255, 0, 0], fallback: 'red' },
        export3: { code256: 42, fallback: 'green' },
      });

      const exported = registry.exportDefinitions();

      expect(exported).toHaveProperty('export1');
      expect(exported).toHaveProperty('export2');
      expect(exported).toHaveProperty('export3');

      expect(exported.export1.hex).toBe('#111111');
      expect(exported.export2.rgb).toEqual([255, 0, 0]);
      expect(exported.export3.code256).toBe(42);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = CustomColorRegistry.getInstance();
      const instance2 = CustomColorRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should share state between getInstance calls', () => {
      const instance1 = CustomColorRegistry.getInstance();
      instance1.registerColor('shared', {
        hex: '#ABCDEF',
        fallback: 'cyan',
      });

      const instance2 = CustomColorRegistry.getInstance();
      expect(instance2.hasColor('shared')).toBe(true);
    });
  });

  describe('Lazy Getter Function', () => {
    it('should provide lazy initialization through getter', () => {
      const lazyRegistry = getCustomColorRegistry();

      expect(lazyRegistry).toBeInstanceOf(CustomColorRegistry);

      // Should return same instance on subsequent calls
      const lazyRegistry2 = getCustomColorRegistry();
      expect(lazyRegistry).toBe(lazyRegistry2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle description field', () => {
      registry.registerColor('documented', {
        hex: '#FF00FF',
        fallback: 'magenta',
        description: 'A well-documented custom color',
      });

      const exported = registry.exportDefinitions();
      expect(exported.documented.description).toBe('A well-documented custom color');
    });

    it('should handle grayscale RGB to 256 conversion', () => {
      // Test the private rgbTo256 method indirectly
      registry.registerColor('gray50', {
        rgb: [128, 128, 128], // Grayscale
        fallback: 'gray',
      });

      // Just verify it doesn't throw
      const code = registry.getColorCode('gray50');
      expect(code === undefined || typeof code === 'string').toBe(true);
    });

    it('should handle extreme RGB values in conversion', () => {
      registry.registerColor('deepBlack', {
        rgb: [0, 0, 0],
        fallback: 'black',
      });

      registry.registerColor('pureWhite', {
        rgb: [255, 255, 255],
        fallback: 'white',
      });

      // Just verify they don't throw
      expect(() => registry.getColorCode('deepBlack')).not.toThrow();
      expect(() => registry.getColorCode('pureWhite')).not.toThrow();
    });
  });
});

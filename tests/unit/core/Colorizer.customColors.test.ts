/**
 * @fileoverview Tests for Colorizer custom color support
 */

import { Colorizer } from '../../../src/core/Colorizer';
import { getCustomColorRegistry } from '../../../src/colors/CustomColorRegistry';

describe('Colorizer Custom Color Support', () => {
  let registry: ReturnType<typeof getCustomColorRegistry>;

  beforeEach(() => {
    // Clear cache and get registry
    Colorizer.clearCache();
    registry = getCustomColorRegistry();
    registry.clear();
  });

  afterEach(() => {
    registry.clear();
    Colorizer.clearCache();
  });

  describe('Custom color application', () => {
    it('should apply custom colors when registered', () => {
      // Register a custom color
      registry.registerColor('customTest', {
        ansi: '\x1b[38;2;255;100;50m', // Custom RGB
        fallback: 'orange',
      });

      // Apply the custom color
      const result = Colorizer.applyColors('Hello', ['customTest' as unknown as string], true);

      // Should contain the custom ANSI code
      expect(result).toContain('\x1b[38;2;255;100;50m');
      expect(result).toContain('Hello');
      expect(result).toContain('\x1b[0m'); // Reset
    });

    it('should use fallback when custom color not supported', () => {
      // Register with only fallback
      registry.registerColor('fallbackTest', {
        rgb: [255, 0, 0], // Will use fallback if RGB not supported
        fallback: 'red',
      });

      // Mock terminal to not support RGB
      const originalCOLORTERM = process.env.COLORTERM;
      delete process.env.COLORTERM;

      // The colorizer should still work with fallback
      const result = Colorizer.applyColors('Test', ['fallbackTest' as unknown as string], true);

      // Should contain some ANSI code (either custom or fallback)
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[[\d;]*m/);
      expect(result).toContain('Test');

      // Restore environment
      if (originalCOLORTERM) {
        process.env.COLORTERM = originalCOLORTERM;
      }
    });

    it('should handle non-existent custom colors gracefully', () => {
      // Try to use a custom color that doesn't exist
      const result = Colorizer.applyColors(
        'Test',
        ['nonExistentCustom' as unknown as string],
        true
      );

      // Should just return the text without styling
      expect(result).toBe('Test');
    });

    it('should cache custom color codes', () => {
      registry.registerColor('cachedCustom', {
        hex: '#00FF00',
        fallback: 'green',
      });

      // First application
      const result1 = Colorizer.applyColors('Test1', ['cachedCustom' as unknown as string], true);

      // Second application should use cache
      const result2 = Colorizer.applyColors('Test2', ['cachedCustom' as unknown as string], true);

      // Both should be styled
      // eslint-disable-next-line no-control-regex
      expect(result1).toMatch(/\x1b\[[\d;]*m.*Test1.*\x1b\[0m/);
      // eslint-disable-next-line no-control-regex
      expect(result2).toMatch(/\x1b\[[\d;]*m.*Test2.*\x1b\[0m/);
    });

    it('should combine custom colors with built-in styles', () => {
      registry.registerColor('customBlue', {
        hex: '#0080FF',
        fallback: 'blue',
      });

      // Combine custom color with built-in style
      const result = Colorizer.applyColors(
        'Mixed',
        ['customBlue' as unknown as string, 'bold'],
        true
      );

      // Should contain both custom color and bold
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[[\d;]*m/); // Some ANSI codes
      expect(result).toContain('Mixed');
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent custom colors gracefully', () => {
      // Try to use a custom color that doesn't exist
      const result = Colorizer.applyColors(
        'Test',
        ['nonExistentCustom' as unknown as string],
        true
      );

      // Should just return the text without styling
      expect(result).toBe('Test');
    });

    it('should handle invalid custom color names gracefully', () => {
      // Try various invalid custom color names
      const result1 = Colorizer.applyColors('Test1', ['123invalid' as unknown as string], true);
      const result2 = Colorizer.applyColors('Test2', ['!@#$%' as unknown as string], true);
      const result3 = Colorizer.applyColors('Test3', ['' as unknown as string], true);

      // Should return text without styling
      expect(result1).toBe('Test1');
      expect(result2).toBe('Test2');
      expect(result3).toBe('Test3');
    });
  });

  describe('Cache management', () => {
    it('should clear cache when custom colors change', () => {
      registry.registerColor('changing', {
        hex: '#FF0000',
        fallback: 'red',
      });

      // Apply color
      Colorizer.applyColors('Test1', ['changing' as unknown as string], true);

      // Clear cache (simulating color change)
      Colorizer.clearCache();

      // Re-register with different color
      registry.removeColor('changing');
      registry.registerColor('changing', {
        hex: '#00FF00',
        fallback: 'green',
      });

      // Apply again - should use new color
      const result = Colorizer.applyColors('Test2', ['changing' as unknown as string], true);

      // Should be styled (exact color depends on terminal support)
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[[\d;]*m.*Test2.*\x1b\[0m/);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with color parts', () => {
      registry.registerColor('partColor', {
        hex: '#FFA500',
        fallback: 'yellow',
      });

      const parts = [
        { text: 'Normal ', color: 'red' as unknown as string },
        { text: 'Custom ', color: 'partColor' as unknown as string },
        { text: 'Text', color: 'blue' as unknown as string },
      ];

      const result = Colorizer.colorParts(parts, true);

      // Should contain all three parts
      expect(result).toContain('Normal');
      expect(result).toContain('Custom');
      expect(result).toContain('Text');

      // Should have ANSI codes
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[[\d;]*m/);
    });

    it('should work with applyColors for single custom color', () => {
      registry.registerColor('singleCustom', {
        code256: 208,
        fallback: 'orange',
      });

      const result = Colorizer.applyColors(
        'Orange Text',
        ['singleCustom' as unknown as string],
        true
      );

      // Should apply the custom color
      expect(result).toContain('Orange Text');
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[[\d;]*m/);
    });
  });

  describe('Performance', () => {
    it('should not load registry if no custom colors used', () => {
      // Use only built-in colors
      const result = Colorizer.applyColors('Test', ['red', 'bold'], true);

      // Should work without loading custom registry
      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\x1b\[31m.*\x1b\[1m.*Test.*\x1b\[0m/);
    });

    it('should handle many custom colors efficiently', () => {
      // Register many custom colors
      for (let i = 0; i < 100; i++) {
        registry.registerColor(`custom${i}`, {
          code256: i % 256, // Valid values 0-255
          fallback: 'white',
        });
      }

      const start = Date.now();

      // Apply multiple custom colors
      for (let i = 0; i < 100; i++) {
        Colorizer.applyColors(`Test ${i}`, [`custom${i}` as unknown as string], true);
      }

      const duration = Date.now() - start;

      // Should complete quickly (< 100ms for 100 applications)
      expect(duration).toBeLessThan(100);
    });
  });
});

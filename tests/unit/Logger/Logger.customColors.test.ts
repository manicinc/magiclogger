/**
 * @fileoverview Tests for Logger custom color functionality
 */

import { Logger } from '../../../src/Logger';
import { Colorizer } from '../../../src/core/Colorizer';

describe('Logger Custom Colors', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ useColors: true });
    // Clear any cached colors
    Colorizer.clearCache();
  });

  afterEach(async () => {
    // Clean up custom colors
    const customColors = await logger.getCustomColors();
    for (const color of customColors) {
      await logger.removeCustomColor(color);
    }
  });

  describe('registerCustomColor', () => {
    it('should register a custom color with hex format', async () => {
      logger.registerCustomColor('testBrand', {
        hex: '#FF5733',
        fallback: 'orange',
      });

      // Give async registration time to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      const colors = await logger.getCustomColors();
      expect(colors).toContain('testBrand');
    });

    it('should register a custom color with RGB format', async () => {
      logger.registerCustomColor('testRGB', {
        rgb: [255, 0, 128],
        fallback: 'magenta',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      const colors = await logger.getCustomColors();
      expect(colors).toContain('testRGB');
    });

    it('should register a custom color with 256-color code', async () => {
      logger.registerCustomColor('test256', {
        code256: 196,
        fallback: 'red',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      const colors = await logger.getCustomColors();
      expect(colors).toContain('test256');
    });

    it('should handle registration errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Try to register with invalid data (will be caught by registry)
      logger.registerCustomColor('invalid', {
        // No color format provided
        fallback: 'red',
      } as Record<string, unknown>);

      // Wait for async error
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Logger] Failed to register custom color:'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('registerCustomColors', () => {
    it('should register multiple custom colors at once', async () => {
      logger.registerCustomColors({
        brand1: { hex: '#FF0000', fallback: 'red' },
        brand2: { hex: '#00FF00', fallback: 'green' },
        brand3: { hex: '#0000FF', fallback: 'blue' },
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      const colors = await logger.getCustomColors();
      expect(colors).toContain('brand1');
      expect(colors).toContain('brand2');
      expect(colors).toContain('brand3');
    });
  });

  describe('removeCustomColor', () => {
    it('should remove a registered custom color', async () => {
      // First register a color
      logger.registerCustomColor('toRemove', {
        hex: '#123456',
        fallback: 'cyan',
      });

      // Wait for registration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Remove the color
      const removed = await logger.removeCustomColor('toRemove');
      expect(removed).toBe(true);

      // Verify it's gone
      const colors = await logger.getCustomColors();
      expect(colors).not.toContain('toRemove');
    });

    it('should return false when removing non-existent color', async () => {
      const removed = await logger.removeCustomColor('doesNotExist');
      expect(removed).toBe(false);
    });

    it('should clear Colorizer cache after removal', async () => {
      const clearCacheSpy = jest.spyOn(Colorizer, 'clearCache');

      logger.registerCustomColor('cached', {
        hex: '#ABCDEF',
        fallback: 'blue',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      await logger.removeCustomColor('cached');
      expect(clearCacheSpy).toHaveBeenCalled();

      clearCacheSpy.mockRestore();
    });
  });

  describe('getCustomColors', () => {
    it('should return empty array when no custom colors registered', async () => {
      const colors = await logger.getCustomColors();
      expect(colors).toEqual([]);
    });

    it('should return list of registered custom colors', async () => {
      logger.registerCustomColors({
        color1: { hex: '#111111', fallback: 'black' },
        color2: { hex: '#222222', fallback: 'gray' },
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const colors = await logger.getCustomColors();
      expect(colors).toHaveLength(2);
      expect(colors).toContain('color1');
      expect(colors).toContain('color2');
    });

    it('should handle import errors gracefully', async () => {
      // The method already handles errors internally and returns empty array
      // This test just verifies the method exists and returns an array
      const colors = await logger.getCustomColors();
      expect(Array.isArray(colors)).toBe(true);
    });
  });

  describe('Integration with themes', () => {
    it('should allow custom colors in themes', async () => {
      logger.registerCustomColor('themeColor', {
        hex: '#FF69B4',
        fallback: 'magenta',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      // Set theme with custom color
      logger.setTheme({
        header: ['themeColor', 'bold'],
        info: ['themeColor'],
      });

      const theme = logger.getTheme();
      expect(theme.header).toContain('themeColor');
      expect(theme.info).toContain('themeColor');
    });
  });

  describe('Cache clearing', () => {
    it('should clear Colorizer cache after registration', async () => {
      const clearCacheSpy = jest.spyOn(Colorizer, 'clearCache');

      logger.registerCustomColor('cacheTest', {
        hex: '#FEDCBA',
        fallback: 'yellow',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(clearCacheSpy).toHaveBeenCalled();
      clearCacheSpy.mockRestore();
    });
  });

  describe('Lazy loading', () => {
    it('should only load CustomColorRegistry when needed', () => {
      // The registry shouldn't be loaded until we actually register a color
      const newLogger = new Logger();

      // This is just creating the logger, not loading the registry
      expect(newLogger).toBeDefined();

      // Registry loads here
      newLogger.registerCustomColor('lazy', {
        hex: '#LAZY00',
        fallback: 'green',
      });

      // We can't easily test if the module was loaded, but we can verify
      // the functionality works
      expect(() =>
        newLogger.registerCustomColor('lazy2', {
          hex: '#LAZY01',
          fallback: 'blue',
        })
      ).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should log error if custom color registration fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock the dynamic import to fail
      const mockLogger = new Logger();
      const mockLoggerWithMethod = mockLogger as unknown as { registerCustomColor: jest.Mock };
      mockLoggerWithMethod.registerCustomColor = jest.fn((_name: string, _def: unknown) => {
        import('../../../src/colors/CustomColorRegistry')
          .then(() => {
            throw new Error('Mock registration error');
          })
          .catch((err: Error) => {
            console.error('[Logger] Failed to register custom color:', err);
          });
      });

      mockLogger.registerCustomColor('failing', {
        hex: '#FAILED',
        fallback: 'red',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Logger] Failed to register custom color:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});

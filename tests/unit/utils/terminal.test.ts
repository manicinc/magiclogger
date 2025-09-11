import {
  isStyleSupported,
  getFallbackStyle,
  getTerminalSupport,
  terminalSupport,
} from '../../../src/utils/terminal';

describe('Terminal Utilities', () => {
  // Save original environment
  const originalEnv = { ...process.env };
  const originalPlatform = process.platform;

  afterEach(() => {
    // Restore original environment after each test
    process.env = { ...originalEnv };
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    jest.resetModules();
  });

  describe('Terminal Support Detection', () => {
    it('should provide terminal support information', () => {
      const support = getTerminalSupport();

      // Basic properties should exist
      expect(support).toHaveProperty('basic');
      expect(support).toHaveProperty('colors');
      expect(support).toHaveProperty('brightColors');
      expect(support).toHaveProperty('rgb');

      // Style support properties
      expect(support.styles).toHaveProperty('bold');
      expect(support.styles).toHaveProperty('dim');
      expect(support.styles).toHaveProperty('italic');
      expect(support.styles).toHaveProperty('underline');
      expect(support.styles).toHaveProperty('blink');
      expect(support.styles).toHaveProperty('reverse');
      expect(support.styles).toHaveProperty('hidden');
      expect(support.styles).toHaveProperty('strikethrough');

      // Advanced features
      expect(support.features).toHaveProperty('hyperlinks');
      expect(support.features).toHaveProperty('cursorMovement');
      expect(support.features).toHaveProperty('windowTitle');
      expect(support.features).toHaveProperty('mouseTracking');
    });

    it('should detect VS Code terminal', () => {
      // Mock VS Code environment
      process.env.TERM_PROGRAM = 'vscode';

      // Reset module cache to trigger detection again
      jest.resetModules();

      // Fix the require statement with proper import
      // We need to use dynamic import for this case
      // This will need to be an async test
      return import('../../../src/utils/terminal').then(({ getTerminalSupport }) => {
        const support = getTerminalSupport();
        expect(support.rgb).toBe(true);
        expect(support.styles.bold).toBe(true);
        expect(support.features.hyperlinks).toBe(true);
      });
    });

    it('should detect iTerm2 terminal', async () => {
      // Mock iTerm2 environment
      process.env.TERM_PROGRAM = 'iTerm.app';

      // Reset module cache to trigger detection again
      jest.resetModules();

      // Use dynamic import with async/await
      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.rgb).toBe(true);
      expect(support.styles.italic).toBe(true);
      expect(support.features.mouseTracking).toBe(true);
    });

    it('should detect Windows Terminal', async () => {
      // Mock Windows Terminal environment
      process.env.TERM_PROGRAM = 'Windows Terminal';

      // Reset module cache to trigger detection again and re-import
      jest.resetModules();
      const { getTerminalSupport } = await import('../../../src/utils/terminal');
      const support = getTerminalSupport();
      expect(support.rgb).toBe(true);
      expect(support.styles.strikethrough).toBe(true);
      expect(support.features.windowTitle).toBe(true);
    });

    it('should detect Windows CMD', async () => {
      // Mock Windows CMD environment
      delete process.env.TERM_PROGRAM;
      delete process.env.COLORTERM;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.rgb).toBe(false);
      expect(support.styles.underline).toBe(false);
      expect(support.features.cursorMovement).toBe(true);
    });

    it('should detect xterm capabilities', async () => {
      // Mock xterm environment
      delete process.env.TERM_PROGRAM;
      process.env.TERM = 'xterm-256color';

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.rgb).toBe(true);
      expect(support.colors).toBe(true);
      expect(support.brightColors).toBe(true);
    });

    it('should detect true color support', async () => {
      // Mock true color terminal
      process.env.COLORTERM = 'truecolor';

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.rgb).toBe(true);
    });

    it('should handle CI environment', async () => {
      // Mock CI environment
      process.env.CI = 'true';

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.styles.blink).toBe(false);
      expect(support.styles.hidden).toBe(false);
    });

    // Additional tests to cover more code paths
    it('should handle 24bit color term', async () => {
      // Mock 24bit color terminal
      process.env.COLORTERM = '24bit';

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.rgb).toBe(true);
    });

    it('should detect xterm-color terminal', async () => {
      // Mock xterm-color environment
      delete process.env.TERM_PROGRAM;
      process.env.TERM = 'xterm-color';

      // Reset module cache to trigger detection again
      jest.resetModules();

      const { getTerminalSupport } = await import('../../../src/utils/terminal');

      const support = getTerminalSupport();
      expect(support.colors).toBe(true);
      expect(support.brightColors).toBe(true);
    });
  });

  describe('Style Support Checking', () => {
    it('should get appropriate fallback styles', () => {
      // Mock the terminalSupport.isStyleSupported to always return false
      // This ensures that getFallbackStyle will return the fallback value
      jest.spyOn(terminalSupport, 'isStyleSupported').mockReturnValue(false);

      // Mock the NODE_ENV to ensure it's not 'test' for this specific test
      // This is because the implementation has special handling for test environment
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Test all fallback values
      expect(getFallbackStyle('italic')).toBe('normal');
      expect(getFallbackStyle('dim')).toBe('gray');
      expect(getFallbackStyle('strikethrough')).toBe('normal');
      expect(getFallbackStyle('blink')).toBe('bold');
      expect(getFallbackStyle('hidden')).toBe('normal');
      expect(getFallbackStyle('doubleUnderline')).toBe('underline');
      expect(getFallbackStyle('curlyUnderline')).toBe('underline');

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;

      // Restore original implementation
      jest.restoreAllMocks();
    });

    it('handles empty or invalid style names', () => {
      // Should not throw for empty or invalid styles
      expect(() => isStyleSupported('')).not.toThrow();
      expect(() => isStyleSupported(null as unknown as string)).not.toThrow();
      expect(() => isStyleSupported(undefined as unknown as string)).not.toThrow();
      expect(() => isStyleSupported(123 as unknown as string)).not.toThrow();

      // Testing behavior for nonexistent style (should return true per implementation)
      expect(isStyleSupported('nonexistentStyle')).toBe(true);
    });

    it('handles getFallbackStyle with edge cases', () => {
      // Mock the NODE_ENV to ensure it's not 'test' for this specific test
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock isStyleSupported to return false for unknown styles
      jest.spyOn(terminalSupport, 'isStyleSupported').mockImplementation((style: string) => {
        return style !== 'completelyUnknownStyle';
      });

      // Should not throw for empty or invalid styles
      expect(() => getFallbackStyle('')).not.toThrow();
      expect(() => getFallbackStyle(null as unknown as string)).not.toThrow();
      expect(() => getFallbackStyle(undefined as unknown as string)).not.toThrow();
      expect(() => getFallbackStyle(123 as unknown as string)).not.toThrow();

      // Test with nonexistent style
      const result = getFallbackStyle('nonexistentStyle');
      expect(typeof result).toBe('string');

      // Testing 'normal' fallback for unknown styles
      const unknownResult = getFallbackStyle('completelyUnknownStyle');
      expect(unknownResult).toBe('normal');

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;

      // Restore mocks
      jest.restoreAllMocks();
    });

    it('handles inconsistent terminal environments', async () => {
      // Save original env
      const originalEnv = { ...process.env };

      // Test conflicting terminal environments
      process.env.TERM_PROGRAM = 'vscode';
      process.env.TERM = 'xterm-256color';
      process.env.COLORTERM = 'truecolor';

      // Reset terminal support to force detection and re-import dynamically
      jest.resetModules();
      const { getTerminalSupport } = await import('../../../src/utils/terminal');
      const support = getTerminalSupport();

      // Should have merged properties
      expect(support.rgb).toBe(true);

      // Restore original env
      process.env = { ...originalEnv };
    });

    it('tests CLI environment detection', () => {
      // Save original env
      const originalEnv = { ...process.env };

      // Set CI environment
      process.env.CI = 'true';

      // Reset terminal support to force detection and import dynamically
      jest.resetModules();
      return import('../../../src/utils/terminal').then(({ getTerminalSupport }) => {
        const support = getTerminalSupport();

        // CI environments should disable potentially disruptive styles
        expect(support.styles.blink).toBe(false);
        expect(support.styles.hidden).toBe(false);

        // Restore original env
        process.env = { ...originalEnv };
      });
    });

    it('should check if a style is supported', () => {
      // These should always return a boolean
      expect(typeof isStyleSupported('bold')).toBe('boolean');
      expect(typeof isStyleSupported('italic')).toBe('boolean');
      expect(typeof isStyleSupported('underline')).toBe('boolean');

      // Unknown style should default to true (as per implementation)
      expect(isStyleSupported('nonexistent')).toBe(true);
    });

    it('should return the same style when style is supported', () => {
      // Mock isStyleSupported to always return true
      jest.spyOn(terminalSupport, 'isStyleSupported').mockImplementation(() => true);

      expect(getFallbackStyle('italic')).toBe('italic');
      expect(getFallbackStyle('dim')).toBe('dim');
      expect(getFallbackStyle('blink')).toBe('blink');
    });
  });

  describe('Singleton Pattern', () => {
    it('handles inconsistent terminal environments', () => {
      // Save original env
      const originalEnv = { ...process.env };

      // Test conflicting terminal environments
      process.env.TERM_PROGRAM = 'vscode';
      process.env.TERM = 'xterm-256color';
      process.env.COLORTERM = 'truecolor';

      // Reset terminal support to force detection and import dynamically
      jest.resetModules();
      return import('../../../src/utils/terminal').then(({ getTerminalSupport }) => {
        const support = getTerminalSupport();

        // Should have merged properties
        expect(support.rgb).toBe(true);

        // Restore original env
        process.env = { ...originalEnv };
      });
    });

    it('should initialize terminal detection only once', () => {
      // Create a spy on the detect method
      // Fix the any type
      type TerminalDetector = {
        detect: () => void;
      };

      const detectSpy = jest.spyOn(terminalSupport as unknown as TerminalDetector, 'detect');

      // Call getTerminalSupport multiple times
      getTerminalSupport();
      getTerminalSupport();
      getTerminalSupport();

      // The detect method should only be called once during initialization
      // It might have been called already during module load, so we just verify
      // it wasn't called multiple times during our test
      expect(detectSpy).toHaveBeenCalledTimes(0);
    });
  });
});

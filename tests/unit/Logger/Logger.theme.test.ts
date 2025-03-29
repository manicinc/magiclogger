import { Logger } from '../../../src/Logger';
import { ThemeManager } from '../../../src/theme/ThemeManager';
import type { ColorName } from '../../../src/types';

const mockTheme: Record<string, ColorName[]> = {
  info: ['cyan', 'bold'],
  error: ['red', 'bold'],
  header: ['brightWhite', 'bgBlue'],
};

describe('Logger Theme Support', () => {
  it('should apply custom theme object', () => {
    const logger = new Logger({ verbose: true, theme: mockTheme });
    expect(() => logger.info('Test info')).not.toThrow();
    expect(() => logger.error('Test error')).not.toThrow();
    expect(() => logger.header('Themed Header')).not.toThrow();
  });

  it('should resolve theme name using ThemeManager', () => {
    const logger = new Logger({ theme: 'default' }); // Assuming ThemeManager has default
    expect(() => logger.info('Theme name resolution')).not.toThrow();
  });

  it('should allow changing theme dynamically via setTheme()', () => {
    const logger = new Logger({ verbose: true });
    logger.setTheme(mockTheme);
    expect(() => logger.success('Success after theme change')).not.toThrow();
  });

  it('should not throw with unknown keys in theme', () => {
    const partialTheme = { info: ['green'], foo: ['blue'] } as any;
    const logger = new Logger({ theme: partialTheme });
    expect(() => logger.info('Test partial theme')).not.toThrow();
  });

  it('should fallback safely on invalid theme string', () => {
    const logger = new Logger({ theme: 'nonexistent' });
    expect(() => logger.warn('Fallback on invalid theme name')).not.toThrow();
  });

  it('should apply full theme JSON from ThemeManager', () => {
    const tm = new ThemeManager();
    const allThemes = Object.keys(tm.themes);
    expect(allThemes.length).toBeGreaterThan(0);
    const logger = new Logger({ theme: allThemes[0] });
    expect(() => logger.debug('Using theme from ThemeManager')).not.toThrow();
  });
});

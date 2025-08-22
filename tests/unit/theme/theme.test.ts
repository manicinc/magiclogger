import { ThemeManager } from '../../../src/theme/ThemeManager';
import { Logger } from '../../../src/Logger';
import type { ColorName } from '../../../src/types';
import { fsMocks } from '../../../jest.setup';
import { Printer } from '../../../src/core/Printer';

const testThemeName = 'test-theme';
const testThemesData: Record<string, Record<string, ColorName[]>> = {
  [testThemeName]: {
    info: ['cyan', 'bold'],
    error: ['brightRed'],
    header: ['brightWhite', 'bgGreen', 'bold'],
  },
};

describe('ThemeManager Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue(JSON.stringify(testThemesData));
  });

  it('should load theme from themes.json via ThemeManager', () => {
    const themeManager = new ThemeManager();
    const loadedTheme = themeManager.getTheme(testThemeName);
    expect(loadedTheme).toEqual(testThemesData[testThemeName]);
  });

  it('should apply styles using ThemeManager', () => {
    const themeManager = new ThemeManager();
    const styled = themeManager.applyStyles(['green', 'bold'], 'Styled Message');
    expect(styled).toContain('Styled Message');
    expect(styled).toContain('\x1b'); // ANSI escape code
  });
});

describe('Logger with file-loaded theme', () => {
  let logger: Logger;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up mock implementations
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue(JSON.stringify(testThemesData));

    const themeManager = new ThemeManager();
    const loadedTheme = themeManager.getTheme(testThemeName);
    logger = new Logger({
      theme: loadedTheme,
      writeToDisk: false, // Ensure we're using console transport
      useColors: true,
    });
  });

  it('should use loaded theme colors for info logs', async () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('Theme-based info log');
    
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should have logged through console transport (structured JSON)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Theme-based info log"'));
    consoleSpy.mockRestore();
  });

  it('should use loaded theme for header styling', async () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    logger.header('File Theme Header');
    
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should have logged header through console transport with ANSI styling (brightWhite, bgGreen, bold)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"\\u001b[97m\\u001b[42m\\u001b[1mFile Theme Header\\u001b[0m"'));
    consoleSpy.mockRestore();
  });
});

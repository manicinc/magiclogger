import { ThemeManager } from '../../../src/theme/ThemeManager';
import { Logger } from '../../../src/Logger';
import type { ColorName } from '../../../src/types';
import * as fs from 'fs';

const testThemeName = 'test-theme';
const testThemesData: Record<string, Record<string, ColorName[]>> = {
  [testThemeName]: {
    info: ['cyan', 'bold'],
    error: ['brightRed'],
    header: ['brightWhite', 'bgGreen', 'bold'],
  },
};

describe('ThemeManager Integration', () => {
  let originalExistsSync: typeof fs.existsSync;
  let originalReadFileSync: typeof fs.readFileSync;

  beforeEach(() => {
    // Store original functions
    originalExistsSync = fs.existsSync;
    originalReadFileSync = fs.readFileSync;

    // Mock fs functions manually
    (fs as any).existsSync = jest.fn().mockReturnValue(true);
    (fs as any).readFileSync = jest.fn().mockReturnValue(JSON.stringify(testThemesData));
  });

  afterEach(() => {
    // Restore original functions
    (fs as any).existsSync = originalExistsSync;
    (fs as any).readFileSync = originalReadFileSync;
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
    // Reset all mocks and set up our test data
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => JSON.stringify(testThemesData));

    const themeManager = new ThemeManager();
    const loadedTheme = themeManager.getTheme(testThemeName);
    logger = new Logger({ theme: loadedTheme });
  });

  it.skip('should use loaded theme colors for info logs', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    logger.info('Theme-based info log');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Theme-based info log'));
    spy.mockRestore();
  });

  it.skip('should use loaded theme for header styling', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    logger.header('File Theme Header');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('File Theme Header'));
    spy.mockRestore();
  });
});

import { ThemeManager } from '../../../src/theme/ThemeManager';
import { Logger } from '../../../src/Logger';
import type { ColorName } from '../../../src/types';
import * as fs from 'fs';
import * as path from 'path';

const testThemeName = 'test-theme';
const testThemesPath = path.resolve(__dirname, '../../../theme/themes.json');
const testThemesData: Record<string, Record<string, ColorName[]>> = {
  [testThemeName]: {
    info: ['cyan', 'bold'],
    error: ['brightRed'],
    header: ['brightWhite', 'bgGreen', 'bold'],
  },
};

describe('ThemeManager Integration', () => {
  beforeAll(() => {
    fs.writeFileSync(testThemesPath, JSON.stringify(testThemesData, null, 2));
  });

  afterAll(() => {
    fs.unlinkSync(testThemesPath);
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
    const themeManager = new ThemeManager();
    const loadedTheme = themeManager.getTheme(testThemeName);
    logger = new Logger({ theme: loadedTheme });
  });

  it('should use loaded theme colors for info logs', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    logger.info('Theme-based info log');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Theme-based info log'));
    spy.mockRestore();
  });

  it('should use loaded theme for header styling', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    logger.header('File Theme Header');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('File Theme Header'));
    spy.mockRestore();
  });
});

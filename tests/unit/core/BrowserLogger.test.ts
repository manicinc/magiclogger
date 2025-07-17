import { BrowserLogger } from '../../../src/core/BrowserLogger';
import { Printer } from '../../../src/core/Printer';
import { ColorName } from '../../../src/types';

// Use the global localStorage mock from jest.setup.ts
const mockLocalStorage = global.localStorage as jest.Mocked<typeof localStorage> & {
  _getStore: () => Record<string, string>;
  _resetStore: () => void;
};

// Mock Printer methods
jest.mock('../../../src/core/Printer', () => ({
  Printer: {
    print: jest.fn(),
    printProgress: jest.fn(),
    printTable: jest.fn(),
    setUseColors: jest.fn(),
  },
}));

describe('BrowserLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('initializes with default options', () => {
    const logger = new BrowserLogger();
    expect(logger).toBeDefined();
    expect(logger['storeInBrowser']).toBeFalsy();
    expect(logger['storageManager']).toBeNull();
  });

  it('initializes with browser storage enabled', () => {
    const logger = new BrowserLogger({
      storeInBrowser: true,
      storageName: 'test-logs',
      maxStoredLogs: 500,
    });
    expect(logger).toBeDefined();
    expect(logger['storeInBrowser']).toBeTruthy();
    expect(logger['storageManager']).not.toBeNull();
  });

  it('logs messages to console', () => {
    const logger = new BrowserLogger();

    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.success('Success message');

    expect(Printer.print).toHaveBeenCalledTimes(4);
  });

  it('stores logs when browser storage is enabled', () => {
    const logger = new BrowserLogger({ storeInBrowser: true });

    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // Check that logs were stored
    const logs = logger.getLogs();
    expect(logs).not.toBeNull();
    expect(logs?.length).toBe(3);
    expect(logs?.[0]).toContain('[INFO] Info message');
    expect(logs?.[1]).toContain('[WARN] Warning message');
    expect(logs?.[2]).toContain('[ERROR] Error message');
  });

  it('respects verbose setting for debug messages', () => {
    // Create logger with verbose disabled
    const quietLogger = new BrowserLogger({ verbose: false });
    quietLogger.debug('Should not be printed');
    expect(Printer.print).not.toHaveBeenCalled();

    // Create logger with verbose enabled
    const verboseLogger = new BrowserLogger({ verbose: true });
    verboseLogger.debug('Should be printed');
    expect(Printer.print).toHaveBeenCalledTimes(1);
  });

  it('supports custom styling', () => {
    const logger = new BrowserLogger();

    logger.custom('Custom message', ['red', 'bold'], 'CUSTOM');
    logger.styled('Styled message', 'error');

    expect(Printer.print).toHaveBeenCalledTimes(2);
  });

  it('handles browser storage operations', () => {
    const logger = new BrowserLogger({ storeInBrowser: true });

    // Add some logs
    logger.info('First log');
    logger.info('Second log');

    // Verify logs are stored
    expect(logger.getLogs()?.length).toBe(2);

    // Clear logs
    logger.clearLogs();

    // Verify logs are cleared
    expect(logger.getLogs()?.length).toBe(0);

    // Enable/disable storage
    logger.setStorageEnabled(false);
    expect(logger['storeInBrowser']).toBeFalsy();

    logger.setStorageEnabled(true);
    expect(logger['storeInBrowser']).toBeTruthy();
  });

  it('implements Node.js compatibility methods as no-ops', () => {
    const logger = new BrowserLogger();

    // These should not throw errors
    expect(logger.getLogFilePath()).toBeNull();
    expect(logger.getLogDirectory()).toBe('browser');
    expect(logger.getLogRetentionDays()).toBe(0);

    // These should be no-ops
    expect(() => logger.setFileLogging(true)).not.toThrow();
    expect(() => logger.setLogDirectory('/path')).not.toThrow();
    expect(() => logger.setLogRetentionDays(10)).not.toThrow();
  });

  it('handles table, link, and progress bar printing', () => {
    const logger = new BrowserLogger({ storeInBrowser: true });

    // Test table
    const tableData = [{ name: 'Test', value: 123 }];
    logger.table(tableData);
    expect(Printer.printTable).toHaveBeenCalledWith(tableData, expect.any(Array));

    // Test link
    logger.link('https://example.com', 'Example');
    expect(Printer.print).toHaveBeenCalled();

    // Test progress bar
    logger.progressBar(50);
    expect(Printer.print).toHaveBeenCalled();

    // Test 100% progress
    logger.progressBar(100);

    // Check logs were saved for these operations
    const logs = logger.getLogs();
    expect(logs?.some(log => log.includes('[TABLE]'))).toBeTruthy();
    expect(logs?.some(log => log.includes('[LINK]'))).toBeTruthy();
    expect(logs?.some(log => log.includes('[PROGRESS]'))).toBeTruthy();
  });

  it('translates setFileLogging to setStorageEnabled in browser', () => {
    const logger = new BrowserLogger();

    // Initially, storage should be disabled
    expect(logger['storeInBrowser']).toBeFalsy();

    // Using setFileLogging(true) should enable browser storage
    logger.setFileLogging(true);
    expect(logger['storeInBrowser']).toBeTruthy();
    expect(logger['storageManager']).not.toBeNull();
  });

  it('supports theme setting', () => {
    const logger = new BrowserLogger();
    // Argument of type '{ info: string[]; error: string[]; }' is not assignable to parameter of type 'Record<string, ColorName[]>'
    const theme: Record<string, ColorName[]> = {
      info: ['blue', 'bold'],
      error: ['red', 'bold'],
    };

    // Should not throw
    expect(() => logger.setTheme(theme)).not.toThrow();
  });
});

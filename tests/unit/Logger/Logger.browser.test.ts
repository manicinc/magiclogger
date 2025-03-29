import { Logger } from '../../../src/Logger';
import { BrowserLogger } from '../../../src/core/BrowserLogger';
import { spyOnConstructor } from '../../../jest.setup';

// Mock BrowserLogger methods
jest.mock('../../../src/core/BrowserLogger', () => {
  const originalModule = jest.requireActual('../../../src/core/BrowserLogger');

  // Create a mock class that extends the original
  class MockBrowserLogger extends originalModule.BrowserLogger {
    getLogs = jest.fn().mockReturnValue(['Test log']);
    clearLogs = jest.fn();
    downloadLogs = jest.fn();
    setStorageEnabled = jest.fn();
  }

  return {
    ...originalModule,
    BrowserLogger: MockBrowserLogger,
  };
});

// Mock window detection
let windowMock: Record<string, any> = {};
Object.defineProperty(global, 'window', {
  get: () => windowMock,
  configurable: true,
});

describe('Logger Browser Integration', () => {
  // Helper to toggle browser environment
  const setBrowserEnvironment = (isBrowser: boolean) => {
    windowMock = isBrowser ? { document: {} } : (undefined as any);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a BrowserLogger when in browser environment', () => {
    // Set as browser environment
    setBrowserEnvironment(true);

    const logger = new Logger();
    expect(logger['loggerInstance']).toBeInstanceOf(BrowserLogger);
  });

  it('delegates browser storage methods in browser environment', () => {
    // Set as browser environment
    setBrowserEnvironment(true);

    const logger = new Logger();

    // Test getLogs delegation
    const logs = logger.getLogs();
    expect(logs).toEqual(['Test log']);
    expect((logger['loggerInstance'] as BrowserLogger).getLogs).toHaveBeenCalled();

    // Test clearLogs delegation
    logger.clearLogs();
    expect((logger['loggerInstance'] as BrowserLogger).clearLogs).toHaveBeenCalled();

    // Test downloadLogs delegation
    logger.downloadLogs('test.txt');
    expect((logger['loggerInstance'] as BrowserLogger).downloadLogs).toHaveBeenCalledWith(
      'test.txt'
    );

    // Test setStorageEnabled delegation
    logger.setStorageEnabled(true);
    expect((logger['loggerInstance'] as BrowserLogger).setStorageEnabled).toHaveBeenCalledWith(
      true
    );
  });

  it('returns null for getLogs in Node.js environment', () => {
    // Set as Node.js environment
    setBrowserEnvironment(false);

    const logger = new Logger();
    const logs = logger.getLogs();
    expect(logs).toBeNull();
  });

  it('no-ops browser methods in Node.js environment', () => {
    // Set as Node.js environment
    setBrowserEnvironment(false);

    const logger = new Logger();

    // These should be no-ops in Node environment
    expect(() => logger.clearLogs()).not.toThrow();
    expect(() => logger.downloadLogs()).not.toThrow();
    expect(() => logger.setStorageEnabled(true)).not.toThrow();
  });

  it('initializes BrowserLogger with browser storage options', () => {
    // Set as browser environment
    setBrowserEnvironment(true);

    // Create a constructor spy without using jest.spyOn
    const constructorSpy = spyOnConstructor(BrowserLogger);

    // Create logger with browser options
    const options = {
      storeInBrowser: true,
      maxStoredLogs: 500,
      storageName: 'custom-logs',
      useLocalStorage: false,
    };

    new Logger(options);

    // Check if constructor was called with expected options
    expect(constructorSpy).toHaveBeenCalledWith(expect.objectContaining(options));

    // Restore original constructor
    jest.restoreAllMocks();
  });
});

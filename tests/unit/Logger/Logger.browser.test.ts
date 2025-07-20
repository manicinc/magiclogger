import { Logger } from '../../../src/Logger';
import { BrowserLogger } from '../../../src/core/BrowserLogger';

// Create a proper mock for BrowserLogger
const MockBrowserLogger = jest.fn().mockImplementation((_options) => {
  const instance = {
    getLogs: jest.fn().mockReturnValue(['Test log']),
    clearLogs: jest.fn(),
    downloadLogs: jest.fn(),
    setStorageEnabled: jest.fn(),
    // Add other methods that might be called
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    success: jest.fn(),
    header: jest.fn(),
    table: jest.fn(),
    progressBar: jest.fn(),
    custom: jest.fn(),
    styled: jest.fn(),
    separator: jest.fn(),
    close: jest.fn(),
  };
  
  // Make the instance appear to be an instance of BrowserLogger
  Object.setPrototypeOf(instance, BrowserLogger.prototype);
  
  return instance;
});

// Mock the BrowserLogger module
jest.mock('../../../src/core/BrowserLogger', () => ({
  BrowserLogger: MockBrowserLogger,
}));

// Mock window detection
let windowMock: Record<string, unknown> | undefined = {};
Object.defineProperty(global, 'window', {
  get: () => windowMock,
  configurable: true,
});

describe('Logger Browser Integration', () => {
  // Helper to toggle browser environment
  const setBrowserEnvironment = (isBrowser: boolean) => {
    windowMock = isBrowser ? { document: {} } : undefined;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockBrowserLogger.mockClear();
  });

  it('creates a BrowserLogger when in browser environment', () => {
    // Set as browser environment
    setBrowserEnvironment(true);

    const logger = new Logger();
    expect(logger['loggerInstance']).toBeInstanceOf(BrowserLogger);
    expect(MockBrowserLogger).toHaveBeenCalled();
  });

  it('delegates browser storage methods in browser environment', () => {
    // Set as browser environment
    setBrowserEnvironment(true);

    const logger = new Logger();
    const browserLogger = logger['loggerInstance'] as unknown;

    // Test getLogs delegation
    const logs = logger.getLogs();
    expect(logs).toEqual(['Test log']);
    expect((browserLogger as { getLogs: jest.Mock }).getLogs).toHaveBeenCalled();

    // Test clearLogs delegation
    logger.clearLogs();
    expect((browserLogger as { clearLogs: jest.Mock }).clearLogs).toHaveBeenCalled();

    // Test downloadLogs delegation
    logger.downloadLogs('test.txt');
    expect((browserLogger as { downloadLogs: jest.Mock }).downloadLogs).toHaveBeenCalledWith('test.txt');

    // Test setStorageEnabled delegation
    logger.setStorageEnabled(true);
    expect((browserLogger as { setStorageEnabled: jest.Mock }).setStorageEnabled).toHaveBeenCalledWith(true);
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

    // Create logger with browser options
    const options = {
      storeInBrowser: true,
      maxStoredLogs: 500,
      storageName: 'custom-logs',
      useLocalStorage: false,
    };

    new Logger(options);

    // Check if constructor was called with expected options
    expect(MockBrowserLogger).toHaveBeenCalledWith(expect.objectContaining(options));
  });
});

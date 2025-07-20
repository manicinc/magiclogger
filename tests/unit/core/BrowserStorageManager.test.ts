import { BrowserStorageManager } from '../../../src/core/BrowserStorageManager';

// Use the global localStorage mock from jest.setup.ts
const mockLocalStorage = global.localStorage as jest.Mocked<typeof localStorage> & {
  _getStore: () => Record<string, string>;
  _resetStore: () => void;
};

describe('BrowserStorageManager', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  it('initializes with default options', () => {
    const storage = new BrowserStorageManager();
    expect(storage).toBeDefined();
    // Constructor calls loadLogs() which calls getItem
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('magiclogger-logs');
  });

  it('initializes with custom options', () => {
    const storage = new BrowserStorageManager({
      storageName: 'custom-logs',
      maxEntries: 500,
      useLocalStorage: true,
    });
    expect(storage).toBeDefined();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('custom-logs');
  });

  it('adds logs to storage', () => {
    const storage = new BrowserStorageManager();
    
    // Clear previous calls from constructor
    mockLocalStorage.setItem.mockClear();
    
    storage.addLog('Test log entry');

    // Verify entry was stored in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Get logs and verify content
    const logs = storage.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]).toContain('Test log entry');
  });

  it('clears all logs', () => {
    const storage = new BrowserStorageManager();

    // Add some logs
    storage.addLog('Entry 1');
    storage.addLog('Entry 2');

    // Verify they were added
    expect(storage.getLogs().length).toBe(2);

    // Clear previous calls
    mockLocalStorage.removeItem.mockClear();

    // Clear logs
    storage.clearLogs();

    // Verify logs were cleared
    expect(storage.getLogs().length).toBe(0);
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
  });

  it('handles storage unavailability gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = mockLocalStorage.getItem;
    const originalSetItem = mockLocalStorage.setItem;
    
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    // Creating storage manager should not throw
    const storage = new BrowserStorageManager();
    expect(storage).toBeDefined();

    // Adding logs should not throw
    expect(() => {
      storage.addLog('Test entry');
    }).not.toThrow();

    // Getting logs should return empty array when storage fails
    expect(storage.getLogs()).toEqual([]);

    // Clearing logs should not throw
    expect(() => {
      storage.clearLogs();
    }).not.toThrow();

    // Restore original implementations
    mockLocalStorage.getItem.mockImplementation(originalGetItem);
    mockLocalStorage.setItem.mockImplementation(originalSetItem);
  });

  it('has a download method that handles the browser environment', () => {
    // Mock the global objects needed for the test
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockCreateElement = jest.fn().mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    });
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = jest.fn();

    // Mock document and URL objects
    Object.defineProperty(global, 'document', {
      value: {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      },
      configurable: true,
    });

    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      configurable: true,
    });

    const storage = new BrowserStorageManager();

    // Add some test logs
    storage.addLog('Test log 1');
    storage.addLog('Test log 2');

    // Call download method
    storage.downloadLogs('test.txt');

    // Verify mocks were called
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
  });
});

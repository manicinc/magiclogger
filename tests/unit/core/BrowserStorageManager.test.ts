import { BrowserStorageManager } from '../../../src/core/BrowserStorageManager';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => ({ ...store }),
    _resetStore: () => {
      store = {};
    },
  };
})();

// Setup global mocks
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

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
    // Default storage name should be used for localStorage
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
    storage.addLog('Test log entry');

    // Verify entry was stored in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Get logs and verify content
    const logs = storage.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]).toContain('Test log entry');
  });

  it('adds multiple logs and respects max entries', () => {
    const storage = new BrowserStorageManager({ maxEntries: 3 });

    // Add 5 entries (exceeding the max of 3)
    storage.addLog('Entry 1');
    storage.addLog('Entry 2');
    storage.addLog('Entry 3');
    storage.addLog('Entry 4');
    storage.addLog('Entry 5');

    // Should only keep the most recent 3
    const logs = storage.getLogs();
    expect(logs.length).toBe(3);
    expect(logs[0]).toContain('Entry 3');
    expect(logs[1]).toContain('Entry 4');
    expect(logs[2]).toContain('Entry 5');
  });

  it('clears all logs', () => {
    const storage = new BrowserStorageManager();

    // Add some logs
    storage.addLog('Entry 1');
    storage.addLog('Entry 2');

    // Verify they were added
    expect(storage.getLogs().length).toBe(2);

    // Clear logs
    storage.clearLogs();

    // Verify logs were cleared
    expect(storage.getLogs().length).toBe(0);
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
  });

  it('handles storage unavailability gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = mockLocalStorage.getItem;
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    // Creating storage manager should not throw
    const storage = new BrowserStorageManager();
    expect(storage).toBeDefined();

    // Adding logs should not throw
    expect(() => {
      storage.addLog('Test entry');
    }).not.toThrow();

    // Getting logs should return empty array
    expect(storage.getLogs()).toEqual([]);

    // Clearing logs should not throw
    expect(() => {
      storage.clearLogs();
    }).not.toThrow();

    // Restore original implementation
    mockLocalStorage.getItem.mockImplementation(originalGetItem);
  });

  it('updates max entries and trims logs', () => {
    const storage = new BrowserStorageManager({ maxEntries: 5 });

    // Add 5 entries
    for (let i = 1; i <= 5; i++) {
      storage.addLog(`Entry ${i}`);
    }

    // Verify we have 5 entries
    expect(storage.getLogs().length).toBe(5);

    // Reduce max entries to 3
    storage.setMaxEntries(3);

    // Should trim to the most recent 3 entries
    const logs = storage.getLogs();
    expect(logs.length).toBe(3);
    expect(logs[0]).toContain('Entry 3');
    expect(logs[1]).toContain('Entry 4');
    expect(logs[2]).toContain('Entry 5');
  });

  it('ensures timestamps are added to entries', () => {
    const storage = new BrowserStorageManager();

    // Add a log without timestamp
    storage.addLog('Plain entry');

    // Add a log with timestamp already
    storage.addLog('[2023-01-01T12:00:00.000Z] Timestamped entry');

    const logs = storage.getLogs();

    // First entry should have timestamp added
    expect(logs[0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Plain entry$/);

    // Second entry should keep its original timestamp
    expect(logs[1]).toBe('[2023-01-01T12:00:00.000Z] Timestamped entry');
  });

  // This test is a placeholder since actual download can't be tested easily in Jest
  it('has a download method that handles the browser environment', () => {
    const storage = new BrowserStorageManager();

    // Add some test logs
    storage.addLog('Test log 1');
    storage.addLog('Test log 2');

    // Mock document methods needed for download
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockCreateElement = jest.fn().mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    });
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = jest.fn();

    // Save original methods
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    // Replace with mocks
    document.createElement = mockCreateElement;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;

    // Call download method
    storage.downloadLogs('test.txt');

    // Verify mocks were called
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();

    // Restore original methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});

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

    // Adding logs should not throw and should not accumulate in-memory
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
    // Use spies to avoid overriding jsdom globals
    const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      return node; // return the node to satisfy the DOM signature
    });
    const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((child: Node) => {
      return child; // return the child to satisfy the DOM signature
    });

    // Spy on anchor click so we can assert it was triggered
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    // Safely define and stub URL methods even if jsdom doesn't provide them
    type URLWithObjectURL = typeof URL & {
      createObjectURL?: (obj: unknown) => string;
      revokeObjectURL?: (url: string) => void;
    };

    const URLCtor = globalThis.URL as URLWithObjectURL;
    const hadCreate = typeof URLCtor.createObjectURL === 'function';
    const hadRevoke = typeof URLCtor.revokeObjectURL === 'function';
    const originalCreate = URLCtor.createObjectURL;
    const originalRevoke = URLCtor.revokeObjectURL;

    const createObjectURLMock = jest
      .fn<
        ReturnType<NonNullable<URLWithObjectURL['createObjectURL']>>,
        Parameters<NonNullable<URLWithObjectURL['createObjectURL']>>
      >()
      .mockReturnValue('blob:url');
    const revokeObjectURLMock = jest
      .fn<
        ReturnType<NonNullable<URLWithObjectURL['revokeObjectURL']>>,
        Parameters<NonNullable<URLWithObjectURL['revokeObjectURL']>>
      >()
      .mockImplementation(() => undefined);

    Object.defineProperty(URLCtor, 'createObjectURL', {
      value: createObjectURLMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URLCtor, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      configurable: true,
      writable: true,
    });

    try {
      const storage = new BrowserStorageManager();

      // Add some test logs
      storage.addLog('Test log 1');
      storage.addLog('Test log 2');

      // Call download method
      storage.downloadLogs('test.txt');

      // Verify mocks were called
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    } finally {
      appendSpy.mockRestore();
      removeSpy.mockRestore();
      clickSpy.mockRestore();
      if (hadCreate) {
        Object.defineProperty(URLCtor, 'createObjectURL', {
          value: originalCreate,
          configurable: true,
          writable: true,
        });
      } else {
        Reflect.deleteProperty(URLCtor, 'createObjectURL');
      }
      if (hadRevoke) {
        Object.defineProperty(URLCtor, 'revokeObjectURL', {
          value: originalRevoke,
          configurable: true,
          writable: true,
        });
      } else {
        Reflect.deleteProperty(URLCtor, 'revokeObjectURL');
      }
    }
  });
});

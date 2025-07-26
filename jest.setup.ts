// ===== CRITICAL: Timer polyfills must be first =====
// Ensure Node.js timer globals are available immediately
if (typeof global.setInterval === 'undefined') {
  global.setInterval = setInterval;
}
if (typeof global.clearInterval === 'undefined') {
  global.clearInterval = clearInterval;
}
if (typeof global.setTimeout === 'undefined') {
  global.setTimeout = setTimeout;
}
if (typeof global.clearTimeout === 'undefined') {
  global.clearTimeout = clearTimeout;
}

// Import required modules
const fs = jest.requireActual('fs');
const path = jest.requireActual('path');

// Define test constants
export const LOG_DIR = path.resolve(process.cwd(), 'test_logs');

// Set test environment
process.env.NODE_ENV = 'test';

// ----------------------
// Mock File System Setup
// ----------------------
const mockFileSystem = new Map();

// Setup default test files
mockFileSystem.set(path.join(LOG_DIR, 'old-log.log'), {
  content: 'test content',
  isDir: false,
  mtimeMs: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days old
});

mockFileSystem.set(path.join(LOG_DIR, 'new-log.log'), {
  content: 'test content',
  isDir: false,
  mtimeMs: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days old
});

// ----------------------
// Function Mock Setup
// ----------------------
// Define these functions first, before they're used
const fsMockImplementation = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  rmdirSync: jest.fn(),
  rmSync: jest.fn(),
  statSync: jest.fn(),
  lstatSync: jest.fn(),
};

// ----------------------
// Mock Implementations
// ----------------------
fsMockImplementation.existsSync.mockImplementation(p => {
  if (p === LOG_DIR) return true;
  if (mockFileSystem.has(p)) return true;
  // Default fallback
  return fs.existsSync(p);
});

fsMockImplementation.readFileSync.mockImplementation((filepath, _encoding) => {
  // Check if we have this file in our mock system
  if (mockFileSystem.has(filepath)) {
    const fileInfo = mockFileSystem.get(filepath);
    return fileInfo.content;
  }
  
  // Return default content for test files
  if (filepath.toString().includes('themes.json')) {
    return '{}'; // Return empty object by default
  }
  
  // Default fallback
  return '{}';
});

fsMockImplementation.readdirSync.mockImplementation(dirPath => {
  if (dirPath === LOG_DIR) {
    // Return array of filenames for test directory
    return Array.from(mockFileSystem.keys())
      .filter(p => p.startsWith(dirPath))
      .map(p => path.basename(p));
  }

  // Return mock Dirent objects for testing
  return [
    {
      name: 'file.log',
      isDirectory: () => false,
      isFile: () => true,
    },
    {
      name: 'subdir',
      isDirectory: () => true,
      isFile: () => false,
    },
  ];
});

fsMockImplementation.statSync.mockImplementation(filepath => {
  // If we have this file in our mock system, return its stats
  if (mockFileSystem.has(filepath)) {
    const fileInfo = mockFileSystem.get(filepath);
    const mockStats = {
      isDirectory: () => fileInfo.isDir,
      isFile: () => !fileInfo.isDir,
      mtimeMs: fileInfo.mtimeMs,
      isSymbolicLink: () => false,
      isSocket: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
    };
    return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
  }

  // Handle specific test paths
  if (filepath.includes('old-log.log')) {
    const mockStats = {
      isDirectory: () => false,
      isFile: () => true,
      mtimeMs: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days old
      isSymbolicLink: () => false,
      isSocket: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
    };
    return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
  }

  if (filepath.includes('new-log.log')) {
    const mockStats = {
      isDirectory: () => false,
      isFile: () => true,
      mtimeMs: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days old
      isSymbolicLink: () => false,
      isSocket: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
    };
    return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
  }

  if (filepath.includes('good-file.log')) {
    const mockStats = {
      isDirectory: () => false,
      isFile: () => true,
      mtimeMs: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days old
      isSymbolicLink: () => false,
      isSocket: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
    };
    return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
  }

  // Default mock stats
  const mockStats = {
    isDirectory: () => filepath.includes('subdir'),
    isFile: () => !filepath.includes('subdir'),
    mtimeMs: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days old by default
    isSymbolicLink: () => false,
    isSocket: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
  };
  return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
});

fsMockImplementation.lstatSync.mockImplementation(filepath => {
  // Same implementation as statSync for simplicity
  const isDir = filepath.toString().includes('subdir');
  const mockStats = {
    isDirectory: () => isDir,
    isFile: () => !isDir,
    mtimeMs: Date.now() - 5 * 24 * 60 * 60 * 1000,
    isSymbolicLink: () => false,
    isSocket: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
  };
  return Object.setPrototypeOf(mockStats, fs.Stats.prototype);
});

// ----------------------
// ACTUAL FS MOCK (Jest)
// ----------------------
jest.mock('fs', () => {
  return {
    ...fs,
    ...fsMockImplementation,
  };
});

// Now import standard modules that we'll use throughout the file
import * as fsModule from 'fs';
import * as pathModule from 'path';

// ----------------------
// Import other classes after the fs mock is set up
// ----------------------
import { Logger } from './src/Logger';
import { NodeLogger } from './src/core/NodeLogger';
import { FileManager } from './src/core/FileManager';
import { Formatter } from './src/core/Formatter';
import { BrowserLogger } from './src/core/BrowserLogger';
import { BrowserStorageManager } from './src/core/BrowserStorageManager';

export const fsMocks = fsModule as jest.Mocked<typeof fsModule> & {
  resetAll: () => void;
};

// Dynamically attach resetAll helper
fsMocks.resetAll = () => {
  Object.values(fsMockImplementation).forEach(mockFn => {
    if (typeof mockFn.mockClear === 'function') {
      mockFn.mockClear();
    }
  });
};

// ----------------------
// Terminal utils mock
// ----------------------
export const terminalUtils = {
  // Always return true for style support in tests
  isStyleSupported: jest.fn().mockImplementation(() => true),
  getFallbackStyle: jest.fn().mockImplementation(style => style),
  getTerminalSupport: jest.fn().mockReturnValue({
    basic: true,
    colors: true,
    brightColors: true,
    rgb: true,
    styles: {
      bold: true,
      dim: true,
      italic: true,
      underline: true,
      blink: true,
      reverse: true,
      hidden: true,
      strikethrough: true,
    },
    features: {
      hyperlinks: true,
      cursorMovement: true,
      windowTitle: true,
      mouseTracking: true,
    },
  }),
};

// ----------------------
// Browser Storage Mock
// ----------------------
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

// Mock localStorage for browser tests
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

// ----------------------
// LoggerInternal interface
// ----------------------
export interface LoggerInternal {
  colorize: (message: string, colors: string[]) => string;
  applyPreset: (message: string, preset: string) => string;
  preserveLinks: (message: string) => string;
  normalizePath: (pathStr: string) => string;
  cleanupOldLogs: () => void;
  appendToFile: (content: string) => void;
  initLogFile: () => void;
  useColors: boolean;
  verbose: boolean;
  writeToDisk: boolean;
  logFile: string | null;
  logDir: string;
  logRetentionDays: number;
}

// Helper to create stats mocks with specific attributes
export function createStatsMock(
  options: {
    isDirectory?: boolean;
    mtimeMs?: number;
    isFile?: boolean;
  } = {}
): fsModule.Stats {
  const now = Date.now();
  const mockStats = {
    isDirectory: () => options.isDirectory ?? false,
    isFile: () => options.isFile ?? !options.isDirectory,
    mtimeMs: options.mtimeMs ?? now,
    // Add other common Stats methods that might be used
    isSymbolicLink: () => false,
    isSocket: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
  };
  return Object.setPrototypeOf(mockStats, fsModule.Stats.prototype);
}

/**
 * Creates a spy for a class constructor
 * @param targetClass The class to spy on
 * @returns A jest mock function that tracks constructor calls
 */
export function spyOnConstructor<T extends new (...args: unknown[]) => unknown>(
  targetClass: T
): jest.Mock<InstanceType<T>, ConstructorParameters<T>> {
  const originalConstructor = targetClass;

  // Create a mock constructor function
  const mockConstructor = jest.fn((...args: ConstructorParameters<T>) => {
    // Create a new instance using the original constructor
    return new originalConstructor(...args);
  }) as jest.Mock<InstanceType<T>, ConstructorParameters<T>>;

  // Replace the original constructor with our mock
  Object.defineProperty(targetClass, 'constructor', {
    value: mockConstructor,
    writable: true,
    configurable: true,
  });

  return mockConstructor;
}

/**
 * Helper to mock class without touching constructor
 * @param targetClass The class to create a mocked version of
 * @returns A jest mocked version of the class
 */
export function createMockedClass<T>(
  targetClass: new (...args: unknown[]) => T
): jest.MockedClass<typeof targetClass> {
  return targetClass as jest.MockedClass<typeof targetClass>;
}

// ----------------------
// Helper Functions
// ----------------------

/**
 * Get a properly mocked Logger instance for testing
 */
export function getMockedLogger(options = {}): Logger & LoggerInternal {
  const loggerInstance = new Logger(options);
  return loggerInstance as Logger & LoggerInternal;
}

/**
 * Get a properly mocked NodeLogger instance for testing
 */
export function getMockedNodeLogger(options = {}): NodeLogger & LoggerInternal {
  const logger = new NodeLogger(options) as NodeLogger & LoggerInternal;
  // Ensure we have a FileManager for tests using any to bypass private property access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(logger as any).fileManager) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (logger as any).fileManager = new FileManager(LOG_DIR, 30);
  }
  return logger;
}

/**
 * Get a properly mocked FileManager instance for testing
 */
export function getMockedFileManager(dir = LOG_DIR, retentionDays = 30): FileManager {
  return new FileManager(dir, retentionDays);
}

/**
 * Get a properly mocked Formatter instance for testing
 */
export function getMockedFormatter(useColors = true): Formatter {
  return new Formatter(useColors);
}

/**
 * Get a properly mocked BrowserLogger instance for testing
 */
export function getMockedBrowserLogger(options = {}): BrowserLogger {
  return new BrowserLogger(options);
}

/**
 * Get a properly mocked BrowserStorageManager for testing
 */
export function getMockedBrowserStorage(options = {}): BrowserStorageManager {
  return new BrowserStorageManager(options);
}

// ----------------------
// Cleanup logs directory
// ----------------------
function cleanupRealLogs() {
  const logsDir = pathModule.resolve(process.cwd(), 'logs');

  try {
    // Check if the logs directory exists
    if (!fsModule.existsSync(logsDir)) {
      return;
    }

    // Read directory contents
    const items = fsModule.readdirSync(logsDir) as (string | fsModule.Dirent)[];

    // Process each item in the directory
    for (const item of items) {
      let fileName: string;

      // Handle both string and Dirent objects
      if (typeof item === 'string') {
        fileName = item;
      } else if (
        item &&
        typeof item === 'object' &&
        'name' in item &&
        typeof item.name === 'string'
      ) {
        fileName = item.name;
      } else {
        // Skip invalid items
        continue;
      }

      // Only delete log files that match our pattern
      if (fileName.startsWith('run-') && fileName.endsWith('.log')) {
        try {
          fsModule.unlinkSync(pathModule.join(logsDir, fileName));
        } catch {
          // Ignore errors deleting individual files
        }
      }
    }
  } catch (err) {
    // Log but ignore overall cleanup errors
    console.error(`Error cleaning up logs directory: ${err}`);
  }
}

// Mock process.stdout.write for progress bar tests
export function mockProcessStdout() {
  const originalWrite = process.stdout.write;
  const mockWrite = jest.fn().mockImplementation(() => true);
  process.stdout.write = mockWrite;

  return {
    mockWrite,
    restore: () => {
      process.stdout.write = originalWrite;
    },
  };
}

// ----------------------
// Jest lifecycle hooks
// ----------------------
beforeAll(() => {
  // Clean up any real log files from previous test runs
  cleanupRealLogs();

  // Ensure our test directory exists (for tests that expect it)
  if (!fsModule.existsSync(LOG_DIR)) {
    try {
      fsModule.mkdirSync(LOG_DIR, { recursive: true });
    } catch (err) {
      console.warn(`Could not create test log directory: ${err}`);
    }
  }

  // Mock console methods to avoid cluttering test output
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'info').mockImplementation(() => undefined);
  jest.spyOn(console, 'debug').mockImplementation(() => undefined);
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  fsMocks.resetAll();

  // Reset localStorage
  mockLocalStorage.clear();

  // Reset the terminal utils
  terminalUtils.isStyleSupported.mockImplementation(() => true);
  terminalUtils.getFallbackStyle.mockImplementation(style => style);
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
  fsMocks.resetAll();
});

afterAll(() => {
  // Restore original implementations
  jest.restoreAllMocks();

  // Clean up any files created during tests
  cleanupRealLogs();

  // Clean up test directory
  try {
    if (fsModule.existsSync(LOG_DIR)) {
      fsModule.rmSync(LOG_DIR, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`Could not remove test log directory: ${err}`);
  }
});

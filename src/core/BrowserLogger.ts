// File: src/core/BrowserLogger.ts

import { LoggerBase } from './LoggerBase';
import { Formatter } from './Formatter';
import { BrowserStorageManager } from './BrowserStorageManager';
import { Printer } from './Printer';
import type { LoggerOptions, ColorName, StylePreset } from '../types';

/**
 * Browser-specific logger implementation.
 * 
 * Features:
 * - Console styling with CSS
 * - LocalStorage and IndexedDB support
 * - Log persistence and retrieval
 * - Download logs functionality
 * - Browser performance monitoring
 * - DevTools integration
 * 
 * @class BrowserLogger
 * @extends {LoggerBase}
 * 
 * @example
 * ```typescript
 * const logger = new BrowserLogger({
 *   storeInBrowser: true,
 *   storageName: 'app-logs',
 *   maxStoredLogs: 5000,
 *   useLocalStorage: false // Use IndexedDB
 * });
 * 
 * // Logs are automatically persisted
 * logger.info('User logged in', { userId: 123 });
 * 
 * // Download logs later
 * logger.downloadLogs('debug-logs.txt');
 * ```
 */
export class BrowserLogger extends LoggerBase {
  /**
   * Formatter instance for browser output.
   * @private
   */
  private formatter: Formatter;

  /**
   * Whether to store logs in browser storage.
   * @private
   */
  private storeInBrowser: boolean;

  /**
   * Browser storage key name.
   * @private
   */
  private storageName: string;

  /**
   * Maximum number of logs to store.
   * @private
   */
  private maxStoredLogs: number;

  /**
   * Whether to use localStorage (vs IndexedDB).
   * @private
   */
  private useLocalStorage: boolean;

  /**
   * IndexedDB database instance.
   * @private
   */
  private db?: IDBDatabase;

  /**
   * Queue for logs pending storage.
   * @private
   */
  private storageQueue: string[] = [];

  /**
   * Browser storage manager instance.
   * @private
   */
  private storageManager?: BrowserStorageManager;

  /**
   * Whether storage is being processed.
   * @private
   */
  private processingStorage = false;

  /**
   * Performance observer for monitoring.
   * @private
   */
  private performanceObserver?: PerformanceObserver;

  /**
   * Console styles cache.
   * @private
   */
  private styleCache: Map<string, string> = new Map();

  /**
   * Creates a new BrowserLogger instance.
   * 
   * @param {LoggerOptions} options - Logger configuration
   */
  constructor(options: LoggerOptions = {}) {
    super(options);
    
    this.formatter = new Formatter(this.useColors);
    this.storeInBrowser = options.storeInBrowser || false;
    this.storageName = options.storageName || 'logger_logs';
    this.maxStoredLogs = options.maxStoredLogs || 1000;
    this.useLocalStorage = options.useLocalStorage !== false;

    // Initialize storage if enabled
    if (this.storeInBrowser) {
      this.initializeStorage().catch(err => {
        console.error('[BrowserLogger] Failed to initialize storage:', err);
        this.storeInBrowser = false;
      });
    }

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Set up unload handler to save logs
    this.setupUnloadHandler();
  }

  /**
   * Initialize browser storage (localStorage or IndexedDB).
   * 
   * @returns {Promise<void>} Resolves when storage is ready
   * @private
   */
  private async initializeStorage(): Promise<void> {
    // Create storage manager if not already exists
    if (!this.storageManager) {
      this.storageManager = new BrowserStorageManager({
        storageName: this.storageName,
        maxEntries: this.maxStoredLogs,
        useLocalStorage: this.useLocalStorage
      });
    }

    if (this.useLocalStorage) {
      // Test localStorage availability
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
      } catch {
        console.warn('[BrowserLogger] localStorage not available');
        this.storeInBrowser = false;
      }
    } else {
      // Initialize IndexedDB
      await this.initializeIndexedDB();
    }
  }

  /**
   * Initialize IndexedDB for log storage.
   * 
   * @returns {Promise<void>} Resolves when IndexedDB is ready
   * @private
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.storageName, 1);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        // If logs were queued before DB became available, process them now
        if (this.storeInBrowser && this.storageQueue.length > 0) {
          // Fire and forget; any errors already logged in processStorageQueue
          this.processStorageQueue();
        }
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          
          // Create indexes
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
        }
  // After upgrade, if queue has data it will be processed on success handler
      };
    });
  }

  /**
   * Set up performance monitoring.
   * 
   * @private
   */
  private setupPerformanceMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('logger-')) {
            this.emit('performance', {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('[BrowserLogger] Performance monitoring not available');
    }
  }

  /**
   * Set up unload handler to save pending logs.
   * 
   * @private
   */
  private setupUnloadHandler(): void {
    const saveLogsBeforeUnload = () => {
      if (this.storageQueue.length > 0) {
        // Use sendBeacon if available for reliable delivery
        if (navigator.sendBeacon && this.storageQueue.length > 0) {
          const blob = new Blob(
            [JSON.stringify(this.storageQueue)],
            { type: 'application/json' }
          );
          navigator.sendBeacon('/logs', blob);
        }

        // Also try to save to storage synchronously
        this.flushStorageSync();
      }
    };

    window.addEventListener('beforeunload', saveLogsBeforeUnload);
    window.addEventListener('pagehide', saveLogsBeforeUnload);
  }

  /**
   * Log an info message.
   * 
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Additional metadata
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this.print('INFO', message, 'info', meta);
  }

  /**
   * Log a warning message.
   * 
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Additional metadata
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this.print('WARN', message, 'warning', meta);
  }

  /**
   * Log an error message.
   * 
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Additional metadata
   */
  public error(message: string, meta?: Record<string, unknown>): void {
    this.print('ERROR', message, 'error', meta);
  }

  /**
   * Log a debug message.
   * 
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Additional metadata
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.verbose) return;
    this.print('DEBUG', message, 'debug', meta);
  }

  /**
   * Log a success message.
   * 
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Additional metadata
   */
  public success(message: string, meta?: Record<string, unknown>): void {
    this.print('SUCCESS', message, 'success', meta);
  }

  /**
   * Log with custom styling.
   * 
   * @param {string} message - Message to log
   * @param {ColorName[]} _colors - CSS styles to apply (unused in browser implementation)
   * @param {string} prefix - Prefix label
   */
  public custom(message: string, _colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    const formattedMessage = `[${prefix}] ${message}`;
    console.log(formattedMessage);
    
    if (this.storeInBrowser) {
      this.storeLog(formattedMessage);
    }
  }

  /**
   * Log with preset style.
   * 
   * @param {string} message - Message to log
   * @param {StylePreset} preset - Style preset
   */
  public styled(message: string, preset: StylePreset): void {
    const prefix = preset.toUpperCase();
    const formattedMessage = `[${prefix}] ${message}`;
    
    console.log(formattedMessage);

    if (this.storeInBrowser) {
      this.storeLog(formattedMessage);
    }
  }

  /**
   * Display a header.
   * 
   * @param {string} title - Header title
   * @param {ColorName[]} colors - Header colors
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    if (this.useColors) {
      const styles = this.getConsoleStyles(colors);
      const padding = 60 - title.length;
      const paddedTitle = ` ${title} ${' '.repeat(Math.max(0, padding))}`;
      
      console.log(`%c${paddedTitle}`, styles.header);
    } else {
      const line = '='.repeat(60);
      console.log(`${line}\n${title}\n${line}`);
    }

    if (this.storeInBrowser) {
      this.storeLog(`=== ${title} ===`);
    }
  }

  /**
   * Display a table.
   * 
   * @param {Record<string, unknown>[]} data - Table data
   * @param {ColorName[]} headerColor - Header color
   */
  public table(data: Record<string, unknown>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
    if (!data || data.length === 0) {
      console.log('No data to display');
      return;
    }

    // Use Printer for table display
    Printer.printTable(data, headerColor);
    
    if (this.storeInBrowser) {
      this.storeLog(`[TABLE] ${JSON.stringify(data)}`);
    }
  }

  /**
   * Display a progress bar.
   * 
   * @param {number} progress - Progress percentage (0-100)
   * @param {number} length - Bar length
   * @param {string} completeChar - Complete character
   * @param {string} incompleteChar - Incomplete character
   */
  public progressBar(
    progress: number, 
    length = 20, 
    completeChar = '█', 
    incompleteChar = '░'
  ): void {
    const safe = Math.max(0, Math.min(100, progress));
    const filled = Math.round((safe / 100) * length);
    const complete = completeChar.repeat(filled);
    const incomplete = incompleteChar.repeat(length - filled);
    
    const bar = complete + incomplete;
    const percent = `${safe.toFixed(1)}%`;
    
    Printer.print(`${bar} ${percent}`);

    if (this.storeInBrowser && safe >= 100) {
      this.storeLog(`[PROGRESS] 100% complete`);
    }
  }

  /**
   * Display a clickable link.
   * 
   * @param {string} url - URL to link
   * @param {string} [description] - Link description
   */
  public link(url: string, description?: string): void {
    const label = description || url;
    const formattedMessage = `[${label}]: ${url}`;
    
    Printer.print(formattedMessage);

    if (this.storeInBrowser) {
      this.storeLog(`[LINK] ${label}: ${url}`);
    }
  }

  /**
   * Create a color function.
   * 
   * @param {...ColorName[]} _colors - Colors to apply (unused in browser implementation)
   * @returns {Function} Color function
   */
  public color(..._colors: ColorName[]): (text: string) => string {
    return (text: string) => {
      if (!this.useColors) return text;
      
      // Return formatted string for console
      return text; // Browser console handles styling differently
    };
  }

  /**
   * Apply colors to parts of a message.
   * 
   * @param {string} message - Message with parts to color
   * @param {Record<string, ColorName[]>} _colorMap - Color mappings (unused in browser)
   * @returns {string} Colored message
   */
  public colorParts(message: string, _colorMap: Record<string, ColorName[]>): string {
    // Browser console doesn't support inline styling well
    // Return the message as-is
    return message;
  }

  /**
   * Display a separator line.
   * 
   * @param {string} char - Separator character
   * @param {number} length - Line length
   */
  public separator(char = '-', length = 50): void {
    const line = char.repeat(length);
    console.log(line);
    
    if (this.storeInBrowser) {
      this.storeLog(line);
    }
  }

  /**
   * Internal print method.
   * 
   * @param {string} level - Log level
   * @param {string} message - Message
   * @param {StylePreset} preset - Style preset
   * @param {Record<string, unknown>} [meta] - Additional metadata
   * @private
   */
  private print(level: string, message: string, preset: StylePreset, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] [${level}] ${message}`;

    if (this.useColors) {
      const colors = this.getPresetColors(preset);
      const styles = this.getConsoleStyles(colors);
      
      if (meta && Object.keys(meta).length > 0) {
        console.log(
          `%c[${level}]%c ${message}`,
          styles.prefix,
          styles.message,
          meta
        );
      } else {
        console.log(
          `%c[${level}]%c ${message}`,
          styles.prefix,
          styles.message
        );
      }
    } else {
      if (meta && Object.keys(meta).length > 0) {
        console.log(`[${level}] ${message}`, meta);
      } else {
        console.log(`[${level}] ${message}`);
      }
    }

    if (this.storeInBrowser) {
      const logEntry = meta 
        ? `${formattedMsg} ${JSON.stringify(meta)}`
        : formattedMsg;
      this.storeLog(logEntry);
    }

    // Measure performance (avoid any casts by runtime type narrowing)
    if (this.performanceObserver && typeof performance !== 'undefined') {
      interface PerfLike {
        mark?: (name: string) => void;
        measure?: (name: string, start?: string, end?: string) => void;
      }
      const p: PerfLike = performance as unknown as PerfLike;
      if (typeof p.mark === 'function' && typeof p.measure === 'function') {
        try {
          p.mark(`logger-${level}-end`);
          p.measure(
            `logger-${level}`,
            `logger-${level}-start`,
            `logger-${level}-end`
          );
        } catch {
          /* noop */
        }
      }
    }
  }

  /**
   * Get console styles for colors.
   * 
   * @param {ColorName[]} colors - Colors to convert
   * @returns {object} Style strings
   * @private
   */
  private getConsoleStyles(colors: ColorName[]): {
    prefix: string;
    message: string;
    header: string;
  } {
    const cacheKey = colors.join(',');
    const cached = this.styleCache.get(cacheKey);
    
    if (cached) {
      return {
        prefix: cached,
        message: 'color: inherit',
        header: cached + '; padding: 4px 8px',
      };
    }

    const styles: string[] = [];

    for (const color of colors) {
      switch (color) {
        // Text colors
        case 'black': styles.push('color: #000000'); break;
        case 'red': styles.push('color: #cc0000'); break;
        case 'green': styles.push('color: #4e9a06'); break;
        case 'yellow': styles.push('color: #c4a000'); break;
        case 'blue': styles.push('color: #3465a4'); break;
        case 'magenta': styles.push('color: #75507b'); break;
        case 'cyan': styles.push('color: #06989a'); break;
        case 'white': styles.push('color: #d3d7cf'); break;
        case 'gray':
        case 'grey': styles.push('color: #555753'); break;
        
        // Bright colors
        case 'brightRed': styles.push('color: #ef2929'); break;
        case 'brightGreen': styles.push('color: #8ae234'); break;
        case 'brightYellow': styles.push('color: #fce94f'); break;
        case 'brightBlue': styles.push('color: #729fcf'); break;
        case 'brightMagenta': styles.push('color: #ad7fa8'); break;
        case 'brightCyan': styles.push('color: #34e2e2'); break;
        case 'brightWhite': styles.push('color: #eeeeec'); break;
        
        // Background colors
        case 'bgBlack': styles.push('background-color: #000000'); break;
        case 'bgRed': styles.push('background-color: #cc0000'); break;
        case 'bgGreen': styles.push('background-color: #4e9a06'); break;
        case 'bgYellow': styles.push('background-color: #c4a000'); break;
        case 'bgBlue': styles.push('background-color: #3465a4'); break;
        case 'bgMagenta': styles.push('background-color: #75507b'); break;
        case 'bgCyan': styles.push('background-color: #06989a'); break;
        case 'bgWhite': styles.push('background-color: #d3d7cf'); break;
        case 'bgGray':
        case 'bgGrey': styles.push('background-color: #555753'); break;
        
        // Bright background colors
        case 'bgBrightRed': styles.push('background-color: #ef2929'); break;
        case 'bgBrightGreen': styles.push('background-color: #8ae234'); break;
        case 'bgBrightYellow': styles.push('background-color: #fce94f'); break;
        case 'bgBrightBlue': styles.push('background-color: #729fcf'); break;
        case 'bgBrightMagenta': styles.push('background-color: #ad7fa8'); break;
        case 'bgBrightCyan': styles.push('background-color: #34e2e2'); break;
        case 'bgBrightWhite': styles.push('background-color: #eeeeec'); break;
        
        // Styles
        case 'bold': styles.push('font-weight: bold'); break;
        case 'dim': styles.push('opacity: 0.7'); break;
        case 'italic': styles.push('font-style: italic'); break;
        case 'underline': styles.push('text-decoration: underline'); break;
        case 'inverse': styles.push('filter: invert(1)'); break;
        case 'hidden': styles.push('visibility: hidden'); break;
        case 'strikethrough': styles.push('text-decoration: line-through'); break;
        case 'blink': styles.push('animation: blink 1s linear infinite'); break;
      }
    }

    // Add some defaults for better visibility
    if (styles.length === 0) {
      styles.push('color: inherit');
    }
    
    styles.push('font-family: monospace');
    styles.push('line-height: 1.4');

    const styleString = styles.join('; ');
    this.styleCache.set(cacheKey, styleString);

    return {
      prefix: styleString,
      message: 'color: inherit; font-family: monospace',
      header: styleString + '; padding: 4px 8px; border-radius: 4px',
    };
  }

  /**
   * Store a log entry in browser storage.
   * 
   * @param {string} log - Log entry to store
   * @private
   */
  private storeLog(log: string): void {
    if (!this.storeInBrowser) return;

    // Use storage manager if available
    if (this.storageManager) {
      this.storageManager.addLog(log);
    } else {
      // Fallback to queue-based storage
      this.storageQueue.push(log);

      if (!this.processingStorage) {
        this.processStorageQueue();
      }
    }
  }

  /**
   * Process the storage queue asynchronously.
   * 
   * @private
   */
  private async processStorageQueue(): Promise<void> {
    if (this.processingStorage || this.storageQueue.length === 0) return;

    this.processingStorage = true;

    try {
      if (this.useLocalStorage) {
        await this.storeInLocalStorage();
      } else {
        await this.storeInIndexedDB();
      }
    } catch (error) {
      console.error('[BrowserLogger] Storage error:', error);
    } finally {
      this.processingStorage = false;

      // Process more if needed
      if (this.storageQueue.length > 0) {
        setTimeout(() => this.processStorageQueue(), 10);
      }
    }
  }

  /**
   * Store logs in localStorage.
   * 
   * @returns {Promise<void>} Resolves when stored
   * @private
   */
  private async storeInLocalStorage(): Promise<void> {
    const batch = this.storageQueue.splice(0, 100);
    
    try {
      const existing = localStorage.getItem(this.storageName);
      const logs = existing ? JSON.parse(existing) : [];
      
      logs.push(...batch);

      // Trim if exceeds max
      if (logs.length > this.maxStoredLogs) {
        logs.splice(0, logs.length - this.maxStoredLogs);
      }

      localStorage.setItem(this.storageName, JSON.stringify(logs));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear old logs and retry
        localStorage.removeItem(this.storageName);
        localStorage.setItem(this.storageName, JSON.stringify(batch));
      } else {
        throw error;
      }
    }
  }

  /**
   * Store logs in IndexedDB.
   * 
   * @returns {Promise<void>} Resolves when stored
   * @private
   */
  private async storeInIndexedDB(): Promise<void> {
    if (!this.db) return;

    const batch = this.storageQueue.splice(0, 100);
    const transaction = this.db.transaction(['logs'], 'readwrite');
    const store = transaction.objectStore('logs');

    // Add all logs
    for (const log of batch) {
      store.add({
        timestamp: new Date().toISOString(),
        log,
        level: this.extractLevelFromLog(log),
      });
    }

    // Clean up old logs if needed
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      const count = countRequest.result;
      if (count > this.maxStoredLogs) {
        // Delete oldest logs
        const deleteCount = count - this.maxStoredLogs;
        const getAllRequest = store.getAllKeys(undefined, deleteCount);
        
        getAllRequest.onsuccess = () => {
          const keysToDelete = getAllRequest.result;
          keysToDelete.forEach(key => store.delete(key));
        };
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Extract log level from log string.
   * 
   * @param {string} log - Log string
   * @returns {string} Log level
   * @private
   */
  private extractLevelFromLog(log: string): string {
    const match = log.match(/\[(\w+)\]/);
    return match ? match[1] : 'LOG';
  }

  /**
   * Flush storage synchronously (for beforeunload).
   * 
   * @private
   */
  private flushStorageSync(): void {
    if (!this.useLocalStorage || this.storageQueue.length === 0) return;

    try {
      const existing = localStorage.getItem(this.storageName);
      const logs = existing ? JSON.parse(existing) : [];
      logs.push(...this.storageQueue);
      
      if (logs.length > this.maxStoredLogs) {
        logs.splice(0, logs.length - this.maxStoredLogs);
      }

      localStorage.setItem(this.storageName, JSON.stringify(logs));
      this.storageQueue = [];
    } catch {
      // Ignore errors during unload
    }
  }

  /**
   * Get all stored logs.
   * 
   * @returns {string[] | null} Array of logs or null
   */
  public getLogs(): string[] | null {
    if (!this.storeInBrowser) return null;

    // Use storage manager if available
    if (this.storageManager) {
      return this.storageManager.getLogs();
    }

    // Fallback to localStorage
    try {
      if (this.useLocalStorage) {
        const stored = localStorage.getItem(this.storageName);
        return stored ? JSON.parse(stored) : [];
      } else {
        // For IndexedDB, return null as it's async
        console.warn('[BrowserLogger] Use getLogsAsync() for IndexedDB logs');
        return null;
      }
    } catch (error) {
      console.error('[BrowserLogger] Failed to get logs:', error);
      return null;
    }
  }

  /**
   * Get all stored logs asynchronously (for IndexedDB).
   * 
   * @returns {Promise<string[]>} Array of logs
   */
  public async getLogsAsync(): Promise<string[]> {
    if (!this.storeInBrowser) return [];

    if (this.useLocalStorage) {
      return this.getLogs() || [];
    }

    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      // Some lightweight IndexedDB mocks used in tests may not implement getAll().
      type LogEntry = { log?: string } | string;
      // getAll path (fast path)
      const storeAny = store as IDBObjectStore & {
        getAll?: () => IDBRequest<LogEntry[]>;
        openCursor?: () => IDBRequest<IDBCursorWithValue | null>;
        getAllKeys?: () => IDBRequest<IDBValidKey[]>;
        get?: (key: IDBValidKey) => IDBRequest<LogEntry>;
      };

      if (typeof storeAny.getAll === 'function') {
        const request = storeAny.getAll();
        request.onsuccess = () => {
          try {
            const raw = (request.result || []) as LogEntry[];
            const results = raw.map(entry =>
              typeof entry === 'object' && entry !== null && 'log' in entry
                ? (entry as { log?: string }).log ?? ''
                : String(entry)
            );
            resolve(results);
          } catch {
            resolve([]);
          }
        };
        request.onerror = () => reject(request.error);
        return; // Done
      }

      // Cursor fallback
      if (typeof storeAny.openCursor === 'function') {
        const results: string[] = [];
        const cursorReq = storeAny.openCursor();
        cursorReq.onsuccess = (event: Event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            const val = cursor.value as LogEntry;
            if (typeof val === 'object' && val && 'log' in val) {
              results.push(val.log ?? '');
            } else {
              results.push(String(val));
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorReq.onerror = () => resolve(results);
        return; // Done
      }

      // Last resort: attempt keys iteration helpers present in our test mock
      if (typeof storeAny.getAllKeys === 'function' && typeof storeAny.get === 'function') {
        const results: string[] = [];
        const keysReq = storeAny.getAllKeys();
        keysReq.onsuccess = () => {
          const keys = (keysReq.result || []) as IDBValidKey[];
          let remaining = keys.length;
          if (!remaining) { resolve([]); return; }
          for (const k of keys) {
            const getReq = storeAny.get(k);
            getReq.onsuccess = () => {
              const val = getReq.result as LogEntry | undefined;
              if (val !== undefined) {
                if (typeof val === 'object' && val && 'log' in val) {
                  results.push(val.log ?? '');
                } else {
                  results.push(String(val));
                }
              }
              remaining--; if (!remaining) resolve(results);
            };
            getReq.onerror = () => { remaining--; if (!remaining) resolve(results); };
          }
        };
        keysReq.onerror = () => resolve([]);
        return; // Done
      }

      // If none of the strategies are available, return empty.
      resolve([]);
    });
  }

  /**
   * Clear all stored logs.
   */
  public clearLogs(): void {
    if (!this.storeInBrowser) return;

    // Use storage manager if available
    if (this.storageManager) {
      this.storageManager.clearLogs();
    } else {
      // Fallback to direct storage access
      try {
        if (this.useLocalStorage) {
          localStorage.removeItem(this.storageName);
        } else if (this.db) {
          const transaction = this.db.transaction(['logs'], 'readwrite');
          const store = transaction.objectStore('logs');
          store.clear();
        }
      } catch (error) {
        console.error('[BrowserLogger] Failed to clear logs:', error);
      }
    }
    
    this.emit('logsCleared');
  }

  /**
   * Download logs as a text file.
   * 
   * @param {string} filename - Filename for download
   */
  public async downloadLogs(filename = 'logs.txt'): Promise<void> {
    try {
      // Ensure any queued logs are flushed before exporting
      if (this.storageQueue.length > 0 && !this.processingStorage) {
        try {
          await this.processStorageQueue();
        } catch {
          // ignore flush errors, will attempt to read whatever is stored
        }
      }
      const logs = await this.getLogsAsync();
      
      if (!logs || logs.length === 0) {
        console.warn('[BrowserLogger] No logs to download');
        return;
      }

      const content = logs.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
      }
      
      this.emit('logsDownloaded', { filename, count: logs.length });
    } catch (error) {
      console.error('[BrowserLogger] Failed to download logs:', error);
    }
  }

  /**
   * Enable or disable browser storage.
   * 
   * @param {boolean} enabled - Whether to enable storage
   */
  public setStorageEnabled(enabled: boolean): void {
    this.storeInBrowser = enabled;

    if (enabled && !this.storageManager) {
      this.initializeStorage().catch(err => {
        console.error('[BrowserLogger] Failed to enable storage:', err);
        this.storeInBrowser = false;
      });
    }
  }

  /**
   * Search logs with a query.
   * 
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<string[]>} Matching logs
   */
  public async searchLogs(
    query: string,
    options: {
      caseSensitive?: boolean;
      regex?: boolean;
      limit?: number;
    } = {}
  ): Promise<string[]> {
    const logs = await this.getLogsAsync();
    if (!logs) return [];

    let pattern: RegExp;
    
    if (options.regex) {
      try {
        pattern = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
      } catch {
        console.error('[BrowserLogger] Invalid regex pattern');
        return [];
      }
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pattern = new RegExp(escaped, options.caseSensitive ? 'g' : 'gi');
    }

    const results = logs.filter(log => pattern.test(log));

    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Export logs in various formats.
   * 
   * @param {string} format - Export format
   * @returns {Promise<string>} Exported content
   */
  public async exportLogs(format: 'json' | 'csv' | 'txt' = 'txt'): Promise<string> {
    const logs = await this.getLogsAsync();
    if (!logs) return '';

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);

      case 'csv': {
        // Parse logs and convert to CSV
        const parsed = logs.map(log => {
          const match = log.match(/^\[([\d-T:.Z]+)\] \[(\w+)\] (.+)$/);
          if (match) {
            return {
              timestamp: match[1],
              level: match[2],
              message: match[3].replace(/"/g, '""'),
            };
          }
          return {
            timestamp: new Date().toISOString(),
            level: 'LOG',
            message: log.replace(/"/g, '""'),
          };
        });

        const csv = 'timestamp,level,message\n' +
          parsed.map(row => `"${row.timestamp}","${row.level}","${row.message}"`).join('\n');
        
        return csv;
      }

      case 'txt':
      default:
        return logs.join('\n');
    }
  }

  // ============================================================
  // Node.js Compatibility Methods (No-ops in browser)
  // ============================================================

  /**
   * Get log file path (browser compatibility - returns null).
   * @returns {null} Always null in browser environment
   */
  public getLogFilePath(): null {
    return null;
  }

  /**
   * Get log directory (browser compatibility).
   * @returns {string} Returns 'browser' to indicate browser environment
   */
  public getLogDirectory(): string {
    return 'browser';
  }

  /**
   * Get log retention days (browser compatibility).
   * @returns {number} Returns 0 as browser logs don't use file retention
   */
  public getLogRetentionDays(): number {
    return 0;
  }

  /**
   * Set file logging (browser compatibility - maps to storage enabled).
   * @param {boolean} enabled - Whether to enable storage
   */
  public setFileLogging(enabled: boolean): void {
    this.storeInBrowser = enabled;
    if (enabled && !this.storageManager) {
      this.initializeStorage();
    }
  }

  // Node.js compatibility methods (no-op in browser)
  
  /**
   * Set log directory (Node.js compatibility - no-op in browser).
   * @param {string} _directory - Directory path (ignored in browser)
   */
  public setLogDirectory(_directory: string): void {
    // No-op in browser environment
  }

  /**
   * Set log retention days (Node.js compatibility - no-op in browser).
   * @param {number} _days - Number of days to retain logs (ignored in browser)
   */
  public setLogRetentionDays(_days: number): void {
    // No-op in browser environment
  }

  /**
   * Clean up resources.
   */
  public destroy(): void {
    // Stop performance observer
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }

    // Flush remaining logs
    this.flushStorageSync();

    // Close IndexedDB
    if (this.db) {
      this.db.close();
      this.db = undefined;
    }

    // Clear caches
    this.styleCache.clear();
    this.storageQueue = [];

    // Remove event listeners
    this.removeAllListeners();

    // Call parent destroy
    super.destroy();
  }
}
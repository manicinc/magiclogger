/**
 * Provides storage capabilities for the BrowserLogger.
 * Uses localStorage or IndexedDB depending on configuration and availability.
 */
export class BrowserStorageManager {
  private storageName: string;
  private maxEntries: number;
  private entries: string[] = [];
  private useLocalStorage: boolean;
  private initialized = false;

  /**
   * Creates a new BrowserStorageManager
   * @param options Configuration options
   */
  constructor(
    options: {
      storageName?: string;
      maxEntries?: number;
      useLocalStorage?: boolean;
    } = {}
  ) {
    this.storageName = options.storageName || 'magiclogger-logs';
    this.maxEntries = options.maxEntries || 1000; // Default to 1000 entries
    this.useLocalStorage = options.useLocalStorage !== false;

    // Load existing logs if available
    this.loadLogs();
  }

  /**
   * Loads logs from storage
   */
  private loadLogs(): void {
    if (!this.isStorageAvailable()) return;

    try {
      if (this.useLocalStorage) {
        const storedLogs = localStorage.getItem(this.storageName);
        if (storedLogs) {
          this.entries = JSON.parse(storedLogs);
        }
      } else {
        // IndexedDB implementation would go here
        // For now, we'll focus on localStorage
        this.loadFromIndexedDB().catch(() => {
          // If IndexedDB fails, try localStorage as fallback
          if (typeof localStorage !== 'undefined') {
            const storedLogs = localStorage.getItem(this.storageName);
            if (storedLogs) {
              this.entries = JSON.parse(storedLogs);
            }
          }
        });
      }
      this.initialized = true;
    } catch (err) {
      console.error('[BrowserStorageManager] Failed to load logs from storage:', err);
      this.entries = [];
      this.initialized = true;
    }
  }

  /**
   * Placeholder for IndexedDB loading - will be implemented in future version
   */
  private async loadFromIndexedDB(): Promise<void> {
    // This is a placeholder for future IndexedDB implementation
    throw new Error('IndexedDB not yet implemented');
  }

  /**
   * Save logs to storage
   */
  private saveLogs(): void {
    if (!this.isStorageAvailable()) return;

    try {
      if (this.useLocalStorage) {
        localStorage.setItem(this.storageName, JSON.stringify(this.entries));
      } else {
        // IndexedDB implementation would go here
        // For now, we'll try localStorage as fallback
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.storageName, JSON.stringify(this.entries));
        }
      }
    } catch (err) {
      console.error('[BrowserStorageManager] Failed to save logs to storage:', err);
    }
  }

  /**
   * Check if storage is available
   */
  private isStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    if (this.useLocalStorage) {
      try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      // IndexedDB availability check would go here
      // For now, we'll just check if localStorage is available as fallback
      return typeof localStorage !== 'undefined';
    }
  }

  /**
   * Adds a log entry to storage
   * @param entry The log entry to add
   */
  public addLog(entry: string): void {
    // Ensure we've loaded logs first
    if (!this.initialized) {
      this.loadLogs();
    }

    // If storage isn't available, do nothing (avoid accumulating logs when storage fails)
    if (!this.isStorageAvailable()) {
      return;
    }

    // Add timestamp to entry if it doesn't already have one
    const timestamp = new Date().toISOString();
    const formattedEntry = entry.startsWith('[') ? entry : `[${timestamp}] ${entry}`;

    // Add to in-memory array
    this.entries.push(formattedEntry);

    // Trim if exceeding max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Save to storage
    this.saveLogs();
  }

  /**
   * Get all stored logs
   * @returns Array of log entries
   */
  public getLogs(): string[] {
    // Ensure we've loaded logs first
    if (!this.initialized) {
      this.loadLogs();
    }
    return [...this.entries];
  }

  /**
   * Clear all stored logs
   */
  public clearLogs(): void {
    this.entries = [];

    if (this.isStorageAvailable()) {
      if (this.useLocalStorage) {
        localStorage.removeItem(this.storageName);
      } else {
        // IndexedDB clearing would go here
        // For now, try localStorage as fallback
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.storageName);
        }
      }
    }
    this.initialized = true;
  }

  /**
   * Generate a downloadable log file
   * @param filename The file name for the download
   */
  public downloadLogs(filename = 'logs.txt'): void {
    if (typeof window === 'undefined') return;

    // Ensure we've loaded logs first
    if (!this.initialized) {
      this.loadLogs();
    }

    const logText = this.entries.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    const cleanup = () => {
      try {
        document.body.removeChild(a);
      } catch {
        // ignore
      }
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    };

    // Cleanup: synchronous in tests to avoid timing issues, async otherwise
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      cleanup();
    } else {
      setTimeout(cleanup, 0);
    }
  }

  /**
   * Get the retention period (always 0 for browser logger)
   */
  public getRetentionDays(): number {
    return 0; // Not applicable for browser storage
  }

  /**
   * Set maximum number of entries to keep
   * @param maxEntries Number of entries to keep
   */
  public setMaxEntries(maxEntries: number): void {
    this.maxEntries = Math.max(1, maxEntries);

    // Trim if current entries exceed new maximum
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
      this.saveLogs();
    }
  }
}

import { isBrowserEnvironment } from '../utils/environment';
import { BROWSER_POLYFILLS } from '../utils/browser-polyfills';

// Type for modules that can be either real Node.js modules or browser polyfills
type FileSystemModule = typeof import('fs') | typeof BROWSER_POLYFILLS.fs;
type PathModule = typeof import('path') | typeof BROWSER_POLYFILLS.path;

// Dynamic import for Node.js modules
const importNodeModules = async () => {
  if (!isBrowserEnvironment()) {
    // Use dynamic import for Node.js modules
    const fsModule = await import('fs');
    const pathModule = await import('path');
    return {
      fs: fsModule.default || fsModule,
      path: pathModule.default || pathModule,
    };
  }
  return BROWSER_POLYFILLS;
};

// Synchronous import for Node.js modules
const importNodeModulesSync = (): { fs: FileSystemModule; path: PathModule } => {
  if (!isBrowserEnvironment()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    return { fs, path };
  }
  return BROWSER_POLYFILLS;
};

/**
 * Provides file-based logging utilities for NodeLogger.
 * Handles log file initialization, writing, rotation, and cleanup.
 */
export class FileManager {
  private logFile: string | null = null;
  private fs!: FileSystemModule;
  private path!: PathModule;

  /**
   * Constructs a new FileManager.
   * @param logDir Directory where log files will be stored.
   * @param logRetentionDays Number of days to retain log files.
   */
  constructor(private logDir: string, private logRetentionDays: number = 30) {
    // Initialize modules synchronously in constructor
    this.initializeModulesSync();
  }

  /**
   * Initialize Node.js or browser modules synchronously
   */
  private initializeModulesSync() {
    const modules = importNodeModulesSync();
    this.fs = modules.fs as FileSystemModule;
    this.path = modules.path as PathModule;

    // Resolve log directory after modules are loaded
    this.logDir = this.resolveLogDir(this.logDir);
  }

  /**
   * Initialize Node.js or browser modules
   */
  private async initializeModules() {
    const modules = await importNodeModules();
    this.fs = modules.fs as FileSystemModule;
    this.path = modules.path as PathModule;

    // Resolve log directory after modules are loaded
    this.logDir = this.resolveLogDir(this.logDir);
  }

  /**
   * Resolves a directory path to an absolute path.
   * @param dirPath The directory path (relative or absolute).
   * @returns The absolute directory path.
   */
  public resolveLogDir(dirPath: string): string {
    // Modules are now guaranteed to be initialized
    return this.path.isAbsolute(dirPath) ? dirPath : this.path.resolve(process.cwd(), dirPath);
  }

  /**
   * Initializes a new log file with a timestamp.
   * @returns The path to the new log file.
   */
  public async initLogFile(): Promise<string | null> {
    try {
      if (!this.fs.existsSync(this.logDir)) {
        this.fs.mkdirSync(this.logDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.logFile = this.path.join(this.logDir, `log-${timestamp}.log`);
      this.fs.writeFileSync(this.logFile, `--- Log Start: ${new Date().toLocaleString()} ---\n`);
      return this.logFile;
    } catch (err) {
      console.error('[FileManager] Failed to initialize log file:', err);
      this.logFile = null;
      return null;
    }
  }

  /**
   * Appends a line to the current log file.
   * @param content The content to append.
   * @returns {boolean} True if successful, false if error occurred
   */
  public appendToFile(content: string): boolean {
    if (!this.logFile) return false;
    try {
      this.fs.appendFileSync(this.logFile, `${content}\n`);
      return true;
    } catch (err) {
      console.error('[FileManager] Failed to append to log file:', err);
      this.logFile = null;
      return false;
    }
  }

  /**
   * Cleans up log files older than the retention period.
   */
  public async cleanupOldLogs(): Promise<void> {
    try {
      if (!this.fs.existsSync(this.logDir)) return;
      const now = Date.now();
      const cutoff = now - this.logRetentionDays * 24 * 60 * 60 * 1000;
      const files = this.fs.readdirSync(this.logDir);

      files.forEach((fileName: string) => {
        const filePath: string = this.path.join(this.logDir, fileName);
        try {
          const stats = this.fs.statSync(filePath);
          if (!stats.isDirectory() && stats.mtimeMs < cutoff) {
            this.fs.unlinkSync(filePath);
          }
        } catch (err: unknown) {
          console.error(`[FileManager] Error processing file "${fileName}":`, err);
        }
      });
    } catch (err) {
      console.error('[FileManager] Failed to clean up old logs:', err);
    }
  }

  /**
   * Returns the path of the current log file.
   * @returns The log file path or null if none.
   */
  public getLogFile(): string | null {
    return this.logFile;
  }

  /**
   * Gets the current log directory path.
   * @returns The log directory path.
   */
  public getLogDir(): string {
    return this.logDir;
  }

  /**
   * Sets the log directory path.
   * If the directory doesn't exist, it will be created on next write.
   *
   * @param dir The new log directory path
   */
  public setLogDir(dir: string): void {
    this.logDir = this.resolveLogDir(dir || 'logs');
  }

  /**
   * Gets the current log retention period in days.
   * @returns Days to retain logs.
   */
  public getLogRetentionDays(): number {
    return this.logRetentionDays;
  }

  /**
   * Sets the log retention period in days.
   * Logs older than this number of days will be deleted during cleanup.
   *
   * @param days Number of days to retain logs (minimum 1)
   */
  public setLogRetentionDays(days: number): void {
    this.logRetentionDays = Math.max(1, days || 1);
  }

  /**
   * Recursively cleans up a directory and its contents.
   * @param dirPath Directory path to clean
   */
  public async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      if (!this.fs.existsSync(dirPath)) return;

      const entries = this.fs.readdirSync(dirPath);
      for (const entry of entries) {
        const fullPath = this.path.join(dirPath, entry);
        const stats = this.fs.statSync(fullPath);

        if (stats.isDirectory()) {
          await this.cleanupDirectory(fullPath); // Recursively clean subdirectories
          this.fs.rmdirSync(fullPath);
        } else {
          this.fs.unlinkSync(fullPath);
        }
      }
    } catch (err) {
      console.error(`[FileManager] Error cleaning directory ${dirPath}:`, err);
    }
  }
}

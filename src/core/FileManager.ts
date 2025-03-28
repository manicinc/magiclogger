import { isBrowserEnvironment } from '../utils/environment';
import { BROWSER_POLYFILLS } from '../utils/browser-polyfills';
import { Stats } from 'fs';

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

/**
 * Provides file-based logging utilities for NodeLogger.
 */
export class FileManager {
  private logFile: string | null = null;
  private fs: any;
  private path: any;

  /**
   * Constructs a new FileManager.
   * @param logDir Directory where log files will be stored.
   * @param logRetentionDays Number of days to retain log files.
   */
  constructor(private logDir: string, private logRetentionDays: number = 30) {
    this.initializeModules();
  }

  /**
   * Initialize Node.js or browser modules
   */
  private async initializeModules() {
    const modules = await importNodeModules();
    this.fs = modules.fs;
    this.path = modules.path;

    // Resolve log directory after modules are loaded
    this.logDir = this.resolveLogDir(this.logDir);
  }

  /**
   * Resolves a directory path to an absolute path.
   * @param dirPath The directory path (relative or absolute).
   * @returns The absolute directory path.
   */
  public resolveLogDir(dirPath: string): string {
    // Ensure modules are loaded before using path methods
    if (!this.path) {
      throw new Error('File modules not initialized');
    }
    return this.path.isAbsolute(dirPath) ? dirPath : this.path.resolve(process.cwd(), dirPath);
  }

  /**
   * Initializes a new log file with a timestamp.
   * @returns The path to the new log file.
   */
  public async initLogFile(): Promise<string | null> {
    // Ensure modules are loaded
    if (!this.fs || !this.path) {
      await this.initializeModules();
    }

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
   */
  public appendToFile(content: string): void {
    if (!this.logFile) return;
    try {
      this.fs.appendFileSync(this.logFile, `${content}\n`);
    } catch (err) {
      console.error('[FileManager] Failed to append to log file:', err);
    }
  }

  /**
   * Cleans up log files older than the retention period.
   */
  public async cleanupOldLogs(): Promise<void> {
    // Ensure modules are loaded
    if (!this.fs || !this.path) {
      await this.initializeModules();
    }

    try {
      if (!this.fs.existsSync(this.logDir)) return;
      const now = Date.now();
      const cutoff = now - this.logRetentionDays * 24 * 60 * 60 * 1000;
      const files = this.fs.readdirSync(this.logDir);

      files.forEach((fileName: string) => {
        const filePath: string = this.path.join(this.logDir, fileName);
        try {
          const stats: Stats = this.fs.statSync(filePath);
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
}

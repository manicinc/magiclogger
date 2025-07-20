// File: src/transports/base/implementations/FileTransport.ts

import { BatchingTransport } from '../BatchingTransport';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import type { 
  FileTransportOptions, 
  LogEntry,
  BatchingTransportOptions 
} from '../../../types/transport';

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const gzip = promisify(zlib.gzip);

/**
 * File transport for writing logs to disk.
 * 
 * Features:
 * - Automatic file rotation (size-based, time-based)
 * - Compression of rotated files
 * - Directory-based logging with timestamps
 * - Retention policies for old logs
 * - Atomic writes for data integrity
 * - Efficient batching for high throughput
 * 
 * @class FileTransport
 * @extends {BatchingTransport}
 * 
 * @example
 * ```typescript
 * const fileTransport = new FileTransport({
 *   name: 'file',
 *   filepath: './logs',
 *   rotation: 'daily',
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxFiles: 5,
 *   compress: true
 * });
 * ```
 */
export class FileTransport extends BatchingTransport {
  /**
   * Target file or directory path.
   * @private
   */
  private readonly filepath: string;

  /**
   * Whether filepath is a directory.
   * @private
   */
  private readonly isDirectory: boolean;

  /**
   * Maximum file size before rotation.
   * @private
   */
  private readonly maxFileSize: number;

  /**
   * Maximum number of backup files.
   * @private
   */
  private readonly maxFiles: number;

  /**
   * Whether to compress rotated files.
   * @private
   */
  private readonly compressRotated: boolean;

  /**
   * Rotation strategy.
   * @private
   */
  private readonly rotation: 'size' | 'daily' | 'hourly' | 'none';

  /**
   * Whether to append to existing file.
   * @private
   */
  private readonly append: boolean;

  /**
   * File encoding.
   * @private
   */
  private readonly encoding: BufferEncoding;

  /**
   * Whether to include timestamp in log lines.
   * @private
   */
  private readonly includeTimestamp: boolean;

  /**
   * Whether to create directory if missing.
   * @private
   */
  private readonly createDir: boolean;

  /**
   * Log retention in days.
   * @private
   */
  private readonly retentionDays: number;

  /**
   * Line ending character.
   * @private
   */
  private readonly eol: string;

  /**
   * Current log file path.
   * @private
   */
  private currentFile?: string;

  /**
   * Current file size.
   * @private
   */
  private currentSize = 0;

  /**
   * Current date for daily rotation.
   * @private
   */
  private currentDate?: string;

  /**
   * Write stream for better performance.
   * @private
   */
  private writeStream?: fs.WriteStream;

  /**
   * Lock for file operations.
   * @private
   */
  private writeLock = false;

  /**
   * Queue for pending writes during rotation.
   * @private
   */
  private writeQueue: string[] = [];

  /**
   * Creates a new FileTransport instance.
   * 
   * @param {FileTransportOptions} options - Transport configuration
   */
  constructor(options: FileTransportOptions) {
    // Merge file-specific options with batching defaults
    const batchingOptions: BatchingTransportOptions = {
      ...options,
      maxBatchSize: options.maxBatchSize || 100,
      maxBatchTime: options.maxBatchTime || 1000,
      compress: false, // We handle compression differently
    };

    super(batchingOptions);

    this.filepath = options.filepath;
    this.isDirectory = options.isDirectory ?? true;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.compressRotated = options.compress ?? false;
    this.rotation = options.rotation || 'size';
    this.append = options.append ?? true;
    this.encoding = options.encoding || 'utf8';
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.createDir = options.createDir ?? true;
    this.retentionDays = options.retentionDays || 30;
    this.eol = options.eol || '\n';
  }

  /**
   * Initialize the file transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Ensure directory exists
    if (this.createDir) {
      const dir = this.isDirectory ? this.filepath : path.dirname(this.filepath);
      await this.ensureDirectory(dir);
    }

    // Initialize current file
    await this.initializeFile();

    // Start retention cleanup
    this.startRetentionCleanup();
  }

  /**
   * Initialize the current log file.
   * 
   * @returns {Promise<void>} Resolves when file is ready
   * @private
   */
  private async initializeFile(): Promise<void> {
    if (this.isDirectory) {
      // Generate filename based on current timestamp
      this.currentFile = this.generateFilename();
    } else {
      this.currentFile = this.filepath;
    }

    // Check if file exists and get size
    try {
      const stats = await stat(this.currentFile);
      this.currentSize = stats.size;
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.currentSize = 0;
    }

    // Set current date for daily rotation
    if (this.rotation === 'daily') {
      this.currentDate = new Date().toISOString().split('T')[0];
    }

    // Create write stream
    this.createWriteStream();
  }

  /**
   * Create a write stream for the current file.
   * 
   * @private
   */
  private createWriteStream(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }

    this.writeStream = fs.createWriteStream(this.currentFile!, {
      flags: this.append ? 'a' : 'w',
      encoding: this.encoding,
      highWaterMark: 64 * 1024, // 64KB buffer
    });

    this.writeStream.on('error', (error) => {
      this.handleError(error);
    });
  }

  /**
   * Send a batch of logs to the file.
   * 
   * @param {LogEntry[]} data - Formatted log entries
   * @returns {Promise<void>} Resolves when written
   * @protected
   */
  protected async sendBatch(data: LogEntry[]): Promise<void> {
    // Format entries
    const lines = data.map(entry => this.formatFileEntry(entry));
    const content = lines.join(this.eol) + this.eol;
    const buffer = Buffer.from(content, this.encoding);

    // Check rotation before writing
    await this.checkRotation(buffer.length);

    // Write to file
    await this.writeToFile(content);

    // Update size
    this.currentSize += buffer.length;
  }

  /**
   * Format a log entry for file output.
   * 
   * @param {LogEntry} entry - The log entry
   * @returns {string} Formatted line
   * @private
   */
  private formatFileEntry(entry: LogEntry): string {
    switch (this.format) {
      case 'json':
        return JSON.stringify(entry);

      case 'plain': {
        let line = '';

        if (this.includeTimestamp) {
          line += entry.timestamp + ' ';
        }

        line += `[${entry.level.toUpperCase()}]`;

        if (entry.loggerId) {
          line += ` [${entry.loggerId}]`;
        }

        if (entry.tags && entry.tags.length > 0) {
          line += ` [${entry.tags.join(',')}]`;
        }

        line += ' ' + (entry.plainMessage || entry.message);

        if (entry.error) {
          line += ` Error: ${entry.error.message}`;
          if (entry.error.stack) {
            line += this.eol + entry.error.stack;
          }
        }

        if (entry.context && Object.keys(entry.context).length > 0) {
          line += ` Context: ${JSON.stringify(entry.context)}`;
        }

        return line;
      }

      case 'custom':
        if (this.formatter) {
          const result = this.formatter(entry);
          return typeof result === 'string' ? result : result.toString(this.encoding);
        }
        return JSON.stringify(entry);

      default:
        return JSON.stringify(entry);
    }
  }

  /**
   * Write content to the current file.
   * 
   * @param {string} content - Content to write
   * @returns {Promise<void>} Resolves when written
   * @private
   */
  private async writeToFile(content: string): Promise<void> {
    // Handle write lock during rotation
    if (this.writeLock) {
      this.writeQueue.push(content);
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.writeStream || this.writeStream.destroyed) {
        this.createWriteStream();
      }

      this.writeStream!.write(content, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Check if file rotation is needed.
   * 
   * @param {number} incomingSize - Size of incoming data
   * @returns {Promise<void>} Resolves when check is complete
   * @private
   */
  private async checkRotation(incomingSize: number): Promise<void> {
    let shouldRotate = false;

    switch (this.rotation) {
      case 'size':
        shouldRotate = this.currentSize + incomingSize > this.maxFileSize;
        break;

      case 'daily': {
        const today = new Date().toISOString().split('T')[0];
        shouldRotate = today !== this.currentDate;
        break;
      }

      case 'hourly': {
        const currentHour = new Date().getHours();
        const fileHour = this.currentFile ? 
          parseInt(path.basename(this.currentFile).split('-')[3]?.split('.')[0] || '0') : -1;
        shouldRotate = currentHour !== fileHour;
        break;
      }

      case 'none':
      default:
        shouldRotate = false;
    }

    if (shouldRotate) {
      await this.rotateFile();
    }
  }

  /**
   * Rotate the current log file.
   * 
   * @returns {Promise<void>} Resolves when rotation is complete
   * @private
   */
  private async rotateFile(): Promise<void> {
    this.writeLock = true;

    try {
      // Close current stream
      if (this.writeStream) {
        await new Promise<void>((resolve) => {
          this.writeStream!.end(() => resolve());
        });
      }

      // Handle rotation based on mode
      if (this.isDirectory) {
        // Just create a new file
        this.currentFile = this.generateFilename();
        this.currentSize = 0;
        
        if (this.rotation === 'daily') {
          this.currentDate = new Date().toISOString().split('T')[0];
        }
      } else {
        // Rename current file and create new one
        await this.rotateSingleFile();
      }

      // Create new stream
      this.createWriteStream();

      // Process queued writes
      const queue = this.writeQueue;
      this.writeQueue = [];
      for (const content of queue) {
        await this.writeToFile(content);
      }

      // Clean up old files
      await this.cleanupOldFiles();

    } finally {
      this.writeLock = false;
    }
  }

  /**
   * Rotate a single file (not directory mode).
   * 
   * @returns {Promise<void>} Resolves when rotated
   * @private
   */
  private async rotateSingleFile(): Promise<void> {
    const dir = path.dirname(this.filepath);
    const basename = path.basename(this.filepath);
    const ext = path.extname(basename);
    const name = path.basename(basename, ext);

    // Find next available backup number
    let backupNum = 1;
    while (backupNum <= this.maxFiles) {
      const backupPath = path.join(dir, `${name}.${backupNum}${ext}`);
      try {
        await stat(backupPath);
        backupNum++;
      } catch {
        break;
      }
    }

    // Rename current file
    if (backupNum <= this.maxFiles) {
      const backupPath = path.join(dir, `${name}.${backupNum}${ext}`);
      await rename(this.currentFile!, backupPath);

      // Compress if enabled
      if (this.compressRotated) {
        await this.compressFile(backupPath);
      }
    }

    this.currentSize = 0;
  }

  /**
   * Generate a filename for directory mode.
   * 
   * @returns {string} Generated filename
   * @private
   */
  private generateFilename(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    let filename = `${year}-${month}-${day}`;

    if (this.rotation === 'hourly') {
      filename += `-${hour}`;
    } else if (this.rotation === 'size' || this.rotation === 'none') {
      filename += `-${hour}${minute}${second}`;
    }

    filename += '.log';

    return path.join(this.filepath, filename);
  }

  /**
   * Compress a file using gzip.
   * 
   * @param {string} filepath - File to compress
   * @returns {Promise<void>} Resolves when compressed
   * @private
   */
  private async compressFile(filepath: string): Promise<void> {
    try {
      const data = await fs.promises.readFile(filepath);
      const compressed = await gzip(data);
      await writeFile(`${filepath}.gz`, compressed);
      await unlink(filepath);
    } catch (error) {
      console.error(`Failed to compress ${filepath}:`, error);
    }
  }

  /**
   * Clean up old log files based on retention policy.
   * 
   * @returns {Promise<void>} Resolves when cleanup is complete
   * @private
   */
  private async cleanupOldFiles(): Promise<void> {
    if (!this.isDirectory) {
      // For single file mode, remove old backups
      const dir = path.dirname(this.filepath);
      const basename = path.basename(this.filepath);
      const ext = path.extname(basename);
      const name = path.basename(basename, ext);

      const files = await readdir(dir);
      const backupFiles = files
        .filter(f => f.startsWith(`${name}.`) && (f.endsWith(ext) || f.endsWith(`${ext}.gz`)))
        .sort()
        .reverse();

      // Remove files beyond maxFiles
      for (let i = this.maxFiles; i < backupFiles.length; i++) {
        try {
          await unlink(path.join(dir, backupFiles[i]));
        } catch (error) {
          console.error(`Failed to remove ${backupFiles[i]}:`, error);
        }
      }
    } else {
      // For directory mode, remove old files based on retention
      const cutoff = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
      const files = await readdir(this.filepath);

      for (const file of files) {
        if (!file.endsWith('.log') && !file.endsWith('.log.gz')) continue;

        try {
          const filepath = path.join(this.filepath, file);
          const stats = await stat(filepath);

          if (stats.mtime.getTime() < cutoff) {
            await unlink(filepath);
          }
        } catch (error) {
          console.error(`Failed to check/remove ${file}:`, error);
        }
      }
    }
  }

  /**
   * Start periodic retention cleanup.
   * 
   * @private
   */
  private startRetentionCleanup(): void {
    // Run cleanup every hour
    const interval = setInterval(() => {
      this.cleanupOldFiles().catch(error => {
        console.error('Retention cleanup failed:', error);
      });
    }, 60 * 60 * 1000);

    // Don't prevent process exit
    if (interval.unref) {
      interval.unref();
    }
  }

  /**
   * Ensure a directory exists.
   * 
   * @param {string} dir - Directory path
   * @returns {Promise<void>} Resolves when directory exists
   * @private
   */
  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Close the transport and clean up resources.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve());
      });
    }
  }

  /**
   * Get the current log file path.
   * 
   * @returns {string | undefined} Current file path
   */
  public getCurrentFile(): string | undefined {
    return this.currentFile;
  }

  /**
   * Get file transport statistics.
   * 
   * @returns {object} Extended statistics
   */
  public getStats(): any {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        currentFile: this.currentFile,
        currentSize: this.currentSize,
        writeQueueLength: this.writeQueue.length,
      },
    };
  }
}
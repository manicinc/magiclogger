// File: src/transports/implementations/FileTransport.ts

import { Transport } from '../base/Transport';
import { FileManager } from '../../core/FileManager';
import type { TransportOptions, LogEntry } from '../../types/transport';
import * as path from 'path';

/**
 * File transport specific options.
 * Extends base transport options with file-specific configuration.
 */
export interface FileTransportOptions extends TransportOptions {
  /**
   * Path to the log file or directory.
   * If a directory is provided, files will be created with timestamps.
   */
  filepath: string;

  /**
   * Whether filepath points to a directory (true) or specific file (false).
   * @default true
   */
  isDirectory?: boolean;

  /**
   * Maximum file size in bytes before rotation.
   * @default 10485760 (10MB)
   */
  maxFileSize?: number;

  /**
   * Maximum number of backup files to keep.
   * @default 5
   */
  maxFiles?: number;

  /**
   * Whether to compress rotated files.
   * @default false
   */
  compress?: boolean;

  /**
   * File rotation strategy.
   * @default 'size'
   */
  rotation?: 'size' | 'daily' | 'hourly' | 'none';

  /**
   * Whether to append to existing file or create new.
   * @default true
   */
  append?: boolean;

  /**
   * File encoding.
   * @default 'utf8'
   */
  encoding?: BufferEncoding;

  /**
   * Whether to include timestamp in each log line.
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Whether to create directory if it doesn't exist.
   * @default true
   */
  createDir?: boolean;

  /**
   * Log retention in days (for directory mode).
   * @default 30
   */
  retentionDays?: number;

  /**
   * Line ending character.
   * @default '\n'
   */
  eol?: string;
}

/**
 * Transport that writes logs to files with rotation and management.
 * 
 * The FileTransport provides comprehensive file-based logging with:
 * - Automatic file rotation by size or time
 * - Log retention and cleanup
 * - Compression of rotated files
 * - Atomic writes for data integrity
 * - Cross-platform path handling
 * 
 * This transport is ideal for:
 * - Production environments requiring persistent logs
 * - Audit trails and compliance
 * - Long-term log storage
 * - Offline log analysis
 * 
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const fileTransport = new FileTransport({
 *   name: 'file',
 *   filepath: './logs',
 *   rotation: 'daily',
 *   maxFiles: 7,
 *   compress: true
 * });
 * 
 * await fileTransport.log({
 *   level: 'error',
 *   message: 'Database connection failed',
 *   error: { message: 'Connection timeout' }
 * });
 * ```
 */
export class FileTransport extends Transport {
  /**
   * File manager instance for handling file operations.
   * @private
   */
  private fileManager?: FileManager;

  /**
   * Current log file path.
   * @private
   */
  private currentFile?: string;

  /**
   * File stream for efficient writing.
   * @private
   */
  private fileStream?: any;

  /**
   * File configuration.
   * @private
   */
  private readonly filepath: string;
  private readonly isDirectory: boolean;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly compress: boolean;
  private readonly rotation: 'size' | 'daily' | 'hourly' | 'none';
  private readonly append: boolean;
  private readonly encoding: BufferEncoding;
  private readonly includeTimestamp: boolean;
  private readonly createDir: boolean;
  private readonly retentionDays: number;
  private readonly eol: string;

  /**
   * Current file size tracking.
   * @private
   */
  private currentFileSize = 0;

  /**
   * Last rotation check timestamp.
   * @private
   */
  private lastRotationCheck = Date.now();

  /**
   * Write queue for batching file operations.
   * @private
   */
  private writeQueue: string[] = [];
  private writeTimer?: NodeJS.Timeout;
  private writing = false;

  /**
   * Dynamic imports for Node.js modules.
   * @private
   */
  private fs?: any;
  private zlib?: any;

  /**
   * Creates a new FileTransport instance.
   * 
   * @param {FileTransportOptions} options - Transport configuration
   */
  constructor(options: FileTransportOptions) {
    super(options);

    // Validate required options
    if (!options.filepath) {
      throw new Error('FileTransport requires filepath option');
    }

    // Initialize configuration
    this.filepath = options.filepath;
    this.isDirectory = options.isDirectory ?? true;
    this.maxFileSize = options.maxFileSize ?? 10485760; // 10MB
    this.maxFiles = options.maxFiles ?? 5;
    this.compress = options.compress ?? false;
    this.rotation = options.rotation ?? 'size';
    this.append = options.append ?? true;
    this.encoding = options.encoding ?? 'utf8';
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.createDir = options.createDir ?? true;
    this.retentionDays = options.retentionDays ?? 30;
    this.eol = options.eol ?? '\n';
  }

  /**
   * Initialize the file transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Dynamic import Node.js modules
    await this.loadModules();

    // Initialize file manager if using directory mode
    if (this.isDirectory) {
      this.fileManager = new FileManager(this.filepath, this.retentionDays);
      this.currentFile = await this.fileManager.initLogFile();
    } else {
      // Ensure directory exists
      await this.ensureDirectory(path.dirname(this.filepath));
      this.currentFile = this.filepath;
      
      // Initialize file if it doesn't exist
      if (!this.append || !(await this.fileExists(this.currentFile))) {
        await this.createFile(this.currentFile);
      }
    }

    // Get current file size
    await this.updateFileSize();

    // Clean up old logs if in directory mode
    if (this.isDirectory && this.fileManager) {
      await this.fileManager.cleanupOldLogs();
    }
  }

  /**
   * Load required Node.js modules dynamically.
   * 
   * @private
   */
  private async loadModules(): Promise<void> {
    if (typeof window === 'undefined') {
      this.fs = (await import('fs')).default;
      
      if (this.compress) {
        this.zlib = (await import('zlib')).default;
      }
    } else {
      throw new Error('FileTransport is not supported in browser environments');
    }
  }

  /**
   * Log an entry to the file.
   * 
   * @param {LogEntry} entry - The log entry to write
   * @returns {Promise<void>} Resolves when written
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    // Check if rotation is needed
    await this.checkRotation();

    // Format the log entry
    const line = this.formatFileEntry(entry);

    // Add to write queue
    this.writeQueue.push(line);

    // Schedule write if not already scheduled
    this.scheduleWrite();
  }

  /**
   * Format a log entry for file output.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Formatted line for file
   * @private
   */
  private formatFileEntry(entry: LogEntry): string {
    let line: string;

    switch (this.format) {
      case 'json':
        // Single line JSON for easy parsing
        line = JSON.stringify(entry);
        break;

      case 'plain':
        // Human-readable format
        const parts: string[] = [];
        
        if (this.includeTimestamp) {
          parts.push(entry.timestamp);
        }
        
        parts.push(`[${entry.level.toUpperCase()}]`);
        
        if (entry.loggerId) {
          parts.push(`[${entry.loggerId}]`);
        }
        
        if (entry.tags && entry.tags.length > 0) {
          parts.push(`[${entry.tags.join(',')}]`);
        }
        
        parts.push(entry.plainMessage || entry.message);
        
        // Add error details on new lines
        if (entry.error) {
          parts.push(`\n  Error: ${entry.error.message}`);
          if (entry.error.stack) {
            parts.push(`\n  Stack: ${entry.error.stack.replace(/\n/g, '\n  ')}`);
          }
        }
        
        // Add context as JSON
        if (entry.context && Object.keys(entry.context).length > 0) {
          parts.push(`\n  Context: ${JSON.stringify(entry.context)}`);
        }
        
        line = parts.join(' ');
        break;

      case 'custom':
        if (!this.formatter) {
          throw new Error('Custom formatter not provided');
        }
        const formatted = this.formatter(entry);
        line = typeof formatted === 'string' ? formatted : formatted.toString();
        break;

      default:
        line = JSON.stringify(entry);
    }

    return line + this.eol;
  }

  /**
   * Schedule a batch write operation.
   * 
   * @private
   */
  private scheduleWrite(): void {
    if (this.writeTimer || this.writing) {
      return;
    }

    // Write immediately if queue is large
    if (this.writeQueue.length >= 100) {
      this.flushWriteQueue();
      return;
    }

    // Otherwise, batch writes every 100ms
    this.writeTimer = setTimeout(() => {
      this.flushWriteQueue();
    }, 100);
  }

  /**
   * Flush the write queue to disk.
   * 
   * @private
   */
  private async flushWriteQueue(): Promise<void> {
    if (this.writing || this.writeQueue.length === 0) {
      return;
    }

    this.writing = true;
    
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = undefined;
    }

    const lines = this.writeQueue.splice(0);
    const content = lines.join('');

    try {
      await this.writeToFile(content);
      this.currentFileSize += Buffer.byteLength(content, this.encoding);
    } catch (error) {
      // Put lines back in queue for retry
      this.writeQueue.unshift(...lines);
      throw error;
    } finally {
      this.writing = false;
    }
  }

  /**
   * Write content to the current log file.
   * 
   * @param {string} content - Content to write
   * @private
   */
  private async writeToFile(content: string): Promise<void> {
    if (!this.currentFile) {
      throw new Error('No log file initialized');
    }

    return new Promise((resolve, reject) => {
      this.fs.appendFile(
        this.currentFile,
        content,
        { encoding: this.encoding },
        (err: Error) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Check if file rotation is needed.
   * 
   * @private
   */
  private async checkRotation(): Promise<void> {
    if (this.rotation === 'none') {
      return;
    }

    const now = Date.now();
    
    switch (this.rotation) {
      case 'size':
        if (this.currentFileSize >= this.maxFileSize) {
          await this.rotateFile();
        }
        break;

      case 'daily':
        // Check once per minute max
        if (now - this.lastRotationCheck > 60000) {
          const currentDate = new Date().toDateString();
          const fileDate = new Date(this.lastRotationCheck).toDateString();
          
          if (currentDate !== fileDate) {
            await this.rotateFile();
          }
          
          this.lastRotationCheck = now;
        }
        break;

      case 'hourly':
        // Check once per minute max
        if (now - this.lastRotationCheck > 60000) {
          const currentHour = new Date().getHours();
          const fileHour = new Date(this.lastRotationCheck).getHours();
          
          if (currentHour !== fileHour) {
            await this.rotateFile();
          }
          
          this.lastRotationCheck = now;
        }
        break;
    }
  }

  /**
   * Rotate the current log file.
   * 
   * @private
   */
  private async rotateFile(): Promise<void> {
    // Flush any pending writes
    await this.flushWriteQueue();

    if (this.isDirectory && this.fileManager) {
      // Create new file with timestamp
      this.currentFile = await this.fileManager.initLogFile();
    } else if (this.currentFile) {
      // Rotate single file
      const dir = path.dirname(this.currentFile);
      const basename = path.basename(this.currentFile);
      const ext = path.extname(basename);
      const name = path.basename(basename, ext);
      
      // Generate rotated filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = path.join(dir, `${name}-${timestamp}${ext}`);
      
      // Rename current file
      await this.renameFile(this.currentFile, rotatedFile);
      
      // Compress if configured
      if (this.compress) {
        await this.compressFile(rotatedFile);
      }
      
      // Create new file
      await this.createFile(this.currentFile);
      
      // Manage old files
      await this.cleanupOldFiles(dir, name, ext);
    }

    // Reset file size
    this.currentFileSize = 0;
  }

  /**
   * Compress a file using gzip.
   * 
   * @param {string} filepath - File to compress
   * @private
   */
  private async compressFile(filepath: string): Promise<void> {
    if (!this.zlib) {
      return;
    }

    const gzipFile = `${filepath}.gz`;
    
    return new Promise((resolve, reject) => {
      const input = this.fs.createReadStream(filepath);
      const output = this.fs.createWriteStream(gzipFile);
      const gzip = this.zlib.createGzip();
      
      input
        .pipe(gzip)
        .pipe(output)
        .on('finish', () => {
          // Delete original file after compression
          this.fs.unlink(filepath, (err: Error) => {
            if (err) reject(err);
            else resolve();
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Clean up old rotated files.
   * 
   * @param {string} dir - Directory containing files
   * @param {string} namePattern - Base filename pattern
   * @param {string} ext - File extension
   * @private
   */
  private async cleanupOldFiles(dir: string, namePattern: string, ext: string): Promise<void> {
    const files = await this.readDirectory(dir);
    
    // Find all rotated files
    const pattern = new RegExp(`^${namePattern}-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}.*${ext}(\\.gz)?$`);
    const rotatedFiles = files
      .filter(file => pattern.test(file))
      .map(file => ({
        name: file,
        path: path.join(dir, file),
      }));
    
    // Sort by modification time
    const stats = await Promise.all(
      rotatedFiles.map(async file => ({
        ...file,
        mtime: (await this.getFileStats(file.path)).mtime.getTime(),
      }))
    );
    
    stats.sort((a, b) => b.mtime - a.mtime);
    
    // Remove old files exceeding maxFiles
    const filesToDelete = stats.slice(this.maxFiles);
    
    for (const file of filesToDelete) {
      await this.deleteFile(file.path);
    }
  }

  /**
   * Flush any pending writes.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async flush(): Promise<void> {
    await this.flushWriteQueue();
  }

  /**
   * Close the file transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Flush pending writes
    await this.flush();
    
    // Clear write timer
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = undefined;
    }
    
    // Close file stream if open
    if (this.fileStream) {
      await new Promise<void>((resolve, reject) => {
        this.fileStream.end((err: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  /**
   * Utility methods for file operations.
   * These wrap fs methods in promises for easier async/await usage.
   */

  private async ensureDirectory(dir: string): Promise<void> {
    if (!this.createDir) return;
    
    return new Promise((resolve, reject) => {
      this.fs.mkdir(dir, { recursive: true }, (err: Error) => {
        if (err && err.code !== 'EEXIST') reject(err);
        else resolve();
      });
    });
  }

  private async fileExists(filepath: string): Promise<boolean> {
    return new Promise(resolve => {
      this.fs.access(filepath, this.fs.constants.F_OK, (err: Error) => {
        resolve(!err);
      });
    });
  }

  private async createFile(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fs.writeFile(filepath, '', { encoding: this.encoding }, (err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async renameFile(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fs.rename(oldPath, newPath, (err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async deleteFile(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fs.unlink(filepath, (err: Error) => {
        if (err && err.code !== 'ENOENT') reject(err);
        else resolve();
      });
    });
  }

  private async readDirectory(dir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.fs.readdir(dir, (err: Error, files: string[]) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  private async getFileStats(filepath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fs.stat(filepath, (err: Error, stats: any) => {
        if (err) reject(err);
        else resolve(stats);
      });
    });
  }

  private async updateFileSize(): Promise<void> {
    if (!this.currentFile) return;
    
    try {
      const stats = await this.getFileStats(this.currentFile);
      this.currentFileSize = stats.size;
    } catch (err) {
      this.currentFileSize = 0;
    }
  }
}

/**
 * Factory function to create a file transport with common defaults.
 * 
 * @param {Partial<FileTransportOptions>} [options={}] - Transport options
 * @returns {FileTransport} Configured file transport
 */
export function createFileTransport(
  options: Partial<FileTransportOptions> = {}
): FileTransport {
  return new FileTransport({
    name: 'file',
    enabled: true,
    level: 'info',
    filepath: './logs',
    isDirectory: true,
    rotation: 'daily',
    ...options,
  });
}
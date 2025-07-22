// File: src/transports/base/implementations/FileTransport.ts

import { Transport } from '../Transport';
import { promises as fs } from 'fs';
import { dirname, join, resolve, basename, extname } from 'path';
import type { LogEntry } from '../../../types/transport';
import { createWriteStream, WriteStream } from 'fs';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Define the options interface directly here
export interface FileTransportOptions {
  name: string;
  enabled?: boolean;
  level?: string;
  levels?: string[];
  tags?: string[];
  excludeTags?: string[];
  filter?: (entry: LogEntry) => boolean;
  silent?: boolean;
  timeout?: number;
  format?: 'json' | 'plain' | 'custom';
  formatter?: (entry: LogEntry) => string | Buffer;
  filepath: string;
  isDirectory?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  compress?: boolean;
  rotation?: 'size' | 'daily' | 'hourly' | 'none';
  append?: boolean;
  encoding?: BufferEncoding;
  includeTimestamp?: boolean;
  createDir?: boolean;
  retentionDays?: number;
  eol?: string;
  maxBatchSize?: number;
  maxBatchTime?: number;
}

/**
 * File transport for writing logs to disk.
 * 
 * Features:
 * - Automatic file rotation (by size, date, or count)
 * - Compression support for archived logs
 * - Custom file naming patterns
 * - Atomic writes for reliability
 * - Stream-based writing for performance
 * - Archive cleanup policies
 * 
 * @class FileTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const fileTransport = new FileTransport({
 *   name: 'file',
 *   filepath: 'logs/app.log',
 *   maxFileSize: 10485760, // 10MB
 *   maxFiles: 5,
 *   compress: true
 * });
 * ```
 */
export class FileTransport extends Transport {
  /**
   * Current log file path.
   * @private
   */
  private filename: string;

  /**
   * Directory for log files.
   * @private
   */
  private readonly dirname: string;

  /**
   * Base filename without path.
   * @private
   */
  private readonly basename: string;

  /**
   * File extension.
   * @private
   */
  private readonly extension: string;

  /**
   * Maximum file size in bytes.
   * @private
   */
  private readonly maxFileSize?: number;

  /**
   * Maximum number of files to keep.
   * @private
   */
  private readonly maxFiles?: number;

  /**
   * Rotation strategy.
   * @private
   */
  private readonly rotation: 'size' | 'daily' | 'hourly' | 'none';

  /**
   * Whether to compress archived files.
   * @private
   */
  private readonly compress: boolean;

  /**
   * File encoding.
   * @private
   */
  private readonly encoding: BufferEncoding;

  /**
   * Whether to append to existing file.
   * @private
   */
  private readonly append: boolean;

  /**
   * Whether to include timestamp in log lines.
   * @private
   */
  private readonly includeTimestamp: boolean;

  /**
   * Whether to create directory if it doesn't exist.
   * @private
   */
  private readonly createDir: boolean;

  /**
   * Line ending.
   * @private
   */
  private readonly eol: string;

  /**
   * Current file write stream.
   * @private
   */
  private stream?: WriteStream;

  /**
   * Current file size in bytes.
   * @private
   */
  private currentSize = 0;

  /**
   * File creation timestamp.
   * @private
   */
  private fileCreatedAt?: Date;

  /**
   * Write queue for atomic operations.
   * @private
   */
  private writeQueue: Array<{
    data: string;
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  /**
   * Whether currently processing queue.
   * @private
   */
  private processing = false;

  /**
   * Creates a new FileTransport instance.
   * 
   * @param {FileTransportOptions} options - Transport configuration
   */
  constructor(options: FileTransportOptions) {
    super(options);

    // Parse filepath - handle relative paths correctly
    const fullPath = resolve(options.filepath);
    
    if (options.isDirectory) {
      this.dirname = fullPath;
      this.basename = 'app';
      this.extension = '.log';
      this.filename = join(this.dirname, `${this.basename}${this.extension}`);
    } else {
      this.dirname = dirname(fullPath);
      const filename = basename(fullPath);
      this.extension = extname(filename) || '.log';
      this.basename = basename(filename, this.extension);
      this.filename = fullPath;
    }
    
    this.maxFileSize = options.maxFileSize;
    this.maxFiles = options.maxFiles;
    this.rotation = options.rotation || (this.maxFileSize ? 'size' : 'none');
    this.compress = options.compress ?? false;
    this.encoding = options.encoding || 'utf8';
    this.append = options.append ?? true;
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.createDir = options.createDir ?? true;
    this.eol = options.eol || '\n';
  }

  /**
   * Initialize file transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Ensure directory exists
    if (this.createDir) {
      await fs.mkdir(this.dirname, { recursive: true });
    }

    // Initialize stream
    await this.openStream();
  }

  /**
   * Open file stream.
   * 
   * @returns {Promise<void>} Resolves when stream is ready
   * @private
   */
  private async openStream(): Promise<void> {
    // Generate filename based on rotation
    this.filename = this.generateFilename();

    // Check if file exists and get size
    try {
      const stats = await fs.stat(this.filename);
      this.currentSize = stats.size;
      this.fileCreatedAt = stats.birthtime;
    } catch {
      this.currentSize = 0;
      this.fileCreatedAt = new Date();
    }

    // Create write stream
    this.stream = createWriteStream(this.filename, {
      flags: this.append ? 'a' : 'w',
      encoding: this.encoding,
      highWaterMark: 16 * 1024, // 16KB buffer
    });

    // Handle stream events
    this.stream.on('error', (error: Error) => {
      this.handleError(error);
    });

    // Wait for stream to be ready
    await new Promise<void>((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('Stream not created'));
        return;
      }
      
      this.stream.once('open', () => resolve());
      this.stream.once('error', reject);
    });
  }

  /**
   * Generate filename based on rotation strategy.
   * 
   * @returns {string} Generated filename
   * @private
   */
  private generateFilename(): string {
    const now = new Date();
    
    switch (this.rotation) {
      case 'daily': {
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return join(this.dirname, `${this.basename}-${date}${this.extension}`);
      }
      
      case 'hourly': {
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const hour = String(now.getHours()).padStart(2, '0');
        return join(this.dirname, `${this.basename}-${date}-${hour}${this.extension}`);
      }
      
      default:
        return join(this.dirname, `${this.basename}${this.extension}`);
    }
  }

  /**
   * Log entry to file.
   * 
   * @param {LogEntry} entry - Log entry to write
   * @returns {Promise<void>} Resolves when written
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    const formatted = this.formatFileEntry(entry);
    await this.write(formatted);
  }

  /**
   * Format log entry for file output.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {string} Formatted output
   * @private
   */
  private formatFileEntry(entry: LogEntry): string {
    let output: string;

    switch (this.format) {
      case 'json': {
        const data: Record<string, unknown> = {
          ...entry,
        };
        
        // Remove timestamp if not needed
        if (!this.includeTimestamp) {
          delete data.timestamp;
          delete data.timestampMs;
        }
        
        output = JSON.stringify(data);
        break;
      }

      case 'plain':
        output = this.formatPlain(entry);
        break;

      case 'custom':
        if (this.formatter) {
          const result = this.formatter(entry);
          output = typeof result === 'string' ? result : result.toString();
        } else {
          output = this.formatPlain(entry);
        }
        break;

      default:
        output = this.formatPlain(entry);
    }

    return output + this.eol;
  }

  /**
   * Write data to file.
   * 
   * @param {string} data - Data to write
   * @returns {Promise<void>} Resolves when written
   * @private
   */
  private async write(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.writeQueue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process write queue.
   * 
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.writeQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (!item) continue;

      try {
        // Check if rotation is needed
        await this.checkRotation(item.data.length);

        // Write to stream
        await this.writeToStream(item.data);
        this.currentSize += Buffer.byteLength(item.data);
        
        item.resolve();
      } catch (error) {
        item.reject(error as Error);
      }
    }

    this.processing = false;
  }

  /**
   * Write data to stream.
   * 
   * @param {string} data - Data to write
   * @returns {Promise<void>} Resolves when written
   * @private
   */
  private writeToStream(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stream || !this.stream.writable) {
        reject(new Error('Stream not writable'));
        return;
      }

      const written = this.stream.write(data, (error?: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      // Handle backpressure
      if (!written) {
        this.stream.once('drain', () => resolve());
      }
    });
  }

  /**
   * Check if file rotation is needed.
   * 
   * @param {number} nextSize - Size of next write
   * @returns {Promise<void>} Resolves when checked/rotated
   * @private
   */
  private async checkRotation(nextSize: number): Promise<void> {
    let shouldRotate = false;

    // Check size limit
    if (this.rotation === 'size' && this.maxFileSize && this.currentSize + nextSize > this.maxFileSize) {
      shouldRotate = true;
    }

    // Check date-based rotation
    if ((this.rotation === 'daily' || this.rotation === 'hourly') && this.fileCreatedAt) {
      const currentFilename = this.generateFilename();
      if (currentFilename !== this.filename) {
        shouldRotate = true;
      }
    }

    if (shouldRotate) {
      await this.rotate();
    }
  }

  /**
   * Rotate log file.
   * 
   * @returns {Promise<void>} Resolves when rotated
   * @private
   */
  private async rotate(): Promise<void> {
    // Close current stream
    if (this.stream) {
      await new Promise<void>((resolve) => {
        if (this.stream) {
          this.stream.end(() => resolve());
        } else {
          resolve();
        }
      });
    }

    // Archive current file if needed
    if (this.compress && this.rotation === 'size') {
      await this.compressFile(this.filename);
    }

    // Clean up old files
    await this.cleanupOldFiles();

    // Open new stream
    await this.openStream();
  }

  /**
   * Compress a log file.
   * 
   * @param {string} filename - File to compress
   * @returns {Promise<void>} Resolves when compressed
   * @private
   */
  private async compressFile(filename: string): Promise<void> {
    const compressed = `${filename}.gz`;
    
    try {
      const content = await fs.readFile(filename);
      const gzipped = await gzipAsync(content);
      await fs.writeFile(compressed, gzipped);
      await fs.unlink(filename);
    } catch (error) {
      // Log compression error but don't fail rotation
      console.error(`Failed to compress ${filename}:`, error);
    }
  }

  /**
   * Clean up old log files.
   * 
   * @returns {Promise<void>} Resolves when cleaned
   * @private
   */
  private async cleanupOldFiles(): Promise<void> {
    if (!this.maxFiles) return;

    try {
      // Get all log files
      const files = await fs.readdir(this.dirname);
      const logFiles = files
        .filter(file => file.startsWith(this.basename))
        .map(file => ({
          name: file,
          path: join(this.dirname, file),
        }));

      // Get file stats
      const fileStats = await Promise.all(
        logFiles.map(async (file) => {
          try {
            const stats = await fs.stat(file.path);
            return {
              ...file,
              mtime: stats.mtime,
            };
          } catch {
            return null;
          }
        })
      );

      // Filter out failed stats and sort by modification time (newest first)
      const validStats = fileStats.filter(stat => stat !== null) as Array<{
        name: string;
        path: string;
        mtime: Date;
      }>;
      
      validStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Remove old files
      const filesToDelete = validStats.slice(this.maxFiles);
      await Promise.all(
        filesToDelete.map(file => fs.unlink(file.path).catch(() => {
          // Ignore errors
        }))
      );
    } catch (error) {
      // Log cleanup error but don't fail
      console.error('Failed to cleanup old files:', error);
    }
  }

  /**
   * Batch log entries.
   * 
   * @param {LogEntry[]} entries - Entries to log
   * @returns {Promise<void>} Resolves when all written
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // Format all entries and write as single operation
    const formatted = entries.map(entry => this.formatFileEntry(entry)).join('');
    await this.write(formatted);
  }

  /**
   * Close file transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Process remaining queue
    await this.processQueue();

    // Close stream
    if (this.stream) {
      await new Promise<void>((resolve) => {
        if (this.stream) {
          this.stream.end(() => resolve());
        } else {
          resolve();
        }
      });
    }
  }

  /**
   * Get current log file stats.
   * 
   * @returns {Promise<object>} File statistics
   */
  public async getFileStats(): Promise<{
    filename: string;
    size: number;
    created: Date;
    modified: Date;
  }> {
    const stats = await fs.stat(this.filename);
    return {
      filename: this.filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }

  /**
   * List all log files.
   * 
   * @returns {Promise<string[]>} Log file paths
   */
  public async listLogFiles(): Promise<string[]> {
    const files = await fs.readdir(this.dirname);
    return files
      .filter(file => file.startsWith(this.basename))
      .map(file => join(this.dirname, file));
  }
}

/**
 * Factory function to create a FileTransport instance.
 * 
 * @param {Partial<FileTransportOptions>} [options] - FileTransport configuration options
 * @returns {FileTransport} New FileTransport instance
 * 
 * @example
 * ```typescript
 * const transport = createFileTransport({
 *   filepath: './logs/app.log',
 *   rotation: 'daily',
 *   compress: true
 * });
 * ```
 */
export function createFileTransport(options: Partial<FileTransportOptions> = {}): FileTransport {
  const defaultOptions: FileTransportOptions = {
    name: 'file',
    enabled: true,
    filepath: './logs/app.log',
    rotation: 'none',
    append: true,
    createDir: true,
    ...options
  };
  
  return new FileTransport(defaultOptions);
}
/**
 * @fileoverview Worker thread for file I/O operations.
 * Handles actual file writing in a separate thread.
 *
 * @module transports/worker/FileWorker
 */

import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';
import type { LogEntry } from '../../types/transport';

/**
 * File worker configuration from main thread.
 *
 * @interface FileWorkerConfig
 */
interface FileWorkerConfig {
  /** File path to write to */
  filePath: string;
  /** Whether to append to existing file */
  append: boolean;
}

/**
 * File worker state and operations.
 *
 * @class FileWorkerHandler
 */
class FileWorkerHandler {
  private stream: fs.WriteStream | null = null;
  private readonly config: FileWorkerConfig;
  private writeBuffer: string[] = [];
  private isWriting = false;
  private totalWritten = 0;

  /**
   * Creates a new file worker handler.
   *
   * @constructor
   * @param {FileWorkerConfig} config - Worker configuration.
   */
  constructor(config: FileWorkerConfig) {
    this.config = config;
    this.initializeStream();
  }

  /**
   * Initializes the file write stream.
   *
   * @private
   * @returns {void}
   */
  private initializeStream(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.config.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create write stream
      this.stream = fs.createWriteStream(this.config.filePath, {
        flags: this.config.append ? 'a' : 'w',
        encoding: 'utf8',
        highWaterMark: 64 * 1024, // 64KB buffer
      });

      this.stream.on('error', error => {
        console.error('[FileWorker] Stream error:', error);
        parentPort?.postMessage({
          type: 'ERROR',
          error: error.message,
        });
      });

      this.stream.on('drain', () => {
        // Stream buffer drained, continue writing
        if (this.writeBuffer.length > 0) {
          this.performWrite();
        }
      });
    } catch (error) {
      console.error('[FileWorker] Failed to initialize stream:', error);
      parentPort?.postMessage({
        type: 'ERROR',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Processes a batch of log entries.
   *
   * @param {LogEntry[]} entries - Log entries to write.
   * @returns {void}
   */
  public processBatch(entries: LogEntry[]): void {
    // Serialize entries to JSON lines
    for (const entry of entries) {
      const json = JSON.stringify(entry);
      this.writeBuffer.push(json + '\n');
    }

    // Start writing if not already writing
    if (!this.isWriting) {
      this.performWrite();
    }
  }

  /**
   * Performs actual write to file.
   *
   * @private
   * @returns {void}
   */
  private performWrite(): void {
    if (!this.stream || this.writeBuffer.length === 0) return;

    this.isWriting = true;

    // Write buffered data
    while (this.writeBuffer.length > 0) {
      const line = this.writeBuffer.shift();
      if (!line) break;
      const canContinue = this.stream.write(line);
      this.totalWritten++;

      // If stream buffer is full, wait for drain
      if (!canContinue) {
        break;
      }
    }

    this.isWriting = false;

    // Report progress
    parentPort?.postMessage({
      type: 'WRITE_COMPLETE',
      stats: {
        buffered: this.writeBuffer.length,
        totalWritten: this.totalWritten,
      },
    });
  }

  /**
   * Flushes any pending writes.
   *
   * @returns {Promise<void>}
   */
  public async flush(): Promise<void> {
    // Write any remaining buffer
    if (this.writeBuffer.length > 0) {
      this.performWrite();
    }

    // Flush the stream
    if (this.stream) {
      await new Promise<void>((resolve, reject) => {
        if (!this.stream) {
          resolve();
          return;
        }
        this.stream.write('', error => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  }

  /**
   * Shuts down the worker gracefully.
   *
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    // Final flush
    await this.flush();

    // Close stream
    if (this.stream) {
      await new Promise<void>(resolve => {
        if (!this.stream) {
          resolve();
          return;
        }
        this.stream.end(() => resolve());
      });
      this.stream = null;
    }

    // Report shutdown
    parentPort?.postMessage({
      type: 'SHUTDOWN_COMPLETE',
      stats: {
        totalWritten: this.totalWritten,
      },
    });
  }
}

// Initialize worker handler with config from main thread
const handler = new FileWorkerHandler(workerData as FileWorkerConfig);

// Handle messages from main thread
if (parentPort) {
  parentPort.on('message', async message => {
    try {
      switch (message.type) {
        case 'WRITE_BATCH':
          handler.processBatch(message.entries);
          break;

        case 'FLUSH':
          await handler.flush();
          parentPort?.postMessage({ type: 'FLUSH_COMPLETE' });
          break;

        case 'SHUTDOWN':
          await handler.shutdown();
          parentPort?.close();
          break;

        default:
          console.warn('[FileWorker] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[FileWorker] Error handling message:', error);
      parentPort?.postMessage({
        type: 'ERROR',
        error: (error as Error).message,
      });
    }
  });

  // Send ready signal
  parentPort.postMessage({
    type: 'WORKER_READY',
    pid: process.pid,
  });
} else {
  console.error('[FileWorker] Not running in worker thread');
  process.exit(1);
}

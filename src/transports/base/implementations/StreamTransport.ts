// File: src/transports/base/implementations/StreamTransport.ts

import { Transport } from '../Transport';
import type { 
  StreamTransportOptions, 
  LogEntry,
  TransportStats 
} from '../../../types/transport';
import { Transform } from 'stream';

/**
 * Stream transport for piping logs to any Node.js writable stream.
 * 
 * Features:
 * - Works with any Node.js writable stream (files, network, process)
 * - Backpressure handling for flow control
 * - Transform stream support for log processing pipelines
 * - Multiple encoding formats
 * - Stream health monitoring
 * - Automatic stream cleanup
 * 
 * @class StreamTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * // Write to stdout
 * const stdoutTransport = new StreamTransport({
 *   name: 'stdout',
 *   stream: process.stdout
 * });
 * 
 * // Write to custom stream with transform
 * const transformStream = new Transform({
 *   transform(chunk, encoding, callback) {
 *     // Process log data
 *     callback(null, chunk.toString().toUpperCase());
 *   }
 * });
 * 
 * const streamTransport = new StreamTransport({
 *   name: 'transform',
 *   stream: transformStream.pipe(process.stdout)
 * });
 * ```
 */
export class StreamTransport extends Transport {
  /**
   * Target writable stream.
   * @private
   */
  private stream: NodeJS.WritableStream;

  /**
   * Whether to close stream when transport closes.
   * @private
   */
  private readonly autoClose: boolean;

  /**
   * Stream encoding.
   * @private
   */
  private readonly encoding: BufferEncoding;

  /**
   * Whether stream is writable.
   * @private
   */
  private isWritable = true;

  /**
   * Queue for entries during backpressure.
   * @private
   */
  private queue: Array<{
    entry: string | Buffer;
    callback: (error?: Error) => void;
  }> = [];

  /**
   * Maximum queue size during backpressure.
   * @private
   */
  private readonly maxQueueSize = 1000;

  /**
   * Stream error count.
   * @private
   */
  private errorCount = 0;

  /**
   * Maximum consecutive errors before disabling.
   * @private
   */
  private readonly maxErrors = 10;

  /**
   * Line ending for text output.
   * @private
   */
  private readonly lineEnding: string;

  /**
   * Creates a new StreamTransport instance.
   * 
   * @param {StreamTransportOptions} options - Transport configuration
   */
  constructor(options: StreamTransportOptions) {
    super(options);

    this.stream = options.stream;
    this.autoClose = options.autoClose ?? false;
    this.encoding = options.encoding || 'utf8';
    this.lineEnding = process.platform === 'win32' ? '\r\n' : '\n';
  }

  /**
   * Initialize stream transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Check if stream is writable
    if (!this.stream.writable) {
      throw new Error('Stream is not writable');
    }

    // Set up event handlers
    this.setupStreamHandlers();
  }

  /**
   * Set up stream event handlers.
   * 
   * @private
   */
  private setupStreamHandlers(): void {
    // Handle drain event (backpressure relief)
    this.stream.on('drain', () => {
      this.isWritable = true;
      this.processQueue();
    });

    // Handle stream errors
    this.stream.on('error', (error) => {
      this.errorCount++;
      this.handleError(error);

      // Disable transport if too many errors
      if (this.errorCount >= this.maxErrors) {
        this.enabled = false;
        this.emit('disabled', {
          reason: 'Too many stream errors',
          errorCount: this.errorCount,
        });
      }
    });

    // Handle stream close
    this.stream.on('close', () => {
      this.isWritable = false;
      this.emit('streamClosed');
    });

    // Handle finish event
    this.stream.on('finish', () => {
      this.isWritable = false;
      this.emit('streamFinished');
    });

    // Handle pipe/unpipe events if it's a readable stream
    if ('on' in this.stream && typeof (this.stream as NodeJS.EventEmitter).on === 'function') {
      (this.stream as NodeJS.EventEmitter).on('pipe', (src: NodeJS.ReadableStream) => {
        this.emit('piped', { source: src });
      });

      (this.stream as NodeJS.EventEmitter).on('unpipe', (src: NodeJS.ReadableStream) => {
        this.emit('unpiped', { source: src });
      });
    }
  }

  /**
   * Log a single entry to the stream.
   * 
   * @param {LogEntry} entry - Log entry to write
   * @returns {Promise<void>} Resolves when written
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    const formatted = this.formatForStream(entry);
    
    return new Promise((resolve, reject) => {
      this.writeToStream(formatted, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Log multiple entries efficiently.
   * 
   * @param {LogEntry[]} entries - Log entries to write
   * @returns {Promise<void>} Resolves when all written
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // Format all entries
    const formatted = entries.map(entry => this.formatForStream(entry));
    const combined = formatted.join('');

    return new Promise((resolve, reject) => {
      this.writeToStream(combined, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Format log entry for stream output.
   * 
   * @param {LogEntry} entry - Log entry to format
   * @returns {string | Buffer} Formatted output
   * @private
   */
  private formatForStream(entry: LogEntry): string | Buffer {
    let output: string | Buffer;

    switch (this.format) {
      case 'json':
        output = JSON.stringify(entry) + this.lineEnding;
        break;

      case 'plain':
        output = this.formatPlain(entry) + this.lineEnding;
        break;

      case 'custom':
        if (this.formatter) {
          const result = this.formatter(entry);
          output = typeof result === 'string' 
            ? result + (result.endsWith('\n') ? '' : this.lineEnding)
            : result;
        } else {
          output = JSON.stringify(entry) + this.lineEnding;
        }
        break;

      default:
        output = JSON.stringify(entry) + this.lineEnding;
    }

    // Convert to buffer if needed
    if (typeof output === 'string' && this.encoding !== 'utf8') {
      return Buffer.from(output, this.encoding);
    }

    return output;
  }

  /**
   * Write data to stream with backpressure handling.
   * 
   * @param {string | Buffer} data - Data to write
   * @param {Function} callback - Callback when written
   * @private
   */
  private writeToStream(
    data: string | Buffer,
    callback: (error?: Error) => void
  ): void {
    if (!this.isWritable || !this.stream.writable) {
      callback(new Error('Stream is not writable'));
      return;
    }

    // Check queue
    if (this.queue.length > 0) {
      // Add to queue if already queued items
      this.queueWrite(data, callback);
      return;
    }

    // Attempt to write
    try {
      const canWrite = this.stream.write(data, this.encoding, (error) => {
        if (error) {
          callback(error);
        } else {
          callback();
          this.errorCount = 0; // Reset error count on success
        }
      });

      if (!canWrite) {
        // Backpressure - stream buffer is full
        this.isWritable = false;
        this.emit('backpressure', {
          queueSize: this.queue.length,
        });
      }
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Queue a write operation during backpressure.
   * 
   * @param {string | Buffer} data - Data to queue
   * @param {Function} callback - Callback when written
   * @private
   */
  private queueWrite(
    data: string | Buffer,
    callback: (error?: Error) => void
  ): void {
    if (this.queue.length >= this.maxQueueSize) {
      callback(new Error('Stream queue is full'));
      this.stats.custom = {
        ...this.stats.custom,
        droppedWrites: ((this.stats.custom?.droppedWrites as number) || 0) + 1
      };
      return;
    }

    this.queue.push({ entry: data, callback });
    this.stats.queued = this.queue.length;
  }

  /**
   * Process queued writes when stream is ready.
   * 
   * @private
   */
  private processQueue(): void {
    while (this.queue.length > 0 && this.isWritable && this.stream.writable) {
      const item = this.queue.shift()!;
      this.stats.queued = this.queue.length;

      this.writeToStream(item.entry, item.callback);

      if (!this.isWritable) {
        // Stream is full again
        break;
      }
    }
  }

  /**
   * Flush any buffered data in the stream.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async flush(): Promise<void> {
    // Process any queued items first
    if (this.queue.length > 0) {
      await new Promise<void>((resolve) => {
        const checkQueue = () => {
          if (this.queue.length === 0) {
            resolve();
          } else {
            setTimeout(checkQueue, 10);
          }
        };
        checkQueue();
      });
    }

    // Flush stream if it supports it
    if ('flush' in this.stream && typeof (this.stream as NodeJS.WritableStream & { flush: (callback: (error?: Error) => void) => void }).flush === 'function') {
      return new Promise((resolve, reject) => {
        (this.stream as NodeJS.WritableStream & { flush: (callback: (error?: Error) => void) => void }).flush((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * Cork the stream (buffer writes).
   */
  public cork(): void {
    if ('cork' in this.stream && typeof (this.stream as NodeJS.WritableStream & { cork: () => void }).cork === 'function') {
      (this.stream as NodeJS.WritableStream & { cork: () => void }).cork();
    }
  }

  /**
   * Uncork the stream (flush buffered writes).
   */
  public uncork(): void {
    if ('uncork' in this.stream && typeof (this.stream as NodeJS.WritableStream & { uncork: () => void }).uncork === 'function') {
      (this.stream as NodeJS.WritableStream & { uncork: () => void }).uncork();
    }
  }

  /**
   * Pipe this transport's output to another stream.
   * 
   * @param {NodeJS.WritableStream} destination - Destination stream
   * @param {object} options - Pipe options
   * @returns {NodeJS.WritableStream} Destination stream
   */
  public pipe(
    destination: NodeJS.WritableStream,
    options?: { end?: boolean }
  ): NodeJS.WritableStream {
    // Create a transform stream that formats log entries
    const transform = new Transform({
      objectMode: true,
      transform: (entry: LogEntry, encoding, callback) => {
        try {
          const formatted = this.formatForStream(entry);
          callback(null, formatted);
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    // Pipe through transform to destination
    transform.pipe(destination, options);

    // Store transform stream reference
    this.stats.custom = {
      ...this.stats.custom,
      pipedTo: destination
    };

    return destination;
  }

  /**
   * Close the stream transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Flush any remaining data
    await this.flush();

    // End stream if autoClose is enabled
    if (this.autoClose && this.stream.writable) {
      return new Promise((resolve, reject) => {
        this.stream.end((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * Get stream statistics.
   * 
   * @returns {TransportStats} Extended statistics
   */
  public getStats(): TransportStats {
    const baseStats = super.getStats();
    const streamStats: Record<string, unknown> = {
      writable: this.stream.writable,
      queueSize: this.queue.length,
      errorCount: this.errorCount,
      isWritable: this.isWritable,
    };

    // Add stream-specific stats if available
    if ('bytesWritten' in this.stream) {
      streamStats.bytesWritten = (this.stream as NodeJS.WritableStream & { bytesWritten: number }).bytesWritten;
    }

    if ('writableLength' in this.stream) {
      streamStats.bufferSize = (this.stream as NodeJS.WritableStream & { writableLength: number }).writableLength;
    }

    if ('writableHighWaterMark' in this.stream) {
      streamStats.highWaterMark = (this.stream as NodeJS.WritableStream & { writableHighWaterMark: number }).writableHighWaterMark;
    }

    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        stream: streamStats,
      },
    };
  }

  /**
   * Check if transport is healthy.
   * 
   * @returns {Promise<boolean>} True if healthy
   */
  public async isHealthy(): Promise<boolean> {
    return Promise.resolve(
      this.enabled &&
      this.stream.writable &&
      this.errorCount < this.maxErrors &&
      this.queue.length < this.maxQueueSize * 0.8
    );
  }
}
// File: src/transports/implementations/StreamTransport.ts

import { Transport } from '../Transport';
import type { StreamTransportOptions, LogEntry, TransportStats } from '../../../types/transport';

/**
 * Transport that writes logs to any Node.js writable stream.
 * 
 * The StreamTransport provides flexible stream-based logging with:
 * - Support for any Node.js writable stream
 * - Backpressure handling for flow control
 * - Stream error recovery
 * - Custom encoding support
 * - Stream pipeline integration
 * - Automatic stream lifecycle management
 * 
 * This transport is ideal for:
 * - Piping logs to custom processing pipelines
 * - Integration with existing stream-based systems
 * - Custom output destinations
 * - Transform streams for log processing
 * 
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * import { createWriteStream } from 'fs';
 * import { createGzip } from 'zlib';
 * 
 * // Simple file stream
 * const fileStream = createWriteStream('./app.log');
 * const fileTransport = new StreamTransport({
 *   name: 'file-stream',
 *   stream: fileStream
 * });
 * 
 * // Compressed stream pipeline
 * const gzipStream = createGzip();
 * gzipStream.pipe(createWriteStream('./app.log.gz'));
 * 
 * const compressedTransport = new StreamTransport({
 *   name: 'compressed-stream',
 *   stream: gzipStream
 * });
 * 
 * // Network stream
 * const netStream = net.connect(3000, 'logserver.example.com');
 * const networkTransport = new StreamTransport({
 *   name: 'network-stream',
 *   stream: netStream
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
   * Stream configuration.
   * @private
   */
  private readonly autoClose: boolean;
  private readonly encoding: BufferEncoding;

  /**
   * Stream state tracking.
   * @private
   */
  private streamReady = false;
  private streamEnded = false;
  private streamErrored = false;

  /**
   * Write queue for handling backpressure.
   * @private
   */
  private writeQueue: Array<{
    chunk: string | Buffer;
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  /**
   * Flag to track if we're currently draining.
   * @private
   */
  private draining = false;

  /**
   * Stream event listeners for cleanup.
   * @private
   */
  private streamListeners: {
    error?: (error: Error) => void;
    drain?: () => void;
    close?: () => void;
    finish?: () => void;
    pipe?: (src: NodeJS.ReadableStream) => void;
    unpipe?: (src: NodeJS.ReadableStream) => void;
  } = {};

  /**
   * Creates a new StreamTransport instance.
   * 
   * @param {StreamTransportOptions} options - Transport configuration
   */
  constructor(options: StreamTransportOptions) {
    super(options);

    // Validate required options
    if (!options.stream) {
      throw new Error('StreamTransport requires stream option');
    }

    if (!this.isWritableStream(options.stream)) {
      throw new Error('StreamTransport requires a writable stream');
    }

    // Initialize configuration
    this.stream = options.stream;
    this.autoClose = options.autoClose ?? false;
    this.encoding = options.encoding ?? 'utf8';
  }

  /**
   * Check if the provided stream is writable.
   * 
   * @param {any} stream - Stream to check
   * @returns {boolean} True if stream is writable
   * @private
   */
  private isWritableStream(stream: any): stream is NodeJS.WritableStream {
    return stream &&
           typeof stream.write === 'function' &&
           typeof stream.end === 'function' &&
           typeof stream.on === 'function';
  }

  /**
   * Initialize the stream transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      throw new Error('StreamTransport is not supported in browser environments');
    }

    // Set up stream event handlers
    this.setupStreamHandlers();

    // Check if stream is already writable
    if (this.stream.writable) {
      this.streamReady = true;
    } else {
      // Wait for stream to be ready
      await this.waitForStream();
    }
  }

  /**
   * Set up event handlers for the stream.
   * 
   * @private
   */
  private setupStreamHandlers(): void {
    // Error handler
    this.streamListeners.error = (error: Error) => {
      this.streamErrored = true;
      this.handleStreamError(error);
    };

    // Drain handler for backpressure
    this.streamListeners.drain = () => {
      this.processDrainQueue();
    };

    // Close handler
    this.streamListeners.close = () => {
      this.streamEnded = true;
      this.handleStreamClose();
    };

    // Finish handler
    this.streamListeners.finish = () => {
      this.streamEnded = true;
      this.emit('stream_finish');
    };

    // Pipe/unpipe handlers for tracking
    this.streamListeners.pipe = (src: NodeJS.ReadableStream) => {
      this.emit('stream_pipe', src);
    };

    this.streamListeners.unpipe = (src: NodeJS.ReadableStream) => {
      this.emit('stream_unpipe', src);
    };

    // Attach listeners
    for (const [event, handler] of Object.entries(this.streamListeners)) {
      if (handler) {
        this.stream.on(event, handler);
      }
    }
  }

  /**
   * Wait for stream to be ready.
   * 
   * @returns {Promise<void>} Resolves when stream is ready
   * @private
   */
  private waitForStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stream initialization timeout'));
      }, 5000);

      const checkReady = () => {
        if (this.stream.writable) {
          clearTimeout(timeout);
          this.streamReady = true;
          resolve();
        } else if (this.streamErrored || this.streamEnded) {
          clearTimeout(timeout);
          reject(new Error('Stream is not writable'));
        } else {
          setTimeout(checkReady, 100);
        }
      };

      // Check if stream needs to be opened first
      if (typeof (this.stream as any).open === 'function') {
        (this.stream as any).open();
      }

      checkReady();
    });
  }

  /**
   * Log an entry to the stream.
   * 
   * @param {LogEntry} entry - The log entry to write
   * @returns {Promise<void>} Resolves when written
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (!this.streamReady || this.streamEnded || this.streamErrored) {
      throw new Error('Stream is not writable');
    }

    // Format the entry
    const formatted = this.formatEntry(entry);
    
    // Convert to appropriate type
    const chunk = this.prepareChunk(formatted);

    // Write to stream
    await this.writeToStream(chunk);
  }

  /**
   * Log multiple entries efficiently.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {Promise<void>} Resolves when all written
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    if (!this.streamReady || this.streamEnded || this.streamErrored) {
      throw new Error('Stream is not writable');
    }

    // Format all entries
    const formatted = entries.map(entry => this.formatEntry(entry));
    
    // Join with newlines for batch writing
    const batchContent = formatted.join('\n') + '\n';
    
    // Convert to appropriate type
    const chunk = this.prepareChunk(batchContent);

    // Write to stream
    await this.writeToStream(chunk);
  }

  /**
   * Prepare chunk for writing based on format.
   * 
   * @param {string | Buffer} data - Data to prepare
   * @returns {string | Buffer} Prepared chunk
   * @private
   */
  private prepareChunk(data: string | Buffer): string | Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    // Add newline if not present
    if (typeof data === 'string' && !data.endsWith('\n')) {
      data += '\n';
    }

    return data;
  }

  /**
   * Write chunk to stream with backpressure handling.
   * 
   * @param {string | Buffer} chunk - Data to write
   * @returns {Promise<void>} Resolves when write completes
   * @private
   */
  private writeToStream(chunk: string | Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Ensure chunk is properly encoded
        let data: Buffer;
        let canWrite: boolean;
        
        if (chunk instanceof Buffer) {
          data = chunk;
          canWrite = this.stream.write(data);
        } else {
          // TypeScript now knows chunk is string
          data = Buffer.from(chunk as string, this.encoding);
          canWrite = this.stream.write(chunk as string, this.encoding);
        }

        if (canWrite) {
          // Write completed immediately
          resolve();
        } else {
          // Handle backpressure
          // Queue the completion callback
          this.writeQueue.push({
            chunk: '', // Already written, just need to track completion
            resolve,
            reject,
          });
          
          // Ensure custom stats object exists before setting properties
          if (!this.stats.custom) {
            this.stats.custom = {};
          }
          this.stats.custom.backpressure = true;
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Process drain queue after backpressure relief.
   * 
   * @private
   */
  private processDrainQueue(): void {
    // Ensure custom stats object exists before setting properties
    if (!this.stats.custom) {
      this.stats.custom = {};
    }
    this.stats.custom.backpressure = false;
    
    // Resolve all queued writes
    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (item) {
        item.resolve();
      }
    }

    this.emit('stream_drain');
  }

  /**
   * Handle stream errors.
   * 
   * @param {Error} error - Stream error
   * @private
   */
  private handleStreamError(error: Error): void {
    // Clear write queue
    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (item) {
        item.reject(error);
      }
    }

    // Emit error
    this.handleError(error);
    
    // Mark stream as unusable
    this.streamReady = false;
  }

  /**
   * Handle stream close event.
   * 
   * @private
   */
  private handleStreamClose(): void {
    // Clear write queue
    const error = new Error('Stream closed');
    
    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (item) {
        item.reject(error);
      }
    }

    this.emit('stream_close');
  }

  /**
   * Format entry according to transport configuration.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted entry
   * @protected
   */
  protected formatEntry(entry: LogEntry): string | Buffer {
    let formatted: string | Buffer;

    switch (this.format) {
      case 'json':
        // Single-line JSON for stream processing
        formatted = JSON.stringify(entry);
        break;

      case 'plain':
        // Use enhanced plain format for streams
        formatted = this.formatStreamPlain(entry);
        break;

      case 'custom':
        if (!this.formatter) {
          throw new Error('Custom formatter not provided');
        }
        formatted = this.formatter(entry);
        break;

      default:
        formatted = JSON.stringify(entry);
    }

    return formatted;
  }

  /**
   * Format entry as plain text optimized for streams.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Plain text formatted entry
   * @private
   */
  private formatStreamPlain(entry: LogEntry): string {
    const parts: string[] = [];

    // Timestamp
    parts.push(entry.timestamp);

    // Level
    parts.push(`[${entry.level.toUpperCase().padEnd(7)}]`);

    // Logger ID if present
    if (entry.loggerId) {
      parts.push(`[${entry.loggerId}]`);
    }

    // Tags if present
    if (entry.tags && entry.tags.length > 0) {
      parts.push(`[${entry.tags.join(',')}]`);
    }

    // Message
    parts.push(entry.plainMessage || entry.message);

    // Context as inline JSON if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`context=${JSON.stringify(entry.context)}`);
    }

    // Error details if present
    if (entry.error) {
      parts.push(`error="${entry.error.message}"`);
      if (entry.error.code) {
        parts.push(`code=${entry.error.code}`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Flush any buffered data in the stream.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async flush(): Promise<void> {
    if (!this.stream || !this.streamReady) {
      return;
    }

    // Wait for any pending writes
    if (this.writeQueue.length > 0) {
      await new Promise<void>((resolve) => {
        const checkQueue = () => {
          if (this.writeQueue.length === 0) {
            resolve();
          } else {
            setTimeout(checkQueue, 10);
          }
        };
        checkQueue();
      });
    }

    // Some streams have a flush method
    if (typeof (this.stream as any).flush === 'function') {
      await new Promise<void>((resolve, reject) => {
        (this.stream as any).flush((error: Error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  }

  /**
   * Close the stream transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Remove event listeners only if stream exists
    if (this.stream) {
      for (const [event, handler] of Object.entries(this.streamListeners)) {
        if (handler) {
          this.stream.removeListener(event, handler);
        }
      }
    }

    // Clear write queue
    const error = new Error('Transport closing');
    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift();
      if (item) {
        item.reject(error);
      }
    }

    // Close stream if configured and stream exists
    if (this.autoClose && this.stream && !this.streamEnded) {
      await new Promise<void>((resolve, reject) => {
        // Fix: stream.end() callback signature should not expect error parameter
        this.stream!.end(() => {
          resolve();
        });
        
        // Handle potential errors via error event
        const errorHandler = (error: Error) => {
          this.stream?.removeListener('error', errorHandler);
          reject(error);
        };
        this.stream!.once('error', errorHandler);
      });
    }

    this.streamReady = false;
  }

  /**
   * Get transport statistics with stream-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add stream-specific stats
    stats.custom = {
      ...stats.custom,
      streamReady: this.streamReady,
      streamEnded: this.streamEnded,
      streamErrored: this.streamErrored,
      writeQueueLength: this.writeQueue.length,
      backpressure: this.writeQueue.length > 0,
      encoding: this.encoding,
      autoClose: this.autoClose,
    };

    return stats;
  }

  /**
   * Get the underlying stream (for advanced usage).
   * 
   * @returns {NodeJS.WritableStream} The wrapped stream
   */
  public getStream(): NodeJS.WritableStream {
    if (!this.stream) {
      throw new Error('Stream is not initialized');
    }
    return this.stream;
  }

  /**
   * Check if the stream is currently writable.
   * 
   * @returns {boolean} True if stream can accept writes
   */
  public isWritable(): boolean {
    return this.streamReady && 
           !this.streamEnded && 
           !this.streamErrored && 
           this.stream?.writable === true;
  }
}

/**
 * Factory function to create a stream transport with common defaults.
 * 
 * @param {NodeJS.WritableStream} stream - Target writable stream
 * @param {Partial<StreamTransportOptions>} [options={}] - Transport options
 * @returns {StreamTransport} Configured stream transport
 */
export function createStreamTransport(
  stream: NodeJS.WritableStream,
  options: Partial<StreamTransportOptions> = {}
): StreamTransport {
  return new StreamTransport({
    name: 'stream',
    enabled: true,
    level: 'info',
    format: 'plain',
    encoding: 'utf8',
    ...options,
    stream,
  } as StreamTransportOptions);
}
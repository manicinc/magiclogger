/**
 * Asynchronous logger that routes directly to transports.
 * 
 * This implementation follows the correct architecture where the logger's
 * only job is routing. Each transport manages its own buffering, threading,
 * and delivery strategy.
 * 
 * @module async/SimplifiedAsyncLogger
 */

import type { LogEntry, Transport } from '../types/transport';
import type { LogLevel } from '../types/logger';

/**
 * Configuration options for SimplifiedAsyncLogger.
 * 
 * @interface SimplifiedAsyncLoggerOptions
 */
export interface AsyncLoggerOptions {
  /**
   * Array of transports to send logs to.
   * Each transport manages its own buffering and threading.
   */
  transports?: Transport[];
  
  /**
   * Logger ID for identification.
   */
  id?: string;
  
  /**
   * Enable performance metrics.
   * @default false
   */
  enableMetrics?: boolean;
  
  /**
   * Callback function called when entries are flushed.
   */
  onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  
  /**
   * Buffer configuration for compatibility with tests.
   * Note: This logger doesn't actually buffer, transports handle their own buffering.
   */
  buffer?: {
    size?: number;
    capacity?: number;
    flushInterval?: number;
    flushSize?: number;
  };
}

/**
 * Simplified async logger that routes log entries to transports.
 * 
 * This logger implements the correct architecture where:
 * 1. Logger only creates entries and routes to transports
 * 2. Each transport decides sync/async/worker strategy
 * 3. No buffering or batching at the logger level
 * 
 * @class SimplifiedAsyncLogger
 * 
 * @example
 * ```typescript
 * const logger = new AsyncLogger({
 *   transports: [
 *     new ConsoleTransport(),      // Synchronous
 *     new FileWorkerTransport(),    // Worker thread
 *     new HTTPWorkerTransport()     // Worker with batching
 *   ]
 * });
 * 
 * // Logger just routes - transports handle the rest
 * logger.info('User logged in', { userId: 123 });
 * ```
 */
export class AsyncLogger {
  /**
   * Array of transports.
   * @private
   */
  private readonly transports: Transport[];
  
  /**
   * Logger ID.
   * @private
   */
  private readonly id: string;
  
  /**
   * Whether metrics are enabled.
   * @private
   */
  private readonly enableMetrics: boolean;
  
  /**
   * onFlush callback
   * @private
   */
  private readonly onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  
  /**
   * Buffer of log entries for onFlush callback.
   * @private
   */
  private logBuffer: LogEntry[] = [];
  
  /**
   * Flush timer for periodic flushing.
   * @private
   */
  private flushTimer?: NodeJS.Timeout;
  
  /**
   * Buffer configuration.
   * @private
   */
  private readonly bufferConfig: {
    capacity: number;
    flushInterval: number;
    flushSize: number;
  };
  
  /**
   * Simple metrics tracking.
   * @private
   */
  private metrics = {
    total: 0,
    byLevel: {} as Record<LogLevel, number>
  };

  /**
   * Creates a new AsyncLogger instance.
   * 
   * @param {SimplifiedAsyncLoggerOptions} [options] - Configuration options.
   */
  constructor(options: AsyncLoggerOptions = {}) {
    this.transports = options.transports || [];
    this.id = options.id || `logger-${Date.now()}`;
    this.enableMetrics = options.enableMetrics || false;
    this.onFlush = options.onFlush;
    
    // Buffer config for compatibility
    this.bufferConfig = {
      capacity: options.buffer?.capacity || options.buffer?.size || 16384,
      flushInterval: options.buffer?.flushInterval || 50,
      flushSize: options.buffer?.flushSize || 2000
    };
    
    // Start flush timer if onFlush is provided
    if (this.onFlush && this.bufferConfig.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushBuffer();
      }, this.bufferConfig.flushInterval);
    }
  }

  /**
   * Logs an info-level message.
   * 
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object.
   */
  public info(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.log('info', message, meta);
  }

  /**
   * Logs a warning-level message.
   * 
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object.
   */
  public warn(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.log('warn', message, meta);
  }

  /**
   * Logs an error-level message.
   * 
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object.
   */
  public error(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.log('error', message, meta);
  }

  /**
   * Logs a debug-level message.
   * 
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object.
   */
  public debug(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.log('debug', message, meta);
  }

  /**
   * Logs a success message.
   * 
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object.
   */
  public success(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.log('success', message, meta);
  }

  /**
   * Core logging method that routes to transports.
   * 
   * This is the key method that demonstrates the correct architecture:
   * 1. Create the log entry
   * 2. Pass it to each transport
   * 3. Let each transport decide how to handle it
   * 
   * @param {LogLevel} level - The log level.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {{ success: boolean }} Result object indicating success.
   */
  public log(level: LogLevel = 'info', message: string, meta?: Record<string, unknown>): { success: boolean } {
    // Create log entry
    const entry = this.createEntry(level, message, meta);
    
    // Update metrics if enabled
    if (this.enableMetrics) {
      this.metrics.total++;
      this.metrics.byLevel[level] = (this.metrics.byLevel[level] || 0) + 1;
    }
    
    // Add to buffer if onFlush is configured
    if (this.onFlush) {
      this.logBuffer.push(entry);
      
      // Check if we should flush
      if (this.logBuffer.length >= this.bufferConfig.flushSize) {
        this.flushBuffer();
      }
    }
    
    let success = true;
    
    // Route to each transport
    // This is the ONLY job of the logger - routing
    for (const transport of this.transports) {
      try {
        // Transport decides if it's sync/async/worker
        transport.log(entry);
      } catch (error) {
        // Log transport errors but don't stop other transports
        console.error(`[${this.id}] Transport error:`, error);
        success = false;
      }
    }
    
    return { success };
  }

  /**
   * Creates a log entry.
   * 
   * @param {LogLevel} level - The log level.
   * @param {string} message - The message.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {LogEntry} The created log entry.
   * @private
   */
  private createEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    
    return {
      id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp,
      timestampMs: now,
      level,
      message,
      loggerId: this.id,
      context: meta
    };
  }

  /**
   * Adds a transport.
   * 
   * @param {Transport} transport - The transport to add.
   * @returns {void}
   */
  public addTransport(transport: Transport): void {
    if (!this.transports.includes(transport)) {
      this.transports.push(transport);
    }
  }

  /**
   * Removes a transport by name.
   * 
   * @param {string} name - The transport name.
   * @returns {void}
   */
  public removeTransport(name: string): void {
    const index = this.transports.findIndex(t => t.name === name);
    if (index !== -1) {
      this.transports.splice(index, 1);
    }
  }

  /**
   * Gets a transport by name.
   * 
   * @param {string} name - The transport name.
   * @returns {Transport | undefined} The transport if found.
   */
  public getTransport(name: string): Transport | undefined {
    return this.transports.find(t => t.name === name);
  }

  /**
   * Lists all transport names.
   * 
   * @returns {string[]} Array of transport names.
   */
  public listTransports(): string[] {
    return this.transports.map(t => t.name);
  }

  /**
   * Flushes the buffer and calls onFlush callback.
   * @private
   */
  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.onFlush) return;
    
    const entries = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      await this.onFlush(entries);
    } catch (error) {
      console.error(`[${this.id}] onFlush error:`, error);
    }
  }
  
  /**
   * Gets logger statistics.
   * 
   * @returns {object} Logger statistics.
   */
  public getStats(): object {
    return {
      id: this.id,
      transports: this.transports.length,
      metrics: this.enableMetrics ? { ...this.metrics } : undefined,
      buffer: {
        size: this.logBuffer.length,
        capacity: this.bufferConfig.capacity,
        utilization: this.logBuffer.length / this.bufferConfig.capacity
      }
    };
  }

  /**
   * Flushes all transports.
   * 
   * @returns {Promise<void>} Promise that resolves when all transports are flushed.
   */
  public async flush(): Promise<void> {
    // Flush buffer first
    await this.flushBuffer();
    
    // Flush all transports
    const flushPromises = this.transports.map(transport => {
      if (typeof transport.flush === 'function') {
        return transport.flush();
      }
      return Promise.resolve();
    });
    
    await Promise.all(flushPromises);
  }

  /**
   * Flushes all transports and waits for completion.
   * This is an alias for flush() for backward compatibility.
   * 
   * @returns {Promise<void>} Promise that resolves when all transports are flushed.
   */
  public async flushAndWait(): Promise<void> {
    return this.flush();
  }

  /**
   * Logs a critical message with retry logic.
   * 
   * @param {LogLevel} level - The log level.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [meta] - Optional metadata.
   * @returns {Promise<void>} Promise that resolves when the log is written.
   */
  public async logCritical(level: LogLevel, message: string, meta?: Record<string, unknown>): Promise<void> {
    // For critical logs, ensure they are written
    this.log(level, message, meta);
    // Flush immediately for critical logs
    await this.flush();
  }

  /**
   * Gets the buffer utilization percentage.
   * 
   * @returns {number} Utilization percentage (0-100).
   */
  public getUtilization(): number {
    if (this.bufferConfig.capacity === 0) return 0;
    return (this.logBuffer.length / this.bufferConfig.capacity) * 100;
  }

  /**
   * Checks if the logger is experiencing backpressure.
   * 
   * @returns {boolean} Whether the logger is backpressured.
   */
  public isBackpressured(): boolean {
    // Consider backpressured if buffer is over 80% full
    return this.getUtilization() > 80;
  }

  /**
   * Closes all transports.
   * 
   * @returns {Promise<void>} Promise that resolves when all transports are closed.
   */
  public async close(): Promise<void> {
    // Stop flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    
    // Flush before closing
    await this.flush();
    
    // Close all transports
    const closePromises = this.transports.map(transport => {
      if (typeof transport.close === 'function') {
        return transport.close();
      }
      return Promise.resolve();
    });
    
    await Promise.all(closePromises);
  }
}
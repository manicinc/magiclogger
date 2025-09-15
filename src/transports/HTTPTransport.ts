/**
 * @fileoverview HTTP Transport with Worker Threads
 *
 * Production-ready HTTP transport that uses a dedicated worker thread
 * for all network operations, ensuring zero blocking of the main thread.
 *
 * Key features:
 * - Batching in worker thread
 * - Automatic retries with exponential backoff
 * - Compression support
 * - Circuit breaker pattern
 * - Zero main thread blocking
 *
 * @module transports/HTTPTransport
 */

import { Worker } from 'worker_threads';
import { Transport } from './base/Transport';
import type { LogEntry } from '../types/transport';

/**
 * Configuration options for HTTPWorkerTransport.
 *
 * @interface HTTPTransportOptions
 * @extends {TransportOptions}
 */
export interface HTTPTransportOptions {
  /**
   * Transport name for identification.
   * @default 'http-worker'
   */
  name?: string;

  /**
   * Whether the transport is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * HTTP endpoint URL for log submission.
   * @example 'https://logs.example.com/api/logs'
   */
  endpoint?: string;

  /**
   * Alias for endpoint for backward compatibility.
   * @example 'https://logs.example.com/api/logs'
   */
  url?: string;

  /**
   * HTTP method to use.
   * @default 'POST'
   */
  method?: 'POST' | 'PUT' | 'PATCH';

  /**
   * Custom HTTP headers.
   * @example { 'Authorization': 'Bearer token', 'X-API-Key': 'key' }
   */
  headers?: Record<string, string>;

  /**
   * Number of logs to batch before sending.
   * Higher values reduce network overhead but increase latency.
   * @default 100
   */
  batchSize?: number;

  /**
   * Maximum time to wait before flushing batch (milliseconds).
   * Ensures logs are sent even if batch size isn't reached.
   * @default 5000
   */
  flushInterval?: number;

  /**
   * Maximum retries for failed requests.
   * Uses exponential backoff between retries.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds.
   * Doubles with each retry (exponential backoff).
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable gzip compression for request body.
   * Reduces bandwidth but adds CPU overhead in worker.
   * @default false
   */
  compress?: boolean;

  /**
   * Maximum size of the internal buffer in worker.
   * Older entries are dropped when exceeded.
   * @default 10000
   */
  maxBufferSize?: number;

  /**
   * Circuit breaker threshold.
   * Opens circuit after this many consecutive failures.
   * @default 5
   */
  circuitBreakerThreshold?: number;

  /**
   * Circuit breaker reset timeout in milliseconds.
   * Time to wait before attempting to close circuit.
   * @default 60000
   */
  circuitBreakerResetTimeout?: number;
}

/**
 * HTTP transport that uses a worker thread for all network operations.
 *
 * This transport ensures zero blocking of the main thread by delegating
 * all CPU and I/O intensive operations to a dedicated worker thread.
 * The worker handles batching, compression, serialization, and HTTP requests.
 *
 * @class HTTPWorkerTransport
 * @extends {Transport}
 *
 * @example Basic Usage
 * ```typescript
 * const httpTransport = new HTTPWorkerTransport({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   batchSize: 100,
 *   flushInterval: 5000
 * });
 *
 * // Logs are automatically batched and sent
 * httpTransport.log(entry);  // Non-blocking
 * ```
 *
 * @example With Authentication
 * ```typescript
 * const httpTransport = new HTTPWorkerTransport({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   headers: {
 *     'Authorization': 'Bearer ' + process.env.LOG_API_TOKEN,
 *     'Content-Type': 'application/json'
 *   },
 *   compress: true,  // Enable compression
 *   maxRetries: 5,   // More retries for critical logs
 *   timeout: 60000   // Longer timeout
 * });
 * ```
 *
 * @example With Circuit Breaker
 * ```typescript
 * const httpTransport = new HTTPWorkerTransport({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   circuitBreakerThreshold: 3,      // Open after 3 failures
 *   circuitBreakerResetTimeout: 30000 // Try again after 30s
 * });
 * ```
 */
export class HTTPTransport extends Transport {
  /**
   * Worker thread instance.
   * @private
   */
  private worker: Worker | null = null;

  /**
   * Transport configuration.
   * @private
   * @readonly
   */
  private readonly config: Required<Omit<HTTPTransportOptions, 'enabled' | 'url'>> & {
    enabled?: boolean;
    url?: string;
  };

  /**
   * Whether the worker is ready to accept logs.
   * @private
   */
  private ready = false;

  /**
   * Queue for entries while worker is initializing.
   * @private
   */
  private initQueue: LogEntry[] = [];

  /**
   * Creates a new HTTPWorkerTransport instance.
   *
   * @param {HTTPTransportOptions} options - Transport configuration
   * @throws {Error} If endpoint is not provided or invalid
   */
  constructor(options: HTTPTransportOptions) {
    super({
      name: options.name || 'http-worker',
      enabled: options.enabled !== undefined ? options.enabled : true,
    });

    // Support both 'endpoint' and 'url' properties
    const endpoint = options.endpoint || options.url;
    if (!endpoint) {
      throw new Error('HTTPWorkerTransport requires an endpoint');
    }

    // Apply defaults - explicitly type the config object
    this.config = {
      name: options.name || 'http-worker',
      endpoint: endpoint,
      method: options.method || 'POST',
      headers: options.headers || {},
      batchSize: options.batchSize || 100,
      flushInterval: options.flushInterval || 5000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
      compress: options.compress || false,
      maxBufferSize: options.maxBufferSize || 10000,
      circuitBreakerThreshold: options.circuitBreakerThreshold || 5,
      circuitBreakerResetTimeout: options.circuitBreakerResetTimeout || 60000,
      // Optional properties that may not be present
      enabled: options.enabled,
      url: options.url,
    } as Required<Omit<HTTPTransportOptions, 'enabled' | 'url'>> & {
      enabled?: boolean;
      url?: string;
    };

    // Lazy initialization - worker will be created on first use
  }

  /**
   * Initializes the worker thread with inline code.
   *
   * The worker handles:
   * - Batching of log entries
   * - JSON serialization
   * - Compression (if enabled)
   * - HTTP requests with retries
   * - Circuit breaker logic
   *
   * @private
   */
  private initializeWorker(): void {
    const workerCode = `
      const { parentPort } = require('worker_threads');
      const http = require('http');
      const https = require('https');
      const zlib = require('zlib');
      const { promisify } = require('util');
      const { URL } = require('url');
      
      const gzip = promisify(zlib.gzip);
      
      /**
       * Worker implementation for HTTP transport.
       * All heavy operations happen here, not on main thread.
       */
      class HTTPWorker {
        constructor() {
          this.batch = [];
          this.config = {};
          this.flushTimer = null;
          this.stats = {
            sent: 0,
            failed: 0,
            retried: 0,
            dropped: 0
          };
          
          // Circuit breaker state
          this.circuitBreaker = {
            state: 'closed', // closed, open, half-open
            failures: 0,
            lastFailTime: null,
            nextAttempt: null
          };
        }
        
        /**
         * Initialize worker with configuration.
         */
        initialize(config) {
          this.config = config;
          
          // Parse URL once
          this.url = new URL(config.endpoint);
          this.client = this.url.protocol === 'https:' ? https : http;
          
          // Start flush timer
          if (config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
              this.flush();
            }, config.flushInterval);
          }
        }
        
        /**
         * Add entry to batch and flush if needed.
         */
        addEntry(entry) {
          // Check circuit breaker
          if (this.circuitBreaker.state === 'open') {
            const now = Date.now();
            if (now < this.circuitBreaker.nextAttempt) {
              // Still in timeout, drop the entry
              this.stats.dropped++;
              return;
            }
            // Try half-open
            this.circuitBreaker.state = 'half-open';
          }
          
          // Add to batch
          this.batch.push(entry);
          
          // Check buffer limit
          if (this.batch.length > this.config.maxBufferSize) {
            // Drop oldest entries
            const toDrop = this.batch.length - this.config.maxBufferSize;
            this.batch.splice(0, toDrop);
            this.stats.dropped += toDrop;
          }
          
          // Check if we should flush
          if (this.batch.length >= this.config.batchSize) {
            this.flush();
          }
        }
        
        /**
         * Flush current batch to HTTP endpoint.
         */
        async flush() {
          if (this.batch.length === 0) return;
          
          // Take current batch and clear
          const entries = this.batch;
          this.batch = [];
          
          try {
            await this.sendBatch(entries);
            this.stats.sent += entries.length;
            
            // Reset circuit breaker on success
            if (this.circuitBreaker.state === 'half-open') {
              this.circuitBreaker.state = 'closed';
              this.circuitBreaker.failures = 0;
            }
          } catch (error) {
            this.stats.failed += entries.length;
            this.handleFailure(entries, error);
          }
        }
        
        /**
         * Send batch with retries and compression.
         */
        async sendBatch(entries, retryCount = 0) {
          // Serialize to JSON
          const json = JSON.stringify({ logs: entries });
          
          // Compress if configured
          let body = Buffer.from(json);
          const headers = { ...this.config.headers };
          
          if (this.config.compress) {
            body = await gzip(body);
            headers['Content-Encoding'] = 'gzip';
          }
          
          headers['Content-Length'] = body.length;
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
          
          // Make request
          return new Promise((resolve, reject) => {
            const req = this.client.request({
              hostname: this.url.hostname,
              port: this.url.port,
              path: this.url.pathname + this.url.search,
              method: this.config.method,
              headers,
              timeout: this.config.timeout
            });
            
            req.on('response', (res) => {
              // Consume response body
              res.on('data', () => {});
              res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  resolve();
                } else if (res.statusCode >= 500 && retryCount < this.config.maxRetries) {
                  // Server error, retry
                  this.stats.retried += entries.length;
                  setTimeout(() => {
                    this.sendBatch(entries, retryCount + 1)
                      .then(resolve)
                      .catch(reject);
                  }, this.config.retryDelay * Math.pow(2, retryCount));
                } else {
                  reject(new Error(\`HTTP \${res.statusCode}: \${res.statusMessage}\`));
                }
              });
            });
            
            req.on('error', (error) => {
              if (retryCount < this.config.maxRetries) {
                this.stats.retried += entries.length;
                setTimeout(() => {
                  this.sendBatch(entries, retryCount + 1)
                    .then(resolve)
                    .catch(reject);
                }, this.config.retryDelay * Math.pow(2, retryCount));
              } else {
                reject(error);
              }
            });
            
            req.on('timeout', () => {
              req.destroy();
              reject(new Error('Request timeout'));
            });
            
            req.end(body);
          });
        }
        
        /**
         * Handle batch send failure.
         */
        handleFailure(entries, error) {
          // Update circuit breaker
          this.circuitBreaker.failures++;
          this.circuitBreaker.lastFailTime = Date.now();
          
          if (this.circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
            this.circuitBreaker.state = 'open';
            this.circuitBreaker.nextAttempt = 
              Date.now() + this.config.circuitBreakerResetTimeout;
            
            // Drop entries when circuit is open
            this.stats.dropped += entries.length;
            
            parentPort.postMessage({
              type: 'circuit-open',
              message: \`Circuit breaker opened after \${this.circuitBreaker.failures} failures\`
            });
          } else {
            // Re-add to batch for retry later
            this.batch.unshift(...entries);
          }
          
          parentPort.postMessage({
            type: 'error',
            error: error.message,
            stats: this.stats
          });
        }
        
        /**
         * Get current statistics.
         */
        getStats() {
          return {
            ...this.stats,
            batchSize: this.batch.length,
            circuitBreaker: { ...this.circuitBreaker }
          };
        }
        
        /**
         * Close worker and flush remaining.
         */
        async close() {
          // Stop flush timer
          if (this.flushTimer) {
            clearInterval(this.flushTimer);
          }
          
          // Final flush
          await this.flush();
          
          return this.stats;
        }
      }
      
      // Create worker instance
      const worker = new HTTPWorker();
      
      // Handle messages from main thread
      parentPort.on('message', async (msg) => {
        switch (msg.type) {
          case 'init':
            worker.initialize(msg.config);
            parentPort.postMessage({ type: 'ready' });
            break;
            
          case 'log':
            worker.addEntry(msg.entry);
            break;
            
          case 'flush':
            await worker.flush();
            parentPort.postMessage({ type: 'flushed' });
            break;
            
          case 'stats':
            parentPort.postMessage({
              type: 'stats',
              data: worker.getStats()
            });
            break;
            
          case 'close':
            const finalStats = await worker.close();
            parentPort.postMessage({
              type: 'closed',
              stats: finalStats
            });
            break;
        }
      });
    `;

    // Create worker from string
    this.worker = new Worker(workerCode, {
      eval: true,
    });

    // Set up worker event handlers
    this.worker.on('message', msg => {
      switch (msg.type) {
        case 'ready':
          this.ready = true;
          // Process queued entries
          for (const entry of this.initQueue) {
            this.worker?.postMessage({ type: 'log', entry });
          }
          this.initQueue = [];
          break;

        case 'error':
          console.error(`[${this.name}] Worker error:`, msg.error);
          // Stats tracking can be added if needed
          break;

        case 'circuit-open':
          console.warn(`[${this.name}]`, msg.message);
          break;

        case 'stats':
          // Stats received from worker
          break;
      }
    });

    this.worker.on('error', error => {
      console.error(`[${this.name}] Worker thread error:`, error);
    });

    this.worker.on('exit', code => {
      if (code !== 0) {
        console.error(`[${this.name}] Worker stopped with exit code ${code}`);
      }
      this.worker = null;
      this.ready = false;
    });

    // Initialize the worker
    this.worker.postMessage({
      type: 'init',
      config: this.config,
    });
  }

  /**
   * Logs an entry by passing it to the worker thread.
   *
   * This method is non-blocking and returns immediately.
   * The entry is passed to the worker using structured cloning,
   * which is efficient for passing objects between threads.
   *
   * @param {LogEntry} entry - The log entry to send
   * @returns {void}
   * @protected
   * @override
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (!this.worker) {
      this.initializeWorker();
      // Queue entry while worker is initializing
      this.initQueue.push(entry);
      return;
    }

    if (!this.ready) {
      // Queue entry while worker is initializing
      this.initQueue.push(entry);
      return;
    }

    // Pass to worker - uses structured cloning, no serialization here!
    this.worker.postMessage({ type: 'log', entry });
  }

  /**
   * Flushes the worker's batch immediately.
   *
   * Forces the worker to send any buffered logs immediately,
   * regardless of batch size or timer.
   *
   * @returns {Promise<void>} Resolves when flush completes
   * @public
   * @override
   */
  public async flush(): Promise<void> {
    return new Promise(resolve => {
      if (!this.worker || !this.ready) {
        resolve();
        return;
      }

      const handler = (msg: { type: string }) => {
        if (msg.type === 'flushed') {
          this.worker?.off('message', handler);
          resolve();
        }
      };

      this.worker.on('message', handler);
      this.worker.postMessage({ type: 'flush' });

      // Timeout after 10 seconds
      setTimeout(() => {
        this.worker?.off('message', handler);
        resolve();
      }, 10000);
    });
  }

  /**
   * Closes the transport and terminates the worker.
   *
   * Ensures all buffered logs are sent before shutting down.
   *
   * @returns {Promise<void>} Resolves when fully closed
   * @protected
   * @override
   */
  protected async doClose(): Promise<void> {
    if (!this.worker) return;

    return new Promise(resolve => {
      const handler = (msg: { type: string; stats?: any }) => {
        if (msg.type === 'closed') {
          if (msg.stats) {
            console.log(`[${this.name}] Final stats:`, msg.stats);
          }
          this.worker?.terminate();
          this.worker = null;
          resolve();
        }
      };

      this.worker?.on('message', handler);
      this.worker?.postMessage({ type: 'close' });

      // Force terminate after 30 seconds
      setTimeout(() => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        resolve();
      }, 30000);
    });
  }

  /**
   * Initializes the transport.
   *
   * Waits for the worker to be ready before returning.
   *
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   * @override
   */
  protected async doInit(): Promise<void> {
    // Wait for worker to be ready
    if (!this.ready) {
      await new Promise<void>(resolve => {
        const checkReady = () => {
          if (this.ready) {
            resolve();
          } else {
            setTimeout(checkReady, 10);
          }
        };
        checkReady();
      });
    }
  }
}

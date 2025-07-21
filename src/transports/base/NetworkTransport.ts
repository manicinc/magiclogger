// File: src/transports/base/NetworkTransport.ts

import { BatchingTransport } from './BatchingTransport';
import type { 
  NetworkTransportOptions, 
  LogEntry,
  ConnectionState,
  TransportStats 
} from '../../types/transport';

/**
 * Abstract base class for network-based transports.
 * Provides connection management, reconnection logic, offline queuing,
 * and health monitoring for transports that communicate over networks.
 * 
 * @abstract
 * @class NetworkTransport
 * @extends {BatchingTransport}
 */
export abstract class NetworkTransport extends BatchingTransport {
  /**
   * Network endpoint URL.
   * @protected
   */
  protected url: string;

  /**
   * Connection timeout in milliseconds.
   * @protected
   */
  protected connectionTimeout: number;

  /**
   * Request timeout in milliseconds.
   * @protected
   */
  protected requestTimeout: number;

  /**
   * Maximum reconnection attempts.
   * @protected
   */
  protected maxReconnectAttempts: number;

  /**
   * Reconnection delay in milliseconds.
   * @protected
   */
  protected reconnectDelay: number;

  /**
   * Current connection state.
   * @protected
   */
  protected connectionState: ConnectionState = 'disconnected';

  /**
   * Active connection instance.
   * @protected
   */
  protected connection: unknown;

  /**
   * Current reconnection attempt.
   * @private
   */
  private reconnectAttempt = 0;

  /**
   * Reconnection timer.
   * @private
   */
  private reconnectTimer?: NodeJS.Timeout;

  /**
   * Queue for entries during disconnection.
   * @private
   */
  private offlineQueue: LogEntry[] = [];

  /**
   * Maximum offline queue size.
   * @private
   */
  private readonly maxOfflineQueueSize: number;

  /**
   * Whether to queue entries when offline.
   * @protected
   */
  protected queueWhenOffline: boolean;

  /**
   * Health check interval timer.
   * @private
   */
  private healthCheckTimer?: NodeJS.Timeout;

  /**
   * Health check interval in milliseconds.
   * @protected
   */
  protected healthCheckInterval: number;

  /**
   * Keep-alive interval timer.
   * @private
   */
  private keepAliveTimer?: NodeJS.Timeout;

  /**
   * Keep-alive interval in milliseconds.
   * @protected
   */
  protected keepAliveInterval: number;

  /**
   * Custom headers for requests.
   * @protected
   */
  protected headers?: Record<string, string>;

  /**
   * TLS options for secure connections.
   * @protected
   */
  protected tls?: NetworkTransportOptions['tls'];

  /**
   * Creates a new NetworkTransport instance.
   * 
   * @param {NetworkTransportOptions} options - Transport options
   */
  constructor(options: NetworkTransportOptions) {
    super(options);

    this.url = options.url || '';
    this.connectionTimeout = options.connectionTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 10000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.maxOfflineQueueSize = options.maxOfflineQueueSize || 1000;
    this.queueWhenOffline = options.queueWhenOffline !== false;
    this.healthCheckInterval = options.healthCheckInterval || 60000;
    this.keepAliveInterval = options.keepAliveInterval || 30000;
    this.headers = options.headers;
    this.tls = options.tls;
  }

  /**
   * Initialize the network transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    await super.doInit();
    await this.initializeNetwork();
    this.startHealthCheck();
    this.startKeepAlive();
  }

  /**
   * Initialize network-specific resources.
   * Override in subclasses for custom initialization.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Establish network connection.
   * @private
   */
  private async establishConnection(): Promise<void> {
    try {
      this.connectionState = 'connecting';
      this.emit('connecting');

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout);
      });

      await Promise.race([
        this.connect(),
        timeoutPromise,
      ]);

      this.connectionState = 'connected';
      this.reconnectAttempt = 0;
      this.emit('connected');

      await this.processOfflineQueue();

    } catch (error) {
      this.connectionState = 'disconnected';
      this.handleError(error as Error);
      this.emit('connectionError', error);

      this.scheduleReconnect();
      
      throw error;
    }
  }

  /**
   * Schedule reconnection attempt.
   * @private
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempt,
      });
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempt);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt++;
      this.emit('reconnecting', {
        attempt: this.reconnectAttempt,
        maxAttempts: this.maxReconnectAttempts,
      });

      this.establishConnection().catch(() => {
        // Error already handled in establishConnection
      });
    }, delay);
  }

  /**
   * Process queued entries after reconnection.
   * @private
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    this.emit('processingOfflineQueue', {
      size: queue.length,
    });

    for (const entry of queue) {
      try {
        await this.doLog(entry);
      } catch (error) {
        if (this.queueWhenOffline && this.connectionState !== 'connected') {
          this.queueEntry(entry);
        }
      }
    }
  }

  /**
   * Queue entry when offline.
   * 
   * @param {LogEntry} entry - Entry to queue
   * @private
   */
  private queueEntry(entry: LogEntry): void {
    if (this.offlineQueue.length >= this.maxOfflineQueueSize) {
      this.offlineQueue.shift();
      const droppedOffline = (this.stats.custom?.droppedOffline as number || 0) + 1;
      this.stats.custom = { ...this.stats.custom, droppedOffline };
    }

    this.offlineQueue.push(entry);
    this.stats.queued = this.offlineQueue.length;
  }

  /**
   * Process a batch of entries.
   * Handles offline queuing and connection errors.
   * 
   * @param {LogEntry[]} entries - Batch of entries
   * @returns {Promise<void>} Resolves when processed
   * @protected
   */
  protected async processBatch(entries: LogEntry[]): Promise<void> {
    if (this.connectionState !== 'connected') {
      if (this.queueWhenOffline) {
        entries.forEach(entry => this.queueEntry(entry));
        return;
      } else {
        throw new Error('Transport is not connected');
      }
    }

    try {
      await this.performNetworkRequest(entries);
    } catch (error) {
      if (this.isConnectionError(error as Error)) {
        this.handleDisconnection();
        
        if (this.queueWhenOffline) {
          entries.forEach(entry => this.queueEntry(entry));
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Abstract method for performing network requests.
   * Must be implemented by subclasses to send log entries.
   * 
   * @param {LogEntry[]} entries - Log entries to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   * @abstract
   */
  protected abstract performNetworkRequest(entries: LogEntry[]): Promise<void>;

  /**
   * Handle disconnection.
   * @private
   */
  private handleDisconnection(): void {
    if (this.connectionState === 'connected') {
      this.connectionState = 'disconnected';
      this.emit('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Start health check timer.
   * @private
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval <= 0) return;

    this.healthCheckTimer = setInterval(async () => {
      if (this.connectionState === 'connected') {
        try {
          await this.checkHealth();
        } catch (error) {
          this.handleDisconnection();
        }
      }
    }, this.healthCheckInterval);

    if (this.healthCheckTimer.unref) {
      this.healthCheckTimer.unref();
    }
  }

  /**
   * Start keep-alive timer.
   * @private
   */
  private startKeepAlive(): void {
    if (this.keepAliveInterval <= 0) return;

    this.keepAliveTimer = setInterval(async () => {
      if (this.connectionState === 'connected') {
        try {
          await this.sendKeepAlive();
        } catch (error) {
          // Ignore keep-alive errors
        }
      }
    }, this.keepAliveInterval);

    if (this.keepAliveTimer.unref) {
      this.keepAliveTimer.unref();
    }
  }

  /**
   * Format entries for network transmission.
   * Default implementation returns JSON string.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {unknown} Formatted data
   * @protected
   */
  protected formatForNetwork(entries: LogEntry[]): unknown {
    return JSON.stringify(entries);
  }

  /**
   * Check if error is a connection error.
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} Whether connection error
   * @protected
   */
  protected isConnectionError(error: Error): boolean {
    const connectionErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'ENETUNREACH',
      'EPIPE',
    ];

    return connectionErrors.some(code => 
      error.message.includes(code) || (error as NodeJS.ErrnoException).code === code
    );
  }

  /**
   * Default retry condition.
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} Whether to retry
   * @protected
   */
  protected defaultRetryCondition(error: Error): boolean {
    return this.isConnectionError(error);
  }

  /**
   * Close the transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = undefined;
    }

    if (this.connectionState !== 'disconnected') {
      await this.disconnect();
      this.connectionState = 'disconnected';
    }

    this.offlineQueue = [];

    await super.doClose();
  }

  /**
   * Get connection state.
   * 
   * @returns {ConnectionState} Current state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if transport is healthy.
   * 
   * @returns {Promise<boolean>} Whether healthy
   */
  public async isHealthy(): Promise<boolean> {
    if (this.connectionState !== 'connected') {
      return false;
    }

    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get transport statistics.
   * 
   * @returns {TransportStats} Transport statistics
   */
  public getStats(): TransportStats {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        connectionState: this.connectionState,
        offlineQueueSize: this.offlineQueue.length,
        reconnectAttempts: this.reconnectAttempt,
        droppedOffline: this.stats.custom?.droppedOffline || 0,
      },
    };
  }

  /**
   * Build request headers.
   * 
   * @returns {Promise<Record<string, string>>} Headers
   * @protected
   */
  protected async buildHeaders(): Promise<Record<string, string>> {
    return this.headers || {};
  }

  /**
   * Force reconnection.
   * 
   * @returns {Promise<void>} Resolves when reconnected
   */
  public async reconnect(): Promise<void> {
    if (this.connectionState !== 'disconnected') {
      await this.disconnect();
    }

    this.reconnectAttempt = 0;
    await this.establishConnection();
  }

  /**
   * Send keep-alive signal.
   * Default implementation calls checkHealth.
   * 
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendKeepAlive(): Promise<void> {
    await this.checkHealth();
  }

  // Abstract methods to be implemented by subclasses

  /**
   * Establish connection to the network resource.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @protected
   * @abstract
   */
  protected abstract connect(): Promise<void>;

  /**
   * Disconnect from the network resource.
   * 
   * @returns {Promise<void>} Resolves when disconnected
   * @protected
   * @abstract
   */
  protected abstract disconnect(): Promise<void>;

  /**
   * Send data over the network.
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   * @abstract
   */
  protected abstract sendData(data: unknown): Promise<void>;

  /**
   * Check connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy, rejects if not
   * @protected
   * @abstract
   */
  protected abstract checkHealth(): Promise<void>;
}
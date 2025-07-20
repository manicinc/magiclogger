// File: src/transports/base/NetworkTransport.ts

import { Transport } from './Transport';
import type { 
  NetworkTransportOptions, 
  LogEntry,
  ConnectionState 
} from '../../types/transport';

/**
 * Abstract base class for network-based transports.
 * 
 * Features:
 * - Connection management and pooling
 * - Automatic reconnection with backoff
 * - Network error handling
 * - Connection state tracking
 * - Request queuing during disconnection
 * - Health checking
 * 
 * @abstract
 * @class NetworkTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * class MyNetworkTransport extends NetworkTransport {
 *   protected async connect(): Promise<void> {
 *     this.connection = await createConnection(this.url);
 *   }
 *   
 *   protected async disconnect(): Promise<void> {
 *     await this.connection.close();
 *   }
 *   
 *   protected async sendData(data: any): Promise<void> {
 *     await this.connection.send(data);
 *   }
 * }
 * ```
 */
export abstract class NetworkTransport extends Transport {
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
  protected connection: any;

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
   * Creates a new NetworkTransport instance.
   * 
   * @param {NetworkTransportOptions} options - Transport options
   */
  constructor(options: NetworkTransportOptions) {
    super(options);

    this.url = options.url;
    this.connectionTimeout = options.connectionTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 10000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.maxOfflineQueueSize = options.maxOfflineQueueSize || 1000;
    this.queueWhenOffline = options.queueWhenOffline !== false;
    this.healthCheckInterval = options.healthCheckInterval || 60000;
    this.keepAliveInterval = options.keepAliveInterval || 30000;
  }

  /**
   * Initialize the network transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    await this.establishConnection();
    this.startHealthCheck();
    this.startKeepAlive();
  }

  /**
   * Establish network connection.
   * @private
   */
  private async establishConnection(): Promise<void> {
    try {
      this.connectionState = 'connecting';
      this.emit('connecting');

      // Set connection timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout);
      });

      // Race between connection and timeout
      await Promise.race([
        this.connect(),
        timeoutPromise,
      ]);

      this.connectionState = 'connected';
      this.reconnectAttempt = 0;
      this.emit('connected');

      // Process offline queue
      await this.processOfflineQueue();

    } catch (error) {
      this.connectionState = 'disconnected';
      this.handleError(error as Error);
      this.emit('connectionError', error);

      // Schedule reconnection
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

    // Calculate delay with exponential backoff
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
        // Re-queue on failure
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
      // Drop oldest entry
      const dropped = this.offlineQueue.shift();
      this.stats.custom.droppedOffline = (this.stats.custom.droppedOffline || 0) + 1;
    }

    this.offlineQueue.push(entry);
    this.stats.queued = this.offlineQueue.length;
  }

  /**
   * Log a single entry.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {Promise<void>} Resolves when logged
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (this.connectionState !== 'connected') {
      if (this.queueWhenOffline) {
        this.queueEntry(entry);
        return;
      } else {
        throw new Error('Transport is not connected');
      }
    }

    try {
      // Set request timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
      });

      // Race between send and timeout
      await Promise.race([
        this.sendData(this.formatForNetwork(entry)),
        timeoutPromise,
      ]);

    } catch (error) {
      // Check if connection error
      if (this.isConnectionError(error as Error)) {
        this.handleDisconnection();
        
        if (this.queueWhenOffline) {
          this.queueEntry(entry);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

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
   * Format entry for network transmission.
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {any} Formatted data
   * @protected
   */
  protected formatForNetwork(entry: LogEntry): any {
    // Default implementation - can be overridden
    return JSON.stringify(entry);
  }

  /**
   * Check if error is a connection error.
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} Whether connection error
   * @protected
   */
  protected isConnectionError(error: Error): boolean {
    // Default implementation - can be overridden
    const connectionErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'ENETUNREACH',
      'EPIPE',
    ];

    return connectionErrors.some(code => 
      error.message.includes(code) || (error as any).code === code
    );
  }

  /**
   * Close the transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Stop timers
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

    // Disconnect
    if (this.connectionState !== 'disconnected') {
      await this.disconnect();
      this.connectionState = 'disconnected';
    }

    // Clear offline queue
    this.offlineQueue = [];
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
   * @returns {boolean} Whether healthy
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
   * @returns {object} Transport statistics
   */
  public getStats(): any {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        connectionState: this.connectionState,
        offlineQueueSize: this.offlineQueue.length,
        reconnectAttempts: this.reconnectAttempt,
        droppedOffline: this.stats.custom.droppedOffline || 0,
      },
    };
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
   * @param {any} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   * @abstract
   */
  protected abstract sendData(data: any): Promise<void>;

  /**
   * Check connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   * @abstract
   */
  protected abstract checkHealth(): Promise<void>;

  /**
   * Send keep-alive signal.
   * 
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendKeepAlive(): Promise<void> {
    // Default implementation - can be overridden
    await this.checkHealth();
  }
}
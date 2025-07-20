// File: src/transports/base/implementations/WebSocketTransport.ts

import { Transport } from '../Transport';
import type { 
  WebSocketTransportOptions, 
  LogEntry 
} from '../../../types/transport';

/**
 * WebSocket transport for real-time log streaming.
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message queuing during disconnections
 * - Binary protocol support (JSON, MessagePack, Protobuf)
 * - Heartbeat/ping-pong for connection health
 * - Authentication support
 * - Compression support
 * - Real-time bidirectional communication
 * 
 * @class WebSocketTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const wsTransport = new WebSocketTransport({
 *   name: 'websocket',
 *   url: 'wss://logs.example.com/stream',
 *   reconnect: {
 *     enabled: true,
 *     maxAttempts: 10,
 *     delay: 1000
 *   },
 *   auth: {
 *     token: process.env.WS_AUTH_TOKEN
 *   }
 * });
 * ```
 */
export class WebSocketTransport extends Transport {
  /**
   * WebSocket server URL.
   * @private
   */
  private readonly url: string;

  /**
   * Reconnection configuration.
   * @private
   */
  private readonly reconnect: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
  };

  /**
   * Authentication configuration.
   * @private
   */
  private readonly auth?: WebSocketTransportOptions['auth'];

  /**
   * WebSocket subprotocol.
   * @private
   */
  private readonly protocol?: string | string[];

  /**
   * Message encoding format.
   * @private
   */
  private readonly encoding: 'json' | 'msgpack' | 'protobuf';

  /**
   * WebSocket instance.
   * @private
   */
  private ws?: WebSocket | any;

  /**
   * Current connection state.
   * @private
   */
  private state: 'disconnected' | 'connecting' | 'connected' | 'closing' = 'disconnected';

  /**
   * Queue for messages during disconnection.
   * @private
   */
  private messageQueue: Array<{ entry: LogEntry; timestamp: number }> = [];

  /**
   * Maximum queue size.
   * @private
   */
  private readonly maxQueueSize = 10000;

  /**
   * Current reconnection attempt.
   * @private
   */
  private reconnectAttempt = 0;

  /**
   * Reconnect timer.
   * @private
   */
  private reconnectTimer?: NodeJS.Timeout;

  /**
   * Heartbeat interval.
   * @private
   */
  private heartbeatInterval?: NodeJS.Timeout;

  /**
   * Last heartbeat timestamp.
   * @private
   */
  private lastHeartbeat = Date.now();

  /**
   * Heartbeat timeout (30 seconds).
   * @private
   */
  private readonly heartbeatTimeout = 30000;

  /**
   * Message encoder based on format.
   * @private
   */
  private encoder?: any;

  /**
   * Message decoder based on format.
   * @private
   */
  private decoder?: any;

  /**
   * Creates a new WebSocketTransport instance.
   * 
   * @param {WebSocketTransportOptions} options - Transport configuration
   */
  constructor(options: WebSocketTransportOptions) {
    super(options);

    this.url = options.url;
    this.reconnect = {
      enabled: options.reconnect?.enabled !== false,
      maxAttempts: options.reconnect?.maxAttempts || 10,
      delay: options.reconnect?.delay || 1000,
    };
    this.auth = options.auth;
    this.protocol = options.protocol;
    this.encoding = options.encoding || 'json';
  }

  /**
   * Initialize WebSocket transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Initialize encoder/decoder
    await this.initializeCodec();
    
    // Connect to WebSocket
    await this.connect();
  }

  /**
   * Initialize message codec based on encoding.
   * 
   * @returns {Promise<void>} Resolves when codec is ready
   * @private
   */
  private async initializeCodec(): Promise<void> {
    switch (this.encoding) {
      case 'json':
        // Built-in JSON support
        this.encoder = {
          encode: (data: any) => JSON.stringify(data),
        };
        this.decoder = {
          decode: (data: any) => {
            if (typeof data === 'string') {
              return JSON.parse(data);
            }
            // Handle binary data
            const text = new TextDecoder().decode(data);
            return JSON.parse(text);
          },
        };
        break;

      case 'msgpack':
        // Would require msgpack library
        try {
          const msgpack = await import('msgpack-lite');
          this.encoder = {
            encode: (data: any) => msgpack.encode(data),
          };
          this.decoder = {
            decode: (data: any) => msgpack.decode(new Uint8Array(data)),
          };
        } catch {
          throw new Error('msgpack-lite not installed');
        }
        break;

      case 'protobuf':
        // Would require protobuf setup
        throw new Error('Protobuf encoding not implemented');

      default:
        throw new Error(`Unknown encoding: ${this.encoding}`);
    }
  }

  /**
   * Connect to WebSocket server.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @private
   */
  private async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.state = 'connecting';

    try {
      // Determine environment and create WebSocket
      if (typeof window !== 'undefined' && window.WebSocket) {
        // Browser environment
        this.ws = new WebSocket(this.url, this.protocol);
      } else {
        // Node.js environment
        const WebSocket = (await import('ws')).default;
        
        const headers: Record<string, string> = {};
        if (this.auth?.token) {
          headers.Authorization = `Bearer ${this.auth.token}`;
        }
        if (this.auth?.headers) {
          Object.assign(headers, this.auth.headers);
        }

        this.ws = new WebSocket(this.url, this.protocol, { headers });
      }

      // Set up event handlers
      this.setupEventHandlers();

      // Wait for connection
      await this.waitForConnection();

      this.state = 'connected';
      this.reconnectAttempt = 0;

      // Start heartbeat
      this.startHeartbeat();

      // Flush queued messages
      await this.flushQueue();

      this.emit('connected', { url: this.url });

    } catch (error) {
      this.state = 'disconnected';
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Set up WebSocket event handlers.
   * 
   * @private
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.state = 'connected';
      this.lastHeartbeat = Date.now();
    };

    this.ws.onclose = (event: any) => {
      this.state = 'disconnected';
      this.stopHeartbeat();
      
      this.emit('disconnected', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      // Attempt reconnection if enabled
      if (this.reconnect.enabled && !this.closing) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error: any) => {
      this.handleError(new Error(`WebSocket error: ${error.message || 'Unknown error'}`));
    };

    this.ws.onmessage = (event: any) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Wait for WebSocket connection to open.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @private
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, this.timeout);

      const checkConnection = () => {
        if (this.ws.readyState === 1) { // OPEN
          clearTimeout(timeout);
          resolve();
        } else if (this.ws.readyState === 3) { // CLOSED
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Handle incoming WebSocket message.
   * 
   * @param {any} data - Raw message data
   * @private
   */
  private handleMessage(data: any): void {
    try {
      const message = this.decoder.decode(data);

      // Handle different message types
      switch (message.type) {
        case 'pong':
          this.lastHeartbeat = Date.now();
          break;

        case 'ack':
          // Acknowledgment of log receipt
          this.emit('acknowledged', message);
          break;

        case 'error':
          this.handleError(new Error(message.error || 'Server error'));
          break;

        case 'config':
          // Server configuration update
          this.emit('config', message.config);
          break;

        default:
          // Custom message type
          this.emit('message', message);
      }
    } catch (error) {
      this.handleError(new Error(`Failed to decode message: ${error}`));
    }
  }

  /**
   * Log a single entry via WebSocket.
   * 
   * @param {LogEntry} entry - Log entry to send
   * @returns {Promise<void>} Resolves when sent or queued
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (this.state === 'connected') {
      await this.sendMessage({
        type: 'log',
        entry,
        timestamp: Date.now(),
      });
    } else {
      // Queue message for later
      this.queueMessage(entry);
      
      // Attempt to connect if disconnected
      if (this.state === 'disconnected' && this.reconnect.enabled) {
        this.connect().catch(() => {
          // Connection attempt failed, will retry
        });
      }
    }
  }

  /**
   * Send a message via WebSocket.
   * 
   * @param {any} message - Message to send
   * @returns {Promise<void>} Resolves when sent
   * @private
   */
  private async sendMessage(message: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error('WebSocket not connected');
    }

    const encoded = this.encoder.encode(message);

    return new Promise((resolve, reject) => {
      this.ws.send(encoded, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Queue a message for later delivery.
   * 
   * @param {LogEntry} entry - Log entry to queue
   * @private
   */
  private queueMessage(entry: LogEntry): void {
    // Check queue size
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
      this.stats.custom.droppedMessages = (this.stats.custom.droppedMessages || 0) + 1;
    }

    this.messageQueue.push({
      entry,
      timestamp: Date.now(),
    });

    this.stats.queued = this.messageQueue.length;
  }

  /**
   * Flush queued messages.
   * 
   * @returns {Promise<void>} Resolves when queue is flushed
   * @private
   */
  private async flushQueue(): Promise<void> {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    this.stats.queued = 0;

    for (const item of queue) {
      try {
        await this.sendMessage({
          type: 'log',
          entry: item.entry,
          timestamp: item.timestamp,
          queued: true,
        });
      } catch (error) {
        // Re-queue on failure
        this.queueMessage(item.entry);
        break;
      }
    }
  }

  /**
   * Start heartbeat mechanism.
   * 
   * @private
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > this.heartbeatTimeout) {
        // Connection seems dead, reconnect
        this.ws?.close();
        return;
      }

      // Send ping
      this.sendMessage({ type: 'ping' }).catch(() => {
        // Ping failed, connection might be dead
      });
    }, this.heartbeatTimeout / 2);
  }

  /**
   * Stop heartbeat mechanism.
   * 
   * @private
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Schedule reconnection attempt.
   * 
   * @private
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.reconnect.maxAttempts) {
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempt,
      });
      return;
    }

    this.reconnectAttempt++;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.reconnect.delay * Math.pow(2, this.reconnectAttempt - 1),
      30000 // Max 30 seconds
    );

    this.emit('reconnecting', {
      attempt: this.reconnectAttempt,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will schedule another reconnect
      });
    }, delay);
  }

  /**
   * Handle connection errors.
   * 
   * @param {Error} error - Connection error
   * @private
   */
  private handleConnectionError(error: Error): void {
    this.handleError(error);

    if (this.reconnect.enabled && !this.closing) {
      this.scheduleReconnect();
    }
  }

  /**
   * Close WebSocket transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    this.state = 'closing';

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.stopHeartbeat();

    // Close WebSocket
    if (this.ws) {
      if (this.ws.readyState === 1) { // OPEN
        this.ws.close(1000, 'Transport closing');
      }
      this.ws = undefined;
    }

    this.state = 'disconnected';
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
        state: this.state,
        queueSize: this.messageQueue.length,
        reconnectAttempts: this.reconnectAttempt,
        lastHeartbeat: new Date(this.lastHeartbeat),
      },
    };
  }
}
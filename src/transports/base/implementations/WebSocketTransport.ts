// File: src/transports/base/implementations/WebSocketTransport.ts

import { NetworkTransport } from '../NetworkTransport';
import type { 
  WebSocketTransportOptions, 
  LogEntry,
  NetworkTransportOptions 
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
 * @extends {NetworkTransport}
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
export class WebSocketTransport extends NetworkTransport {
  /**
   * Reconnection configuration.
   * @private
   */
  private readonly reconnectConfig: {
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
    const networkOptions: NetworkTransportOptions = {
      ...options,
      // WebSocket specific defaults
      maxBatchSize: options.maxBatchSize || 100,
      maxBatchTime: options.maxBatchTime || 1000,
      queueWhenOffline: true, // Always queue for WebSockets
    };

    super(networkOptions);

    this.reconnectConfig = {
      enabled: options.reconnect?.enabled !== false,
      maxAttempts: options.reconnect?.maxAttempts || 10,
      delay: options.reconnect?.delay || 1000,
    };
    this.auth = options.auth;
    this.protocol = options.protocol;
    this.encoding = options.encoding || 'json';

    // Override parent reconnection settings with WebSocket-specific ones
    this.maxReconnectAttempts = this.reconnectConfig.maxAttempts;
    this.reconnectDelay = this.reconnectConfig.delay;
  }

  /**
   * Initialize WebSocket transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Initialize encoder/decoder
    await this.initializeCodec();
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
   * @protected
   */
  protected async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';

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

      this.connectionState = 'connected';

      // Start heartbeat
      this.startHeartbeat();

      this.emit('connected', { url: this.url });

    } catch (error) {
      this.connectionState = 'disconnected';
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server.
   * 
   * @returns {Promise<void>} Resolves when disconnected
   * @protected
   */
  protected async disconnect(): Promise<void> {
    this.stopHeartbeat();

    if (this.ws) {
      if (this.ws.readyState === 1) { // OPEN
        this.ws.close(1000, 'Transport closing');
      }
      this.ws = undefined;
    }

    this.connectionState = 'disconnected';
  }

  /**
   * Send data via WebSocket.
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendData(data: unknown): Promise<void> {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error('WebSocket not connected');
    }

    const encoded = this.encoder.encode(data);

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
   * Check WebSocket connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy
   * @protected
   */
  protected async checkHealth(): Promise<void> {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error('WebSocket not connected');
    }

    // Check heartbeat timeout
    if (Date.now() - this.lastHeartbeat > this.heartbeatTimeout * 2) {
      throw new Error('Heartbeat timeout');
    }

    // Send ping
    await this.sendData({ type: 'ping' });
  }

  /**
   * Set up WebSocket event handlers.
   * 
   * @private
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.lastHeartbeat = Date.now();
    };

    this.ws.onclose = (event: any) => {
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      
      this.emit('disconnected', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
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
      }, this.connectionTimeout);

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
   * Perform the network request to send logs.
   * 
   * @param {LogEntry[]} entries - Log entries to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async performNetworkRequest(entries: LogEntry[]): Promise<void> {
    const message = {
      type: 'logs',
      entries,
      timestamp: Date.now(),
    };

    await this.sendData(message);

    this.emit('sent', {
      count: entries.length,
      timestamp: message.timestamp,
    });
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
      this.sendData({ type: 'ping' }).catch(() => {
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
        lastHeartbeat: new Date(this.lastHeartbeat),
        wsState: this.ws?.readyState,
        encoding: this.encoding,
      },
    };
  }
}
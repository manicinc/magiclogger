// File: src/transports/implementations/WebSocketTransport.ts

import { Transport } from '../Transport';
import type { WebSocketTransportOptions, LogEntry, TransportStats } from '../../../types/transport';

/**
 * WebSocket message types for protocol communication.
 */
enum WSMessageType {
  LOG = 'log',
  LOG_BATCH = 'log_batch',
  ACK = 'ack',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong',
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
}

/**
 * Interface for WebSocket protocol messages.
 */
interface WSMessage {
  id: string;
  type: WSMessageType;
  timestamp: number;
  data?: any;
  error?: string;
}

/**
 * Transport that streams logs over WebSocket connections.
 * 
 * The WebSocketTransport provides real-time log streaming with:
 * - Automatic reconnection with exponential backoff
 * - Message acknowledgment and delivery guarantees
 * - Authentication support
 * - Binary and text message encoding
 * - Heartbeat/keepalive mechanism
 * - Message queuing during disconnections
 * 
 * This transport is ideal for:
 * - Real-time log monitoring dashboards
 * - Live debugging and troubleshooting
 * - Event streaming applications
 * - Low-latency log delivery
 * 
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * const wsTransport = new WebSocketTransport({
 *   name: 'websocket',
 *   url: 'wss://logs.example.com/stream',
 *   auth: {
 *     token: 'your-auth-token'
 *   },
 *   reconnect: {
 *     enabled: true,
 *     maxAttempts: 10,
 *     delay: 1000
 *   }
 * });
 * 
 * wsTransport.on('connected', () => {
 *   console.log('WebSocket connected');
 * });
 * 
 * await wsTransport.log({
 *   level: 'info',
 *   message: 'Real-time log message'
 * });
 * ```
 */
export class WebSocketTransport extends Transport {
  /**
   * WebSocket configuration.
   * @private
   */
  private readonly url: string;
  private readonly protocol?: string | string[];
  private readonly encoding: 'json' | 'msgpack' | 'protobuf';
  private readonly auth?: WebSocketTransportOptions['auth'];
  private readonly reconnect: Required<NonNullable<WebSocketTransportOptions['reconnect']>>;

  /**
   * WebSocket instance.
   * @private
   */
  private ws?: WebSocket | any;

  /**
   * Connection state.
   * @private
   */
  private connected = false;
  private connecting = false;
  private authenticated = false;
  private connectionAttempts = 0;

  /**
   * Message queue for offline buffering.
   * @private
   */
  private messageQueue: Array<{
    message: WSMessage;
    entry: LogEntry;
    timestamp: number;
    attempts: number;
  }> = [];

  /**
   * Pending acknowledgments.
   * @private
   */
  private pendingAcks: Map<string, {
    resolve: () => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  /**
   * Reconnection timer.
   * @private
   */
  private reconnectTimer?: NodeJS.Timeout;

  /**
   * Heartbeat timer.
   * @private
   */
  private heartbeatTimer?: NodeJS.Timeout;
  private heartbeatInterval = 30000; // 30 seconds
  private lastPong?: number;

  /**
   * Message encoder/decoder based on encoding type.
   * @private
   */
  private encoder?: any;
  private decoder?: any;

  /**
   * Creates a new WebSocketTransport instance.
   * 
   * @param {WebSocketTransportOptions} options - Transport configuration
   */
  constructor(options: WebSocketTransportOptions) {
    super(options);

    // Validate required options
    if (!options.url) {
      throw new Error('WebSocketTransport requires url option');
    }

    // Initialize configuration
    this.url = options.url;
    this.protocol = options.protocol;
    this.encoding = options.encoding || 'json';
    this.auth = options.auth;

    // Initialize reconnection settings
    this.reconnect = {
      enabled: options.reconnect?.enabled !== false,
      maxAttempts: options.reconnect?.maxAttempts || 10,
      delay: options.reconnect?.delay || 1000,
    };
  }

  /**
   * Initialize the WebSocket transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Load encoding libraries if needed
    await this.loadEncoders();

    // Establish WebSocket connection
    await this.connect();
  }

  /**
   * Load encoding/decoding libraries.
   * 
   * @private
   */
  private async loadEncoders(): Promise<void> {
    switch (this.encoding) {
      case 'msgpack':
        try {
          // @ts-expect-error - @msgpack/msgpack is an optional dependency
          const msgpack = await import('@msgpack/msgpack');
          this.encoder = msgpack.encode;
          this.decoder = msgpack.decode;
        } catch (error) {
          throw new Error(
            'MessagePack is required for msgpack encoding. Install with: npm install @msgpack/msgpack'
          );
        }
        break;

      case 'protobuf':
        throw new Error('Protobuf encoding not yet implemented');

      case 'json':
      default:
        // JSON is built-in
        this.encoder = JSON.stringify;
        this.decoder = JSON.parse;
        break;
    }
  }

  /**
   * Establish WebSocket connection.
   * 
   * @private
   */
  private async connect(): Promise<void> {
    if (this.connected || this.connecting) {
      return;
    }

    this.connecting = true;
    this.connectionAttempts++;

    try {
      await this.createWebSocket();
      await this.waitForConnection();
      await this.authenticate();
      
      this.connected = true;
      this.connecting = false;
      this.connectionAttempts = 0;
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Process queued messages
      await this.processMessageQueue();
      
      this.emit('connected', {
        transport: this.name,
        url: this.url,
        attempts: this.connectionAttempts,
      });
    } catch (error) {
      this.connecting = false;
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Create WebSocket instance with appropriate implementation.
   * 
   * @private
   */
  private async createWebSocket(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Browser WebSocket
      this.ws = new WebSocket(this.url, this.protocol);
      this.ws.binaryType = 'arraybuffer';
    } else {
      // Node.js WebSocket
      try {
        // Use string-based import to avoid TypeScript module resolution
        const WebSocketLib = (await import('ws' as any)).default;
        
        const options: any = {
          perMessageDeflate: true,
          handshakeTimeout: 10000,
        };

        // Add headers for authentication
        if (this.auth?.headers) {
          options.headers = this.auth.headers;
        }

        this.ws = new WebSocketLib(this.url, this.protocol, options);
      } catch (error) {
        throw new Error(
          'ws package is required for WebSocketTransport in Node.js. Install with: npm install ws'
        );
      }
    }

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up WebSocket event handlers.
   * 
   * @private
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.emit('websocket_open');
    };

    this.ws.onclose = (event: any) => {
      this.handleDisconnection(event.code, event.reason);
    };

    this.ws.onerror = (event: any) => {
      this.handleError(new Error(`WebSocket error: ${event.message || 'Unknown error'}`));
    };

    this.ws.onmessage = (event: any) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Wait for WebSocket connection to be established.
   * 
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
      }, 10000);

      const checkConnection = () => {
        if (this.ws!.readyState === 1) { // OPEN
          clearTimeout(timeout);
          resolve();
        } else if (this.ws!.readyState === 3) { // CLOSED
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
   * Authenticate with the WebSocket server.
   * 
   * @private
   */
  private async authenticate(): Promise<void> {
    if (!this.auth?.token) {
      this.authenticated = true;
      return;
    }

    const authMessage: WSMessage = {
      id: this.generateId(),
      type: WSMessageType.AUTH,
      timestamp: Date.now(),
      data: { token: this.auth.token },
    };

    await this.sendMessage(authMessage);

    // Wait for authentication response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 5000);

      const handleAuth = (event: any) => {
        const message = this.parseMessage(event.data);
        
        if (message?.type === WSMessageType.AUTH_SUCCESS) {
          clearTimeout(timeout);
          this.authenticated = true;
          resolve();
        } else if (message?.type === WSMessageType.AUTH_FAILURE) {
          clearTimeout(timeout);
          reject(new Error(`Authentication failed: ${message.error || 'Unknown error'}`));
        }
      };

      // Temporarily override message handler
      const originalHandler = this.ws!.onmessage;
      this.ws!.onmessage = (event: any) => {
        const message = this.parseMessage(event.data);
        
        if (message?.type === WSMessageType.AUTH_SUCCESS || 
            message?.type === WSMessageType.AUTH_FAILURE) {
          handleAuth(event);
          this.ws!.onmessage = originalHandler;
        } else {
          originalHandler(event);
        }
      };
    });
  }

  /**
   * Send a log entry over WebSocket.
   * 
   * @param {LogEntry} entry - The log entry to send
   * @returns {Promise<void>} Resolves when acknowledged
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (!this.connected) {
      // Queue message for later delivery
      this.queueMessage(entry);
      return;
    }

    const message: WSMessage = {
      id: this.generateId(),
      type: WSMessageType.LOG,
      timestamp: Date.now(),
      data: entry,
    };

    try {
      await this.sendMessageWithAck(message, entry);
    } catch (error) {
      // Queue for retry
      this.queueMessage(entry);
      throw error;
    }
  }

  /**
   * Send multiple log entries as a batch.
   * 
   * @param {LogEntry[]} entries - Array of log entries
   * @returns {Promise<void>} Resolves when acknowledged
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    if (!this.connected) {
      // Queue all messages
      entries.forEach(entry => this.queueMessage(entry));
      return;
    }

    const message: WSMessage = {
      id: this.generateId(),
      type: WSMessageType.LOG_BATCH,
      timestamp: Date.now(),
      data: entries,
    };

    try {
      await this.sendMessageWithAck(message, entries[0]);
    } catch (error) {
      // Queue for retry
      entries.forEach(entry => this.queueMessage(entry));
      throw error;
    }
  }

  /**
   * Queue a message for later delivery.
   * 
   * @param {LogEntry} entry - The log entry to queue
   * @private
   */
  private queueMessage(entry: LogEntry): void {
    const message: WSMessage = {
      id: this.generateId(),
      type: WSMessageType.LOG,
      timestamp: Date.now(),
      data: entry,
    };

    this.messageQueue.push({
      message,
      entry,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 10000) {
      this.messageQueue = this.messageQueue.slice(-5000);
    }

    this.stats.queued = this.messageQueue.length;
  }

  /**
   * Process queued messages after reconnection.
   * 
   * @private
   */
  private async processMessageQueue(): Promise<void> {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const item of queue) {
      try {
        await this.sendMessageWithAck(item.message, item.entry);
      } catch (error) {
        // Re-queue if still failing
        item.attempts++;
        
        if (item.attempts < 3) {
          this.messageQueue.push(item);
        } else {
          this.handleError(error as Error, item.entry);
        }
      }
    }

    this.stats.queued = this.messageQueue.length;
  }

  /**
   * Send a message with acknowledgment.
   * 
   * @param {WSMessage} message - Message to send
   * @param {LogEntry} _entry - Associated log entry (unused)
   * @returns {Promise<void>} Resolves when acknowledged
   * @private
   */
  private sendMessageWithAck(message: WSMessage, _entry: LogEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(message.id);
        reject(new Error('Message acknowledgment timeout'));
      }, 5000);

      this.pendingAcks.set(message.id, { resolve, reject, timeout });

      try {
        this.sendMessage(message);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingAcks.delete(message.id);
        reject(error);
      }
    });
  }

  /**
   * Send a message over WebSocket.
   * 
   * @param {WSMessage} message - Message to send
   * @private
   */
  private sendMessage(message: WSMessage): void {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error('WebSocket not connected');
    }

    const encoded = this.encodeMessage(message);
    this.ws.send(encoded);
  }

  /**
   * Encode a message based on configured encoding.
   * 
   * @param {WSMessage} message - Message to encode
   * @returns {string | ArrayBuffer} Encoded message
   * @private
   */
  private encodeMessage(message: WSMessage): string | ArrayBuffer {
    try {
      return this.encoder(message);
    } catch (error) {
      throw new Error(`Failed to encode message: ${error}`);
    }
  }

  /**
   * Parse incoming WebSocket message.
   * 
   * @param {any} data - Raw message data
   * @returns {WSMessage | null} Parsed message
   * @private
   */
  private parseMessage(data: any): WSMessage | null {
    try {
      // Handle ArrayBuffer for binary messages
      if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
      }

      return this.decoder(data);
    } catch (error) {
      this.handleError(new Error(`Failed to parse message: ${error}`));
      return null;
    }
  }

  /**
   * Handle incoming WebSocket message.
   * 
   * @param {any} data - Raw message data
   * @private
   */
  private handleMessage(data: any): void {
    const message = this.parseMessage(data);
    if (!message) return;

    switch (message.type) {
      case WSMessageType.ACK:
        this.handleAck(message);
        break;

      case WSMessageType.ERROR:
        this.handleServerError(message);
        break;

      case WSMessageType.PING:
        this.handlePing();
        break;

      case WSMessageType.PONG:
        this.handlePong();
        break;

      default:
        // Unknown message type
        this.emit('unknown_message', message);
    }
  }

  /**
   * Handle acknowledgment message.
   * 
   * @param {WSMessage} message - Acknowledgment message
   * @private
   */
  private handleAck(message: WSMessage): void {
    const pending = this.pendingAcks.get(message.data?.messageId || message.id);
    
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingAcks.delete(message.data?.messageId || message.id);
      pending.resolve();
    }
  }

  /**
   * Handle server error message.
   * 
   * @param {WSMessage} message - Error message
   * @private
   */
  private handleServerError(message: WSMessage): void {
    const error = new Error(message.error || 'Server error');
    
    const pending = this.pendingAcks.get(message.data?.messageId || message.id);
    
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingAcks.delete(message.data?.messageId || message.id);
      pending.reject(error);
    } else {
      this.handleError(error);
    }
  }

  /**
   * Handle ping message.
   * 
   * @private
   */
  private handlePing(): void {
    this.sendMessage({
      id: this.generateId(),
      type: WSMessageType.PONG,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle pong message.
   * 
   * @private
   */
  private handlePong(): void {
    this.lastPong = Date.now();
  }

  /**
   * Start heartbeat mechanism.
   * 
   * @private
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (!this.connected) {
        this.stopHeartbeat();
        return;
      }

      // Check if we've received a pong recently
      if (this.lastPong && Date.now() - this.lastPong > this.heartbeatInterval * 2) {
        // Connection seems dead
        this.handleDisconnection(1006, 'Heartbeat timeout');
        return;
      }

      // Send ping
      try {
        this.sendMessage({
          id: this.generateId(),
          type: WSMessageType.PING,
          timestamp: Date.now(),
        });
      } catch (error) {
        // Ignore ping errors
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism.
   * 
   * @private
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  /**
   * Handle WebSocket disconnection.
   * 
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   * @private
   */
  private handleDisconnection(code: number, reason: string): void {
    this.connected = false;
    this.authenticated = false;
    
    // Clean up
    this.stopHeartbeat();
    this.clearPendingAcks();
    
    this.emit('disconnected', {
      transport: this.name,
      code,
      reason,
    });

    // Attempt reconnection if enabled
    if (this.reconnect.enabled && 
        this.connectionAttempts < this.reconnect.maxAttempts &&
        !this.closing) {
      this.scheduleReconnection();
    }
  }

  /**
   * Schedule reconnection attempt.
   * 
   * @private
   */
  private scheduleReconnection(): void {
    if (this.reconnectTimer) {
      return;
    }

    const delay = Math.min(
      this.reconnect.delay * Math.pow(2, this.connectionAttempts - 1),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      
      this.connect().catch(error => {
        this.handleError(error);
      });
    }, delay);

    this.emit('reconnecting', {
      transport: this.name,
      attempt: this.connectionAttempts,
      delay,
    });
  }

  /**
   * Handle connection error.
   * 
   * @param {Error} error - Connection error
   * @private
   */
  private handleConnectionError(error: Error): void {
    this.handleError(error);

    // Schedule reconnection if appropriate
    if (this.reconnect.enabled && 
        this.connectionAttempts < this.reconnect.maxAttempts &&
        !this.closing) {
      this.scheduleReconnection();
    }
  }

  /**
   * Clear all pending acknowledgments.
   * 
   * @private
   */
  private clearPendingAcks(): void {
    for (const [, pending] of this.pendingAcks.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('WebSocket disconnected'));
    }
    
    this.pendingAcks.clear();
  }

  /**
   * Close the WebSocket transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Stop reconnection attempts
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Stop heartbeat
    this.stopHeartbeat();

    // Clear pending acknowledgments
    this.clearPendingAcks();

    // Close WebSocket connection
    if (this.ws) {
      if (this.ws.readyState === 1) { // OPEN
        this.ws.close(1000, 'Transport closing');
      }
      
      this.ws = undefined;
    }

    this.connected = false;
    this.authenticated = false;
  }

  /**
   * Get transport statistics with WebSocket-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add WebSocket-specific stats
    stats.custom = {
      ...stats.custom,
      connected: this.connected,
      authenticated: this.authenticated,
      connectionAttempts: this.connectionAttempts,
      pendingAcks: this.pendingAcks.size,
      queuedMessages: this.messageQueue.length,
      encoding: this.encoding,
    };

    return stats;
  }
}

/**
 * Factory function to create a WebSocket transport with common defaults.
 * 
 * @param {Partial<WebSocketTransportOptions>} options - Transport options
 * @returns {WebSocketTransport} Configured WebSocket transport
 */
export function createWebSocketTransport(
  options: Partial<WebSocketTransportOptions>
): WebSocketTransport {
  if (!options.url) {
    throw new Error('WebSocketTransport requires url option');
  }

  return new WebSocketTransport({
    name: 'websocket',
    enabled: true,
    level: 'info',
    encoding: 'json',
    reconnect: {
      enabled: true,
      maxAttempts: 10,
      delay: 1000,
    },
    ...options,
    url: options.url,
  } as WebSocketTransportOptions);
}
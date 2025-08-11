// File: tests/unit/transports/base/implementations/WebSocketTransport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public url: string, public protocol?: string | string[]) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 10);
  }

  send(_data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket not open');
    }
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      const event = new CloseEvent('close', { code, reason, wasClean: true });
      this.onclose(event);
    }
  }
}

// Set up global WebSocket mock
(global as any).WebSocket = MockWebSocket;

describe('WebSocketTransport', () => {
  let WebSocketTransport: any;
  let transport: any;
  let entry: any;
  let mockWs: MockWebSocket;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Dynamic import after mocks
    ({ WebSocketTransport } = await import('../../../../../src/transports/base/implementations/WebSocketTransport'));
    
    entry = {
      id: 'test-id',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      context: { test: true }
    };
  });

  describe('constructor', () => {
    it('creates transport with default options', () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      expect(transport.name).toBe('ws');
    });

    it('accepts reconnect configuration', () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'wss://logs.example.com',
        reconnect: {
          enabled: true,
          maxAttempts: 5,
          delay: 2000
        }
      });
      expect(transport.name).toBe('ws');
    });

    it('accepts encoding options', () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost',
        encoding: 'msgpack'
      });
      expect(transport.name).toBe('ws');
    });
  });

  describe('connection', () => {
    it('connects to WebSocket server', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });

      await transport.init();
      
      // Give time for async connection
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const stats = transport.getStats();
      expect(stats.custom?.wsState).toBeDefined();
    });

    it('handles connection with protocol', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080',
        protocol: 'v1.logs'
      });

      await expect(transport.init()).resolves.not.toThrow();
    });

    it('throws error for invalid encoding', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080',
        encoding: 'protobuf' as any
      });

      await expect(transport.init()).rejects.toThrow('Protobuf encoding not implemented');
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Get the mock WebSocket instance
      mockWs = (transport as any).ws;
    });

    it('handles pong messages for heartbeat', () => {
      const message = { type: 'pong' };
      
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(message)
        }));
      }
      
      // Should update lastHeartbeat
      const stats = transport.getStats();
      expect(stats.custom?.lastHeartbeat).toBeDefined();
    });

    it('handles acknowledgment messages', () => {
      const ackHandler = jest.fn();
      transport.on('acknowledged', ackHandler);
      
      const message = { type: 'ack', id: 'log-123' };
      
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(message)
        }));
      }
      
      expect(ackHandler).toHaveBeenCalledWith(message);
    });

    it('handles error messages', () => {
      const errorHandler = jest.fn();
      transport.on('error', errorHandler);
      
      const message = { type: 'error', error: 'Server error occurred' };
      
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(message)
        }));
      }
      
      expect(errorHandler).toHaveBeenCalled();
    });

    it('handles config messages', () => {
      const configHandler = jest.fn();
      transport.on('config', configHandler);
      
      const message = { type: 'config', config: { maxBatchSize: 100 } };
      
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(message)
        }));
      }
      
      expect(configHandler).toHaveBeenCalledWith({ maxBatchSize: 100 });
    });

    it('handles custom message types', () => {
      const messageHandler = jest.fn();
      transport.on('message', messageHandler);
      
      const message = { type: 'custom', data: 'test' };
      
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(message)
        }));
      }
      
      expect(messageHandler).toHaveBeenCalledWith(message);
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    it('sends log entries via WebSocket', async () => {
      const sendSpy = jest.spyOn((transport as any).ws, 'send');
      
      await transport.log(entry);
      
      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.type).toBe('logs');
      expect(sentData.entries).toHaveLength(1);
      expect(sentData.entries[0].message).toBe('Test message');
    });

    it('sends batch of log entries', async () => {
      const sendSpy = jest.spyOn((transport as any).ws, 'send');
      const entries = [entry, { ...entry, id: 'test-id-2' }];
      
      await transport.logBatch(entries);
      
      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.entries).toHaveLength(2);
    });

    it('throws error when WebSocket is not connected', async () => {
      mockWs.readyState = MockWebSocket.CLOSED;
      
      await expect(transport.log(entry)).rejects.toThrow('WebSocket not connected');
    });
  });

  describe('heartbeat', () => {
    beforeEach(async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    it('sends ping messages periodically', async () => {
      const sendSpy = jest.spyOn((transport as any).ws, 'send');
      
      // Trigger heartbeat manually
      await (transport as any).sendData({ type: 'ping' });
      
      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.type).toBe('ping');
    });

    it('closes connection on heartbeat timeout', () => {
      jest.useFakeTimers();
      const closeSpy = jest.spyOn(mockWs, 'close');
      
      // Simulate heartbeat timeout
      (transport as any).lastHeartbeat = Date.now() - 70000; // 70 seconds ago
      
      // Fast-forward timers
      jest.advanceTimersByTime(16000); // Half of heartbeat timeout
      
      expect(closeSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('reconnection', () => {
    it('handles disconnection events', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080',
        reconnect: { enabled: true }
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const disconnectHandler = jest.fn();
      transport.on('disconnected', disconnectHandler);
      
      // Trigger close event
      mockWs.close(1000, 'Normal closure');
      
      expect(disconnectHandler).toHaveBeenCalledWith({
        code: 1000,
        reason: 'Normal closure',
        wasClean: true
      });
    });
  });

  describe('encoding', () => {
    it('uses JSON encoding by default', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const stats = transport.getStats();
      expect(stats.custom?.encoding).toBe('json');
    });

    it('supports msgpack encoding (falls back to JSON)', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080',
        encoding: 'msgpack'
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const sendSpy = jest.spyOn((transport as any).ws, 'send');
      await transport.log(entry);
      
      // Should still work (falls back to JSON in mock)
      expect(sendSpy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('closes WebSocket connection on transport close', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const closeSpy = jest.spyOn(mockWs, 'close');
      
      await transport.close();
      
      expect(closeSpy).toHaveBeenCalledWith(1000, 'Transport closing');
    });

    it('stops heartbeat on close', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      await transport.close();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('statistics', () => {
    it('provides WebSocket-specific stats', async () => {
      transport = new WebSocketTransport({
        name: 'ws',
        url: 'ws://localhost:8080'
      });
      
      await transport.init();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const stats = transport.getStats();
      
      expect(stats.name).toBe('ws');
      expect(stats.custom?.lastHeartbeat).toBeDefined();
      expect(stats.custom?.wsState).toBe(MockWebSocket.OPEN);
      expect(stats.custom?.encoding).toBe('json');
    });
  });
});
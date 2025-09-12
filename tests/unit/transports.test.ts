// File: tests/unit/transports.test.ts

import {
  ConsoleTransport,
  FileTransport,
  StreamTransport,
  HTTPTransport,
  Transport,
  NetworkTransport,
  TransportRegistry,
  S3Transport,
  MongoDBTransport,
  WebSocketTransport,
  createConsole,
  createFile,
  createHTTP,
  createStream,
} from '../../src/transports';

import type {
  LogEntry,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  HTTPTransportOptions,
  StreamTransportOptions,
} from '../../src/transports';

import { Writable } from 'stream';

/**
 * Test suite for the main transports.ts module
 *
 * This tests the tree-shakable exports and convenience factory functions
 * to ensure proper module structure and functionality.
 */
describe('transports.ts module', () => {
  describe('Core Transport Exports', () => {
    it('should export ConsoleTransport class', () => {
      expect(ConsoleTransport).toBeDefined();
      expect(typeof ConsoleTransport).toBe('function');
      expect(ConsoleTransport.name).toBe('ConsoleTransport');
    });

    it('should export FileTransport class (alias for AsyncFileTransport)', () => {
      expect(FileTransport).toBeDefined();
      expect(typeof FileTransport).toBe('function');
      expect(FileTransport.name).toBe('AsyncFileTransport');
    });

    it('should export StreamTransport class', () => {
      expect(StreamTransport).toBeDefined();
      expect(typeof StreamTransport).toBe('function');
      expect(StreamTransport.name).toBe('StreamTransport');
    });

    it('should export HTTPTransport class', () => {
      expect(HTTPTransport).toBeDefined();
      expect(typeof HTTPTransport).toBe('function');
      expect(HTTPTransport.name).toBe('HTTPTransport');
    });

    it('should export base Transport class', () => {
      expect(Transport).toBeDefined();
      expect(typeof Transport).toBe('function');
      expect(Transport.name).toBe('Transport');
    });

    it('should export NetworkTransport class', () => {
      expect(NetworkTransport).toBeDefined();
      expect(typeof NetworkTransport).toBe('function');
      expect(NetworkTransport.name).toBe('NetworkTransport');
    });

    it('should export TransportRegistry', () => {
      expect(TransportRegistry).toBeDefined();
      expect(typeof TransportRegistry).toBe('function');
      expect(TransportRegistry.name).toBe('TransportRegistry');
    });
  });

  describe('Optional Transport Exports', () => {
    it('should export S3Transport class', () => {
      expect(S3Transport).toBeDefined();
      expect(typeof S3Transport).toBe('function');
      expect(S3Transport.name).toBe('S3Transport');
    });

    it('should export MongoDBTransport class', () => {
      expect(MongoDBTransport).toBeDefined();
      expect(typeof MongoDBTransport).toBe('function');
      expect(MongoDBTransport.name).toBe('MongoDBTransport');
    });

    it('should export WebSocketTransport class', () => {
      expect(WebSocketTransport).toBeDefined();
      expect(typeof WebSocketTransport).toBe('function');
      expect(WebSocketTransport.name).toBe('WebSocketTransport');
    });
  });

  describe('Type Exports', () => {
    it('should export transport types (compile-time check)', () => {
      // This test ensures types are exported properly
      const testLogEntry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
      };

      const testTransportOptions: TransportOptions = {
        name: 'test-transport',
        enabled: true,
        level: 'info',
      };

      const testConsoleOptions: ConsoleTransportOptions = {
        name: 'test-console',
        colorize: true,
      };

      // If this compiles without error, type exports are working
      expect(testLogEntry.id).toBe('test-123');
      expect(testTransportOptions.name).toBe('test-transport');
      expect(testConsoleOptions.colorize).toBe(true);
    });
  });

  describe('Convenience Factory Functions', () => {
    describe('createConsole', () => {
      it('should create a ConsoleTransport with default name', () => {
        const transport = createConsole();

        expect(transport).toBeInstanceOf(ConsoleTransport);
        expect(transport.name).toBe('console');
        expect(transport.enabled).toBe(true);
      });

      it('should create a ConsoleTransport with custom options', () => {
        const options: Partial<ConsoleTransportOptions> = {
          name: 'custom-console',
          colorize: false,
          enabled: false,
        };

        const transport = createConsole(options);

        expect(transport).toBeInstanceOf(ConsoleTransport);
        expect(transport.name).toBe('custom-console');
        expect(transport.enabled).toBe(false);
      });

      it('should override default name when provided in options', () => {
        const transport = createConsole({ name: 'my-console' });

        expect(transport.name).toBe('my-console');
      });
    });

    describe('createFile', () => {
      it('should create a FileTransport with generated name', () => {
        const filepath = '/tmp/test.log';
        const transport = createFile(filepath);

        expect(transport).toBeInstanceOf(FileTransport);
        expect(transport.name).toBe('file--tmp-test-log');
      });

      it('should create a FileTransport with custom options', () => {
        const filepath = '/var/log/app.log';
        const options: Partial<FileTransportOptions> = {
          name: 'app-logs',
          maxFileSize: 1024 * 1024,
          maxFiles: 5,
          enabled: false,
        };

        const transport = createFile(filepath, options);

        expect(transport).toBeInstanceOf(FileTransport);
        expect(transport.name).toBe('app-logs');
        expect(transport.enabled).toBe(false);
      });

      it('should sanitize filepath for name generation', () => {
        const transport = createFile('/path/with/special-chars_123.log');

        expect(transport.name).toBe('file--path-with-special-chars-123-log');
      });
    });

    describe('createHTTP', () => {
      it('should create an HTTPTransport with hostname-based name', () => {
        const url = 'https://api.example.com/logs';
        const transport = createHTTP(url);

        expect(transport).toBeInstanceOf(HTTPTransport);
        expect(transport.name).toBe('http-api.example.com');
      });

      it('should create an HTTPTransport with custom options', () => {
        const url = 'http://localhost:3000/api/logs';
        const options: Partial<HTTPTransportOptions> = {
          name: 'local-api',
          method: 'PUT',
          enabled: false,
        };

        const transport = createHTTP(url, options);

        expect(transport).toBeInstanceOf(HTTPTransport);
        expect(transport.name).toBe('local-api');
        expect(transport.enabled).toBe(false);
      });

      it('should handle different URL formats for name generation', () => {
        const tests = [
          { url: 'https://logs.company.io:8080/endpoint', expected: 'http-logs.company.io' },
          { url: 'http://127.0.0.1:9200/_bulk', expected: 'http-127.0.0.1' },
          { url: 'https://subdomain.domain.com/path', expected: 'http-subdomain.domain.com' },
        ];

        for (const test of tests) {
          const transport = createHTTP(test.url);
          expect(transport.name).toBe(test.expected);
        }
      });
    });

    describe('createStream', () => {
      it('should create a StreamTransport with default name', () => {
        const stream = new Writable({
          write(chunk, encoding, callback) {
            callback();
          },
        });

        const transport = createStream(stream);

        expect(transport).toBeInstanceOf(StreamTransport);
        expect(transport.name).toBe('stream');
      });

      it('should create a StreamTransport with custom options', () => {
        const stream = new Writable({
          write(chunk, encoding, callback) {
            callback();
          },
        });

        const options: Partial<StreamTransportOptions> = {
          name: 'custom-stream',
          encoding: 'utf8',
          enabled: false,
        };

        const transport = createStream(stream, options);

        expect(transport).toBeInstanceOf(StreamTransport);
        expect(transport.name).toBe('custom-stream');
        expect(transport.enabled).toBe(false);
      });
    });
  });

  describe('Tree-shaking verification', () => {
    it('should allow importing only specific transports', () => {
      // This test verifies that individual imports work
      // If tree-shaking is working properly, unused transports won't be bundled

      // These should all be available
      expect(ConsoleTransport).toBeDefined();
      expect(FileTransport).toBeDefined();
      expect(StreamTransport).toBeDefined();
      expect(HTTPTransport).toBeDefined();

      // Optional transports should be available but lazy-loaded
      expect(S3Transport).toBeDefined();
      expect(MongoDBTransport).toBeDefined();
      expect(WebSocketTransport).toBeDefined();
    });

    it('should not break when importing subset of exports', () => {
      // Simulate tree-shaken imports by only using specific exports
      const consoleTransport = createConsole({ name: 'tree-shake-test' });
      expect(consoleTransport.name).toBe('tree-shake-test');

      // This should work even if other transports aren't used
      expect(typeof FileTransport).toBe('function');
    });
  });

  describe('Integration with TransportRegistry', () => {
    it('should allow registering transport factories', () => {
      // Test that static registry methods work
      expect(TransportRegistry).toBeDefined();
      expect(typeof TransportRegistry.register).toBe('function');
      expect(typeof TransportRegistry.get).toBe('function');
      expect(typeof TransportRegistry.has).toBe('function');
    });
  });

  describe('Error handling in factory functions', () => {
    it('should handle invalid URLs in createHTTP gracefully', () => {
      expect(() => createHTTP('not-a-valid-url')).toThrow();
    });

    it('should handle null/undefined options in factories', () => {
      // These should not throw
      expect(createConsole(undefined)).toBeInstanceOf(ConsoleTransport);
      expect(createFile('/tmp/test.log', undefined)).toBeInstanceOf(FileTransport);
    });
  });
});

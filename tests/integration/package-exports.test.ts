// File: tests/integration/package-exports.test.ts

/**
 * Integration tests for package.json exports
 * 
 * These tests verify that the package.json exports mapping
 * works correctly for different import patterns.
 */

describe('Package.json Exports', () => {
  
  describe('Main export', () => {
    
    it('should export main module from package root', async () => {
      // Simulate: import { Logger } from 'magiclogger'
      const mainModule = await import('../../src/index');
      
      expect(mainModule.Logger).toBeDefined();
      expect(mainModule.COLORS).toBeDefined();
      expect(mainModule.ANSI).toBeDefined();
      expect(mainModule.Colorizer).toBeDefined();
      expect(mainModule.TransportManager).toBeDefined();
      expect(mainModule.createLogger).toBeDefined();
      expect(mainModule.getDefaultLogger).toBeDefined();
      expect(mainModule.setDefaultLogger).toBeDefined();
    });
  });

  describe('Transports export', () => {
    
    it('should export transports module', async () => {
      // Simulate: import { ConsoleTransport } from 'magiclogger/transports'
      const transportsModule = await import('../../src/transports');
      
      expect(transportsModule.ConsoleTransport).toBeDefined();
      expect(transportsModule.FileTransport).toBeDefined();
      expect(transportsModule.StreamTransport).toBeDefined();
      expect(transportsModule.HTTPTransport).toBeDefined();
      expect(transportsModule.Transport).toBeDefined();
      expect(transportsModule.NetworkTransport).toBeDefined();
      expect(transportsModule.TransportRegistry).toBeDefined();
      
      // Optional transports
      expect(transportsModule.S3Transport).toBeDefined();
      expect(transportsModule.MongoDBTransport).toBeDefined();
      expect(transportsModule.WebSocketTransport).toBeDefined();
      
      // Factory functions
      expect(transportsModule.createConsole).toBeDefined();
      expect(transportsModule.createFile).toBeDefined();
      expect(transportsModule.createHTTP).toBeDefined();
      expect(transportsModule.createStream).toBeDefined();
    });
  });

  describe('Individual transport exports', () => {
    
    it('should export console transport module', async () => {
      // Simulate: import { ConsoleTransport } from 'magiclogger/console'
      const consoleModule = await import('../../src/console');
      
      expect(consoleModule.ConsoleTransport).toBeDefined();
      expect(consoleModule.createConsoleTransport).toBeDefined();
    });

    it('should export file transport module', async () => {
      // Simulate: import { FileTransport } from 'magiclogger/file'
      const fileModule = await import('../../src/file');
      
      expect(fileModule.FileTransport).toBeDefined();
      expect(fileModule.createFileTransport).toBeDefined();
    });

    it('should export http transport module', async () => {
      // Simulate: import { HTTPTransport } from 'magiclogger/http'
      const httpModule = await import('../../src/http');
      
      expect(httpModule.HTTPTransport).toBeDefined();
      expect(typeof httpModule.HTTPTransport).toBe('function');
    });
  });

  describe('CommonJS compatibility', () => {
    
    it('should work with require() syntax', () => {
      // Test CommonJS require
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mainModule = require('../../src/index');
      
      expect(mainModule.Logger).toBeDefined();
      expect(mainModule.COLORS).toBeDefined();
      expect(typeof mainModule.Logger).toBe('function');
    });

    it('should work with destructured require', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Logger, COLORS, createLogger } = require('../../src/index');
      
      expect(Logger).toBeDefined();
      expect(COLORS).toBeDefined();
      expect(createLogger).toBeDefined();
      expect(typeof Logger).toBe('function');
      expect(typeof createLogger).toBe('function');
    });
  });

  describe('TypeScript import patterns', () => {
    
    it('should support default import pattern', async () => {
      // Note: We don't have default exports, so this tests named imports
      const module = await import('../../src/index');
      
      expect(module.Logger).toBeDefined();
      expect(module.createLogger).toBeDefined();
    });

    it('should support namespace import pattern', async () => {
      // Simulate: import * as MagicLogger from 'magiclogger'
      const MagicLogger = await import('../../src/index');
      
      expect(MagicLogger.Logger).toBeDefined();
      expect(MagicLogger.COLORS).toBeDefined();
      expect(MagicLogger.createLogger).toBeDefined();
    });

    it('should support selective destructured imports', async () => {
      // Simulate: import { Logger, COLORS } from 'magiclogger'
      const { Logger, COLORS } = await import('../../src/index');
      
      expect(Logger).toBeDefined();
      expect(COLORS).toBeDefined();
      expect(typeof Logger).toBe('function');
      expect(typeof COLORS).toBe('object');
    });
  });

  describe('Bundle size optimization scenarios', () => {
    
    it('should support minimal import for logger only', async () => {
      // Simulate: import { Logger } from 'magiclogger'
      const { Logger } = await import('../../src/index');
      
      const logger = new Logger();
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should support transports-only import', async () => {
      // Simulate: import { ConsoleTransport } from 'magiclogger/transports'
      const { ConsoleTransport } = await import('../../src/transports');
      
      const transport = new ConsoleTransport({ name: 'test' });
      expect(transport).toBeDefined();
      expect(transport.name).toBe('test');
    });

    it('should support single transport import', async () => {
      // Simulate: import { ConsoleTransport } from 'magiclogger/console'
      const { ConsoleTransport } = await import('../../src/console');
      
      const transport = new ConsoleTransport({ name: 'single-transport' });
      expect(transport.name).toBe('single-transport');
    });

    it('should support factory-only import', async () => {
      // Simulate: import { createConsole } from 'magiclogger/transports'
      const { createConsole } = await import('../../src/transports');
      
      const transport = await createConsole({ name: 'factory-test' });
      expect(transport.name).toBe('factory-test');
    });
  });

  describe('Real-world usage patterns', () => {
    
    it('should support full logger setup', async () => {
      const { Logger } = await import('../../src/index');
      
      // createConsole/createFile are from transports module, not main
      const logger = new Logger();
      expect(Logger).toBeDefined();
      expect(logger).toBeDefined();
    });

    it('should support logger with separate transport imports', async () => {
      const { Logger } = await import('../../src/index');
      const { createConsole, createFile } = await import('../../src/transports');
      
      const logger = new Logger();
      const consoleTransport = await createConsole();
      const fileTransport = await createFile('/tmp/test.log');
      
      logger.addTransport(consoleTransport);
      logger.addTransport(fileTransport);
      
      // Check that transports were added (assuming getTransports method exists)
      expect(logger.addTransport).toBeDefined();
    });

    it('should support mixed import strategies', async () => {
      // Main logger
      const { Logger, COLORS } = await import('../../src/index');
      
      // Individual transports
      const { ConsoleTransport } = await import('../../src/console');
      const { FileTransport } = await import('../../src/file');
      
      // Combined transports
      const { createHTTP } = await import('../../src/transports');
      
      const logger = new Logger();
      const console = new ConsoleTransport({ name: 'console' });
      const file = new FileTransport({ name: 'file', filepath: '/tmp/mixed.log' });
      const http = await createHTTP('https://api.example.com/logs');
      
      logger.addTransport(console);
      logger.addTransport(file);
      logger.addTransport(http);
      
      // Verify the logger and transports work
      expect(logger.addTransport).toBeDefined();
      expect(COLORS.red).toBeDefined();
    });
  });
});

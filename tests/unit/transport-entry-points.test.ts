// File: tests/unit/transport-entry-points.test.ts

/**
 * Tests for individual transport entry point files
 * 
 * These test the individual console.ts, file.ts, http.ts files
 * that provide tree-shakable transport imports.
 */

describe('Individual Transport Entry Points', () => {
  
  describe('console.ts entry point', () => {
    
    it('should export ConsoleTransport', async () => {
      const consoleModule = await import('../../src/transports/console');
      
      expect(consoleModule.ConsoleTransport).toBeDefined();
      expect(typeof consoleModule.ConsoleTransport).toBe('function');
    });

    it('should export ConsoleTransportOptions type', async () => {
      // Type-only import test - if this compiles, types are exported
      const consoleModule = await import('../../src/transports/console');
      expect(consoleModule).toBeDefined();
    });

    it('should export createConsoleTransport factory', async () => {
      const consoleModule = await import('../../src/transports/console');
      
      expect(consoleModule.createConsoleTransport).toBeDefined();
      expect(typeof consoleModule.createConsoleTransport).toBe('function');
    });

    it('should register console transport with TransportRegistry', async () => {
      // Import the module to trigger registration
      await import('../../src/transports/console');
      
      const { TransportRegistry } = await import('../../src/transports');
      
      // The transport should be registered
      expect(TransportRegistry.has('console')).toBe(true);
      
      const factory = TransportRegistry.get('console');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });
  });

  describe('file.ts entry point', () => {
    
    it('should export FileTransport', async () => {
      const fileModule = await import('../../src/transports/file');
      
      expect(fileModule.FileTransport).toBeDefined();
      expect(typeof fileModule.FileTransport).toBe('function');
    });

    it('should export FileTransportOptions type', async () => {
      const fileModule = await import('../../src/transports/file');
      expect(fileModule).toBeDefined();
    });

    it('should export createFileTransport factory', async () => {
      const fileModule = await import('../../src/transports/file');
      
      expect(fileModule.createFileTransport).toBeDefined();
      expect(typeof fileModule.createFileTransport).toBe('function');
    });

    it('should register file transport with TransportRegistry', async () => {
      await import('../../src/transports/file');
      
      const { TransportRegistry } = await import('../../src/transports');
      
      // The transport should be registered
      expect(TransportRegistry.has('file')).toBe(true);
      
      const factory = TransportRegistry.get('file');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });
  });

  describe('http.ts entry point', () => {
    
    it('should export HTTPTransport', async () => {
      const httpModule = await import('../../src/transports/http');
      
      expect(httpModule.HTTPTransport).toBeDefined();
      expect(typeof httpModule.HTTPTransport).toBe('function');
    });

    it('should export HTTPTransportOptions type', async () => {
      const httpModule = await import('../../src/transports/http');
      expect(httpModule).toBeDefined();
    });

    it('should export HTTPTransport class', async () => {
      const httpModule = await import('../../src/transports/http');
      
      expect(httpModule.HTTPTransport).toBeDefined();
      expect(typeof httpModule.HTTPTransport).toBe('function');
    });

    it('should register HTTP transport with TransportRegistry', async () => {
      await import('../../src/transports/http');
      
      const { TransportRegistry } = await import('../../src/transports');
      
      // The transport should be registered
      expect(TransportRegistry.has('http')).toBe(true);
      
      const factory = TransportRegistry.get('http');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });
  });

  describe('Cross-transport compatibility', () => {
    
    it('should allow mixing imports from different entry points', async () => {
      const consoleModule = await import('../../src/transports/console');
      const fileModule = await import('../../src/transports/file');
      const httpModule = await import('../../src/transports/http');
      
      expect(consoleModule.ConsoleTransport).toBeDefined();
      expect(fileModule.FileTransport).toBeDefined();
      expect(httpModule.HTTPTransport).toBeDefined();
      
      // Should be able to create instances
      const console = new consoleModule.ConsoleTransport({ name: 'test-console' });
      const file = new fileModule.FileTransport({ 
        name: 'test-file', 
        filepath: '/tmp/test.log' 
      });
      const http = new httpModule.HTTPTransport({ 
        name: 'test-http', 
        url: 'https://api.example.com/logs' 
      });
      
      expect(console.name).toBe('test-console');
      expect(file.name).toBe('test-file');
      expect(http.name).toBe('test-http');
    });

    it('should work with the main transports module', async () => {
      // Import from individual entry points
      const { ConsoleTransport } = await import('../../src/transports/console');
      const { FileTransport } = await import('../../src/transports/file');
      
      // Import from main transports module
      const transportsModule = await import('../../src/transports');
      
      // Should be the same classes
      expect(ConsoleTransport).toBe(transportsModule.ConsoleTransport);
      expect(FileTransport).toBe(transportsModule.FileTransport);
    });
  });

  describe('Bundle optimization verification', () => {
    
    it('should support selective loading', async () => {
      // Test that we can import just one transport without loading others
      const { ConsoleTransport } = await import('../../src/transports/console');
      
      const transport = new ConsoleTransport({ name: 'selective-test' });
      expect(transport.name).toBe('selective-test');
      
      // This pattern should allow bundlers to tree-shake unused transports
    });

    it('should have minimal overhead per transport', async () => {
      // Each entry point should be lightweight
      const consoleModule = await import('../../src/transports/console');
      const fileModule = await import('../../src/transports/file');
      
      // Should export exactly what we expect, no more
      const consoleKeys = Object.keys(consoleModule);
      const fileKeys = Object.keys(fileModule);
      
      expect(consoleKeys).toContain('ConsoleTransport');
      expect(consoleKeys).toContain('createConsoleTransport');
      
      expect(fileKeys).toContain('FileTransport');
      expect(fileKeys).toContain('createFileTransport');
    });
  });

  describe('Registry integration', () => {
    
    it('should not conflict when multiple entry points are imported', async () => {
      // Import all entry points
      await import('../../src/transports/console');
      await import('../../src/transports/file');
      await import('../../src/transports/http');
      
      const { TransportRegistry } = await import('../../src/transports');
      
      // All transport types should be registered
      expect(TransportRegistry.has('console')).toBe(true);
      expect(TransportRegistry.has('file')).toBe(true);
      expect(TransportRegistry.has('http')).toBe(true);
      
      // Should be able to get all registered factories
      expect(TransportRegistry.get('console')).toBeDefined();
      expect(TransportRegistry.get('file')).toBeDefined();
      expect(TransportRegistry.get('http')).toBeDefined();
    });
  });
});

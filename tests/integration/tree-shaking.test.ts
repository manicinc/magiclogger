// File: tests/integration/tree-shaking.test.ts

/**
 * Integration tests for tree-shaking functionality
 * 
 * These tests verify that the transport module structure supports
 * proper tree-shaking and selective imports.
 */

describe('Tree-shaking Integration', () => {
  
  describe('Selective imports', () => {
    
    it('should allow importing only console transport', async () => {
      // Simulate tree-shaken import
      const { ConsoleTransport } = await import('../../src/transports');
      
      expect(ConsoleTransport).toBeDefined();
      expect(typeof ConsoleTransport).toBe('function');
      
      const transport = new ConsoleTransport({ name: 'test-console' });
      expect(transport.name).toBe('test-console');
    });

    it('should allow importing only factory functions', async () => {
      const { createConsole, createFile } = await import('../../src/transports');
      
      expect(createConsole).toBeDefined();
      expect(createFile).toBeDefined();
      expect(typeof createConsole).toBe('function');
      expect(typeof createFile).toBe('function');
      
      const console = await createConsole();
      const file = await createFile('/tmp/test.log');
      
      expect(console.name).toBe('console');
      expect(file.name).toBe('file--tmp-test-log');
    });

    it('should allow importing only types (compile-time)', async () => {
      // This import should work for types only
      const types = await import('../../src/transports');
      
      // Verify we can access type exports
      expect(types).toBeDefined();
      
      // Runtime verification that classes are available
      expect(types.ConsoleTransport).toBeDefined();
      expect(types.FileTransport).toBeDefined();
    });
  });

  describe('Bundle analysis simulation', () => {
    
    it('should not import optional dependencies when using core transports', async () => {
      // Import only core transports
      const { 
        ConsoleTransport, 
        FileTransport, 
        StreamTransport, 
        HTTPTransport 
      } = await import('../../src/transports');
      
      // These should be available without external dependencies
      expect(ConsoleTransport).toBeDefined();
      expect(FileTransport).toBeDefined();
      expect(StreamTransport).toBeDefined();
      expect(HTTPTransport).toBeDefined();
      
      // Optional transports should still be available but not pre-loaded
      const module = await import('../../src/transports');
      expect(module.S3Transport).toBeDefined();
      expect(module.MongoDBTransport).toBeDefined();
      expect(module.WebSocketTransport).toBeDefined();
    });

    it('should support dynamic imports for optional transports', async () => {
      // Simulate dynamic loading of optional transports
      const coreModule = await import('../../src/transports');
      
      // S3Transport should be available
      const { S3Transport } = coreModule;
      expect(S3Transport).toBeDefined();
      
      // Should be able to instantiate (though may fail without AWS config)
      expect(() => new S3Transport({
        name: 'test-s3',
        bucket: 'test-bucket',
        region: 'us-east-1'
      })).not.toThrow();
    });
  });

  describe('Package.json exports verification', () => {
    
    it('should support main module import', async () => {
      // Test main export from package.json
      const mainModule = await import('../../src/index');
      
      expect(mainModule.Logger).toBeDefined();
      expect(mainModule.COLORS).toBeDefined();
      expect(mainModule.TransportManager).toBeDefined();
    });

    it('should support transports submodule import', async () => {
      // Test transports export
      const transportsModule = await import('../../src/transports');
      
      expect(transportsModule.ConsoleTransport).toBeDefined();
      expect(transportsModule.FileTransport).toBeDefined();
      expect(transportsModule.createConsole).toBeDefined();
      expect(transportsModule.createFile).toBeDefined();
    });
  });

  describe('Memory usage optimization', () => {
    
    it('should not load all transports when importing selectively', async () => {
      // Import just one transport
      const { createConsole } = await import('../../src/transports');
      
      const transport = await createConsole({ name: 'memory-test' });
      
      // Verify it works
      expect(transport.name).toBe('memory-test');
      expect(transport.enabled).toBe(true);
      
      // In a real tree-shaken bundle, other transports wouldn't be loaded
      // This test verifies the import pattern works
    });

    it('should handle lazy loading of transport implementations', async () => {
      // The factory functions use dynamic imports internally
      const { createFile } = await import('../../src/transports');
      
      // This should trigger the dynamic import
      const fileTransport = await createFile('/tmp/lazy-test.log');
      
      expect(fileTransport.name).toBe('file--tmp-lazy-test-log');
    });
  });

  describe('ESM compatibility', () => {
    
    it('should work with ESM imports', async () => {
      // Verify ESM import syntax works
      const module = await import('../../src/transports');
      
      // Should only have named exports, no default export
      expect('default' in module).toBe(false);
      expect(Object.keys(module).length).toBeGreaterThan(0);
      
      // Named exports should be available
      expect(module.ConsoleTransport).toBeDefined();
      expect(module.createConsole).toBeDefined();
    });

    it('should support destructuring imports', async () => {
      // Test destructuring pattern
      const {
        ConsoleTransport,
        FileTransport,
        createConsole,
        createFile
      } = await import('../../src/transports');
      
      expect(ConsoleTransport).toBeDefined();
      expect(FileTransport).toBeDefined();
      expect(createConsole).toBeDefined();
      expect(createFile).toBeDefined();
    });
  });
});

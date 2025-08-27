/**
 * @fileoverview Tests for main index exports
 */

import * as LoggerExports from '../../src';

describe('Logger module exports', () => {
  // Track created loggers for cleanup
  const loggersToCleanup: Array<{ close?: () => void | Promise<void> }> = [];

  afterEach(async () => {
    // Clean up any loggers created during tests
    for (const logger of loggersToCleanup) {
      if (logger.close) {
        await logger.close();
      }
    }
    loggersToCleanup.length = 0;
  });
  describe('Core Logger Classes', () => {
    it('should export Logger as async logger by default', () => {
      expect(LoggerExports.Logger).toBeDefined();
      expect(typeof LoggerExports.Logger).toBe('function');
      
      // Logger should be the AsyncLogger
      const logger = new LoggerExports.Logger();
      loggersToCleanup.push(logger);
      expect(LoggerExports.isAsyncLogger(logger)).toBe(true);
    });

    it('should export SyncLogger for blocking I/O', () => {
      expect(LoggerExports.SyncLogger).toBeDefined();
      expect(typeof LoggerExports.SyncLogger).toBe('function');
      
      const syncLogger = new LoggerExports.SyncLogger();
      expect(LoggerExports.isSyncLogger(syncLogger)).toBe(true);
    });
  });

  describe('Factory Functions', () => {
    it('should export createLogger for async logger', () => {
      expect(LoggerExports.createLogger).toBeDefined();
      expect(typeof LoggerExports.createLogger).toBe('function');
      
      const logger = LoggerExports.createLogger();
      loggersToCleanup.push(logger);
      expect(LoggerExports.isAsyncLogger(logger)).toBe(true);
    });

    it('should export createSyncLogger for sync logger', () => {
      expect(LoggerExports.createSyncLogger).toBeDefined();
      expect(typeof LoggerExports.createSyncLogger).toBe('function');
      
      const logger = LoggerExports.createSyncLogger();
      expect(LoggerExports.isSyncLogger(logger)).toBe(true);
    });

  });

  describe('Type Guards', () => {
    it('should export isAsyncLogger type guard', () => {
      expect(LoggerExports.isAsyncLogger).toBeDefined();
      expect(typeof LoggerExports.isAsyncLogger).toBe('function');
    });

    it('should export isSyncLogger type guard', () => {
      expect(LoggerExports.isSyncLogger).toBeDefined();
      expect(typeof LoggerExports.isSyncLogger).toBe('function');
    });
  });

  describe('Default Export', () => {
    it('should have default export as factory function', () => {
      expect(LoggerExports.default).toBeDefined();
      expect(typeof LoggerExports.default).toBe('function');
      
      const logger = LoggerExports.default();
      loggersToCleanup.push(logger);
      expect(LoggerExports.isAsyncLogger(logger)).toBe(true);
    });
  });

  describe('Styling Exports', () => {
    it('should export COLORS constants', () => {
      expect(LoggerExports.COLORS).toBeDefined();
      expect(typeof LoggerExports.COLORS).toBe('object');
      expect(LoggerExports.COLORS.red).toBeDefined();
      expect(LoggerExports.COLORS.blue).toBeDefined();
      expect(LoggerExports.COLORS.green).toBeDefined();
      expect(LoggerExports.COLORS.bold).toBeDefined();
      expect(LoggerExports.COLORS.reset).toBeDefined();
    });

    it('should export ANSI constants', () => {
      expect(LoggerExports.ANSI).toBeDefined();
      expect(typeof LoggerExports.ANSI).toBe('object');
    });

    it('should export PRESETS', () => {
      expect(LoggerExports.PRESETS).toBeDefined();
      expect(typeof LoggerExports.PRESETS).toBe('object');
      expect(Array.isArray(LoggerExports.PRESETS.info)).toBe(true);
      expect(Array.isArray(LoggerExports.PRESETS.error)).toBe(true);
      expect(Array.isArray(LoggerExports.PRESETS.success)).toBe(true);
    });

    it('should export Colorizer', () => {
      expect(LoggerExports.Colorizer).toBeDefined();
      expect(typeof LoggerExports.Colorizer).toBe('function');
    });

    it('should export StyleBuilder', () => {
      expect(LoggerExports.StyleBuilder).toBeDefined();
      expect(typeof LoggerExports.StyleBuilder).toBe('function');
    });

    it('should export meta and err utilities', () => {
      expect(LoggerExports.meta).toBeDefined();
      expect(typeof LoggerExports.meta).toBe('function');
      expect(LoggerExports.err).toBeDefined();
      expect(typeof LoggerExports.err).toBe('function');
    });
  });

  describe('Optional Extensions', () => {
    it('should export QueueManager', () => {
      expect(LoggerExports.QueueManager).toBeDefined();
      expect(typeof LoggerExports.QueueManager).toBe('function');
    });

    it('should export RateLimiter', () => {
      expect(LoggerExports.RateLimiter).toBeDefined();
      expect(typeof LoggerExports.RateLimiter).toBe('function');
    });

    it('should export Redactor', () => {
      expect(LoggerExports.Redactor).toBeDefined();
      expect(typeof LoggerExports.Redactor).toBe('function');
      expect(LoggerExports.createRedactorPreset).toBeDefined();
      expect(typeof LoggerExports.createRedactorPreset).toBe('function');
    });

    it('should export Sampler', () => {
      expect(LoggerExports.Sampler).toBeDefined();
      expect(typeof LoggerExports.Sampler).toBe('function');
      expect(LoggerExports.createSamplerPreset).toBeDefined();
      expect(typeof LoggerExports.createSamplerPreset).toBe('function');
    });

    it('should export EnhancedConsole', () => {
      expect(LoggerExports.EnhancedConsole).toBeDefined();
      expect(typeof LoggerExports.EnhancedConsole).toBe('function');
      expect(LoggerExports.enhanceConsole).toBeDefined();
      expect(typeof LoggerExports.enhanceConsole).toBe('function');
    });
  });

  describe('Type Exports', () => {
    // These are compile-time only, but we verify the module structure
    it('should have properly structured exports', () => {
      expect(LoggerExports).toBeDefined();
      expect(typeof LoggerExports).toBe('object');
      
      // Verify key exports exist
      const expectedExports = [
        'Logger',
        'SyncLogger',
        'createLogger',
        'createSyncLogger',
        'default',
        'isAsyncLogger',
        'isSyncLogger',
        'COLORS',
        'ANSI',
        'PRESETS',
        'Colorizer',
        'StyleBuilder',
        'meta',
        'err',
        'QueueManager',
        'RateLimiter',
        'Redactor',
        'Sampler',
        'EnhancedConsole',
      ];
      
      expectedExports.forEach(exportName => {
        const anyExports = LoggerExports as unknown as Record<string, unknown>;
        expect(anyExports[exportName]).toBeDefined();
      });
    });
  });
});
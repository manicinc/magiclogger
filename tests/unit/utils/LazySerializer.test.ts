/**
 * Tests for LazySerializer utility
 * @fileoverview Tests for lazy serialization and schema-based serialization
 */

import { LazyLogEntry, SchemaSerializer } from '../../../src/utils/LazySerializer';
import type { LogEntry } from '../../../src/types/transport';

describe('LazySerializer', () => {
  describe('LazyLogEntry', () => {
    const createMockEntry = (): LogEntry => ({
      id: 'test-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      timestampMs: 1704067200000,
      level: 'info',
      message: 'Test message',
      loggerId: 'test-logger',
      tags: ['test', 'unit'],
      context: { user: 'john', action: 'login' },
      metadata: { version: '1.0.0' }
    });

    it('should create a lazy log entry', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      expect(lazyEntry).toBeInstanceOf(LazyLogEntry);
    });

    it('should return raw entry without serialization', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      const raw = lazyEntry.getRaw();
      expect(raw).toBe(entry);
      expect(raw.id).toBe('test-123');
    });

    it('should serialize to JSON on first call and cache result', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      // First call - should serialize
      const json1 = lazyEntry.toJSON();
      expect(typeof json1).toBe('string');
      expect(json1).toContain('test-123');
      expect(json1).toContain('Test message');
      
      // Second call - should return cached value
      const json2 = lazyEntry.toJSON();
      expect(json2).toBe(json1); // Same reference, meaning cached
    });

    it('should get specific fields without serialization', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      expect(lazyEntry.getField('id')).toBe('test-123');
      expect(lazyEntry.getField('level')).toBe('info');
      expect(lazyEntry.getField('message')).toBe('Test message');
      expect(lazyEntry.getField('tags')).toEqual(['test', 'unit']);
    });

    it('should match filter criteria', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      // Should match exact criteria
      expect(lazyEntry.matches({ level: 'info' })).toBe(true);
      expect(lazyEntry.matches({ id: 'test-123', level: 'info' })).toBe(true);
      
      // Should not match different criteria
      expect(lazyEntry.matches({ level: 'error' })).toBe(false);
      expect(lazyEntry.matches({ id: 'wrong-id' })).toBe(false);
    });

    it('should match empty filter', () => {
      const entry = createMockEntry();
      const lazyEntry = new LazyLogEntry(entry);
      
      expect(lazyEntry.matches({})).toBe(true);
    });

    it('should handle undefined fields in matching', () => {
      const entry = createMockEntry();
      delete (entry as any).metadata;
      const lazyEntry = new LazyLogEntry(entry);
      
      expect(lazyEntry.matches({ metadata: undefined })).toBe(true);
    });
  });

  describe('SchemaSerializer', () => {
    it('should create a schema serializer', () => {
      const serializer = new SchemaSerializer();
      expect(serializer).toBeInstanceOf(SchemaSerializer);
    });

    it('should serialize entry with all fields', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test message',
        styles: [{ start: 0, end: 4, styles: ['red'] }],
        loggerId: 'test-logger',
        tags: ['test', 'unit'],
        context: { user: 'john' },
        error: new Error('Test error'),
        metadata: { version: '1.0.0' }
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      
      expect(typeof json).toBe('string');
      expect(json).toContain('"id":"test-123"');
      expect(json).toContain('"level":"info"');
      expect(json).toContain('"message":"Test message"');
      expect(json).toContain('"tags":["test","unit"]');
    });

    it('should serialize entry with minimal fields', () => {
      const entry: LogEntry = {
        id: 'minimal',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'debug',
        message: 'Minimal'
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      
      expect(json).toContain('"id":"minimal"');
      expect(json).toContain('"message":"Minimal"');
      expect(json).not.toContain('tags');
      expect(json).not.toContain('context');
    });

    it('should handle different value types correctly', () => {
      const entry: LogEntry = {
        id: 'types',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Types test',
        context: {
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          date: new Date('2024-01-01'),
          array: [1, 2, 3],
          object: { nested: 'value' }
        }
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      const parsed = JSON.parse(json);
      
      expect(parsed.context.string).toBe('text');
      expect(parsed.context.number).toBe(42);
      expect(parsed.context.boolean).toBe(true);
      expect(parsed.context.null).toBe(null);
      expect(parsed.context.array).toEqual([1, 2, 3]);
      expect(parsed.context.object).toEqual({ nested: 'value' });
    });

    it('should serialize Error objects properly', () => {
      const error = new Error('Test error');
      error.name = 'TestError';
      
      const entry: LogEntry = {
        id: 'error-test',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'error',
        message: 'Error occurred',
        error: error
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      const parsed = JSON.parse(json);
      
      expect(parsed.error.name).toBe('TestError');
      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toBeDefined();
    });

    it('should handle special characters in strings', () => {
      const entry: LogEntry = {
        id: 'special',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test "quotes" and \n newlines \t tabs',
        context: {
          unicode: '😀 emoji',
          escaped: 'back\\slash'
        }
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      const parsed = JSON.parse(json);
      
      expect(parsed.message).toBe('Test "quotes" and \n newlines \t tabs');
      expect(parsed.context.unicode).toBe('😀 emoji');
      expect(parsed.context.escaped).toBe('back\\slash');
    });

    it('should maintain field order according to schema', () => {
      const entry: LogEntry = {
        // Intentionally out of order
        message: 'Message',
        level: 'info',
        id: 'order-test',
        timestampMs: 1704067200000,
        timestamp: '2024-01-01T00:00:00.000Z'
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      
      // Check that fields appear in schema order
      const idIndex = json.indexOf('"id"');
      const timestampIndex = json.indexOf('"timestamp"');
      const levelIndex = json.indexOf('"level"');
      const messageIndex = json.indexOf('"message"');
      
      expect(idIndex).toBeLessThan(timestampIndex);
      expect(timestampIndex).toBeLessThan(levelIndex);
      expect(levelIndex).toBeLessThan(messageIndex);
    });
  });

  describe('LazySerializer - Additional Coverage', () => {
    it('should handle circular references in LazyLogEntry', () => {
      const entry: any = createMockEntry();
      entry.circular = entry;
      
      const lazyEntry = new LazyLogEntry(entry);
      const json = lazyEntry.toJSON();
      expect(json).toContain('[Circular]');
    });

    it('should handle deeply nested circular references', () => {
      const entry: any = createMockEntry();
      entry.context = { deep: { nested: { ref: null } } };
      entry.context.deep.nested.ref = entry.context;
      
      const lazyEntry = new LazyLogEntry(entry);
      const json = lazyEntry.toJSON();
      expect(json).toContain('[Circular]');
    });

    it('should memoize serialization', () => {
      let callCount = 0;
      const entry: any = {
        id: 'memo-test',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        get message() {
          callCount++;
          return 'Dynamic message';
        }
      };
      
      const lazyEntry = new LazyLogEntry(entry);
      lazyEntry.toJSON();
      lazyEntry.toJSON();
      lazyEntry.toJSON();
      
      // Getter should only be called once
      expect(callCount).toBe(1);
    });

    it('should handle undefined values in entry', () => {
      const entry: any = {
        id: 'undefined-test',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: undefined,
        context: undefined
      };
      
      const lazyEntry = new LazyLogEntry(entry);
      const json = lazyEntry.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should handle schema serialization with missing fields', () => {
      const entry: Partial<LogEntry> = {
        id: 'partial',
        level: 'info',
        message: 'Partial entry'
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry as LogEntry);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should handle BigInt in context', () => {
      const entry: LogEntry = {
        id: 'bigint',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'BigInt test',
        context: {
          big: BigInt(9007199254740991)
        }
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      expect(json).toBeDefined();
    });

    it('should handle symbols in context', () => {
      const sym = Symbol('test');
      const entry: LogEntry = {
        id: 'symbol',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Symbol test',
        context: {
          [sym]: 'symbol value',
          regular: 'regular value'
        }
      };
      
      const serializer = new SchemaSerializer();
      const json = serializer.serialize(entry);
      const parsed = JSON.parse(json);
      expect(parsed.context.regular).toBe('regular value');
    });

    function createMockEntry(): LogEntry {
      return {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
        tags: ['test', 'unit'],
        context: { user: 'john', action: 'login' },
        metadata: { version: '1.0.0' }
      };
    }
  });
});
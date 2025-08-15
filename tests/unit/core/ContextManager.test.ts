// File: tests/unit/core/ContextManager.test.ts

import { ContextManager } from '../../../src/core/ContextManager';
import type { ContextManagerOptions } from '../../../src/core/ContextManager';

/**
 * Test suite for ContextManager class.
 *
 * Tests context creation, merging, validation, and sanitization.
 */
describe('ContextManager', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const manager = new ContextManager();
      expect(manager).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: ContextManagerOptions = {
        maxDepth: 5,
        maxProperties: 50,
        sanitizeMode: 'strict',
        freezeContext: true,
      };

      const manager = new ContextManager(options);
      expect(manager).toBeDefined();
    });
  });

  describe('context management', () => {
    it('should set and get context', () => {
      const input = { user: 'john', action: 'login' };
      contextManager.set(input);

      const context = contextManager.get();
      expect(context).toEqual(input);
    });

    it('should handle empty context', () => {
      const context = contextManager.get();
      expect(context).toEqual({});
    });

    it('should clear context', () => {
      contextManager.set({ user: 'john' });
      contextManager.clear();

      const context = contextManager.get();
      expect(context).toEqual({});
    });
  });

  describe('context merging', () => {
    it('should merge contexts', () => {
      const base = { user: 'john', session: '123' };
      const additional = { action: 'login', timestamp: Date.now() };

      const merged = contextManager.merge(base, additional);

      expect(merged).toEqual({ ...base, ...additional });
    });

    it('should override base values', () => {
      const base = { user: 'john', level: 'user' };
      const additional = { level: 'admin' };

      const merged = contextManager.merge(base, additional);

      expect(merged.level).toBe('admin');
    });

    it('should handle undefined contexts', () => {
      const base = { user: 'john' };
      const merged = contextManager.merge(base, undefined);

      expect(merged).toEqual(base);
    });
  });

  describe('context validation', () => {
    it('should validate valid context', () => {
      const context = { user: 'john', action: 'login' };
      const result = contextManager.validate(context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect circular references', () => {
      const context: Record<string, unknown> = { user: 'john' };
      context.self = context;

      const result = contextManager.validate(context);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should validate max depth', () => {
      const contextManager = new ContextManager({ maxDepth: 3 });
      const deepContext: Record<string, unknown> = {
        level1: { level2: { level3: { level4: { level5: { level6: {} } } } } },
      };
      const result = contextManager.validate(deepContext);

      // maxDepth is 3, but we have 6 levels
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('context utilities', () => {
    it('should flatten context', () => {
      const context = {
        user: {
          name: 'john',
          details: { age: 30 },
        },
      };

      const flattened = contextManager.flatten(context);
      expect(flattened['user.name']).toBe('john');
      expect(flattened['user.details.age']).toBe(30);
    });

    it('should unflatten context', () => {
      const flattened = {
        'user.name': 'john',
        'user.details.age': 30,
      };

      const unflattened = contextManager.unflatten(flattened);
      expect((unflattened as { user: { name: string; details: { age: number } } }).user.name).toBe(
        'john'
      );
      expect(
        (unflattened as { user: { name: string; details: { age: number } } }).user.details.age
      ).toBe(30);
    });

    it('should extract specific fields', () => {
      const context = { user: 'john', password: 'secret', action: 'login' };
      const extracted = contextManager.extract(context, ['user', 'action']);

      expect(extracted).toEqual({ user: 'john', action: 'login' });
      expect((extracted as Record<string, unknown>).password).toBeUndefined();
    });
  });

  describe('context sanitization', () => {
    it('should sanitize sensitive data when getting context in basic mode', () => {
      const manager = new ContextManager({ sanitizeMode: 'basic' });
      const context = {
        user: 'john',
        password: 'secret123',
        token: 'abc123',
        apiKey: 'xyz789',
      };

      manager.set(context);
      const retrieved = manager.get();

      // In basic mode, sensitive fields should be sanitized
      expect(retrieved.password).toBe('[REDACTED]');
      expect(retrieved.token).toBe('[REDACTED]');
      expect(retrieved.apiKey).toBe('[REDACTED]');
      expect(retrieved.user).toBe('john');
    });

    it('should not sanitize when sanitizeMode is none', () => {
      const manager = new ContextManager({ sanitizeMode: 'none' });
      const context = {
        user: 'john',
        password: 'secret123',
        token: 'abc123',
      };

      manager.set(context);
      const retrieved = manager.get();

      expect(retrieved.password).toBe('secret123');
      expect(retrieved.token).toBe('abc123');
      expect(retrieved.user).toBe('john');
    });
  });

  describe('snapshots', () => {
    it('should create and restore snapshots', () => {
      const originalContext = { user: 'john', session: '123' };
      contextManager.set(originalContext);

      const snapshot = contextManager.snapshot();
      expect(snapshot).toBeDefined();
      expect(contextManager.get()).toEqual(originalContext);

      contextManager.set({ user: 'jane' });
      contextManager.restore(snapshot);

      expect(contextManager.get()).toEqual(originalContext);
    });

    it('should manage multiple snapshots', () => {
      contextManager.set({ step: 1 });
      contextManager.snapshot();

      contextManager.set({ step: 2 });
      contextManager.snapshot();

      const snapshots = contextManager.getSnapshots();
      expect(snapshots).toHaveLength(2);

      // Verify we can restore to first snapshot
      contextManager.restore(snapshots[0]);
      expect(contextManager.get()).toEqual({ step: 1 });

      contextManager.clearSnapshots();
      expect(contextManager.getSnapshots()).toHaveLength(0);
    });

    it('should handle snapshot restoration', () => {
      contextManager.set({ user: 'john', role: 'admin' });
      const snapshot = contextManager.snapshot();

      // Change context
      contextManager.set({ user: 'jane', role: 'user' });
      expect(contextManager.get()).toEqual({ user: 'jane', role: 'user' });

      // Restore snapshot
      contextManager.restore(snapshot);
      expect(contextManager.get()).toEqual({ user: 'john', role: 'admin' });
    });

    it('should track snapshot count in stats', () => {
      const initialStats = contextManager.getStats();
      expect(initialStats.snapshotCount).toBe(0);

      contextManager.set({ test: 1 });
      contextManager.snapshot();
      contextManager.snapshot();

      const stats = contextManager.getStats();
      expect(stats.snapshotCount).toBe(2);
    });
  });

  describe('statistics', () => {
    it('should return stats', () => {
      contextManager.set({ user: 'john', session: '123' });
      const stats = contextManager.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('depth');
      expect(stats).toHaveProperty('propertyCount');
      expect(stats).toHaveProperty('snapshotCount');
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should track context properties', () => {
      contextManager.set({ a: 1, b: 2, c: 3 });
      const stats = contextManager.getStats();

      expect(stats.propertyCount).toBe(3);

      contextManager.set({ x: 1, y: 2 });
      const newStats = contextManager.getStats();
      expect(newStats.propertyCount).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle invalid inputs gracefully', () => {
      expect(() => contextManager.set(null as unknown as Record<string, unknown>)).not.toThrow();
      expect(() =>
        contextManager.set(undefined as unknown as Record<string, unknown>)
      ).not.toThrow();
      expect(() =>
        contextManager.set('string' as unknown as Record<string, unknown>)
      ).not.toThrow();

      // Context should remain empty or convert to object
      expect(contextManager.get()).toBeDefined();
    });

    it('should handle circular references in merge', () => {
      const obj1: Record<string, unknown> = { a: 1 };
      const obj2: Record<string, unknown> = { b: 2 };
      obj1.circular = obj1;
      obj2.circular = obj2;

      expect(() => contextManager.merge(obj1, obj2)).not.toThrow();
    });
  });
});

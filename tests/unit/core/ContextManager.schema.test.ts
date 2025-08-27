/**
 * @fileoverview Tests for ContextManager schema validation functionality.
 */

import { ContextManager } from '../../../src/core/ContextManager';
import { object, string, number, optional, array } from '../../../src/validation/SchemaValidator';

describe('ContextManager Schema Validation', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  afterEach(() => {
    contextManager.destroy();
  });

  describe('Schema setting', () => {
    it('sets and validates schema', () => {
      const schema = object({
        userId: string(),
        sessionId: string(),
        requestCount: number(),
      });

      contextManager.setSchema(schema);

      // Valid context
      contextManager.set({
        userId: 'user123',
        sessionId: 'session456',
        requestCount: 5,
      });

      expect(contextManager.get()).toMatchObject({
        userId: 'user123',
        sessionId: 'session456',
        requestCount: 5,
      });
    });

    it('validates with throw mode', () => {
      const schema = object({
        userId: string({ format: 'uuid' }),
      });

      contextManager.setSchema(schema, 'throw');

      expect(() => {
        contextManager.set({
          userId: 'not-a-uuid',
        });
      }).toThrow('Context validation failed');
    });

    it('validates with warn mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const schema = object({
        level: number({ min: 1, max: 5 }),
      });

      contextManager.setSchema(schema, 'warn');

      contextManager.set({
        level: 10,
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ContextManager]'));

      consoleSpy.mockRestore();
    });

    it('validates with silent mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const schema = object({
        required: string(),
      });

      contextManager.setSchema(schema, 'silent');

      contextManager.set({
        // Missing required field
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Complex schemas', () => {
    it('validates nested objects', () => {
      const schema = object({
        user: object({
          id: string(),
          profile: object({
            name: string(),
            tags: array(string()),
          }),
        }),
        metadata: optional(object({}, { additionalProperties: true })),
      });

      contextManager.setSchema(schema, 'throw');

      const validContext = {
        user: {
          id: '123',
          profile: {
            name: 'John',
            tags: ['admin', 'developer'],
          },
        },
      };

      contextManager.set(validContext);
      expect(contextManager.get()).toMatchObject(validContext);

      // Invalid nested field
      expect(() => {
        contextManager.set({
          user: {
            id: '123',
            profile: {
              name: 'John',
              tags: ['admin', 123], // Invalid: number in string array
            },
          },
        });
      }).toThrow();
    });

    it('applies transformations', () => {
      const schema = object({
        email: string({
          toLowerCase: true,
          trim: true,
        }),
        count: {
          type: 'number',
          transform: v => Math.round(v as number),
        },
      });

      contextManager.setSchema(schema);

      contextManager.set({
        email: '  USER@EXAMPLE.COM  ',
        count: 3.7,
      });

      const result = contextManager.get();
      expect(result.email).toBe('user@example.com');
      expect(result.count).toBe(4);
    });

    it('applies default values', () => {
      const schema = object({
        id: string(),
        enabled: { type: 'boolean', default: true },
        count: { type: 'number', default: 0 },
      });

      contextManager.setSchema(schema);

      contextManager.set({
        id: 'test123',
      });

      const result = contextManager.get();
      expect(result).toEqual({
        id: 'test123',
        enabled: true,
        count: 0,
      });
    });
  });

  describe('Schema validation events', () => {
    it('emits schemaSet event', () => {
      return new Promise<void>(resolve => {
        const schema = object({ id: string() });

        contextManager.on('schemaSet', s => {
          expect(s).toBe(schema);
          resolve();
        });

        contextManager.setSchema(schema);
      });
    });

    it('emits schemaValidationFailed event', () => {
      return new Promise<void>(resolve => {
        const schema = object({
          required: string(),
        });

        contextManager.setSchema(schema, 'warn');

        contextManager.on('schemaValidationFailed', ({ result, context }) => {
          expect(result.valid).toBe(false);
          expect(result.errors).toBeDefined();
          expect(context).toEqual({ invalid: 'data' });
          resolve();
        });

        contextManager.set({ invalid: 'data' });
      });
    });
  });

  describe('Performance', () => {
    it('validates contexts quickly', () => {
      const schema = object({
        id: string(),
        timestamp: number(),
        data: object({
          values: array(number()),
          metadata: object({}, { additionalProperties: true }),
        }),
      });

      contextManager.setSchema(schema);

      const context = {
        id: 'test',
        timestamp: Date.now(),
        data: {
          values: Array(100)
            .fill(0)
            .map((_, i) => i),
          metadata: {
            source: 'test',
            version: '1.0.0',
          },
        },
      };

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        contextManager.set(context);
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(2); // Less than 2ms per validation
    });
  });

  describe('Backwards compatibility', () => {
    it('works without schema (legacy mode)', () => {
      // No schema set
      contextManager.set({
        anything: 'goes',
        number: 123,
        nested: { object: true },
      });

      expect(contextManager.get()).toMatchObject({
        anything: 'goes',
        number: 123,
        nested: { object: true },
      });
    });

    it('works with legacy validation rules alongside schema', () => {
      const schema = object({
        id: string(),
      });

      contextManager.setSchema(schema);
      contextManager.setValidationRules({
        required: ['id'],
        custom: ctx => 'id' in ctx,
      });

      contextManager.set({ id: 'test' });
      expect(contextManager.get()).toMatchObject({ id: 'test' });
    });
  });

  describe('Lazy loading', () => {
    it('only loads validator when schema is set', () => {
      // Validator should not exist initially
      expect((contextManager as any).schemaValidator).toBeUndefined();

      const schema = object({ id: string() });
      contextManager.setSchema(schema);
      contextManager.set({ id: 'test' });

      // Validator should now be loaded
      expect((contextManager as any).schemaValidator).toBeDefined();
    });
  });
});

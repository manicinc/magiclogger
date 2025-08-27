/**
 * @fileoverview Tests for TagManager schema validation functionality.
 */

import { TagManager } from '../../../src/core/TagManager';
import { object, string, number, array, enumSchema } from '../../../src/validation/SchemaValidator';

describe('TagManager Schema Validation', () => {
  let tagManager: TagManager;

  beforeEach(() => {
    tagManager = new TagManager();
  });

  afterEach(() => {
    tagManager.destroy();
  });

  describe('String tags (legacy)', () => {
    it('handles string tags without schema', () => {
      const result = tagManager.add(['api', 'user', 'v2']);
      expect(result).toBe(true);

      const { strings } = tagManager.getAllTags();
      expect(strings).toContain('api');
      expect(strings).toContain('user');
      expect(strings).toContain('v2');
    });

    it('normalizes string tags', () => {
      tagManager.add(['API', 'User Login', 'v2.0']);

      const { strings } = tagManager.getAllTags();
      expect(strings).toContain('api');
      expect(strings).toContain('user-login');
      expect(strings).toContain('v2-0');
    });

    it('validates string tags', () => {
      tagManager.setValidationRules({
        minLength: 3,
        pattern: /^[a-z0-9-]+$/,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      tagManager.add(['ab']); // Too short
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Structured tags with schema', () => {
    it('validates structured tags', () => {
      const schema = object({
        category: string({ enum: ['bug', 'feature', 'docs'] }),
        priority: number({ min: 1, max: 5 }),
        labels: array(string()),
      });

      tagManager.setSchema(schema, 'throw');

      const validTag = {
        category: 'bug',
        priority: 3,
        labels: ['urgent', 'regression'],
      };

      expect(tagManager.add(validTag)).toBe(true);

      const { structured } = tagManager.getAllTags();
      expect(structured).toContainEqual(validTag);
    });

    it('rejects invalid structured tags in throw mode', () => {
      const schema = object({
        type: enumSchema('error', 'warning', 'info'),
        level: number({ min: 1, max: 10 }),
      });

      tagManager.setSchema(schema, 'throw');

      expect(() => {
        tagManager.add({
          type: 'debug', // Invalid enum value
          level: 5,
        });
      }).toThrow('Tag schema validation failed');
    });

    it('warns on invalid tags in warn mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const schema = object({
        severity: number({ min: 1, max: 5 }),
      });

      tagManager.setSchema(schema, 'warn');

      tagManager.add({
        severity: 10, // Out of range
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[TagManager]'));

      consoleSpy.mockRestore();
    });

    it('silently continues in silent mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const schema = object({
        required: string(),
      });

      tagManager.setSchema(schema, 'silent');

      const result = tagManager.add({});
      expect(result).toBe(true); // Doesn't throw
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Mixed mode', () => {
    it('handles both string and structured tags', () => {
      const schema = object({
        category: string(),
        severity: number(),
      });

      tagManager.setSchema(schema);

      // Add string tags
      tagManager.add(['api', 'v2']);

      // Add structured tag
      tagManager.add({
        category: 'error',
        severity: 3,
      });

      const allTags = tagManager.getAllTags();
      expect(allTags.strings).toContain('api');
      expect(allTags.strings).toContain('v2');
      expect(allTags.structured).toHaveLength(1);
      expect(allTags.structured[0]).toMatchObject({
        category: 'error',
        severity: 3,
      });
    });

    it('allows mixed types when configured', () => {
      const schema = object({
        type: string(),
      });

      tagManager = new TagManager({
        allowMixedTypes: true,
        schema,
      });

      expect(tagManager.add('simple-tag')).toBe(true);
      expect(tagManager.add({ type: 'structured' })).toBe(true);
    });
  });

  describe('Schema transformations', () => {
    it('applies transformations to structured tags', () => {
      const schema = object({
        name: string({
          toLowerCase: true,
          trim: true,
        }),
        value: {
          type: 'number',
          transform: v => Math.abs(v as number),
        },
      });

      tagManager.setSchema(schema);

      tagManager.add({
        name: '  ERROR  ',
        value: -42,
      });

      const { structured } = tagManager.getAllTags();
      expect(structured[0]).toEqual({
        name: 'error',
        value: 42,
      });
    });
  });

  describe('Events', () => {
    it('emits schemaSet event', () => {
      return new Promise<void>(resolve => {
        const schema = object({ type: string() });

        tagManager.on('schemaSet', s => {
          expect(s).toBe(schema);
          resolve();
        });

        tagManager.setSchema(schema);
      });
    });

    it('emits structuredTagAdded event', () => {
      return new Promise<void>(resolve => {
        const schema = object({ id: string() });
        tagManager.setSchema(schema);

        tagManager.on('structuredTagAdded', tag => {
          expect(tag).toEqual({ id: 'test' });
          resolve();
        });

        tagManager.add({ id: 'test' });
      });
    });

    it('emits schemaValidationFailed event', () => {
      return new Promise<void>(resolve => {
        const schema = object({ required: string() });
        tagManager.setSchema(schema, 'warn');

        tagManager.on('schemaValidationFailed', ({ result, data }) => {
          expect(result.valid).toBe(false);
          expect(data).toEqual({ invalid: true });
          resolve();
        });

        tagManager.add({ invalid: true });
      });
    });
  });

  describe('Performance', () => {
    it('validates structured tags quickly', () => {
      const schema = object({
        category: enumSchema('bug', 'feature', 'improvement'),
        priority: number({ min: 1, max: 5 }),
        components: array(string()),
        metadata: object({}, { additionalProperties: true }),
      });

      tagManager.setSchema(schema);

      const tag = {
        category: 'feature',
        priority: 3,
        components: ['auth', 'api', 'database'],
        metadata: {
          reporter: 'user123',
          created: Date.now(),
        },
      };

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        tagManager.add(tag);
        tagManager.clear(); // Clear to avoid accumulation
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(1); // Less than 1ms per validation
    });

    it('handles many tags efficiently', () => {
      const schema = object({
        id: string(),
        value: number(),
      });

      tagManager.setSchema(schema);

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        tagManager.add({
          id: `tag${i}`,
          value: i,
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // Should handle 100 tags in under 50ms
    });
  });

  describe('Clear functionality', () => {
    it('clears both string and structured tags', () => {
      const schema = object({ id: string() });
      tagManager.setSchema(schema);

      tagManager.add(['string1', 'string2']);
      tagManager.add({ id: 'structured1' });

      expect(tagManager.getAllTags().strings).toHaveLength(2);
      expect(tagManager.getAllTags().structured).toHaveLength(1);

      tagManager.clear();

      expect(tagManager.getAllTags().strings).toHaveLength(0);
      expect(tagManager.getAllTags().structured).toHaveLength(0);
    });
  });

  describe('Lazy loading', () => {
    it('only loads validator when schema is used', () => {
      // Validator should not exist initially
      expect((tagManager as any).schemaValidator).toBeUndefined();

      // Add string tags - no validator needed
      tagManager.add(['tag1', 'tag2']);
      expect((tagManager as any).schemaValidator).toBeUndefined();

      // Set schema and add structured tag
      const schema = object({ id: string() });
      tagManager.setSchema(schema);
      tagManager.add({ id: 'test' });

      // Validator should now be loaded
      expect((tagManager as any).schemaValidator).toBeDefined();
    });
  });
});

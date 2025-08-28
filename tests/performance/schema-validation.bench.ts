/**
 * @fileoverview Performance benchmarks for schema validation.
 */

import {
  SchemaValidator,
  object,
  string,
  number,
  array,
  optional,
} from '../../src/validation/SchemaValidator';
import { ContextManager } from '../../src/core/ContextManager';
import { TagManager } from '../../src/core/TagManager';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  opsPerSec: number;
}

function benchmark(name: string, fn: () => void, iterations = 10000): BenchmarkResult {
  // Warm up
  for (let i = 0; i < 100; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const totalTime = performance.now() - start;

  return {
    name,
    iterations,
    totalTime,
    avgTime: totalTime / iterations,
    opsPerSec: Math.round((iterations / totalTime) * 1000),
  };
}

describe('Schema Validation Performance', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('Simple schemas', () => {
    it('validates strings quickly', () => {
      const schema = string({ minLength: 3, maxLength: 50 });
      const result = benchmark('String validation', () => {
        validator.validate('test string', schema);
      });

      console.log(`String validation: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(100000); // Should handle 100k+ ops/sec
    });

    it('validates numbers quickly', () => {
      const schema = number({ min: 0, max: 100 });
      const result = benchmark('Number validation', () => {
        validator.validate(42, schema);
      });

      console.log(`Number validation: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(100000);
    });

    it('validates booleans quickly', () => {
      const schema = { type: 'boolean' as const };
      const result = benchmark('Boolean validation', () => {
        validator.validate(true, schema);
      });

      console.log(`Boolean validation: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(200000);
    });
  });

  describe('Complex schemas', () => {
    it('validates objects efficiently', () => {
      const schema = object({
        id: string({ format: 'uuid' }),
        name: string({ minLength: 1, maxLength: 100 }),
        age: number({ min: 0, max: 150 }),
        email: optional(string({ format: 'email' })),
        tags: array(string()),
      });

      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        tags: ['user', 'premium', 'verified'],
      };

      const result = benchmark('Complex object validation', () => {
        validator.validate(data, schema);
      });

      console.log(`Complex object: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(20000); // Should handle 20k+ ops/sec
    });

    it('validates nested objects efficiently', () => {
      const schema = object({
        user: object({
          id: string(),
          profile: object({
            name: string(),
            bio: optional(string()),
            social: object({
              twitter: optional(string()),
              github: optional(string()),
            }),
          }),
        }),
        metadata: object({
          created: number(),
          updated: number(),
        }),
      });

      const data = {
        user: {
          id: 'user123',
          profile: {
            name: 'John',
            bio: 'Developer',
            social: {
              twitter: '@john',
              github: 'john',
            },
          },
        },
        metadata: {
          created: Date.now(),
          updated: Date.now(),
        },
      };

      const result = benchmark(
        'Nested object validation',
        () => {
          validator.validate(data, schema);
        },
        5000
      );

      console.log(`Nested object: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(10000); // Should handle 10k+ ops/sec
    });

    it('validates arrays efficiently', () => {
      const schema = array(
        object({
          id: number(),
          value: string(),
        })
      );

      const data = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: i,
          value: `value${i}`,
        }));

      const result = benchmark(
        'Large array validation',
        () => {
          validator.validate(data, schema);
        },
        1000
      );

      console.log(`Array (100 items): ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(1000); // Should handle 1k+ ops/sec
    });
  });

  describe('ContextManager performance', () => {
    it('validates context quickly with schema', () => {
      const contextManager = new ContextManager();
      const schema = object({
        userId: string(),
        sessionId: string(),
        requestId: optional(string()),
        timestamp: number(),
      });

      contextManager.setSchema(schema);

      const context = {
        userId: 'user123',
        sessionId: 'session456',
        requestId: 'req789',
        timestamp: Date.now(),
      };

      const result = benchmark(
        'ContextManager with schema',
        () => {
          contextManager.set(context);
        },
        5000
      );

      console.log(`ContextManager: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(5000);

      contextManager.destroy();
    });

    it('performs well without schema (baseline)', () => {
      const contextManager = new ContextManager();

      const context = {
        userId: 'user123',
        sessionId: 'session456',
        requestId: 'req789',
        timestamp: Date.now(),
      };

      const result = benchmark(
        'ContextManager without schema',
        () => {
          contextManager.set(context);
        },
        5000
      );

      console.log(`ContextManager (no schema): ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(10000);

      contextManager.destroy();
    });
  });

  describe('TagManager performance', () => {
    it('validates structured tags quickly', () => {
      const tagManager = new TagManager();
      const schema = object({
        category: string(),
        priority: number({ min: 1, max: 5 }),
      });

      tagManager.setSchema(schema);

      const tag = {
        category: 'bug',
        priority: 3,
      };

      const result = benchmark(
        'TagManager structured tags',
        () => {
          tagManager.add(tag);
          tagManager.clear(); // Clear to avoid accumulation
        },
        5000
      );

      console.log(`TagManager structured: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(5000);

      tagManager.destroy();
    });

    it('handles string tags efficiently (baseline)', () => {
      const tagManager = new TagManager();

      const result = benchmark(
        'TagManager string tags',
        () => {
          tagManager.add(['tag1', 'tag2', 'tag3']);
          tagManager.clear();
        },
        5000
      );

      console.log(`TagManager strings: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(10000);

      tagManager.destroy();
    });
  });

  describe('Optimization targets', () => {
    it('caches validation results for repeated schemas', () => {
      const schema = object({
        id: string(),
        value: number(),
      });

      const data = { id: 'test', value: 42 };

      // First run - no cache
      const firstRun = benchmark(
        'First validation',
        () => {
          validator.validate(data, schema);
        },
        1000
      );

      // Subsequent runs - should be faster if caching works
      const cachedRun = benchmark(
        'Cached validation',
        () => {
          validator.validate(data, schema);
        },
        10000
      );

      console.log(`First run: ${firstRun.opsPerSec.toLocaleString()} ops/sec`);
      console.log(`Cached run: ${cachedRun.opsPerSec.toLocaleString()} ops/sec`);

      // Cached should be at least as fast (ideally faster)
      expect(cachedRun.opsPerSec).toBeGreaterThanOrEqual(firstRun.opsPerSec);
    });

    it('handles deep recursion efficiently', () => {
      // Create a deeply nested schema
      let schema: object = string();
      for (let i = 0; i < 20; i++) {
        schema = object({ nested: schema });
      }

      // Create matching deeply nested data
      let data: unknown = 'value';
      for (let i = 0; i < 20; i++) {
        data = { nested: data };
      }

      const result = benchmark(
        'Deep recursion (20 levels)',
        () => {
          validator.validate(data, schema);
        },
        1000
      );

      console.log(`Deep recursion: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(1000); // Should still be reasonably fast
    });

    it('validates with minimal overhead when validation is disabled', () => {
      const contextManager = new ContextManager({ enableValidation: false });
      const schema = object({
        id: string(),
        data: array(number()),
      });

      contextManager.setSchema(schema);

      const context = {
        id: 'test',
        data: [1, 2, 3, 4, 5],
      };

      const result = benchmark(
        'Disabled validation',
        () => {
          contextManager.set(context);
        },
        10000
      );

      console.log(`Disabled validation: ${result.opsPerSec.toLocaleString()} ops/sec`);
      expect(result.opsPerSec).toBeGreaterThan(50000); // Should be very fast when disabled

      contextManager.destroy();
    });
  });

  describe('Memory efficiency', () => {
    it('does not leak memory with repeated validations', () => {
      const schema = object({
        id: string(),
        data: array(number()),
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Run many validations
      for (let i = 0; i < 10000; i++) {
        validator.validate(
          {
            id: `id${i}`,
            data: [1, 2, 3, 4, 5],
          },
          schema
        );
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);

      // Should not increase by more than 10MB for 10k validations
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});

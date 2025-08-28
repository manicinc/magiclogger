/**
 * @fileoverview Comprehensive tests for SchemaValidator.
 */

import {
  SchemaValidator,
  string,
  number,
  boolean,
  object,
  array,
  union,
  literal,
  enumSchema,
  optional,
  nullable,
  type StringSchema,
  type NumberSchema,
  type ObjectSchema,
} from '../../../src/validation/SchemaValidator';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('String validation', () => {
    it('validates basic strings', () => {
      const schema = string();

      expect(validator.validate('hello', schema)).toEqual({
        valid: true,
        data: 'hello',
      });

      expect(validator.validate(123, schema).valid).toBe(false);
      expect(validator.validate(null, schema).valid).toBe(false);
    });

    it('validates string length constraints', () => {
      const schema = string({ minLength: 3, maxLength: 10 });

      expect(validator.validate('hello', schema).valid).toBe(true);
      expect(validator.validate('hi', schema).valid).toBe(false);
      expect(validator.validate('this is too long', schema).valid).toBe(false);
    });

    it('validates string patterns', () => {
      const schema = string({ pattern: /^[A-Z]+$/ });

      expect(validator.validate('HELLO', schema).valid).toBe(true);
      expect(validator.validate('hello', schema).valid).toBe(false);
      expect(validator.validate('Hello', schema).valid).toBe(false);
    });

    it('validates string formats', () => {
      const emailSchema = string({ format: 'email' });
      expect(validator.validate('user@example.com', emailSchema).valid).toBe(true);
      expect(validator.validate('invalid-email', emailSchema).valid).toBe(false);

      const uuidSchema = string({ format: 'uuid' });
      expect(validator.validate('123e4567-e89b-12d3-a456-426614174000', uuidSchema).valid).toBe(
        true
      );
      expect(validator.validate('not-a-uuid', uuidSchema).valid).toBe(false);

      const urlSchema = string({ format: 'url' });
      expect(validator.validate('https://example.com', urlSchema).valid).toBe(true);
      expect(validator.validate('not-a-url', urlSchema).valid).toBe(false);
    });

    it('applies string transformations', () => {
      const schema = string({
        trim: true,
        toLowerCase: true,
      });

      const result = validator.validate('  HELLO  ', schema);
      expect(result.valid).toBe(true);
      expect(result.data).toBe('hello');
    });
  });

  describe('Number validation', () => {
    it('validates basic numbers', () => {
      const schema = number();

      expect(validator.validate(42, schema).valid).toBe(true);
      expect(validator.validate(3.14, schema).valid).toBe(true);
      expect(validator.validate('42', schema).valid).toBe(false);
      expect(validator.validate(NaN, schema).valid).toBe(false);
    });

    it('validates number ranges', () => {
      const schema = number({ min: 0, max: 100 });

      expect(validator.validate(50, schema).valid).toBe(true);
      expect(validator.validate(0, schema).valid).toBe(true);
      expect(validator.validate(100, schema).valid).toBe(true);
      expect(validator.validate(-1, schema).valid).toBe(false);
      expect(validator.validate(101, schema).valid).toBe(false);
    });

    it('validates integer constraint', () => {
      const schema = number({ integer: true });

      expect(validator.validate(42, schema).valid).toBe(true);
      expect(validator.validate(3.14, schema).valid).toBe(false);
    });

    it('validates positive/negative constraints', () => {
      const positiveSchema = number({ positive: true });
      expect(validator.validate(42, positiveSchema).valid).toBe(true);
      expect(validator.validate(-42, positiveSchema).valid).toBe(false);
      expect(validator.validate(0, positiveSchema).valid).toBe(false);

      const negativeSchema = number({ negative: true });
      expect(validator.validate(-42, negativeSchema).valid).toBe(true);
      expect(validator.validate(42, negativeSchema).valid).toBe(false);
      expect(validator.validate(0, negativeSchema).valid).toBe(false);
    });
  });

  describe('Boolean validation', () => {
    it('validates booleans', () => {
      const schema = boolean();

      expect(validator.validate(true, schema).valid).toBe(true);
      expect(validator.validate(false, schema).valid).toBe(true);
      expect(validator.validate('true', schema).valid).toBe(false);
      expect(validator.validate(1, schema).valid).toBe(false);
    });

    it('coerces to boolean when enabled', () => {
      const schema = boolean({ coerce: true });

      expect(validator.validate(1, schema)).toEqual({ valid: true, data: true });
      expect(validator.validate(0, schema)).toEqual({ valid: true, data: false });
      expect(validator.validate('yes', schema)).toEqual({ valid: true, data: true });
      expect(validator.validate('', schema)).toEqual({ valid: true, data: false });
    });
  });

  describe('Object validation', () => {
    it('validates basic objects', () => {
      const schema = object({
        name: string(),
        age: number(),
      });

      expect(validator.validate({ name: 'John', age: 30 }, schema).valid).toBe(true);
      expect(validator.validate({ name: 'John' }, schema).valid).toBe(false);
      expect(validator.validate({ name: 123, age: 30 }, schema).valid).toBe(false);
    });

    it('validates required fields', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          id: string(),
          name: optional(string()),
        },
        required: ['id'],
      };

      expect(validator.validate({ id: '123' }, schema).valid).toBe(true);
      expect(validator.validate({ id: '123', name: 'John' }, schema).valid).toBe(true);
      expect(validator.validate({ name: 'John' }, schema).valid).toBe(false);
    });

    it('handles additional properties', () => {
      const strictSchema: ObjectSchema = {
        type: 'object',
        properties: { id: string() },
        additionalProperties: false,
      };

      expect(validator.validate({ id: '123' }, strictSchema).valid).toBe(true);
      expect(validator.validate({ id: '123', extra: 'field' }, strictSchema).valid).toBe(false);

      const flexibleSchema: ObjectSchema = {
        type: 'object',
        properties: { id: string() },
        additionalProperties: true,
      };

      expect(validator.validate({ id: '123', extra: 'field' }, flexibleSchema).valid).toBe(true);
    });

    it('validates nested objects', () => {
      const schema = object({
        user: object({
          id: string(),
          profile: object({
            name: string(),
            age: number(),
          }),
        }),
      });

      const valid = {
        user: {
          id: '123',
          profile: {
            name: 'John',
            age: 30,
          },
        },
      };

      expect(validator.validate(valid, schema).valid).toBe(true);

      const invalid = {
        user: {
          id: '123',
          profile: {
            name: 'John',
            age: 'thirty',
          },
        },
      };

      expect(validator.validate(invalid, schema).valid).toBe(false);
    });
  });

  describe('Array validation', () => {
    it('validates basic arrays', () => {
      const schema = array(string());

      expect(validator.validate(['a', 'b', 'c'], schema).valid).toBe(true);
      expect(validator.validate([], schema).valid).toBe(true);
      expect(validator.validate(['a', 123, 'c'], schema).valid).toBe(false);
      expect(validator.validate('not an array', schema).valid).toBe(false);
    });

    it('validates array length constraints', () => {
      const schema = array(number(), { minItems: 2, maxItems: 5 });

      expect(validator.validate([1, 2, 3], schema).valid).toBe(true);
      expect(validator.validate([1], schema).valid).toBe(false);
      expect(validator.validate([1, 2, 3, 4, 5, 6], schema).valid).toBe(false);
    });

    it('validates unique items', () => {
      const schema = array(number(), { uniqueItems: true });

      expect(validator.validate([1, 2, 3], schema).valid).toBe(true);
      expect(validator.validate([1, 2, 2, 3], schema).valid).toBe(false);
    });
  });

  describe('Union validation', () => {
    it('validates union types', () => {
      const schema = union(string(), number());

      expect(validator.validate('hello', schema).valid).toBe(true);
      expect(validator.validate(42, schema).valid).toBe(true);
      expect(validator.validate(true, schema).valid).toBe(false);
    });

    it('validates complex unions', () => {
      const schema = union(
        object({ type: literal('user'), name: string() }),
        object({ type: literal('admin'), name: string(), level: number() })
      );

      expect(validator.validate({ type: 'user', name: 'John' }, schema).valid).toBe(true);
      expect(validator.validate({ type: 'admin', name: 'Jane', level: 5 }, schema).valid).toBe(
        true
      );
      expect(validator.validate({ type: 'guest', name: 'Bob' }, schema).valid).toBe(false);
    });
  });

  describe('Literal and Enum validation', () => {
    it('validates literal values', () => {
      const schema = literal('exact');

      expect(validator.validate('exact', schema).valid).toBe(true);
      expect(validator.validate('different', schema).valid).toBe(false);
    });

    it('validates enum values', () => {
      const schema = enumSchema('red', 'green', 'blue');

      expect(validator.validate('red', schema).valid).toBe(true);
      expect(validator.validate('green', schema).valid).toBe(true);
      expect(validator.validate('yellow', schema).valid).toBe(false);
    });
  });

  describe('Optional and Nullable', () => {
    it('handles optional fields', () => {
      const schema = optional(string());

      expect(validator.validate('hello', schema).valid).toBe(true);
      expect(validator.validate(undefined, schema).valid).toBe(true);
      expect(validator.validate(null, schema).valid).toBe(false);
    });

    it('handles nullable fields', () => {
      const schema = nullable(string());

      expect(validator.validate('hello', schema).valid).toBe(true);
      expect(validator.validate(null, schema).valid).toBe(true);
      expect(validator.validate(undefined, schema).valid).toBe(false);
    });

    it('handles optional and nullable combined', () => {
      const schema = optional(nullable(string()));

      expect(validator.validate('hello', schema).valid).toBe(true);
      expect(validator.validate(null, schema).valid).toBe(true);
      expect(validator.validate(undefined, schema).valid).toBe(true);
    });
  });

  describe('Custom validation', () => {
    it('applies custom validation functions', () => {
      const schema: StringSchema = {
        type: 'string',
        validate: value => {
          const str = value as string;
          if (str.length < 5) return 'Too short';
          if (!str.includes('@')) return 'Must contain @';
          return true;
        },
      };

      expect(validator.validate('hello@world', schema).valid).toBe(true);
      expect(validator.validate('test', schema).valid).toBe(false);
      expect(validator.validate('hello', schema).valid).toBe(false);
    });

    it('applies transformations', () => {
      const schema: NumberSchema = {
        type: 'number',
        transform: value => Math.round(value as number),
      };

      const result = validator.validate(3.7, schema);
      expect(result.valid).toBe(true);
      expect(result.data).toBe(4);
    });
  });

  describe('Default values', () => {
    it('applies default values for missing fields', () => {
      const schema = object({
        id: string(),
        count: { type: 'number', default: 0 },
        enabled: { type: 'boolean', default: true },
      });

      const result = validator.validate({ id: '123' }, schema);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({
        id: '123',
        count: 0,
        enabled: true,
      });
    });
  });

  describe('Error reporting', () => {
    it('provides detailed error paths', () => {
      const schema = object({
        user: object({
          profile: object({
            age: number(),
          }),
        }),
      });

      const result = validator.validate(
        {
          user: {
            profile: {
              age: 'invalid',
            },
          },
        },
        schema
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].path).toBe('user.profile.age');
      expect(result.errors?.[0].message).toContain('Expected number');
    });

    it('reports multiple errors', () => {
      const schema = object({
        name: string({ minLength: 3 }),
        age: number({ min: 0 }),
        email: string({ format: 'email' }),
      });

      const result = validator.validate(
        {
          name: 'ab',
          age: -5,
          email: 'not-an-email',
        },
        schema
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('validates large objects quickly', () => {
      const schema = object({
        id: string(),
        data: array(
          object({
            key: string(),
            value: number(),
          })
        ),
      });

      const largeObject = {
        id: 'test',
        data: Array(1000)
          .fill(null)
          .map((_, i) => ({
            key: `key${i}`,
            value: i,
          })),
      };

      // Warm up
      validator.validate(largeObject, schema);

      const start = performance.now();
      const result = validator.validate(largeObject, schema);
      const duration = performance.now() - start;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(200); // Should validate in under 200ms for 1000 items
    });

    it('handles deeply nested objects efficiently', () => {
      let schema: object = string();
      for (let i = 0; i < 10; i++) {
        schema = object({ nested: schema });
      }

      let data: unknown = 'value';
      for (let i = 0; i < 10; i++) {
        data = { nested: data };
      }

      const start = performance.now();
      const result = validator.validate(data, schema);
      const duration = performance.now() - start;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(50); // Should be fast even with deep nesting
    });
  });
});

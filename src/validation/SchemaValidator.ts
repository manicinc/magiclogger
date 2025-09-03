/**
 * @fileoverview Lightweight, tree-shakeable schema validation for MagicLogger.
 *
 * This module provides runtime validation for log contexts and tags without
 * heavy dependencies. It's designed to be lazily imported and fully tree-shakeable.
 *
 * @module validation/SchemaValidator
 */

/**
 * Represents a validation error with details about what failed.
 *
 * @interface ValidationError
 */
export interface ValidationError {
  /** The field path that failed validation (e.g., "user.email") */
  path: string;
  /** Human-readable error message */
  message: string;
  /** The actual value that failed validation */
  value?: unknown;
  /** The expected type or constraint */
  expected?: string;
}

/**
 * Result of a schema validation operation.
 *
 * @interface ValidationResult
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Array of validation errors if validation failed */
  errors?: ValidationError[];
  /** The validated and potentially transformed data */
  data?: unknown;
}

/**
 * Base type for all schema definitions.
 *
 * @interface Schema
 */
export interface Schema {
  /** The type of validation to perform */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any' | 'union' | 'literal' | 'enum';
  /** Whether this field is optional */
  optional?: boolean;
  /** Whether to allow null values */
  nullable?: boolean;
  /** Custom validation function */
  validate?: (value: unknown) => boolean | string;
  /** Transform function to modify the value after validation */
  transform?: (value: unknown) => unknown;
  /** Default value if field is missing */
  default?: unknown;
  /** Description for documentation */
  description?: string;
}

/**
 * String schema with string-specific validations.
 *
 * @interface StringSchema
 * @extends {Schema}
 */
export interface StringSchema extends Schema {
  type: 'string';
  /** Minimum length constraint */
  minLength?: number;
  /** Maximum length constraint */
  maxLength?: number;
  /** Regex pattern to match */
  pattern?: RegExp;
  /** Predefined format (email, url, uuid, etc.) */
  format?: 'email' | 'url' | 'uuid' | 'date' | 'time' | 'datetime' | 'ipv4' | 'ipv6';
  /** Trim whitespace */
  trim?: boolean;
  /** Convert to lowercase */
  toLowerCase?: boolean;
  /** Convert to uppercase */
  toUpperCase?: boolean;
  /** Restrict to one of the allowed string values */
  enum?: string[];
}

/**
 * Number schema with numeric validations.
 *
 * @interface NumberSchema
 * @extends {Schema}
 */
export interface NumberSchema extends Schema {
  type: 'number';
  /** Minimum value (inclusive) */
  min?: number;
  /** Maximum value (inclusive) */
  max?: number;
  /** Must be an integer */
  integer?: boolean;
  /** Must be positive */
  positive?: boolean;
  /** Must be negative */
  negative?: boolean;
  /** Must be a multiple of this value */
  multipleOf?: number;
}

/**
 * Boolean schema.
 *
 * @interface BooleanSchema
 * @extends {Schema}
 */
export interface BooleanSchema extends Schema {
  type: 'boolean';
  /** Coerce truthy/falsy values to boolean */
  coerce?: boolean;
}

/**
 * Object schema with nested field definitions.
 *
 * @interface ObjectSchema
 * @extends {Schema}
 */
export interface ObjectSchema extends Schema {
  type: 'object';
  /** Schema for each property */
  properties?: Record<string, AnySchema>;
  /** Required property names */
  required?: string[];
  /** Allow additional properties not defined in schema */
  additionalProperties?: boolean | AnySchema;
  /** Minimum number of properties */
  minProperties?: number;
  /** Maximum number of properties */
  maxProperties?: number;
}

/**
 * Array schema with item validation.
 *
 * @interface ArraySchema
 * @extends {Schema}
 */
export interface ArraySchema extends Schema {
  type: 'array';
  /** Schema for array items */
  items?: AnySchema;
  /** Minimum array length */
  minItems?: number;
  /** Maximum array length */
  maxItems?: number;
  /** All items must be unique */
  uniqueItems?: boolean;
}

/**
 * Union schema - value must match one of the schemas.
 *
 * @interface UnionSchema
 * @extends {Schema}
 */
export interface UnionSchema extends Schema {
  type: 'union';
  /** Possible schemas to match */
  schemas: AnySchema[];
}

/**
 * Literal schema - exact value match.
 *
 * @interface LiteralSchema
 * @extends {Schema}
 */
export interface LiteralSchema extends Schema {
  type: 'literal';
  /** The exact value to match */
  value: unknown;
}

/**
 * Enum schema - value must be one of the allowed values.
 *
 * @interface EnumSchema
 * @extends {Schema}
 */
export interface EnumSchema extends Schema {
  type: 'enum';
  /** Allowed values */
  values: unknown[];
}

/**
 * Any schema type union.
 */
export type AnySchema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ObjectSchema
  | ArraySchema
  | UnionSchema
  | LiteralSchema
  | EnumSchema
  | Schema;

/**
 * Main schema validator class.
 *
 * @class SchemaValidator
 *
 * @example
 * ```typescript
 * const validator = new SchemaValidator();
 *
 * const userSchema: ObjectSchema = {
 *   type: 'object',
 *   properties: {
 *     id: { type: 'string', format: 'uuid' },
 *     email: { type: 'string', format: 'email' },
 *     age: { type: 'number', min: 0, max: 150 },
 *     roles: {
 *       type: 'array',
 *       items: { type: 'string' }
 *     }
 *   },
 *   required: ['id', 'email']
 * };
 *
 * const result = validator.validate(data, userSchema);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export class SchemaValidator {
  private errors: ValidationError[] = [];
  private currentPath: string[] = [];
  // private compiledSchemas = new WeakMap<AnySchema, unknown>(); // Removed unused variable

  /**
   * Validates data against a schema.
   *
   * @param {unknown} data - The data to validate
   * @param {AnySchema} schema - The schema to validate against
   * @returns {ValidationResult} The validation result
   */
  public validate(data: unknown, schema: AnySchema): ValidationResult {
    this.errors = [];
    this.currentPath = [];

    try {
      const validatedData = this.validateValue(data, schema);
      return {
        valid: this.errors.length === 0,
        errors: this.errors.length > 0 ? this.errors : undefined,
        data: validatedData,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            path: this.getCurrentPath(),
            message: error instanceof Error ? error.message : 'Unknown validation error',
          },
        ],
      };
    }
  }

  /**
   * Validates a single value against a schema.
   *
   * @private
   * @param {unknown} value - The value to validate
   * @param {AnySchema} schema - The schema to validate against
   * @returns {unknown} The validated and potentially transformed value
   */
  private validateValue(value: unknown, schema: AnySchema): unknown {
    // Handle undefined/null
    if (value === undefined) {
      if (schema.default !== undefined) {
        value = typeof schema.default === 'function' ? schema.default() : schema.default;
      } else if (schema.optional) {
        return undefined;
      } else {
        this.addError('Required field is missing');
        return undefined;
      }
    }

    if (value === null) {
      if (schema.nullable) {
        return null;
      } else {
        this.addError('Field cannot be null');
        return null;
      }
    }

    // Type-specific validation
    let result: unknown = value;

    switch (schema.type) {
      case 'string':
        result = this.validateString(value, schema as StringSchema);
        break;
      case 'number':
        result = this.validateNumber(value, schema as NumberSchema);
        break;
      case 'boolean':
        result = this.validateBoolean(value, schema as BooleanSchema);
        break;
      case 'object':
        result = this.validateObject(value, schema as ObjectSchema);
        break;
      case 'array':
        result = this.validateArray(value, schema as ArraySchema);
        break;
      case 'union':
        result = this.validateUnion(value, schema as UnionSchema);
        break;
      case 'literal':
        result = this.validateLiteral(value, schema as LiteralSchema);
        break;
      case 'enum':
        result = this.validateEnum(value, schema as EnumSchema);
        break;
      case 'any':
        result = value;
        break;
      default:
        this.addError(`Unknown schema type: ${(schema as Record<string, unknown>).type}`);
    }

    // Custom validation
    if (schema.validate && result !== undefined) {
      const customResult = schema.validate(result);
      if (customResult !== true) {
        this.addError(typeof customResult === 'string' ? customResult : 'Custom validation failed');
      }
    }

    // Transform
    if (schema.transform && result !== undefined) {
      result = schema.transform(result);
    }

    return result;
  }

  /**
   * Validates a string value.
   *
   * @private
   */
  private validateString(value: unknown, schema: StringSchema): string | undefined {
    if (typeof value !== 'string') {
      this.addError(`Expected string, got ${typeof value}`);
      return undefined;
    }

    let str = value;

    // Transformations
    if (schema.trim) str = str.trim();
    if (schema.toLowerCase) str = str.toLowerCase();
    if (schema.toUpperCase) str = str.toUpperCase();

    // Length validation
    if (schema.minLength !== undefined && str.length < schema.minLength) {
      this.addError(`String length ${str.length} is less than minimum ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && str.length > schema.maxLength) {
      this.addError(`String length ${str.length} exceeds maximum ${schema.maxLength}`);
    }

    // Pattern validation
    if (schema.pattern && !schema.pattern.test(str)) {
      this.addError(`String does not match pattern ${schema.pattern}`);
    }

    // Format validation
    if (schema.format) {
      if (!this.validateFormat(str, schema.format)) {
        this.addError(`Invalid ${schema.format} format`);
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(str)) {
      this.addError(`Value must be one of: ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`);
    }

    return str;
  }

  /**
   * Validates string formats.
   *
   * @private
   */
  private validateFormat(value: string, format: string): boolean {
    const formats: Record<string, RegExp> = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      date: /^\d{4}-\d{2}-\d{2}$/,
      time: /^\d{2}:\d{2}(:\d{2})?$/,
      datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
      ipv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
    };

    return formats[format]?.test(value) ?? true;
  }

  /**
   * Validates a number value.
   *
   * @private
   */
  private validateNumber(value: unknown, schema: NumberSchema): number | undefined {
    if (typeof value !== 'number' || isNaN(value)) {
      this.addError(`Expected number, got ${typeof value}`);
      return undefined;
    }

    if (schema.integer && !Number.isInteger(value)) {
      this.addError('Expected integer');
    }

    if (schema.min !== undefined && value < schema.min) {
      this.addError(`Value ${value} is less than minimum ${schema.min}`);
    }

    if (schema.max !== undefined && value > schema.max) {
      this.addError(`Value ${value} exceeds maximum ${schema.max}`);
    }

    if (schema.positive && value <= 0) {
      this.addError('Value must be positive');
    }

    if (schema.negative && value >= 0) {
      this.addError('Value must be negative');
    }

    if (schema.multipleOf !== undefined && value % schema.multipleOf !== 0) {
      this.addError(`Value must be a multiple of ${schema.multipleOf}`);
    }

    return value;
  }

  /**
   * Validates a boolean value.
   *
   * @private
   */
  private validateBoolean(value: unknown, schema: BooleanSchema): boolean | undefined {
    if (schema.coerce) {
      return !!value;
    }

    if (typeof value !== 'boolean') {
      this.addError(`Expected boolean, got ${typeof value}`);
      return undefined;
    }

    return value;
  }

  /**
   * Validates an object value.
   *
   * @private
   */
  private validateObject(
    value: unknown,
    schema: ObjectSchema
  ): Record<string, unknown> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      this.addError(`Expected object, got ${Array.isArray(value) ? 'array' : typeof value}`);
      return undefined;
    }

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    const hasProperties = schema.properties && Object.keys(schema.properties).length > 0;
    const hasAdditionalProps = schema.additionalProperties !== undefined;

    // Fast path: if no schema validation needed, return object as-is
    if (
      !hasProperties &&
      !schema.required &&
      !hasAdditionalProps &&
      schema.minProperties === undefined &&
      schema.maxProperties === undefined
    ) {
      return { ...obj };
    }

    // Validate defined properties
    if (hasProperties && schema.properties) {
      const properties = schema.properties;
      for (const key in properties) {
        this.currentPath.push(key);
        const propertySchema = properties[key];
        if (propertySchema) {
          result[key] = this.validateValue(obj[key], propertySchema);
        }
        this.currentPath.pop();
      }
    }

    // Check required fields (optimized)
    if (schema.required && schema.required.length > 0) {
      for (let i = 0; i < schema.required.length; i++) {
        const key = schema.required[i];
        if (key && !(key in obj)) {
          this.currentPath.push(key);
          this.addError('Required field is missing');
          this.currentPath.pop();
        }
      }
    }

    // Handle additional properties (optimized)
    if (hasProperties || hasAdditionalProps) {
      const definedKeys =
        hasProperties && schema.properties ? new Set(Object.keys(schema.properties)) : new Set();
      const objKeys = Object.keys(obj);

      for (let i = 0; i < objKeys.length; i++) {
        const key = objKeys[i];
        if (key && !definedKeys.has(key)) {
          if (schema.additionalProperties === false) {
            this.currentPath.push(key);
            this.addError('Additional property not allowed');
            this.currentPath.pop();
          } else if (typeof schema.additionalProperties === 'object') {
            this.currentPath.push(key);
            result[key] = this.validateValue(obj[key], schema.additionalProperties);
            this.currentPath.pop();
          } else {
            result[key] = obj[key];
          }
        }
      }
    } else {
      // No property restrictions, copy all properties
      Object.assign(result, obj);
    }

    // Property count validation (only if needed)
    if (schema.minProperties !== undefined || schema.maxProperties !== undefined) {
      const propCount = Object.keys(result).length;
      if (schema.minProperties !== undefined && propCount < schema.minProperties) {
        this.addError(`Object has ${propCount} properties, minimum is ${schema.minProperties}`);
      }
      if (schema.maxProperties !== undefined && propCount > schema.maxProperties) {
        this.addError(`Object has ${propCount} properties, maximum is ${schema.maxProperties}`);
      }
    }

    return result;
  }

  /**
   * Validates an array value.
   *
   * @private
   */
  private validateArray(value: unknown, schema: ArraySchema): unknown[] | undefined {
    if (!Array.isArray(value)) {
      this.addError(`Expected array, got ${typeof value}`);
      return undefined;
    }

    // Fast path: no validation needed
    if (!schema.items && !schema.minItems && !schema.maxItems && !schema.uniqueItems) {
      return [...value];
    }

    const result: unknown[] = [];
    const len = value.length;

    // Validate items
    if (schema.items) {
      // Pre-size array for performance
      result.length = len;

      // Performance optimization: for large arrays with simple schemas,
      // validate in batches to reduce path manipulation overhead
      if (len > 500 && this.isSimpleSchema(schema.items)) {
        // Fast path for large arrays with simple item schemas
        for (let i = 0; i < len; i++) {
          result[i] = this.validateValueFast(value[i], schema.items, i);
        }
      } else {
        // Standard path with full error tracking
        for (let i = 0; i < len; i++) {
          this.currentPath.push(String(i));
          result[i] = this.validateValue(value[i], schema.items);
          this.currentPath.pop();
        }
      }
    } else {
      // Fast copy
      for (let i = 0; i < len; i++) {
        result[i] = value[i];
      }
    }

    // Length validation
    if (schema.minItems !== undefined && len < schema.minItems) {
      this.addError(`Array length ${len} is less than minimum ${schema.minItems}`);
    }
    if (schema.maxItems !== undefined && len > schema.maxItems) {
      this.addError(`Array length ${len} exceeds maximum ${schema.maxItems}`);
    }

    // Uniqueness validation (optimized for primitives)
    if (schema.uniqueItems && len > 1) {
      const seen = new Set();
      let hasDuplicates = false;

      for (let i = 0; i < len; i++) {
        const item = result[i];
        const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : item;

        if (seen.has(key)) {
          hasDuplicates = true;
          break;
        }
        seen.add(key);
      }

      if (hasDuplicates) {
        this.addError('Array items must be unique');
      }
    }

    return result;
  }

  /**
   * Validates a union type.
   *
   * @private
   */
  private validateUnion(value: unknown, schema: UnionSchema): unknown {
    const originalErrors = [...this.errors];

    for (const subSchema of schema.schemas) {
      this.errors = [];
      const result = this.validateValue(value, subSchema);
      if (this.errors.length === 0) {
        this.errors = originalErrors;
        return result;
      }
    }

    this.errors = originalErrors;
    this.addError(`Value does not match any of the union types`);
    return undefined;
  }

  /**
   * Validates a literal value.
   *
   * @private
   */
  private validateLiteral(value: unknown, schema: LiteralSchema): unknown {
    if (value !== schema.value) {
      this.addError(
        `Expected literal value ${JSON.stringify(schema.value)}, got ${JSON.stringify(value)}`
      );
      return undefined;
    }
    return value;
  }

  /**
   * Validates an enum value.
   *
   * @private
   */
  private validateEnum(value: unknown, schema: EnumSchema): unknown {
    if (!schema.values.includes(value)) {
      this.addError(
        `Value must be one of: ${schema.values.map(v => JSON.stringify(v)).join(', ')}`
      );
      return undefined;
    }
    return value;
  }

  /**
   * Adds an error to the error list.
   *
   * @private
   */
  private addError(message: string, value?: unknown, expected?: string): void {
    this.errors.push({
      path: this.getCurrentPath(),
      message,
      value,
      expected,
    });
  }

  /**
   * Gets the current validation path as a string.
   *
   * @private
   */
  private getCurrentPath(): string {
    // Optimize for common cases
    const len = this.currentPath.length;
    if (len === 0) return 'root';
    if (len === 1) return this.currentPath[0] || 'root';
    if (len === 2) return `${this.currentPath[0] || ''}.${this.currentPath[1] || ''}`;
    return this.currentPath.join('.');
  }

  /**
   * Checks if a schema is simple (primitive types only) for optimization.
   *
   * @private
   */
  private isSimpleSchema(schema: AnySchema): boolean {
    return (
      schema.type === 'string' ||
      schema.type === 'number' ||
      schema.type === 'boolean' ||
      (schema.type === 'object' && this.isSimpleObject(schema as ObjectSchema))
    );
  }

  /**
   * Checks if an object schema is simple (all properties are primitives).
   *
   * @private
   */
  private isSimpleObject(schema: ObjectSchema): boolean {
    if (!schema.properties) return true;
    return Object.values(schema.properties).every(
      prop => prop.type === 'string' || prop.type === 'number' || prop.type === 'boolean'
    );
  }

  /**
   * Fast validation for simple schemas without path tracking overhead.
   *
   * @private
   */
  private validateValueFast(value: unknown, schema: AnySchema, index?: number): unknown {
    // Handle null/undefined first
    if (value === null) {
      if (schema.nullable) return null;
      if (schema.optional) return undefined;
      this.addError(`Expected ${schema.type}, got null`);
      return undefined;
    }

    if (value === undefined) {
      if (schema.optional) return undefined;
      if (schema.default !== undefined) return schema.default;
      this.addError(`Expected ${schema.type}, got undefined`);
      return undefined;
    }

    // Fast primitive validation
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          this.addError(`Expected string, got ${typeof value}`);
          return undefined;
        }
        return value;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          this.addError(`Expected number, got ${typeof value}`);
          return undefined;
        }
        return value;
      case 'boolean':
        if (typeof value !== 'boolean') {
          this.addError(`Expected boolean, got ${typeof value}`);
          return undefined;
        }
        return value;
      case 'object':
        // Simple object validation - just check basic structure
        if (typeof value !== 'object' || value === null) {
          this.addError(`Expected object, got ${typeof value}`);
          return undefined;
        }
        return value; // Skip detailed property validation for performance
      default:
        // Fall back to full validation for complex types
        if (index !== undefined) {
          this.currentPath.push(String(index));
          const result = this.validateValue(value, schema);
          this.currentPath.pop();
          return result;
        }
        return this.validateValue(value, schema);
    }
  }
}

/**
 * Factory function to create a string schema.
 *
 * @param {Partial<StringSchema>} [options] - String schema options
 * @returns {StringSchema} The string schema
 */
export function string(options?: Partial<StringSchema>): StringSchema {
  return { type: 'string', ...options };
}

/**
 * Factory function to create a number schema.
 *
 * @param {Partial<NumberSchema>} [options] - Number schema options
 * @returns {NumberSchema} The number schema
 */
export function number(options?: Partial<NumberSchema>): NumberSchema {
  return { type: 'number', ...options };
}

/**
 * Factory function to create a boolean schema.
 *
 * @param {Partial<BooleanSchema>} [options] - Boolean schema options
 * @returns {BooleanSchema} The boolean schema
 */
export function boolean(options?: Partial<BooleanSchema>): BooleanSchema {
  return { type: 'boolean', ...options };
}

/**
 * Factory function to create an object schema.
 *
 * @param {Record<string, AnySchema>} properties - Object properties
 * @param {Partial<ObjectSchema>} [options] - Additional options
 * @returns {ObjectSchema} The object schema
 */
export function object(
  properties: Record<string, AnySchema>,
  options?: Partial<ObjectSchema>
): ObjectSchema {
  return { type: 'object', properties, ...options };
}

/**
 * Factory function to create an array schema.
 *
 * @param {AnySchema} items - Array item schema
 * @param {Partial<ArraySchema>} [options] - Additional options
 * @returns {ArraySchema} The array schema
 */
export function array(items: AnySchema, options?: Partial<ArraySchema>): ArraySchema {
  return { type: 'array', items, ...options };
}

/**
 * Factory function to create a union schema.
 *
 * @param {AnySchema[]} schemas - Possible schemas
 * @returns {UnionSchema} The union schema
 */
export function union(...schemas: AnySchema[]): UnionSchema {
  return { type: 'union', schemas };
}

/**
 * Factory function to create a literal schema.
 *
 * @param {T} value - The literal value
 * @returns {LiteralSchema} The literal schema
 */
export function literal<T>(value: T): LiteralSchema {
  return { type: 'literal', value };
}

/**
 * Factory function to create an enum schema.
 *
 * @param {T[]} values - The enum values
 * @returns {EnumSchema} The enum schema
 */
export function enumSchema<T>(...values: T[]): EnumSchema {
  return { type: 'enum', values };
}

/**
 * Makes a schema optional.
 *
 * @param {T} schema - The schema to make optional
 * @returns {T} The optional schema
 */
export function optional<T extends AnySchema>(schema: T): T {
  return { ...schema, optional: true };
}

/**
 * Makes a schema nullable.
 *
 * @param {T} schema - The schema to make nullable
 * @returns {T} The nullable schema
 */
export function nullable<T extends AnySchema>(schema: T): T {
  return { ...schema, nullable: true };
}

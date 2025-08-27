// File: src/core/ContextManager.ts

import { EventEmitter } from 'events';
import type { AnySchema, ValidationResult } from '../validation/SchemaValidator';

// Lazy-load the SchemaValidator to keep bundle size small when validation isn't used
let SchemaValidatorClass:
  | typeof import('../validation/SchemaValidator').SchemaValidator
  | undefined;

/**
 * Sanitization modes for context values.
 *
 * @enum {string}
 */
export type SanitizeMode = 'none' | 'basic' | 'strict' | 'custom';

/**
 * Context manager configuration options.
 *
 * @interface ContextManagerOptions
 */
export interface ContextManagerOptions {
  /**
   * Maximum depth for nested objects.
   * @default 10
   */
  maxDepth?: number;

  /**
   * Maximum number of properties per object.
   * @default 100
   */
  maxProperties?: number;

  /**
   * Sanitization mode for context values.
   * @default 'basic'
   */
  sanitizeMode?: SanitizeMode;

  /**
   * Custom sanitization function.
   */
  sanitize?: (value: unknown) => unknown;

  /**
   * Whether to freeze context objects.
   * @default false
   */
  freezeContext?: boolean;

  /**
   * Whether to enable validation.
   * @default true
   */
  enableValidation?: boolean;

  /**
   * Schema for context validation (lazily imported when used).
   * When provided, contexts will be validated against this schema.
   */
  schema?: AnySchema;

  /**
   * What to do when schema validation fails.
   * - 'throw': Throw an error (strict mode)
   * - 'warn': Log a warning and continue
   * - 'silent': Silently continue
   * @default 'warn'
   */
  schemaValidationMode?: 'throw' | 'warn' | 'silent';
}

/**
 * Context validation rules.
 *
 * @interface ContextValidationRules
 */
export interface ContextValidationRules {
  /**
   * Required fields.
   */
  required?: string[];

  /**
   * Field type definitions.
   */
  types?: Record<string, string>;

  /**
   * Custom validation function.
   */
  custom?: (context: Record<string, unknown>) => boolean;
}

/**
 * Context validation result.
 *
 * @interface ContextValidationResult
 */
export interface ContextValidationResult {
  /**
   * Whether validation passed.
   */
  valid: boolean;

  /**
   * Validation errors.
   */
  errors?: string[];

  /**
   * Warnings.
   */
  warnings?: string[];
}

/**
 * Context snapshot for state management.
 *
 * @interface ContextSnapshot
 */
export interface ContextSnapshot {
  /**
   * Snapshot timestamp.
   */
  timestamp: Date;

  /**
   * Context data.
   */
  data: Record<string, unknown>;

  /**
   * Metadata.
   */
  metadata?: Record<string, unknown>;
}

/**
 * ContextManager handles context data for logging.
 *
 * Features:
 * - Deep merging of context objects
 * - Circular reference detection
 * - Value sanitization
 * - Context validation
 * - Snapshot management
 * - Performance optimization
 *
 * @class ContextManager
 * @extends {EventEmitter}
 *
 * @example
 * ```typescript
 * const contextManager = new ContextManager({
 *   maxDepth: 5,
 *   sanitizeMode: 'strict'
 * });
 *
 * // Set global context
 * contextManager.set({
 *   app: 'my-app',
 *   version: '1.0.0'
 * });
 *
 * // Merge additional context
 * const merged = contextManager.merge(globalContext, localContext);
 * ```
 */
export class ContextManager extends EventEmitter {
  /**
   * Configuration options.
   * @private
   */
  private options: Required<Omit<ContextManagerOptions, 'schema'>> & { schema?: AnySchema };

  /**
   * Global context storage.
   * @private
   */
  private globalContext: Record<string, unknown> = {};

  /**
   * Context snapshots.
   * @private
   */
  private snapshots: ContextSnapshot[] = [];

  /**
   * Maximum number of snapshots to keep.
   * @private
   */
  private readonly maxSnapshots = 10;

  /**
   * Validation rules.
   * @private
   */
  private validationRules?: ContextValidationRules;

  /**
   * Schema for validation (lazily loaded).
   * @private
   */
  private schema?: AnySchema;

  /**
   * Schema validator instance (lazily created).
   * @private
   */
  private schemaValidator?: import('../validation/SchemaValidator').SchemaValidator;

  /**
   * Schema validation mode.
   * @private
   */
  private schemaValidationMode: 'throw' | 'warn' | 'silent';

  /**
   * Creates a new ContextManager instance.
   *
   * @param {ContextManagerOptions} options - Configuration options
   */
  constructor(options: ContextManagerOptions = {}) {
    super();

    this.options = {
      maxDepth: options.maxDepth ?? 10,
      maxProperties: options.maxProperties ?? 100,
      sanitizeMode: options.sanitizeMode ?? 'basic',
      sanitize: options.sanitize ?? this.defaultSanitize.bind(this),
      freezeContext: options.freezeContext ?? false,
      enableValidation: options.enableValidation ?? true,
      schema: options.schema,
      schemaValidationMode: options.schemaValidationMode ?? 'warn',
    };

    this.schema = options.schema;
    this.schemaValidationMode = options.schemaValidationMode ?? 'warn';
  }

  /**
   * Set global context.
   *
   * @param {Record<string, unknown>} context - Context to set
   */
  public set(context: Record<string, unknown>): void {
    this.globalContext = this.processContext(context);
    this.emit('contextSet', this.globalContext);
  }

  /**
   * Get global context.
   *
   * @returns {Record<string, unknown>} Global context
   */
  public get(): Record<string, unknown> {
    return this.options.freezeContext
      ? Object.freeze({ ...this.globalContext })
      : { ...this.globalContext };
  }

  /**
   * Clear global context.
   */
  public clear(): void {
    this.globalContext = {};
    this.emit('contextCleared');
  }

  /**
   * Merge multiple context objects.
   *
   * @param {...Record<string, unknown>[]} contexts - Contexts to merge
   * @returns {Record<string, unknown>} Merged context
   */
  public merge(...contexts: (Record<string, unknown> | undefined)[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const seenObjects = new WeakSet();

    for (const context of contexts) {
      if (context) {
        this.deepMerge(result, context, 0, seenObjects);
      }
    }

    return this.processContext(result);
  }

  /**
   * Deep merge two objects.
   *
   * @param {object} target - Target object
   * @param {object} source - Source object
   * @param {number} depth - Current depth
   * @param {WeakSet} seen - Seen objects for circular reference detection
   * @private
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
    depth: number,
    seen: WeakSet<object>
  ): void {
    if (depth > this.options.maxDepth) {
      return;
    }

    // Check for circular reference
    if (seen.has(source)) {
      return;
    }

    if (typeof source === 'object' && source !== null) {
      seen.add(source);
    }

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = target[key];

      if (this.isObject(sourceValue) && this.isObject(targetValue)) {
        target[key] = target[key] || {};
        this.deepMerge(
          target[key] as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
          depth + 1,
          seen
        );
      } else {
        target[key] = this.cloneValue(sourceValue, depth + 1, seen);
      }
    }
  }

  /**
   * Check if value is a plain object.
   *
   * @param {unknown} value - Value to check
   * @returns {boolean} True if plain object
   * @private
   */
  private isObject(value: unknown): boolean {
    return value !== null && typeof value === 'object' && (value as object).constructor === Object;
  }

  /**
   * Clone a value safely.
   *
   * @param {unknown} value - Value to clone
   * @param {number} depth - Current depth
   * @param {WeakSet} seen - Seen objects
   * @returns {unknown} Cloned value
   * @private
   */
  private cloneValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (depth > this.options.maxDepth) {
      return '[Max Depth Exceeded]';
    }

    if (seen.has(value)) {
      return '[Circular Reference]';
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags);
    }

    if (Array.isArray(value)) {
      seen.add(value);
      return value.map(item => this.cloneValue(item, depth + 1, seen));
    }

    if (this.isObject(value)) {
      seen.add(value);
      const cloned: Record<string, unknown> = {};

      let propCount = 0;
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          if (propCount >= this.options.maxProperties) {
            cloned['...'] = `[${Object.keys(value as object).length - propCount} more properties]`;
            break;
          }
          cloned[key] = this.cloneValue((value as Record<string, unknown>)[key], depth + 1, seen);
          propCount++;
        }
      }

      return cloned;
    }

    // For other object types, convert to string
    return String(value);
  }

  /**
   * Process context through sanitization and validation.
   *
   * @param {Record<string, unknown>} context - Context to process
   * @returns {Record<string, unknown>} Processed context
   * @private
   */
  private processContext(context: Record<string, unknown>): Record<string, unknown> {
    // Sanitize
    let processed = this.sanitize(context);

    // Schema validation (if schema is provided)
    if (this.schema && this.options.enableValidation) {
      const validationResult = this.validateWithSchema(processed);
      if (!validationResult.valid) {
        this.handleSchemaValidationError(validationResult, processed);
        // If mode is 'throw', error will be thrown above
        // Otherwise, continue with potentially invalid data
      } else if (validationResult.data) {
        // Use validated/transformed data
        processed = validationResult.data as Record<string, unknown>;
      }
    }

    // Legacy validation rules
    if (this.options.enableValidation && this.validationRules) {
      const validation = this.validate(processed);
      if (!validation.valid) {
        this.emit('validationFailed', validation);
      }
    }

    // Freeze if required
    if (this.options.freezeContext) {
      return this.deepFreeze(processed) as Record<string, unknown>;
    }

    return processed;
  }

  /**
   * Sanitize context based on mode.
   *
   * @param {Record<string, unknown>} context - Context to sanitize
   * @returns {Record<string, unknown>} Sanitized context
   * @private
   */
  private sanitize(context: Record<string, unknown>): Record<string, unknown> {
    switch (this.options.sanitizeMode) {
      case 'none':
        return context;

      case 'basic':
        return this.basicSanitize(context) as Record<string, unknown>;

      case 'strict':
        return this.strictSanitize(context) as Record<string, unknown>;

      case 'custom':
        return this.options.sanitize(context) as Record<string, unknown>;

      default:
        return context;
    }
  }

  /**
   * Default sanitization function.
   *
   * @param {unknown} value - Value to sanitize
   * @returns {unknown} Sanitized value
   * @private
   */
  private defaultSanitize(value: unknown): unknown {
    return this.basicSanitize(value);
  }

  /**
   * Basic sanitization.
   *
   * @param {unknown} value - Value to sanitize
   * @returns {unknown} Sanitized value
   * @private
   */
  private basicSanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      // Remove ANSI codes
      // eslint-disable-next-line no-control-regex
      return value.replace(/\x1b\[[0-9;]*m/g, '');
    }

    if (Array.isArray(value)) {
      return value.map(item => this.basicSanitize(item));
    }

    if (this.isObject(value)) {
      const sanitized: Record<string, unknown> = {};
      const objValue = value as Record<string, unknown>;
      for (const key in objValue) {
        if (Object.prototype.hasOwnProperty.call(objValue, key)) {
          // Redact sensitive keys
          if (this.isSensitiveKey(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.basicSanitize(objValue[key]);
          }
        }
      }
      return sanitized;
    }

    return value;
  }

  /**
   * Strict sanitization.
   * Removes ANSI codes, control characters, and redacts sensitive keys.
   *
   * @param {unknown} value - Value to sanitize
   * @returns {unknown} Sanitized value
   * @private
   */
  private strictSanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      // Remove ANSI codes and control characters
      return (
        value
          // eslint-disable-next-line no-control-regex
          .replace(/\x1b\[[0-9;]*m/g, '')
          // eslint-disable-next-line no-control-regex
          .replace(/[\x00-\x1F\x7F]/g, '')
      );
    }

    if (Array.isArray(value)) {
      return value.map(item => this.strictSanitize(item));
    }

    if (this.isObject(value)) {
      const sanitized: Record<string, unknown> = {};
      const objValue = value as Record<string, unknown>;
      for (const key in objValue) {
        if (Object.prototype.hasOwnProperty.call(objValue, key)) {
          // Skip sensitive keys
          if (this.isSensitiveKey(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.strictSanitize(objValue[key]);
          }
        }
      }
      return sanitized;
    }

    return value;
  }

  /**
   * Deep freeze an object.
   *
   * @param {object} obj - Object to freeze
   * @returns {object} Frozen object
   * @private
   */
  private deepFreeze(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = (obj as Record<string, unknown>)[prop];
      if (
        value !== null &&
        (typeof value === 'object' || typeof value === 'function') &&
        !Object.isFrozen(value)
      ) {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Check if a key is sensitive.
   *
   * @param {string} key - Key to check
   * @returns {boolean} True if sensitive
   * @private
   */
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /auth/i,
      /credential/i,
      /private/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  /**
   * Set validation rules.
   *
   * @param {ContextValidationRules} rules - Validation rules
   */
  public setValidationRules(rules: ContextValidationRules): void {
    this.validationRules = rules;
    this.emit('validationRulesSet', rules);
  }

  /**
   * Validate structure for circular references and depth.
   *
   * @param {unknown} value - Value to validate
   * @param {number} depth - Current depth
   * @param {WeakSet<object>} seen - Seen objects for circular reference detection
   */
  private validateStructure(value: unknown, depth: number, seen: WeakSet<object>): void {
    if (depth > this.options.maxDepth) {
      throw new Error(`Maximum depth exceeded: ${this.options.maxDepth}`);
    }

    if (value && typeof value === 'object') {
      if (seen.has(value as object)) {
        throw new Error('Circular reference detected');
      }

      seen.add(value as object);

      if (Array.isArray(value)) {
        for (const item of value) {
          this.validateStructure(item, depth + 1, seen);
        }
      } else {
        for (const val of Object.values(value as Record<string, unknown>)) {
          this.validateStructure(val, depth + 1, seen);
        }
      }

      seen.delete(value as object);
    }
  }

  /**
   * Validate context against rules.
   *
   * @param {Record<string, unknown>} context - Context to validate
   * @returns {ContextValidationResult} Validation result
   */
  public validate(context: Record<string, unknown>): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Always check for circular references and depth
    try {
      this.validateStructure(context, 0, new WeakSet());
    } catch (error: unknown) {
      errors.push((error as Error).message);
    }

    // Additional validation rules (only if configured)
    if (this.validationRules) {
      // Check required fields
      if (this.validationRules.required) {
        for (const field of this.validationRules.required) {
          if (!(field in context)) {
            errors.push(`Required field missing: ${field}`);
          }
        }
      }

      // Check types
      if (this.validationRules.types) {
        for (const [field, expectedType] of Object.entries(this.validationRules.types)) {
          if (field in context) {
            const actualType = typeof context[field];
            if (actualType !== expectedType) {
              errors.push(
                `Field ${field} has wrong type: expected ${expectedType}, got ${actualType}`
              );
            }
          }
        }
      }

      // Custom validation
      if (this.validationRules.custom) {
        try {
          if (!this.validationRules.custom(context)) {
            errors.push('Custom validation failed');
          }
        } catch (error) {
          warnings.push(`Custom validation error: ${error}`);
        }
      }
    }

    const result: ContextValidationResult = {
      valid: errors.length === 0,
      errors: errors,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }

  /**
   * Create a snapshot of current context.
   *
   * @param {Record<string, unknown>} [metadata] - Optional metadata
   * @returns {ContextSnapshot} Created snapshot
   */
  public snapshot(metadata?: Record<string, unknown>): ContextSnapshot {
    const snapshot: ContextSnapshot = {
      timestamp: new Date(),
      data: this.cloneValue(this.globalContext, 0, new WeakSet()) as Record<string, unknown>,
      metadata,
    };

    this.snapshots.push(snapshot);

    // Trim old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    this.emit('snapshotCreated', snapshot);

    return snapshot;
  }

  /**
   * Restore from a snapshot.
   *
   * @param {ContextSnapshot} snapshot - Snapshot to restore
   */
  public restore(snapshot: ContextSnapshot): void {
    this.globalContext = this.cloneValue(snapshot.data, 0, new WeakSet()) as Record<
      string,
      unknown
    >;
    this.emit('snapshotRestored', snapshot);
  }

  /**
   * Get all snapshots.
   *
   * @returns {ContextSnapshot[]} All snapshots
   */
  public getSnapshots(): ContextSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Clear all snapshots.
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    this.emit('snapshotsCleared');
  }

  /**
   * Flatten nested context to dot notation.
   *
   * @param {Record<string, unknown>} context - Context to flatten
   * @param {string} [prefix=''] - Key prefix
   * @returns {Record<string, unknown>} Flattened context
   */
  public flatten(context: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in context) {
      if (!Object.prototype.hasOwnProperty.call(context, key)) {
        continue;
      }

      const value = context[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (this.isObject(value) && Object.keys(value as object).length > 0) {
        Object.assign(result, this.flatten(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  /**
   * Unflatten dot notation to nested object.
   * Converts a flat object with dot-notation keys into a nested object structure.
   *
   * @param {Record<string, unknown>} flattened - Flattened context
   * @returns {Record<string, unknown>} Nested context
   */
  public unflatten(flattened: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in flattened) {
      if (!Object.prototype.hasOwnProperty.call(flattened, key)) {
        continue;
      }

      const parts = key.split('.');
      let current: Record<string, unknown> = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!part) {
          continue;
        }
        const existing = current[part];
        if (typeof existing !== 'object' || existing === null) {
          current[part] = {} as Record<string, unknown>;
        }
        current = current[part] as Record<string, unknown>;
      }
      const leaf = parts[parts.length - 1] ?? '';
      if (leaf) {
        current[leaf] = flattened[key];
      }
    }

    return result;
  }

  /**
   * Extract specific fields from context.
   *
   * @param {Record<string, unknown>} context - Source context
   * @param {string[]} fields - Fields to extract
   * @returns {Record<string, unknown>} Extracted context
   */
  public extract(context: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const field of fields) {
      if (field.includes('.')) {
        // Handle nested fields
        const value = this.getNestedValue(context, field);
        if (value !== undefined) {
          this.setNestedValue(result, field, value);
        }
      } else if (field in context) {
        result[field] = context[field];
      }
    }

    return result;
  }

  /**
   * Get nested value using dot notation.
   *
   * @param {object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {unknown} Value at path
   * @private
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Set nested value using dot notation.
   *
   * @param {object} obj - Target object
   * @param {string} path - Dot notation path
   * @param {unknown} value - Value to set
   * @private
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue; // skip empty segments defensively
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {} as Record<string, unknown>;
      }
      current = current[part] as Record<string, unknown>;
    }

    const last = parts[parts.length - 1];
    if (last) {
      current[last] = value;
    }
  }

  /**
   * Get context statistics.
   *
   * @returns {object} Context statistics
   */
  public getStats(): {
    size: number;
    depth: number;
    propertyCount: number;
    snapshotCount: number;
  } {
    const flattened = this.flatten(this.globalContext);

    return {
      size: JSON.stringify(this.globalContext).length,
      depth: this.getMaxDepth(this.globalContext),
      propertyCount: Object.keys(flattened).length,
      snapshotCount: this.snapshots.length,
    };
  }

  /**
   * Get maximum depth of object.
   *
   * @param {object} obj - Object to measure
   * @param {number} currentDepth - Current depth
   * @returns {number} Maximum depth
   * @private
   */
  private getMaxDepth(obj: unknown, currentDepth = 0): number {
    if (!this.isObject(obj) || currentDepth > this.options.maxDepth) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    const objValue = obj as Record<string, unknown>;

    for (const key in objValue) {
      if (Object.prototype.hasOwnProperty.call(objValue, key)) {
        const depth = this.getMaxDepth(objValue[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  /**
   * Clean up resources.
   */
  public destroy(): void {
    this.clear();
    this.clearSnapshots();
    this.removeAllListeners();
  }

  /**
   * Sets a schema for context validation.
   *
   * @param {AnySchema} schema - The schema to use for validation
   * @param {'throw' | 'warn' | 'silent'} [mode] - Validation mode
   *
   * @example
   * ```typescript
   * import { object, string, number } from 'magiclogger/validation';
   *
   * contextManager.setSchema(
   *   object({
   *     userId: string({ format: 'uuid' }),
   *     sessionId: string(),
   *     requestCount: number({ min: 0 })
   *   }),
   *   'throw' // Strict mode - throw on validation errors
   * );
   * ```
   */
  public setSchema(schema: AnySchema, mode?: 'throw' | 'warn' | 'silent'): void {
    this.schema = schema;
    if (mode) {
      this.schemaValidationMode = mode;
    }
    this.emit('schemaSet', schema);
  }

  /**
   * Validates context against the configured schema.
   *
   * @private
   * @param {Record<string, unknown>} context - Context to validate
   * @returns {ValidationResult} Validation result
   */
  private validateWithSchema(context: Record<string, unknown>): ValidationResult {
    if (!this.schema) {
      return { valid: true, data: context };
    }

    // Lazy load the validator
    if (!this.schemaValidator) {
      if (!SchemaValidatorClass) {
        // Synchronous require for lazy loading - tree-shaken if never called
        /* eslint-disable @typescript-eslint/no-var-requires */
        const module = require('../validation/SchemaValidator');
        /* eslint-enable @typescript-eslint/no-var-requires */
        SchemaValidatorClass = module.SchemaValidator;
      }
      if (SchemaValidatorClass) {
        this.schemaValidator = new SchemaValidatorClass();
      } else {
        // Validation module not available
        return { valid: true, data: context };
      }
    }

    return this.schemaValidator.validate(context, this.schema);
  }

  /**
   * Handles schema validation errors based on configured mode.
   *
   * @private
   * @param {ValidationResult} result - Validation result
   * @param {Record<string, unknown>} context - The context that failed validation
   * @throws {Error} If mode is 'throw' and validation failed
   */
  private handleSchemaValidationError(
    result: ValidationResult,
    context: Record<string, unknown>
  ): void {
    if (!result.errors || result.errors.length === 0) return;

    const errorMessage = `Context validation failed:\n${result.errors
      .map(e => `  - ${e.path}: ${e.message}`)
      .join('\n')}`;

    this.emit('schemaValidationFailed', { result, context });

    switch (this.schemaValidationMode) {
      case 'throw':
        throw new Error(errorMessage);
      case 'warn':
        console.warn(`[ContextManager] ${errorMessage}`);
        break;
      case 'silent':
        // Do nothing
        break;
    }
  }
}

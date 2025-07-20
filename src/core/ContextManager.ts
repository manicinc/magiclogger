// File: src/core/ContextManager.ts

/**
 * Context management utilities for structured logging.
 * 
 * The ContextManager provides advanced context manipulation capabilities:
 * - Deep merging of context objects
 * - Circular reference detection
 * - Context validation and sanitization
 * - Path-based context updates
 * - Context diffing for minimal updates
 * - Immutable context operations
 * 
 * @class ContextManager
 * 
 * @example
 * ```typescript
 * const contextManager = new ContextManager();
 * 
 * // Merge contexts
 * const merged = contextManager.merge(
 *   { user: { id: 123 } },
 *   { user: { name: 'John' }, request: { id: 'abc' } }
 * );
 * // Result: { user: { id: 123, name: 'John' }, request: { id: 'abc' } }
 * 
 * // Update nested values
 * const updated = contextManager.set(context, 'user.preferences.theme', 'dark');
 * 
 * // Extract subset
 * const subset = contextManager.pick(context, ['user', 'request']);
 * ```
 */
export class ContextManager {
  /**
   * Maximum depth for context objects to prevent stack overflow.
   * @private
   */
  private readonly maxDepth = 10;

  /**
   * Maximum number of keys per object level.
   * @private
   */
  private readonly maxKeys = 100;

  /**
   * Maximum string length for context values.
   * @private
   */
  private readonly maxStringLength = 1000;

  /**
   * Set to track circular references during operations.
   * @private
   */
  private seen: WeakSet<object>;

  /**
   * Creates a new ContextManager instance.
   */
  constructor() {
    this.seen = new WeakSet();
  }

  /**
   * Deep merge multiple context objects.
   * 
   * @param {...Record<string, any>} contexts - Context objects to merge
   * @returns {Record<string, any>} Merged context
   */
  public merge(...contexts: Array<Record<string, any> | undefined>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const context of contexts) {
      if (!context || typeof context !== 'object') continue;
      
      this.seen = new WeakSet();
      this.deepMerge(result, context, 0);
    }

    return result;
  }

  /**
   * Deep merge helper with circular reference detection.
   * 
   * @param {Record<string, any>} target - Target object
   * @param {Record<string, any>} source - Source object
   * @param {number} depth - Current depth
   * @private
   */
  private deepMerge(
    target: Record<string, any>,
    source: Record<string, any>,
    depth: number
  ): void {
    if (depth > this.maxDepth) {
      console.warn('[ContextManager] Max depth reached, stopping merge');
      return;
    }

    if (this.seen.has(source)) {
      console.warn('[ContextManager] Circular reference detected, skipping');
      return;
    }

    if (typeof source === 'object' && source !== null) {
      this.seen.add(source);
    }

    const keys = Object.keys(source);
    if (keys.length > this.maxKeys) {
      console.warn(`[ContextManager] Too many keys (${keys.length}), truncating to ${this.maxKeys}`);
    }

    for (let i = 0; i < Math.min(keys.length, this.maxKeys); i++) {
      const key = keys[i];
      const sourceValue = source[key];

      if (sourceValue === undefined) continue;

      if (sourceValue === null || this.isPrimitive(sourceValue)) {
        target[key] = this.sanitizeValue(sourceValue);
      } else if (Array.isArray(sourceValue)) {
        target[key] = this.mergeArrays(target[key], sourceValue, depth + 1);
      } else if (this.isPlainObject(sourceValue)) {
        if (!this.isPlainObject(target[key])) {
          target[key] = {};
        }
        this.deepMerge(target[key], sourceValue, depth + 1);
      } else {
        // Handle special objects (Date, RegExp, etc.)
        target[key] = this.cloneSpecialObject(sourceValue);
      }
    }
  }

  /**
   * Merge arrays with deduplication.
   * 
   * @param {any} targetArray - Target array
   * @param {any[]} sourceArray - Source array
   * @param {number} depth - Current depth
   * @returns {any[]} Merged array
   * @private
   */
  private mergeArrays(targetArray: any, sourceArray: any[], depth: number): any[] {
    if (!Array.isArray(targetArray)) {
      return [...sourceArray];
    }

    const result = [...targetArray];
    
    for (const item of sourceArray) {
      if (this.isPrimitive(item)) {
        if (!result.includes(item)) {
          result.push(item);
        }
      } else {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Set a value at a specific path in the context.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string} path - Dot-separated path
   * @param {any} value - Value to set
   * @returns {Record<string, any>} New context with value set
   */
  public set(
    context: Record<string, any>,
    path: string,
    value: any
  ): Record<string, any> {
    const result = this.clone(context);
    const parts = path.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      
      current = current[part];
    }

    current[parts[parts.length - 1]] = this.sanitizeValue(value);
    return result;
  }

  /**
   * Get a value at a specific path in the context.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string} path - Dot-separated path
   * @param {any} defaultValue - Default value if path not found
   * @returns {any} Value at path or default
   */
  public get(
    context: Record<string, any>,
    path: string,
    defaultValue?: any
  ): any {
    const parts = path.split('.');
    let current = context;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return defaultValue;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Remove a value at a specific path.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string} path - Dot-separated path
   * @returns {Record<string, any>} New context with value removed
   */
  public unset(
    context: Record<string, any>,
    path: string
  ): Record<string, any> {
    const result = this.clone(context);
    const parts = path.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (!current[part] || typeof current[part] !== 'object') {
        return result;
      }
      
      current = current[part];
    }

    delete current[parts[parts.length - 1]];
    return result;
  }

  /**
   * Pick specific keys from context.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string[]} keys - Keys to pick
   * @returns {Record<string, any>} New context with only specified keys
   */
  public pick(
    context: Record<string, any>,
    keys: string[]
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key of keys) {
      if (key.includes('.')) {
        // Handle nested paths
        const value = this.get(context, key);
        if (value !== undefined) {
          this.set(result, key, value);
        }
      } else if (key in context) {
        result[key] = context[key];
      }
    }

    return result;
  }

  /**
   * Omit specific keys from context.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string[]} keys - Keys to omit
   * @returns {Record<string, any>} New context without specified keys
   */
  public omit(
    context: Record<string, any>,
    keys: string[]
  ): Record<string, any> {
    const result = this.clone(context);

    for (const key of keys) {
      if (key.includes('.')) {
        // Handle nested paths
        this.unset(result, key);
      } else {
        delete result[key];
      }
    }

    return result;
  }

  /**
   * Flatten nested context to single level with dot notation.
   * 
   * @param {Record<string, any>} context - Context object
   * @param {string} prefix - Prefix for keys
   * @returns {Record<string, any>} Flattened context
   */
  public flatten(
    context: Record<string, any>,
    prefix = ''
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.flattenHelper(context, result, prefix, 0);
    
    return result;
  }

  /**
   * Flatten helper with depth tracking.
   * 
   * @param {any} obj - Object to flatten
   * @param {Record<string, any>} result - Result object
   * @param {string} prefix - Current prefix
   * @param {number} depth - Current depth
   * @private
   */
  private flattenHelper(
    obj: any,
    result: Record<string, any>,
    prefix: string,
    depth: number
  ): void {
    if (depth > this.maxDepth) return;

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || this.isPrimitive(value)) {
        result[newKey] = value;
      } else if (Array.isArray(value)) {
        result[newKey] = value;
      } else if (this.isPlainObject(value)) {
        this.flattenHelper(value, result, newKey, depth + 1);
      } else {
        result[newKey] = String(value);
      }
    }
  }

  /**
   * Unflatten dot notation to nested object.
   * 
   * @param {Record<string, any>} context - Flattened context
   * @returns {Record<string, any>} Nested context
   */
  public unflatten(context: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      this.set(result, key, value);
    }

    return result;
  }

  /**
   * Calculate diff between two contexts.
   * 
   * @param {Record<string, any>} oldContext - Old context
   * @param {Record<string, any>} newContext - New context
   * @returns {object} Diff object with added, removed, and changed keys
   */
  public diff(
    oldContext: Record<string, any>,
    newContext: Record<string, any>
  ): {
    added: Record<string, any>;
    removed: string[];
    changed: Record<string, { old: any; new: any }>;
  } {
    const oldFlat = this.flatten(oldContext);
    const newFlat = this.flatten(newContext);
    
    const added: Record<string, any> = {};
    const removed: string[] = [];
    const changed: Record<string, { old: any; new: any }> = {};

    // Find added and changed
    for (const [key, value] of Object.entries(newFlat)) {
      if (!(key in oldFlat)) {
        added[key] = value;
      } else if (oldFlat[key] !== value) {
        changed[key] = { old: oldFlat[key], new: value };
      }
    }

    // Find removed
    for (const key of Object.keys(oldFlat)) {
      if (!(key in newFlat)) {
        removed.push(key);
      }
    }

    return { added, removed, changed };
  }

  /**
   * Validate context against schema.
   * 
   * @param {Record<string, any>} context - Context to validate
   * @param {Record<string, any>} schema - Validation schema
   * @returns {object} Validation result
   */
  public validate(
    context: Record<string, any>,
    schema: Record<string, any>
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    this.validateHelper(context, schema, '', errors);
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validation helper.
   * 
   * @param {any} value - Value to validate
   * @param {any} schema - Schema for validation
   * @param {string} path - Current path
   * @param {string[]} errors - Error array
   * @private
   */
  private validateHelper(
    value: any,
    schema: any,
    path: string,
    errors: string[]
  ): void {
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(`${path}: expected ${schema.type}, got ${actualType}`);
        return;
      }
    }

    if (schema.required && value === undefined) {
      errors.push(`${path}: required field missing`);
      return;
    }

    if (schema.properties && typeof value === 'object' && value !== null) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        const newPath = path ? `${path}.${key}` : key;
        this.validateHelper(value[key], subSchema, newPath, errors);
      }
    }
  }

  /**
   * Deep clone a context object.
   * 
   * @param {Record<string, any>} context - Context to clone
   * @returns {Record<string, any>} Cloned context
   */
  public clone(context: Record<string, any>): Record<string, any> {
    this.seen = new WeakSet();
    return this.cloneHelper(context, 0);
  }

  /**
   * Clone helper with circular reference detection.
   * 
   * @param {any} obj - Object to clone
   * @param {number} depth - Current depth
   * @returns {any} Cloned object
   * @private
   */
  private cloneHelper(obj: any, depth: number): any {
    if (depth > this.maxDepth) {
      console.warn('[ContextManager] Max depth reached during clone');
      return obj;
    }

    if (obj === null || this.isPrimitive(obj)) {
      return obj;
    }

    if (this.seen.has(obj)) {
      return '[Circular]';
    }

    this.seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(item => this.cloneHelper(item, depth + 1));
    }

    if (this.isPlainObject(obj)) {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.cloneHelper(value, depth + 1);
      }
      
      return result;
    }

    return this.cloneSpecialObject(obj);
  }

  /**
   * Check if value is a primitive.
   * 
   * @param {any} value - Value to check
   * @returns {boolean} True if primitive
   * @private
   */
  private isPrimitive(value: any): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'symbol' ||
      typeof value === 'bigint'
    );
  }

  /**
   * Check if value is a plain object.
   * 
   * @param {any} value - Value to check
   * @returns {boolean} True if plain object
   * @private
   */
  private isPlainObject(value: any): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  }

  /**
   * Clone special objects (Date, RegExp, etc.).
   * 
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   * @private
   */
  private cloneSpecialObject(obj: any): any {
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }

    if (obj instanceof Map) {
      return new Map(obj);
    }

    if (obj instanceof Set) {
      return new Set(obj);
    }

    if (obj instanceof Buffer) {
      return Buffer.from(obj);
    }

    // For other objects, convert to string representation
    return String(obj);
  }

  /**
   * Sanitize a value for safe storage.
   * 
   * @param {any} value - Value to sanitize
   * @returns {any} Sanitized value
   * @private
   */
  private sanitizeValue(value: any): any {
    if (typeof value === 'string' && value.length > this.maxStringLength) {
      return value.substring(0, this.maxStringLength) + '...[truncated]';
    }

    if (typeof value === 'number') {
      if (!isFinite(value)) {
        return String(value);
      }
    }

    return value;
  }

  /**
   * Minify context for network transmission.
   * 
   * @param {Record<string, any>} context - Context to minify
   * @param {Record<string, string>} rules - Minification rules (long key -> short key)
   * @returns {Record<string, any>} Minified context
   */
  public minify(
    context: Record<string, any>,
    rules: Record<string, string>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      const minifiedKey = rules[key] || key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[minifiedKey] = this.minify(value, rules);
      } else {
        result[minifiedKey] = value;
      }
    }

    return result;
  }

  /**
   * Expand minified context.
   * 
   * @param {Record<string, any>} context - Minified context
   * @param {Record<string, string>} rules - Expansion rules (short key -> long key)
   * @returns {Record<string, any>} Expanded context
   */
  public expand(
    context: Record<string, any>,
    rules: Record<string, string>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      const expandedKey = rules[key] || key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[expandedKey] = this.expand(value, rules);
      } else {
        result[expandedKey] = value;
      }
    }

    return result;
  }
}
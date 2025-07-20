// File: src/core/ContextManager.ts

/**
 * ContextManager provides utilities for managing and manipulating context data
 * in log entries. It handles context merging, transformation, sanitization,
 * and provides helper methods for common context operations.
 * 
 * @example
 * ```typescript
 * const contextManager = new ContextManager();
 * 
 * // Merge contexts
 * const merged = contextManager.merge(
 *   { userId: '123', service: 'api' },
 *   { requestId: 'req-456', userId: '789' }
 * );
 * // Result: { userId: '789', service: 'api', requestId: 'req-456' }
 * 
 * // Transform context
 * const transformed = contextManager.transform(context, {
 *   'user.id': 'userId',
 *   'request.id': 'requestId'
 * });
 * 
 * // Sanitize sensitive data
 * const sanitized = contextManager.sanitize(context, ['password', 'token']);
 * ```
 */
export class ContextManager {
  private readonly sensitiveKeys: Set<string>;
  private readonly transformRules: Map<string, string>;

  /**
   * Creates a new ContextManager instance.
   * 
   * @param {ContextManagerOptions} [options={}] - Configuration options
   */
  constructor(options: ContextManagerOptions = {}) {
    this.sensitiveKeys = new Set(options.sensitiveKeys || [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'ssn', 'social', 'credit', 'card', 'cvv', 'pin'
    ]);
    
    this.transformRules = new Map(Object.entries(options.transformRules || {}));
  }

  /**
   * Merge multiple context objects with deep merging support.
   * Later contexts override earlier ones for conflicting keys.
   * 
   * @param {...Record<string, any>[]} contexts - Context objects to merge
   * @returns {Record<string, any>} Merged context object
   * 
   * @example
   * ```typescript
   * const result = contextManager.merge(
   *   { user: { id: '123', name: 'John' }, service: 'api' },
   *   { user: { id: '456' }, requestId: 'req-789' }
   * );
   * // Result: { user: { id: '456', name: 'John' }, service: 'api', requestId: 'req-789' }
   * ```
   */
  public merge(...contexts: Array<Record<string, any> | undefined>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const context of contexts) {
      if (!context || typeof context !== 'object') continue;
      
      for (const [key, value] of Object.entries(context)) {
        if (value === undefined) continue;
        
        if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
          // Deep merge objects
          result[key] = this.merge(result[key], value);
        } else {
          // Direct assignment for primitives and arrays
          result[key] = value;
        }
      }
    }
    
    return result;
  }

  /**
   * Transform context keys according to transformation rules.
   * Useful for normalizing context data from different sources.
   * 
   * @param {Record<string, any>} context - Context to transform
   * @param {Record<string, string>} [rules] - Transformation rules (from -> to)
   * @returns {Record<string, any>} Transformed context
   * 
   * @example
   * ```typescript
   * const context = { 'user.id': '123', 'req.id': 'req-456' };
   * const transformed = contextManager.transform(context, {
   *   'user.id': 'userId',
   *   'req.id': 'requestId'
   * });
   * // Result: { userId: '123', requestId: 'req-456' }
   * ```
   */
  public transform(
    context: Record<string, any>,
    rules?: Record<string, string>
  ): Record<string, any> {
    const transformRules = rules ? new Map(Object.entries(rules)) : this.transformRules;
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      const newKey = transformRules.get(key) || key;
      result[newKey] = value;
    }
    
    return result;
  }

  /**
   * Sanitize context by removing or masking sensitive data.
   * 
   * @param {Record<string, any>} context - Context to sanitize
   * @param {string[]} [additionalSensitiveKeys] - Additional keys to treat as sensitive
   * @param {SanitizeMode} [mode='mask'] - How to handle sensitive data
   * @returns {Record<string, any>} Sanitized context
   * 
   * @example
   * ```typescript
   * const context = { userId: '123', password: 'secret123', email: 'user@example.com' };
   * const sanitized = contextManager.sanitize(context, ['email'], 'mask');
   * // Result: { userId: '123', password: '***', email: '***' }
   * ```
   */
  public sanitize(
    context: Record<string, any>,
    additionalSensitiveKeys: string[] = [],
    mode: SanitizeMode = 'mask'
  ): Record<string, any> {
    const allSensitiveKeys = new Set([
      ...this.sensitiveKeys,
      ...additionalSensitiveKeys
    ]);
    
    return this.sanitizeObject(context, allSensitiveKeys, mode);
  }

  /**
   * Extract specific fields from context.
   * 
   * @param {Record<string, any>} context - Source context
   * @param {string[]} fields - Fields to extract (supports dot notation)
   * @returns {Record<string, any>} Context with only specified fields
   * 
   * @example
   * ```typescript
   * const context = { 
   *   user: { id: '123', name: 'John', email: 'john@example.com' },
   *   request: { id: 'req-456', method: 'POST' }
   * };
   * const extracted = contextManager.extract(context, ['user.id', 'request.method']);
   * // Result: { 'user.id': '123', 'request.method': 'POST' }
   * ```
   */
  public extract(context: Record<string, any>, fields: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const field of fields) {
      const value = this.getNestedValue(context, field);
      if (value !== undefined) {
        result[field] = value;
      }
    }
    
    return result;
  }

  /**
   * Flatten nested context object using dot notation.
   * 
   * @param {Record<string, any>} context - Context to flatten
   * @param {string} [prefix=''] - Prefix for keys
   * @returns {Record<string, any>} Flattened context
   * 
   * @example
   * ```typescript
   * const context = { 
   *   user: { id: '123', profile: { name: 'John' } },
   *   service: 'api'
   * };
   * const flattened = contextManager.flatten(context);
   * // Result: { 'user.id': '123', 'user.profile.name': 'John', service: 'api' }
   * ```
   */
  public flatten(context: Record<string, any>, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (this.isPlainObject(value)) {
        Object.assign(result, this.flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Unflatten a context object from dot notation back to nested structure.
   * 
   * @param {Record<string, any>} context - Flattened context
   * @returns {Record<string, any>} Nested context object
   * 
   * @example
   * ```typescript
   * const flattened = { 'user.id': '123', 'user.name': 'John', service: 'api' };
   * const nested = contextManager.unflatten(flattened);
   * // Result: { user: { id: '123', name: 'John' }, service: 'api' }
   * ```
   */
  public unflatten(context: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      this.setNestedValue(result, key, value);
    }
    
    return result;
  }

  /**
   * Validate context structure and content.
   * 
   * @param {Record<string, any>} context - Context to validate
   * @param {ContextValidationRules} [rules] - Validation rules
   * @returns {ContextValidationResult} Validation result
   * 
   * @example
   * ```typescript
   * const validation = contextManager.validate(context, {
   *   required: ['userId', 'requestId'],
   *   maxDepth: 3,
   *   maxSize: 1000
   * });
   * 
   * if (!validation.valid) {
   *   console.error('Context validation failed:', validation.errors);
   * }
   * ```
   */
  public validate(
    context: Record<string, any>,
    rules: ContextValidationRules = {}
  ): ContextValidationResult {
    const errors: string[] = [];
    
    // Check required fields
    if (rules.required) {
      for (const field of rules.required) {
        if (this.getNestedValue(context, field) === undefined) {
          errors.push(`Required field '${field}' is missing`);
        }
      }
    }
    
    // Check max depth
    if (rules.maxDepth !== undefined) {
      const depth = this.getMaxDepth(context);
      if (depth > rules.maxDepth) {
        errors.push(`Context depth ${depth} exceeds maximum ${rules.maxDepth}`);
      }
    }
    
    // Check max size
    if (rules.maxSize !== undefined) {
      const size = JSON.stringify(context).length;
      if (size > rules.maxSize) {
        errors.push(`Context size ${size} bytes exceeds maximum ${rules.maxSize}`);
      }
    }
    
    // Check forbidden fields
    if (rules.forbidden) {
      for (const field of rules.forbidden) {
        if (this.getNestedValue(context, field) !== undefined) {
          errors.push(`Forbidden field '${field}' is present`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a context snapshot with metadata.
   * 
   * @param {Record<string, any>} context - Context to snapshot
   * @returns {ContextSnapshot} Context snapshot with metadata
   */
  public snapshot(context: Record<string, any>): ContextSnapshot {
    return {
      data: JSON.parse(JSON.stringify(context)), // Deep clone
      timestamp: new Date().toISOString(),
      size: JSON.stringify(context).length,
      depth: this.getMaxDepth(context),
      keys: Object.keys(this.flatten(context))
    };
  }

  // Private helper methods

  private isPlainObject(value: any): boolean {
    return value !== null && 
           typeof value === 'object' && 
           !Array.isArray(value) && 
           !(value instanceof Date) && 
           !(value instanceof RegExp);
  }

  private sanitizeObject(
    obj: Record<string, any>,
    sensitiveKeys: Set<string>,
    mode: SanitizeMode
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = sensitiveKeys.has(key.toLowerCase()) ||
                         Array.from(sensitiveKeys).some(sk => key.toLowerCase().includes(sk));
      
      if (isSensitive) {
        switch (mode) {
          case 'remove':
            continue;
          case 'mask':
            result[key] = '***';
            break;
          case 'hash':
            result[key] = this.hashValue(String(value));
            break;
        }
      } else if (this.isPlainObject(value)) {
        result[key] = this.sanitizeObject(value, sensitiveKeys, mode);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    for (const key of keys) {
      if (!(key in current) || !this.isPlainObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  private getMaxDepth(obj: Record<string, any>, currentDepth = 1): number {
    let maxDepth = currentDepth;
    
    for (const value of Object.values(obj)) {
      if (this.isPlainObject(value)) {
        maxDepth = Math.max(maxDepth, this.getMaxDepth(value, currentDepth + 1));
      }
    }
    
    return maxDepth;
  }

  private hashValue(value: string): string {
    // Simple hash function for demonstration
    // In production, use a proper crypto library
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `#${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Configuration options for ContextManager.
 */
export interface ContextManagerOptions {
  /**
   * Keys that should be treated as sensitive and sanitized.
   */
  sensitiveKeys?: string[];
  
  /**
   * Rules for transforming context keys.
   * Maps from original key to new key.
   */
  transformRules?: Record<string, string>;
}

/**
 * Mode for sanitizing sensitive data.
 */
export type SanitizeMode = 'remove' | 'mask' | 'hash';

/**
 * Rules for validating context structure.
 */
export interface ContextValidationRules {
  /**
   * Required fields (supports dot notation).
   */
  required?: string[];
  
  /**
   * Forbidden fields (supports dot notation).
   */
  forbidden?: string[];
  
  /**
   * Maximum nesting depth.
   */
  maxDepth?: number;
  
  /**
   * Maximum serialized size in bytes.
   */
  maxSize?: number;
}

/**
 * Result of context validation.
 */
export interface ContextValidationResult {
  /**
   * Whether the context is valid.
   */
  valid: boolean;
  
  /**
   * Validation error messages.
   */
  errors: string[];
}

/**
 * Context snapshot with metadata.
 */
export interface ContextSnapshot {
  /**
   * Cloned context data.
   */
  data: Record<string, any>;
  
  /**
   * Timestamp when snapshot was created.
   */
  timestamp: string;
  
  /**
   * Size of context in bytes.
   */
  size: number;
  
  /**
   * Maximum nesting depth.
   */
  depth: number;
  
  /**
   * All keys in flattened format.
   */
  keys: string[];
}
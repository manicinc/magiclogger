/**
 * @fileoverview Tag management system with schema validation for MagicLogger.
 * 
 * Provides comprehensive tag management including normalization, validation,
 * filtering, and optional schema enforcement for structured tag data.
 * 
 * @module core/TagManager
 */

import { EventEmitter } from 'events';
import type { AnySchema, ValidationResult } from '../validation/SchemaValidator';

/**
 * Configuration options for TagManager.
 * 
 * @interface TagManagerOptions
 */
export interface TagManagerOptions {
  /** Maximum number of tags allowed per log entry @default 50 */
  maxTags?: number;

  /** Maximum length for individual tags @default 50 */
  maxTagLength?: number;

  /** Automatically normalize tags on add @default true */
  autoNormalize?: boolean;

  /** Separator for parsing tag strings @default ',' */
  separator?: string;

  /** Enable tag validation @default true */
  enableValidation?: boolean;

  /** 
   * Optional schema for structured tag validation.
   * When provided, tags can be validated as objects.
   */
  schema?: AnySchema;

  /** 
   * Validation mode when schema validation fails.
   * @default 'warn'
   */
  schemaValidationMode?: 'throw' | 'warn' | 'silent';

  /** 
   * Allow string tags alongside structured tags.
   * @default true
   */
  allowMixedTypes?: boolean;
}

/**
 * Tag normalization rules.
 *
 * @interface TagNormalizationRules
 */
export interface TagNormalizationRules {
  /**
   * Convert to lowercase.
   * @default true
   */
  toLowerCase?: boolean;

  /**
   * Trim whitespace.
   * @default true
   */
  trim?: boolean;

  /**
   * Replace spaces with hyphens.
   * @default true
   */
  replaceSpaces?: boolean;

  /**
   * Remove special characters.
   * @default true
   */
  removeSpecialChars?: boolean;

  /**
   * Custom normalization function.
   */
  custom?: (tag: string) => string;
}

/**
 * Tag filter options.
 *
 * @interface TagFilterOptions
 */
export interface TagFilterOptions {
  /**
   * Include tags.
   */
  include?: string[];

  /**
   * Exclude tags.
   */
  exclude?: string[];

  /**
   * Pattern to match.
   */
  pattern?: RegExp;

  /**
   * Custom filter function.
   */
  custom?: (tag: string) => boolean;
}

/**
 * Tag match criteria.
 *
 * @interface TagMatchCriteria
 */
export interface TagMatchCriteria {
  /**
   * Match mode.
   * @default 'any'
   */
  mode?: 'any' | 'all' | 'exact';

  /**
   * Tags to match.
   */
  tags: string[];

  /**
   * Case sensitive matching.
   * @default false
   */
  caseSensitive?: boolean;
}

/**
 * Tag extraction options.
 *
 * @interface TagExtractionOptions
 */
export interface TagExtractionOptions {
  /**
   * Source field to extract from.
   * @default 'message'
   */
  source?: string;

  /**
   * Pattern to extract tags.
   * @default /#(\w+)/g
   */
  pattern?: RegExp;

  /**
   * Prefix to look for.
   * @default '#'
   */
  prefix?: string;

  /**
   * Maximum tags to extract.
   * @default 10
   */
  maxExtract?: number;
}

/**
 * Tag validation rules.
 *
 * @interface TagValidationRules
 */
export interface TagValidationRules {
  /**
   * Minimum tag length.
   * @default 2
   */
  minLength?: number;

  /**
   * Maximum tag length.
   * @default 50
   */
  maxLength?: number;

  /**
   * Allowed characters pattern.
   * @default /^[a-zA-Z0-9-_]+$/
   */
  pattern?: RegExp;

  /**
   * Reserved tags that cannot be used.
   */
  reserved?: string[];

  /**
   * Custom validation function.
   */
  custom?: (tag: string) => boolean;
}

/**
 * Tag validation result.
 *
 * @interface TagValidationResult
 */
export interface TagValidationResult {
  /**
   * Whether validation passed.
   */
  valid: boolean;

  /**
   * Invalid tags.
   */
  invalid?: string[];

  /**
   * Validation errors.
   */
  errors?: Record<string, string[]>;
}

/**
 * Tag statistics structure.
 *
 * @interface TagStats
 */
export interface TagStats {
  /**
   * Total number of tags processed.
   */
  totalTags: number;

  /**
   * Number of unique tags.
   */
  uniqueTags: number;

  /**
   * Most used tags.
   */
  mostUsed: Array<[string, number]>;

  /**
   * Least used tags.
   */
  leastUsed: Array<[string, number]>;
}

/**
 * Manages tags for log entries with optional schema validation.
 * 
 * Provides comprehensive tag management including:
 * - Normalization and validation
 * - Schema enforcement for structured tags
 * - Tag extraction from text
 * - Filtering and matching
 * - Usage statistics
 * 
 * @class TagManager
 * @extends {EventEmitter}
 * 
 * @example Basic string tags
 * ```typescript
 * const tagManager = new TagManager({
 *   maxTags: 20,
 *   autoNormalize: true
 * });
 * 
 * const tags = tagManager.normalize(['API', 'User Login', 'v2.0']);
 * // Result: ['api', 'user-login', 'v2-0']
 * ```
 * 
 * @example Structured tags with schema validation
 * ```typescript
 * import { object, string, number } from 'magiclogger/validation';
 * 
 * const tagManager = new TagManager({
 *   schema: object({
 *     category: string({ enum: ['error', 'warning', 'info'] }),
 *     severity: number({ min: 1, max: 10 }),
 *     component: string()
 *   }),
 *   schemaValidationMode: 'throw'
 * });
 * 
 * tagManager.add({
 *   category: 'error',
 *   severity: 8,
 *   component: 'auth'
 * }); // Validates against schema
 * ```
 */
export class TagManager extends EventEmitter {
  /** Configuration options */
  private options: Required<TagManagerOptions>;

  /** Normalization rules for string tags */
  private normalizationRules: TagNormalizationRules;

  /** Validation rules for string tags */
  private validationRules: TagValidationRules;

  /** Tag usage statistics */
  private stats: Map<string, number> = new Map();

  /** Current set of unique tags */
  private tags: Set<string> = new Set();

  /** Structured tags when using schema validation */
  private structuredTags: Set<unknown> = new Set();

  /** Tag aliases mapping */
  private aliases: Map<string, string> = new Map();

  /** Optional schema for structured tags */
  private schema?: AnySchema;

  /** Schema validator instance (lazy loaded) */
  private schemaValidator?: import('../validation/SchemaValidator').SchemaValidator;

  /** Schema validation mode */
  private schemaValidationMode: 'throw' | 'warn' | 'silent';

  /**
   * Tag hierarchy.
   * @private
   */
  private hierarchy: Map<string, Set<string>> = new Map();

  /**
   * Creates a new TagManager instance.
   * 
   * @param {TagManagerOptions} options - Configuration options
   * @constructor
   */
  constructor(options: TagManagerOptions = {}) {
    super();

    this.options = {
      maxTags: options.maxTags ?? 50,
      maxTagLength: options.maxTagLength ?? 50,
      autoNormalize: options.autoNormalize ?? true,
      separator: options.separator ?? ',',
      enableValidation: options.enableValidation ?? true,
      schema: options.schema,
      schemaValidationMode: options.schemaValidationMode ?? 'warn',
      allowMixedTypes: options.allowMixedTypes ?? true,
    } as Required<TagManagerOptions>;

    this.tags = new Set();
    this.structuredTags = new Set();
    this.aliases = new Map();
    this.hierarchy = new Map();
    this.stats = new Map();
    this.schema = options.schema;
    this.schemaValidationMode = options.schemaValidationMode ?? 'warn';

    this.normalizationRules = {
      toLowerCase: true,
      trim: true,
      replaceSpaces: true,
      removeSpecialChars: true,
      custom: undefined,
    };

    this.validationRules = {
      minLength: 2,
      maxLength: this.options.maxTagLength,
      pattern: /^[a-zA-Z0-9-_]+$/,
      reserved: [],
    };
  }

  /**
   * Set normalization rules.
   *
   * @param {TagNormalizationRules} rules - Normalization rules
   */
  public setNormalizationRules(rules: TagNormalizationRules): void {
    this.normalizationRules = { ...this.normalizationRules, ...rules };
    this.emit('normalizationRulesUpdated', this.normalizationRules);
  }

  /**
   * Set validation rules.
   *
   * @param {TagValidationRules} rules - Validation rules
   */
  public setValidationRules(rules: TagValidationRules): void {
    this.validationRules = { ...this.validationRules, ...rules };
    this.emit('validationRulesUpdated', this.validationRules);
  }

  /**
   * Normalize tags according to rules.
   *
   * @param {string | string[]} tags - Tags to normalize
   * @returns {string[]} Normalized tags
   */
  public normalize(tags: string | string[]): string[] {
    const tagArray = this.toArray(tags);

    if (!this.options.autoNormalize) {
      return tagArray;
    }

    const normalized = tagArray.map(tag => this.normalizeTag(tag));

    // Remove duplicates
    const unique = [...new Set(normalized)];

    // Apply max tags limit
    if (unique.length > this.options.maxTags) {
      this.emit('tagsLimitExceeded', {
        original: unique.length,
        limited: this.options.maxTags,
      });
      return unique.slice(0, this.options.maxTags);
    }

    return unique;
  }

  /**
   * Normalize a single tag.
   *
   * @param {string} tag - Tag to normalize
   * @returns {string} Normalized tag
   * @private
   */
  private normalizeTag(tag: string): string {
    let normalized = tag;

    // Apply custom normalization first to allow complete override
    if (this.normalizationRules.custom) {
      normalized = this.normalizationRules.custom(normalized);
      // If custom rule is provided, skip other rules unless explicitly needed
      if (normalized.length > this.options.maxTagLength) {
        normalized = normalized.substring(0, this.options.maxTagLength);
      }
      return normalized;
    }

    if (this.normalizationRules.trim) {
      normalized = normalized.trim();
    }

    if (this.normalizationRules.toLowerCase) {
      normalized = normalized.toLowerCase();
    }

    if (this.normalizationRules.replaceSpaces) {
      // Replace spaces, underscores, and dots with hyphens, but keep existing hyphens
      normalized = normalized.replace(/[\s_.]+/g, '-');
    }

    if (this.normalizationRules.removeSpecialChars) {
      // Remove special characters except hyphens and alphanumeric
      normalized = normalized.replace(/[^a-zA-Z0-9-]/g, '');

      // Clean up multiple consecutive hyphens and leading/trailing hyphens
      normalized = normalized.replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      normalized = normalized.replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }

    // Apply max length
    if (normalized.length > this.options.maxTagLength) {
      normalized = normalized.substring(0, this.options.maxTagLength);
    }

    // Check aliases
    if (this.aliases.has(normalized)) {
      const aliasValue = this.aliases.get(normalized);
      if (aliasValue) {
        normalized = aliasValue;
      }
    }

    return normalized;
  }

  /**
   * Validate tags against rules.
   *
   * @param {string | string[]} tags - Tags to validate
   * @returns {TagValidationResult} Validation result
   */
  public validate(tags: string | string[]): TagValidationResult {
    if (!this.options.enableValidation) {
      return { valid: true };
    }

    const tagArray = this.toArray(tags);
    const invalid: string[] = [];
    const errors: Record<string, string[]> = {};

    for (const tag of tagArray) {
      const tagErrors: string[] = [];

      // Check min length
      if (this.validationRules.minLength && tag.length < this.validationRules.minLength) {
        tagErrors.push(`Tag too short (min: ${this.validationRules.minLength})`);
      }

      // Check max length
      if (this.validationRules.maxLength && tag.length > this.validationRules.maxLength) {
        tagErrors.push(`Tag too long (max: ${this.validationRules.maxLength})`);
      }

      // Check pattern
      if (this.validationRules.pattern && !this.validationRules.pattern.test(tag)) {
        tagErrors.push('Tag contains invalid characters');
      }

      // Check reserved
      if (this.validationRules.reserved && this.validationRules.reserved.includes(tag)) {
        tagErrors.push('Tag is reserved');
      }

      // Custom validation
      if (this.validationRules.custom) {
        try {
          if (!this.validationRules.custom(tag)) {
            tagErrors.push('Custom validation failed');
          }
        } catch (error) {
          tagErrors.push(`Validation error: ${error}`);
        }
      }

      if (tagErrors.length > 0) {
        invalid.push(tag);
        errors[tag] = tagErrors;
      }
    }

    const result: TagValidationResult = {
      valid: invalid.length === 0,
    };

    if (invalid.length > 0) {
      result.invalid = invalid;
      result.errors = errors;
    }

    return result;
  }

  /**
   * Extract tags from text.
   *
   * @param {string} text - Text to extract from
   * @param {TagExtractionOptions} options - Extraction options
   * @returns {string[]} Extracted tags
   */
  public extract(text: string, options: TagExtractionOptions = {}): string[] {
    const { pattern = /#([\w-]+)/g, maxExtract = 10 } = options;

    const matches: string[] = [];
    let match;

    // Reset regex state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null && matches.length < maxExtract) {
      // Get the captured group or the full match
      const tag = match[1] || match[0];
      matches.push(tag);
    }

    // Normalize if auto-normalize is enabled
    if (this.options.autoNormalize) {
      return this.normalize(matches);
    }

    return matches;
  }

  /**
   * Filter tags based on criteria.
   *
   * @param {string[]} tags - Tags to filter
   * @param {TagFilterOptions} options - Filter options
   * @returns {string[]} Filtered tags
   */
  public filter(tags: string[], options: TagFilterOptions): string[] {
    let filtered = [...tags];

    // Apply include filter
    if (options.include && options.include.length > 0) {
      filtered = filtered.filter(tag => options.include?.includes(tag) ?? false);
    }

    // Apply exclude filter
    if (options.exclude && options.exclude.length > 0) {
      filtered = filtered.filter(tag => !(options.exclude?.includes(tag) ?? false));
    }

    // Apply pattern filter
    if (options.pattern) {
      filtered = filtered.filter(tag => options.pattern?.test(tag) ?? false);
    }

    // Apply custom filter
    if (options.custom) {
      filtered = filtered.filter(options.custom);
    }

    return filtered;
  }

  /**
   * Check if tags match criteria.
   *
   * @param {string[]} tags - Tags to check
   * @param {TagMatchCriteria} criteria - Match criteria
   * @returns {boolean} Whether tags match
   */
  public matches(tags: string[], criteria: TagMatchCriteria): boolean {
    const { mode = 'any', tags: matchTags, caseSensitive = false } = criteria;

    // Normalize for comparison if not case sensitive
    const normalizedTags = caseSensitive ? tags : tags.map(t => t.toLowerCase());
    const normalizedMatch = caseSensitive ? matchTags : matchTags.map(t => t.toLowerCase());

    switch (mode) {
      case 'any':
        return normalizedMatch.some(tag => normalizedTags.includes(tag));

      case 'all':
        return normalizedMatch.every(tag => normalizedTags.includes(tag));

      case 'exact':
        return (
          normalizedTags.length === normalizedMatch.length &&
          normalizedTags.every(tag => normalizedMatch.includes(tag))
        );

      default:
        return false;
    }
  }

  /**
   * Merge multiple tag arrays.
   *
   * @param {...(string[] | undefined)[]} tagArrays - Tag arrays to merge
   * @returns {string[]} Merged tags
   */
  public merge(...tagArrays: (string[] | undefined)[]): string[] {
    const merged = new Set<string>();

    for (const tags of tagArrays) {
      if (tags) {
        for (const tag of tags) {
          merged.add(tag);
        }
      }
    }

    const result = Array.from(merged);

    // Apply normalization if enabled
    if (this.options.autoNormalize) {
      return this.normalize(result);
    }

    return result;
  }

  /**
   * Add tag alias.
   *
   * @param {string} alias - Alias tag
   * @param {string} target - Target tag
   */
  public addAlias(alias: string, target: string): void {
    this.aliases.set(alias, target);
    this.emit('aliasAdded', { alias, target });
  }

  /**
   * Remove tag alias.
   *
   * @param {string} alias - Alias to remove
   */
  public removeAlias(alias: string): void {
    if (this.aliases.delete(alias)) {
      this.emit('aliasRemoved', alias);
    }
  }

  /**
   * Get all aliases.
   *
   * @returns {Map<string, string>} All aliases
   */
  public getAliases(): Map<string, string> {
    return new Map(this.aliases);
  }

  /**
   * Set tag hierarchy.
   *
   * @param {string} parent - Parent tag
   * @param {string[]} children - Child tags
   */
  public setHierarchy(parent: string, children: string[]): void {
    this.hierarchy.set(parent, new Set(children));
    this.emit('hierarchyUpdated', { parent, children });
  }

  /**
   * Get tag children.
   *
   * @param {string} parent - Parent tag
   * @returns {string[]} Child tags
   */
  public getChildren(parent: string): string[] {
    const children = this.hierarchy.get(parent);
    return children ? Array.from(children) : [];
  }

  /**
   * Get tag parents.
   *
   * @param {string} child - Child tag
   * @returns {string[]} Parent tags
   */
  public getParents(child: string): string[] {
    const parents: string[] = [];

    for (const [parent, children] of this.hierarchy) {
      if (children.has(child)) {
        parents.push(parent);
      }
    }

    return parents;
  }

  /**
   * Get tag with hierarchy.
   *
   * @param {string} tag - Tag to expand
   * @param {boolean} includeParents - Include parent tags
   * @param {boolean} includeChildren - Include child tags
   * @returns {string[]} Expanded tags
   */
  public expandHierarchy(tag: string, includeParents = true, includeChildren = true): string[] {
    const expanded = new Set<string>([tag]);

    if (includeParents) {
      const parents = this.getParents(tag);
      parents.forEach(parent => expanded.add(parent));
    }

    if (includeChildren) {
      const children = this.getChildren(tag);
      children.forEach(child => expanded.add(child));
    }

    return Array.from(expanded);
  }

  /**
   * Update tag statistics.
   *
   * @param {string[]} tags - Tags to count
   */
  public updateStats(tags: string[]): void {
    for (const tag of tags) {
      const count = this.stats.get(tag) || 0;
      this.stats.set(tag, count + 1);
      this.tags.add(tag);
    }

    this.emit('statsUpdated', tags);
  }

  /**
   * Get tag statistics.
   *
   * @param {number} [limit] - Limit results
   * @returns {Array<[string, number]>} Tag counts
   */
  public getStats(limit?: number): Array<[string, number]> {
    const sorted = Array.from(this.stats.entries()).sort((a, b) => b[1] - a[1]);

    if (limit) {
      return sorted.slice(0, limit);
    }

    return sorted;
  }

  /**
   * Get comprehensive tag statistics.
   *
   * @returns {TagStats} Tag statistics
   */
  public getComprehensiveStats(): TagStats {
    const sorted = this.getStats();

    return {
      totalTags: Array.from(this.stats.values()).reduce((sum, count) => sum + count, 0),
      uniqueTags: this.tags.size,
      mostUsed: sorted.slice(0, 10),
      leastUsed: sorted.slice(-10).reverse(),
    };
  }

  /**
   * Clear tag statistics.
   */
  public clearStats(): void {
    this.stats.clear();
    this.tags.clear();
    this.emit('statsCleared');
  }

  /**
   * Parse tags from string.
   *
   * @param {string} text - Text to parse
   * @param {string} [separator] - Separator to use
   * @returns {string[]} Parsed tags
   */
  public parse(text: string, separator?: string): string[] {
    const sep = separator || this.options.separator;
    const tags = text
      .split(sep)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (this.options.autoNormalize) {
      return this.normalize(tags);
    }

    return tags;
  }

  /**
   * Format tags to string.
   *
   * @param {string[]} tags - Tags to format
   * @param {string} [separator] - Separator to use
   * @returns {string} Formatted string
   */
  public format(tags: string[], separator?: string): string {
    const sep = separator || this.options.separator;
    return tags.join(sep);
  }

  /**
   * Convert to array helper.
   *
   * @param {string | string[]} value - Value to convert
   * @returns {string[]} Array of strings
   * @private
   */
  private toArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  }

  /**
   * Get suggested tags based on partial input.
   *
   * @param {string} partial - Partial tag
   * @param {number} [limit=10] - Maximum suggestions
   * @returns {string[]} Suggested tags
   */
  public suggest(partial: string, limit = 10): string[] {
    const normalized = this.options.autoNormalize
      ? this.normalizeTag(partial)
      : partial.toLowerCase();

    const suggestions: Array<[string, number]> = [];

    for (const [tag, count] of this.stats) {
      if (tag.toLowerCase().startsWith(normalized)) {
        suggestions.push([tag, count]);
      }
    }

    // Sort by frequency
    suggestions.sort((a, b) => b[1] - a[1]);

    return suggestions.slice(0, limit).map(s => s[0]);
  }

  /**
   * Sets a schema for structured tag validation.
   * 
   * @param {AnySchema} schema - Schema definition for tags
   * @param {'throw' | 'warn' | 'silent'} [mode] - Validation mode
   * 
   * @example
   * ```typescript
   * import { object, string, number, array } from 'magiclogger/validation';
   * 
   * tagManager.setSchema(
   *   object({
   *     category: string({ enum: ['bug', 'feature', 'docs'] }),
   *     priority: number({ min: 1, max: 5 }),
   *     labels: array(string())
   *   }),
   *   'throw'
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
   * Adds tags with optional schema validation.
   * 
   * @param {string | string[] | unknown} tags - Tags to add
   * @returns {boolean} Whether tags were successfully added
   */
  public add(tags: string | string[] | unknown): boolean {
    // Handle structured tags with schema
    if (this.schema && typeof tags === 'object' && !Array.isArray(tags)) {
      return this.addStructured(tags);
    }

    // Handle string tags
    const stringTags = this.normalize(tags as string | string[]);
    const validation = this.validate(stringTags);
    
    if (!validation.valid) {
      this.handleValidationError('String tags validation failed', validation);
      return false;
    }

    stringTags.forEach(tag => {
      this.tags.add(tag);
      this.updateStats([tag]);
    });

    this.emit('tagsAdded', stringTags);
    return true;
  }

  /**
   * Adds a structured tag with schema validation.
   * 
   * @private
   * @param {unknown} tagData - Structured tag data
   * @returns {boolean} Whether tag was added
   */
  private addStructured(tagData: unknown): boolean {
    if (!this.schema) {
      this.emit('error', new Error('Schema not set for structured tags'));
      return false;
    }

    const result = this.validateWithSchema(tagData);
    
    if (!result.valid) {
      this.handleSchemaValidationError(result, tagData);
      return this.schemaValidationMode !== 'throw';
    }

    this.structuredTags.add(result.data || tagData);
    this.emit('structuredTagAdded', result.data || tagData);
    return true;
  }

  /**
   * Validates data against the configured schema.
   * 
   * @private
   * @param {unknown} data - Data to validate
   * @returns {ValidationResult} Validation result
   */
  private validateWithSchema(data: unknown): ValidationResult {
    if (!this.schema) {
      return { valid: true, data };
    }

    // Lazy load validator
    if (!this.schemaValidator) {
      // Dynamic import for lazy loading
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { SchemaValidator } = require('../validation/SchemaValidator') as typeof import('../validation/SchemaValidator');
      this.schemaValidator = new SchemaValidator();
    }

    // Guard against undefined to satisfy eslint no-non-null-assertion
    const validator = this.schemaValidator;
    const schema = this.schema;
    if (!validator || !schema) {
      return { valid: true, data } as ValidationResult;
    }
    return validator.validate(data, schema);
  }

  /**
   * Handles schema validation errors.
   * 
   * @private
   * @param {ValidationResult} result - Validation result
   * @param {unknown} data - Data that failed validation
   */
  private handleSchemaValidationError(result: ValidationResult, data: unknown): void {
    if (!result.errors || result.errors.length === 0) return;

    const errorMessage = `Tag schema validation failed:\n${result.errors
      .map(e => `  - ${e.path}: ${e.message}`)
      .join('\n')}`;

    this.emit('schemaValidationFailed', { result, data });

    switch (this.schemaValidationMode) {
      case 'throw':
        throw new Error(errorMessage);
      case 'warn':
        console.warn(`[TagManager] ${errorMessage}`);
        break;
      case 'silent':
        // Silent mode - no output
        break;
    }
  }

  /**
   * Handles validation errors for string tags.
   * 
   * @private
   * @param {string} message - Error message
   * @param {TagValidationResult} validation - Validation result
   */
  private handleValidationError(message: string, validation: TagValidationResult): void {
    const errors = validation.errors || {};
    const errorDetails = Object.entries(errors)
      .map(([tag, errs]) => `  - ${tag}: ${errs.join(', ')}`)
      .join('\n');

    this.emit('validationFailed', validation);

    if (this.options.enableValidation) {
      console.warn(`[TagManager] ${message}:\n${errorDetails}`);
    }
  }

  /**
   * Gets all tags (both string and structured).
   * 
   * @returns {{ strings: string[], structured: unknown[] }} All tags
   */
  public getAllTags(): { strings: string[]; structured: unknown[] } {
    return {
      strings: Array.from(this.tags),
      structured: Array.from(this.structuredTags)
    };
  }

  /**
   * Clears all tags.
   */
  public clear(): void {
    this.tags.clear();
    this.structuredTags.clear();
    this.emit('tagsCleared');
  }

  /**
   * Clean up resources.
   */
  public destroy(): void {
    this.stats.clear();
    this.tags.clear();
    this.structuredTags.clear();
    this.aliases.clear();
    this.hierarchy.clear();
    this.removeAllListeners();
  }
}

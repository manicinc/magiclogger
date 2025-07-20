// File: src/core/TagManager.ts

/**
 * TagManager provides utilities for managing and manipulating tags
 * in log entries. It handles tag normalization, filtering, grouping,
 * and provides helper methods for common tag operations.
 * 
 * @example
 * ```typescript
 * const tagManager = new TagManager();
 * 
 * // Normalize tags
 * const normalized = tagManager.normalize(['API', 'v1.0', 'PROD']);
 * // Result: ['api', 'v1-0', 'prod']
 * 
 * // Filter tags
 * const filtered = tagManager.filter(['api', 'debug', 'prod'], {
 *   include: ['api', 'prod'],
 *   exclude: ['debug']
 * });
 * // Result: ['api', 'prod']
 * 
 * // Group tags
 * const grouped = tagManager.group(['api-v1', 'api-v2', 'db-read', 'db-write']);
 * // Result: { api: ['v1', 'v2'], db: ['read', 'write'] }
 * ```
 */
export class TagManager {
  private readonly normalizationRules: TagNormalizationRules;
  private readonly hierarchySeparator: string;

  /**
   * Creates a new TagManager instance.
   * 
   * @param {TagManagerOptions} [options={}] - Configuration options
   */
  constructor(options: TagManagerOptions = {}) {
    this.normalizationRules = {
      lowercase: options.normalizationRules?.lowercase ?? true,
      replaceSpaces: options.normalizationRules?.replaceSpaces ?? true,
      replaceDots: options.normalizationRules?.replaceDots ?? true,
      removeSpecialChars: options.normalizationRules?.removeSpecialChars ?? false,
      maxLength: options.normalizationRules?.maxLength ?? 50,
      ...options.normalizationRules
    };
    
    this.hierarchySeparator = options.hierarchySeparator || '-';
  }

  /**
   * Normalize tags according to configured rules.
   * 
   * @param {string[]} tags - Tags to normalize
   * @returns {string[]} Normalized tags
   * 
   * @example
   * ```typescript
   * const tags = ['API Service', 'v1.0', 'PRODUCTION', 'user@auth'];
   * const normalized = tagManager.normalize(tags);
   * // Result: ['api-service', 'v1-0', 'production', 'user-auth']
   * ```
   */
  public normalize(tags: string[]): string[] {
    return tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => this.normalizeTag(tag))
      .filter(tag => tag.length > 0);
  }

  /**
   * Filter tags based on include/exclude criteria.
   * 
   * @param {string[]} tags - Tags to filter
   * @param {TagFilterOptions} options - Filter options
   * @returns {string[]} Filtered tags
   * 
   * @example
   * ```typescript
   * const tags = ['api', 'debug', 'production', 'v1', 'internal'];
   * const filtered = tagManager.filter(tags, {
   *   include: ['api', 'production', 'v1'],
   *   exclude: ['debug', 'internal'],
   *   patterns: [/^v\d+$/] // Include version tags
   * });
   * // Result: ['api', 'production', 'v1']
   * ```
   */
  public filter(tags: string[], options: TagFilterOptions): string[] {
    let result = [...tags];
    
    // Apply include filter
    if (options.include && options.include.length > 0) {
      result = result.filter(tag => 
        options.include!.includes(tag) ||
        (options.patterns && options.patterns.some(pattern => pattern.test(tag)))
      );
    }
    
    // Apply exclude filter
    if (options.exclude && options.exclude.length > 0) {
      result = result.filter(tag => !options.exclude!.includes(tag));
    }
    
    // Apply pattern filters
    if (options.patterns && !options.include) {
      result = result.filter(tag => 
        options.patterns!.some(pattern => pattern.test(tag))
      );
    }
    
    return result;
  }

  /**
   * Group tags by hierarchy using the configured separator.
   * 
   * @param {string[]} tags - Tags to group
   * @returns {Record<string, string[]>} Grouped tags
   * 
   * @example
   * ```typescript
   * const tags = ['api-v1', 'api-v2', 'db-read', 'db-write', 'cache-redis', 'cache-memory'];
   * const grouped = tagManager.group(tags);
   * // Result: {
   * //   api: ['v1', 'v2'],
   * //   db: ['read', 'write'],
   * //   cache: ['redis', 'memory']
   * // }
   * ```
   */
  public group(tags: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    for (const tag of tags) {
      const parts = tag.split(this.hierarchySeparator);
      if (parts.length > 1) {
        const [group, ...subTags] = parts;
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(subTags.join(this.hierarchySeparator));
      } else {
        // Tags without hierarchy go to 'general' group
        if (!groups.general) {
          groups.general = [];
        }
        groups.general.push(tag);
      }
    }
    
    return groups;
  }

  /**
   * Merge multiple tag arrays, removing duplicates and applying normalization.
   * 
   * @param {...string[][]} tagArrays - Arrays of tags to merge
   * @returns {string[]} Merged and deduplicated tags
   * 
   * @example
   * ```typescript
   * const merged = tagManager.merge(
   *   ['api', 'v1'],
   *   ['API', 'production'],
   *   ['v1', 'debug']
   * );
   * // Result: ['api', 'v1', 'production', 'debug']
   * ```
   */
  public merge(...tagArrays: string[][]): string[] {
    const allTags = tagArrays.flat();
    const normalized = this.normalize(allTags);
    return [...new Set(normalized)]; // Remove duplicates
  }

  /**
   * Check if tags match given criteria.
   * 
   * @param {string[]} tags - Tags to check
   * @param {TagMatchCriteria} criteria - Match criteria
   * @returns {boolean} Whether tags match criteria
   * 
   * @example
   * ```typescript
   * const tags = ['api', 'v1', 'production'];
   * 
   * // Check if has all required tags
   * const hasRequired = tagManager.matches(tags, {
   *   all: ['api', 'production']
   * }); // true
   * 
   * // Check if has any of the tags
   * const hasAny = tagManager.matches(tags, {
   *   any: ['debug', 'v1']
   * }); // true
   * 
   * // Check if doesn't have forbidden tags
   * const noForbidden = tagManager.matches(tags, {
   *   none: ['debug', 'test']
   * }); // true
   * ```
   */
  public matches(tags: string[], criteria: TagMatchCriteria): boolean {
    // Check 'all' criteria
    if (criteria.all && criteria.all.length > 0) {
      if (!criteria.all.every(tag => tags.includes(tag))) {
        return false;
      }
    }
    
    // Check 'any' criteria
    if (criteria.any && criteria.any.length > 0) {
      if (!criteria.any.some(tag => tags.includes(tag))) {
        return false;
      }
    }
    
    // Check 'none' criteria
    if (criteria.none && criteria.none.length > 0) {
      if (criteria.none.some(tag => tags.includes(tag))) {
        return false;
      }
    }
    
    // Check pattern criteria
    if (criteria.patterns && criteria.patterns.length > 0) {
      const hasMatchingPattern = tags.some(tag =>
        criteria.patterns!.some(pattern => pattern.test(tag))
      );
      if (!hasMatchingPattern) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Generate hierarchical tags from a path or namespace.
   * 
   * @param {string} path - Path to convert to tags
   * @param {string} [separator='/'] - Path separator
   * @returns {string[]} Generated hierarchical tags
   * 
   * @example
   * ```typescript
   * const tags = tagManager.fromPath('api/v1/users/create', '/');
   * // Result: ['api', 'api-v1', 'api-v1-users', 'api-v1-users-create']
   * ```
   */
  public fromPath(path: string, separator = '/'): string[] {
    const parts = path.split(separator).filter(part => part.length > 0);
    const tags: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const tagParts = parts.slice(0, i + 1);
      const tag = this.normalizeTag(tagParts.join(this.hierarchySeparator));
      if (tag) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  /**
   * Create tags from an object's properties.
   * 
   * @param {Record<string, any>} obj - Object to extract tags from
   * @param {TagExtractionOptions} [options={}] - Extraction options
   * @returns {string[]} Extracted tags
   * 
   * @example
   * ```typescript
   * const obj = {
   *   service: 'api',
   *   version: '1.0',
   *   environment: 'production',
   *   features: ['auth', 'payments']
   * };
   * 
   * const tags = tagManager.fromObject(obj, {
   *   prefix: 'app',
   *   includeArrays: true
   * });
   * // Result: ['app-service-api', 'app-version-1-0', 'app-environment-production', 'app-features-auth', 'app-features-payments']
   * ```
   */
  public fromObject(obj: Record<string, any>, options: TagExtractionOptions = {}): string[] {
    const tags: string[] = [];
    const prefix = options.prefix ? `${options.prefix}${this.hierarchySeparator}` : '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      const normalizedKey = this.normalizeTag(key);
      
      if (Array.isArray(value) && options.includeArrays) {
        for (const item of value) {
          if (typeof item === 'string' || typeof item === 'number') {
            const tag = `${prefix}${normalizedKey}${this.hierarchySeparator}${this.normalizeTag(String(item))}`;
            tags.push(tag);
          }
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        const tag = `${prefix}${normalizedKey}${this.hierarchySeparator}${this.normalizeTag(String(value))}`;
        tags.push(tag);
      } else if (typeof value === 'boolean') {
        if (value) {
          tags.push(`${prefix}${normalizedKey}`);
        }
      }
    }
    
    return tags;
  }

  /**
   * Validate tags against configured rules.
   * 
   * @param {string[]} tags - Tags to validate
   * @param {TagValidationRules} [rules] - Validation rules
   * @returns {TagValidationResult} Validation result
   * 
   * @example
   * ```typescript
   * const validation = tagManager.validate(['api', 'v1', 'production'], {
   *   maxCount: 5,
   *   allowedPatterns: [/^[a-z0-9-]+$/],
   *   required: ['api'],
   *   forbidden: ['debug', 'test']
   * });
   * 
   * if (!validation.valid) {
   *   console.error('Tag validation failed:', validation.errors);
   * }
   * ```
   */
  public validate(tags: string[], rules: TagValidationRules = {}): TagValidationResult {
    const errors: string[] = [];
    
    // Check max count
    if (rules.maxCount !== undefined && tags.length > rules.maxCount) {
      errors.push(`Too many tags: ${tags.length} > ${rules.maxCount}`);
    }
    
    // Check min count
    if (rules.minCount !== undefined && tags.length < rules.minCount) {
      errors.push(`Too few tags: ${tags.length} < ${rules.minCount}`);
    }
    
    // Check required tags
    if (rules.required) {
      for (const required of rules.required) {
        if (!tags.includes(required)) {
          errors.push(`Required tag '${required}' is missing`);
        }
      }
    }
    
    // Check forbidden tags
    if (rules.forbidden) {
      for (const forbidden of rules.forbidden) {
        if (tags.includes(forbidden)) {
          errors.push(`Forbidden tag '${forbidden}' is present`);
        }
      }
    }
    
    // Check allowed patterns
    if (rules.allowedPatterns) {
      for (const tag of tags) {
        const isAllowed = rules.allowedPatterns.some(pattern => pattern.test(tag));
        if (!isAllowed) {
          errors.push(`Tag '${tag}' doesn't match allowed patterns`);
        }
      }
    }
    
    // Check forbidden patterns
    if (rules.forbiddenPatterns) {
      for (const tag of tags) {
        const isForbidden = rules.forbiddenPatterns.some(pattern => pattern.test(tag));
        if (isForbidden) {
          errors.push(`Tag '${tag}' matches forbidden pattern`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Private helper methods

  private normalizeTag(tag: string): string {
    let normalized = tag.trim();
    
    if (this.normalizationRules.lowercase) {
      normalized = normalized.toLowerCase();
    }
    
    if (this.normalizationRules.replaceSpaces) {
      normalized = normalized.replace(/\s+/g, this.hierarchySeparator);
    }
    
    if (this.normalizationRules.replaceDots) {
      normalized = normalized.replace(/\./g, this.hierarchySeparator);
    }
    
    if (this.normalizationRules.removeSpecialChars) {
      normalized = normalized.replace(/[^a-zA-Z0-9\-_]/g, '');
    }
    
    if (this.normalizationRules.maxLength) {
      normalized = normalized.substring(0, this.normalizationRules.maxLength);
    }
    
    return normalized;
  }
}

/**
 * Configuration options for TagManager.
 */
export interface TagManagerOptions {
  /**
   * Rules for normalizing tags.
   */
  normalizationRules?: TagNormalizationRules;
  
  /**
   * Separator for hierarchical tags.
   * @default '-'
   */
  hierarchySeparator?: string;
}

/**
 * Rules for normalizing tags.
 */
export interface TagNormalizationRules {
  /**
   * Convert tags to lowercase.
   * @default true
   */
  lowercase?: boolean;
  
  /**
   * Replace spaces with hierarchy separator.
   * @default true
   */
  replaceSpaces?: boolean;
  
  /**
   * Replace dots with hierarchy separator.
   * @default true
   */
  replaceDots?: boolean;
  
  /**
   * Remove special characters.
   * @default false
   */
  removeSpecialChars?: boolean;
  
  /**
   * Maximum tag length.
   * @default 50
   */
  maxLength?: number;
}

/**
 * Options for filtering tags.
 */
export interface TagFilterOptions {
  /**
   * Tags that must be included.
   */
  include?: string[];
  
  /**
   * Tags that must be excluded.
   */
  exclude?: string[];
  
  /**
   * Regex patterns for matching tags.
   */
  patterns?: RegExp[];
}

/**
 * Criteria for matching tags.
 */
export interface TagMatchCriteria {
  /**
   * All of these tags must be present.
   */
  all?: string[];
  
  /**
   * At least one of these tags must be present.
   */
  any?: string[];
  
  /**
   * None of these tags must be present.
   */
  none?: string[];
  
  /**
   * At least one tag must match one of these patterns.
   */
  patterns?: RegExp[];
}

/**
 * Options for extracting tags from objects.
 */
export interface TagExtractionOptions {
  /**
   * Prefix to add to all extracted tags.
   */
  prefix?: string;
  
  /**
   * Whether to include array values as separate tags.
   * @default false
   */
  includeArrays?: boolean;
}

/**
 * Rules for validating tags.
 */
export interface TagValidationRules {
  /**
   * Maximum number of tags allowed.
   */
  maxCount?: number;
  
  /**
   * Minimum number of tags required.
   */
  minCount?: number;
  
  /**
   * Tags that must be present.
   */
  required?: string[];
  
  /**
   * Tags that must not be present.
   */
  forbidden?: string[];
  
  /**
   * Patterns that tags must match.
   */
  allowedPatterns?: RegExp[];
  
  /**
   * Patterns that tags must not match.
   */
  forbiddenPatterns?: RegExp[];
}

/**
 * Result of tag validation.
 */
export interface TagValidationResult {
  /**
   * Whether the tags are valid.
   */
  valid: boolean;
  
  /**
   * Validation error messages.
   */
  errors: string[];
}
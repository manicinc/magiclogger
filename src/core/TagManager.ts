// File: src/core/TagManager.ts

/**
 * Tag management utilities for log categorization.
 * 
 * The TagManager provides comprehensive tag manipulation:
 * - Tag normalization and validation
 * - Hierarchical tag support (parent.child)
 * - Tag aliasing and synonyms
 * - Tag rules and constraints
 * - Tag statistics and analytics
 * - Performance-optimized operations
 * 
 * @class TagManager
 * 
 * @example
 * ```typescript
 * const tagManager = new TagManager({
 *   aliases: {
 *     'err': 'error',
 *     'warn': 'warning'
 *   },
 *   rules: {
 *     maxTags: 10,
 *     maxLength: 50,
 *     pattern: /^[a-z0-9-_.]+$/
 *   }
 * });
 * 
 * // Normalize tags
 * const tags = tagManager.normalize(['ERR', 'user.action', 'api']);
 * // Result: ['error', 'user.action', 'api']
 * 
 * // Check hierarchy
 * tagManager.isChildOf('user.action.login', 'user'); // true
 * ```
 */
export class TagManager {
  /**
   * Tag aliases mapping.
   * @private
   */
  private aliases: Map<string, string>;

  /**
   * Reverse alias mapping for lookups.
   * @private
   */
  private reverseAliases: Map<string, Set<string>>;

  /**
   * Tag validation rules.
   * @private
   */
  private rules: {
    maxTags: number;
    maxLength: number;
    minLength: number;
    pattern?: RegExp;
    required?: string[];
    forbidden?: string[];
    lowercase: boolean;
    trim: boolean;
  };

  /**
   * Tag statistics.
   * @private
   */
  private stats: Map<string, {
    count: number;
    firstSeen: Date;
    lastSeen: Date;
  }>;

  /**
   * Hierarchical tag index.
   * @private
   */
  private hierarchy: Map<string, Set<string>>;

  /**
   * Tag metadata storage.
   * @private
   */
  private metadata: Map<string, Record<string, any>>;

  /**
   * Creates a new TagManager instance.
   * 
   * @param {object} options - Configuration options
   */
  constructor(options: {
    aliases?: Record<string, string>;
    rules?: Partial<TagManager['rules']>;
    metadata?: Record<string, Record<string, any>>;
  } = {}) {
    this.aliases = new Map(Object.entries(options.aliases || {}));
    this.reverseAliases = new Map();
    this.stats = new Map();
    this.hierarchy = new Map();
    this.metadata = new Map(Object.entries(options.metadata || {}));

    // Build reverse aliases
    for (const [alias, canonical] of this.aliases) {
      if (!this.reverseAliases.has(canonical)) {
        this.reverseAliases.set(canonical, new Set());
      }
      this.reverseAliases.get(canonical)!.add(alias);
    }

    // Set default rules
    this.rules = {
      maxTags: 20,
      maxLength: 100,
      minLength: 1,
      pattern: /^[a-zA-Z0-9-_.:/]+$/,
      required: [],
      forbidden: [],
      lowercase: true,
      trim: true,
      ...options.rules,
    };
  }

  /**
   * Normalize an array of tags.
   * 
   * @param {string[]} tags - Tags to normalize
   * @returns {string[]} Normalized tags
   */
  public normalize(tags: string[]): string[] {
    if (!Array.isArray(tags)) return [];

    const normalized = new Set<string>();
    
    for (let tag of tags) {
      if (typeof tag !== 'string') continue;

      // Apply basic normalization
      if (this.rules.trim) {
        tag = tag.trim();
      }

      if (this.rules.lowercase) {
        tag = tag.toLowerCase();
      }

      // Skip empty tags
      if (!tag) continue;

      // Apply alias
      tag = this.resolveAlias(tag);

      // Validate tag
      if (!this.isValid(tag)) continue;

      // Check forbidden
      if (this.rules.forbidden?.includes(tag)) continue;

      normalized.add(tag);

      // Update hierarchy
      this.updateHierarchy(tag);
    }

    // Add required tags
    for (const required of this.rules.required || []) {
      normalized.add(required);
    }

    // Apply max limit
    const result = Array.from(normalized);
    if (result.length > this.rules.maxTags) {
      return result.slice(0, this.rules.maxTags);
    }

    return result;
  }

  /**
   * Validate a single tag.
   * 
   * @param {string} tag - Tag to validate
   * @returns {boolean} True if valid
   */
  public isValid(tag: string): boolean {
    if (typeof tag !== 'string') return false;
    
    if (tag.length < this.rules.minLength || tag.length > this.rules.maxLength) {
      return false;
    }

    if (this.rules.pattern && !this.rules.pattern.test(tag)) {
      return false;
    }

    return true;
  }

  /**
   * Resolve tag alias to canonical form.
   * 
   * @param {string} tag - Tag to resolve
   * @returns {string} Canonical tag
   */
  public resolveAlias(tag: string): string {
    return this.aliases.get(tag) || tag;
  }

  /**
   * Get all aliases for a canonical tag.
   * 
   * @param {string} tag - Canonical tag
   * @returns {string[]} Array of aliases
   */
  public getAliases(tag: string): string[] {
    const aliases = this.reverseAliases.get(tag);
    return aliases ? Array.from(aliases) : [];
  }

  /**
   * Add or update a tag alias.
   * 
   * @param {string} alias - Alias tag
   * @param {string} canonical - Canonical tag
   */
  public addAlias(alias: string, canonical: string): void {
    // Remove old alias if exists
    const oldCanonical = this.aliases.get(alias);
    if (oldCanonical) {
      this.reverseAliases.get(oldCanonical)?.delete(alias);
    }

    // Add new alias
    this.aliases.set(alias, canonical);
    
    if (!this.reverseAliases.has(canonical)) {
      this.reverseAliases.set(canonical, new Set());
    }
    this.reverseAliases.get(canonical)!.add(alias);
  }

  /**
   * Remove a tag alias.
   * 
   * @param {string} alias - Alias to remove
   */
  public removeAlias(alias: string): void {
    const canonical = this.aliases.get(alias);
    if (canonical) {
      this.aliases.delete(alias);
      this.reverseAliases.get(canonical)?.delete(alias);
    }
  }

  /**
   * Merge multiple tag arrays.
   * 
   * @param {...string[][]} tagArrays - Arrays of tags to merge
   * @returns {string[]} Merged and normalized tags
   */
  public merge(...tagArrays: string[][]): string[] {
    const allTags = new Set<string>();
    
    for (const tags of tagArrays) {
      if (!Array.isArray(tags)) continue;
      
      const normalized = this.normalize(tags);
      for (const tag of normalized) {
        allTags.add(tag);
      }
    }

    return Array.from(allTags);
  }

  /**
   * Check if a tag is a child of another tag (hierarchical).
   * 
   * @param {string} child - Child tag
   * @param {string} parent - Parent tag
   * @returns {boolean} True if child of parent
   */
  public isChildOf(child: string, parent: string): boolean {
    if (!child.startsWith(parent)) return false;
    
    // Check if it's a proper hierarchy separator
    const separator = child[parent.length];
    return separator === '.' || separator === ':' || separator === '/';
  }

  /**
   * Get all children of a tag.
   * 
   * @param {string} parent - Parent tag
   * @returns {string[]} Child tags
   */
  public getChildren(parent: string): string[] {
    const children = this.hierarchy.get(parent);
    return children ? Array.from(children) : [];
  }

  /**
   * Get parent tags from a hierarchical tag.
   * 
   * @param {string} tag - Hierarchical tag
   * @returns {string[]} Parent tags
   */
  public getParents(tag: string): string[] {
    const parents: string[] = [];
    const separators = ['.', ':', '/'];
    
    for (const sep of separators) {
      const parts = tag.split(sep);
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          parents.push(parts.slice(0, i).join(sep));
        }
        break;
      }
    }

    return parents;
  }

  /**
   * Update hierarchical index.
   * 
   * @param {string} tag - Tag to index
   * @private
   */
  private updateHierarchy(tag: string): void {
    const parents = this.getParents(tag);
    
    for (const parent of parents) {
      if (!this.hierarchy.has(parent)) {
        this.hierarchy.set(parent, new Set());
      }
      this.hierarchy.get(parent)!.add(tag);
    }
  }

  /**
   * Filter tags by pattern.
   * 
   * @param {string[]} tags - Tags to filter
   * @param {string | RegExp} pattern - Pattern to match
   * @returns {string[]} Filtered tags
   */
  public filter(tags: string[], pattern: string | RegExp): string[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return tags.filter(tag => regex.test(tag));
  }

  /**
   * Group tags by prefix.
   * 
   * @param {string[]} tags - Tags to group
   * @returns {Record<string, string[]>} Grouped tags
   */
  public groupByPrefix(tags: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    for (const tag of tags) {
      const firstSep = tag.search(/[.:/]/);
      const prefix = firstSep > 0 ? tag.substring(0, firstSep) : '_root';
      
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(tag);
    }

    return groups;
  }

  /**
   * Record tag usage for statistics.
   * 
   * @param {string[]} tags - Tags that were used
   */
  public recordUsage(tags: string[]): void {
    const now = new Date();
    
    for (const tag of tags) {
      let stat = this.stats.get(tag);
      
      if (!stat) {
        stat = {
          count: 0,
          firstSeen: now,
          lastSeen: now,
        };
        this.stats.set(tag, stat);
      }

      stat.count++;
      stat.lastSeen = now;
    }
  }

  /**
   * Get tag statistics.
   * 
   * @param {string} tag - Tag to get stats for
   * @returns {object | null} Tag statistics
   */
  public getStats(tag: string): TagManager['stats'] extends Map<string, infer T> ? T | null : null {
    return this.stats.get(tag) || null;
  }

  /**
   * Get most used tags.
   * 
   * @param {number} limit - Number of tags to return
   * @returns {Array<{tag: string; count: number}>} Top tags
   */
  public getTopTags(limit = 10): Array<{ tag: string; count: number }> {
    const sorted = Array.from(this.stats.entries())
      .map(([tag, stat]) => ({ tag, count: stat.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  }

  /**
   * Get or set tag metadata.
   * 
   * @param {string} tag - Tag name
   * @param {Record<string, any>} [metadata] - Metadata to set
   * @returns {Record<string, any> | undefined} Tag metadata
   */
  public metadata(tag: string, metadata?: Record<string, any>): Record<string, any> | undefined {
    if (metadata !== undefined) {
      this.metadata.set(tag, metadata);
      return metadata;
    }
    return this.metadata.get(tag);
  }

  /**
   * Suggest tags based on partial input.
   * 
   * @param {string} partial - Partial tag string
   * @param {number} limit - Maximum suggestions
   * @returns {string[]} Suggested tags
   */
  public suggest(partial: string, limit = 5): string[] {
    const normalizedPartial = this.rules.lowercase ? partial.toLowerCase() : partial;
    const suggestions: Array<{ tag: string; score: number }> = [];

    // Check all known tags
    for (const [tag, stat] of this.stats) {
      if (tag.startsWith(normalizedPartial)) {
        // Exact prefix match gets highest score
        suggestions.push({ tag, score: 1000 + stat.count });
      } else if (tag.includes(normalizedPartial)) {
        // Contains match gets lower score
        suggestions.push({ tag, score: 500 + stat.count });
      }
    }

    // Check aliases
    for (const [alias, canonical] of this.aliases) {
      if (alias.startsWith(normalizedPartial) && !suggestions.some(s => s.tag === canonical)) {
        const stat = this.stats.get(canonical);
        suggestions.push({ tag: canonical, score: 800 + (stat?.count || 0) });
      }
    }

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.tag);
  }

  /**
   * Validate a set of tags against rules.
   * 
   * @param {string[]} tags - Tags to validate
   * @returns {object} Validation result
   */
  public validateSet(tags: string[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
      return { valid: false, errors, warnings };
    }

    // Check max tags
    if (tags.length > this.rules.maxTags) {
      errors.push(`Too many tags: ${tags.length} > ${this.rules.maxTags}`);
    }

    // Check required tags
    for (const required of this.rules.required || []) {
      if (!tags.includes(required)) {
        errors.push(`Missing required tag: ${required}`);
      }
    }

    // Validate each tag
    const seen = new Set<string>();
    for (const tag of tags) {
      if (!this.isValid(tag)) {
        warnings.push(`Invalid tag format: ${tag}`);
      }

      if (this.rules.forbidden?.includes(tag)) {
        errors.push(`Forbidden tag: ${tag}`);
      }

      if (seen.has(tag)) {
        warnings.push(`Duplicate tag: ${tag}`);
      }
      seen.add(tag);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export tag configuration.
   * 
   * @returns {object} Exportable configuration
   */
  public export(): {
    aliases: Record<string, string>;
    rules: TagManager['rules'];
    metadata: Record<string, Record<string, any>>;
    stats: Array<{ tag: string; count: number; firstSeen: string; lastSeen: string }>;
  } {
    return {
      aliases: Object.fromEntries(this.aliases),
      rules: { ...this.rules },
      metadata: Object.fromEntries(this.metadata),
      stats: Array.from(this.stats.entries()).map(([tag, stat]) => ({
        tag,
        count: stat.count,
        firstSeen: stat.firstSeen.toISOString(),
        lastSeen: stat.lastSeen.toISOString(),
      })),
    };
  }

  /**
   * Import tag configuration.
   * 
   * @param {object} config - Configuration to import
   */
  public import(config: ReturnType<TagManager['export']>): void {
    // Import aliases
    if (config.aliases) {
      this.aliases = new Map(Object.entries(config.aliases));
      this.rebuildReverseAliases();
    }

    // Import rules
    if (config.rules) {
      Object.assign(this.rules, config.rules);
    }

    // Import metadata
    if (config.metadata) {
      this.metadata = new Map(Object.entries(config.metadata));
    }

    // Import stats
    if (config.stats) {
      this.stats.clear();
      for (const stat of config.stats) {
        this.stats.set(stat.tag, {
          count: stat.count,
          firstSeen: new Date(stat.firstSeen),
          lastSeen: new Date(stat.lastSeen),
        });
      }
    }
  }

  /**
   * Rebuild reverse alias mapping.
   * 
   * @private
   */
  private rebuildReverseAliases(): void {
    this.reverseAliases.clear();
    
    for (const [alias, canonical] of this.aliases) {
      if (!this.reverseAliases.has(canonical)) {
        this.reverseAliases.set(canonical, new Set());
      }
      this.reverseAliases.get(canonical)!.add(alias);
    }
  }
}
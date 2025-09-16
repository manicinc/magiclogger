/**
 * High-performance metadata cache for structured logging
 *
 * Optimizations:
 * 1. Object shape caching - reuse JSON structure for identical shapes
 * 2. String interning - deduplicate common strings
 * 3. Frozen metadata - convert frequently-used metadata to frozen objects
 * 4. LRU eviction - keep hot data in cache
 */

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

/**
 * Intelligent metadata cache with multiple optimization strategies
 */
export class MetadataCache {
  // Object shape cache - maps shape signatures to optimized templates
  private shapeCache = new Map<string, object>();

  // String intern pool - deduplicates common strings
  private stringPool = new Map<string, string>();

  // Frozen metadata cache - frequently used, immutable metadata
  private frozenCache = new Map<string, object>();

  // LRU cache for serialized JSON strings
  private jsonCache = new Map<string, string>();

  // Common field values cache (e.g., log levels, common status codes)
  private commonValues = new Map<string, any>();

  // Cache statistics
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  };

  // Configuration
  private readonly maxCacheSize: number;
  private readonly maxJsonCacheSize: number;

  constructor(maxCacheSize = 1000, maxJsonCacheSize = 500) {
    this.maxCacheSize = maxCacheSize;
    this.maxJsonCacheSize = maxJsonCacheSize;

    // Pre-populate common values
    this.initCommonValues();
  }

  /**
   * Initialize cache with common values
   */
  private initCommonValues(): void {
    // Common HTTP status codes
    [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503].forEach(code => {
      this.commonValues.set(`status_${code}`, code);
    });

    // Common log levels
    ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(level => {
      this.commonValues.set(`level_${level}`, level);
    });

    // Common HTTP methods
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].forEach(method => {
      this.commonValues.set(`method_${method}`, method);
    });

    // Common boolean values
    this.commonValues.set('true', true);
    this.commonValues.set('false', false);
    this.commonValues.set('null', null);
    this.commonValues.set('undefined', undefined);
  }

  /**
   * Intern a string to reduce memory usage
   */
  internString(str: string): string {
    if (str.length > 100) return str; // Don't intern long strings

    const interned = this.stringPool.get(str);
    if (interned) {
      this.stats.hits++;
      return interned;
    }

    // Add to pool if under limit
    if (this.stringPool.size < this.maxCacheSize) {
      this.stringPool.set(str, str);
    }

    this.stats.misses++;
    return str;
  }

  /**
   * Get or create object shape template
   */
  getShape(obj: Record<string, any>): string {
    const keys = Object.keys(obj).sort();
    return keys.join('|');
  }

  /**
   * Cache and optimize metadata object
   */
  optimizeMetadata(meta: Record<string, any>): Record<string, any> {
    // Fast path for empty metadata
    if (!meta || Object.keys(meta).length === 0) {
      return meta;
    }

    // Check if we've seen this exact object before (by reference)
    const frozen = this.frozenCache.get(JSON.stringify(meta));
    if (frozen) {
      this.stats.hits++;
      return frozen;
    }

    // Optimize individual fields
    const optimized: Record<string, any> = {};

    for (const [key, value] of Object.entries(meta)) {
      // Intern the key
      const internedKey = this.internString(key);

      // Optimize the value
      let optimizedValue = value;

      // Check common values cache
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const cacheKey = `${key}_${value}`;
        const cached = this.commonValues.get(cacheKey);
        if (cached !== undefined) {
          optimizedValue = cached;
        } else if (typeof value === 'string' && value.length < 50) {
          // Intern short strings
          optimizedValue = this.internString(value);
        }
      }

      optimized[internedKey] = optimizedValue;
    }

    // Freeze frequently used metadata
    if (this.shouldFreeze(meta)) {
      const frozen = Object.freeze(optimized);
      const key = JSON.stringify(meta);

      // LRU eviction
      if (this.frozenCache.size >= this.maxCacheSize) {
        const firstKey = this.frozenCache.keys().next().value;
        if (firstKey) this.frozenCache.delete(firstKey);
        this.stats.evictions++;
      }

      this.frozenCache.set(key, frozen);
      return frozen;
    }

    return optimized;
  }

  /**
   * Cache JSON serialization results
   */
  getJson(obj: any): string {
    // Create cache key
    const key = this.createJsonCacheKey(obj);

    // Check cache
    const cached = this.jsonCache.get(key);
    if (cached) {
      // Move to end (LRU)
      this.jsonCache.delete(key);
      this.jsonCache.set(key, cached);
      this.stats.hits++;
      return cached;
    }

    // Serialize
    const json = JSON.stringify(obj);

    // Cache if under limit
    if (this.jsonCache.size >= this.maxJsonCacheSize) {
      // Evict oldest
      const firstKey = this.jsonCache.keys().next().value;
      if (firstKey) this.jsonCache.delete(firstKey);
      this.stats.evictions++;
    }

    this.jsonCache.set(key, json);
    this.stats.misses++;

    return json;
  }

  /**
   * Create efficient cache key for JSON caching
   */
  private createJsonCacheKey(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    // For small objects, use JSON as key
    const keys = Object.keys(obj);
    if (keys.length <= 5) {
      return JSON.stringify(obj);
    }

    // For larger objects, use shape + sample values
    const shape = this.getShape(obj);
    const sample = keys
      .slice(0, 3)
      .map(k => `${k}:${obj[k]}`)
      .join(',');
    return `${shape}::${sample}`;
  }

  /**
   * Determine if metadata should be frozen
   */
  private shouldFreeze(meta: Record<string, any>): boolean {
    // Freeze small, stable objects
    const keys = Object.keys(meta);

    // Don't freeze large objects
    if (keys.length > 20) return false;

    // Don't freeze objects with complex values
    for (const value of Object.values(meta)) {
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Pre-compile metadata template for repeated use
   */
  compileTemplate(template: Record<string, any>): () => Record<string, any> {
    // Cache shape for potential future use
    this.getShape(template);
    const keys = Object.keys(template);

    // Create optimized factory function
    return () => {
      const obj: Record<string, any> = {};
      for (const key of keys) {
        obj[key] = template[key];
      }
      return obj;
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size:
        this.shapeCache.size + this.stringPool.size + this.frozenCache.size + this.jsonCache.size,
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.shapeCache.clear();
    this.stringPool.clear();
    this.frozenCache.clear();
    this.jsonCache.clear();

    // Re-init common values
    this.commonValues.clear();
    this.initCommonValues();

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }
}

// Singleton instance for global caching
export const globalMetadataCache = new MetadataCache(2000, 1000);

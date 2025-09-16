/**
 * Transport wrapper that caches JSON serialization
 *
 * This wrapper can be applied to any transport to add JSON caching
 * for improved performance with structured logging.
 */

import type { Transport, LogEntry } from '../../types/transport';
import { globalMetadataCache } from '../../utils/MetadataCache';

/**
 * Wraps a transport with JSON serialization caching
 */
export class CachedJsonTransport implements Transport {
  name = 'cached-json';
  enabled = true;
  private readonly transport: Transport;
  private readonly useCache: boolean;

  constructor(transport: Transport, useCache = true) {
    this.transport = transport;
    this.useCache = useCache;
  }

  shouldLog(entry: LogEntry): boolean {
    return this.enabled && this.transport.shouldLog(entry);
  }

  async init(): Promise<void> {
    if (this.transport.init) {
      return this.transport.init();
    }
  }

  log(entry: LogEntry): void {
    // If transport expects JSON, cache the serialization
    if (this.useCache && this.needsJson()) {
      const cached = this.getCachedEntry(entry);
      this.transport.log(cached);
    } else {
      this.transport.log(entry);
    }
  }

  async flush(): Promise<void> {
    if (this.transport.flush) {
      return this.transport.flush();
    }
  }

  async close(): Promise<void> {
    if (this.transport.close) {
      return this.transport.close();
    }
  }

  /**
   * Check if transport needs JSON
   */
  private needsJson(): boolean {
    // Check transport type or name
    const transportName = this.transport.constructor.name.toLowerCase();
    return (
      transportName.includes('file') ||
      transportName.includes('http') ||
      transportName.includes('json')
    );
  }

  /**
   * Get cached entry with optimized JSON
   */
  private getCachedEntry(entry: LogEntry): any {
    // For file transports, pre-serialize to JSON string
    if (this.transport.constructor.name.includes('File')) {
      // Return cached JSON string directly
      return globalMetadataCache.getJson(entry);
    }

    // For other transports, return optimized object
    return entry;
  }
}

/**
 * @fileoverview Object pooling to reduce GC pressure
 *
 * Reuses log entry objects to minimize allocations and reduce
 * garbage collection overhead in high-throughput scenarios.
 */

import type { LogEntry } from '../types/transport';

/**
 * Object pool for reusable log entries
 */
export class LogEntryPool {
  private readonly pool: LogEntry[] = [];
  private readonly maxSize: number;
  private created = 0;
  private borrowed = 0;
  private returned = 0;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // Pre-allocate some entries
    for (let i = 0; i < Math.min(10, maxSize); i++) {
      this.pool.push(this.createEntry());
    }
  }

  /**
   * Borrow an entry from the pool
   */
  acquire(): LogEntry {
    this.borrowed++;

    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    // Create new entry if pool is empty
    return this.createEntry();
  }

  /**
   * Return an entry to the pool
   */
  release(entry: LogEntry): void {
    this.returned++;

    if (this.pool.length >= this.maxSize) {
      // Pool is full, let GC handle it
      return;
    }

    // Reset entry for reuse
    this.resetEntry(entry);
    this.pool.push(entry);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      created: this.created,
      borrowed: this.borrowed,
      returned: this.returned,
      hitRate: this.borrowed > 0 ? (this.borrowed - this.created) / this.borrowed : 0,
    };
  }

  private createEntry(): LogEntry {
    this.created++;
    return {
      id: '',
      timestamp: '',
      timestampMs: 0,
      level: 'info',
      message: '',
      styles: undefined,
      loggerId: undefined,
      tags: undefined,
      context: undefined,
      error: undefined,
      metadata: undefined,
    };
  }

  private resetEntry(entry: LogEntry): void {
    entry.id = '';
    entry.timestamp = '';
    entry.timestampMs = 0;
    entry.level = 'info';
    entry.message = '';
    entry.styles = undefined;
    entry.loggerId = undefined;
    entry.tags = undefined;
    entry.context = undefined;
    entry.error = undefined;
    entry.metadata = undefined;
  }
}

/**
 * Global pool instance (singleton)
 */
let globalPool: LogEntryPool | null = null;

/**
 * Get or create the global log entry pool
 */
export function getGlobalPool(): LogEntryPool {
  if (!globalPool) {
    globalPool = new LogEntryPool();
  }
  return globalPool;
}

/**
 * Reset the global pool (useful for testing)
 */
export function resetGlobalPool(): void {
  globalPool = null;
}

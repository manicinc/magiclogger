// File: src/transports/null.ts

/**
 * Null (no-op) transport that discards all logs.
 * Useful for benchmarks and tests where I/O should be suppressed.
 */
import { Transport } from './base/Transport';
import type { LogEntry, TransportOptions } from '../types/transport';

export class NullTransport extends Transport {
  constructor(options: Partial<TransportOptions> = {}) {
    super({
      name: options.name ?? 'null',
      level: options.level ?? 'debug',
      silent: options.silent ?? true,
      format: options.format ?? 'json',
      ...options,
    });
    this.enabled = options.enabled ?? true;
  }

  /**
   * Override log to bypass unnecessary checks for performance.
   * Returns pre-resolved promise for minimum overhead.
   */
  public async log(_entry: LogEntry): Promise<void> {
    // Fast path - immediate return, no checks for maximum performance
    // The async keyword makes this return a resolved promise instantly
  }

  /**
   * Override logBatch for performance.
   */
  public async logBatch(_entries: LogEntry[]): Promise<void> {
    // Fast path for batch - immediate return
  }

  protected async doInit(): Promise<void> {
    /* no-op */
  }
  protected async doLog(_entry: LogEntry): Promise<void> {
    /* no-op */
  }
  protected async doClose(): Promise<void> {
    /* no-op */
  }
  public supportsBatching(): boolean {
    return false;
  }
}

// Do not default-export to avoid mixed CJS named+default export warnings

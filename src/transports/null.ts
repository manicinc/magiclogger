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

export default NullTransport;

/**
 * @fileoverview Ultra-fast async file transport optimized for maximum throughput.
 *
 * This transport sacrifices features for pure speed, matching Pino's performance.
 * Uses sonic-boom with minimal overhead and optimized JSON serialization.
 *
 * @module transports/UltraFastAsyncTransport
 */

import { Transport } from './base/Transport';
import type { LogEntry } from '../types/transport';
import SonicBoom from 'sonic-boom';
import * as path from 'path';
import * as fs from 'fs';

export interface UltraFastOptions {
  filepath: string;
  minLength?: number;
  maxWrite?: number;
}

/**
 * Ultra-fast async file transport for maximum performance.
 *
 * Designed to match Pino's performance by:
 * - Minimal object creation
 * - Direct JSON string building (no JSON.stringify)
 * - Bypassing validation and formatting
 * - No promise overhead
 *
 * @class UltraFastAsyncTransport
 * @extends {Transport}
 */
export class UltraFastAsyncTransport extends Transport {
  private sonic: any;
  private readonly ultraFastOptions: UltraFastOptions;

  constructor(options: UltraFastOptions) {
    super({
      name: 'ultra-fast',
      enabled: true,
    });

    this.ultraFastOptions = {
      minLength: 4096,
      maxWrite: 16384,
      ...options,
    };
  }

  protected async doInit(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.ultraFastOptions.filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create sonic-boom with optimal settings
    this.sonic = new (SonicBoom as any)({
      dest: this.ultraFastOptions.filepath,
      minLength: this.ultraFastOptions.minLength,
      maxWrite: this.ultraFastOptions.maxWrite,
      sync: false,
      append: true,
      mkdir: true,
    });

    // Wait for ready
    await new Promise<void>(resolve => {
      if (this.sonic.ready) {
        resolve();
      } else {
        this.sonic.once('ready', resolve);
      }
    });
  }

  /**
   * Ultra-fast synchronous log method.
   * Bypasses all overhead for maximum performance.
   */
  public logSync(entry: any): void {
    if (!this.sonic) return;

    // Ultra-fast JSON building - avoid JSON.stringify
    // Build minimal JSON string directly
    let json: string;

    if (entry.__ultra_fast) {
      // Pre-formatted from Logger in ultra-fast mode
      json = entry.__json;
    } else {
      // Fast path for common case
      const msg = entry.msg || entry.message || '';
      const level = entry.level || 'info';
      const time = entry.time || entry.timestampMs || Date.now();

      // Direct string concatenation is faster than JSON.stringify for simple objects
      json = `{"level":"${level}","time":${time},"msg":"${msg.replace(/"/g, '\\"')}"}`;
    }

    this.sonic.write(json + '\n');
    this.stats.processed++;
    this.stats.succeeded++;
  }

  public async log(entry: LogEntry): Promise<void> {
    this.logSync(entry);
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    this.logSync(entry);
  }

  public async flush(): Promise<void> {
    if (!this.sonic) return;

    return new Promise(resolve => {
      this.sonic.flush(() => resolve());
    });
  }

  protected async doClose(): Promise<void> {
    if (this.sonic) {
      await this.flush();
      this.sonic.destroy();
      this.sonic = null;
    }
  }

  public shouldLog(): boolean {
    return true; // Skip all checks for speed
  }
}

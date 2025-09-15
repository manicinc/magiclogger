/**
 * Ultra-fast file transport optimized for maximum throughput.
 * This transport sacrifices some safety for raw performance.
 *
 * @module transports/UltraFastFileTransport
 */

import SonicBoom from 'sonic-boom';
import type { Transport, LogEntry } from '../types/transport';
import * as path from 'path';
import * as fs from 'fs';

export interface UltraFastFileTransportOptions {
  filepath: string;
  minLength?: number;
  maxWrite?: number;
}

/**
 * Ultra-fast file transport with minimal overhead
 */
export class UltraFastFileTransport implements Transport {
  name = 'ultra-fast-file';
  private sonic: SonicBoom | null = null;
  private buffer: string[] = [];
  private bufferSize = 0;
  private readonly maxBufferSize = 2000;
  private timer: NodeJS.Timeout | null = null;
  private readonly filepath: string;
  private readonly minLength: number;
  private readonly maxWrite: number;

  constructor(options: UltraFastFileTransportOptions) {
    this.filepath = options.filepath;
    this.minLength = options.minLength || 32768; // 32KB
    this.maxWrite = options.maxWrite || 131072; // 128KB

    // Ensure directory exists
    const dir = path.dirname(this.filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async init(): Promise<void> {
    if (this.sonic) return;

    this.sonic = new (SonicBoom as any)({
      dest: this.filepath,
      minLength: this.minLength,
      maxWrite: this.maxWrite,
      sync: false,
    }) as SonicBoom;

    this.sonic.setMaxListeners(50);
  }

  log(entry: LogEntry): void {
    if (!this.sonic) return;

    // Ultra-minimal JSON serialization
    const line = `{"level":"${entry.level}","msg":"${entry.message}","time":${entry.timestamp}}\n`;

    this.buffer.push(line);
    this.bufferSize++;

    // Flush when buffer is full
    if (this.bufferSize >= this.maxBufferSize) {
      this.flushBuffer();
    } else if (!this.timer) {
      // Set timer for delayed flush (1ms)
      this.timer = setTimeout(() => this.flushBuffer(), 1);
    }
  }

  private flushBuffer(): void {
    if (this.bufferSize === 0 || !this.sonic) return;

    // Write entire buffer at once
    const data = this.buffer.join('');
    this.sonic.write(data);

    // Reset buffer
    this.buffer = [];
    this.bufferSize = 0;

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async flush(): Promise<void> {
    this.flushBuffer();
    if (this.sonic) {
      await new Promise<void>((resolve) => {
        this.sonic!.flush(() => resolve());
      });
    }
  }

  async close(): Promise<void> {
    this.flushBuffer();
    if (this.sonic) {
      await new Promise<void>((resolve) => {
        this.sonic!.end(() => resolve());
      });
      this.sonic = null;
    }
  }
}
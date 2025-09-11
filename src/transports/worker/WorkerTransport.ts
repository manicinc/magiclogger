/**
 * @fileoverview High-performance worker thread transport with ring buffer
 *
 * This transport uses a SharedArrayBuffer-based ring buffer for zero-copy
 * message passing between the main thread and worker thread, achieving
 * near-native performance for async logging.
 */

// Import worker_threads module - Worker will be checked at runtime
import * as workerThreads from 'worker_threads';
import { Worker } from 'worker_threads';
import { Transport, LogEntry } from '../../types/transport';
import { join } from 'path';

/**
 * Ring buffer configuration
 */
const RING_BUFFER_SIZE = 65536; // 64KB
const MAX_ENTRY_SIZE = 4096; // 4KB per entry
const HEADER_SIZE = 16; // Metadata per entry

/**
 * Ring buffer states for lock-free synchronization
 */
enum BufferState {
  EMPTY = 0,
  WRITING = 1,
  READY = 2,
  READING = 3,
}

/**
 * High-performance worker thread transport
 */
export class WorkerTransport implements Transport {
  name = 'worker' as const;
  enabled = true;

  private worker: Worker | null = null;
  private ringBuffer: SharedArrayBuffer | null = null;
  private metaBuffer: SharedArrayBuffer | null = null;
  private writeIndex = 0;
  private initialized = false;
  private closing = false;

  constructor(
    private options: {
      workerPath?: string;
      bufferSize?: number;
      maxRetries?: number;
    } = {}
  ) {}

  async init(): Promise<void> {
    if (this.initialized) return;

    // Check if Worker is available
    if (!Worker) {
      throw new Error('Worker threads not available');
    }

    // Create shared buffers
    const bufferSize = this.options.bufferSize || RING_BUFFER_SIZE;
    this.ringBuffer = new SharedArrayBuffer(bufferSize);
    this.metaBuffer = new SharedArrayBuffer(256); // Metadata buffer

    // Initialize worker
    const workerPath = this.options.workerPath || join(__dirname, 'worker-thread.js');

    this.worker = new Worker(workerPath, {
      workerData: {
        ringBuffer: this.ringBuffer,
        metaBuffer: this.metaBuffer,
        bufferSize,
      },
    });

    // Handle worker errors
    this.worker.on('error', (err: Error) => {
      console.error('[WorkerTransport] Worker error:', err);
    });

    this.worker.on('exit', (code: number) => {
      if (!this.closing && code !== 0) {
        console.error(`[WorkerTransport] Worker exited with code ${code}`);
      }
    });

    this.initialized = true;
  }

  async close(): Promise<void> {
    this.closing = true;

    if (this.worker && this.metaBuffer) {
      // Signal worker to flush and exit
      const meta = new Int32Array(this.metaBuffer);
      Atomics.store(meta, 0, -1); // Shutdown signal
      Atomics.notify(meta, 0, 1);

      // Wait for worker to finish
      await this.worker.terminate();
      this.worker = null;
    }

    this.ringBuffer = null;
    this.metaBuffer = null;
    this.initialized = false;
  }

  shouldLog(): boolean {
    return this.enabled && this.initialized && !this.closing;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog()) return;

    // Serialize entry
    const json = JSON.stringify(entry);
    const bytes = new TextEncoder().encode(json);

    if (bytes.length > MAX_ENTRY_SIZE) {
      console.warn('[WorkerTransport] Entry too large, dropping');
      return;
    }

    // Write to ring buffer
    this.writeToRingBuffer(bytes);
  }

  private writeToRingBuffer(data: Uint8Array): void {
    if (!this.ringBuffer || !this.metaBuffer) return;
    const buffer = new Uint8Array(this.ringBuffer);
    const meta = new Int32Array(this.metaBuffer);
    const bufferSize = this.options.bufferSize || RING_BUFFER_SIZE;

    // Calculate write position
    const dataLen = data.length;
    const totalSize = HEADER_SIZE + dataLen;

    // Check if entry is too large for buffer
    if (totalSize > bufferSize) {
      console.warn('[WorkerTransport] Entry too large for buffer');
      return;
    }

    // Check if we need to wrap
    if (this.writeIndex + totalSize > bufferSize) {
      this.writeIndex = 0;
    }

    // Wait if buffer is full (simplified check)
    const readIndex = Atomics.load(meta, 1);
    if (this.writeIndex < readIndex && this.writeIndex + totalSize > readIndex) {
      // Buffer full, drop message (or wait)
      console.warn('[WorkerTransport] Buffer full, dropping message');
      return;
    }

    // Ensure we don't write beyond buffer bounds
    if (this.writeIndex + totalSize > bufferSize) {
      console.warn('[WorkerTransport] Not enough space in buffer');
      return;
    }

    // Write header
    const header = new DataView(this.ringBuffer, this.writeIndex, HEADER_SIZE);
    header.setUint32(0, dataLen, true);
    header.setUint32(4, BufferState.WRITING, true);

    // Write data
    buffer.set(data, this.writeIndex + HEADER_SIZE);

    // Mark as ready
    header.setUint32(4, BufferState.READY, true);

    // Update write index
    this.writeIndex += totalSize;
    Atomics.store(meta, 0, this.writeIndex);

    // Notify worker
    Atomics.notify(meta, 0, 1);
  }
}

/**
 * Factory function for browser compatibility
 */
export function createWorkerTransport(options?: any): Transport {
  // Check if Worker is available at call time - this handles mocked scenarios
  // Access Worker from workerThreads to allow proper mocking
  const WorkerClass = workerThreads?.Worker;

  if (!WorkerClass || typeof WorkerClass !== 'function') {
    // Return fallback transport if Worker is not available
    return {
      name: 'worker-fallback',
      enabled: false,
      init: async () => {
        /* Fallback: no-op */
      },
      close: async () => {
        /* Fallback: no-op */
      },
      shouldLog: () => false,
      log: async () => {
        /* Fallback: no-op */
      },
    };
  }

  try {
    return new WorkerTransport(options);
  } catch {
    // Return fallback transport if instantiation fails
    return {
      name: 'worker-fallback',
      enabled: false,
      init: async () => {
        /* Fallback: no-op */
      },
      close: async () => {
        /* Fallback: no-op */
      },
      shouldLog: () => false,
      log: async () => {
        /* Fallback: no-op */
      },
    };
  }
}

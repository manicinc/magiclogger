/**
 * Core log processing utilities extracted from the worker so they can be
 * synchronously imported and covered by Jest instrumentation. The worker
 * wrapper (`log-processor.worker.ts`) delegates to these pure / side‑effect
 * free helpers and only handles message passing.
 */
import type { LogEntry } from '../../types/transport';

/**
 * Runtime configuration for the log processor.
 *
 * Attributes:
 *   formatType: Output formatting style (json, text, or custom passthrough).
 *   batchSize: Desired batch size hint for downstream transports.
 *   destination: Processing target controlling side effects (console/file/network).
 *   endpoint: Network endpoint when destination === 'network'.
 */
export interface WorkerConfig {
  formatType?: 'json' | 'text' | 'custom';
  batchSize?: number;
  destination?: 'console' | 'file' | 'network';
  endpoint?: string;
}

/**
 * Structured envelope describing a batch of formatted log entries destined
 * for a network transport.
 *
 * Attributes:
 *   endpoint: Target URL / endpoint.
 *   data: Raw formatted payload (array of objects or pre‑serialized string).
 *   timestamp: ISO timestamp when batch was created.
 *   count: Number of entries represented.
 */
export interface NetworkBatch {
  endpoint: string;
  data: string | object[];
  timestamp: string;
  count: number;
}

/**
 * Rolling metrics maintained while processing log batches.
 *
 * Attributes:
 *   processed: Total number of log entries successfully processed.
 *   errors: Count of processing failures.
 *   avgProcessingTime: Rolling average (ms) per processed batch.
 *   lastBatchSize: Entry count of the most recent batch.
 */
export interface WorkerMetrics {
  processed: number;
  errors: number;
  avgProcessingTime: number;
  lastBatchSize: number;
}

/**
 * In‑memory state bag for the processor.
 *
 * Attributes:
 *   config: Active configuration snapshot.
 *   metrics: Mutable metrics accumulator.
 *   processingTimes: Sliding window of timing samples used for averages.
 */
export interface WorkerState {
  config: WorkerConfig;
  metrics: WorkerMetrics;
  processingTimes: number[];
}

/** Maximum number of recent timing samples to retain for averaging. */
export const MAX_TIMING_SAMPLES = 100;

/**
 * Create an initialized worker state object with default values.
 *
 * Returns:
 *   WorkerState: Fresh state instance.
 */
export function createInitialState(): WorkerState {
  return {
    config: { formatType: 'json', batchSize: 100, destination: 'console' },
    metrics: { processed: 0, errors: 0, avgProcessingTime: 0, lastBatchSize: 0 },
    processingTimes: [],
  };
}

type ExtendedLogEntry = LogEntry & { context?: string; tags?: string[] };

/**
 * Format raw log entries according to the provided configuration.
 *
 * Args:
 *   entries: Array of raw LogEntry objects.
 *   config: Worker configuration controlling output format.
 *
 * Returns:
 *   Either an array of plain objects (json/custom) or a newline‑delimited string (text).
 */
export function formatEntries(entries: LogEntry[], config: WorkerConfig): string | object[] {
  switch (config.formatType) {
    case 'json':
      return entries.map(entry => ({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        ...entry.metadata,
      }));
    case 'text':
      return (entries as ExtendedLogEntry[])
        .map(entry => {
          const timestamp = entry.timestamp;
          const level = entry.level.toUpperCase().padEnd(7);
          const context = entry.context ? `[${entry.context}] ` : '';
          const tags = entry.tags?.length ? `{${entry.tags.join(', ')}} ` : '';
          return `${timestamp} ${level} ${context}${tags}${entry.message}`;
        })
        .join('\n');
    case 'custom':
      return entries;
    default:
      return entries;
  }
}

/**
 * Ensure formatted data is represented as a string for file persistence.
 *
 * Args:
 *   data: Formatted data (string or object array).
 *
 * Returns:
 *   String representation safe to write to a file.
 */
export function prepareFileData(data: string | object[]): string {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

/**
 * Build a NetworkBatch descriptor object.
 *
 * Args:
 *   data: Formatted payload (string or object array).
 *   endpoint: Destination endpoint URL.
 *
 * Returns:
 *   NetworkBatch: Envelope containing metadata and payload.
 */
export function batchForNetwork(data: string | object[], endpoint: string): NetworkBatch {
  return { endpoint, data, timestamp: new Date().toISOString(), count: Array.isArray(data) ? data.length : 1 };
}

/**
 * Merge a partial configuration update producing a new immutable config.
 *
 * Args:
 *   current: Existing configuration.
 *   patch: Partial overrides.
 *
 * Returns:
 *   WorkerConfig: New merged configuration object.
 */
export function updateConfig(current: WorkerConfig, patch: WorkerConfig): WorkerConfig {
  return { ...current, ...patch };
}

/**
 * Update rolling metrics after processing a batch.
 *
 * Args:
 *   state: Mutable worker state.
 *   count: Number of entries processed in the batch.
 *   time: Elapsed processing time for the batch (ms).
 */
export function updateMetrics(state: WorkerState, count: number, time: number): void {
  state.metrics.processed += count;
  state.metrics.lastBatchSize = count;
  state.processingTimes.push(time);
  if (state.processingTimes.length > MAX_TIMING_SAMPLES) state.processingTimes.shift();
  state.metrics.avgProcessingTime = state.processingTimes.reduce((a, b) => a + b, 0) / state.processingTimes.length;
}

/**
 * Execute end‑to‑end processing for a batch of log entries.
 * Handles formatting, optional file/network preparation, and metric updates.
 *
 * Args:
 *   state: Mutable worker state.
 *   entries: Log entries to process.
 *
 * Returns:
 *   Object containing:
 *     formatted: Formatted representation.
 *     fileData: (optional) String prepared for file output when destination === 'file'.
 *     batch: (optional) NetworkBatch when destination === 'network'.
 *     metrics: Snapshot of updated metrics.
 */
export function processLogs(state: WorkerState, entries: LogEntry[]) {
  const start = (globalThis.performance?.now?.() ?? Date.now());
  try {
    const formatted = formatEntries(entries, state.config);
    let fileData: string | undefined;
    let batch: NetworkBatch | undefined;
    if (state.config.destination === 'file') {
      fileData = prepareFileData(formatted);
    } else if (state.config.destination === 'network' && state.config.endpoint) {
      batch = batchForNetwork(formatted, state.config.endpoint);
    }
    const elapsed = (globalThis.performance?.now?.() ?? Date.now()) - start;
    updateMetrics(state, entries.length, elapsed);
    return { formatted, fileData, batch, metrics: { ...state.metrics } };
  } catch {
    state.metrics.errors += 1;
    return { formatted: [], metrics: { ...state.metrics } };
  }
}

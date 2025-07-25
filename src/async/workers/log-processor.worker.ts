// File: src/workers/log-processor.worker.ts

import type { LogEntry } from '../../types/transport';

/**
 * Web Worker for processing log entries in the background.
 *
 * This worker handles:
 * - Log formatting and serialization
 * - Batching for network transports
 * - File writing preparation
 * - Metric collection
 *
 * The worker runs in a separate thread, ensuring the main thread
 * remains responsive even during heavy logging.
 */

interface WorkerMessage {
  type: 'logs' | 'config' | 'shutdown';
  entries?: LogEntry[];
  config?: WorkerConfig;
}

interface WorkerConfig {
  formatType?: 'json' | 'text' | 'custom';
  batchSize?: number;
  destination?: 'console' | 'file' | 'network';
  endpoint?: string;
}

interface WorkerResponse {
  type: 'processed' | 'error' | 'metrics' | 'ready' | 'file-ready' | 'network-ready' | 'config-updated';
  count?: number;
  error?: string;
  metrics?: WorkerMetrics;
  data?: string;
  batch?: NetworkBatch;
  config?: WorkerConfig;
}

interface NetworkBatch {
  endpoint: string;
  data: string | object[];
  timestamp: string;
  count: number;
}

interface WorkerMetrics {
  processed: number;
  errors: number;
  avgProcessingTime: number;
  lastBatchSize: number;
}

// Worker state
let config: WorkerConfig = {
  formatType: 'json',
  batchSize: 100,
  destination: 'console',
};

const metrics: WorkerMetrics = {
  processed: 0,
  errors: 0,
  avgProcessingTime: 0,
  lastBatchSize: 0,
};

const processingTimes: number[] = [];
const MAX_TIMING_SAMPLES = 100;

/**
 * Initialize the worker and send ready signal.
 */
self.postMessage({ type: 'ready' } as WorkerResponse);

/**
 * Handle incoming messages from the main thread.
 */
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, entries, config: newConfig } = event.data;

  switch (type) {
    case 'logs':
      if (entries) {
        processLogs(entries);
      }
      break;

    case 'config':
      if (newConfig) {
        updateConfig(newConfig);
      }
      break;

    case 'shutdown':
      // Clean up and close
      self.close();
      break;

    default:
      sendError(`Unknown message type: ${type}`);
  }
});

/**
 * Process a batch of log entries.
 *
 * @param {LogEntry[]} entries - Log entries to process
 */
function processLogs(entries: LogEntry[]): void {
  const startTime = performance.now();

  try {
    // Format entries based on configuration
    const formatted = formatEntries(entries);

    // Process based on destination
    switch (config.destination) {
      case 'console':
        // In a real implementation, we'd send this back to main thread
        // since workers can't access console directly
        break;

      case 'file':
        // Prepare for file writing (main thread will handle actual I/O)
        prepareFileData(formatted);
        break;

      case 'network':
        // Batch for network transport
        if (config.endpoint) {
          batchForNetwork(formatted, config.endpoint);
        }
        break;
    }

    // Update metrics
    const processingTime = performance.now() - startTime;
    updateMetrics(entries.length, processingTime);

    // Send success response
    self.postMessage({
      type: 'processed',
      count: entries.length,
      metrics: { ...metrics },
    } as WorkerResponse);
  } catch (error) {
    metrics.errors++;
    sendError(`Processing error: ${error}`);
  }
}

/**
 * Format log entries based on configuration.
 *
 * @param {LogEntry[]} entries - Entries to format
 * @returns {string | object[]} Formatted entries
 */
function formatEntries(entries: LogEntry[]): string | object[] {
  switch (config.formatType) {
    case 'json':
      return entries.map(entry => ({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        ...entry.metadata,
      }));

    case 'text':
      return entries
        .map(entry => {
          const timestamp = entry.timestamp;
          const level = entry.level.toUpperCase().padEnd(7);
          const context = entry.context ? `[${entry.context}] ` : '';
          const tags = entry.tags?.length ? `{${entry.tags.join(', ')}} ` : '';
          return `${timestamp} ${level} ${context}${tags}${entry.message}`;
        })
        .join('\n');

    case 'custom':
      // Custom formatting logic here
      return entries;

    default:
      return entries;
  }
}

/**
 * Prepare data for file writing.
 *
 * @param {string | object[]} data - Formatted data
 */
function prepareFileData(data: string | object[]): void {
  // Convert to string if needed
  const fileData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  // Send prepared data back to main thread
  self.postMessage({
    type: 'file-ready',
    data: fileData,
  } as WorkerResponse);
}

/**
 * Batch data for network transport.
 *
 * @param {string | object[]} data - Formatted data
 * @param {string} endpoint - Network endpoint
 */
function batchForNetwork(data: string | object[], endpoint: string): void {
  // In a real implementation, this would batch entries
  // and prepare them for network transmission
  const batch = {
    endpoint,
    data,
    timestamp: new Date().toISOString(),
    count: Array.isArray(data) ? data.length : 1,
  };

  self.postMessage({
    type: 'network-ready',
    batch,
  } as WorkerResponse);
}

/**
 * Update worker configuration.
 *
 * @param {WorkerConfig} newConfig - New configuration
 */
function updateConfig(newConfig: WorkerConfig): void {
  config = { ...config, ...newConfig };

  self.postMessage({
    type: 'config-updated',
    config: { ...config },
  } as WorkerResponse);
}

/**
 * Update performance metrics.
 *
 * @param {number} count - Number of entries processed
 * @param {number} time - Processing time in milliseconds
 */
function updateMetrics(count: number, time: number): void {
  metrics.processed += count;
  metrics.lastBatchSize = count;

  // Update average processing time
  processingTimes.push(time);
  if (processingTimes.length > MAX_TIMING_SAMPLES) {
    processingTimes.shift();
  }

  metrics.avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
}

/**
 * Send error message to main thread.
 *
 * @param {string} message - Error message
 */
function sendError(message: string): void {
  self.postMessage({
    type: 'error',
    error: message,
  } as WorkerResponse);
}

/**
 * Handle uncaught errors in the worker.
 */
self.addEventListener('error', (event: ErrorEvent) => {
  sendError(`Worker error: ${event.message}`);
});

/**
 * Handle unhandled promise rejections.
 */
self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  sendError(`Unhandled rejection: ${event.reason}`);
});

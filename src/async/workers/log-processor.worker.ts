// Wrapper worker: delegates heavy logic to logProcessorCore so core can be unit tested directly.
import type { LogEntry } from '../../types/transport';
import { createInitialState, processLogs as coreProcessLogs, updateConfig as coreUpdateConfig, type WorkerConfig } from './log-processor-core';

interface SelfLike {
  postMessage?: (data: unknown) => void;
  addEventListener?: (type: string, listener: (...args: any[]) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  close?: () => void;
}

// Narrowed accessor so we cast once here only
const safeSelf: SelfLike = (typeof self !== 'undefined' ? (self as unknown as SelfLike) : {});

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

// WorkerConfig imported from core

interface WorkerResponse {
  type: 'processed' | 'error' | 'metrics' | 'ready' | 'file-ready' | 'network-ready' | 'config-updated';
  count?: number;
  error?: string;
  metrics?: WorkerMetrics;
  data?: string;
  batch?: NetworkBatch;
  config?: WorkerConfig;
}

interface NetworkBatch { endpoint: string; data: string | object[]; timestamp: string; count: number }

interface WorkerMetrics { processed: number; errors: number; avgProcessingTime: number; lastBatchSize: number }

// Core state encapsulated in core module
const state = createInitialState();

/**
 * Initialize the worker and send ready signal.
 */
safeSelf.postMessage?.({ type: 'ready' } as WorkerResponse);

/**
 * Handle incoming messages from the main thread.
 */
safeSelf.addEventListener?.('message', (event: MessageEvent<WorkerMessage>) => {
  handleWorkerMessage(event.data);
});

/**
 * Process a batch of log entries.
 *
 * @param {LogEntry[]} entries - Log entries to process
 */
function handleProcess(entries: LogEntry[]): void {
  const { fileData, batch, metrics } = coreProcessLogs(state, entries);
  if (fileData) safeSelf.postMessage?.({ type: 'file-ready', data: fileData } as WorkerResponse);
  if (batch) safeSelf.postMessage?.({ type: 'network-ready', batch } as WorkerResponse);
  safeSelf.postMessage?.({ type: 'processed', count: entries.length, metrics } as WorkerResponse);
}

/**
 * Format log entries based on configuration.
 *
 * @param {LogEntry[]} entries - Entries to format
 * @returns {string | object[]} Formatted entries
 */
// formatting handled in core

/**
 * Prepare data for file writing.
 *
 * @param {string | object[]} data - Formatted data
 */
// file prep handled in core

/**
 * Batch data for network transport.
 *
 * @param {string | object[]} data - Formatted data
 * @param {string} endpoint - Network endpoint
 */
// network batching handled in core

/**
 * Update worker configuration.
 *
 * @param {WorkerConfig} newConfig - New configuration
 */
function updateConfig(newConfig: WorkerConfig): void {
  state.config = coreUpdateConfig(state.config, newConfig);
  safeSelf.postMessage?.({ type: 'config-updated', config: { ...state.config } } as WorkerResponse);
}

/**
 * Update performance metrics.
 *
 * @param {number} count - Number of entries processed
 * @param {number} time - Processing time in milliseconds
 */
// metrics handled in core

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
safeSelf.addEventListener?.('error', (event: ErrorEvent) => {
  sendError(`Worker error: ${event.message}`);
});

/**
 * Handle unhandled promise rejections.
 */
safeSelf.addEventListener?.('unhandledrejection', (event: PromiseRejectionEvent) => {
  sendError(`Unhandled rejection: ${event.reason}`);
});

export function handleWorkerMessage(msg: { type: string; entries?: LogEntry[]; config?: WorkerConfig }) {
  const { type, entries, config } = msg;
  switch (type) {
    case 'logs':
      if (entries) handleProcess(entries);
      break;
    case 'config':
      if (config) updateConfig(config);
      break;
    case 'shutdown':
      break;
    default:
      sendError(`Unknown message type: ${type}`);
  }
}

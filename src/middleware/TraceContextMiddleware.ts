// File: src/middleware/TraceContextMiddleware.ts

/**
 * @fileoverview Middleware for automatic W3C trace context extraction and propagation.
 * Automatically extracts trace context from various sources (HTTP headers, AsyncLocalStorage, etc.)
 * and injects it into log entries for distributed tracing correlation.
 * 
 * @module middleware/TraceContextMiddleware
 */

import { Middleware } from './Middleware';
import type { LogEntry } from '../types';
import type { MiddlewareContext, MiddlewareResult } from './Middleware';
import { 
  extractTraceContext, 
  generateTraceId, 
  generateSpanId,
} from '../utils/trace-context';
import type { W3CTraceContext } from '../utils/trace-context';

export type { W3CTraceContext };

// Minimal AsyncLocalStorage-like interface to avoid depending on Node types
type AsyncLocalStorageLike<T> = {
  getStore(): T | undefined;
};

type HeaderStoreExpress = { req?: { headers?: Record<string, string | string[] | undefined> } };
type HeaderStoreKoa = { ctx?: { headers?: Record<string, string | string[] | undefined> } };
type HeaderStoreFastify = { request?: { headers?: Record<string, string | string[] | undefined> } };
type TraceContextStore = W3CTraceContext | HeaderStoreExpress | HeaderStoreKoa | HeaderStoreFastify;

function isW3CTraceContext(value: unknown): value is W3CTraceContext {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('traceId' in (value as Record<string, unknown>) || 'spanId' in (value as Record<string, unknown>))
  );
}

/**
 * Options for configuring trace context middleware.
 * 
 * @interface TraceContextMiddlewareOptions
 */
export interface TraceContextMiddlewareOptions {
  /**
   * Whether to automatically extract trace context.
   * @default true
   */
  autoExtract?: boolean;

  /**
   * Custom function to extract trace context.
   * If provided, this overrides the default extraction logic.
   * 
   * @param entry - The log entry being processed
   * @returns The extracted trace context or undefined
   */
  extractContext?: (entry: LogEntry) => W3CTraceContext | undefined;

  /**
   * Function to get HTTP headers for trace extraction.
   * Used when autoExtract is true and no custom extractContext is provided.
   * 
   * @returns HTTP headers object or undefined
   */
  getHeaders?: () => Record<string, string | string[] | undefined> | undefined;

  /**
   * Whether to generate trace IDs for entries without trace context.
   * Useful for creating root spans.
   * @default false
   */
  generateIfMissing?: boolean;

  /**
   * Field name to store trace context in log entry.
   * @default 'trace'
   */
  traceField?: string;

  /**
   * Whether to include trace context in metadata.
   * @default true
   */
  includeInMetadata?: boolean;

  /**
   * AsyncLocalStorage instance for Node.js async context propagation.
   * If provided, trace context will be automatically retrieved from it.
   */
  asyncLocalStorage?: AsyncLocalStorageLike<TraceContextStore>; // AsyncLocalStorage-like
}

/**
 * Middleware that automatically extracts and injects W3C trace context into log entries.
 * 
 * This middleware enables automatic distributed tracing correlation by:
 * 1. Extracting trace context from HTTP headers (for incoming requests)
 * 2. Reading from AsyncLocalStorage (for async context propagation)
 * 3. Using custom extraction logic (if provided)
 * 4. Generating new trace IDs (for root spans if configured)
 * 
 * @class TraceContextMiddleware
 * @extends {Middleware}
 * 
 * @example
 * ```typescript
 * // Automatic extraction from Express
 * import express from 'express';
 * import { Logger } from 'magiclogger';
 * import { TraceContextMiddleware } from 'magiclogger/middleware';
 * 
 * const app = express();
 * 
 * // Create middleware that extracts from current request
 * const traceMiddleware = new TraceContextMiddleware({
 *   getHeaders: () => {
 *     // Get headers from current Express request context
 *     const req = asyncLocalStorage.getStore()?.req;
 *     return req?.headers;
 *   }
 * });
 * 
 * const logger = new Logger({
 *   middleware: [traceMiddleware]
 * });
 * 
 * // Now all logs automatically include trace context
 * logger.info('Request processed'); // Trace context auto-injected
 * ```
 * 
 * @example
 * ```typescript
 * // With AsyncLocalStorage for context propagation
 * import { AsyncLocalStorage } from 'async_hooks';
 * 
 * const traceStorage = new AsyncLocalStorage<W3CTraceContext>();
 * 
 * const traceMiddleware = new TraceContextMiddleware({
 *   asyncLocalStorage: traceStorage,
 *   generateIfMissing: true // Generate root spans
 * });
 * 
 * // Run with trace context
 * traceStorage.run(traceContext, () => {
 *   logger.info('Operation started'); // Auto-includes trace
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Custom extraction logic
 * const traceMiddleware = new TraceContextMiddleware({
 *   extractContext: (entry) => {
 *     // Custom logic to extract from entry or ambient context
 *     if (entry.metadata?.requestId) {
 *       return {
 *         traceId: entry.metadata.requestId,
 *         spanId: generateSpanId(),
 *         sampled: true
 *       };
 *     }
 *     return undefined;
 *   }
 * });
 * ```
 */
export class TraceContextMiddleware extends Middleware {
  name = 'TraceContext';
  private options: Required<TraceContextMiddlewareOptions>;
  
  /**
   * Creates a new trace context middleware instance.
   * 
   * @param {TraceContextMiddlewareOptions} options - Configuration options
   */
  constructor(options: TraceContextMiddlewareOptions = {}) {
    super();
    
    this.options = {
      autoExtract: options.autoExtract ?? true,
      extractContext: options.extractContext,
      getHeaders: options.getHeaders,
      generateIfMissing: options.generateIfMissing ?? false,
      traceField: options.traceField ?? 'trace',
      includeInMetadata: options.includeInMetadata ?? true,
      asyncLocalStorage: options.asyncLocalStorage,
    } as Required<TraceContextMiddlewareOptions>;
  }

  /**
   * Process log entry to inject trace context.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @param {MiddlewareContext} _context - Execution context (unused)
   * @returns {MiddlewareResult} The processed entry with trace context
   * @override
   */
  process(entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
    if (!this.options.autoExtract) {
      return { continue: true, entry };
    }

    // Skip if trace context already exists
  const field = this.options.traceField as string;
  const existingTrace = ((entry as unknown) as Record<string, unknown>)[field] || entry.metadata?.trace;
    if (existingTrace) {
      return { continue: true, entry };
    }

    // Extract trace context using configured method
    let traceContext: W3CTraceContext | undefined;

    // 1. Try custom extraction function
    if (this.options.extractContext) {
      traceContext = this.options.extractContext(entry);
    }

    // 2. Try AsyncLocalStorage
    if (!traceContext && this.options.asyncLocalStorage) {
      try {
        const store = this.options.asyncLocalStorage.getStore();
        if (isW3CTraceContext(store)) {
          traceContext = store;
        }
      } catch (error) {
        // AsyncLocalStorage not available or error
      }
    }

    // 3. Try HTTP headers
    if (!traceContext && this.options.getHeaders) {
      const headers = this.options.getHeaders();
      if (headers) {
        traceContext = extractTraceContext(headers);
      }
    }

    // 4. Generate if missing and configured
    if (!traceContext && this.options.generateIfMissing) {
      traceContext = {
        traceId: generateTraceId(),
        spanId: generateSpanId(),
        sampled: true,
      };
    }

    // Inject trace context if found
    if (traceContext) {
      // Add to main entry
      const processedEntry = {
        ...entry,
        [this.options.traceField]: traceContext,
      };

      // Also add to metadata if configured
      if (this.options.includeInMetadata) {
        processedEntry.metadata = {
          ...processedEntry.metadata,
          trace: traceContext,
        };
      }

      return { continue: true, entry: processedEntry };
    }

    return { continue: true, entry };
  }
}

/**
 * Factory function to create trace context middleware for Express.
 * 
 * @param {any} asyncLocalStorage - AsyncLocalStorage instance containing Express request
 * @returns {TraceContextMiddleware} Configured middleware for Express
 * 
 * @example
 * ```typescript
 * import { AsyncLocalStorage } from 'async_hooks';
 * import express from 'express';
 * 
 * const requestStorage = new AsyncLocalStorage<{ req: express.Request }>();
 * 
 * const app = express();
 * 
 * // Store request in AsyncLocalStorage
 * app.use((req, res, next) => {
 *   requestStorage.run({ req }, next);
 * });
 * 
 * // Create logger with automatic trace extraction
 * const logger = new Logger({
 *   middleware: [createExpressTraceMiddleware(requestStorage)]
 * });
 * ```
 */
export function createExpressTraceMiddleware(
  asyncLocalStorage: AsyncLocalStorageLike<HeaderStoreExpress>
): TraceContextMiddleware {
  return new TraceContextMiddleware({
    getHeaders: () => {
  const store = asyncLocalStorage.getStore();
      return store?.req?.headers;
    },
    asyncLocalStorage,
  });
}

/**
 * Factory function to create trace context middleware for Koa.
 * 
 * @param {any} asyncLocalStorage - AsyncLocalStorage instance containing Koa context
 * @returns {TraceContextMiddleware} Configured middleware for Koa
 */
export function createKoaTraceMiddleware(
  asyncLocalStorage: AsyncLocalStorageLike<HeaderStoreKoa>
): TraceContextMiddleware {
  return new TraceContextMiddleware({
    getHeaders: () => {
  const store = asyncLocalStorage.getStore();
      return store?.ctx?.headers;
    },
    asyncLocalStorage,
  });
}

/**
 * Factory function to create trace context middleware for Fastify.
 * 
 * @param {any} asyncLocalStorage - AsyncLocalStorage instance containing Fastify request
 * @returns {TraceContextMiddleware} Configured middleware for Fastify
 */
export function createFastifyTraceMiddleware(
  asyncLocalStorage: AsyncLocalStorageLike<HeaderStoreFastify>
): TraceContextMiddleware {
  return new TraceContextMiddleware({
    getHeaders: () => {
  const store = asyncLocalStorage.getStore();
      return store?.request?.headers;
    },
    asyncLocalStorage,
  });
}
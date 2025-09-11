// File: src/utils/trace-context.ts

/**
 * @fileoverview W3C Trace Context utilities for distributed tracing.
 *
 * This module provides utilities for working with W3C Trace Context headers,
 * enabling distributed tracing correlation across microservices and systems.
 * These utilities are used internally by MagicLogger's transport system but
 * can also be used directly for custom trace context handling.
 *
 * @module utils/trace-context
 * @see {@link https://www.w3.org/TR/trace-context/ W3C Trace Context Specification}
 */

/**
 * W3C Trace Context structure containing all trace correlation data.
 *
 * @interface W3CTraceContext
 * @property {string} traceId - 32 hex character trace identifier
 * @property {string} [spanId] - 16 hex character span identifier
 * @property {string} [parentSpanId] - Parent span ID for nested spans
 * @property {string} [traceFlags] - Trace flags (01 = sampled, 00 = not sampled)
 * @property {string} [traceState] - Vendor-specific trace state
 * @property {boolean} [sampled] - Whether this trace is being sampled
 */
export interface W3CTraceContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
  traceFlags?: string;
  traceState?: string;
  sampled?: boolean;
}

/**
 * Extracts W3C Trace Context from HTTP headers.
 *
 * This function parses the standard W3C traceparent and tracestate headers
 * used by OpenTelemetry, Jaeger, Zipkin, and other distributed tracing systems.
 * It validates the format according to W3C specifications and returns a
 * structured trace context object.
 *
 * **Note:** In most cases, you don't need to call this directly. Use the
 * TraceContextMiddleware for automatic extraction, or configure your transport
 * with autoExtractTrace: true.
 *
 * @param {Record<string, string | string[] | undefined>} headers - HTTP headers object
 * @returns {W3CTraceContext | undefined} Parsed trace context or undefined if not present/invalid
 *
 * @example Basic extraction from Express request
 * ```typescript
 * import { extractTraceContext } from 'magiclogger/utils/trace-context';
 *
 * app.post('/api/endpoint', (req, res) => {
 *   const traceContext = extractTraceContext(req.headers);
 *   if (traceContext) {
 *     logger.info('Request received', { trace: traceContext });
 *   }
 * });
 * ```
 *
 * @example Using with custom headers
 * ```typescript
 * const headers = {
 *   'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
 *   'tracestate': 'vendor=value'
 * };
 * const context = extractTraceContext(headers);
 * // Returns: { traceId: '4bf92...', spanId: '00f06...', sampled: true, ... }
 * ```
 *
 * @see {@link https://www.w3.org/TR/trace-context/#traceparent-header Traceparent Header}
 * @see {@link https://www.w3.org/TR/trace-context/#tracestate-header Tracestate Header}
 */
export function extractTraceContext(
  headers: Record<string, string | string[] | undefined>
): W3CTraceContext | undefined {
  // Get traceparent header (case-insensitive)
  const traceparent = getHeader(headers, 'traceparent');

  if (!traceparent) {
    return undefined;
  }

  // Parse W3C traceparent format: version-trace_id-parent_id-trace_flags
  // Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
  const parts = traceparent.split('-');

  if (parts.length !== 4) {
    return undefined;
  }

  const [version, traceId, spanId, traceFlags] = parts;

  // Validate version (should be '00' for current spec)
  if (version !== '00') {
    return undefined;
  }

  // Validate trace ID (32 hex chars, not all zeros)
  if (!isValidTraceId(traceId)) {
    return undefined;
  }

  // Validate span ID (16 hex chars, not all zeros)
  if (!isValidSpanId(spanId)) {
    return undefined;
  }

  // Parse trace flags (01 = sampled, 00 = not sampled)
  const sampled = (parseInt(traceFlags, 16) & 0x01) === 1;

  // Get optional tracestate header
  const traceState = getHeader(headers, 'tracestate');

  return {
    traceId,
    spanId,
    traceFlags,
    traceState: traceState || undefined,
    sampled,
  };
}

/**
 * Creates a W3C traceparent header string from trace context.
 *
 * Formats trace context into the standard W3C traceparent header format
 * for propagating trace context to downstream services.
 *
 * @param {W3CTraceContext} context - Trace context object
 * @returns {string} Formatted traceparent header value
 *
 * @example Creating header for outgoing HTTP request
 * ```typescript
 * const traceparent = createTraceparent({
 *   traceId: '0af7651916cd43dd8448eb211c80319c',
 *   spanId: 'b7ad6b7169203331',
 *   sampled: true
 * });
 * // Returns: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"
 *
 * // Use in outgoing request
 * fetch(url, {
 *   headers: {
 *     'traceparent': traceparent
 *   }
 * });
 * ```
 *
 * @example Auto-generating span ID if missing
 * ```typescript
 * const traceparent = createTraceparent({
 *   traceId: '0af7651916cd43dd8448eb211c80319c',
 *   sampled: false
 * });
 * // Span ID will be auto-generated
 * ```
 */
export function createTraceparent(context: W3CTraceContext): string {
  const version = '00';
  const flags = context.sampled ? '01' : '00';

  return `${version}-${context.traceId}-${context.spanId || generateSpanId()}-${
    context.traceFlags || flags
  }`;
}

/**
 * Generates a cryptographically random trace ID.
 *
 * Creates a 128-bit (32 hex character) trace identifier suitable for
 * starting a new trace or creating root spans. Uses crypto.getRandomValues
 * in browsers or Math.random as fallback.
 *
 * @returns {string} A 32 character hexadecimal trace ID
 *
 * @example Starting a new trace
 * ```typescript
 * const traceId = generateTraceId();
 * const spanId = generateSpanId();
 *
 * const traceContext = {
 *   traceId,
 *   spanId,
 *   sampled: true
 * };
 *
 * logger.info('Starting new trace', { trace: traceContext });
 * ```
 */
export function generateTraceId(): string {
  // Generate 16 random bytes and convert to hex
  const bytes = new Uint8Array(16);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for Node.js
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a cryptographically random span ID.
 *
 * Creates a 64-bit (16 hex character) span identifier for identifying
 * individual operations within a trace. Uses crypto.getRandomValues
 * in browsers or Math.random as fallback.
 *
 * @returns {string} A 16 character hexadecimal span ID
 *
 * @example Creating a child span
 * ```typescript
 * const childSpan = {
 *   traceId: parentContext.traceId, // Keep same trace ID
 *   spanId: generateSpanId(),        // New span ID
 *   parentSpanId: parentContext.spanId
 * };
 * ```
 */
export function generateSpanId(): string {
  // Generate 8 random bytes and convert to hex
  const bytes = new Uint8Array(8);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for Node.js
    for (let i = 0; i < 8; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Gets header value with case-insensitive matching.
 *
 * @private
 * @param {Record<string, string | string[] | undefined>} headers - Headers object
 * @param {string} name - Header name to find
 * @returns {string | undefined} Header value or undefined
 */
function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  // Try exact match first
  if (headers[name]) {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : (value as string);
  }

  // Try lowercase
  const lower = name.toLowerCase();
  if (headers[lower]) {
    const value = headers[lower];
    return Array.isArray(value) ? value[0] : (value as string);
  }

  // Search case-insensitive
  for (const key in headers) {
    if (key.toLowerCase() === lower) {
      const value = headers[key];
      return Array.isArray(value) ? value[0] : (value as string);
    }
  }

  return undefined;
}

/**
 * Validates trace ID format according to W3C specification.
 *
 * @private
 * @param {string} traceId - Trace ID to validate
 * @returns {boolean} True if valid (32 hex chars, not all zeros)
 */
function isValidTraceId(traceId: string): boolean {
  if (!/^[0-9a-f]{32}$/i.test(traceId)) {
    return false;
  }

  // Must not be all zeros
  return traceId !== '00000000000000000000000000000000';
}

/**
 * Validates span ID format according to W3C specification.
 *
 * @private
 * @param {string} spanId - Span ID to validate
 * @returns {boolean} True if valid (16 hex chars, not all zeros)
 */
function isValidSpanId(spanId: string): boolean {
  if (!/^[0-9a-f]{16}$/i.test(spanId)) {
    return false;
  }

  // Must not be all zeros
  return spanId !== '0000000000000000';
}

// File: src/utils/trace-context.ts

/**
 * W3C Trace Context utilities for distributed tracing.
 * 
 * Helpers for extracting and parsing W3C Trace Context headers
 * to enable distributed tracing correlation in logs.
 * 
 * @see https://www.w3.org/TR/trace-context/
 * @module utils/trace-context
 */

/**
 * W3C Trace Context structure
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
 * Extract W3C Trace Context from HTTP headers.
 * 
 * Parses the standard W3C traceparent and tracestate headers
 * used by OpenTelemetry and other distributed tracing systems.
 * 
 * @param headers - HTTP headers object (from Express, Koa, etc.)
 * @returns Parsed trace context or undefined if not present
 * 
 * @example
 * ```typescript
 * import { extractTraceContext } from 'magiclogger/utils/trace-context';
 * 
 * app.post('/api/endpoint', (req, res) => {
 *   const traceContext = extractTraceContext(req.headers);
 *   
 *   logger.info('Request received', {
 *     path: req.path,
 *     trace: traceContext // Will be propagated to OTLP transport
 *   });
 * });
 * ```
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
    sampled
  };
}

/**
 * Create W3C traceparent header from trace context.
 * 
 * @param context - Trace context
 * @returns Formatted traceparent header value
 * 
 * @example
 * ```typescript
 * const traceparent = createTraceparent({
 *   traceId: '0af7651916cd43dd8448eb211c80319c',
 *   spanId: 'b7ad6b7169203331',
 *   sampled: true
 * });
 * // Returns: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"
 * ```
 */
export function createTraceparent(context: W3CTraceContext): string {
  const version = '00';
  const flags = context.sampled ? '01' : '00';
  
  return `${version}-${context.traceId}-${context.spanId || generateSpanId()}-${context.traceFlags || flags}`;
}

/**
 * Generate a random trace ID (32 hex characters).
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
 * Generate a random span ID (16 hex characters).
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
 * Helper to get header value (case-insensitive).
 */
function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  // Try exact match first
  if (headers[name]) {
    return Array.isArray(headers[name]) ? headers[name][0] : headers[name] as string;
  }
  
  // Try lowercase
  const lower = name.toLowerCase();
  if (headers[lower]) {
    return Array.isArray(headers[lower]) ? headers[lower][0] : headers[lower] as string;
  }
  
  // Search case-insensitive
  for (const key in headers) {
    if (key.toLowerCase() === lower) {
      const value = headers[key];
      return Array.isArray(value) ? value[0] : value as string;
    }
  }
  
  return undefined;
}

/**
 * Validate trace ID format (32 hex chars, not all zeros).
 */
function isValidTraceId(traceId: string): boolean {
  if (!/^[0-9a-f]{32}$/i.test(traceId)) {
    return false;
  }
  
  // Must not be all zeros
  return traceId !== '00000000000000000000000000000000';
}

/**
 * Validate span ID format (16 hex chars, not all zeros).
 */
function isValidSpanId(spanId: string): boolean {
  if (!/^[0-9a-f]{16}$/i.test(spanId)) {
    return false;
  }
  
  // Must not be all zeros
  return spanId !== '0000000000000000';
}
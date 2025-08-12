// Deprecated shim file: src/transports/formatters/CustomFormatter.ts
// This file exists solely to provide backward compatibility and comprehensive
// documentation. The canonical implementations live in `index.ts`.

import {
  CustomFormatter as CanonicalCustomFormatter,
  FunctionFormatter as CanonicalFunctionFormatter,
  XMLFormatter as CanonicalXMLFormatter,
  CSVFormatter as CanonicalCSVFormatter
} from './index';
import type { LogEntry } from '../../types/transport';

/**
 * Interface for custom log formatters.
 *
 * A custom formatter transforms a structured {@link LogEntry} object into a
 * serialized representation (string or Buffer) suitable for emission by a
 * transport (file, console, HTTP, etc.).
 *
 * Implementations MUST be pure (no external side‑effects) and SHOULD be
 * deterministic for the same input entry. Heavy / blocking work (e.g. network
 * calls) MUST NOT be performed inside a formatter.
 *
 * Typical responsibilities:
 *  - Selecting & ordering fields (e.g. CSV columns)
 *  - Escaping / encoding for a target syntax (JSON / XML / etc.)
 *  - Truncating or redacting sensitive information
 *
 * Not responsibilities:
 *  - I/O (write to disk / network)
 *  - Buffering (handled by transports / async layers)
 *  - Rate limiting or sampling (handled higher up)
 *
 * @interface ICustomFormatter
 * @property {Function} format Format a single {@link LogEntry} into a string or Buffer.
 * @property {Function} [formatBatch] Optionally format multiple entries in one call.
 */
// No extra interface – rely on canonical ICustomFormatter.

/**
 * Abstract base class for creating custom formatters.
 *
 * Extend this when you want an OO subclass instead of a functional wrapper.
 * Only the {@link format} method is required; you may override
 * {@link formatBatch} for performance (e.g. emitting a single header, joining
 * with custom separators, wrapping XML, etc.).
 *
 * Lifecycle: A single instance is typically constructed and reused for all
 * log entries on a transport. Avoid retaining per-entry mutable state.
 *
 * Thread / worker safety: Instances should be stateless or only contain
 * immutable configuration so they can be shared across workers/threads (or
 * safely recreated) without synchronization concerns.
 *
 * Error handling: Throwing inside {@link format} will surface as a transport
 * failure. Prefer defensive coding and fallbacks when possible.
 *
 * @example Subclass pattern
 * ```ts
 * import { CustomFormatter } from 'magiclogger/transports/formatters/CustomFormatter';
 * class LineFormatter extends CustomFormatter {
 *   format(e: LogEntry) {
 *     return `${e.timestamp} ${e.level} ${e.message}`;
 *   }
 * }
 * transport.setFormatter(new LineFormatter());
 * ```
 */
export abstract class DeprecatedCustomFormatter extends CanonicalCustomFormatter {}

/**
 * Functional (higher‑order) formatter.
 *
 * Use this for quick, ad‑hoc formatting without declaring a subclass.
 * You provide a function that maps a {@link LogEntry} to a string / Buffer.
 * Batch formatting falls back to the base {@link CustomFormatter} implementation
 * (joining each single formatted line with an `\n`).
 *
 * @example Quick inline usage
 * ```ts
 * import { FunctionFormatter } from 'magiclogger/transports/formatters/CustomFormatter';
 * const f = new FunctionFormatter(e => `${e.level.toUpperCase()}: ${e.message}`);
 * transport.setFormatter(f);
 * ```
 *
 * @param fn Formatting function (pure, no side‑effects).
 */
export class DeprecatedFunctionFormatter extends CanonicalFunctionFormatter {}

/**
 * XML formatter (re-export).
 *
 * Produces either a single `<log>` element via {@link XMLFormatter.format}
 * or a full document with declaration & `<logs>` root via
 * {@link XMLFormatter.formatBatch}.
 *
 * Escapes XML entities, nests `context`, `metadata`, and `error` sections,
 * and wraps stacks in CDATA for fidelity.
 */
export class DeprecatedXMLFormatter extends CanonicalXMLFormatter {}

/**
 * CSV formatter (re-export).
 *
 * Emits stable column order with optional header row. Complex objects
 * (context / metadata) are JSON serialized. Quotes are doubled, and fields
 * containing delimiter / quotes / newlines are wrapped in quotes per RFC 4180.
 *
 * Use {@link CSVFormatter.formatBatch} for multi‑row output (adds header & trailing newline).
 */
export class DeprecatedCSVFormatter extends CanonicalCSVFormatter {}

/**
 * @deprecated This file is deprecated. Import from:
 * `import { CustomFormatter, FunctionFormatter, XMLFormatter, CSVFormatter } from 'magiclogger/transports/formatters';`
 */
export const __DEPRECATED_FILE__ = true;

// Re-export canonical types for convenience.
export type { LogEntry };

// Backwards compatibility named exports (legacy names) – kept as getters to warn in dev.
// Using Object.defineProperty to avoid duplicate identifier compilation issues if imported alongside canonical exports.
function deprecation(name: string) {
  if (process && process.env && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[magiclogger] Deprecated formatter import '${name}' from '.../CustomFormatter'. Import from '.../formatters' instead.`);
  }
}

// Legacy alias exports (non-enumerable to reduce accidental tree-shaking retention) – documented only for transition period.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Object.defineProperties(exports, {
  CustomFormatter: { get: () => { deprecation('CustomFormatter'); return CanonicalCustomFormatter; } },
  FunctionFormatter: { get: () => { deprecation('FunctionFormatter'); return CanonicalFunctionFormatter; } },
  XMLFormatter: { get: () => { deprecation('XMLFormatter'); return CanonicalXMLFormatter; } },
  CSVFormatter: { get: () => { deprecation('CSVFormatter'); return CanonicalCSVFormatter; } }
});

// File: src/utils/meta.ts

/**
 * Internal marker symbol to tag meta wrapper arguments so they are not printed
 * but attached as structured metadata on the log entry.
 */
export const META_WRAPPER = Symbol.for('magiclogger.meta');

/** Type for wrapped meta arguments */
export interface MetaArg {
  [META_WRAPPER]: true;
  value: Record<string, unknown> | Error | { error?: Error; [key: string]: unknown };
}

/**
 * Wrap structured metadata so variadic log calls can distinguish it from
 * printable data. The wrapped object will not be printed to console output
 * but will be attached to the transport entry as metadata.
 */
export function meta(value: MetaArg['value']): MetaArg {
  const wrapped = { [META_WRAPPER]: true, value } as MetaArg & { __magiclogger_meta__?: true };
  try {
    Object.defineProperty(wrapped, '__magiclogger_meta__', {
      value: true,
      enumerable: false,
      configurable: false,
    });
  } catch {
    // ignore if defineProperty fails
  }
  return wrapped as MetaArg;
}

/**
 * Convenience wrapper to attach an Error as structured metadata
 * (maps to { error }). The error won't be printed unless you also
 * pass it separately as a printable argument.
 */
export function err(error: Error): MetaArg {
  return meta({ error });
}

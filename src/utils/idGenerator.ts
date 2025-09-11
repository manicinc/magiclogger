/**
 * ID Generator utility for creating unique log entry IDs
 * Uses crypto.randomUUID when available, falls back to timestamp + random
 */

let counter = 0;

/**
 * Generate a unique ID for log entries
 * Uses crypto.randomUUID if available (Node 14.17+, modern browsers)
 * Falls back to timestamp + counter + random for compatibility
 */
export function generateId(): string {
  // Try to use crypto.randomUUID if available
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Node.js crypto module - check if we're in Node environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      // Use dynamic import for Node.js crypto
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      if (crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch {
      // crypto not available
    }
  }

  // Fallback: timestamp + counter + random
  // Counter ensures uniqueness even if called multiple times in same millisecond
  counter = (counter + 1) % 100000;
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, '0');
  return `${timestamp}-${counter.toString().padStart(5, '0')}-${random}`;
}

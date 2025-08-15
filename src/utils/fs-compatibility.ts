import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Derive a directory name for the current module in an ESM / CJS / browser agnostic way.
 *
 * Resolution order:
 * 1. Provided ImportMeta (test-injected) if it has a `url`.
 * 2. Native `import.meta.url` (ESM environments).
 * 3. `process.cwd()` (CommonJS / generic Node fallback).
 * 4. '/' (browser fallback when nothing else available).
 *
 * @param importMeta Import.meta object (optionally injected for tests / bundlers)
 * @returns Directory path string (best-effort)
 */
export function getModuleDirname(importMeta?: ImportMeta | { url?: string }): string {
  let metaUrl: string | undefined;
  if (importMeta && typeof importMeta === 'object' && 'url' in importMeta)
    metaUrl = (importMeta as { url?: string }).url;
  if (metaUrl) {
    try {
      return path.dirname(fileURLToPath(metaUrl));
    } catch {
      // Ignore and fall through to next strategy
    }
  }
  if (typeof process !== 'undefined' && process.cwd) return process.cwd();
  return '/';
}

/**
 * Read file contents in Node or fetch over HTTP(S) in browser as a fallback.
 *
 * Attempts dynamic import of `fs/promises` first; if that fails (e.g. browser
 * build), falls back to `fetch`.
 *
 * @param filePath Local file system path or URL accessible via fetch
 * @param encoding Text encoding when using fs (ignored for fetch -> always UTF-8 text)
 */
export async function readFileCompat(filePath: string, encoding: BufferEncoding = 'utf-8') {
  try {
    // Try Node.js native fs for Node.js environments
    const fs = await import('fs/promises');
    return await fs.readFile(filePath, { encoding });
  } catch {
    // Fallback or browser implementation
    try {
      const response = await fetch(filePath);
      return await response.text();
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }
}

/**
 * Resolve a relative path from a base path producing an absolute path (Node semantics).
 * In browser bundlers this still produces a concatenated path using Node polyfill semantics.
 */
export function resolvePathCompat(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath);
}

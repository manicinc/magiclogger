import { fileURLToPath } from 'url';
import path from 'path';

export function getModuleDirname(_importMeta: ImportMeta): string {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return path.dirname(fileURLToPath(import.meta.url));
  }

  // Fallback for CommonJS
  if (typeof process !== 'undefined' && process.cwd) {
    return process.cwd();
  }
  
  // Browser fallback
  return '/';
}

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

export function resolvePathCompat(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath);
}

// File: src/middleware/SecurityMiddleware.ts

import { Middleware, type MiddlewareResult, type MiddlewareContext } from './Middleware';
import type { LogEntry } from '../types/transport';

/**
 * Security middleware configuration.
 */
export interface SecurityMiddlewareOptions {
  /**
   * Sanitize newlines and control characters.
   * @default true
   */
  sanitizeNewlines?: boolean;
  
  /**
   * Prevent log injection attacks.
   * @default true
   */
  preventInjection?: boolean;
  
  /**
   * Maximum message length to prevent memory attacks.
   * @default 10000
   */
  maxMessageLength?: number;
  
  /**
   * Maximum context object depth to prevent deep recursion.
   * @default 10
   */
  maxContextDepth?: number;
  
  /**
   * Maximum number of context keys.
   * @default 100
   */
  maxContextKeys?: number;
  
  /**
   * Strip ANSI escape codes from messages.
   * @default false
   */
  stripAnsi?: boolean;
  
  /**
   * Validate and sanitize URLs in context.
   * @default true
   */
  sanitizeUrls?: boolean;
  
  /**
   * Custom sanitization function.
   */
  customSanitizer?: (value: string) => string;
}

/**
 * Security middleware for log sanitization and injection prevention.
 * 
 * This middleware provides comprehensive security features:
 * - Prevents log injection attacks
 * - Sanitizes control characters
 * - Limits message and context size
 * - Validates URLs
 * - Strips potentially dangerous content
 * 
 * @class SecurityMiddleware
 * @extends {Middleware}
 * 
 * @example
 * ```typescript
 * const security = new SecurityMiddleware({
 *   sanitizeNewlines: true,
 *   maxMessageLength: 5000,
 *   preventInjection: true
 * });
 * 
 * logger.addMiddleware(security);
 * ```
 */
export class SecurityMiddleware extends Middleware {
  readonly name = 'security';
  readonly priority = 10; // Run early in the pipeline
  
  private readonly options: Required<SecurityMiddlewareOptions>;
  
  /**
   * Patterns that could indicate injection attempts.
   * @private
   */
  private readonly injectionPatterns = [
    /\n\s*\d{4}-\d{2}-\d{2}/, // Fake timestamp injection
    /\[[\w\s]+\]\s*$/, // Fake log level injection
    /\r?\n\s*at\s+/, // Fake stack trace injection
  ];
  
  /**
   * Control characters that should be escaped.
   * @private
   */
  private readonly controlChars = new Map([
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\t', '\\t'],
    ['\b', '\\b'],
    ['\f', '\\f'],
    ['\v', '\\v'],
    ['\0', '\\0'],
  ]);
  
  /**
   * ANSI escape code pattern.
   * @private
   */
  private readonly ansiPattern = /\x1b\[[0-9;]*m/g;
  
  constructor(options: SecurityMiddlewareOptions = {}) {
    super();
    this.options = {
      sanitizeNewlines: options.sanitizeNewlines ?? true,
      preventInjection: options.preventInjection ?? true,
      maxMessageLength: options.maxMessageLength ?? 10000,
      maxContextDepth: options.maxContextDepth ?? 10,
      maxContextKeys: options.maxContextKeys ?? 100,
      stripAnsi: options.stripAnsi ?? false,
      sanitizeUrls: options.sanitizeUrls ?? true,
      customSanitizer: options.customSanitizer ?? ((v) => v),
    };
  }
  
  process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    try {
      // Create a copy to avoid mutating the original
      const sanitized: LogEntry = { ...entry };
      
      // Sanitize message
      if (typeof sanitized.message === 'string') {
        sanitized.message = this.sanitizeString(sanitized.message);
        
        // Check message length
        if (sanitized.message.length > this.options.maxMessageLength) {
          sanitized.message = sanitized.message.substring(0, this.options.maxMessageLength) + '...[truncated]';
        }
      }
      
      // Sanitize plain message
      if (typeof sanitized.plainMessage === 'string') {
        sanitized.plainMessage = this.sanitizeString(sanitized.plainMessage);
        
        if (sanitized.plainMessage.length > this.options.maxMessageLength) {
          sanitized.plainMessage = sanitized.plainMessage.substring(0, this.options.maxMessageLength) + '...[truncated]';
        }
      }
      
      // Sanitize context
      if (sanitized.context && typeof sanitized.context === 'object') {
        const keyCount = Object.keys(sanitized.context).length;
        if (keyCount > this.options.maxContextKeys) {
          console.warn(`[SecurityMiddleware] Context has ${keyCount} keys, max is ${this.options.maxContextKeys}`);
          // Truncate to max keys
          const keys = Object.keys(sanitized.context).slice(0, this.options.maxContextKeys);
          const truncated: Record<string, unknown> = {};
          for (const key of keys) {
            truncated[key] = sanitized.context[key];
          }
          truncated._truncated = true;
          sanitized.context = truncated;
        }
        
        // Make sure to sanitize a copy of the context
        sanitized.context = this.sanitizeObject({ ...sanitized.context }, 0);
      }
      
      // Sanitize error
      if (sanitized.error) {
        sanitized.error = this.sanitizeError(sanitized.error);
      }
      
      return { continue: true, entry: sanitized };
    } catch (error) {
      return this.handleError(error as Error, entry, context);
    }
  }
  
  /**
   * Sanitize a string value.
   * @private
   */
  private sanitizeString(value: string): string {
    let result = value;
    
    // Apply custom sanitizer first
    result = this.options.customSanitizer(result);
    
    // Strip ANSI codes if configured
    if (this.options.stripAnsi) {
      result = result.replace(this.ansiPattern, '');
    }
    
    // Check for injection attempts BEFORE sanitizing newlines
    if (this.options.preventInjection) {
      for (const pattern of this.injectionPatterns) {
        if (pattern.test(result)) {
          console.warn('[SecurityMiddleware] Potential injection attempt detected');
          // Replace suspicious patterns with safe versions
          result = result.replace(pattern, '[SANITIZED]');
        }
      }
    }
    
    // Sanitize control characters AFTER checking for injections
    if (this.options.sanitizeNewlines) {
      for (const [char, replacement] of this.controlChars) {
        result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      }
    }
    
    return result;
  }
  
  /**
   * Sanitize an object recursively.
   * @private
   */
  private sanitizeObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
    if (depth >= this.options.maxContextDepth) {
      return { _error: 'Max depth exceeded' };
    }
    
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeString(key);
      
      // Sanitize value based on type
      if (typeof value === 'string') {
        result[sanitizedKey] = this.sanitizeString(value);
        
        // Special handling for URLs
        if (this.options.sanitizeUrls && this.isUrl(value)) {
          result[sanitizedKey] = this.sanitizeUrl(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          result[sanitizedKey] = value.map(item => {
            if (typeof item === 'string') {
              return this.sanitizeString(item);
            } else if (typeof item === 'object' && item !== null) {
              return this.sanitizeObject(item as Record<string, unknown>, depth + 1);
            }
            return item;
          });
        } else {
          result[sanitizedKey] = this.sanitizeObject(value as Record<string, unknown>, depth + 1);
        }
      } else {
        result[sanitizedKey] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Sanitize error object.
   * @private
   */
  private sanitizeError(error: NonNullable<LogEntry['error']>): NonNullable<LogEntry['error']> {
    return {
      name: error.name ? this.sanitizeString(error.name) : 'Error',
      message: error.message ? this.sanitizeString(error.message) : '',
      stack: error.stack ? this.sanitizeString(error.stack) : undefined,
      code: error.code,
      cause: error.cause,
    };
  }
  
  /**
   * Check if a string is a URL.
   * @private
   */
  private isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Sanitize a URL to prevent XSS and other attacks.
   * @private
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      
      // Only allow safe protocols
      const safeProtocols = ['http:', 'https:', 'ftp:', 'ftps:'];
      if (!safeProtocols.includes(parsed.protocol)) {
        return '[UNSAFE_URL]';
      }
      
      // Remove credentials from URL
      if (parsed.username || parsed.password) {
        parsed.username = '';
        parsed.password = '';
        return parsed.toString();
      }
      
      return url;
    } catch {
      return '[INVALID_URL]';
    }
  }
}
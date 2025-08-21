// File: src/middleware/Middleware.ts

import type { LogEntry } from '../types/transport';

/**
 * Middleware execution result.
 * Allows middleware to modify, skip, or pass through log entries.
 */
export interface MiddlewareResult {
  /**
   * Whether to continue processing this log entry.
   * If false, the entry is dropped and subsequent middleware/transports are not called.
   */
  continue: boolean;
  
  /**
   * The potentially modified log entry.
   * Only used if continue is true.
   */
  entry?: LogEntry;
  
  /**
   * Optional reason for dropping the entry.
   * Used for debugging and metrics.
   */
  reason?: string;
}

/**
 * Middleware execution context.
 * Provides information about the middleware pipeline.
 */
export interface MiddlewareContext {
  /**
   * Name of the logger instance.
   */
  loggerId: string;
  
  /**
   * Current position in the middleware chain.
   */
  index: number;
  
  /**
   * Total number of middleware in the chain.
   */
  total: number;
  
  /**
   * Shared state between middleware (per log entry).
   */
  state: Map<string, unknown>;
}

/**
 * Abstract base class for log middleware.
 * 
 * Middleware can:
 * - Transform log entries (modify message, add context, etc.)
 * - Filter log entries (drop based on criteria)
 * - Enrich log entries (add timestamps, correlation IDs, etc.)
 * - Handle errors gracefully
 * 
 * IMPORTANT: Middleware MUST NOT throw exceptions.
 * Any errors should be handled internally and either:
 * - Return { continue: false } to drop the entry
 * - Log the error and pass the entry through unchanged
 * 
 * @abstract
 * @class Middleware
 * 
 * @example
 * ```typescript
 * class TimestampMiddleware extends Middleware {
 *   name = 'timestamp';
 *   
 *   process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
 *     return {
 *       continue: true,
 *       entry: {
 *         ...entry,
 *         timestamp: new Date().toISOString(),
 *         timestampMs: Date.now()
 *       }
 *     };
 *   }
 * }
 * ```
 */
export abstract class Middleware {
  /**
   * Unique name for this middleware.
   * Used for debugging and metrics.
   */
  abstract readonly name: string;
  
  /**
   * Priority for middleware execution order.
   * Lower values execute first.
   * @default 100
   */
  readonly priority: number = 100;
  
  /**
   * Whether this middleware is enabled.
   * Can be toggled at runtime.
   */
  enabled = true;
  
  /**
   * Process a log entry.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @param {MiddlewareContext} context - Execution context
   * @returns {MiddlewareResult} The processing result
   */
  abstract process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult;
  
  /**
   * Initialize the middleware.
   * Called once when middleware is added to the pipeline.
   * 
   * @returns {void | Promise<void>}
   */
  init?(): void | Promise<void>;
  
  /**
   * Clean up middleware resources.
   * Called when middleware is removed or logger is closed.
   * 
   * @returns {void | Promise<void>}
   */
  close?(): void | Promise<void>;
  
  /**
   * Handle errors that occur during processing.
   * Default implementation logs and continues.
   * 
   * @param {Error} error - The error that occurred
   * @param {LogEntry} entry - The log entry being processed
   * @param {MiddlewareContext} context - Execution context
   * @returns {MiddlewareResult} How to handle the error
   */
  handleError(error: Error, entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    console.error(`[Middleware: ${this.name}] Error processing log entry:`, error);
    // Default: pass entry through unchanged on error
    return { continue: true, entry };
  }
}

/**
 * Async middleware base class for async operations.
 * Use this when middleware needs to perform async operations.
 * 
 * NOTE: Async middleware can impact performance.
 * Consider batching or background processing for heavy operations.
 * 
 * @abstract
 * @class AsyncMiddleware
 * @extends {Middleware}
 */
export abstract class AsyncMiddleware extends Middleware {
  /**
   * Process a log entry asynchronously.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @param {MiddlewareContext} context - Execution context
   * @returns {Promise<MiddlewareResult>} The processing result
   */
  abstract processAsync(entry: LogEntry, context: MiddlewareContext): Promise<MiddlewareResult>;
  
  /**
   * Sync wrapper that throws an error.
   * Forces use of processAsync for async middleware.
   */
  process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    throw new Error(`${this.name} is async middleware. Use processAsync() or MiddlewarePipeline.processAsync()`);
  }
}

/**
 * Middleware pipeline manager.
 * Handles execution order, error handling, and state management.
 * 
 * @class MiddlewarePipeline
 * 
 * @example
 * ```typescript
 * const pipeline = new MiddlewarePipeline('my-logger');
 * pipeline.add(new TimestampMiddleware());
 * pipeline.add(new FilterMiddleware());
 * 
 * const result = pipeline.process(logEntry);
 * if (result.continue) {
 *   // Send to transports
 *   transport.log(result.entry);
 * }
 * ```
 */
export class MiddlewarePipeline {
  /**
   * List of middleware in the pipeline.
   * @private
   */
  private middleware: Middleware[] = [];
  
  /**
   * Logger ID for context.
   * @private
   */
  private readonly loggerId: string;
  
  /**
   * Whether pipeline has async middleware.
   * @private
   */
  private hasAsync = false;
  
  constructor(loggerId: string) {
    this.loggerId = loggerId;
  }
  
  /**
   * Add middleware to the pipeline.
   * 
   * @param {Middleware} middleware - The middleware to add
   */
  add(middleware: Middleware): void {
    this.middleware.push(middleware);
    this.middleware.sort((a, b) => a.priority - b.priority);
    
    if (middleware instanceof AsyncMiddleware) {
      this.hasAsync = true;
    }
    
    // Initialize if needed
    middleware.init?.();
  }
  
  /**
   * Remove middleware from the pipeline.
   * 
   * @param {string} name - Name of the middleware to remove
   * @returns {boolean} True if removed
   */
  remove(name: string): boolean {
    const index = this.middleware.findIndex(m => m.name === name);
    if (index === -1) return false;
    
    const removed = this.middleware.splice(index, 1)[0];
    removed.close?.();
    
    // Check if we still have async middleware
    this.hasAsync = this.middleware.some(m => m instanceof AsyncMiddleware);
    
    return true;
  }
  
  /**
   * Process a log entry through the pipeline (sync).
   * Throws if pipeline contains async middleware.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @returns {MiddlewareResult} The final result
   */
  process(entry: LogEntry): MiddlewareResult {
    if (this.hasAsync) {
      throw new Error('Pipeline contains async middleware. Use processAsync()');
    }
    
    const state = new Map<string, unknown>();
    let current = entry;
    
    for (let i = 0; i < this.middleware.length; i++) {
      const mw = this.middleware[i];
      if (!mw.enabled) continue;
      
      const context: MiddlewareContext = {
        loggerId: this.loggerId,
        index: i,
        total: this.middleware.length,
        state
      };
      
      try {
        const result = mw.process(current, context);
        
        if (!result.continue) {
          return result;
        }
        
        if (result.entry) {
          current = result.entry;
        }
      } catch (error) {
        const errorResult = mw.handleError(error as Error, current, context);
        if (!errorResult.continue) {
          return errorResult;
        }
        if (errorResult.entry) {
          current = errorResult.entry;
        }
      }
    }
    
    return { continue: true, entry: current };
  }
  
  /**
   * Process a log entry through the pipeline (async).
   * 
   * @param {LogEntry} entry - The log entry to process
   * @returns {Promise<MiddlewareResult>} The final result
   */
  async processAsync(entry: LogEntry): Promise<MiddlewareResult> {
    const state = new Map<string, unknown>();
    let current = entry;
    
    for (let i = 0; i < this.middleware.length; i++) {
      const mw = this.middleware[i];
      if (!mw.enabled) continue;
      
      const context: MiddlewareContext = {
        loggerId: this.loggerId,
        index: i,
        total: this.middleware.length,
        state
      };
      
      try {
        let result: MiddlewareResult;
        
        if (mw instanceof AsyncMiddleware) {
          result = await mw.processAsync(current, context);
        } else {
          result = mw.process(current, context);
        }
        
        if (!result.continue) {
          return result;
        }
        
        if (result.entry) {
          current = result.entry;
        }
      } catch (error) {
        const errorResult = mw.handleError(error as Error, current, context);
        if (!errorResult.continue) {
          return errorResult;
        }
        if (errorResult.entry) {
          current = errorResult.entry;
        }
      }
    }
    
    return { continue: true, entry: current };
  }
  
  /**
   * Clear all middleware from the pipeline.
   */
  async clear(): Promise<void> {
    for (const mw of this.middleware) {
      await mw.close?.();
    }
    this.middleware = [];
    this.hasAsync = false;
  }
  
  /**
   * Get middleware by name.
   * 
   * @param {string} name - Name of the middleware
   * @returns {Middleware | undefined} The middleware or undefined
   */
  get(name: string): Middleware | undefined {
    return this.middleware.find(m => m.name === name);
  }
  
  /**
   * Get all middleware names.
   * 
   * @returns {string[]} Array of middleware names
   */
  list(): string[] {
    return this.middleware.map(m => m.name);
  }
  
  /**
   * Check if pipeline has async middleware.
   * 
   * @returns {boolean} True if has async middleware
   */
  isAsync(): boolean {
    return this.hasAsync;
  }
}
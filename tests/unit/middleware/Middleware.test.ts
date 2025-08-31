// File: tests/unit/middleware/Middleware.test.ts

// Jest is configured globally, no imports needed for describe, it, expect
import {
  Middleware,
  AsyncMiddleware,
  MiddlewarePipeline,
  type MiddlewareResult,
  type MiddlewareContext,
} from '../../../src/middleware/Middleware';
import type { LogEntry } from '../../../src/types/transport';

// Test middleware implementation
class TestMiddleware extends Middleware {
  name = 'test';
  priority = 100;

  processCallCount = 0;
  lastEntry?: LogEntry;
  lastContext?: MiddlewareContext;

  process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    this.processCallCount++;
    this.lastEntry = entry;
    this.lastContext = context;

    return {
      continue: true,
      entry: {
        ...entry,
        context: {
          ...entry.context,
          processedBy: 'test',
        },
      },
    };
  }
}

// Test async middleware
class TestAsyncMiddleware extends AsyncMiddleware {
  name = 'test-async';
  priority = 50;

  processCallCount = 0;
  delay = 10;

  async processAsync(entry: LogEntry, _context: MiddlewareContext): Promise<MiddlewareResult> {
    this.processCallCount++;
    await new Promise(resolve => setTimeout(resolve, this.delay));

    return {
      continue: true,
      entry: {
        ...entry,
        context: {
          ...entry.context,
          processedByAsync: 'test-async',
        },
      },
    };
  }
}

// Filtering middleware
class FilterMiddleware extends Middleware {
  name = 'filter';
  priority = 10;

  constructor(private shouldFilter: (entry: LogEntry) => boolean) {
    super();
  }

  process(entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
    if (this.shouldFilter(entry)) {
      return {
        continue: false,
        reason: 'filtered',
      };
    }
    return { continue: true, entry };
  }
}

// Error-throwing middleware
class ErrorMiddleware extends Middleware {
  name = 'error';

  process(_entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
    throw new Error('Test error');
  }

  handleError(error: Error, entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
    return {
      continue: true,
      entry: {
        ...entry,
        context: {
          ...entry.context,
          errorHandled: true,
        },
      },
    };
  }
}

describe('Middleware', () => {
  let mockEntry: LogEntry;

  beforeEach(() => {
    mockEntry = {
      id: 'test-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      timestampMs: 1704067200000,
      level: 'info',
      message: 'Test message',
      message: 'Test message',
      loggerId: 'test-logger',
      context: { test: true },
    };
  });

  describe('Middleware Base Class', () => {
    it('should process entries correctly', () => {
      const middleware = new TestMiddleware();
      const context: MiddlewareContext = {
        loggerId: 'test-logger',
        index: 0,
        total: 1,
        state: new Map(),
      };

      const result = middleware.process(mockEntry, context);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('processedBy', 'test');
      expect(middleware.processCallCount).toBe(1);
      expect(middleware.lastEntry).toBe(mockEntry);
      expect(middleware.lastContext).toBe(context);
    });

    it('should respect enabled flag', () => {
      const middleware = new TestMiddleware();
      middleware.enabled = false;

      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(middleware);

      const result = pipeline.process(mockEntry);

      expect(result.entry?.context).not.toHaveProperty('processedBy');
      expect(middleware.processCallCount).toBe(0);
    });

    it('should use priority for ordering', () => {
      const middleware1 = new TestMiddleware();
      middleware1.name = 'first';
      middleware1.priority = 10;

      const middleware2 = new TestMiddleware();
      middleware2.name = 'second';
      middleware2.priority = 20;

      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(middleware2); // Add in wrong order
      pipeline.add(middleware1);

      const list = pipeline.list();
      expect(list).toEqual(['first', 'second']);
    });

    it('should handle errors gracefully', () => {
      const middleware = new ErrorMiddleware();

      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(middleware);

      const result = pipeline.process(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('errorHandled', true);
    });
  });

  describe('AsyncMiddleware', () => {
    it('should process entries asynchronously', async () => {
      const middleware = new TestAsyncMiddleware();
      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(middleware);

      const result = await pipeline.processAsync(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('processedByAsync', 'test-async');
      expect(middleware.processCallCount).toBe(1);
    });

    it('should throw error when calling sync process on async middleware', () => {
      const middleware = new TestAsyncMiddleware();
      const context: MiddlewareContext = {
        loggerId: 'test-logger',
        index: 0,
        total: 1,
        state: new Map(),
      };

      expect(() => middleware.process(mockEntry, context)).toThrow(
        'test-async is async middleware'
      );
    });

    it('should detect async middleware in pipeline', () => {
      const pipeline = new MiddlewarePipeline('test-logger');
      const syncMiddleware = new TestMiddleware();
      const asyncMiddleware = new TestAsyncMiddleware();

      expect(pipeline.isAsync()).toBe(false);

      pipeline.add(syncMiddleware);
      expect(pipeline.isAsync()).toBe(false);

      pipeline.add(asyncMiddleware);
      expect(pipeline.isAsync()).toBe(true);
    });
  });

  describe('MiddlewarePipeline', () => {
    let pipeline: MiddlewarePipeline;

    beforeEach(() => {
      pipeline = new MiddlewarePipeline('test-logger');
    });

    it('should process entries through multiple middleware', () => {
      const mw1 = new TestMiddleware();
      mw1.name = 'mw1';

      const mw2 = new TestMiddleware();
      mw2.name = 'mw2';

      pipeline.add(mw1);
      pipeline.add(mw2);

      const result = pipeline.process(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('processedBy', 'test');
      expect(mw1.processCallCount).toBe(1);
      expect(mw2.processCallCount).toBe(1);
    });

    it('should stop processing when middleware returns continue: false', () => {
      const filter = new FilterMiddleware(entry => entry.level === 'info');
      const test = new TestMiddleware();

      pipeline.add(filter);
      pipeline.add(test);

      const result = pipeline.process(mockEntry);

      expect(result.continue).toBe(false);
      expect(result.reason).toBe('filtered');
      expect(test.processCallCount).toBe(0);
    });

    it('should share state between middleware', () => {
      class StateMiddleware1 extends Middleware {
        name = 'state1';
        process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
          context.state.set('value', 'from-mw1');
          return { continue: true, entry };
        }
      }

      class StateMiddleware2 extends Middleware {
        name = 'state2';
        process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
          const value = context.state.get('value');
          return {
            continue: true,
            entry: {
              ...entry,
              context: { ...entry.context, sharedValue: value },
            },
          };
        }
      }

      pipeline.add(new StateMiddleware1());
      pipeline.add(new StateMiddleware2());

      const result = pipeline.process(mockEntry);

      expect(result.entry?.context).toHaveProperty('sharedValue', 'from-mw1');
    });

    it('should handle mixed sync and async middleware', async () => {
      const sync = new TestMiddleware();
      const async = new TestAsyncMiddleware();

      pipeline.add(sync);
      pipeline.add(async);

      const result = await pipeline.processAsync(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('processedBy', 'test');
      expect(result.entry?.context).toHaveProperty('processedByAsync', 'test-async');
    });

    it('should remove middleware by name', () => {
      const mw = new TestMiddleware();
      pipeline.add(mw);

      expect(pipeline.list()).toContain('test');

      const removed = pipeline.remove('test');
      expect(removed).toBe(true);
      expect(pipeline.list()).not.toContain('test');

      const removedAgain = pipeline.remove('test');
      expect(removedAgain).toBe(false);
    });

    it('should get middleware by name', () => {
      const mw = new TestMiddleware();
      pipeline.add(mw);

      const retrieved = pipeline.get('test');
      expect(retrieved).toBe(mw);

      const notFound = pipeline.get('nonexistent');
      expect(notFound).toBeUndefined();
    });

    it('should clear all middleware', async () => {
      const mw1 = new TestMiddleware();
      const mw2 = new TestAsyncMiddleware();

      const closeSpy1 = jest.fn();
      const closeSpy2 = jest.fn();
      mw1.close = closeSpy1;
      mw2.close = closeSpy2;

      pipeline.add(mw1);
      pipeline.add(mw2);

      expect(pipeline.list()).toHaveLength(2);

      await pipeline.clear();

      expect(pipeline.list()).toHaveLength(0);
      expect(pipeline.isAsync()).toBe(false);
    });

    it('should initialize middleware when added', () => {
      class InitMiddleware extends Middleware {
        name = 'init';
        initialized = false;

        init(): void {
          this.initialized = true;
        }

        process(entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
          return { continue: true, entry };
        }
      }

      const mw = new InitMiddleware();
      expect(mw.initialized).toBe(false);

      pipeline.add(mw);
      expect(mw.initialized).toBe(true);
    });

    it('should provide correct context information', () => {
      let capturedContext: MiddlewareContext | undefined;

      class ContextMiddleware extends Middleware {
        name = 'context';

        process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
          capturedContext = context;
          return { continue: true, entry };
        }
      }

      const mw1 = new TestMiddleware();
      const mw2 = new ContextMiddleware();
      const mw3 = new TestMiddleware();

      pipeline.add(mw1);
      pipeline.add(mw2);
      pipeline.add(mw3);

      pipeline.process(mockEntry);

      expect(capturedContext).toBeDefined();
      expect(capturedContext?.loggerId).toBe('test-logger');
      expect(capturedContext?.index).toBe(1); // Second middleware (0-indexed)
      expect(capturedContext?.total).toBe(3);
      expect(capturedContext?.state).toBeInstanceOf(Map);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in middleware gracefully', () => {
      const errorMw = new ErrorMiddleware();
      const testMw = new TestMiddleware();

      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(errorMw);
      pipeline.add(testMw); // Should still be called after error

      const result = pipeline.process(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry?.context).toHaveProperty('errorHandled', true);
      expect(result.entry?.context).toHaveProperty('processedBy', 'test');
      expect(testMw.processCallCount).toBe(1);
    });

    it('should use default error handler if custom handler not provided', () => {
      class NoHandlerMiddleware extends Middleware {
        name = 'no-handler';

        process(_entry: LogEntry, _context: MiddlewareContext): MiddlewareResult {
          throw new Error('Unhandled error');
        }
      }

      const mw = new NoHandlerMiddleware();
      const pipeline = new MiddlewarePipeline('test-logger');
      pipeline.add(mw);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        /* ignore */
      });

      const result = pipeline.process(mockEntry);

      expect(result.continue).toBe(true);
      expect(result.entry).toEqual(mockEntry);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Middleware: no-handler] Error processing log entry:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

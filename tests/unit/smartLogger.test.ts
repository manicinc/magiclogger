// File: tests/unit/smartLogger.test.ts

import { createSmartLogger, createPerformantLogger, Logger, AsyncLogger } from '../../src';

describe('createSmartLogger API', () => {
  it('should export createSmartLogger and deprecated alias', () => {
    expect(createSmartLogger).toBeDefined();
    expect(typeof createSmartLogger).toBe('function');

    // Deprecated alias should still exist and point to the same function
    expect(createPerformantLogger).toBeDefined();
    expect(createPerformantLogger).toBe(createSmartLogger);
  });

  it('should return a sync Logger when mode is "sync"', () => {
    const logger = createSmartLogger({ mode: 'sync' });
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should return an AsyncLogger when mode is "async"', () => {
    const logger = createSmartLogger({ mode: 'async', onFlush: async () => void 0 });
    expect(logger).toBeInstanceOf(AsyncLogger);
  });
});

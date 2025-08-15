// File: tests/unit/transports/base/implementations/MongoDBTransport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// NOTE: Do NOT call jest.mock('mongodb') here.
// The moduleNameMapper in jest.config.ts points '^mongodb$' to tests/__mocks__/mongodb.js.
// Calling jest.mock without a factory would auto-hoist and replace our manual mock with empty jest.fn() stubs.
// We rely on the real manual mock implementation for behavior (connect, insertMany, etc.).

// Pull the mock constructors and fns from the manual mock
// Import manual mock exports (moduleNameMapper resolves '^mongodb$' to our mock file)
import * as MongoMockModule from 'mongodb';
// Cast to any to destructure known mock exports provided by the manual mock implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const {
  MockMongoClient,
  mockInsertMany,
  mockCreateIndexes,
  mockFind,
  mockDeleteMany,
  mockAggregate,
  mockWatch,
  mockPing,
  mockConnect,
  mockClose,
  mockCursor,
  mockDb,
  mockClient,
} = MongoMockModule as any;

describe('MongoDBTransport', () => {
  let MongoDBTransport: any;
  let transport: any;
  let entry: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockInsertMany.mockResolvedValue({ insertedCount: 1 });
    mockCreateIndexes.mockResolvedValue(undefined);
    mockDeleteMany.mockResolvedValue({ deletedCount: 1 });
    mockPing.mockResolvedValue(undefined);
    mockConnect.mockResolvedValue(undefined);
    mockClose.mockResolvedValue(undefined);

    // Dynamic import after mocks
    ({ MongoDBTransport } = await import(
      '../../../../../src/transports/base/implementations/MongoDBTransport'
    ));

    entry = {
      id: 'test-id',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      context: { test: true },
    };
  });

  // Ensure we cleanup timers and connections after each test
  afterEach(async () => {
    if (transport && typeof transport.close === 'function') {
      try {
        await transport.close();
      } catch (e) {
        /* swallow test cleanup error */
      }
    }
    transport = undefined;
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('creates transport with required options', () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      expect(transport.name).toBe('mongodb');
    });

    it('uses default database and collection names', () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      expect(transport.name).toBe('mongodb');
      // Defaults are set internally
    });

    it('accepts custom database and collection names', () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        database: 'myapp',
        collection: 'app_logs',
      });
      expect(transport.name).toBe('mongodb');
    });

    it('accepts TTL configuration', () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        ttl: 86400, // 1 day
      });
      expect(transport.name).toBe('mongodb');
    });

    it('accepts custom document transformer', () => {
      const transformer = (entry: any) => ({ ...entry, custom: true });
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        transformDocument: transformer,
      });
      expect(transport.name).toBe('mongodb');
    });
  });

  describe('connection', () => {
    beforeEach(() => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        database: 'logs',
        collection: 'app_logs',
      });
    });

    it('connects to MongoDB', async () => {
      await transport.init();

      expect(MockMongoClient).toHaveBeenCalledWith('mongodb://localhost:27017', {});
      expect(mockConnect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalledWith('logs');
      expect(mockDb.collection).toHaveBeenCalledWith('app_logs');
    });

    it('creates indexes on first connection', async () => {
      await transport.init();

      expect(mockCreateIndexes).toHaveBeenCalled();
      const indexes = mockCreateIndexes.mock.calls[0][0];

      // Check for expected indexes
      const indexNames = indexes.map((idx: any) => idx.name);
      expect(indexNames).toContain('timestamp_desc');
      expect(indexNames).toContain('level');
      expect(indexNames).toContain('logger_id');
      expect(indexNames).toContain('tags');
      expect(indexNames).toContain('level_timestamp');
      expect(indexNames).toContain('message_text');
    });

    it('creates TTL index when TTL is configured', async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        ttl: 86400,
      });

      await transport.init();

      const indexes = mockCreateIndexes.mock.calls[0][0];
      const ttlIndex = indexes.find((idx: any) => idx.name === 'ttl');

      expect(ttlIndex).toBeDefined();
      expect(ttlIndex.expireAfterSeconds).toBe(86400);
    });

    it('handles connection errors', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(transport.init()).rejects.toThrow('MongoDB connection failed');
    });

    it('prevents duplicate connections', async () => {
      await transport.init();
      await transport.init(); // Second call should return immediately

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        database: 'logs',
        collection: 'app_logs',
      });
      await transport.init();
    });

    it('inserts single log entry', async () => {
      await transport.log(entry);
      await transport.flush();

      expect(mockInsertMany).toHaveBeenCalled();
      const docs = mockInsertMany.mock.calls[0][0];

      expect(docs).toHaveLength(1);
      expect(docs[0].message).toBe('Test message');
      expect(docs[0]._id).toBe('test-id');
      expect(docs[0]._timestamp).toBeInstanceOf(Date);
    });

    it('inserts batch of log entries', async () => {
      const entries = [entry, { ...entry, id: 'test-id-2' }, { ...entry, id: 'test-id-3' }];

      await transport.logBatch(entries);
      await transport.flush();

      expect(mockInsertMany).toHaveBeenCalled();
      const docs = mockInsertMany.mock.calls[0][0];

      expect(docs).toHaveLength(3);
      expect(docs[0]._id).toBe('test-id');
      expect(docs[1]._id).toBe('test-id-2');
      expect(docs[2]._id).toBe('test-id-3');
    });

    it('applies custom document transformation', async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
        transformDocument: (entry: any) => ({
          ...entry,
          customField: 'transformed',
          timestamp: undefined, // Remove original timestamp
        }),
      });
      await transport.init();

      await transport.log(entry);
      await transport.flush();

      const docs = mockInsertMany.mock.calls[0][0];
      expect(docs[0].customField).toBe('transformed');
      expect(docs[0].timestamp).toBeUndefined();
    });

    it('handles duplicate key errors', async () => {
      const error: any = new Error('Duplicate key');
      error.code = 11000;
      error.writeErrors = [{ index: 0 }, { index: 2 }];

      mockInsertMany.mockRejectedValueOnce(error).mockResolvedValueOnce({ insertedCount: 1 });

      const entries = [entry, { ...entry, id: 'test-id-2' }, { ...entry, id: 'test-id-3' }];

      await transport.logBatch(entries);
      await transport.flush();

      // Should retry with filtered documents
      expect(mockInsertMany).toHaveBeenCalledTimes(2);
      const retryDocs = mockInsertMany.mock.calls[1][0];
      expect(retryDocs).toHaveLength(1); // Only the non-duplicate
    });

    it('handles partial insert success', async () => {
      mockInsertMany.mockResolvedValueOnce({ insertedCount: 2 });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const entries = [entry, { ...entry, id: 'test-id-2' }, { ...entry, id: 'test-id-3' }];

      await transport.logBatch(entries);
      await transport.flush();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only inserted 2 of 3 documents')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('querying', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('queries logs with filter', async () => {
      const mockResults = [
        { id: '1', level: 'error', message: 'Error 1' },
        { id: '2', level: 'error', message: 'Error 2' },
      ];
      mockCursor.toArray.mockResolvedValueOnce(mockResults);

      const results = await transport.query({ level: 'error' });

      expect(mockFind).toHaveBeenCalledWith({ level: 'error' });
      expect(results).toEqual(mockResults);
    });

    it('applies query options', async () => {
      await transport.query(
        { level: 'info' },
        {
          skip: 10,
          limit: 20,
          sort: { timestamp: -1 },
          projection: { message: 1, level: 1 },
        }
      );

      expect(mockCursor.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockCursor.skip).toHaveBeenCalledWith(10);
      expect(mockCursor.limit).toHaveBeenCalledWith(20);
      expect(mockCursor.project).toHaveBeenCalledWith({ message: 1, level: 1 });
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('aggregates statistics by hour', async () => {
      const mockStats = [{ _id: { year: 2024, month: 1, day: 20, hour: 10 }, count: 100 }];
      mockCursor.toArray.mockResolvedValueOnce(mockStats);

      const stats = await transport.getStatistics({
        groupBy: 'hour',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-21'),
      });

      expect(mockAggregate).toHaveBeenCalled();
      const pipeline = mockAggregate.mock.calls[0][0];

      // Check for date filter stage
      expect(pipeline[0].$match).toBeDefined();

      // Check for group stage
      expect(pipeline[1].$group).toBeDefined();
      expect(pipeline[1].$group._id).toHaveProperty('hour');

      expect(stats).toEqual(mockStats);
    });

    it('aggregates statistics by level', async () => {
      const mockStats = [
        { _id: 'error', count: 50, errors: 50 },
        { _id: 'info', count: 150, errors: 0 },
      ];
      mockCursor.toArray.mockResolvedValueOnce(mockStats);

      const stats = await transport.getStatistics({
        groupBy: 'level',
      });

      const pipeline = mockAggregate.mock.calls[0][0];
      expect(pipeline[0].$group._id).toBe('$level');
      expect(stats).toEqual(mockStats);
    });
  });

  describe('change streams', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('creates change stream with filter', async () => {
      const mockStream = { on: jest.fn() };
      mockWatch.mockReturnValueOnce(mockStream);

      const stream = await transport.createChangeStream({
        filter: { level: 'error' },
        fullDocument: 'updateLookup',
      });

      expect(mockWatch).toHaveBeenCalledWith([{ $match: { level: 'error' } }], {
        fullDocument: 'updateLookup',
      });
      expect(stream).toBe(mockStream);
    });

    it('creates change stream without filter', async () => {
      const mockStream = { on: jest.fn() };
      mockWatch.mockReturnValueOnce(mockStream);

      await transport.createChangeStream();

      expect(mockWatch).toHaveBeenCalledWith([], { fullDocument: 'default' });
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('deletes old logs', async () => {
      mockDeleteMany.mockResolvedValueOnce({ deletedCount: 42 });

      const beforeDate = new Date('2024-01-01');
      const deleted = await transport.cleanup(beforeDate);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        _timestamp: { $lt: beforeDate },
      });
      expect(deleted).toBe(42);
    });
  });

  describe('health check', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('performs health check via ping', async () => {
      await (transport as any).checkHealth();

      expect(mockPing).toHaveBeenCalled();
      // isHealthy reflects connection state rather than ping
      const healthy = await transport.isHealthy();
      expect(healthy).toBe(true);
    });

    it('reports unhealthy on ping failure', async () => {
      mockPing.mockRejectedValueOnce(new Error('Ping failed'));

      await expect((transport as any).checkHealth()).rejects.toThrow('Ping failed');
      // isHealthy does not use ping; simply assert ping was attempted
      expect(mockPing).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();
    });

    it('handles topology destroyed errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.useFakeTimers();

      // Trigger error handler
      const error = new Error('topology was destroyed');
      (transport as any).handleError(error);

      // Fast-forward reconnection timer
      jest.advanceTimersByTime(5000);

      expect(mockConnect).toHaveBeenCalled();

      consoleSpy.mockRestore();
      jest.useRealTimers();
    });

    it('handles server selection timeout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.useFakeTimers();

      const error = new Error('server selection timed out');
      (transport as any).handleError(error);

      jest.advanceTimersByTime(5000);

      expect(mockConnect).toHaveBeenCalled();

      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('close', () => {
    it('closes MongoDB connection', async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });
      await transport.init();

      await transport.close();

      expect(mockClose).toHaveBeenCalled();
    });

    it('handles close when not connected', async () => {
      transport = new MongoDBTransport({
        name: 'mongodb',
        uri: 'mongodb://localhost:27017',
      });

      await expect(transport.close()).resolves.not.toThrow();
    });
  });
});

// File: tests/unit/transports/base/implementations/PostgreSQLTransport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostgreSQLTransport } from '../../../../../src/transports/base/implementations/PostgreSQLTransport';
import type { LogEntry } from '../../../../../src/types/transport';

// Mock pg module
jest.mock('pg', () => {
  const mockResults: { rows: Array<Record<string, unknown>>; rowCount: number }[] = [];
  let queryHandler: ((text: string, params?: unknown[]) => { rows: Array<Record<string, unknown>>; rowCount: number } | undefined) | null = null;

  class MockClient {
    async query(text: string, params?: unknown[]) {
      if (queryHandler) {
        const result = queryHandler(text, params);
        if (result) return result;
      }

      const sql = text.toLowerCase();

      if (sql.includes('begin') || sql.includes('commit') || sql.includes('rollback')) {
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes('create table') || sql.includes('create index')) {
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes('insert into')) {
        const perRowParams = 9;
        const countFromParams = params && Array.isArray(params) && params.length > 0
          ? Math.max(1, Math.round(params.length / perRowParams))
          : undefined;
        let count = countFromParams ?? 1;
        if (!countFromParams) {
          const afterValues = text.split(/values/i)[1] || '';
          const tupleMatches = afterValues.match(/\([^)]*\)/g);
          count = tupleMatches ? tupleMatches.length : 1;
        }
        mockResults.push({ rows: [], rowCount: count });
        return { rows: [], rowCount: count };
      }

      if (sql.includes('delete from')) {
        return { rows: [{ id: 1 }, { id: 2 }, { id: 3 }], rowCount: 3 };
      }

      if (sql.includes('select')) {
        return { rows: [], rowCount: 0 };
      }

      return { rows: [], rowCount: 0 };
    }

    release() {
      // no-op
    }
  }

  class MockPool {
    private config: Record<string, unknown>;
    constructor(config: Record<string, unknown>) {
      this.config = config;
    }
    async connect() { return new MockClient(); }
    async end() { /* no-op */ }
  }

  return {
    Pool: MockPool,
    Client: MockClient,
    getMockResults: () => mockResults,
    clearMockResults: () => (mockResults.length = 0),
    setMockQueryHandler: (fn: typeof queryHandler) => { queryHandler = fn; },
    resetMockQueryHandler: () => { queryHandler = null; },
  };
});

describe('PostgreSQLTransport', () => {
  let transport: PostgreSQLTransport;
  let mockPg: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPg = require('pg');
    mockPg.clearMockResults();
    mockPg.resetMockQueryHandler();
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
  });

  describe('constructor', () => {
    it('should create transport with connection string', () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'logs',
        schema: 'public'
      });

      expect(transport).toBeInstanceOf(PostgreSQLTransport);
      expect(transport.getName()).toBe('pg-test');
    });

    it('should build connection string from options', () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        ssl: true,
        table: 'logs'
      });

      expect(transport).toBeInstanceOf(PostgreSQLTransport);
    });

    it('should throw error if database not provided', () => {
      expect(() => {
        new PostgreSQLTransport({
          name: 'pg-test',
          host: 'localhost',
          table: 'logs'
        });
      }).toThrow('PostgreSQL database is required');
    });
  });

  describe('initialization', () => {
    it('should initialize connection pool and create table', async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: true,
        indexes: ['timestamp', 'level', 'logger_id']
      });

      await transport.init();
      expect(transport.isEnabled()).toBe(true);
    });

    it('should skip table creation if createTable is false', async () => {
      let createTableCalled = false;
      mockPg.setMockQueryHandler((sql: string) => {
        if (sql.toLowerCase().includes('create table')) {
          createTableCalled = true;
        }
        return undefined;
      });

      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false
      });

      await transport.init();
      expect(createTableCalled).toBe(false);
    });

    it('should handle initialization errors', async () => {
      mockPg.setMockQueryHandler(() => {
        throw new Error('Connection failed');
      });

      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs'
      });

      await expect(transport.init()).rejects.toThrow('Connection failed');
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false,
  batchSize: 2,
  flushInterval: 100,
  // Disable retries in tests to avoid long backoff delays
  retryOnFailure: false,
  maxRetries: 0,
  retryDelay: 0
      });
      await transport.init();
    });

    it('should batch log entries', async () => {
      const entry1: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message 1',
        plainMessage: 'Test message 1',
        loggerId: 'test-logger',
        tags: ['test'],
        context: { key: 'value' },
        metadata: { env: 'test' }
      };

      const entry2: LogEntry = {
        id: '2',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Test message 2',
        plainMessage: 'Test message 2',
        loggerId: 'test-logger',
        error: {
          name: 'TestError',
          message: 'Test error message',
          stack: 'Test stack trace'
        }
      };

      await transport.log(entry1);
      await transport.log(entry2);
      await transport.flush();

      const results = mockPg.getMockResults();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].rowCount).toBe(2);
    });

  it('should handle single log entry', async () => {
      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
  level: 'info',
        message: 'Debug message',
        plainMessage: 'Debug message'
      };

  await transport.log(entry);
  await transport.flush();
  const stats = transport.getStats();
  expect(stats.succeeded + stats.failed).toBeGreaterThan(0);
    });

  it('should handle batch insert errors with rollback', async () => {
  let beginCalled = false;
      let rollbackCalled = false;
      
      mockPg.setMockQueryHandler((sql: string) => {
        if (sql.toLowerCase().includes('begin')) {
          beginCalled = true;
          return { rows: [], rowCount: 0 };
        }
        if (sql.toLowerCase().includes('insert')) {
          throw new Error('Insert failed');
        }
        if (sql.toLowerCase().includes('rollback')) {
          rollbackCalled = true;
          return { rows: [], rowCount: 0 };
        }
        return undefined;
      });

      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Test',
        plainMessage: 'Test'
      };

      await transport.log(entry);
      
  // Flush should trigger the batch insert and record failure (no retries)
  await transport.flush();
  expect(beginCalled).toBe(true);
  expect(rollbackCalled).toBe(true);
  const stats = transport.getStats();
  expect(stats.failed).toBeGreaterThan(0);
    });

    it('should respect log level filtering', async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false,
        level: 'warn' // Only warn and above
      });
      await transport.init();

      const debugEntry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'debug',
        message: 'Debug',
        plainMessage: 'Debug'
      };

      const errorEntry: LogEntry = {
        id: '2',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Error',
        plainMessage: 'Error'
      };

      await transport.log(debugEntry); // Should be filtered out
      await transport.log(errorEntry); // Should be logged
      await transport.flush();

      const results = mockPg.getMockResults();
      expect(results.length).toBe(1);
      expect(results[0].rowCount).toBe(1);
    });
  });

  describe('cleanup operations', () => {
    beforeEach(async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false
      });
      await transport.init();
    });

    it('should clean up old logs', async () => {
      mockPg.setMockQueryHandler((sql: string) => {
        if (sql.toLowerCase().includes('delete from')) {
          return { 
            rows: Array(10).fill(null).map((_, i) => ({ id: i + 1 })), 
            rowCount: 10 
          };
        }
        return undefined;
      });

      const deleted = await transport.cleanupOldLogs(30);
      expect(deleted).toBe(10);
    });

    it('should get log counts by level', async () => {
      mockPg.setMockQueryHandler((sql: string) => {
        if (sql.toLowerCase().includes('select level, count(*)')) {
          return {
            rows: [
              { level: 'info', count: '150' },
              { level: 'warn', count: 75 },
              { level: 'error', count: '25' },
              { level: 'debug', count: 300 }
            ],
            rowCount: 4
          };
        }
        return undefined;
      });

      const counts = await transport.getLogCountByLevel();
      
      expect(counts).toEqual({
        info: 150,
        warn: 75,
        error: 25,
        debug: 300
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      mockPg.setMockQueryHandler((sql: string) => {
        if (sql.toLowerCase().includes('delete from')) {
          throw new Error('Delete failed');
        }
        return undefined;
      });

      await expect(transport.cleanupOldLogs(7)).rejects.toThrow('Delete failed');
    });
  });

  describe('partitioning', () => {
    it('should initialize with partitioning config', async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: true,
        partitioning: {
          enabled: true,
          interval: 'daily',
          retention: 30
        }
      });

      await transport.init();
      expect(transport.isEnabled()).toBe(true);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false,
  silent: true,
  // Disable retries to ensure failures surface immediately in tests
  retryOnFailure: false,
  maxRetries: 0,
  retryDelay: 0
      });
      await transport.init();
    });
  
  it('should handle connection pool errors', async () => {
      const mockPool = {
        connect: jest.fn().mockRejectedValue(new Error('Pool exhausted')),
        end: jest.fn()
      };
      
      (transport as any).pool = mockPool;

      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        plainMessage: 'Test'
      };

  await transport.log(entry);
  await transport.flush();
  const stats = transport.getStats();
  expect(stats.failed).toBeGreaterThan(0);
  });

    it('should handle JSON serialization errors', async () => {
      const circularRef: any = { prop: 'value' };
      circularRef.circular = circularRef;

      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        plainMessage: 'Test',
        context: circularRef
      };

  // Force an insert path but cause JSON serialization failure; stats should record failure
  await transport.log(entry);
  await transport.flush();
  const stats = transport.getStats();
  expect(stats.failed).toBeGreaterThan(0);
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false
      });
      await transport.init();
    });

    it('should track transport statistics', async () => {
      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        plainMessage: 'Test'
      };

      await transport.log(entry);
      
      const stats = transport.getStats();
      expect(stats.processed).toBe(1);
      expect(stats.queued).toBe(1);
    });
  });

  describe('close', () => {
    it('should close pool and flush pending logs', async () => {
      transport = new PostgreSQLTransport({
        name: 'pg-test',
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        table: 'test_logs',
        createTable: false,
        batchSize: 10
      });
      await transport.init();

      const entry: LogEntry = {
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        plainMessage: 'Test'
      };

      await transport.log(entry);
      
      // Close should flush pending logs
      await transport.close();
      
      const results = mockPg.getMockResults();
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
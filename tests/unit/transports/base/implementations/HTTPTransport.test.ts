// File: tests/unit/transports/base/implementations/HTTPTransport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Updated to match current HttpTransport implementation (native http/https, no axios/lib client) */
// Mocks must be declared before importing the module under test
import { EventEmitter } from 'events';
import * as httpsMod from 'https';
import * as zlibMod from 'zlib';

// Shared capture of last request
interface CapturedRequest {
  options: Record<string, unknown>;
  body?: Buffer;
  responder?: EventEmitter & { statusCode?: number; statusMessage?: string; headers: Record<string,string>; };
}
let lastRequest: CapturedRequest | undefined;
let nextResponse: { statusCode: number; statusMessage?: string; body?: string } | undefined;
function setNextResponse(r: { statusCode: number; statusMessage?: string; body?: string }) { nextResponse = r; }

// Mock zlib
jest.mock('zlib', () => ({
  gzip: jest.fn((data: Buffer|string, cb: (e: Error|null, r: Buffer)=>void) => {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    cb(null, Buffer.from('gz:' + buf.toString()));
  }),
  createGunzip: jest.fn(() => ({ on: jest.fn(), pipe: jest.fn() })),
  createInflate: jest.fn(() => ({ on: jest.fn(), pipe: jest.fn() })),
}));

interface NativeReq {
  write: (chunk: unknown) => void;
  end: () => void;
  on: jest.Mock;
  destroy: jest.Mock;
}
interface NativeRes extends EventEmitter { statusCode?: number; statusMessage?: string; headers: Record<string,string>; }

function makeHttpModule(_protocol: 'http'|'https') {
  const request = jest.fn((options: Record<string, unknown>, callback: (res: NativeRes)=>void): NativeReq => {
    const res = new EventEmitter() as NativeRes;
    res.statusCode = nextResponse?.statusCode ?? 200;
    res.statusMessage = nextResponse?.statusMessage ?? 'OK';
    res.headers = {};
    lastRequest = { options, responder: res };
    setImmediate(() => { 
      callback(res); 
      if (nextResponse?.body) res.emit('data', nextResponse.body);
      res.emit('end'); 
      nextResponse = undefined;
    });
    return {
      write: jest.fn((chunk: unknown) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
        lastRequest = lastRequest ? { ...lastRequest, body: lastRequest.body ? Buffer.concat([lastRequest.body, buf]) : buf } : { options, body: buf };
      }),
      end: jest.fn(() => undefined),
      on: jest.fn(),
      destroy: jest.fn(),
    };
  });
  const Agent = jest.fn().mockImplementation(() => ({ destroy: jest.fn() }));
  return { request, Agent };
}

jest.mock('http', () => makeHttpModule('http'));
jest.mock('https', () => makeHttpModule('https'));

describe('HTTPTransport (native)', () => {
  let HTTPTransport: any;
  let createHTTPTransport: any;
  let transport: any;
  let entry: any;

  beforeEach(async () => {
    lastRequest = undefined;
    jest.clearAllMocks();
    // Dynamically import after mocks so HttpTransport picks up mocked http/https
    ({ HTTPTransport, createHTTPTransport } = await import('../../../../../src/transports/base/implementations/HttpTransport'));

    entry = {
      id: 'id1',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Hello',
      plainMessage: 'Hello',
      loggerId: 'logger',
      tags: ['t1'],
      context: { a: 1 }
    };
    transport = new HTTPTransport({ name: 'http', url: 'https://logs.example.com/ingest' });
  });

  describe('constructor', () => {
    it('validates url', () => {
      expect(() => new HTTPTransport({ name: 'bad', url: 'not a url' as unknown as string })).toThrow('Invalid URL: not a url');
    });
    it('sets defaults', () => {
      const t = new HTTPTransport({ name: 'x', url: 'https://example.com' });
      expect(t.name).toBe('x');
    });
  });

  describe('initialization', () => {
    it('initializes and performs health check (non-fatal warnings allowed)', async () => {
      await expect(transport.init()).resolves.not.toThrow();
      expect((httpsMod as unknown as { Agent: jest.Mock }).Agent).toHaveBeenCalled();
    });
  });

  async function send(entries: any[], opts: Partial<any> = {}, afterInit?: () => void) {
    const t = new HTTPTransport({ name: 'send', url: 'https://logs.example.com/ingest', ...opts });
    await t.init();
    if (afterInit) afterInit();
    await (t as any).performNetworkRequest(entries, { entries });
    return { t };
  }

  describe('body formats', () => {
    it('formats json body (wrapper object)', async () => {
      await send([entry], { bodyFormat: 'json' });
      expect(lastRequest?.body).toBeDefined();
      const obj = JSON.parse(String(lastRequest?.body));
      expect(obj.logs).toHaveLength(1);
      expect(obj.count).toBe(1);
    });
    it('formats ndjson body', async () => {
      await send([entry, entry], { bodyFormat: 'ndjson' });
      const body = String(lastRequest?.body);
      const lines = body.trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).message).toBe('Hello');
    });
    it('formats form body', async () => {
      await send([entry], { bodyFormat: 'form' });
      const body = decodeURIComponent(String(lastRequest?.body));
      expect(body).toContain('log[0]');
      expect(body).toContain('Hello');
      expect((lastRequest?.options as { headers: Record<string,string> }).headers['Content-Type']).toMatch(/application\/x-www-form-urlencoded/);
    });
  });

  describe('authentication headers', () => {
    it('basic auth', async () => {
      await send([entry], { auth: { type: 'basic', username: 'u', password: 'p' } });
      expect((lastRequest?.options as { headers: Record<string,string> }).headers.Authorization).toMatch(/^Basic /);
    });
    it('bearer', async () => {
      await send([entry], { auth: { type: 'bearer', token: 'tok' } });
      expect((lastRequest?.options as { headers: Record<string,string> }).headers.Authorization).toBe('Bearer tok');
    });
    it('api key default header', async () => {
      await send([entry], { auth: { type: 'apikey', apiKey: 'k' } });
      expect((lastRequest?.options as { headers: Record<string,string> }).headers['X-API-Key']).toBe('k');
    });
    it('api key custom header', async () => {
      await send([entry], { auth: { type: 'apikey', apiKey: 'k', apiKeyHeader: 'X-Key' } });
      expect((lastRequest?.options as { headers: Record<string,string> }).headers['X-Key']).toBe('k');
    });
    it('custom auth function', async () => {
      await send([entry], { auth: { type: 'custom', customAuth: async () => ({ 'X-Custom': 'v1' }) } });
      expect((lastRequest?.options as { headers: Record<string,string> }).headers['X-Custom']).toBe('v1');
    });
  });

  describe('compression', () => {
    it('adds gzip headers & compresses', async () => {
      await send([entry], { compress: true, bodyFormat: 'ndjson' });
      expect((zlibMod.gzip as unknown as jest.Mock)).toHaveBeenCalled();
      expect((lastRequest?.options as { headers: Record<string,string> }).headers['Content-Encoding']).toBe('gzip');
      expect(String(lastRequest?.body)).toContain('gz:');
    });
  });

  describe('error handling', () => {
    it('propagates non-2xx status', async () => {
      await expect(send([entry], {}, () => {
        setNextResponse({ statusCode: 400, statusMessage: 'Bad Request', body: 'ERR' });
      })).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('stats & close', () => {
    it('exposes network stats and destroys agent', async () => {
      await transport.init();
      const stats = transport.getStats();
      expect(stats.custom?.connectionState).toBeDefined();
      await transport.close();
      expect((transport as unknown as { agent: { destroy: jest.Mock } }).agent.destroy).toHaveBeenCalled();
    });
  });

  describe('factory', () => {
    it('createHTTPTransport helper', () => {
      const t = createHTTPTransport({ name: 'fac', url: 'https://x.test' });
      expect(t.name).toBe('fac');
    });
  });
});
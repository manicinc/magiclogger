// File: tests/integration/optional-peers.test.ts

/**
 * S3Transport and WebSocketTransport reach the libraries package.json lists as optional peers.
 * Their unit tests replace those libraries with mocks, so nothing else shows that the versions
 * pnpm-lock.yaml resolves still work with them. These tests run the real libraries against
 * servers on this machine: S3Transport with @aws-sdk/client-s3 against an HTTP server that records
 * each request, and WebSocketTransport with the ws client against a ws server.
 */
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { S3Transport } from '../../src/transports/base/implementations/S3Transport';
import { WebSocketTransport } from '../../src/transports/base/implementations/WebSocketTransport';
import type { LogEntry } from '../../src/types/transport';

jest.unmock('fs');

interface RecordedRequest {
  method?: string;
  url?: string;
  headers: IncomingHttpHeaders;
  body: string;
}

function entryWith(message: string): LogEntry {
  return {
    id: `${Date.now()}-peers`,
    timestamp: Date.now(),
    level: 'info',
    message,
    context: { test: true },
  } as unknown as LogEntry;
}

describe('optional peers, with the real libraries', () => {
  describe('S3Transport with @aws-sdk/client-s3', () => {
    let server: Server;
    let requests: RecordedRequest[];
    const savedEndpoint = process.env.AWS_ENDPOINT_URL_S3;

    beforeEach(async () => {
      requests = [];
      server = createServer((req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk as Buffer));
        req.on('end', () => {
          requests.push({
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: Buffer.concat(chunks).toString(),
          });
          res.writeHead(200, { ETag: '"peers"' });
          res.end();
        });
      });
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
      // S3Transport takes no endpoint option; the SDK reads this variable for every S3 client.
      const { port } = server.address() as AddressInfo;
      process.env.AWS_ENDPOINT_URL_S3 = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
      if (savedEndpoint === undefined) {
        delete process.env.AWS_ENDPOINT_URL_S3;
      } else {
        process.env.AWS_ENDPOINT_URL_S3 = savedEndpoint;
      }
      // The SDK's agent keeps its socket open.
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    });

    it('checks the bucket, then uploads the entry with its metadata', async () => {
      const transport = new S3Transport({
        name: 's3',
        bucket: 'peer-logs',
        prefix: 'app/',
        region: 'us-east-1',
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
      });

      await transport.init();
      await transport.log(entryWith('through the real S3 client'));
      await transport.close();

      const head = requests.find(request => request.method === 'HEAD');
      const put = requests.find(request => request.method === 'PUT');
      expect(head?.url).toMatch(/^\/peer-logs/);
      expect(put?.url).toMatch(/^\/peer-logs\/app\/.+\.jsonl/);
      expect(put?.headers['x-amz-meta-log-transport']).toBe('magiclogger');
      expect(put?.headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=test\//);
      expect(put?.body).toContain('through the real S3 client');
      // The first import of the SDK under ts-jest and coverage takes a few seconds.
    }, 30000);
  });

  describe('WebSocketTransport with ws', () => {
    interface PeerSocket {
      on(event: 'message', listener: (data: unknown) => void): void;
      terminate(): void;
    }
    interface PeerServer {
      address(): AddressInfo;
      clients: Set<PeerSocket>;
      close(callback: () => void): void;
      on(event: 'connection', listener: (socket: PeerSocket) => void): void;
      once(event: 'listening', listener: () => void): void;
    }
    interface WsModule {
      WebSocket: unknown;
      WebSocketServer: new (options: { host: string; port: number }) => PeerServer;
    }

    // The package ships no types and @types/ws is not a dependency here.
    const ws = jest.requireActual('ws') as WsModule;
    const scope = globalThis as { WebSocket?: unknown };
    const savedWebSocket = scope.WebSocket;
    let server: PeerServer;

    beforeEach(async () => {
      // Before Node 22 a consumer assigns the ws client here, and the transport reads it here.
      scope.WebSocket = ws.WebSocket;
      server = new ws.WebSocketServer({ host: '127.0.0.1', port: 0 });
      await new Promise<void>(resolve => server.once('listening', resolve));
    });

    afterEach(async () => {
      scope.WebSocket = savedWebSocket;
      server.clients.forEach(socket => socket.terminate());
      await new Promise<void>(resolve => server.close(resolve));
    });

    it('connects and sends the entry as a logs message', async () => {
      const received = new Promise<string>(resolve => {
        server.on('connection', socket => {
          socket.on('message', data => resolve(String(data)));
        });
      });
      const transport = new WebSocketTransport({
        name: 'ws',
        url: `ws://127.0.0.1:${server.address().port}`,
      });

      await transport.init();
      await transport.log(entryWith('through the real ws client'));
      const message = JSON.parse(await received) as {
        type: string;
        entries: Array<{ message: string }>;
      };
      await transport.close();

      expect(message.type).toBe('logs');
      expect(message.entries[0].message).toBe('through the real ws client');
    });
  });
});

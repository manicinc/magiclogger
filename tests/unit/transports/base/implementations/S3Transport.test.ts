// File: tests/unit/transports/base/implementations/S3Transport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'a1b2c3d4e5f6789012345678'),
  })),
}));

// Mock zlib
jest.mock('zlib', () => ({
  gzip: jest.fn((data: Buffer | string, cb: (e: Error | null, r: Buffer) => void) => {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    cb(null, Buffer.from('gzip:' + buf.toString()));
  }),
}));

// Mock AWS SDK
const mockSend = jest.fn();
const mockS3Client = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));

const mockPutObjectCommand = jest.fn();
const mockHeadBucketCommand = jest.fn();
const mockListObjectsV2Command = jest.fn();
const mockDeleteObjectsCommand = jest.fn();

jest.mock(
  '@aws-sdk/client-s3',
  () => ({
    S3Client: mockS3Client,
    PutObjectCommand: mockPutObjectCommand,
    HeadBucketCommand: mockHeadBucketCommand,
    ListObjectsV2Command: mockListObjectsV2Command,
    DeleteObjectsCommand: mockDeleteObjectsCommand,
  }),
  { virtual: true }
);

describe('S3Transport', () => {
  let S3Transport: any;
  let transport: any;
  let entry: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockSend.mockResolvedValue({ ETag: '"etag123"', VersionId: 'v1' });

    // Dynamic import after mocks
    ({ S3Transport } = await import(
      '../../../../../src/transports/base/implementations/S3Transport'
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

  describe('constructor', () => {
    it('creates transport with required options', () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      expect(transport.name).toBe('s3');
    });

    it('accepts region configuration', () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        region: 'eu-west-1',
      });
      expect(transport.name).toBe('s3');
    });

    it('accepts credentials', () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        credentials: {
          accessKeyId: 'key',
          secretAccessKey: 'secret',
          sessionToken: 'token',
        },
      });
      expect(transport.name).toBe('s3');
    });

    it('accepts storage class configuration', () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        storageClass: 'GLACIER',
      });
      expect(transport.name).toBe('s3');
    });

    it('accepts encryption configuration', () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        encryption: {
          type: 'KMS',
          kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/12345678',
        },
      });
      expect(transport.name).toBe('s3');
    });

    it('accepts custom key generator', () => {
      const keyGen = (entries: any[]) => `custom-${entries[0].id}.log`;
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyStrategy: 'custom',
        keyGenerator: keyGen,
      });
      expect(transport.name).toBe('s3');
    });
  });

  describe('connection', () => {
    beforeEach(() => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        region: 'us-east-1',
      });
    });

    it('initializes S3 client', async () => {
      await transport.init();

      expect(mockS3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
      expect(mockHeadBucketCommand).toHaveBeenCalledWith({ Bucket: 'my-logs' });
      expect(mockSend).toHaveBeenCalled();
    });

    it('initializes with credentials', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        credentials: {
          accessKeyId: 'key',
          secretAccessKey: 'secret',
        },
      });

      await transport.init();

      expect(mockS3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'key',
          secretAccessKey: 'secret',
          sessionToken: undefined,
        },
      });
    });

    it('handles bucket check failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Bucket not found'));

      await expect(transport.init()).rejects.toThrow('S3 connection failed');
    });
  });

  describe('key generation', () => {
    it('generates timestamp-based keys', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyStrategy: 'timestamp',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Key).toMatch(/^\d+-[a-f0-9]{8}\.json$/);
    });

    it('generates date-hierarchy keys', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyStrategy: 'date-hierarchy',
        prefix: 'logs/',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Key).toMatch(
        /^logs\/year=\d{4}\/month=\d{2}\/day=\d{2}\/\d+-[a-f0-9]{8}\.json$/
      );
    });

    it('generates hourly keys', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyStrategy: 'hourly',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Key).toMatch(
        /^year=\d{4}\/month=\d{2}\/day=\d{2}\/hour=\d{2}\/\d+-[a-f0-9]{8}\.json$/
      );
    });

    it('uses custom key generator', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyGenerator: (entries: any[]) => `custom/${entries[0].level}/${entries[0].id}.log`,
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Key).toBe('custom/info/test-id.log');
    });

    it('throws error for custom strategy without generator', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        keyStrategy: 'custom',
      });
      await transport.init();

      await expect(transport.log(entry)).rejects.toThrow(
        'Custom key strategy requires keyGenerator'
      );
    });

    it('adds compression extension to keys', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        compress: true,
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Key).toMatch(/\.json\.gz$/);
    });
  });

  describe('file formats', () => {
    it('formats as JSON', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        fileFormat: 'json',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      const body = command.Body.toString();
      const parsed = JSON.parse(body);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].message).toBe('Test message');
      expect(command.ContentType).toBe('application/json');
    });

    it('formats as JSONL', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        fileFormat: 'jsonl',
      });
      await transport.init();

      const entries = [entry, { ...entry, id: 'test-id-2' }];
      await transport.logBatch(entries);

      const command = mockPutObjectCommand.mock.calls[0][0];
      const body = command.Body.toString();
      const lines = body.trim().split('\n');

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).id).toBe('test-id');
      expect(JSON.parse(lines[1]).id).toBe('test-id-2');
      expect(command.ContentType).toBe('application/json');
    });

    it('formats as CSV', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        fileFormat: 'csv',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      const body = command.Body.toString();
      const lines = body.trim().split('\n');

      expect(lines[0]).toContain('id,timestamp'); // Header row
      expect(lines[1]).toContain('test-id');
      expect(command.ContentType).toBe('text/csv');
    });

    it('handles CSV escaping', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        fileFormat: 'csv',
      });
      await transport.init();

      const entryWithComma = {
        ...entry,
        message: 'Test, with comma',
        context: { value: 'Quote"Test' },
      };

      await transport.log(entryWithComma);

      const command = mockPutObjectCommand.mock.calls[0][0];
      const body = command.Body.toString();
      const lines = body.trim().split('\n');

      expect(lines[1]).toContain('"Test, with comma"');
      expect(lines[1]).toContain('Quote""Test'); // Escaped quotes
    });

    it('throws error for parquet format', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        fileFormat: 'parquet',
      });
      await transport.init();

      await expect(transport.log(entry)).rejects.toThrow(
        'Parquet format requires additional dependencies'
      );
    });
  });

  describe('compression', () => {
    it('compresses with gzip', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        compress: true,
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Body.toString()).toContain('gzip:');
      expect(command.ContentEncoding).toBe('gzip');
    });

    it('does not compress when disabled', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        compress: false,
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Body.toString()).not.toContain('gzip:');
      expect(command.ContentEncoding).toBeUndefined();
    });
  });

  describe('encryption', () => {
    it('applies AES256 encryption', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        encryption: { type: 'AES256' },
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.ServerSideEncryption).toBe('AES256');
    });

    it('applies KMS encryption', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        encryption: {
          type: 'KMS',
          kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/12345678',
        },
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.ServerSideEncryption).toBe('aws:kms');
      expect(command.SSEKMSKeyId).toBe('arn:aws:kms:us-east-1:123456789012:key/12345678');
    });
  });

  describe('metadata and tags', () => {
    it('adds metadata to objects', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Metadata['log-count']).toBe('1');
      expect(command.Metadata['log-format']).toBe('jsonl');
      expect(command.Metadata['log-transport']).toBe('magiclogger');
      expect(command.Metadata['log-version']).toBe('1.0');
    });

    it('adds object tags', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        objectTags: {
          Environment: 'production',
          Application: 'api',
        },
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Tagging).toBe('Environment=production&Application=api');
    });

    it('URL encodes tag values', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        objectTags: {
          'Key With Spaces': 'Value=With&Special',
        },
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Tagging).toBe('Key%20With%20Spaces=Value%3DWith%26Special');
    });
  });

  describe('storage class', () => {
    it('uses STANDARD by default', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.StorageClass).toBe('STANDARD');
    });

    it('applies custom storage class', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        storageClass: 'GLACIER_IR',
      });
      await transport.init();

      await transport.log(entry);

      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.StorageClass).toBe('GLACIER_IR');
    });
  });

  describe('batch operations', () => {
    beforeEach(async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();
    });

    it('uploads batch of entries', async () => {
      const entries = [entry, { ...entry, id: 'test-id-2' }, { ...entry, id: 'test-id-3' }];

      await transport.logBatch(entries);

      expect(mockPutObjectCommand).toHaveBeenCalledTimes(1);
      const command = mockPutObjectCommand.mock.calls[0][0];
      expect(command.Metadata['log-count']).toBe('3');
    });

    it('emits upload event with details', async () => {
      const uploadHandler = jest.fn();
      transport.on('uploaded', uploadHandler);

      await transport.log(entry);

      expect(uploadHandler).toHaveBeenCalledWith({
        bucket: 'my-logs',
        key: expect.any(String),
        etag: '"etag123"',
        versionId: 'v1',
        size: expect.any(Number),
        entries: 1,
      });
    });
  });

  describe('listObjects', () => {
    beforeEach(async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
        prefix: 'logs/',
      });
      await transport.init();
    });

    it('lists objects with prefix', async () => {
      mockSend.mockResolvedValueOnce({
        Contents: [
          { Key: 'logs/file1.json', Size: 1024, LastModified: new Date() },
          { Key: 'logs/file2.json', Size: 2048, LastModified: new Date() },
        ],
      });

      const objects = await transport.listObjects({
        prefix: '2024/',
        maxKeys: 100,
      });

      expect(mockListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'my-logs',
        Prefix: 'logs/2024/',
        MaxKeys: 100,
      });
      expect(objects).toHaveLength(2);
      expect(objects[0].Key).toBe('logs/file1.json');
    });

    it('handles continuation token', async () => {
      mockSend.mockResolvedValueOnce({ Contents: [] });

      await transport.listObjects({
        continuationToken: 'token123',
      });

      expect(mockListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'my-logs',
        Prefix: 'logs/',
        MaxKeys: 1000,
        ContinuationToken: 'token123',
      });
    });
  });

  describe('deleteObjects', () => {
    beforeEach(async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();
    });

    it('deletes objects by key', async () => {
      const keys = ['logs/file1.json', 'logs/file2.json'];

      await transport.deleteObjects(keys);

      expect(mockDeleteObjectsCommand).toHaveBeenCalledWith({
        Bucket: 'my-logs',
        Delete: {
          Objects: [{ Key: 'logs/file1.json' }, { Key: 'logs/file2.json' }],
        },
      });
    });

    it('handles batch deletion for large lists', async () => {
      // Create 2500 keys (requires 3 batches)
      const keys = Array.from({ length: 2500 }, (_, i) => `logs/file${i}.json`);

      await transport.deleteObjects(keys);

      // Should be called 3 times (1000 + 1000 + 500)
      expect(mockDeleteObjectsCommand).toHaveBeenCalledTimes(3);
    });

    it('handles empty key list', async () => {
      await transport.deleteObjects([]);

      expect(mockDeleteObjectsCommand).not.toHaveBeenCalled();
    });
  });

  describe('health check', () => {
    beforeEach(async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();
    });

    it('performs health check via HeadBucket', async () => {
      const healthy = await transport.isHealthy();

      expect(mockHeadBucketCommand).toHaveBeenCalledWith({ Bucket: 'my-logs' });
      expect(healthy).toBe(true);
    });

    it('reports unhealthy on bucket check failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Bucket not accessible'));

      const healthy = await transport.isHealthy();

      expect(healthy).toBe(false);
    });
  });

  describe('close', () => {
    it('closes S3 transport', async () => {
      transport = new S3Transport({
        name: 's3',
        bucket: 'my-logs',
      });
      await transport.init();

      await transport.close();

      // S3 doesn't require explicit close, just clears client
      expect(transport.name).toBe('s3');
    });
  });
});

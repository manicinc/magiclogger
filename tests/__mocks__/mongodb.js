// Explicit MongoDB mock relocated from project root __mocks__ to tests/__mocks__
// Using explicit jest.mock call in jest.setup.ts for clarity and scoping.
// Core operation mocks
const mockInsertMany = jest.fn(async (docs = []) => ({ insertedCount: Array.isArray(docs) ? docs.length : 0 }));
const mockCreateIndexes = jest.fn(async (_indexes = []) => undefined);
const mockFind = jest.fn(() => mockCursor);
const mockDeleteMany = jest.fn(async () => ({ deletedCount: 0 }));
const mockAggregate = jest.fn(() => mockCursor);
const mockWatch = jest.fn(() => ({ close: jest.fn() }));
const mockPing = jest.fn(async () => undefined);
const mockConnect = jest.fn(async () => undefined);
const mockClose = jest.fn(async () => undefined);

const mockCursor = {
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  project: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
};

const mockCollection = {
  insertMany: mockInsertMany,
  createIndexes: mockCreateIndexes,
  find: mockFind,
  deleteMany: mockDeleteMany,
  aggregate: mockAggregate,
  watch: mockWatch,
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
  admin: jest.fn(() => ({
    ping: mockPing,
  })),
};

const mockClient = {
  connect: mockConnect,
  close: mockClose,
  db: jest.fn(() => mockDb),
};

const MockMongoClient = jest.fn().mockImplementation(() => mockClient);

module.exports = {
  MongoClient: MockMongoClient,
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
  mockCollection,
  mockDb,
  mockClient,
  MockMongoClient
};

const mockInsertMany = jest.fn();
const mockCreateIndexes = jest.fn();
const mockFind = jest.fn();
const mockDeleteMany = jest.fn();
const mockAggregate = jest.fn();
const mockWatch = jest.fn();
const mockPing = jest.fn();
const mockConnect = jest.fn();
const mockClose = jest.fn();

const mockCursor = {
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  project: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([])
};

const mockCollection = {
  insertMany: mockInsertMany,
  createIndexes: mockCreateIndexes,
  find: mockFind.mockReturnValue(mockCursor),
  deleteMany: mockDeleteMany,
  aggregate: mockAggregate.mockReturnValue(mockCursor),
  watch: mockWatch
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
  admin: jest.fn().mockReturnValue({
    ping: mockPing
  })
};

const mockClient = {
  connect: mockConnect,
  close: mockClose,
  db: jest.fn().mockReturnValue(mockDb)
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

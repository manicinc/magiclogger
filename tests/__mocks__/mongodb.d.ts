// Type declarations for MongoDB mock
declare module 'mongodb' {
  export const MockMongoClient: unknown;
  export const mockInsertMany: jest.Mock;
  export const mockCreateIndexes: jest.Mock;
  export const mockFind: jest.Mock;
  export const mockDeleteMany: jest.Mock;
  export const mockAggregate: jest.Mock;
  export const mockWatch: jest.Mock;
  export const mockPing: jest.Mock;
  export const mockConnect: jest.Mock;
  export const mockClose: jest.Mock;
}

// Type declarations for optional mongodb dependency
// These are stub types to allow TypeScript compilation when mongodb is not installed

declare module 'mongodb' {
  export class MongoClient {
    constructor(uri: string, options?: MongoClientOptions);
    connect(): Promise<MongoClient>;
    close(): Promise<void>;
    db(dbName?: string): Db;
  }

  export interface Db {
    collection<T = Document>(name: string): Collection<T>;
  }

  export interface Collection<T = Document> {
    insertOne(doc: T): Promise<InsertOneResult>;
    insertMany(docs: T[]): Promise<BulkWriteResult>;
    find(filter?: Record<string, unknown>): FindCursor<T>;
    findOne(filter?: Record<string, unknown>): Promise<T | null>;
    updateOne(
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options?: Record<string, unknown>
    ): Promise<UpdateResult>;
    deleteOne(filter: Record<string, unknown>): Promise<DeleteResult>;
    deleteMany(filter: Record<string, unknown>): Promise<DeleteResult>;
  }

  export interface MongoClientOptions {
    [key: string]: unknown;
  }

  export interface InsertOneResult {
    acknowledged: boolean;
    insertedId: unknown;
  }

  export interface BulkWriteResult {
    acknowledged: boolean;
    insertedCount: number;
    insertedIds: { [key: number]: unknown };
  }

  export interface Document {
    [key: string]: unknown;
  }

  export interface FindCursor<T> {
    toArray(): Promise<T[]>;
  }

  export interface UpdateResult {
    acknowledged: boolean;
    modifiedCount: number;
    matchedCount: number;
  }

  export interface DeleteResult {
    acknowledged: boolean;
    deletedCount: number;
  }
}

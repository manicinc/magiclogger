// Type declarations for optional mongodb dependency
// These are stub types to allow TypeScript compilation when mongodb is not installed

declare module 'mongodb' {
  export class MongoClient {
    constructor(uri: string, options?: any);
    connect(): Promise<MongoClient>;
    close(): Promise<void>;
    db(dbName?: string): Db;
  }

  export interface Db {
    collection<T = any>(name: string): Collection<T>;
  }

  export interface Collection<T = any> {
    insertOne(doc: T): Promise<any>;
    insertMany(docs: T[]): Promise<any>;
    find(filter?: any): any;
    findOne(filter?: any): Promise<T | null>;
    updateOne(filter: any, update: any, options?: any): Promise<any>;
    deleteOne(filter: any): Promise<any>;
    deleteMany(filter: any): Promise<any>;
  }

  export interface MongoClientOptions {
    [key: string]: any;
  }

  export interface InsertOneResult {
    acknowledged: boolean;
    insertedId: any;
  }

  export interface BulkWriteResult {
    acknowledged: boolean;
    insertedCount: number;
    insertedIds: { [key: number]: any };
  }
}

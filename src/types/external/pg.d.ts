// Minimal ambient declaration for optional 'pg' module to support dynamic import without bundling.
// This keeps the dependency optional and avoids TypeScript resolution errors when not installed.
declare module 'pg' {
  export class Pool {
    constructor(config: Record<string, unknown>);
    connect(): Promise<{
      query: (
        text: string,
        params?: unknown[]
      ) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number }>;
      release: () => void;
    }>;
    end(): Promise<void>;
  }
}

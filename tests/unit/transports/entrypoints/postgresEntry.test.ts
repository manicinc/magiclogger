// File: tests/unit/transports/entrypoints/postgresEntry.test.ts

describe('PostgreSQL transport entrypoint', () => {
  it('exports PostgreSQLTransport and options type', async () => {
    const mod = await import('../../../../src/transports/postgresql');
    expect(mod.PostgreSQLTransport).toBeDefined();
  });
});

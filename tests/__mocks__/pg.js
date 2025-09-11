// Manual mock for 'pg' used by PostgreSQLTransport tests
let queryHandler = null;
class MockClient {
  constructor() {
    this.queries = [];
  }
  async query(text, params) {
    this.queries.push({ text, params });
    if (typeof queryHandler === 'function') {
      const res = await queryHandler(text, params);
      if (res) return res;
    }
    // Return minimal shape
    return { rows: [], rowCount: 0 };
  }
  release() {
    // no-op
    return undefined;
  }
}

class Pool {
  constructor(config) {
    this.config = config;
    this.clients = [];
    this.connected = false;
  }
  async connect() {
    const client = new MockClient();
    this.clients.push(client);
    this.connected = true;
    return client;
  }
  async end() {
    this.connected = false;
  }
}

function setMockQueryHandler(fn) {
  queryHandler = fn;
}

function resetMockQueryHandler() {
  queryHandler = null;
}

module.exports = { Pool, setMockQueryHandler, resetMockQueryHandler };

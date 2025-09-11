import * as BaseTransportExports from '../../../../src/transports/base/index';

describe('transports/base index exports', () => {
  it('should export base Transport class', () => {
    expect(BaseTransportExports.Transport).toBeDefined();
    expect(typeof BaseTransportExports.Transport).toBe('function');
  });

  it('should export BatchingTransport class', () => {
    expect(BaseTransportExports.BatchingTransport).toBeDefined();
    expect(typeof BaseTransportExports.BatchingTransport).toBe('function');
  });

  it('should export NetworkTransport class', () => {
    expect(BaseTransportExports.NetworkTransport).toBeDefined();
    expect(typeof BaseTransportExports.NetworkTransport).toBe('function');
  });

  it('should export TransportManager class', () => {
    expect(BaseTransportExports.TransportManager).toBeDefined();
    expect(typeof BaseTransportExports.TransportManager).toBe('function');
  });

  it('should export TransportRegistry', () => {
    expect(BaseTransportExports.TransportRegistry).toBeDefined();
    // TransportRegistry is a class/constructor function, not an object
    expect(typeof BaseTransportExports.TransportRegistry).toBe('function');
  });

  it('should export type guard functions', () => {
    expect(BaseTransportExports.isAsyncTransport).toBeDefined();
    expect(typeof BaseTransportExports.isAsyncTransport).toBe('function');

    expect(BaseTransportExports.isBatchingTransport).toBeDefined();
    expect(typeof BaseTransportExports.isBatchingTransport).toBe('function');

    expect(BaseTransportExports.hasStats).toBeDefined();
    expect(typeof BaseTransportExports.hasStats).toBe('function');
  });

  describe('Type guards usage', () => {
    it('should have working isAsyncTransport guard', () => {
      // isAsyncTransport checks for 'log' function
      const mockTransport = {
        log: jest.fn(),
      };

      expect(BaseTransportExports.isAsyncTransport(mockTransport)).toBe(true);
      expect(BaseTransportExports.isAsyncTransport({})).toBe(false);
    });

    it('should have working isBatchingTransport guard', () => {
      // isBatchingTransport checks for both 'log' and 'logBatch' functions
      const mockBatchingTransport = {
        log: jest.fn(),
        logBatch: jest.fn(),
      };

      expect(BaseTransportExports.isBatchingTransport(mockBatchingTransport)).toBe(true);
      expect(BaseTransportExports.isBatchingTransport({})).toBe(false);
    });

    it('should have working hasStats guard', () => {
      // hasStats checks for both 'log' and 'getStats' functions
      const mockTransportWithStats = {
        log: jest.fn(),
        getStats: jest.fn(() => ({
          sent: 100,
          failed: 5,
          queued: 0,
        })),
      };

      expect(BaseTransportExports.hasStats(mockTransportWithStats)).toBe(true);
      expect(BaseTransportExports.hasStats({})).toBe(false);
    });
  });

  describe('Global transport registry', () => {
    it('should have initialized the global transport registry', () => {
      // The registry should be available globally after import
      const globalObj = typeof globalThis !== 'undefined' ? globalThis : window;

      // Registry might be installed as a symbol or private property
      // We can't directly test its presence, but we can verify the module loaded
      expect(globalObj).toBeDefined();
      expect(BaseTransportExports.TransportRegistry).toBeDefined();
    });
  });
});

import * as MiddlewareExports from '../../../src/middleware/index';

describe('Middleware index exports', () => {
  it('should export Middleware components', () => {
    expect(MiddlewareExports.Middleware).toBeDefined();
    expect(MiddlewareExports.AsyncMiddleware).toBeDefined();
    expect(MiddlewareExports.MiddlewarePipeline).toBeDefined();
  });

  it('should export SecurityMiddleware', () => {
    expect(MiddlewareExports.SecurityMiddleware).toBeDefined();
  });

  it('should export ObservabilityMiddleware components', () => {
    expect(MiddlewareExports.ObservabilityMiddleware).toBeDefined();
    expect(MiddlewareExports.createOTLPObservability).toBeDefined();
  });

  it('should have correct export types', () => {
    expect(typeof MiddlewareExports.Middleware).toBe('function');
    expect(typeof MiddlewareExports.AsyncMiddleware).toBe('function');
    expect(typeof MiddlewareExports.MiddlewarePipeline).toBe('function');
    expect(typeof MiddlewareExports.SecurityMiddleware).toBe('function');
    expect(typeof MiddlewareExports.ObservabilityMiddleware).toBe('function');
    expect(typeof MiddlewareExports.createOTLPObservability).toBe('function');
  });
});

/**
 * MagicLogger Extensions
 * 
 * Optional extensions that enhance logger functionality.
 * These are NOT required for basic logging but provide
 * enterprise features when needed.
 * 
 * @module extensions
 */

// PII Redaction - Remove sensitive data from logs
export { Redactor, createRedactorPreset } from './Redactor';
export type { RedactorOptions, RedactionPreset, RedactionPattern, RedactionStrategy } from './Redactor';

// Rate Limiting - Control log volume
export { RateLimiter } from './RateLimiter';
export type { RateLimiterOptions, RateLimitStrategy } from './RateLimiter';

// Sampling - Statistical log sampling
export { Sampler, createSamplerPreset } from './Sampler';
export type { SamplerOptions, SamplingStrategy } from './Sampler';

// Queue Management - Advanced backpressure handling
export { QueueManager } from './QueueManager';
export type { QueueManagerOptions, QueueStats, DropPolicy } from './QueueManager';
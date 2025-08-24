#!/usr/bin/env tsx
// cspell:words Backpressured

/**
 * MagicLogger Integrated Async Logger Demo
 *
 * This example demonstrates the full integration of operational utilities
 * (QueueManager, RateLimiter, Redactor, Sampler) with AsyncLogger for
 * production-ready logging with backpressure handling.
 */

import {
  // Core logging
  AsyncLogger,
  createAsyncLogger,
  createSyncLogger,

  // Operational utilities
  QueueManager,
  RateLimiter,
  Redactor,
  Sampler,

  // Utility presets
  createRedactorPreset,
  createSamplerPreset,

  // Types
  type LogEntry,
  type AddResult,
} from '../dist/index.js';

// Console transport for demonstration - import from transports to ensure type compatibility
// Import transport directly from its module to ensure a single Transport base
import { ConsoleTransport } from '../dist/transports.js';

async function demonstrateIntegratedAsyncLogger() {
  // Touch symbols so lint doesn't flag demo-only imports as unused
  // These no-ops don't change behavior but ensure examples validate with strict lint rules
  void Sampler; // reference class value
  void createRedactorPreset; // reference helper factory
  const _typeNoop = (_e: LogEntry | AddResult | undefined): void => undefined;
  _typeNoop(undefined);
  console.log('🚀 MagicLogger Integrated AsyncLogger Demo\n');

  // ===========================================
  // 1. SIMPLE UNIFIED IMPORT APPROACH
  // ===========================================

  console.log('📦 1. Simple Unified Import Approach');

  // Users can now import everything from the main entry point
  const basicAsyncLogger = createAsyncLogger({
    buffer: {
      size: 1000,
      flushInterval: 100,
      flushSize: 50,
    },

    // Built-in utilities with simple configuration
    redactor: { preset: 'strict' },
    rateLimiter: { max: 100, window: 60000, strategy: 'sliding' },
    sampler: { rate: 0.5, strategy: 'deterministic' },

    // Observability
    onMetrics: metrics => {
      console.log(`📊 Metric: ${metrics.type}, Count: ${metrics.count || 'N/A'}`);
    },

    // Simple flush handler
    onFlush: async entries => {
      console.log(`✅ Flushed ${entries.length} entries`);
      // In real usage: await transport.sendBatch(entries);
    },
  });

  // Test with various log levels - should see redaction and sampling in action
  console.log('\n🧪 Testing basic async logger...');

  const testMessages = [
    'User login with email: john.doe@example.com',
    'Processing credit card: 4532-1234-5678-9012',
    'API key used: sk_test_abc123def456ghi789jkl',
    'Database connection successful',
    'Error: Authentication failed for user with SSN: 123-45-6789',
  ];

  for (const message of testMessages) {
    const result = basicAsyncLogger.info(message);
    if (!result.success) {
      console.log(`❌ Message dropped: ${result.reason}`);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 200)); // Wait for flush

  // ===========================================
  // 2. ADVANCED CONFIGURATION WITH INSTANCES
  // ===========================================

  console.log('\n🔧 2. Advanced Configuration with Pre-configured Instances');

  // Create utility instances with advanced configuration
  const redactor = new Redactor({
    preset: 'paranoid',
    auditTrail: true,
    patterns: [
      {
        name: 'custom-api-key',
        pattern: /api_key_[a-zA-Z0-9]{32}/g,
        replacement: 'api_key_***',
        strategy: 'mask',
      },
    ],
  });

  const rateLimiter = new RateLimiter({
    max: 1000,
    window: 60000,
    strategy: 'sliding', // 'adaptive' not available; use a supported strategy
    keyFn: entry => entry.level, // Rate limit per level
    onLimit: (key, dropped) => {
      console.log(`🚦 Rate limit hit for ${key}: ${dropped} entries dropped`);
    },
  });

  const sampler = createSamplerPreset('production'); // 10% sampling

  const queueManager = new QueueManager({
    maxSize: 5000,
    dropPolicy: 'priority',
    priorityFn: entry => (entry.level === 'error' ? 10 : entry.level === 'warn' ? 5 : 1),
    onDrop: (entries, reason) => {
      console.log(`📤 Queue dropped ${entries.length} entries due to ${reason}`);
    },
    highWaterMark: 0.8,
    lowWaterMark: 0.3,
  });

  const advancedAsyncLogger = new AsyncLogger(
    {
      buffer: {
        size: 8192,
        flushInterval: 50,
        flushSize: 100,
      },

      // Use pre-configured instances
      redactor,
      rateLimiter,
      sampler,
      queueManager,

      // Advanced options
      fallbackToSync: true,
      flushOnHighWater: true,

      // Enhanced observability
      onMetrics: metrics => {
        console.log(`📈 Advanced Metric [${metrics.type}]:`, metrics);
      },

      onFlush: async entries => {
        // Simulate transport processing
        console.log(`🚛 Processing batch of ${entries.length} entries...`);
        await new Promise(resolve => setTimeout(resolve, 10));
        console.log(`✨ Batch processed successfully`);
      },
    },
    (level, message, meta) => ({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      context: meta,
    })
  );

  console.log('\n🧪 Testing advanced async logger...');

  // Test high-volume logging to trigger backpressure
  const promises: Promise<AddResult>[] = [];

  for (let i = 0; i < 20; i++) {
    promises.push(
      Promise.resolve(
        advancedAsyncLogger.info(`High volume message ${i} with PII: john@example.com`)
      )
    );
    promises.push(
      Promise.resolve(
        advancedAsyncLogger.warn(`Warning ${i} with credit card: 4111-1111-1111-1111`)
      )
    );
    promises.push(
      Promise.resolve(advancedAsyncLogger.error(`Error ${i} with API key: sk_live_abc123def456`))
    );
  }

  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const dropped = results.filter(r => !r.success).length;

  console.log(`📊 Results: ${successful} successful, ${dropped} dropped`);

  // ===========================================
  // 3. BACKPRESSURE AND CRITICAL LOGGING
  // ===========================================

  console.log('\n⚡ 3. Backpressure Handling & Critical Logging');

  // Test backpressure detection
  if (advancedAsyncLogger.isBackpressured()) {
    console.log('🔴 Logger is under backpressure!');
  } else {
    console.log('🟢 Logger is operating normally');
  }

  // Critical logging that waits for availability
  try {
    console.log('🚨 Attempting critical log...');
    await advancedAsyncLogger.logCritical('error', 'CRITICAL: System failure detected!', {
      component: 'database',
      error: 'Connection pool exhausted',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Critical log succeeded');
  } catch (error) {
    console.error('❌ Critical log failed:', error);
  }

  // ===========================================
  // 4. STATISTICS AND MONITORING
  // ===========================================

  console.log('\n📊 4. Statistics and Monitoring');

  // Get comprehensive statistics
  const stats = advancedAsyncLogger.getStats();
  console.log('Buffer Stats:', {
    size: stats.buffer.size,
    utilization: `${Math.round(stats.buffer.utilization * 100)}%`,
    totalFlushed: stats.buffer.metrics?.totalFlushed || 0,
    totalDropped: stats.buffer.metrics?.totalDropped || 0,
  });

  // Buffer-focused stats since we use main-thread processing
  console.log('Processing: Direct main-thread batching with microtasks and timers');

  // Get utility statistics
  console.log('Rate Limiter Stats:', rateLimiter.getStats());
  console.log('Redactor Stats:', redactor.getStats());
  console.log('Sampler Stats:', sampler.getStats());
  console.log('Queue Stats:', queueManager.getStats());

  const dropStats = advancedAsyncLogger.getDropStats();
  console.log('Drop Stats:', dropStats);

  // ===========================================
  // 5. SEAMLESS LOGGER INTEGRATION
  // ===========================================

  console.log('\n🔗 5. Seamless Logger Integration');

  // Demonstrate that regular Logger can also use the utilities
  const regularLogger = createSyncLogger({
    id: 'integrated-logger',

    // Same utility integration!
    redactor: { preset: 'standard' },
    rateLimiter: { max: 50, window: 30000 },
    sampler: { rate: 1.0 }, // No sampling for regular logger
  });
  regularLogger.addTransport(new ConsoleTransport({}));

  console.log('📝 Regular logger with integrated utilities:');
  regularLogger.info('Regular log with email: jane@company.com and card: 5555-5555-5555-4444');

  // ===========================================
  // CLEANUP
  // ===========================================

  console.log('\n🧹 Cleaning up...');

  // Proper shutdown sequence
  await advancedAsyncLogger.flushAndWait();
  await advancedAsyncLogger.close();
  await basicAsyncLogger.flushAndWait();
  await basicAsyncLogger.close();

  console.log('✅ Demo completed successfully!');
  console.log('\n📚 Key Benefits Demonstrated:');
  console.log('  • Unified imports from single entry point');
  console.log('  • Seamless utility integration in both sync and async loggers');
  console.log('  • Explicit backpressure handling with AddResult');
  console.log('  • Production-ready operational features');
  console.log('  • Comprehensive observability and statistics');
  console.log('  • Graceful degradation and fallback mechanisms');
}

// Run the demo
if (require.main === module) {
  demonstrateIntegratedAsyncLogger().catch(console.error);
}

export { demonstrateIntegratedAsyncLogger };

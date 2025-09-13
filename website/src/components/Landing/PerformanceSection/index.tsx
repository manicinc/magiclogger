// File: website/src/components/Landing/PerformanceSection/index.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const benchmarks = {
  sync: {
    title: 'Synchronous Performance',
    description: 'Direct logging throughput - immediate output for development',
    data: [
      { name: 'Winston (Plain)', value: 253133, percentage: 100, color: '#fee140' },
      { name: 'Winston (Sync + Styled)', value: 196214, percentage: 77, color: '#ffd700' },
      { name: 'MagicLogger (Sync)', value: 176452, percentage: 70, color: '#667eea' },
      { name: 'Pino (Manual ANSI)', value: 71232, percentage: 28, color: '#4facfe' },
      { name: 'MagicLogger (Sync + Styles)', value: 29005, percentage: 11, color: '#9945ff' }
    ]
  },
  async: {
    title: 'Async Performance',
    description: 'Production performance with real file I/O',
    data: [
      { name: 'Pino', value: 248414, percentage: 100, color: '#4facfe' },
      { name: 'Pino (Manual ANSI Async)', value: 228100, percentage: 92, color: '#40a9ff' },
      { name: 'MagicLogger (Async)', value: 203385, percentage: 82, color: '#667eea' },
      { name: 'Pino (Pretty)', value: 186048, percentage: 75, color: '#1890ff' },
      { name: 'MagicLogger (Async + Styles)', value: 31138, percentage: 13, color: '#9945ff' }
    ]
  },
  bundle: {
    title: 'Bundle Size',
    description: 'Minified + Gzipped - what your users download',
    data: [
      { name: 'MagicLogger Core', value: 43.3, percentage: 100, color: '#667eea', unit: 'KB' },
      { name: 'MagicLogger + Console', value: 43.3, percentage: 100, color: '#9945ff', unit: 'KB' },
      { name: 'MagicLogger + Transports', value: 47.4, percentage: 91, color: '#00d4ff', unit: 'KB' },
      { name: 'Pino', value: 25, percentage: 173, color: '#4facfe', unit: 'KB' },
      { name: 'Bunyan', value: 65, percentage: 67, color: '#fa709a', unit: 'KB' },
      { name: 'Winston', value: 180, percentage: 24, color: '#fee140', unit: 'KB' }
    ]
  }
};

export default function PerformanceSection() {
  const [activeMetric, setActiveMetric] = useState('sync');
  const currentBenchmark = benchmarks[activeMetric];

  return (
    <section className={styles.performanceSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Performance that matters
          </Heading>
          <p className={styles.sectionSubtitle}>
            Benchmarked against the best, optimized for real-world use
          </p>
        </div>

        {/* Metric selector */}
        <div className={styles.metricSelector}>
          {Object.entries(benchmarks).map(([key, benchmark]) => (
            <button
              key={key}
              className={clsx(
                styles.metricButton,
                activeMetric === key && styles.active
              )}
              onClick={() => setActiveMetric(key)}>
              <span className={styles.metricIcon}>
                {key === 'sync' ? '' : key === 'async' ? '' : ''}
              </span>
              <span>{benchmark.title}</span>
            </button>
          ))}
        </div>

        {/* Performance Note */}
        <div className={styles.performanceNote}>
          <strong>📊 Note:</strong> MagicLogger is currently in pre-1.0 development. Performance optimizations are on the roadmap for future releases, with significant improvements expected as we approach v1.0. The current focus is on API stability and feature completeness.
        </div>

        {/* Benchmark chart */}
        <div className={styles.benchmarkContainer}>
          <h3 className={styles.benchmarkTitle}>{currentBenchmark.title}</h3>
          <p className={styles.benchmarkDescription}>{currentBenchmark.description}</p>
          
          <div className={styles.benchmarkChart}>
            {currentBenchmark.data.map((item, idx) => (
              <div key={idx} className={styles.benchmarkRow}>
                <div className={styles.benchmarkInfo}>
                  <span className={styles.benchmarkName}>{item.name}</span>
                </div>
                <div className={styles.benchmarkBar}>
                  <div 
                    className={styles.benchmarkFill}
                    style={{ 
                      width: `${item.percentage}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                      animationDelay: `${idx * 0.1}s`
                    }}>
                    <span className={styles.benchmarkValue}>
                      {item.value.toLocaleString()}{item.unit || '/s'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance insights */}
        <div className={styles.performanceInsights}>
          <div className={styles.insight}>
            <h4>Performance Note</h4>
            <p>
              MagicLogger prioritizes developer experience with beautiful, styled logs preserved end-to-end through production.
              While Winston leads in plain text (253k ops/sec), MagicLogger achieves excellent performance (203k plain, 31k styled ops/sec)
              with the MAGIC Schema ensuring your colored logs display perfectly in dashboards. Async mode is 1.2x faster than sync.
              {' '}
              <a href="/docs/performance-design#styling-optimizations" className={styles.performanceLink}>
                Learn about our style optimization techniques →
              </a>
            </p>
          </div>
        </div>

        {/* Performance features grid */}
        <div className={styles.performanceFeatures}>
          <div className={styles.perfFeature}>
            <h4>Zero Allocations</h4>
            <p>Ring buffer architecture with object pooling minimizes garbage collection</p>
          </div>
          <div className={styles.perfFeature}>
            <h4>Lock-Free Design</h4>
            <p>Non-blocking operations ensure your app never waits for logging</p>
          </div>
          <div className={styles.perfFeature}>
            <h4>JIT Optimized</h4>
            <p>Monomorphic functions and predictable object shapes for maximum V8 performance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
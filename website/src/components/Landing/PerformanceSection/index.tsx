// File: website/src/components/Landing/PerformanceSection/index.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const benchmarks = {
  async: {
    title: 'Styled Output Performance',
    description: 'Real-world performance with file I/O (20K iterations)',
    data: [
      { name: 'Winston (Styled)', value: 446027, percentage: 100, color: '#fee140' },
      { name: 'Pino (Pretty)', value: 274431, percentage: 61, color: '#40a9ff' },
      { name: 'MagicLogger (Sync)', value: 269587, percentage: 60, color: '#667eea' },
      { name: 'MagicLogger (Async)', value: 165694, percentage: 37, color: '#7c3aed' },
      { name: 'MagicLogger (Async + Styles)', value: 116404, percentage: 26, color: '#9945ff' },
      { name: 'Bunyan (Styled)', value: 99468, percentage: 22, color: '#fa709a' }
    ]
  },
  bundle: {
    title: 'Bundle Size',
    description: 'Minified + Gzipped - what your users download',
    data: [
      { name: 'Pino', value: 25, percentage: 49, color: '#4facfe', unit: 'KB' },
      { name: 'SyncLogger Only', value: 29.4, percentage: 58, color: '#764ba2', unit: 'KB' },
      { name: 'Winston', value: 44, percentage: 86, color: '#fee140', unit: 'KB' },
      { name: 'MagicLogger Core', value: 47, percentage: 92, color: '#667eea', unit: 'KB' },
      { name: 'MagicLogger + All', value: 51.1, percentage: 100, color: '#9945ff', unit: 'KB' },
      { name: 'Bunyan', value: 65, percentage: 127, color: '#fa709a', unit: 'KB' }
    ]
  }
};

export default function PerformanceSection() {
  const [activeMetric, setActiveMetric] = useState('async');
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
                {key === 'async' ? '⚡' : '📦'}
              </span>
              <span>{benchmark.title}</span>
            </button>
          ))}
        </div>

        {/* Performance Note */}
        <div className={styles.performanceNote}>
          <strong>⚡ Performance:</strong> MagicLogger achieves <strong>250K+ ops/sec</strong> plain text and <strong>120K+ ops/sec</strong> with styled output.
          Every log includes full MAGIC schema, OpenTelemetry context, and style preservation - purposeful trade-offs for complete observability.
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
                      width: `${Math.min(item.percentage, 100)}%`,
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
            <h4>Sync vs Async: Choose Your Speed</h4>
            <p>
              <strong>Plain text logging?</strong> Use SyncLogger for <strong>250K+ ops/sec</strong> - the fastest option when you don't need styling.
            </p>
            <p>
              <strong>Styled output?</strong> AsyncLogger delivers <strong>120K+ ops/sec with styles</strong> - 50% faster than sync mode for styled logs.
              Why? Async mode uses pre-compiled style caching and non-blocking I/O, reducing style processing overhead from from over 40% to just 11.8%.
              {' '}
              <a href="/docs/performance-design" className={styles.performanceLink}>
                Learn about our performance architecture →
              </a>
            </p>
          </div>
        </div>

        {/* Performance features grid */}
        <div className={styles.performanceFeatures}>
          <div className={styles.perfFeature}>
            <h4>Non-Blocking</h4>
            <p>True async architecture with 0.004ms P50 blocking keeps your event loop responsive</p>
          </div>
          <div className={styles.perfFeature}>
            <h4>Pre-Compiled Styles</h4>
            <p>Styles are compiled at logger creation for minimal runtime overhead</p>
          </div>
          <div className={styles.perfFeature}>
            <h4>Smart Batching</h4>
            <p>Automatic batching for network transports, immediate dispatch for files</p>
          </div>
        </div>
      </div>
    </section>
  );
}
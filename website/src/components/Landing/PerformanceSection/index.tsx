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
      { name: 'Bunyan (Styled)', value: 113824, percentage: 100, color: '#fa709a' },
      { name: 'Winston (Styled)', value: 108775, percentage: 96, color: '#fee140' },
      { name: 'Pino (Plain)', value: 85096, percentage: 75, color: '#4facfe' },
      { name: 'MagicLogger (Plain)', value: 57671, percentage: 51, color: '#667eea' },
      { name: 'MagicLogger (Styled)', value: 50316, percentage: 44, color: '#9945ff' }
    ]
  },
  async: {
    title: 'Async Performance',
    description: 'Production performance with full color styling and MAGIC Schema',
    data: [
      { name: 'Pino (Styled)', value: 255949, percentage: 100, color: '#4facfe' },
      { name: 'MagicLogger (Styled)', value: 238199, percentage: 93, color: '#667eea' },
      { name: 'MagicLogger (Plain)', value: 211947, percentage: 83, color: '#9945ff' },
      { name: 'Winston (Styled)', value: 114647, percentage: 45, color: '#fee140' },
      { name: 'Winston (Plain)', value: 103252, percentage: 40, color: '#ffd700' }
    ]
  },
  bundle: {
    title: 'Bundle Size',
    description: 'Minified + Gzipped - what your users download',
    data: [
      { name: 'MagicLogger Core', value: 39.4, percentage: 100, color: '#667eea', unit: 'KB' },
      { name: 'MagicLogger + Console', value: 39.4, percentage: 100, color: '#9945ff', unit: 'KB' },
      { name: 'MagicLogger + Transports', value: 51.4, percentage: 77, color: '#00d4ff', unit: 'KB' },
      { name: 'Pino', value: 25, percentage: 158, color: '#4facfe', unit: 'KB' },
      { name: 'Bunyan', value: 65, percentage: 61, color: '#fa709a', unit: 'KB' },
      { name: 'Winston', value: 180, percentage: 22, color: '#fee140', unit: 'KB' }
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
              MagicLogger is built for developers who want beautiful, styled logs preserved end-to-end through production.
              With 238,199 ops/sec async styled performance (2x faster than Winston!), the MAGIC Schema ensures your carefully
              crafted colored logs display perfectly in dashboards, not just your terminal. The future of logging is visual.
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
            <h4>Smart Batching</h4>
            <p>Intelligent batching reduces I/O operations by up to 90%</p>
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
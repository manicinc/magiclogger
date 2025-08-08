// File: website/src/components/Landing/PerformanceSection/index.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const benchmarks = {
  sync: {
    title: 'Synchronous Performance',
    description: 'Direct logging throughput - no buffering',
    data: [
      { name: 'MagicLogger', value: 850000, percentage: 100, color: '#667eea' },
      { name: 'Pino', value: 800000, percentage: 94, color: '#4facfe' },
      { name: 'Console.log', value: 200000, percentage: 24, color: '#43e97b' },
      { name: 'Bunyan', value: 120000, percentage: 14, color: '#fa709a' },
      { name: 'Winston', value: 40000, percentage: 5, color: '#fee140' }
    ]
  },
  async: {
    title: 'Async Performance',
    description: 'With ring buffer enabled - production mode',
    data: [
      { name: 'MagicLogger', value: 2500000, percentage: 100, color: '#667eea' },
      { name: 'Pino (worker)', value: 400000, percentage: 16, color: '#4facfe' },
      { name: 'Bunyan', value: 30000, percentage: 1.2, color: '#fa709a' },
      { name: 'Winston', value: 15000, percentage: 0.6, color: '#fee140' }
    ]
  },
  bundle: {
    title: 'Bundle Size',
    description: 'Minified + Gzipped - what your users download',
    data: [
      { name: 'MagicLogger', value: 12, percentage: 100, color: '#667eea', unit: 'KB' },
      { name: 'Pino', value: 45, percentage: 27, color: '#4facfe', unit: 'KB' },
      { name: 'Winston', value: 180, percentage: 7, color: '#fee140', unit: 'KB' },
      { name: 'Bunyan', value: 65, percentage: 18, color: '#fa709a', unit: 'KB' }
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
                {key === 'sync' ? '⚡' : key === 'async' ? '🚀' : '📦'}
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
            <h4>Why is MagicLogger so fast?</h4>
            <p>
              Zero heap allocations, monomorphic functions, and a ring buffer architecture 
              designed for V8's JIT compiler. We obsess over every nanosecond.
            </p>
          </div>
        </div>

        {/* Performance features grid */}
        <div className={styles.performanceFeatures}>
          <div className={styles.perfFeature}>
            <span className={styles.perfIcon}>💾</span>
            <h4>Zero Allocations</h4>
            <p>Ring buffer architecture with object pooling minimizes garbage collection</p>
          </div>
          <div className={styles.perfFeature}>
            <span className={styles.perfIcon}>🔄</span>
            <h4>Lock-Free Design</h4>
            <p>Non-blocking operations ensure your app never waits for logging</p>
          </div>
          <div className={styles.perfFeature}>
            <span className={styles.perfIcon}>📊</span>
            <h4>Smart Batching</h4>
            <p>Intelligent batching reduces I/O operations by up to 90%</p>
          </div>
          <div className={styles.perfFeature}>
            <span className={styles.perfIcon}>⚙️</span>
            <h4>JIT Optimized</h4>
            <p>Monomorphic functions and predictable object shapes for maximum V8 performance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
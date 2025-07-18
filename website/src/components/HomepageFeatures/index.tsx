import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🎨 Rich Styling',
    emoji: '🌈',
    description: (
      <>
        256 colors, gradients, and advanced terminal styling. Make your logs as 
        beautiful as your code with zero configuration required.
      </>
    ),
  },
  {
    title: '🔄 Drop-in Compatible',
    emoji: '🔧',
    description: (
      <>
        Replace Winston, Bunyan, or Pino without changing a single line of code.
        Full compatibility with existing logging patterns.
      </>
    ),
  },
  {
    title: '🌐 Cross-Platform',
    emoji: '⚡',
    description: (
      <>
        Works seamlessly in Node.js and browsers with automatic environment 
        detection and optimized performance.
      </>
    ),
  },
  {
    title: '📁 Smart File Logging',
    emoji: '💾',
    description: (
      <>
        Automatic log rotation, cleanup, and structured output. Keep your 
        logs organized without the hassle.
      </>
    ),
  },
  {
    title: '📱 Browser Storage',
    emoji: '🌐',
    description: (
      <>
        Built-in localStorage support for client-side logging. Download, 
        filter, and manage logs directly in the browser.
      </>
    ),
  },
  {
    title: '🚀 High Performance',
    emoji: '⚡',
    description: (
      <>
        Optimized for production use with minimal overhead and smart 
        buffering for high-throughput applications.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureEmoji}>{emoji}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

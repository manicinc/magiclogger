import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delay: string;
};

// Custom animated SVG icons
const RainbowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff6b6b">
          <animate attributeName="stop-color" values="#ff6b6b;#feca57;#48dbfb;#ff9ff3;#54a0ff;#ff6b6b" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="25%" stopColor="#feca57">
          <animate attributeName="stop-color" values="#feca57;#48dbfb;#ff9ff3;#54a0ff;#ff6b6b;#feca57" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#48dbfb">
          <animate attributeName="stop-color" values="#48dbfb;#ff9ff3;#54a0ff;#ff6b6b;#feca57;#48dbfb" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="75%" stopColor="#ff9ff3">
          <animate attributeName="stop-color" values="#ff9ff3;#54a0ff;#ff6b6b;#feca57;#48dbfb;#ff9ff3" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#54a0ff">
          <animate attributeName="stop-color" values="#54a0ff;#ff6b6b;#feca57;#48dbfb;#ff9ff3;#54a0ff" dur="3s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <path d="M20 60 Q50 20 80 60" stroke="url(#rainbow)" strokeWidth="6" fill="none" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0 100;60 40;0 100" dur="2s" repeatCount="indefinite" />
    </path>
    <circle cx="25" cy="55" r="3" fill="#ff6b6b">
      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="75" cy="55" r="3" fill="#54a0ff">
      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
    </circle>
  </svg>
);

const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="4s" repeatCount="indefinite" />
      <path d="M50 25 L55 35 L65 30 L60 40 L70 45 L60 50 L70 55 L60 60 L65 70 L55 65 L50 75 L45 65 L35 70 L40 60 L30 55 L40 50 L30 45 L40 40 L35 30 L45 35 Z" fill="#48dbfb">
        <animate attributeName="fill" values="#48dbfb;#ff9ff3;#feca57;#48dbfb" dur="3s" repeatCount="indefinite" />
      </path>
    </g>
    <circle cx="50" cy="50" r="12" fill="#f8f9fa" stroke="#4f46e5" strokeWidth="2">
      <animate attributeName="r" values="12;15;12" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="50" r="6" fill="#4f46e5">
      <animate attributeName="fill" values="#4f46e5;#6366f1;#4f46e5" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 20 L45 40 L55 40 Z" fill="#ff6b6b">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="1s" repeatCount="indefinite" />
    </path>
    <rect x="45" y="40" width="10" height="25" fill="#48dbfb">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="1s" repeatCount="indefinite" />
    </rect>
    <path d="M40 65 L50 70 L60 65" fill="#feca57">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="1s" repeatCount="indefinite" />
    </path>
    <circle cx="42" cy="50" r="2" fill="white" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
    </circle>
    <path d="M45 70 Q50 75 55 70" stroke="#ff9ff3" strokeWidth="2" fill="none">
      <animate attributeName="stroke-dasharray" values="0 15;15 0;0 15" dur="0.6s" repeatCount="indefinite" />
    </path>
  </svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="30" y="25" width="40" height="50" rx="4" fill="#54a0ff" stroke="#4f46e5" strokeWidth="2">
      <animate attributeName="fill" values="#54a0ff;#6366f1;#54a0ff" dur="2s" repeatCount="indefinite" />
    </rect>
    <path d="M35 35 L65 35" stroke="white" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0 30;30 0;0 30" dur="1.5s" repeatCount="indefinite" />
    </path>
    <path d="M35 45 L60 45" stroke="white" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0 25;25 0;0 25" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
    </path>
    <path d="M35 55 L55 55" stroke="white" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0 20;20 0;0 20" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
    </path>
    <circle cx="25" cy="30" r="2" fill="#feca57">
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="75" cy="40" r="2" fill="#ff9ff3">
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.5s" />
    </circle>
  </svg>
);

const CloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M25 60 Q25 45 40 45 Q45 35 55 35 Q65 35 70 45 Q75 45 75 55 Q75 65 65 65 L35 65 Q25 65 25 60 Z" fill="#48dbfb">
      <animate attributeName="fill" values="#48dbfb;#54a0ff;#6366f1;#48dbfb" dur="3s" repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="translate" values="0 0;2 -1;0 0;-2 1;0 0" dur="4s" repeatCount="indefinite" />
    </path>
    <circle cx="35" cy="50" r="3" fill="white" opacity="0.7">
      <animate attributeName="cy" values="50;45;50" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="50" r="2" fill="white" opacity="0.5">
      <animate attributeName="cy" values="50;45;50" dur="2s" repeatCount="indefinite" begin="0.5s" />
    </circle>
    <circle cx="65" cy="50" r="2.5" fill="white" opacity="0.6">
      <animate attributeName="cy" values="50;45;50" dur="2s" repeatCount="indefinite" begin="1s" />
    </circle>
  </svg>
);

const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M35 25 L45 45 L40 45 L55 75 L45 55 L50 55 Z" fill="#feca57">
      <animate attributeName="fill" values="#feca57;#ff6b6b;#ff9ff3;#feca57" dur="1.5s" repeatCount="indefinite" />
    </path>
    <circle cx="30" cy="30" r="2" fill="#ff6b6b" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="0s" />
    </circle>
    <circle cx="60" cy="35" r="2" fill="#48dbfb" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="0.1s" />
    </circle>
    <circle cx="70" cy="60" r="2" fill="#ff9ff3" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="0.2s" />
    </circle>
    <circle cx="40" cy="70" r="2" fill="#54a0ff" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.2s" repeatCount="indefinite" begin="0.3s" />
    </circle>
  </svg>
);

const FeatureList: FeatureItem[] = [
  {
    title: '🎨 Rich Styling',
    icon: RainbowIcon,
    delay: '0s',
    description: (
      <>
        256 colors, gradients, and advanced terminal styling. Make your logs as 
        beautiful as your code with zero configuration required.
      </>
    ),
  },
  {
    title: '🔄 Drop-in Compatible',
    icon: GearIcon,
    delay: '0.2s',
    description: (
      <>
        Replace Winston, Bunyan, or Pino without changing a single line of code.
        Full compatibility with existing logging patterns.
      </>
    ),
  },
  {
    title: '🌐 Cross-Platform',
    icon: RocketIcon,
    delay: '0.4s',
    description: (
      <>
        Works seamlessly in Node.js and browsers with automatic environment 
        detection and optimized performance.
      </>
    ),
  },
  {
    title: '📁 Smart File Logging',
    icon: FileIcon,
    delay: '0.6s',
    description: (
      <>
        Automatic log rotation, cleanup, and structured output. Keep your 
        logs organized without the hassle.
      </>
    ),
  },
  {
    title: '📱 Browser Storage',
    icon: CloudIcon,
    delay: '0.8s',
    description: (
      <>
        Built-in localStorage support for client-side logging. Download, 
        filter, and manage logs directly in the browser.
      </>
    ),
  },
  {
    title: '🚀 High Performance',
    icon: LightningIcon,
    delay: '1s',
    description: (
      <>
        Optimized for production use with minimal overhead and smart 
        buffering for high-throughput applications.
      </>
    ),
  },
];

function Feature({title, description, icon: Icon, delay}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.iconContainer}>
          <Icon 
            className={styles.featureIcon}
            style={{ animationDelay: delay }}
          />
        </div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
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

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

const TransportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Central hub */}
    <circle cx="50" cy="50" r="8" fill="#4f46e5">
      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Console transport */}
    <rect x="20" y="20" width="15" height="10" rx="2" fill="#ff6b6b">
      <animate attributeName="fill" values="#ff6b6b;#ff9ff3;#ff6b6b" dur="1.5s" repeatCount="indefinite" />
    </rect>
    <path d="M35 25 L42 42" stroke="#ff6b6b" strokeWidth="2" strokeDasharray="2,2">
      <animate attributeName="stroke-dashoffset" values="0;4;0" dur="1s" repeatCount="indefinite" />
    </path>
    
    {/* File transport */}
    <rect x="65" y="20" width="15" height="12" rx="2" fill="#48dbfb">
      <animate attributeName="fill" values="#48dbfb;#54a0ff;#48dbfb" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
    </rect>
    <path d="M65 26 L58 42" stroke="#48dbfb" strokeWidth="2" strokeDasharray="2,2">
      <animate attributeName="stroke-dashoffset" values="0;4;0" dur="1s" repeatCount="indefinite" begin="0.3s" />
    </path>
    
    {/* HTTP transport */}
    <circle cx="25" cy="75" r="8" fill="#feca57">
      <animate attributeName="fill" values="#feca57;#ff9ff3;#feca57" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
    </circle>
    <path d="M33 67 L42 58" stroke="#feca57" strokeWidth="2" strokeDasharray="2,2">
      <animate attributeName="stroke-dashoffset" values="0;4;0" dur="1s" repeatCount="indefinite" begin="0.6s" />
    </path>
    
    {/* Browser storage transport */}
    <rect x="65" y="68" width="15" height="14" rx="3" fill="#ff9ff3">
      <animate attributeName="fill" values="#ff9ff3;#54a0ff;#ff9ff3" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
    </rect>
    <path d="M65 75 L58 58" stroke="#ff9ff3" strokeWidth="2" strokeDasharray="2,2">
      <animate attributeName="stroke-dashoffset" values="0;4;0" dur="1s" repeatCount="indefinite" begin="0.9s" />
    </path>
    
    {/* Data flow animation */}
    <circle cx="45" cy="45" r="2" fill="white" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const AIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Brain outline */}
    <path d="M30 40 Q25 30 35 25 Q45 20 55 25 Q65 30 70 40 Q75 50 70 60 Q65 70 55 75 Q45 80 35 75 Q25 70 30 60 Q25 50 30 40" 
          fill="none" stroke="#6366f1" strokeWidth="3">
      <animate attributeName="stroke" values="#6366f1;#8b5cf6;#a855f7;#6366f1" dur="3s" repeatCount="indefinite" />
    </path>
    
    {/* Neural connections */}
    <circle cx="40" cy="40" r="2" fill="#8b5cf6">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="60" cy="40" r="2" fill="#a855f7">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <circle cx="50" cy="55" r="2" fill="#c084fc">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.6s" />
    </circle>
    
    {/* Connection lines */}
    <path d="M40 40 L60 40" stroke="#8b5cf6" strokeWidth="1" opacity="0.6">
      <animate attributeName="stroke-dasharray" values="0 20;20 0;0 20" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M40 40 L50 55" stroke="#a855f7" strokeWidth="1" opacity="0.6">
      <animate attributeName="stroke-dasharray" values="0 15;15 0;0 15" dur="2s" repeatCount="indefinite" begin="0.5s" />
    </path>
    <path d="M60 40 L50 55" stroke="#c084fc" strokeWidth="1" opacity="0.6">
      <animate attributeName="stroke-dasharray" values="0 15;15 0;0 15" dur="2s" repeatCount="indefinite" begin="1s" />
    </path>
    
    {/* AI text */}
    <text x="50" y="85" textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">AI</text>
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

const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Dashboard frame */}
    <rect x="20" y="25" width="60" height="50" rx="4" fill="#1f2937" stroke="#4f46e5" strokeWidth="2">
      <animate attributeName="stroke" values="#4f46e5;#6366f1;#8b5cf6;#4f46e5" dur="3s" repeatCount="indefinite" />
    </rect>
    
    {/* Charts and graphs */}
    <rect x="25" y="30" width="15" height="20" fill="#10b981" opacity="0.8">
      <animate attributeName="height" values="20;15;25;20" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="42" y="35" width="15" height="15" fill="#f59e0b" opacity="0.8">
      <animate attributeName="height" values="15;25;10;15" dur="2s" repeatCount="indefinite" begin="0.5s" />
    </rect>
    <rect x="59" y="32" width="15" height="18" fill="#ef4444" opacity="0.8">
      <animate attributeName="height" values="18;12;22;18" dur="2s" repeatCount="indefinite" begin="1s" />
    </rect>
    
    {/* Status indicators */}
    <circle cx="30" cy="60" r="2" fill="#10b981">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="60" r="2" fill="#f59e0b">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <circle cx="70" cy="60" r="2" fill="#ef4444">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.6s" />
    </circle>
    
    {/* Data flow lines */}
    <path d="M25 65 Q50 68 75 65" stroke="#6366f1" strokeWidth="1" fill="none" opacity="0.6">
      <animate attributeName="stroke-dasharray" values="0 50;50 0;0 50" dur="3s" repeatCount="indefinite" />
    </path>
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
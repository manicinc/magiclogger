// File: website/src/components/Landing/ArchitectureSection/index.tsx

import React, { useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const layers = [
  {
    id: 'app',
    name: 'Your Application',
    color: '#667eea',
    description: 'Import only what you need with perfect tree-shaking',
    features: ['Tree-shakeable imports', 'TypeScript support', 'Zero configuration']
  },
  {
    id: 'core',
    name: 'Logger Core',
    color: '#764ba2',
    description: 'Lightweight orchestration layer that manages everything',
    features: ['39KB gzipped', 'Zero dependencies', 'Extensible architecture']
  },
  {
    id: 'transports',
    name: 'Transport Layer',
    color: '#f093fb',
    description: 'Pluggable transport system to send logs anywhere',
    features: ['Pluggable design', 'Async/Sync modes', 'Smart batching']
  },
  {
    id: 'destinations',
    name: 'Destinations',
    color: '#43e97b',
    description: 'Your infrastructure endpoints and storage',
    features: ['Console', 'Files', 'HTTP/S3/MongoDB', 'Custom transports']
  }
];

export default function ArchitectureSection() {
  const [activeLayer, setActiveLayer] = useState('core');
  const currentLayer = layers.find(l => l.id === activeLayer) || layers[1];

  return (
    <section className={styles.architectureSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Architecture that scales
          </Heading>
          <p className={styles.sectionSubtitle}>
            Simple by default, powerful when you need it
          </p>
        </div>

        <div className={styles.architectureGrid}>
          {/* Visual diagram */}
          <div className={styles.architectureVisual}>
            <div className={styles.diagramContainer}>
              <svg className={styles.architectureSvg} viewBox="0 0 400 500">
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#43e97b" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                
                {/* Data flow lines */}
                <line x1="200" y1="80" x2="200" y2="180" 
                  stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5"
                  className={styles.flowLine} />
                <line x1="200" y1="220" x2="200" y2="320" 
                  stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5"
                  className={styles.flowLine} />
                <line x1="200" y1="360" x2="200" y2="460" 
                  stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5"
                  className={styles.flowLine} />

                {/* Layer blocks */}
                {layers.map((layer, index) => (
                  <g key={layer.id} 
                    className={clsx(styles.svgLayer, activeLayer === layer.id && styles.active)}
                    onClick={() => setActiveLayer(layer.id)}>
                    <rect
                      x="50"
                      y={40 + index * 120}
                      width="300"
                      height="80"
                      rx="12"
                      fill={layer.color}
                      fillOpacity={activeLayer === layer.id ? 0.9 : 0.7}
                      stroke={activeLayer === layer.id ? '#fff' : 'none'}
                      strokeWidth="3"
                      className={styles.layerRect}
                    />
                    <text
                      x="200"
                      y={85 + index * 120}
                      textAnchor="middle"
                      fill="white"
                      fontSize="18"
                      fontWeight="700"
                      className={styles.layerText}>
                      {layer.name}
                    </text>
                  </g>
                ))}
                
                {/* Flow indicators */}
                <circle cx="200" cy="140" r="4" fill="#667eea" className={styles.flowDot} />
                <circle cx="200" cy="260" r="4" fill="#764ba2" className={styles.flowDot} />
                <circle cx="200" cy="380" r="4" fill="#f093fb"

 className={styles.flowDot} />
              </svg>
            </div>
          </div>

          {/* Layer details */}
          <div className={styles.architectureDetails}>
            <div 
              className={styles.layerInfo}
              style={{ borderColor: currentLayer.color }}>
              <h3 className={styles.layerTitle} style={{ color: currentLayer.color }}>
                {currentLayer.name}
              </h3>
              <p className={styles.layerDescription}>
                {currentLayer.description}
              </p>
              
              <div className={styles.layerFeatures}>
                {currentLayer.features.map((feature, idx) => (
                  <div key={idx} className={styles.layerFeature}>
                    <span 
                      className={styles.featureDot}
                      style={{ background: currentLayer.color }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Code example for active layer */}
              <div className={styles.codeExample}>
                <div className={styles.codeHeader}>
                  <span className={styles.codeLabel}>Example</span>
                </div>
                <pre className={styles.codeBlock}>
                  <code>{getCodeExample(currentLayer.id)}</code>
                </pre>
              </div>
            </div>

            <Link 
              className={styles.detailsLink}
              to="/architecture">
              <span>Explore full architecture</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function getCodeExample(layerId: string) {
  const examples = {
    app: `// Your application - import only what you need
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports/console';
import { FileTransport } from 'magiclogger/transports/file';

const logger = new Logger({
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filepath: './logs/app.log' })
  ]
});

logger.info('Hello, MagicLogger!');`,
    
    core: `// Logger core - lightweight orchestration
class Logger {
  constructor(options?: LoggerOptions) {
    this.id = options?.id || this.generateId();
    this.transports = options?.transports || [];
    this.context = options?.context || {};
    this.tags = options?.tags || [];
  }
  
  log(level: LogLevel, message: string, meta?: any): void {
    const entry = this.createEntry(level, message, meta);
    this.dispatch(entry);
  }
  
  private dispatch(entry: LogEntry): void {
    this.transports.forEach(transport => {
      if (transport.shouldLog?.(entry) ?? true) {
        transport.log(entry);
      }
    });
  }
}`,
    
    transports: `// Transport interface - simple and powerful
interface Transport {
  name: string;
  log(entry: LogEntry): void | Promise<void>;
  flush?(): Promise<void>;
  close?(): Promise<void>;
  shouldLog?(entry: LogEntry): boolean;
}

// Multiple destinations with different configurations
logger.addTransport(new ConsoleTransport({ 
  level: 'debug',
  useColors: true 
}));

logger.addTransport(new FileTransport({ 
  filepath: './logs',
  rotation: 'daily',
  maxFiles: 7 
}));

logger.addTransport(new HTTPTransport({ 
  url: 'https://logs.example.com',
  batch: { maxSize: 100 }
}));`,
    
    destinations: `// Send logs anywhere you need
// Console - Beautiful terminal output
new ConsoleTransport({ 
  useColors: true,
  showTimestamp: true 
})

// File - Rotating logs with compression
new FileTransport({ 
  filepath: './logs/app.log',
  maxFileSize: '10MB',
  maxFiles: 5,
  compress: true 
})

// HTTP - REST endpoints with batching
new HTTPTransport({ 
  url: 'https://api.logs.com',
  headers: { 'X-API-Key': process.env.LOG_KEY },
  batch: { maxSize: 100, maxTime: 5000 }
})

// S3 - Direct to cloud storage
new S3Transport({ 
  bucket: 'my-app-logs',
  region: 'us-east-1',
  prefix: 'logs/' 
})

// MongoDB - Database persistence
new MongoDBTransport({ 
  uri: 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'entries' 
})

// Custom - Your own implementation
class CustomTransport implements Transport {
  name = 'custom';
  log(entry: LogEntry): void {
    // Your custom logic here
  }
}`
  };
  
  return examples[layerId] || examples.core;
}

// Icon component
function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
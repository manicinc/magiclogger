import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  data?: unknown;
  styles?: string[];
}

// Type for the logger instance with all the methods we use
interface LoggerInstance {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
  custom: (message: string, colors: string[], prefix: string) => void;
  header: (message: string) => void;
  separator: (char: string) => void;
  table: (data: Record<string, unknown>[]) => void;
  time?: (label: string) => void;
  timeEnd?: (label: string) => void;
  performance?: (label: string, data: Record<string, unknown>) => void;
  progress?: (percent: number, message: string) => void;
}

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'video' | 'live'>('live');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [logger, setLoggerInstance] = useState<LoggerInstance | null>(null);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const originalConsole = useRef<Record<string, (...args: unknown[]) => void>>({});

  useEffect(() => {
    // Load MagicLogger using dynamic import from source files
    const loadMagicLogger = async () => {
      try {
        // Import BrowserLogger directly for browser compatibility
        const { BrowserLogger } = await import('../../../../src/core/BrowserLogger');
        
        if (BrowserLogger) {
          // Create logger instance with browser-compatible settings
          const loggerInstance = new BrowserLogger({
            // Browser-specific options
            useColors: true,
            verbose: true,
            storeInBrowser: true,
            maxStoredLogs: 100,
            // Don't specify theme or other Node.js specific options
          });
          
          setLoggerInstance(loggerInstance as LoggerInstance);
          
          // Store original console methods
          originalConsole.current = {
            log: console.log.bind(console),
            info: console.info.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            debug: console.debug.bind(console)
          };
          
          // Override console methods to capture output
          const createInterceptor = (level: string, originalMethod: (...args: unknown[]) => void) => {
            return (...args: unknown[]) => {
              // Call the original method first
              originalMethod.apply(console, args);
              
              // Capture for our display
              const entry: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                level,
                message: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '),
                data: args.length > 1 ? args.slice(1) : undefined
              };
              
              setLogs(prev => [...prev.slice(-49), entry]);
              
              setTimeout(() => {
                if (consoleRef.current) {
                  consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
                }
              }, 100);
            };
          };
          
          console.log = createInterceptor('log', originalConsole.current.log);
          console.info = createInterceptor('info', originalConsole.current.info);
          console.warn = createInterceptor('warn', originalConsole.current.warn);
          console.error = createInterceptor('error', originalConsole.current.error);
          console.debug = createInterceptor('debug', originalConsole.current.debug);
          
        } else {
          throw new Error('BrowserLogger class not found in module');
        }
      } catch (error) {
        console.error('Failed to load MagicLogger:', error);
        // Show the error in the demo
        setLogs(prev => [...prev, {
          id: 'error-' + Date.now(),
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Failed to load MagicLogger: ${error.message}`,
        }]);
      }
    };

    loadMagicLogger();

    return () => {
      if (originalConsole.current.log) {
        console.log = originalConsole.current.log;
        console.info = originalConsole.current.info;
        console.warn = originalConsole.current.warn;
        console.error = originalConsole.current.error;
        console.debug = originalConsole.current.debug;
      }
    };
  }, []);

  const demoScenarios = [
    {
      title: '🌈 Basic Logging',
      action: () => {
        if (!logger) return;
        logger.info('🚀 MagicLogger Demo Started');
        logger.success('✅ Logger initialized successfully');
        logger.warn('⚠️ This is a warning message');
        logger.error('❌ Example error for demonstration');
      }
    },
    {
      title: '🎨 Styled Logging',
      action: () => {
        if (!logger) return;
        logger.custom('Custom styled message', ['cyan', 'bold'], 'CUSTOM');
        logger.header('SECTION HEADER');
        logger.separator('=');
      }
    },
    {
      title: '📊 Data Logging',
      action: () => {
        if (!logger) return;
        logger.table([
          { name: 'Alice', age: 30, role: 'Developer' },
          { name: 'Bob', age: 25, role: 'Designer' },
          { name: 'Charlie', age: 35, role: 'Manager' }
        ]);
        
        logger.info(JSON.stringify({
          user: 'john_doe',
          action: 'login',
          timestamp: new Date().toISOString(),
          metadata: { ip: '192.168.1.1', userAgent: 'Chrome/91.0' }
        }, null, 2));
      }
    },
    {
      title: '⚡ Performance Logging',
      action: () => {
        if (!logger) return;
        if (logger.time) {
          logger.time('api_request');
        }
        
        setTimeout(() => {
          if (logger.timeEnd) {
            logger.timeEnd('api_request');
          }
          if (logger.performance) {
            logger.performance('Database Query', { duration: 45, rows: 1250 });
          }
          if (logger.progress) {
            logger.progress(75, 'Processing data...');
          }
        }, 1000);
      }
    },
    {
      title: '🔄 Real-time Simulation',
      action: () => {
        if (!logger) return;
        const events = [
          () => logger.info('📥 New user registration'),
          () => logger.success('💳 Payment processed successfully'),
          () => logger.warn('🔄 Cache invalidated'),
          () => logger.info('📧 Email notification sent'),
          () => logger.debug('🔍 Database query executed'),
          () => logger.error('🚨 Rate limit exceeded'),
          () => logger.info('🔐 User authenticated'),
          () => logger.success('📁 File uploaded successfully')
        ];

        let eventIndex = 0;
        const eventInterval = setInterval(() => {
          if (eventIndex < events.length) {
            events[eventIndex]();
            eventIndex++;
          } else {
            clearInterval(eventInterval);
            setIsRunning(false);
          }
        }, 800);
      }
    }
  ];

  const runDemo = () => {
    if (isRunning || !logger) return;
    
    setIsRunning(true);
    setDemoStep(0);
    
    const runScenario = (index: number) => {
      if (index >= demoScenarios.length) {
        setIsRunning(false);
        setDemoStep(0);
        return;
      }
      
      setDemoStep(index + 1);
      demoScenarios[index].action();
      
      setTimeout(() => {
        runScenario(index + 1);
      }, 2000);
    };
    
    runScenario(0);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runScenario = (index: number) => {
    if (logger && demoScenarios[index]) {
      demoScenarios[index].action();
    }
  };

  const formatLogLevel = (level: string) => {
    const colors = {
      log: '#6c757d',
      info: '#0dcaf0',
      warn: '#ffc107',
      error: '#dc3545',
      debug: '#6f42c1'
    };
    return colors[level] || '#6c757d';
  };

  return (
    <div className={styles.interactiveDemo}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'video' ? styles.active : ''}`}
          onClick={() => setActiveTab('video')}
        >
          📹 Video Demo
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'live' ? styles.active : ''}`}
          onClick={() => setActiveTab('live')}
        >
          🚀 Live Demo
        </button>
      </div>

      {activeTab === 'video' && (
        <div className={styles.videoContainer}>
          <div className={styles.placeholder}>
            <h3>🎬 Video Demo Coming Soon</h3>
            <p>Watch MagicLogger in action with real-world examples</p>
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className={styles.liveDemo}>
          <div className={styles.controls}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={runDemo}
              disabled={isRunning || !logger}
            >
              {isRunning ? '🔄 Running Demo...' : '▶️ Run Full Demo'}
            </button>
            
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={clearLogs}
              disabled={isRunning}
            >
              🗑️ Clear Logs
            </button>

            {!logger && (
              <div className={styles.loading}>
                ⏳ Loading MagicLogger...
              </div>
            )}
          </div>

          <div className={styles.scenarios}>
            <h4>🎯 Try Individual Scenarios:</h4>
            <div className={styles.scenarioGrid}>
              {demoScenarios.map((scenario, index) => (
                <button
                  key={index}
                  className={`${styles.scenarioButton} ${
                    demoStep === index + 1 ? styles.active : ''
                  }`}
                  onClick={() => runScenario(index)}
                  disabled={isRunning || !logger}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.console} ref={consoleRef}>
            <div className={styles.consoleHeader}>
              <span>🖥️ Console Output</span>
              <span className={styles.logCount}>{logs.length} logs</span>
            </div>
            <div className={styles.consoleContent}>
              {logs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>🎯 Click "Run Full Demo" or try individual scenarios to see MagicLogger in action!</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={styles.logEntry}
                    style={{ borderLeft: `3px solid ${formatLogLevel(log.level)}` }}
                  >
                    <span className={styles.timestamp}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={styles.level}
                      style={{ color: formatLogLevel(log.level) }}
                    >
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className={styles.message}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
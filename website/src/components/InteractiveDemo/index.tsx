import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  styles?: string[];
}

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'video' | 'live'>('live');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [Logger, setLogger] = useState<any>(null);
  const [logger, setLoggerInstance] = useState<any>(null);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const originalConsole = useRef<any>({});

  useEffect(() => {
    // Dynamically import the actual MagicLogger from the built files
    const loadMagicLogger = async () => {
      try {
        // Try to import from the built package
        const magicLoggerModule = await import('../../../../../dist/index.js');
        const LoggerClass = magicLoggerModule.Logger || magicLoggerModule.default?.Logger;
        
        if (LoggerClass) {
          setLogger(LoggerClass);
          
          // Create logger instance
          const loggerInstance = new LoggerClass({
            theme: 'rainbow',
            storeInBrowser: true,
            maxStoredLogs: 100,
            verbose: true
          });
          
          setLoggerInstance(loggerInstance);
          
          // Store original console methods
          originalConsole.current = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
          };
          
          // Override console methods to capture output
          const createInterceptor = (level: string, originalMethod: Function) => {
            return (...args: any[]) => {
              // Call the original method first (this will trigger MagicLogger's styling)
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
              
              // Auto-scroll
              setTimeout(() => {
                if (consoleRef.current) {
                  consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
                }
              }, 100);
            };
          };
          
          // Override console methods
          console.log = createInterceptor('log', originalConsole.current.log);
          console.info = createInterceptor('info', originalConsole.current.info);
          console.warn = createInterceptor('warn', originalConsole.current.warn);
          console.error = createInterceptor('error', originalConsole.current.error);
          console.debug = createInterceptor('debug', originalConsole.current.debug);
          
        } else {
          console.error('Failed to load MagicLogger');
        }
      } catch (error) {
        console.error('Error loading MagicLogger:', error);
        // Fallback to a simple mock if import fails
        createFallbackLogger();
      }
    };

    const createFallbackLogger = () => {
      // Simple fallback logger for demo purposes
      const fallbackLogger = {
        info: (msg: string, ...args: any[]) => addLog('info', msg, args),
        warn: (msg: string, ...args: any[]) => addLog('warn', msg, args),
        error: (msg: string, ...args: any[]) => addLog('error', msg, args),
        success: (msg: string, ...args: any[]) => addLog('success', msg, args),
        debug: (msg: string, ...args: any[]) => addLog('debug', msg, args),
        custom: (msg: string, styles: string[], prefix?: string) => addLog('custom', `[${prefix || 'CUSTOM'}] ${msg}`, [], styles),
        header: (msg: string) => addLog('header', `=== ${msg} ===`),
        separator: (char: string = '-') => addLog('separator', char.repeat(50)),
        table: (data: any[]) => addLog('table', 'Table data:', [data]),
        json: (data: any) => addLog('json', JSON.stringify(data, null, 2)),
        time: (label: string) => addLog('time', `⏱️ Timer started: ${label}`),
        timeEnd: (label: string) => addLog('timeEnd', `⏱️ Timer ended: ${label}`),
        performance: (label: string, data?: any) => addLog('performance', `⚡ ${label}`, [data]),
        progress: (percent: number, label?: string) => addLog('progress', `📊 Progress: ${percent}% ${label || ''}`),
        clearLogs: () => setLogs([])
      };
      
      setLoggerInstance(fallbackLogger);
    };

    const addLog = (level: string, message: string, data?: any[], styles?: string[]) => {
      const entry: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        styles
      };
      
      setLogs(prev => [...prev.slice(-49), entry]);
      
      setTimeout(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      }, 100);
    };

    loadMagicLogger();

    return () => {
      // Restore original console methods
      if (originalConsole.current.log) {
        Object.assign(console, originalConsole.current);
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
        
        logger.json({
          user: 'john_doe',
          action: 'login',
          timestamp: new Date().toISOString(),
          metadata: { ip: '192.168.1.1', userAgent: 'Chrome/91.0' }
        });
      }
    },
    {
      title: '⚡ Performance Logging',
      action: () => {
        if (!logger) return;
        logger.time('api_request');
        
        setTimeout(() => {
          logger.timeEnd('api_request');
          logger.performance('Database Query', { duration: 45, rows: 1250 });
          logger.progress(75, 'Processing data...');
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
            logger.success('🎉 Demo completed!');
          }
        }, 800);
      }
    }
  ];

  const runDemo = () => {
    if (isRunning || !logger) return;
    
    setIsRunning(true);
    setLogs([]);
    setDemoStep(0);

    demoScenarios.forEach((scenario, index) => {
      setTimeout(() => {
        setDemoStep(index + 1);
        scenario.action();
        
        if (index === demoScenarios.length - 1) {
          setTimeout(() => setIsRunning(false), 2000);
        }
      }, index * 3000);
    });
  };

  const runSingleDemo = (index: number) => {
    if (!logger) return;
    demoScenarios[index].action();
  };

  const clearConsole = () => {
    setLogs([]);
    if (logger && logger.clearLogs) {
      logger.clearLogs();
    }
  };

  const openDevConsole = () => {
    alert('Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac) to open Developer Console and see MagicLogger\'s beautiful colored output!');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      debug: '🔍',
      custom: '🎨',
      header: '📋',
      separator: '➖',
      table: '📊',
      json: '📄',
      time: '⏱️',
      timeEnd: '⏹️',
      performance: '⚡',
      progress: '📈'
    };
    return icons[level as keyof typeof icons] || '📝';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      log: '#6b7280',
      info: '#3b82f6',
      warn: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      debug: '#8b5cf6',
      custom: '#ec4899',
      header: '#6366f1',
      separator: '#9ca3af',
      table: '#06b6d4',
      json: '#84cc16',
      time: '#f97316',
      timeEnd: '#f97316',
      performance: '#eab308',
      progress: '#22c55e'
    };
    return colors[level as keyof typeof colors] || '#6b7280';
  };

  return (
    <section className={styles.demoSection}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <h2 className={styles.sectionTitle}>
            ✨ Interactive MagicLogger Demo
          </h2>
          <p className={styles.sectionSubtitle}>
            Experience the power of MagicLogger with real-time logging and beautiful output
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'video' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('video')}
          >
            🎬 Video Demo
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'live' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('live')}
          >
            🚀 Live Demo
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'video' && (
            <div className={styles.videoTab}>
              <div className={styles.videoContainer}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.playButton}>
                    <span>▶️</span>
                  </div>
                  <h3>🎥 MagicLogger in Action</h3>
                  <p>Watch how MagicLogger transforms your logging experience</p>
                  <div className={styles.videoFeatures}>
                    <span>🌈 Rainbow Colors</span>
                    <span>📊 Data Visualization</span>
                    <span>⚡ Real-time Output</span>
                    <span>🎨 Custom Styling</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.videoInfo}>
                <h4>🎬 What you'll see in the demo:</h4>
                <ul>
                  <li>🌈 Beautiful colored output with zero configuration</li>
                  <li>📊 Table and JSON data visualization</li>
                  <li>⚡ Performance timing and progress bars</li>
                  <li>🎨 Custom styling and themes</li>
                  <li>🔄 Real-time logging simulation</li>
                  <li>📱 Browser storage and download features</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className={styles.liveTab}>
              <div className={styles.demoControls}>
                <button
                  className={`${styles.demoButton} ${styles.primaryButton}`}
                  onClick={runDemo}
                  disabled={isRunning || !logger}
                >
                  {isRunning ? '🔄 Running Demo...' : '🚀 Run Full Demo'}
                </button>
                <button
                  className={`${styles.demoButton} ${styles.secondaryButton}`}
                  onClick={clearConsole}
                  disabled={isRunning}
                >
                  🗑️ Clear Console
                </button>
                <button
                  className={`${styles.demoButton} ${styles.tertiaryButton}`}
                  onClick={openDevConsole}
                >
                  🔍 Open Dev Console
                </button>
                
                {isRunning && (
                  <div className={styles.demoProgress}>
                    <span>Step {demoStep} of {demoScenarios.length}</span>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${(demoStep / demoScenarios.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Demo Buttons */}
              <div className={styles.individualDemos}>
                <h4>🎯 Try Individual Features:</h4>
                <div className={styles.demoButtonGrid}>
                  {demoScenarios.map((scenario, index) => (
                    <button
                      key={index}
                      className={`${styles.demoButton} ${styles.featureButton}`}
                      onClick={() => runSingleDemo(index)}
                      disabled={!logger}
                    >
                      {scenario.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.consoleContainer}>
                <div className={styles.consoleHeader}>
                  <span>🖥️ Live Console Output</span>
                  <span className={styles.logCount}>{logs.length} logs</span>
                  <span className={styles.devConsoleHint}>
                    💡 Open Dev Console (F12) to see MagicLogger's beautiful colors!
                  </span>
                </div>
                <div className={styles.consoleOutput} ref={consoleRef}>
                  {logs.length === 0 ? (
                    <div className={styles.emptyConsole}>
                      <p>🎯 Click any demo button to see MagicLogger in action!</p>
                      <p>💡 Open your browser's Developer Console (F12) to see the beautiful colored output</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={styles.logEntry}>
                        <span className={styles.timestamp}>
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span 
                          className={styles.level}
                          style={{ color: getLevelColor(log.level) }}
                        >
                          {getLevelIcon(log.level)} {log.level.toUpperCase()}
                        </span>
                        <span className={styles.message}>{log.message}</span>
                        {log.data && (
                          <div className={styles.logData}>
                            {JSON.stringify(log.data, null, 2)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.demoFeatures}>
                <h4>🚀 Demo Features</h4>
                <div className={styles.featureGrid}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>🌈</span>
                    <span>Rainbow Colors</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>📊</span>
                    <span>Data Tables</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>⚡</span>
                    <span>Performance Timing</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>🎨</span>
                    <span>Custom Styling</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>📱</span>
                    <span>Browser Storage</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>🔄</span>
                    <span>Real-time Updates</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
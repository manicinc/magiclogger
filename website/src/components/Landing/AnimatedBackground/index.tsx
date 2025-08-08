// File: website/src/components/Landing/AnimatedBackground/index.tsx

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'gradient' | 'datacenter' | 'mesh' | 'waves';
  className?: string;
}

export default function AnimatedBackground({ 
  variant = 'gradient',
  className 
}: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    if (variant === 'gradient' || variant === 'mesh') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [variant]);

  if (variant === 'particles') {
    return (
      <div className={clsx(styles.particlesContainer, className)}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={clsx(styles.gradientBackground, className)}>
        <div 
          className={styles.gradientOrb1}
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className={styles.gradientOrb2}
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
        />
        <div className={styles.gradientOrb3} />
        <div className={styles.gradientOrb4} />
      </div>
    );
  }

  if (variant === 'datacenter') {
    return (
      <div className={clsx(styles.datacenterBackground, className)}>
        <div className={styles.gridPattern} />
        <div className={styles.dataStream} />
        <div className={styles.dataStream2} />
        <div className={styles.serverRacks}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.serverRack}>
              {[...Array(4)].map((_, j) => (
                <div key={j} className={styles.server}>
                  <span className={styles.serverLight} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className={clsx(styles.meshBackground, className)}>
        <svg className={styles.meshSvg} viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#764ba2" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Generate mesh points */}
          {[...Array(10)].map((_, i) => (
            [...Array(10)].map((_, j) => (
              <g key={`${i}-${j}`}>
                <circle
                  cx={120 * i + 60}
                  cy={80 * j + 40}
                  r="2"
                  fill="#667eea"
                  opacity="0.6"
                  className={styles.meshPoint}
                  style={{
                    animationDelay: `${(i + j) * 0.1}s`
                  }}
                />
                {i < 9 && (
                  <line
                    x1={120 * i + 60}
                    y1={80 * j + 40}
                    x2={120 * (i + 1) + 60}
                    y2={80 * j + 40}
                    stroke="url(#meshGradient)"
                    strokeWidth="1"
                    className={styles.meshLine}
                  />
                )}
                {j < 9 && (
                  <line
                    x1={120 * i + 60}
                    y1={80 * j + 40}
                    x2={120 * i + 60}
                    y2={80 * (j + 1) + 40}
                    stroke="url(#meshGradient)"
                    strokeWidth="1"
                    className={styles.meshLine}
                  />
                )}
              </g>
            ))
          ))}
        </svg>
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div className={clsx(styles.wavesBackground, className)}>
        <svg className={styles.waves} viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path
            className={styles.wave1}
            d="M0,100 C200,50 400,150 600,100 C800,50 1000,150 1200,100 L1200,200 L0,200 Z"
          />
          <path
            className={styles.wave2}
            d="M0,120 C200,70 400,170 600,120 C800,70 1000,170 1200,120 L1200,200 L0,200 Z"
          />
          <path
            className={styles.wave3}
            d="M0,140 C200,90 400,190 600,140 C800,90 1000,190 1200,140 L1200,200 L0,200 Z"
          />
        </svg>
      </div>
    );
  }

  return null;
}
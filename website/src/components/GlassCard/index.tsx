// File: website/src/components/GlassCard/index.tsx

import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'heavy' | 'colored';
  animated?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  className, 
  variant = 'light',
  animated = false,
  onClick 
}: GlassCardProps) {
  return (
    <div 
      className={clsx(
        styles.glassCard,
        styles[variant],
        animated && styles.animated,
        className
      )}
      onClick={onClick}>
      <div className={styles.glassContent}>
        {children}
      </div>
      {animated && <div className={styles.glassShine} />}
    </div>
  );
}
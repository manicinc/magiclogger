// File: website/src/components/Landing/AnimatedBackground/index.tsx

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'subtle';
  className?: string;
}

export default function AnimatedBackground({ 
  variant = 'subtle',
  className 
}: AnimatedBackgroundProps) {
  // Simple subtle gradient background only
  if (variant === 'subtle') {
    return (
      <div className={clsx(styles.subtleBackground, className)}>
        <div className={styles.gradientLayer} />
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={clsx(styles.gradientBackground, className)}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>
    );
  }

  return null;
}
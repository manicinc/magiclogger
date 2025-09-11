import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      // Enable analytics if already accepted
      enableAnalytics();
    }
  }, []);

  const enableAnalytics = () => {
    // Enable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
    
    // Enable Microsoft Clarity (it auto-starts when script loads)
    window.clarity?.('consent');
  };

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    enableAnalytics();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.text}>
          We use cookies for analytics. 
        </span>
        <div className={styles.buttons}>
          <button 
            className={styles.acceptBtn}
            onClick={handleAccept}
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button 
            className={styles.declineBtn}
            onClick={handleDecline}
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
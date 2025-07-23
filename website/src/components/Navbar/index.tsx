// File: website/src/components/Navbar/index.tsx

import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import ColorModeToggle from '@theme/ColorModeToggle';
import styles from './styles.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: 'Docs', to: '/docs/' },
    { label: 'API', to: './docs/api' },
    { label: 'Examples', to: './docs/examples' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Blog', to: '/blog' }
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.navbarInner}>
            {/* Logo */}
            <Link to="/" className={styles.navbarBrand}>
              <img 
                src="/img/magiclogger-icon.svg" 
                alt="MagicLogger" 
                className={styles.logoImage}
              />
              <span className={styles.logoText}>MagicLogger</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={styles.navbarNav}>
              {navItems.map((item, idx) => (
                <Link 
                  key={idx}
                  to={item.to}
                  className={`${styles.navLink} ${location.pathname.startsWith(item.to) ? styles.active : ''}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className={styles.navbarActions}>
              <ColorModeToggle 
                respectPrefersColorScheme={true}
                value={undefined}
                onChange={undefined}
              />
              
              <a 
                href="https://github.com/manicinc/magiclogger"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
                aria-label="GitHub">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              <a 
                href="https://magiclog.io"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.dashboardCTA}>
                <span className={styles.dashboardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                </span>
                <span className={styles.dashboardText}>Dashboard</span>
                <span className={styles.badge}>NEW</span>
              </a>

              <button
                className={styles.mobileMenuToggle}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu">
                <span className={styles.hamburger}>
                  <span className={styles.hamburgerLine} />
                  <span className={styles.hamburgerLine} />
                  <span className={styles.hamburgerLine} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div 
          className={styles.mobileMenuBackdrop} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        <div className={styles.mobileMenuPanel}>
          <div className={styles.mobileMenuHeader}>
            <Link to="/" className={styles.mobileMenuBrand}>
              <img 
                src="/img/magiclogger-icon.svg" 
                alt="MagicLogger" 
                className={styles.mobileLogoImage}
              />
              <span>MagicLogger</span>
            </Link>
            
            <button
              className={styles.mobileMenuClose}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <nav className={styles.mobileMenuNav}>
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            
            <div className={styles.mobileMenuDivider} />
            
            <a 
              href="https://github.com/manicinc/magiclogger"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            
            <a 
              href="https://magiclog.io"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileDashboardCTA}>
              <span className={styles.dashboardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </span>
              Open Dashboard
              <span className={styles.badge}>NEW</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Floating Dashboard Button */}
      <a 
        href="https://magiclog.io"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingDashboard}
        aria-label="Open MagicLogger Dashboard">
        <span className={styles.floatingIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
        </span>
        <span className={styles.floatingText}>Dashboard</span>
        <span className={styles.floatingBadge}>NEW</span>
      </a>
    </>
  );
}
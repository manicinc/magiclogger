import React from 'react';
import CookieConsent from '@site/src/components/CookieConsent';

// This component wraps the entire app
export default function Root({children}) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
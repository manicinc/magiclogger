import React from 'react';
import { useEffect } from 'react';

export default function ApiDocsRedirect() {
  useEffect(() => {
    // Force browser navigation to static API docs
    window.location.href = '/api/index.html';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to API documentation...</p>
      <p>
        If you are not redirected, <a href="/api/index.html" onClick={(e) => {
          e.preventDefault();
          window.location.href = '/api/index.html';
        }}>click here</a>.
      </p>
    </div>
  );
}
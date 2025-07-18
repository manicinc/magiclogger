import React from 'react';
import Layout from '@theme/Layout';
import Dashboard from '@site/src/components/Dashboard';

export default function DashboardPage() {
  return (
    <Layout
      title="MagicLogger Dashboard"
      description="Centralized log analysis and monitoring for all your MagicLogger-powered applications">
      <Dashboard />
    </Layout>
  );
}
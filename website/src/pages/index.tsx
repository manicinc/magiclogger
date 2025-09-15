// File: website/src/pages/index.tsx

import React from 'react';
import type { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import HeroSection from '@site/src/components/Landing/HeroSection';
import FeaturesSection from '@site/src/components/Landing/FeaturesSection';
import ArchitectureSection from '@site/src/components/Landing/ArchitectureSection';
import PerformanceSection from '@site/src/components/Landing/PerformanceSection';
import CodeExamplesSection from '@site/src/components/Landing/CodeExamplesSection';
import IntegrationSection from '@site/src/components/Landing/IntegrationSection';
import TestimonialsSection from '@site/src/components/Landing/TestimonialsSection';
import CTASection from '@site/src/components/Landing/CTASection';
import ScrollToTop from '@site/src/components/ScrollToTop';

/**
 * MagicLog Landing Page - Home of MagicLogger
 * 
 * The ultimate logging experience for modern JavaScript applications
 */
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="MagicLog - Home of MAGIC"
      description="Transform your console into a powerful debugging tool. MagicLogger brings color, structure, and intelligence to your logs with zero configuration.">
      <ScrollToTop />
      <HeroSection />
      <main>
        <FeaturesSection />
        <ArchitectureSection />
        <PerformanceSection />
        <CodeExamplesSection />
        {/* <IntegrationSection /> */}
        {/* <TestimonialsSection /> */}
        <CTASection />
      </main>
    </Layout>
  );
}
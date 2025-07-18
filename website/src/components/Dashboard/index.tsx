import React from 'react';
import DashboardHeader from './DashboardHeader';
import FeaturesSection from './FeaturesSection';
import IntegrationSection from './IntegrationSection';
import PricingSection from './PricingSection';
import WaitlistSection from './WaitlistSection';

export default function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <FeaturesSection />
      <IntegrationSection />
      <PricingSection />
      <WaitlistSection />
    </>
  );
}
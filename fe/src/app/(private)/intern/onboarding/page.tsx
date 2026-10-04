import type { Metadata } from 'next';

import { InternAccessGate } from '@/components/page/intern/InternAccessGate';

import OnboardingContainer from './_containers/onboarding';

export const metadata: Metadata = {
  title: 'Orientasi - SIMAD',
  description: 'Penyelesaian orientasi peserta magang PLN Persero',
};

export default function OnboardingPage() {
  return (
    <InternAccessGate>
      <OnboardingContainer />
    </InternAccessGate>
  );
}

'use client';

import React from 'react';
import { PLNBenefits } from './PLNBenefits';
import { PLNDivisions } from './PLNDivisions';
import { PLNFinalCTA } from './PLNFinalCTA';
import { PLNHero } from './PLNHero';
import { PLNLifeAtPLN } from './PLNLifeAtPLN';

export function PLNLandingSection() {
  return (
    <div className="w-full relative overflow-x-hidden bg-background text-foreground selection:bg-[#00A2E9]/20 selection:text-foreground">
      <PLNHero />
      <PLNBenefits />
      <PLNLifeAtPLN />
      <PLNDivisions />
      <PLNFinalCTA />
    </div>
  );
}

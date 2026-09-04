import { LandingAttendance } from "../../organisms/landing/LandingAttendance";
import { LandingBackground } from "../../organisms/landing/LandingBackground";
import { LandingBenefits } from "../../organisms/landing/LandingBenefits";
import { LandingCTA } from "../../organisms/landing/LandingCTA";
import { LandingCertificate } from "../../organisms/landing/LandingCertificate";
import { LandingFeatures } from "../../organisms/landing/LandingFeatures";
import { LandingHero } from "../../organisms/landing/LandingHero";
import { LandingProblem } from "../../organisms/landing/LandingProblem";
import { LandingWorkflow } from "../../organisms/landing/LandingWorkflow";

export function LandingSection() {
  return (
    <div className="w-full relative overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <LandingBackground />
      <LandingHero />
      <LandingProblem />
      <LandingWorkflow />
      <LandingFeatures />
      <LandingAttendance />
      <LandingCertificate />
      <LandingBenefits />
      <LandingCTA />
    </div>
  );
}

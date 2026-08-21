import { LandingBackground } from "../../organisms/landing/LandingBackground";
import { LandingHero } from "../../organisms/landing/LandingHero";
import { LandingProblem } from "../../organisms/landing/LandingProblem";
import { LandingWorkflow } from "../../organisms/landing/LandingWorkflow";
import { LandingFeatures } from "../../organisms/landing/LandingFeatures";
import { LandingAttendance } from "../../organisms/landing/LandingAttendance";
import { LandingCertificate } from "../../organisms/landing/LandingCertificate";
import { LandingBenefits } from "../../organisms/landing/LandingBenefits";
import { LandingCTA } from "../../organisms/landing/LandingCTA";

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

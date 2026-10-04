"use client";

import { AboutSection } from "@/components/page/landing/AboutSection";
import { FAQSection } from "@/components/page/landing/FAQSection";
import { FeaturesSection } from "@/components/page/landing/FeaturesSection";
import { FinalCTASection } from "@/components/page/landing/FinalCTASection";
import { GuideSection } from "@/components/page/landing/GuideSection";
import { HeroSection } from "@/components/page/landing/HeroSection";
import { LandingFooter } from "@/components/page/landing/LandingFooter";
import { LandingNavbar } from "@/components/page/landing/LandingNavbar";
import { LifecycleSection } from "@/components/page/landing/LifecycleSection";
import { LocationsSection } from "@/components/page/landing/LocationsSection";
import { RequirementsSection } from "@/components/page/landing/RequirementsSection";
import { VideoSection } from "@/components/page/landing/VideoSection";
import { PublicPageLoader } from "@/components/atoms/public.loader";
import { PWAInstallDialog } from "@/components/pwa/PWAInstallDialog";
import { useApi } from "@/hooks/useService/useApi";

/**
 * Main SIMAD Landing Page Container.
 *
 * Smooth scrolling is handled globally by LenisProvider (fe/src/core/providers/lenis.provinder.tsx),
 * synced with GSAP ScrollTrigger to ensure 60fps performance without duplicate scroll instances.
 */
export default function ContainerHome() {
  const api = useApi();
  const { isLoading: isLoadingOffices, data: office } =
    api.office.query.publicList();
  const { isLoading: isLoadingGuides, data: guide } = api.guide.query.list();
  const isLoading = isLoadingOffices || isLoadingGuides;

  if (isLoading) {
    return (
      <PublicPageLoader
        fullScreen
        label="Memuat Halaman..."
        sublabel="Menyiapkan modul dan data magang SIMAD..."
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative selection:bg-primary/20 selection:text-foreground">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main id="main-content" className="w-full">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. About SIMAD / Value Proposition */}
        <AboutSection />

        {/* 4. Internship Lifecycle (9 Steps) */}
        <LifecycleSection />

        {/* 5. Registration Guide (CMS Data) */}
        <GuideSection guide={guide ?? []} />

        {/* 6. Document Requirements */}
        <RequirementsSection />

        {/* 7. PLN Placement Locations & Units */}
        <LocationsSection isLoading={isLoading} office={office ?? []} />

        {/* 8. Core Features */}
        <FeaturesSection />

        {/* 9. Video Demonstration */}
        <VideoSection />

        {/* 10. Frequently Asked Questions */}
        <FAQSection />

        {/* 12. Final Call-to-Action */}
        <FinalCTASection />
      </main>

      {/* 13. Official Footer */}
      <LandingFooter />

      {/* PWA Prompt Dialog */}
      <PWAInstallDialog />
    </div>
  );
}

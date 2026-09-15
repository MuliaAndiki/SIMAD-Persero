'use client';
import { PLNLandingSection } from '@/components/page/landing/PLNLandingSection';
import NavLayout from '@/core/layouts/nav.layout';
import Lenis from 'lenis';
import React, { useEffect } from 'react';

export default function ContainerHome() {
  // Setup smooth scrolling with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: 'vertical',
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <NavLayout>
      <PLNLandingSection />
    </NavLayout>
  );
}

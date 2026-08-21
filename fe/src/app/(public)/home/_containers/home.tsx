"use client";
import NavLayout from "@/core/layouts/nav.layout";
import { LandingSection } from "@/components/page/landing/LandingSection";
import React, { useEffect } from "react";
import Lenis from "lenis";

export default function ContainerHome() {
  // Setup smooth scrolling with Lenis because we will heavily use GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
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
      <LandingSection />
    </NavLayout>
  );
}

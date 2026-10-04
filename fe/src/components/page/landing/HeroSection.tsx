'use client';

import { Button } from '@/components/atoms/button';
import { PWAInstallQR } from '@/components/pwa/PWAInstallQR';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { ScribbleArrow, ScribbleUnderline } from './primitives';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo('.hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          '-=0.4',
        )
        .fromTo(
          '.hero-annotation',
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.2',
        )
        .fromTo('.hero-pwa', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');
    }, container);

    return () => ctx.revert();
  }, []);

  const handleScrollToGuide = () => {
    const target = document.querySelector('#guide') as HTMLElement | null;
    if (target) {
      if (lenis) {
        lenis.scrollTo(target, { offset: -90, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-border/40"
    >
      {/* Background Academic Dot Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none -z-10 select-none opacity-[0.035] dark:opacity-[0.06]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <title>Grid Pattern</title>
          <defs>
            <pattern id="academic-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#academic-grid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Main Headline with SVG Scribble Underline */}
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.12] max-w-4xl">
          Ayo Magang di PLN, <br className="hidden sm:inline" />
          Raih Pengalaman Nyata Bersama{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10 text-primary">PT PLN (Persero)</span>
            <ScribbleUnderline
              colorClassName="text-warning"
              className="absolute -bottom-2 md:-bottom-3 left-0 right-0 w-full h-4 md:h-6"
              strokeWidth={3.8}
              duration={1.0}
              delay={0.5}
            />
          </span>
        </h1>

        {/* Subheadline: Ajakan dan nilai pengalaman magang */}
        <p className="hero-desc text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mt-7 mb-10 leading-relaxed font-normal">
          Jelajahi dunia industri ketenagalistrikan dan inovasi teknologi nasional. Belajar langsung
          dari para mentor profesional, asah kompetensi terbaikmu, dan jadilah bagian dari
          perjalanan menerangi Indonesia.
        </p>

        {/* CTAs with Annotation */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="hero-cta w-full sm:w-auto rounded-xl px-8 h-12 text-sm md:text-base font-semibold shadow-md group cursor-pointer"
            >
              <span>Daftar Magang Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleScrollToGuide}
            className="hero-cta w-full sm:w-auto rounded-xl px-7 h-12 text-sm md:text-base font-medium border-border hover:bg-muted cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Lihat Panduan & Syarat</span>
          </Button>
        </div>

        {/* Subtle Sketch Annotation Below CTA */}
        <div className="hero-annotation flex items-center justify-center gap-2 mb-8 select-none">
          <ScribbleArrow
            variant="curved-right"
            className="w-7 h-5 text-muted-foreground/80 -scale-y-100"
          />
          <span className="text-xs font-mono text-muted-foreground tracking-tight">
            pendaftaran terbuka untuk siswa SMA/SMK, mahasiswa D3, D4, & S1 aktif
          </span>
        </div>

        {/* PWA Install QR Code */}
        <div className="hero-pwa mb-14 flex justify-center w-full max-w-xs sm:max-w-sm">
          <PWAInstallQR />
        </div>
      </div>
    </section>
  );
}

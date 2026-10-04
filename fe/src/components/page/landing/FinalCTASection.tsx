'use client';

import { Button } from '@/components/atoms/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleUnderline } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function FinalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-card',
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
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
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Expressive Editorial Container */}
        <div className="cta-card relative rounded-3xl bg-card border-2 border-border p-8 sm:p-12 md:p-16 shadow-2xl overflow-hidden text-center">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-30 select-none">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-warning/5 blur-3xl" />
          </div>

         

          {/* Headline with SVG Scribble Underline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] max-w-3xl mx-auto mb-6">
            Siap Memulai{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 text-primary">Perjalanan Magangmu</span>
              <ScribbleUnderline
                colorClassName="text-warning"
                className="absolute -bottom-2 md:-bottom-3 left-0 right-0 w-full h-4 md:h-6"
                strokeWidth={3.8}
                duration={1.0}
                delay={0.3}
              />
            </span>{' '}
            di PLN?
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Bergabung bersama mahasiswa dari seluruh Indonesia dalam mengembangkan kompetensi
            ketenagalistrikan, teknologi informasi, dan transformasi energi nasional melalui portal
            SIMAD.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-xl px-8 h-12 text-sm sm:text-base font-semibold shadow-md group cursor-pointer"
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
              className="w-full sm:w-auto rounded-xl px-7 h-12 text-sm sm:text-base font-medium border-border hover:bg-muted cursor-pointer"
            >
              <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Lihat Panduan Pendaftaran</span>
            </Button>
          </div>

          {/* Marginalia Note */}
          <div className="flex items-center justify-center gap-2 select-none mb-10">
            <ScribbleArrow
              variant="curved-right"
              className="w-5 h-5 text-muted-foreground rotate-12"
            />
            <span className="text-xs font-mono text-muted-foreground">
              proses pendaftaran mandiri & bebas biaya administrasi
            </span>
          </div>

          {/* Quality Seals Strip */}
          <div className="pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>100% Pendaftaran Digital</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Sertifikat Terakreditasi Ber-QR</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Terbuka Slta, D3, D4, & S1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Button } from '@/components/atoms/button';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleUnderline } from './primitives';

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

      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.1 },
      )
        .fromTo('.hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
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
        .fromTo(
          '.hero-preview',
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9 },
          '-=0.4',
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
          Magang di PLN, <br className="hidden sm:inline" />
          Lebih Terarah dalam{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10 text-primary">Satu Sistem</span>
            <ScribbleUnderline
              colorClassName="text-warning"
              className="absolute -bottom-2 md:-bottom-3 left-0 right-0 w-full h-4 md:h-6"
              strokeWidth={3.8}
              duration={1.0}
              delay={0.5}
            />
          </span>
          .
        </h1>

        {/* Subheadline */}
        <p className="hero-desc text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mt-7 mb-10 leading-relaxed font-normal">
          Kelola seluruh proses magang mulai dari pendaftaran berkas, verifikasi tim HR, penempatan
          unit kerja, absensi digital berbasis lokasi, evaluasi berkala mentor, hingga sertifikat
          resmi digital melalui SIMAD.
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
            <span>Lihat Panduan</span>
          </Button>
        </div>

        {/* Subtle Sketch Annotation Below CTA */}
        <div className="hero-annotation flex items-center justify-center gap-2 mb-16 select-none">
          <ScribbleArrow
            variant="curved-right"
            className="w-7 h-5 text-muted-foreground/80 -scale-y-100"
          />
          <span className="text-xs font-mono text-muted-foreground tracking-tight">
            pendaftaran terbuka untuk sma, mahasiswa D3, D4, & S1 aktif
          </span>
        </div>

        {/* Realistic High-Fidelity SIMAD Preview Composition (No Fake Grays) */}
        <div className="hero-preview w-full max-w-5xl rounded-2xl bg-card border border-border shadow-xl p-5 md:p-8 text-left relative overflow-hidden">
          {/* Top Bar Indicator */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                PLN
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  SIMAD Workspace Preview
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Alur operasional digital peserta & mentor
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Feature Cards Composition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Card 1: Penempatan & Bimbingan */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Penempatan Unit
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Terverifikasi
                  </span>
                </div>
                <h5 className="font-semibold text-sm text-foreground mb-1">UID Jawa Barat</h5>
                <p className="text-xs text-muted-foreground mb-3">
                  Divisi Manajemen Transmisi & Jaringan Distribusi
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-foreground/80">
                <UserCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">Mentor: Ir. Bambang Tri, M.T.</span>
              </div>
            </div>

            {/* Card 2: Presensi GPS Geofence */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-success flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Presensi Digital
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-success/15 text-success">
                    Tepat Waktu
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold font-mono text-foreground">07:42</span>
                  <span className="text-xs text-muted-foreground">WIB (Masuk)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Geofence Radius: 18m di dalam area kantor
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>GPS & Waktu Tervalidasi</span>
              </div>
            </div>

            {/* Card 3: Sertifikat Resmi Ber-QR */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-warning" />
                    Sertifikat Kelulusan
                  </span>
                  <QrCode className="w-4 h-4 text-primary" />
                </div>
                <h5 className="font-semibold text-sm text-foreground mb-1">
                  Sertifikat Terakreditasi
                </h5>
                <p className="text-xs text-muted-foreground mb-3 font-mono">
                  No. PLN-INT/2026/0488
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Verifikasi Digital</span>
                <span className="font-semibold text-primary">Resmi PT PLN</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Editorial Strip */}
          <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>Digitalisasi 100% dari Pendaftaran hingga Evaluasi</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Jadwal & Absensi Terintegrasi Real-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Keaslian Sertifikat Terverifikasi Sistem</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

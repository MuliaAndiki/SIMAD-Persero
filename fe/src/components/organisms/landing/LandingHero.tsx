'use client';
import gsap from 'gsap';
import { ArrowRight, Calendar, CheckCircle2, User } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export function LandingHero() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      tl.fromTo('.hero-label', { opacity: 0, y: 15 }, { opacity: 1, y: 0, delay: 0.2 })
        .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=0.7')
        .fromTo('.hero-desc', { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=0.7')
        .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, '-=0.7')
        .fromTo(
          '.hero-dashboard',
          { opacity: 0, y: 50, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1 },
          '-=0.5',
        );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="hero-title text-4xl md:text-5xl lg:text-7xl tracking-tight text-foreground font-semibold max-w-4xl mb-6">
          Kelola Program Magang Lebih{' '}
          <span className="text-primary italic font-serif">Terstruktur</span>
        </h1>

        {/* Description */}
        <p className="hero-desc text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Tinggalkan proses administrasi manual. SIMAD mendigitalisasi seluruh tahapan magang
          institusi Anda—mulai dari pengajuan, absensi berbasis lokasi, hingga penerbitan sertifikat
          digital.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          <Link
            href="/register"
            className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/30 min-h-[48px]"
          >
            Mulai Pengajuan
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-border text-foreground font-medium rounded-lg hover:border-foreground/30 hover:bg-muted/50 transition-colors min-h-[48px]"
          >
            Masuk
          </Link>
        </div>

        {/* Stylized Dashboard Visual */}
        <div className="hero-dashboard relative w-full max-w-5xl aspect-[16/9] md:aspect-[21/9] bg-card rounded-2xl border border-border shadow-2xl p-4 md:p-6 overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div className="w-full h-12 border-b border-border flex items-center justify-between pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
            <div className="h-4 w-32 bg-muted rounded-full" />
          </div>

          {/* Main Dashboard Layout */}
          <div className="flex-1 flex gap-6">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col gap-4 w-48 border-r border-border pr-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-8 rounded-md w-full ${i === 1 ? 'bg-primary/10' : 'bg-muted'}`}
                />
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-1 h-24 bg-secondary/50 rounded-xl border border-border flex flex-col justify-center px-4">
                  <User className="w-5 h-5 text-primary mb-2" />
                  <div className="w-20 h-3 bg-foreground/20 rounded mb-2" />
                  <div className="w-12 h-5 bg-foreground rounded" />
                </div>
                <div className="flex-1 h-24 bg-success/10 rounded-xl border border-success/20 flex flex-col justify-center px-4">
                  <CheckCircle2 className="w-5 h-5 text-success mb-2" />
                  <div className="w-24 h-3 bg-success/40 rounded mb-2" />
                  <div className="w-16 h-5 bg-foreground rounded" />
                </div>
                <div className="hidden sm:flex flex-1 h-24 bg-warning/10 rounded-xl border border-warning/20 flex-col justify-center px-4">
                  <Calendar className="w-5 h-5 text-warning mb-2" />
                  <div className="w-16 h-3 bg-warning/40 rounded mb-2" />
                  <div className="w-12 h-5 bg-foreground rounded" />
                </div>
              </div>
              <div className="flex-1 bg-muted/30 rounded-xl border border-border p-4">
                <div className="w-1/3 h-5 bg-foreground/20 rounded mb-6" />
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full h-12 bg-card rounded-lg border border-border mb-3 flex items-center px-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted mr-4" />
                    <div className="w-1/4 h-3 bg-foreground/30 rounded mr-auto" />
                    <div className="w-20 h-4 rounded-full bg-success/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

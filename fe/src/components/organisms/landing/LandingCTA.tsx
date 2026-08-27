'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingCTA() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container.current,
            start: 'top 80%',
          },
        },
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="relative py-32 bg-primary overflow-hidden px-4 sm:px-6 lg:px-8 border-y border-primary/20"
    >
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 cta-content">
        <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
          Kelola Proses Magang Dalam Satu Sistem
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Mulai proses magang secara lebih terstruktur, transparan, dan terdokumentasi dengan baik
          bersama SIMAD.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-background text-primary font-medium rounded-lg hover:bg-muted transition-colors shadow-xl shadow-black/10 hover:shadow-black/20 min-h-[48px]"
          >
            Mulai Pengajuan
            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-primary-foreground/30 text-primary-foreground font-medium rounded-lg hover:bg-primary-foreground/10 transition-colors min-h-[48px]"
          >
            Daftar SEbagai Peserta Magang
          </Link>
        </div>
      </div>
    </section>
  );
}

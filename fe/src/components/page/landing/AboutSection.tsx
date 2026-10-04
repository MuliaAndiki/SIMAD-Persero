'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users2,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleCircle } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PILLARS = [
  {
    icon: FileCheck2,
    title: 'Pendaftaran & Verifikasi Terpusat',
    description:
      'Calon peserta mengunggah berkas CV dan Surat Pengantar Fakultas secara digital. Status kelayakan diverifikasi transparan oleh tim HR.',
    tag: 'Tanpa Berkas Fisik',
  },
  {
    icon: CalendarCheck,
    title: 'Presensi Digital Berbasis Geofence',
    description:
      'Pencatatan absensi masuk dan pulang otomatis memvalidasi koordinat GPS dan batas waktu toleransi di area unit kantor PLN.',
    tag: 'Validasi GPS Real-time',
  },
  {
    icon: Users2,
    title: 'Bimbingan Terstruktur Mentor',
    description:
      'Setiap peserta dibimbing langsung oleh supervisor profesional dengan pendampingan proyek nyata dan persetujuan jurnal harian.',
    tag: 'Praktik Industri Nyata',
  },
  {
    icon: LineChart,
    title: 'Evaluasi Kinerja Komprehensif',
    description:
      'Penilaian berkala mencakup aspek kedisiplinan, pemahaman teknis, etika kerja, hingga evaluasi laporan akhir secara terstandarisasi.',
    tag: 'Objektif & Terukur',
  },
  {
    icon: Award,
    title: 'Penerbitan Sertifikat Resmi Ber-QR',
    description:
      'Sertifikat kelulusan diterbitkan otomatis setelah menyelesaikan seluruh masa magang dan dapat diverifikasi langsung keasliannya.',
    tag: 'Anti-Pemalsuan',
  },
];

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.about-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.about-compare',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.about-compare',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.about-pillar-item',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.about-pillars-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="about-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
         
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
            Satu Platform untuk{' '}
            <span className="relative inline-block">
              <ScribbleCircle colorClassName="text-primary">
                <span>Seluruh Proses</span>
              </ScribbleCircle>
            </span>{' '}
            Magang
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            SIMAD mengintegrasikan seluruh tahapan administratif dan operasional program magang di
            lingkungan PT PLN (Persero) ke dalam ekosistem digital terpadu.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow variant="curved-down-right" className="w-5 h-5 text-primary rotate-12" />
            <span className="text-xs font-mono text-primary font-medium tracking-tight">
              "dari pendaftaran awal sampai penerbitan sertifikat"
            </span>
          </div>
        </div>

        {/* Editorial Value Pillars: Clean, non-monolithic layout */}
        <div className="about-pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="about-pillar-item bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    {pillar.tag}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Credential Summary Box as 6th Item to complete the 3x2 grid */}
          <div className="about-pillar-item bg-secondary/50 border border-primary/20 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
               
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Terintegrasi Standar PLN</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Menjamin transparansi seleksi, keamanan data mahasiswa, serta kepatuhan aturan
                ketenagakerjaan dan keselamatan kerja (K3) di seluruh unit kerja PLN.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Regulasi Ketenagaan</span>
              <span className="font-semibold text-primary">PT PLN (Persero)</span>
            </div>
          </div>
        </div>

        {/* Transformation Comparison: Manual vs SIMAD */}
        
      </div>
    </section>
  );
}

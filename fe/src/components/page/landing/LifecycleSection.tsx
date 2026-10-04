'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Award,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  FileCheck,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { AcademicNote, ScribbleArrow } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LIFECYCLE_STEPS = [
  {
    step: '01',
    title: 'Daftar Akun',
    desc: 'Registrasi akun SIMAD menggunakan email aktif mahasiswa.',
    icon: UserPlus,
    badge: 'Mulai',
  },
  {
    step: '02',
    title: 'Lengkapi Profil',
    desc: 'Isi biodata lengkap, NIM, perguruan tinggi, dan jurusan.',
    icon: GraduationCap,
  },
  {
    step: '03',
    title: 'Upload Dokumen',
    desc: 'Unggah Curriculum Vitae (CV) & Surat Pengantar Fakultas (PDF).',
    icon: FileCheck,
    highlight: 'Wajib',
  },
  {
    step: '04',
    title: 'Ajukan Magang',
    desc: 'Pilih unit kantor PLN, divisi peminatan, & periode magang.',
    icon: Briefcase,
  },
  {
    step: '05',
    title: 'Verifikasi Admin',
    desc: 'Pemeriksaan kesesuaian berkas oleh tim HR PT PLN (Persero).',
    icon: ShieldCheck,
    highlight: 'Seleksi',
  },
  {
    step: '06',
    title: 'Penempatan',
    desc: 'Penetapan resmi unit kerja, jadwal orientasi, & mentor lapangan.',
    icon: FileSpreadsheet,
  },
  {
    step: '07',
    title: 'Pelaksanaan Magang',
    desc: 'Presensi digital geofence harian & pengisian logbook aktivitas.',
    icon: CalendarCheck,
    highlight: 'Praktik',
  },
  {
    step: '08',
    title: 'Evaluasi',
    desc: 'Penilaian capaian kompetensi & ulasan akhir dari supervisor mentor.',
    icon: CheckCircle,
  },
  {
    step: '09',
    title: 'Sertifikat',
    desc: 'Penerbitan sertifikat digital resmi ber-QR Code kelulusan.',
    icon: Award,
    highlight: 'Selesai',
  },
];

export function LifecycleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        '.lifecycle-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.lifecycle-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Line progress animation
      gsap.fromTo(
        '.lifecycle-progress-line',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top 75%',
            end: 'bottom 80%',
            scrub: true,
          },
        },
      );

      // Steps Stagger Animation
      gsap.fromTo(
        '.lifecycle-step-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: trackRef.current,
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
      id="lifecycle"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="lifecycle-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
         
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Bagaimana Proses Magang Berjalan?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Sembilan tahapan terencana yang mendampingi perjalanan magang Anda, dari pembuatan akun
            hingga perolehan sertifikat kompetensi resmi.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow
              variant="curved-right"
              className="w-5 h-5 text-muted-foreground rotate-12"
            />
            <span className="text-xs font-mono text-muted-foreground">
              alur transparan & terpantau berkala
            </span>
          </div>
        </div>

        {/* Steps Grid: Responsive Editorial Flow */}
        <div ref={trackRef} className="relative">
          {/* Visual Step Progress Bar */}
          <div className="w-full h-1.5 bg-border/60 rounded-full mb-10 overflow-hidden relative">
            <div className="lifecycle-progress-line w-full h-full bg-primary rounded-full origin-left" />
          </div>

          {/* Desktop/Tablet Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIFECYCLE_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="lifecycle-step-card group bg-card border border-border rounded-xl p-6 relative hover:border-primary/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Big Number & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-extrabold font-mono text-primary/40 group-hover:text-primary transition-colors">
                        {item.step}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.highlight && (
                          <AcademicNote
                            variant={item.step === '09' ? 'sticky' : 'marker'}
                            rotate={item.step === '09' ? 'right' : 'none'}
                          >
                            {item.highlight}
                          </AcademicNote>
                        )}
                        <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Tahap {item.step} dari 09</span>
                    <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity font-medium">
                      SIMAD Lifecycle →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

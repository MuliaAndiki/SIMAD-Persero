'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { AcademicNote, ScribbleArrow } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  {
    icon: FileText,
    title: 'Pengajuan Magang Online',
    desc: 'Proses pengunggahan berkas CV dan Surat Pengantar resmi dilakukan mandiri tanpa perlu mengirimkan dokumen fisik ke kantor.',
    tag: 'Paperless',
    badgeText: 'Pendaftaran Cepat',
  },
  {
    icon: ShieldCheck,
    title: 'Monitoring Status Real-Time',
    desc: 'Pantau tahapan peninjauan berkas oleh tim HR secara transparan, mulai dari seleksi administrasi hingga penetapan jadwal orientasi.',
    tag: 'Transparan',
    badgeText: 'Pelacakan Status',
  },
  {
    icon: MapPin,
    title: 'Presensi Digital & Geofencing',
    desc: 'Pencatatan kehadiran harian tervalidasi langsung melalui koordinat GPS di area kantor PLN dengan toleransi batas waktu yang jelas.',
    tag: 'Akurasi Tinggi',
    badgeText: 'GPS Validated',
  },
  {
    icon: UserCheck,
    title: 'Bimbingan & Logbook Kegiatan',
    desc: 'Dokumentasikan tugas dan pencapaian proyek harian dalam logbook yang diperiksa serta disetujui langsung oleh supervisor mentor.',
    tag: 'Terstruktur',
    badgeText: 'Mentor Approval',
  },
  {
    icon: BookOpenCheck,
    title: 'Evaluasi Kinerja Terstandar',
    desc: 'Penilaian berkala mencakup aspek kedisiplinan, kompetensi teknis, etika profesional, dan ulasan akhir laporan magang.',
    tag: 'Objektif',
    badgeText: 'Standar PLN',
  },
  {
    icon: Award,
    title: 'Sertifikat Digital & Verifikasi QR',
    desc: 'Penerbitan otomatis sertifikat kelulusan bertanda tangan digital resmi dengan kode verifikasi instan untuk pihak kampus & rekruter.',
    tag: 'Anti-Pemalsuan',
    badgeText: 'QR Verifiable',
  },
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feat-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.feat-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.feat-card',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.feat-grid',
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
      id="features"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="feat-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Kemampuan Sistem</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Fitur Utama SIMAD
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Dirancang secara khusus untuk mempermudah calon peserta dan mahasiswa menjalani
            pengalaman magang yang profesional, terarah, dan transparan.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow variant="curved-right" className="w-5 h-5 text-primary rotate-12" />
            <span className="text-xs font-mono text-primary font-medium">
              "seluruh fasilitas dapat diakses melalui web & perangkat mobile"
            </span>
          </div>
        </div>

        {/* Features Grid: 3x2 Editorial Layout */}
        <div className="feat-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="feat-card bg-card border border-border rounded-xl p-6 lg:p-7 relative hover:border-primary/50 transition-all duration-300 shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {feat.badgeText}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {feat.tag}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">Terintegrasi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

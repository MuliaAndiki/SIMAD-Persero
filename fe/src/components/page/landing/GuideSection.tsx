'use client';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  PlayCircle,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleUnderline } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FALLBACK_GUIDES: Array<Partial<GuideItem> & { fallbackNumber: string }> = [
  {
    id: 'fb-1',
    fallbackNumber: '01',
    title: 'Buat Akun SIMAD',
    slug: 'buat-akun-simad',
    description:
      'Registrasi akun menggunakan email aktif mahasiswa, lalu konfirmasi tautan aktivasi yang dikirimkan ke kotak masuk.',
    content:
      'Langkah pertama adalah membuat akun di portal SIMAD. Pastikan email yang didaftarkan aktif dan dapat menerima email verifikasi. Gunakan kata sandi yang aman.',
    displayOrder: 1,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'fb-2',
    fallbackNumber: '02',
    title: 'Lengkapi Biodata & Profil',
    slug: 'lengkapi-biodata-profil',
    description:
      'Isi identitas diri, nomor induk mahasiswa (NIM), nomor kontak aktif, serta pilih perguruan tinggi dan program studi.',
    content:
      'Lengkapi seluruh form data diri pada menu Profil. Pastikan nama lengkap sesuai dengan kartu mahasiswa dan KTP untuk keperluan administrasi tanda pengenal kantor.',
    displayOrder: 2,
    videoUrl: null,
  },
  {
    id: 'fb-3',
    fallbackNumber: '03',
    title: 'Upload CV & Surat Pengantar Fakultas',
    slug: 'upload-cv-surat-pengantar',
    description:
      'Unggah Curriculum Vitae terbaru dan Surat Permohonan resmi yang ditandatangani dekanat/jurusan dalam format PDF (maks 2MB).',
    content:
      'Berkas wajib yang harus dilampirkan adalah CV dan Surat Pengantar resmi dari pihak kampus. Pastikan cap stempel dan tanda tangan pimpinan terlihat jelas.',
    displayOrder: 3,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'fb-4',
    fallbackNumber: '04',
    title: 'Pilih Unit Kerja & Kirim Pengajuan',
    slug: 'pilih-unit-kirim-pengajuan',
    description:
      'Tentukan unit kantor PLN, departemen peminatan, serta tanggal mulai dan selesai magang. Pantau status review di dashboard.',
    content:
      'Pilih unit kantor PLN yang sesuai dengan minat dan domisili Anda. Setelah pengajuan dikirim, tim HR Admin akan memverifikasi berkas dalam waktu 3-5 hari kerja.',
    displayOrder: 4,
    videoUrl: null,
  },
];

export function GuideSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  const api = useApi();
  const guidesQuery = api.guide.query.list({ category: 'REGISTRATION' });

  // Process data from API or use curated fallback
  const guides = useMemo(() => {
    const rawData = guidesQuery.data;
    const items: GuideItem[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.data)
        ? (rawData as any).data
        : [];

    if (items.length > 0) {
      return items.filter((g) => g.isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return FALLBACK_GUIDES as unknown as GuideItem[];
  }, [guidesQuery.data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.guide-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.guide-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.guide-card',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.guide-grid',
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
      id="guide"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="guide-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Materi Panduan Resmi</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Panduan Cara Daftar Magang
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Petunjuk resmi pendaftaran akun, melengkapi biodata, dan mengunggah berkas wajib yang
            disusun langsung untuk calon peserta magang SIMAD.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow variant="curved-right" className="w-5 h-5 text-primary rotate-12" />
            <span className="text-xs font-mono text-primary font-medium">
              "baca dengan teliti sebelum mengirimkan permohonan"
            </span>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="guide-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {guides.map((guide, idx) => {
            const stepNum = String(guide.displayOrder || idx + 1).padStart(2, '0');
            const hasVideo = Boolean(guide.videoUrl);

            return (
              <div
                key={guide.id || guide.slug}
                className="guide-card group bg-card border border-border rounded-xl p-6 relative hover:border-primary/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-primary/40 group-hover:text-primary transition-colors">
                      {stepNum}
                    </span>
                    {hasVideo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {guide.description || guide.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGuide(guide)}
                    className="w-full inline-flex items-center justify-between text-xs font-semibold text-primary hover:text-primary/80 py-1.5 cursor-pointer"
                  >
                    <span>Baca Panduan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {hasVideo && (
                    <a
                      href={guide.videoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground py-1 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">Tonton Tutorial Singkat</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-2xl bg-secondary/50 border border-border p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-foreground mb-1">
                Butuh informasi tata tertib magang & presensi?
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pelajari materi orientasi lengkap mengenai jam kerja kantor dan ketentuan koreksi
                absensi.
              </p>
            </div>
          </div>
          <Link href="/login" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-xl px-6 h-11 shadow-xs cursor-pointer">
              <span>Masuk ke Pusat Panduan</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Guide Content Reader Dialog */}
      {selectedGuide && (
        <Dialog
          open={Boolean(selectedGuide)}
          onOpenChange={(open) => !open && setSelectedGuide(null)}
        >
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <AcademicNote variant="outline">Materi Panduan</AcademicNote>
                {selectedGuide.videoUrl && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                    <Video className="w-3.5 h-3.5" /> Video Tersedia
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedGuide.title}
              </DialogTitle>
              {selectedGuide.description && (
                <DialogDescription className="text-sm text-muted-foreground">
                  {selectedGuide.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-4 pt-4 border-t border-border space-y-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {selectedGuide.content}
            </div>

            {selectedGuide.videoUrl && (
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Video tutorial panduan ini:</span>
                <a
                  href={selectedGuide.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <PlayCircle className="w-4 h-4" />
                  Buka Video Tutorial
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

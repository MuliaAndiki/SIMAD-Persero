'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/atoms/accordion';
import { Button } from '@/components/atoms/button';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelpCircle, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef } from 'react';
import { AcademicNote, ScribbleArrow } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FALLBACK_FAQS = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara mendaftar program magang di PLN melalui SIMAD?',
    answer:
      'Pendaftaran dilakukan secara mandiri dengan membuat akun di SIMAD, melengkapi data profil mahasiswa, mengunggah Curriculum Vitae (CV) dan Surat Pengantar resmi Fakultas dalam format PDF, lalu memilih unit kantor PLN dan departemen yang diminati.',
  },
  {
    id: 'faq-2',
    question: 'Apa saja dokumen persyaratan wajib yang harus disiapkan?',
    answer:
      'Dokumen wajib mencakup: (1) Curriculum Vitae (CV) terbaru, (2) Surat Pengantar/Permohonan resmi dari Dekanat atau Ketua Jurusan yang mencantumkan durasi magang, dan (3) Kartu Tanda Mahasiswa (KTM) aktif. Pastikan ukuran file tidak melebihi 2 MB.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana mengetahui apakah pengajuan magang diterima atau ditolak?',
    answer:
      'Calon peserta dapat memantau status pengajuan secara real-time di portal SIMAD. Status akan berubah dari "Diajukan", "Dalam Review HR", hingga "Diterima" atau "Ditolak". Notifikasi resmi juga akan dikirimkan melalui email yang terdaftar.',
  },
  {
    id: 'faq-4',
    question: 'Siapa yang menentukan tanggal mulai magang dan penempatan divisi?',
    answer:
      'Peserta mengusulkan tanggal mulai dan selesai saat pengajuan awal. Namun, tanggal pelaksanaan resmi dan penempatan divisi final ditetapkan oleh Tim HR dan Unit Kerja PLN berdasarkan kapasitas kuota dan kebutuhan proyek bimbingan.',
  },
  {
    id: 'faq-5',
    question: 'Bagaimana jika absensi harian mengalami kendala GPS atau waktu kerja?',
    answer:
      'SIMAD dilengkapi fitur "Pengajuan Koreksi Absensi" di menu Riwayat. Jika terjadi kendala GPS atau penugasan di luar kantor, peserta dapat mengajukan koreksi dengan melampirkan foto bukti kegiatan dan persetujuan dari supervisor mentor.',
  },
  {
    id: 'faq-6',
    question: 'Kapan dan bagaimana sertifikat magang resmi dapat diunduh?',
    answer:
      'Sertifikat kelulusan digital akan diterbitkan otomatis setelah peserta menyelesaikan seluruh durasi magang, memenuhi batas minimal kehadiran, dan evaluasi akhir disetujui oleh Supervisor serta HR Admin. Sertifikat ber-QR Code dapat diunduh kapan saja melalui portal SIMAD.',
  },
];

export function FAQSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const api = useApi();
  const faqQuery = api.guide.query.list({ category: 'FAQ' });

  const faqs = useMemo(() => {
    const rawData = faqQuery.data;
    const items: GuideItem[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.data)
        ? (rawData as any).data
        : [];

    if (items.length > 0) {
      return items
        .filter((g) => g.isPublished)
        .map((g) => ({
          id: g.id || g.slug,
          question: g.title,
          answer: g.content || g.description || '',
        }));
    }
    return FALLBACK_FAQS;
  }, [faqQuery.data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.faq-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.faq-accordion-container',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.faq-accordion-container',
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
      id="faq"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="faq-header text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Pusat Bantuan & Tanya Jawab</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Temukan jawaban komprehensif seputar proses pendaftaran, tata tertib absensi, dan
            mekanisme penilaian program magang di PT PLN (Persero).
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow variant="curved-right" className="w-5 h-5 text-primary rotate-12" />
            <span className="text-xs font-mono text-primary font-medium">
              "klik pertanyaan untuk membuka penjelasan rinci"
            </span>
          </div>
        </div>

        {/* Existing Radix Accordion */}
        <div className="faq-accordion-container bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm mb-12">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-border/60 last:border-b-0 py-1"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors py-4">
                  <span className="flex items-start gap-3">
                    <span className="font-mono text-xs sm:text-sm text-primary/60 font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7 pr-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still Have Questions Box */}
        <div className="rounded-xl bg-muted/40 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Punya pertanyaan lain yang belum terjawab?
              </h4>
              <p className="text-xs text-muted-foreground">
                Hubungi narahubung rekrutmen magang atau kirim permohonan informasi ke tim HR SIMAD.
              </p>
            </div>
          </div>
          <Link href="/register" className="shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs font-semibold px-4 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              <span>Daftar Akun Tanya HR</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

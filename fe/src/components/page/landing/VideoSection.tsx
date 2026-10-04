'use client';

import { Button } from '@/components/atoms/button';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Film,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleCircle } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function getYouTubeEmbedUrl(url: string): string {
  try {
    if (url.includes('embed/')) return `${url}?autoplay=1`;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1`;
    }
  } catch {
    // fallback
  }
  return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1';
}

export function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const lenis = useLenis();

  const api = useApi();
  const guidesQuery = api.guide.query.list();

  // Find guide with videoUrl
  const featuredGuide = useMemo(() => {
    const rawData = guidesQuery.data;
    const items: GuideItem[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.data)
        ? (rawData as any).data
        : [];

    const withVideo = items.find((g) => g.videoUrl && g.isPublished);
    return (
      withVideo || {
        title: 'Tutorial Pendaftaran & Alur Magang SIMAD',
        description:
          'Simak panduan langkah demi langkah cara membuat akun, melengkapi berkas, dan memilih penempatan divisi PLN.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }
    );
  }, [guidesQuery.data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.video-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.video-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.video-frame-container',
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          scrollTrigger: {
            trigger: '.video-frame-container',
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

  const embedUrl = getYouTubeEmbedUrl(featuredGuide.videoUrl || '');

  return (
    <section
      id="tutorial"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="video-header text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Video Demonstrasi</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Masih Bingung?{' '}
            <span className="relative inline-block">
              <ScribbleCircle colorClassName="text-warning">
                <span>Lihat Cara</span>
              </ScribbleCircle>
            </span>{' '}
            Menggunakan SIMAD
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Saksikan video tutorial singkat yang memandu Anda dari pendaftaran akun hingga
            penerbitan sertifikat digital resmi.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow
              variant="curved-right"
              className="w-5 h-5 text-muted-foreground rotate-12"
            />
            <span className="text-xs font-mono text-muted-foreground">
              putar video untuk penjelasan visual langkah demi langkah
            </span>
          </div>
        </div>

        {/* Lazy Loaded Responsive Video Card */}
        <div className="video-frame-container relative w-full aspect-video rounded-2xl bg-card border-2 border-border shadow-2xl overflow-hidden mb-12">
          {isPlaying ? (
            <iframe
              src={embedUrl}
              title={featuredGuide.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-card via-secondary/60 to-card flex flex-col items-center justify-center p-6 text-center">
              {/* Corner Watermarks */}
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Film className="w-4 h-4 text-primary" />
                <span>Tutorial Resmi SIMAD</span>
              </div>
              <div className="absolute top-4 right-4 hidden sm:block">
                <AcademicNote variant="sticky" rotate="none">
                  Format Video HD
                </AcademicNote>
              </div>

              {/* Large Play Trigger Button */}
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 mb-6 cursor-pointer"
                aria-label="Putar video tutorial"
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping group-hover:block" />
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
              </button>

              <h3 className="text-lg sm:text-2xl font-bold text-foreground max-w-xl mb-2">
                {featuredGuide.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mb-4 line-clamp-2">
                {featuredGuide.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  Panduan Terverifikasi HR
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  PT PLN (Persero)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Section Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleScrollToGuide}
            className="w-full sm:w-auto rounded-xl px-7 h-12 text-sm font-semibold border-border hover:bg-muted cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2 text-primary" />
            <span>Lihat Semua Panduan Tertulis</span>
          </Button>

          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-xl px-7 h-12 text-sm font-semibold shadow-xs cursor-pointer"
            >
              <span>Mulai Mendaftar Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

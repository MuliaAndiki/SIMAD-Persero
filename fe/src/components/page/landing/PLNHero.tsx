'use client';

import { type Variants, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { PWAInstallQR } from '@/components/pwa/PWAInstallQR';

/* ─── Animated counter ─── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  return (
    <motion.span
      onViewportEnter={() => {
        let start = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(interval);
          } else {
            setCount(start);
          }
        }, 30);
      }}
      className="tabular-nums"
    >
      {count.toLocaleString('id-ID')}
      {suffix}
    </motion.span>
  );
}

/* ─── Floating grid background ─── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A2E9]/5 via-transparent to-[#FDB913]/5" />

      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Grid Pattern Background</title>
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Abstract gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,162,233,0.12) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(253,185,19,0.08) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 2 }}
      />

      {/* Diagonal energy lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00A2E9]/10 to-transparent rotate-12" />
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FDB913]/10 to-transparent -rotate-6" />
    </div>
  );
}

/* ─── Stat badge ─── */
function StatBadge({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className="flex flex-col items-center"
    >
      <span className="text-2xl md:text-3xl font-bold text-foreground">
        <AnimatedNumber target={value} suffix={suffix} />
      </span>
      <span className="text-xs md:text-sm text-muted-foreground mt-1">{label}</span>
    </motion.div>
  );
}

/* ─── Hero Section ─── */
export function PLNHero() {
  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <HeroBackground />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center pt-28 pb-16 md:pt-36 md:pb-24"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow badge */}

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
        >
          Membangun Masa Depan{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-[#00A2E9]">Energi</span>
            <motion.span
              className="absolute bottom-1 left-0 right-0 h-3 bg-[#FDB913]/30 rounded-sm -z-0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              style={{ transformOrigin: 'left' }}
            />
          </span>{' '}
          Bersama PLN
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
        >
          Bergabung dalam program magang yang menempatkan Anda langsung di proyek infrastruktur
          energi nasional — dari pembangkit, transmisi, hingga transformasi digital kelistrikan
          Indonesia.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-16"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5
                       bg-[#00A2E9] text-white font-medium rounded-xl
                       hover:bg-[#0091d1] active:bg-[#0080ba]
                       transition-colors duration-200
                       shadow-lg shadow-[#00A2E9]/20 hover:shadow-[#00A2E9]/30
                       min-h-[48px]"
          >
            Lihat Posisi Magang
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#program"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5
                       bg-transparent border border-border text-foreground font-medium rounded-xl
                       hover:bg-muted/60 hover:border-foreground/20
                       transition-colors duration-200
                       min-h-[48px]"
          >
            Pelajari Program
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-8 md:gap-14 pt-8 border-t border-border/60 w-full max-w-lg"
        >
          <StatBadge value={10000} suffix="+" label="Alumni Magang" delay={1} />
          <div className="w-px h-10 bg-border" />
          <StatBadge value={34} suffix="" label="Provinsi" delay={1.15} />
          <div className="w-px h-10 bg-border" />
          <StatBadge value={50} suffix="+" label="Divisi" delay={1.3} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
        </motion.div>
      </motion.div>

      {/* PWA QR Code - Desktop Only */}
      <motion.div
        className="hidden lg:block absolute bottom-8 right-8 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <PWAInstallQR />
      </motion.div>
    </section>
  );
}

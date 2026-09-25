'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const NotFound = () => {
  const router: AppRouterInstance = useRouter();

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-background">
      {/* Background ambient lighting and grid */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00A2E9]/5 via-transparent to-[#FDB913]/5" />

        {/* Abstract gradient orbs */}
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00A2E9]/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FDB913]/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Subtle grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Grid Pattern</title>
          <defs>
            <pattern id="not-found-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#not-found-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-background/80 backdrop-blur-md shadow-xs mb-8"
        >
          <div className="flex items-center justify-center size-6 rounded-full bg-[#00A2E9]/10 text-[#00A2E9]">
            <Zap className="size-3.5 fill-[#00A2E9]" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-foreground">
            PLN SIMAD • Sistem Informasi Magang
          </span>
        </motion.div>

        {/* 404 Illustration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="relative size-64 sm:size-72 md:size-80 rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl shadow-2xl p-4 flex items-center justify-center">
            <Image
              alt="Halaman Tidak Ditemukan - SIMAD PLN"
              src="/illustrations/404.png"
              className="object-contain drop-shadow-md"
              width={280}
              height={280}
              priority
            />
          </div>
          {/* Decorative floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute -bottom-3 -right-2 sm:right-2 bg-gradient-to-r from-[#00A2E9] to-[#0081ba] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="size-3" />
            <span>Kode 404</span>
          </motion.div>
        </motion.div>

        {/* Copy / Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau tautan yang
            dimasukkan kurang tepat.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-[#00A2E9] text-white hover:bg-[#0091d1] active:bg-[#0080ba] shadow-md shadow-[#00A2E9]/20 rounded-xl min-h-[44px] px-6"
            onClick={() => router.push('/')}
          >
            <Home className="size-4" />
            <span>Kembali ke Beranda</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 rounded-xl border-border/80 hover:bg-muted/60 min-h-[44px] px-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
            <span>Halaman Sebelumnya</span>
          </Button>
        </motion.div>

        {/* Footer Support Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-xs text-muted-foreground"
        >
          Butuh bantuan? Silakan hubungi tim administrator SIMAD PLN.
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

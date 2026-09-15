'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function PLNFinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#00A2E9]">
      {/* Animated abstract background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="absolute -top-[50%] -right-[20%] w-[100%] h-[150%] opacity-20"
          style={{
            background:
              'conic-gradient(from 90deg at 50% 50%, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(253,185,19,0.3)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Berkontribusi untuk Negeri?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ambil peran dalam menerangi pelosok Nusantara dan mendorong transisi energi hijau di
            Indonesia. Kesempatanmu dimulai dari sini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 
                         bg-white text-[#00A2E9] font-bold rounded-xl
                         hover:bg-gray-50 active:bg-gray-100
                         transition-colors duration-200 shadow-xl
                         min-h-[48px]"
            >
              Mulai Pendaftaran
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

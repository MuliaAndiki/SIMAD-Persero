'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Camera, Code, Lightbulb, Users, Zap } from 'lucide-react';
import React, { useRef } from 'react';

import { SectionHeading } from './SectionHeading';

const tiles = [
  {
    id: 1,
    title: 'Kerja Lapangan',
    description: 'Terjun langsung ke site proyek infrastruktur.',
    icon: Zap,
    className: 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#00A2E9]/20 to-[#00A2E9]/5',
    iconBg: 'bg-[#00A2E9]/20',
    iconColor: 'text-[#00A2E9]',
  },
  {
    id: 2,
    title: 'Inovasi Digital',
    description: 'Modernisasi sistem & smart grid.',
    icon: Code,
    className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-indigo-500/10 to-transparent',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-500',
  },
  {
    id: 3,
    title: 'Ruang Kolaborasi',
    description: 'Diskusi ide dengan para expert.',
    icon: Users,
    className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-[#FDB913]/20 to-transparent',
    iconBg: 'bg-[#FDB913]/20',
    iconColor: 'text-amber-600 dark:text-[#FDB913]',
  },
  {
    id: 4,
    title: 'Dokumentasi',
    description: 'Merekam progress & best practice.',
    icon: Camera,
    className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-emerald-500/10 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-600',
  },
  {
    id: 5,
    title: 'Pusat Pelatihan',
    description: 'Akses ke modul & workshop eksklusif.',
    icon: BookOpen,
    className: 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-rose-500/10 to-transparent',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-600',
  },
  {
    id: 6,
    title: 'Lab Inovasi',
    description: 'R&D untuk masa depan energi.',
    icon: Lightbulb,
    className: 'md:col-span-1 md:row-span-2 bg-gradient-to-br from-cyan-500/10 to-transparent',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-600',
  },
];

export function PLNLifeAtPLN() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section
      id="culture"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background border-t border-border"
    >
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        <SectionHeading
          label="Life At PLN"
          title="Budaya Kerja yang Mendukung Potensimu"
          description="Dari kerja lapangan yang menantang hingga inovasi digital di kantor pusat. Temukan lingkungan yang tepat untuk mengembangkan kariermu."
        />

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4 md:gap-6 mt-16">
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            // Apply slight parallax alternately
            const y = i % 2 === 0 ? y1 : y2;

            return (
              <motion.div
                key={tile.id}
                style={{ y }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-3xl overflow-hidden border border-border p-6 flex flex-col justify-end group cursor-pointer ${tile.className}`}
              >
                {/* Background image placeholder */}
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0 transition-opacity duration-300 group-hover:bg-background/20" />

                {/* Icon top right */}
                <div
                  className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center z-10 ${tile.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${tile.iconColor}`} />
                </div>

                <div className="relative z-10 transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-xl font-bold text-foreground mb-1">{tile.title}</h3>
                  <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {tile.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

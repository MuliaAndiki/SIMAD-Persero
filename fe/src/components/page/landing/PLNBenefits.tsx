'use client';

import { Briefcase, Globe, Users } from 'lucide-react';
import React from 'react';

import { FeatureCard } from './FeatureCard';
import { SectionHeading } from './SectionHeading';

const benefits = [
  {
    icon: Users,
    title: 'Mentorship Profesional',
    description:
      'Dibimbing langsung oleh engineer dan manajer senior PLN yang berpengalaman di proyek infrastruktur energi nasional. Bukan sekadar tugas administratif.',
  },
  {
    icon: Globe,
    title: 'Proyek Skala Nasional',
    description:
      'Terlibat dalam inisiatif nyata — mulai dari modernisasi jaringan distribusi, implementasi smart grid, hingga pengembangan energi terbarukan.',
  },
  {
    icon: Briefcase,
    title: 'Lingkungan Kerja Modern',
    description:
      'Fasilitas kerja yang mendukung kolaborasi dan inovasi: ruang co-working, lab teknis, serta budaya kerja yang menghargai ide-ide baru.',
  },
] as const;

export function PLNBenefits() {
  return (
    <section id="program" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      {/* Subtle top border line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#00A2E9]/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="Mengapa PLN?"
          title="Program Magang yang Dirancang untuk Dampak Nyata"
          description="Bukan magang formalitas. Di PLN, Anda akan ditempatkan di unit kerja yang sesungguhnya dan berkontribusi pada proyek yang berdampak langsung ke jutaan masyarakat Indonesia."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((b, i) => (
            <FeatureCard
              key={b.title}
              icon={b.icon}
              title={b.title}
              description={b.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

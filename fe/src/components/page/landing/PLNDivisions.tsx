'use client';

import React from 'react';
import { SectionHeading } from './SectionHeading';

const departmentsRow1 = [
  'IT & Software Engineering',
  'Teknik Elektro & Transmisi',
  'Distribusi & Jaringan',
  'Manajemen Bisnis',
  'Hukum & Compliance',
  'Energi Terbarukan',
];

const departmentsRow2 = [
  'Operasional & Pemeliharaan',
  'Keuangan & Akuntansi',
  'SDM & Organisasi',
  'Komunikasi Korporat',
  'Pengadaan & Logistik',
  'Risiko & K3',
];

export function PLNDivisions() {
  return (
    <section id="divisions" className="py-24 bg-muted/30 border-y border-border overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <SectionHeading
          label="Bidang Penempatan"
          title="Temukan Tempatmu Berkembang"
          description="PLN memiliki puluhan divisi yang siap menjadi tempat belajarmu. Apapun latar belakang pendidikanmu, selalu ada ruang untuk berkontribusi."
        />
      </div>

      <div className="relative flex flex-col gap-6 group">
        {/* Row 1 - Left to Right */}
        <div className="flex w-fit animate-marquee hover:[animation-play-state:paused]">
          {[...departmentsRow1, ...departmentsRow1, ...departmentsRow1].map((dept, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Marquee items are static and order doesn't change
            <div
              key={`r1-${i}`}
              className="flex-none mx-3 px-6 py-3 rounded-full bg-card border border-border text-foreground font-medium shadow-sm hover:border-[#00A2E9]/50 hover:text-[#00A2E9] transition-colors cursor-default"
            >
              {dept}
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-fit animate-marquee-reverse hover:[animation-play-state:paused] ml-[-50%]">
          {[...departmentsRow2, ...departmentsRow2, ...departmentsRow2].map((dept, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Marquee items are static and order doesn't change
            <div
              key={`r2-${i}`}
              className="flex-none mx-3 px-6 py-3 rounded-full bg-card border border-border text-foreground font-medium shadow-sm hover:border-[#FDB913]/80 hover:text-amber-600 dark:hover:text-[#FDB913] transition-colors cursor-default"
            >
              {dept}
            </div>
          ))}
        </div>

        {/* Gradient fades for edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

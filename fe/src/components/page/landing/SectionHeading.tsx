'use client';

import { motion } from 'framer-motion';
import type React from 'react';

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark';
}

export function SectionHeading({
  label,
  title,
  description,
  align = 'center',
  theme = 'light',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  const labelColor = theme === 'dark' ? 'text-[#FDB913]' : 'text-[#00A2E9]';
  const titleColor = theme === 'dark' ? 'text-white' : 'text-foreground';
  const descColor = theme === 'dark' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <motion.div
      className={`max-w-2xl mb-16 ${alignment}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {label && (
        <span
          className={`inline-block text-sm font-semibold tracking-widest uppercase mb-3 ${labelColor}`}
        >
          {label}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight mb-4 ${titleColor}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-base md:text-lg leading-relaxed ${descColor}`}>{description}</p>
      )}
    </motion.div>
  );
}

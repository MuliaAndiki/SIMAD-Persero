'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{
        y: -6,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="group relative bg-card rounded-2xl border border-border p-8 
                 hover:border-[#00A2E9]/30 hover:shadow-xl hover:shadow-[#00A2E9]/5
                 transition-[border-color,box-shadow] duration-300"
    >
      {/* Icon container */}
      <div
        className="w-12 h-12 rounded-xl bg-[#00A2E9]/10 flex items-center justify-center mb-5 
                      group-hover:bg-[#00A2E9]/15 transition-colors duration-300"
      >
        <Icon className="w-6 h-6 text-[#00A2E9]" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      {/* Subtle corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(0,162,233,0.08), transparent 70%)',
        }}
      />
    </motion.div>
  );
}

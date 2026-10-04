'use client';

import { cn } from '@/utils/classname';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type ArrowVariant = 'curved-down-right' | 'curved-up-left' | 'pointer-up' | 'curved-right';

export interface ScribbleArrowProps {
  variant?: ArrowVariant;
  className?: string;
  colorClassName?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
}

/**
 * Hand-drawn arrow sketch SVG with GSAP stroke drawing animation.
 * Used for academic marginalia pointing to buttons, steps, or important notes.
 */
export function ScribbleArrow({
  variant = 'curved-down-right',
  className,
  colorClassName = 'text-primary',
  strokeWidth = 2.5,
  duration = 0.8,
  delay = 0.2,
}: ScribbleArrowProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    const head = headRef.current;
    const svg = svgRef.current;
    if (!stem || !head || !svg) return;

    const stemLength = stem.getTotalLength();
    const headLength = head.getTotalLength();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      stem.style.strokeDasharray = 'none';
      stem.style.strokeDashoffset = '0';
      head.style.strokeDasharray = 'none';
      head.style.strokeDashoffset = '0';
      return;
    }

    stem.style.strokeDasharray = `${stemLength}`;
    stem.style.strokeDashoffset = `${stemLength}`;
    head.style.strokeDasharray = `${headLength}`;
    head.style.strokeDashoffset = `${headLength}`;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.to(stem, {
        strokeDashoffset: 0,
        duration: duration * 0.7,
        delay,
        ease: 'power2.out',
      }).to(
        head,
        {
          strokeDashoffset: 0,
          duration: duration * 0.35,
          ease: 'power2.out',
        },
        '-=0.1',
      );
    }, svg);

    return () => ctx.revert();
  }, [duration, delay]);

  const renderPaths = () => {
    switch (variant) {
      case 'pointer-up':
        return (
          <>
            <path
              ref={stemRef}
              d="M 25 55 C 23 40, 26 25, 25 10"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              ref={headRef}
              d="M 16 18 L 25 8 L 34 19"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case 'curved-up-left':
        return (
          <>
            <path
              ref={stemRef}
              d="M 55 50 C 45 35, 30 25, 12 20"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              ref={headRef}
              d="M 22 13 L 10 19 L 20 28"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case 'curved-right':
        return (
          <>
            <path
              ref={stemRef}
              d="M 8 30 C 25 22, 45 20, 68 28"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              ref={headRef}
              d="M 58 19 L 70 29 L 57 37"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
      default:
        return (
          <>
            <path
              ref={stemRef}
              d="M 8 10 C 25 8, 48 18, 55 42"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              ref={headRef}
              d="M 44 38 L 56 44 L 60 30"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
    }
  };

  const viewBox =
    variant === 'pointer-up' ? '0 0 50 65' : variant === 'curved-right' ? '0 0 80 50' : '0 0 70 55';

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('pointer-events-none select-none overflow-visible', colorClassName, className)}
    >
      {renderPaths()}
    </svg>
  );
}

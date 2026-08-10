'use client';

import { useEffect } from 'react';

export interface PhantomSkeletonProps {
  loading: boolean;
  animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid';
  shimmerDirection?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  shimmerColor?: string;
  backgroundColor?: string;
  duration?: number;
  stagger?: number;
  reveal?: number;
  loadingLabel?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * PhantomSkeleton — bungkus UI asli dengan `<phantom-ui>` agar saat `loading`
 * true, shimmer block dihasilkan dari pengukuran DOM asli (struktur kartu tetap
 * terlihat). Web component didaftarkan client-side saja (aman untuk SSR).
 */
export function PhantomSkeleton({
  loading,
  animation = 'shimmer',
  shimmerDirection = 'ltr',
  shimmerColor,
  backgroundColor,
  duration,
  stagger = 0.04,
  reveal = 0.3,
  loadingLabel,
  className,
  children,
}: PhantomSkeletonProps) {
  useEffect(() => {
    import('@aejkatappaja/phantom-ui').catch(() => undefined);
  }, []);

  return (
    <phantom-ui
      loading={loading}
      animation={animation}
      shimmer-direction={shimmerDirection}
      shimmer-color={shimmerColor}
      background-color={backgroundColor}
      duration={duration}
      stagger={stagger}
      reveal={reveal}
      loading-label={loadingLabel}
      class={className}
    >
      {children}
    </phantom-ui>
  );
}

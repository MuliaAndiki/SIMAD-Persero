import { env } from '@/configs/env.config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Unoptimized untuk development, optimized untuk production
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      // Tambahkan pattern spesifik untuk R2 jika ada
      ...(process.env.NEXT_PUBLIC_R2_URL
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(process.env.NEXT_PUBLIC_R2_URL).hostname,
            },
          ]
        : []),
    ],
    // Tambahkan domain R2 ke allowed domains
    domains: process.env.NEXT_PUBLIC_R2_URL
      ? [new URL(process.env.NEXT_PUBLIC_R2_URL).hostname]
      : [],
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: env.NEXT_PUBLIC_BASEPATH || '/home',
        permanent: true,
      },
      {
        source: '/auth/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
  // Tambahkan configuration untuk headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
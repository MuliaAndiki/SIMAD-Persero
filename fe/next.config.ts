import { env } from '@/configs/env.config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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
};

export default nextConfig;
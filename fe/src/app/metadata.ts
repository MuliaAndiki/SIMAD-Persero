import type { Metadata } from 'next';

export const siteConfig = {
  name: 'SIMAD (Sistem Informasi Manajemen Magang & Absensi Digital)',
  description: 'Platform digital pengelolaan administrasi magang dan absensi PLN Persero.',
  url: 'https://your-domain.com',
  locale: 'id-ID',
  keywords: ['simad', 'magang', 'absensi', 'next.js', 'pln', 'persero'],
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  icons: {
    icon: [{ url: '/images/logo.png', type: 'image/png' }, { url: '/favicon/favicon.ico' }],
    shortcut: '/images/logo.png',
    apple: [
      { url: '/images/logo.png', type: 'image/png' },
      { url: '/images/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/logo.png',
        color: '#000000',
      },
    ],
  },
  manifest: '/manifest.webmanifest',
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    alternateLocale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/images/logo.png'],
  },
  other: {
    'google-site-verification': 'your-verification-code',
    'msvalidate.01': 'your-verification-code',
    'msapplication-TileColor': '#000000',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  appleWebApp: {
    title: siteConfig.name,
    statusBarStyle: 'black',
    capable: true,
  },
};

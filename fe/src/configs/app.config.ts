import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Clock,
  FileText,
  History,
  Home,
  type LucideIcon,
  MapPin,
  ScrollText,
  Sparkles,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import type React from 'react';

import type { DashboardRole } from '@/types/api/dashboard.types';

interface AppConfig {
  name: string;
  description: string;
  logo: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    image: string;
  };
  social_media: {
    twitter: {
      url: string;
      icon: string;
    };
    instagram: {
      url: string;
      icon: string;
    };
    linkedin: {
      url: string;
      icon: string;
    };
    youtube: {
      url: string;
      icon: string;
    };
    tiktok: {
      url: string;
      icon: string;
    };
  };
}

export type PropsParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  id: Promise<string>;
};

export const appConfig: AppConfig = {
  name: 'SIMAD',
  description: 'Sistem Informasi Manajemen Magang & Absensi Digital.',
  logo: '/images/logos.png',
  metadata: {
    title: 'SIMAD | Sistem Absensi Magang Digital',
    description:
      'Sistem Informasi Manajemen Magang & Absensi Digital untuk perusahaan dan institusi.',
    keywords: ['SIMAD', 'Magang', 'Absensi', 'Digital', 'Sistem Informasi'],
    author: 'SIMAD Team',
    image: '/images/logos.png',
  },
  social_media: {
    twitter: {
      url: 'https://twitter.com/app',
      icon: 'hugeicons:new-twitter-rectangle',
    },
    instagram: {
      url: 'https://instagram.com/app',
      icon: 'basil:instagram-outline',
    },
    linkedin: {
      url: 'https://linkedin.com/app',
      icon: 'tabler:brand-linkedin',
    },
    youtube: {
      url: 'https://youtube.com/app',
      icon: 'mingcute:youtube-line',
    },
    tiktok: {
      url: 'https://tiktok.com/app',
      icon: 'hugeicons:tiktok',
    },
  },
};

interface NavigationMenuConfig {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    description?: string;
    children?: NavigationMenuConfig['items'];
  }[];
}

export const navigationMenuConfig: NavigationMenuConfig = {
  items: [
    {
      title: 'Tentang',
      href: '#problem',
      description: 'Tentang masalah dan solusi SIMAD.',
    },
    {
      title: 'Cara Kerja',
      href: '#workflow',
      description: 'Mekanisme pengajuan hingga sertifikasi.',
    },
    {
      title: 'Fitur',
      href: '#features',
      description: 'Fitur-fitur unggulan SIMAD.',
    },
    {
      title: 'Absensi',
      href: '#attendance',
      description: 'Sistem absensi geofencing.',
    },
    {
      title: 'Sertifikat',
      href: '#certificate',
      description: 'Penerbitan e-certificate.',
    },
  ],
};

export interface SidebarMenuItem {
  name: string;
  url: string;
  icon: LucideIcon;
  subMenu: [];
  /**
   * Menu hanya boleh diakses jika intern memiliki magang aktif
   * (`internship` tidak null pada GET /dashboard/intern).
   */
  requiresInternship?: boolean;
}

export const SIDEBAR_MENU: SidebarMenuItem[] = [
  { name: 'Beranda', url: '/intern/dashboard', icon: Home, subMenu: [] },
  {
    name: 'Pengajuan',
    url: '/intern/application',
    icon: FileText,
    subMenu: [],
  },
  {
    name: 'Onboarding',
    url: '/intern/onboarding',
    icon: ClipboardCheck,
    subMenu: [],
    requiresInternship: true,
  },
  {
    name: 'Absensi',
    url: '/intern/attendance',
    icon: Clock,
    subMenu: [],
    requiresInternship: true,
  },
  {
    name: 'Riwayat',
    url: '/intern/history',
    icon: History,
    subMenu: [],
    requiresInternship: true,
  },
  {
    name: 'Sertifikat',
    url: '/intern/certificate',
    icon: Award,
    subMenu: [],
    requiresInternship: true,
  },
  { name: 'Profil', url: '/intern/profile', icon: User, subMenu: [] },
];

/** Menu sidebar khusus HR_ADMIN. */
export const SIDEBAR_MENU_HR_ADMIN: SidebarMenuItem[] = [
  { name: 'Beranda', url: '/hr_admin/dashboard', icon: Home, subMenu: [] },
  {
    name: 'Pengajuan',
    url: '/hr_admin/applications',
    icon: FileText,
    subMenu: [],
  },
  {
    name: 'Magang',
    url: '/hr_admin/internships',
    icon: BriefcaseBusiness,
    subMenu: [],
  },
  {
    name: 'Departemen',
    url: '/hr_admin/departments',
    icon: Building2,
    subMenu: [],
  },
  {
    name: 'Kantor',
    url: '/hr_admin/offices',
    icon: MapPin,
    subMenu: [],
  },
  {
    name: 'Supervisor',
    url: '/hr_admin/supervisors',
    icon: UserCheck,
    subMenu: [],
  },
  {
    name: 'Laporan',
    url: '/hr_admin/reports',
    icon: BarChart3,
    subMenu: [],
  },
  {
    name: 'Audit Log',
    url: '/hr_admin/audit-logs',
    icon: ScrollText,
    subMenu: [],
  },
  {
    name: 'Keterampilan',
    url: '/hr_admin/skills',
    icon: Sparkles,
    subMenu: [],
  },
  {
    name: 'Sertifikat',
    url: '/hr_admin/certificate-setting',
    icon: Award,
    subMenu: [],
  },
  {
    name: 'Profil',
    url: '/hr_admin/profile',
    icon: User,
    subMenu: [],
  },
];

/** Menu sidebar khusus SUPERVISOR. */
export const SIDEBAR_MENU_SUPERVISOR: SidebarMenuItem[] = [
  { name: 'Beranda', url: '/supervisor/dashboard', icon: Home, subMenu: [] },
  {
    name: 'Intern Bimbingan',
    url: '/supervisor/interns',
    icon: Users,
    subMenu: [],
  },
  {
    name: 'Absensi',
    url: '/supervisor/attendance',
    icon: Clock,
    subMenu: [],
  },
  {
    name: 'Profil',
    url: '/supervisor/profile',
    icon: User,
    subMenu: [],
  },
];

/** Peta menu sidebar per role — dipakai AppSidebar (single source of truth). */
export const ROLE_SIDEBAR_MENU: Record<DashboardRole, SidebarMenuItem[]> = {
  INTERN: SIDEBAR_MENU,
  HR_ADMIN: SIDEBAR_MENU_HR_ADMIN,
  SUPERVISOR: SIDEBAR_MENU_SUPERVISOR,
};

/** Label role untuk UI (header dashboard, badge, dll). */
export const DASHBOARD_ROLE_LABELS: Record<DashboardRole, string> = {
  INTERN: 'Peserta Magang',
  HR_ADMIN: 'HR Admin',
  SUPERVISOR: 'Supervisor',
};

/**
 * Path dashboard per role — single source of truth.
 *
 * Setiap role punya folder rutenya sendiri di `(private)/<role>/dashboard`
 * sehingga halaman khusus role (mis. hanya ada di intern, tidak di HR)
 * cukup dibuat di dalam folder role tersebut (scalable).
 */
export const ROLE_DASHBOARD_PATH: Record<DashboardRole, string> = {
  INTERN: '/intern/dashboard',
  HR_ADMIN: '/hr_admin/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
};

/**
 * Petakan nilai role akun ke path dashboard-nya.
 *
 * Dipakai oleh `useLogin` (redirect setelah login) dan halaman `/dashboard`
 * (dispatcher berbasis role). Nilai role mengikuti `AuthSessionResponse.user.role`
 * / `SafeAuthUser.role` (string). Fallback `/dashboard` agar dispatcher tidak loop.
 */
export function getRoleDashboardPath(role?: string | null): string {
  const normalizedRole = role?.toUpperCase() as DashboardRole | undefined;
  switch (normalizedRole) {
    case 'INTERN':
    case 'HR_ADMIN':
    case 'SUPERVISOR':
      return ROLE_DASHBOARD_PATH[normalizedRole];
    case 'HR' as any:
      return ROLE_DASHBOARD_PATH.HR_ADMIN;
    default:
      return '/dashboard';
  }
}

/**
 * Cek apakah pathname sedang berada di area menu tertentu.
 *
 * Menu `Beranda` (/dashboard) dianggap aktif juga saat berada di
 * /intern/dashboard, /hr_admin/dashboard, atau /supervisor/dashboard.
 */
export function isMenuActive(menuUrl: string, pathname: string): boolean {
  const isDashboardPath = (url: string) => url === '/dashboard' || url.endsWith('/dashboard');

  // Menu Beranda aktif saat berada di area dashboard role manapun.
  if (isDashboardPath(menuUrl)) {
    return (
      pathname === menuUrl ||
      pathname.startsWith(`${menuUrl}/`) ||
      (menuUrl === '/intern/dashboard' && pathname === '/dashboard')
    );
  }
  return pathname === menuUrl || pathname.startsWith(`${menuUrl}/`);
}

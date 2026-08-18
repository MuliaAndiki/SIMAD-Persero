import {
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
} from "lucide-react";
import type React from "react";

import type { DashboardRole } from "@/types/api/dashboard.types";

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
  name: "App",
  description: "App",
  logo: "/images/logo.png",
  metadata: {
    title: "App",
    description: "App",
    keywords: ["App"],
    author: "App",
    image: "App",
  },
  social_media: {
    twitter: {
      url: "https://twitter.com/app",
      icon: "hugeicons:new-twitter-rectangle",
    },
    instagram: {
      url: "https://instagram.com/app",
      icon: "basil:instagram-outline",
    },
    linkedin: {
      url: "https://linkedin.com/app",
      icon: "tabler:brand-linkedin",
    },
    youtube: {
      url: "https://youtube.com/app",
      icon: "mingcute:youtube-line",
    },
    tiktok: {
      url: "https://tiktok.com/app",
      icon: "hugeicons:tiktok",
    },
  },
};

interface NavigationMenuConfig {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    description?: string;
    children?: NavigationMenuConfig["items"];
  }[];
}

export const navigationMenuConfig: NavigationMenuConfig = {
  items: [
    {
      title: "Home",
      href: "/",
      description: "Home",
    },
    {
      title: "masuk",
      href: "/login",
      description: "masuk",
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
  { name: "Beranda", url: "/INTERN/dashboard", icon: Home, subMenu: [] },
  {
    name: "Pengajuan",
    url: "/INTERN/application",
    icon: FileText,
    subMenu: [],
  },
  {
    name: "Onboarding",
    url: "/INTERN/onboarding",
    icon: ClipboardCheck,
    subMenu: [],
    requiresInternship: true,
  },
  {
    name: "Absensi",
    url: "/INTERN/attendance",
    icon: Clock,
    subMenu: [],
    requiresInternship: true,
  },
  {
    name: "Riwayat",
    url: "/INTERN/history",
    icon: History,
    subMenu: [],
    requiresInternship: true,
  },
  { name: "Profil", url: "/INTERN/profile", icon: User, subMenu: [] },
];

/** Menu sidebar khusus HR_ADMIN. */
export const SIDEBAR_MENU_HR_ADMIN: SidebarMenuItem[] = [
  { name: "Beranda", url: "/HR_ADMIN/dashboard", icon: Home, subMenu: [] },
  {
    name: "Pengajuan",
    url: "/HR_ADMIN/applications",
    icon: FileText,
    subMenu: [],
  },
  {
    name: "Magang",
    url: "/HR_ADMIN/internships",
    icon: BriefcaseBusiness,
    subMenu: [],
  },
  {
    name: "Departemen",
    url: "/HR_ADMIN/departments",
    icon: Building2,
    subMenu: [],
  },
  {
    name: "Kantor",
    url: "/HR_ADMIN/offices",
    icon: MapPin,
    subMenu: [],
  },
  {
    name: "Supervisor",
    url: "/HR_ADMIN/supervisors",
    icon: UserCheck,
    subMenu: [],
  },
  {
    name: "Laporan",
    url: "/HR_ADMIN/reports",
    icon: BarChart3,
    subMenu: [],
  },
  {
    name: "Audit Log",
    url: "/HR_ADMIN/audit-logs",
    icon: ScrollText,
    subMenu: [],
  },
  {
    name: "Keterampilan",
    url: "/HR_ADMIN/skills",
    icon: Sparkles,
    subMenu: [],
  },
  {
    name: "Profil",
    url: "/HR_ADMIN/profile",
    icon: User,
    subMenu: [],
  },
];

/** Menu sidebar khusus SUPERVISOR. */
export const SIDEBAR_MENU_SUPERVISOR: SidebarMenuItem[] = [
  { name: "Beranda", url: "/SUPERVISOR/dashboard", icon: Home, subMenu: [] },
  {
    name: "Intern Bimbingan",
    url: "/SUPERVISOR/interns",
    icon: Users,
    subMenu: [],
  },
  {
    name: "Absensi",
    url: "/SUPERVISOR/attendance",
    icon: Clock,
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
  INTERN: "Peserta Magang",
  HR_ADMIN: "HR Admin",
  SUPERVISOR: "Supervisor",
};

/**
 * Path dashboard per role — single source of truth.
 *
 * Setiap role punya folder rutenya sendiri di `(private)/<ROLE>/dashboard`
 * sehingga halaman khusus role (mis. hanya ada di intern, tidak di HR)
 * cukup dibuat di dalam folder role tersebut (scalable).
 */
export const ROLE_DASHBOARD_PATH: Record<DashboardRole, string> = {
  INTERN: "/INTERN/dashboard",
  HR_ADMIN: "/HR_ADMIN/dashboard",
  SUPERVISOR: "/SUPERVISOR/dashboard",
};

/**
 * Petakan nilai role akun ke path dashboard-nya.
 *
 * Dipakai oleh `useLogin` (redirect setelah login) dan halaman `/dashboard`
 * (dispatcher berbasis role). Nilai role mengikuti `AuthSessionResponse.user.role`
 * / `SafeAuthUser.role` (string). Fallback `/dashboard` agar dispatcher tidak loop.
 */
export function getRoleDashboardPath(role?: string | null): string {
  switch (role) {
    case "INTERN":
    case "HR_ADMIN":
    case "SUPERVISOR":
      return ROLE_DASHBOARD_PATH[role];
    case "HR":
      return ROLE_DASHBOARD_PATH.HR_ADMIN;
    default:
      return "/dashboard";
  }
}

/**
 * Cek apakah pathname sedang berada di area menu tertentu.
 *
 * Menu `Beranda` (/dashboard) dianggap aktif juga saat berada di
 * /INTERN/dashboard, /HR_ADMIN/dashboard, atau /SUPERVISOR/dashboard.
 */
export function isMenuActive(menuUrl: string, pathname: string): boolean {
  const isDashboardPath = (url: string) =>
    url === "/dashboard" || url.endsWith("/dashboard");

  // Menu Beranda aktif saat berada di area dashboard role manapun.
  if (isDashboardPath(menuUrl)) {
    return (
      pathname === menuUrl ||
      pathname.startsWith(`${menuUrl}/`) ||
      (menuUrl === "/INTERN/dashboard" && pathname === "/dashboard")
    );
  }
  return pathname === menuUrl || pathname.startsWith(`${menuUrl}/`);
}

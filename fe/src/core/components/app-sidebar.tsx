'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/atoms';
import { ROLE_SIDEBAR_MENU, SIDEBAR_MENU, isMenuActive } from '@/configs/app.config';
import { useInternAccess } from '@/hooks/useInternAccess';
import { useApi } from '@/hooks/useService/useApi';
import { cn } from '@/utils/classname';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sidebar desktop (md+) — menampilkan navigasi modul SIMAD.
 *
 * Menu dipilih berdasarkan role akun yang sedang login
 * (`ROLE_SIDEBAR_MENU` di app.config) sehingga INTERN, HR_ADMIN,
 * dan SUPERVISOR mendapat navigasi yang sesuai perannya.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const api = useApi();
  const { hasActiveInternship } = useInternAccess();
  const isCollapsed = state === 'collapsed';

  const role = api.auth.query.me().data?.role?.toUpperCase();
  const roleMenus =
    (role === 'INTERN' || role === 'HR_ADMIN' || role === 'SUPERVISOR'
      ? ROLE_SIDEBAR_MENU[role]
      : null) ?? SIDEBAR_MENU;

  // Sembunyikan menu yang menuntut magang aktif (Absensi/Riwayat) bila belum ada.
  const menus = roleMenus.filter((item) => !item.requiresInternship || hasActiveInternship);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex h-20 justify-center border-b p-4">
        {isCollapsed ? (
          <Image src="/images/logos.png" alt="SIMAD" width={40} height={40} />
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/images/logos.png" alt="SIMAD" width={40} height={40} />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-sidebar-foreground">SIMAD</span>
              <span className="text-[11px] leading-tight text-sidebar-foreground/60">
                PLN Persero
              </span>
            </div>
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.map((item) => {
                const isActive = isMenuActive(item.url, pathname);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.name : undefined}
                      isActive={isActive}
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          'flex h-10 items-center gap-3 rounded-lg px-3 transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                        )}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span className="text-sm">{!isCollapsed && item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

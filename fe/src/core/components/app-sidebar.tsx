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
import { SIDEBAR_MENU, isMenuActive } from '@/configs/app.config';
import { cn } from '@/utils/classname';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sidebar desktop (md+) — menampilkan navigasi modul SIMAD.
 *
 * Dibaca dari `SIDEBAR_MENU` (single source of truth di app.config)
 * dan memakai warna semantik sidebar agar konsisten dengan tema PLN Blue.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex h-20 justify-center border-b p-4">
        {isCollapsed ? (
          <Image src="/images/logo.png" alt="SIMAD" width={40} height={40} />
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="SIMAD" width={40} height={40} />
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
              {SIDEBAR_MENU.map((item) => {
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

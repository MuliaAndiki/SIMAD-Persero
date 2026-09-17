'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms';
import { ROLE_SIDEBAR_MENU, SIDEBAR_MENU, getRoleDashboardPath, isItemActive, isMenuActive } from '@/configs/app.config';
import { useInternAccess } from '@/hooks/useInternAccess';
import { useApi } from '@/hooks/useService/useApi';
import { cn } from '@/utils/classname';
import { ChevronRight, ChevronsUpDown, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sidebar desktop (md+) & mobile — menampilkan navigasi modul SIMAD.
 *
 * Menu dipilih berdasarkan role akun yang sedang login
 * (`ROLE_SIDEBAR_MENU` di app.config) sehingga INTERN, HR_ADMIN,
 * dan SUPERVISOR mendapat navigasi yang sesuai perannya.
 *
 * Mendukung expandable dropdown (subMenu) dengan auto-expand & active state tracking.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const api = useApi();
  const { hasActiveInternship } = useInternAccess();
  const isCollapsed = state === 'collapsed';

  const profileQuery = api.user.query.profile();
  const user = profileQuery.data;
  const role = user?.role?.toUpperCase();
  const logoutMutation = api.auth.mutate.logout();

  const roleMenus =
    (role === 'INTERN' || role === 'HR_ADMIN' || role === 'SUPERVISOR' || role === 'RECEPTIONIST'
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
                const hasSubMenu = Boolean(item.subMenu && item.subMenu.length > 0);
                const isGroupActive = isItemActive(item, pathname);
                const Icon = item.icon;

                // Item dengan SubMenu (Dropdown Group)
                if (hasSubMenu && item.subMenu) {
                  return (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={isGroupActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={isCollapsed ? item.name : undefined}
                            isActive={isGroupActive}
                            className="h-10 px-3 cursor-pointer"
                          >
                            <Icon className="size-5 shrink-0 text-sidebar-foreground/80" />
                            <span className="text-sm font-medium text-sidebar-foreground">
                              {!isCollapsed && item.name}
                            </span>
                            {!isCollapsed && (
                              <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/60" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="my-1 flex flex-col gap-0.5 border-l border-sidebar-border/70 pl-3">
                            {item.subMenu.map((subItem) => {
                              const isSubActive = isMenuActive(subItem.url, pathname);
                              const SubIcon = subItem.icon;

                              return (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link
                                      href={subItem.url}
                                      className={cn(
                                        'flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs transition-colors',
                                        isSubActive
                                          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                      )}
                                    >
                                      {SubIcon && <SubIcon className="size-4 shrink-0" />}
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Item Tunggal (Top-level Single Item)
                const isActive = isMenuActive(item.url, pathname);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.name : undefined}
                      isActive={isActive}
                      className="h-10 px-3"
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          'flex h-10 items-center gap-3 rounded-lg px-3 transition-colors',
                          isActive
                            ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.fullName || 'User'} className="aspect-square size-full object-cover" />
                    ) : (
                      <AvatarFallback className="rounded-lg">
                        {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.fullName ?? 'User'}</span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {user?.role?.replace('_', ' ') ?? 'Role'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.fullName || 'User'} className="aspect-square size-full object-cover" />
                      ) : (
                        <AvatarFallback className="rounded-lg">
                          {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.fullName ?? 'User'}</span>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        {user?.role?.replace('_', ' ') ?? 'Role'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role?.toLowerCase()}/profile`} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutMutation.mutate({})} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

'use client';

import { SIDEBAR_MENU, isMenuActive } from '@/configs/app.config';
import { cn } from '@/utils/classname';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Bottom navigation khusus mobile (md:hidden).
 *
 * Menyediakan akses cepat ke modul utama SIMAD di layar kecil —
 * melengkapi sidebar desktop pada AppShell.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {SIDEBAR_MENU.map((item) => {
          const isActive = isMenuActive(item.url, pathname);
          const Icon = item.icon;

          return (
            <li key={item.url} className="flex-1">
              <Link
                href={item.url}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

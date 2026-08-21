"use client";

import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/atoms";
import { ApplicationCompactList } from "@/components/organisms/application/ApplicationCompactList";
import { ApplicationHistoryList } from "@/components/organisms/application/ApplicationHistoryList";
import type { ApplicationResponse } from "@/types/api/application.types";
import type { NotificationResponse } from "@/types/api/notification.types";
import { FileText } from "lucide-react";
import Link from "next/link";
import { NotificationDropdownFooter } from "./NotificationDropdownFooter";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationList } from "./NotificationList";
import { NotificationListSkeleton } from "./NotificationListSkeleton";

export interface NotificationDropdownContentProps {
  role?: string;
  rolePath: string;
  unreadCount: number;
  notifications: NotificationResponse[];
  notificationsPending: boolean;
  myApplications: ApplicationResponse[];
  myApplicationsPending: boolean;
  pendingApplications: ApplicationResponse[];
  pendingApplicationsPending: boolean;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

/**
 * Konten panel NotificationDropdown — komposisi atomic components:
 * - INTERN      → "Riwayat Pengajuan" (daftar pengajuan sendiri) + notifikasi
 * - HR_ADMIN    → "Pengajuan Masuk" (aplikasi menunggu review) + notifikasi
 * - SUPERVISOR  → notifikasi saja
 *
 * Komponen ini presentasional murni; seluruh data & handler berasal dari
 * container (orchestration layer).
 */
export function NotificationDropdownContent({
  role,
  rolePath,
  unreadCount,
  notifications,
  notificationsPending,
  myApplications,
  myApplicationsPending,
  pendingApplications,
  pendingApplicationsPending,
  onMarkAllAsRead,
  onMarkAsRead,
}: NotificationDropdownContentProps) {
  const isIntern = role === "INTERN";
  const isHr = role === "HR_ADMIN";

  return (
    <DropdownMenuContent align="end" className="w-80">
      <NotificationDropdownHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={onMarkAllAsRead}
      />
      <DropdownMenuSeparator />

      {/* Riwayat Pengajuan — khusus INTERN */}
      {isIntern && (
        <>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Riwayat Pengajuan
            </span>
            <Link
              href="/INTERN/application"
              className="text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </DropdownMenuLabel>
          {myApplicationsPending ? (
            <NotificationListSkeleton />
          ) : (
            <ApplicationHistoryList
              applications={myApplications}
              getHref={(application) => `/INTERN/application/${application.id}`}
            />
          )}
          <DropdownMenuSeparator />
        </>
      )}

      {/* Pengajuan Masuk — khusus HR_ADMIN */}
      {isHr && (
        <>
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            Pengajuan Masuk
          </DropdownMenuLabel>
          {pendingApplicationsPending ? (
            <NotificationListSkeleton />
          ) : (
            <ApplicationCompactList
              applications={pendingApplications}
              showApplicant
              emptyMessage="Tidak ada pengajuan menunggu review."
            />
          )}
          <DropdownMenuSeparator />
        </>
      )}

      {/* Daftar notifikasi */}
      {notificationsPending ? (
        <NotificationListSkeleton />
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
        />
      )}

      <DropdownMenuSeparator />
      <NotificationDropdownFooter
        href={rolePath}
        description="Buka halaman sesuai role Anda"
      />
    </DropdownMenuContent>
  );
}

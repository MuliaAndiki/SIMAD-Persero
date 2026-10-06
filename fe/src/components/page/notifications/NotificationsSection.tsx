'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { NotificationCard } from '@/components/organisms/notification/NotificationCard';
import { NotificationDetailDialog } from '@/components/organisms/notification/NotificationDetailDialog';
import { SendNotificationModal } from '@/components/organisms/notification/SendNotificationModal';
import type { NotificationResponse } from '@/types/api/notification.types';
import { cn } from '@/utils/classname';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  Inbox,
  Loader2,
  Megaphone,
  Radio,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export interface NotificationsSectionProps {
  role?: string;
  notifications: NotificationResponse[];
  unreadCount: number;
  isPending: boolean;
  isError: boolean;
  onRefresh: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onSendBroadcast?: (data: {
    title: string;
    message: string;
    typeCode?: string;
    isBroadcast?: boolean;
  }) => Promise<void>;
  isMarkingAllRead?: boolean;
  isSendingBroadcast?: boolean;
}

type TabFilter = 'all' | 'unread' | 'broadcast' | 'personal';
type SortOrder = 'newest' | 'oldest' | 'unread_first';

export function NotificationsSection({
  role,
  notifications,
  unreadCount,
  isPending,
  isError,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onSendBroadcast,
  isMarkingAllRead = false,
  isSendingBroadcast = false,
}: NotificationsSectionProps) {
  const isHrAdmin = role?.toUpperCase() === 'HR_ADMIN';

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedDetail, setSelectedDetail] = useState<NotificationResponse | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Filtered & Sorted notifications
  const processedNotifications = useMemo(() => {
    let result = [...notifications];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.senderName && n.senderName.toLowerCase().includes(q)) ||
          (n.typeName && n.typeName.toLowerCase().includes(q)),
      );
    }

    // Tab filter
    if (activeTab === 'unread') {
      result = result.filter((n) => !n.isRead);
    } else if (activeTab === 'broadcast') {
      result = result.filter((n) => n.isBroadcast);
    } else if (activeTab === 'personal') {
      result = result.filter((n) => !n.isBroadcast);
    }

    // Type category filter
    if (typeFilter !== 'ALL') {
      if (typeFilter === 'BROADCAST') {
        result = result.filter((n) => n.isBroadcast);
      } else if (typeFilter === 'WARNING') {
        result = result.filter(
          (n) =>
            (n.typeCode || '').toUpperCase().includes('WARN') ||
            n.title.toLowerCase().includes('peringatan') ||
            n.message.toLowerCase().includes('peringatan') ||
            n.message.toLowerCase().includes('ditolak'),
        );
      } else if (typeFilter === 'ATTENDANCE') {
        result = result.filter(
          (n) =>
            n.title.toLowerCase().includes('absensi') ||
            n.message.toLowerCase().includes('absensi') ||
            n.title.toLowerCase().includes('presensi') ||
            n.message.toLowerCase().includes('presensi'),
        );
      } else if (typeFilter === 'APPLICATION') {
        result = result.filter(
          (n) =>
            n.title.toLowerCase().includes('pengajuan') ||
            n.message.toLowerCase().includes('pengajuan') ||
            n.title.toLowerCase().includes('aplikasi'),
        );
      } else if (typeFilter === 'CERTIFICATE') {
        result = result.filter(
          (n) =>
            n.title.toLowerCase().includes('sertifikat') ||
            n.message.toLowerCase().includes('sertifikat'),
        );
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'unread_first') {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [notifications, searchQuery, activeTab, typeFilter, sortOrder]);

  // Statistics counts
  const totalCount = notifications.length;
  const broadcastCount = useMemo(
    () => notifications.filter((n) => n.isBroadcast).length,
    [notifications],
  );
  const personalCount = totalCount - broadcastCount;

  return (
    <section className="flex flex-col gap-6">
      {/* ─── Header & Top Actions ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pusat Notifikasi</h1>
            {unreadCount > 0 ? (
              <Badge variant="destructive" className="h-5 px-1.5 text-[11px] font-semibold">
                {unreadCount} Baru
              </Badge>
            ) : (
              <Badge variant="outline" className="h-5 px-1.5 text-[11px] text-muted-foreground">
                Semua Terbaca
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola seluruh riwayat pemberitahuan, pengumuman siaran, dan aktivitas sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Segarkan */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-border/70 cursor-pointer"
            onClick={onRefresh}
            disabled={isPending}
          >
            <RotateCcw className={cn('size-3.5', isPending && 'animate-spin')} />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>

          {/* Tandai Semua Dibaca */}
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/70 text-primary hover:text-primary cursor-pointer"
              onClick={onMarkAllAsRead}
              disabled={isMarkingAllRead || isPending}
            >
              {isMarkingAllRead ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              <span>Tandai Semua Dibaca</span>
            </Button>
          )}

          {/* Kirim Pengumuman (Khusus HR_ADMIN) */}
          {isHrAdmin && onSendBroadcast && (
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer shadow-sm"
              onClick={() => setIsSendModalOpen(true)}
            >
              <Send className="size-3.5" />
              <span>Kirim Pengumuman</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── High-Density KPI Metric Strip ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Notifikasi */}
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Total Notifikasi
            </span>
            <span className="font-mono text-xl font-bold tracking-tight text-foreground">
              {totalCount}
            </span>
            <span className="text-[10px] text-muted-foreground/80">Histori tersimpan</span>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Inbox className="size-4" />
          </div>
        </div>

        {/* Belum Dibaca */}
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border p-3 shadow-2xs',
            unreadCount > 0
              ? 'border-destructive/30 bg-destructive/5 text-destructive'
              : 'border-border/70 bg-card text-foreground',
          )}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={cn(
                'text-[11px] font-medium truncate',
                unreadCount > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground',
              )}
            >
              Belum Dibaca
            </span>
            <span
              className={cn(
                'font-mono text-xl font-bold tracking-tight',
                unreadCount > 0 ? 'text-destructive' : 'text-foreground',
              )}
            >
              {unreadCount}
            </span>
            <span className="text-[10px] text-muted-foreground/80">
              {unreadCount > 0 ? 'Perlu ditinjau' : 'Semua sudah beres'}
            </span>
          </div>
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              unreadCount > 0
                ? 'bg-destructive/15 text-destructive'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Bell className="size-4" />
          </div>
        </div>

        {/* Pengumuman Siaran */}
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Siaran Global
            </span>
            <span className="font-mono text-xl font-bold tracking-tight text-primary">
              {broadcastCount}
            </span>
            <span className="text-[10px] text-muted-foreground/80">Pengumuman umum</span>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="size-4" />
          </div>
        </div>

        {/* Pemberitahuan Personal */}
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Notifikasi Personal
            </span>
            <span className="font-mono text-xl font-bold tracking-tight text-foreground">
              {personalCount}
            </span>
            <span className="text-[10px] text-muted-foreground/80">Pemberitahuan akun</span>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <User className="size-4" />
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Toolbar ──────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 sm:p-4 shadow-2xs">
        {/* Row 1: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul, pesan, atau pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tab Filter */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabFilter)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 w-full md:w-auto grid grid-cols-4 p-0.5 bg-muted/60">
              <TabsTrigger value="all" className="text-xs h-8 px-3">
                Semua
                <span className="ml-1 text-[10px] font-mono opacity-70">({totalCount})</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs h-8 px-3">
                Belum Dibaca
                {unreadCount > 0 && (
                  <span className="ml-1 text-[10px] font-mono font-bold text-destructive">
                    ({unreadCount})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="text-xs h-8 px-3">
                Siaran
                <span className="ml-1 text-[10px] font-mono opacity-70">({broadcastCount})</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs h-8 px-3">
                Personal
                <span className="ml-1 text-[10px] font-mono opacity-70">({personalCount})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Row 2: Secondary Dropdowns (Type & Sort) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="size-3" />
              Kategori:
            </span>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-7 text-xs w-36 bg-background">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                <SelectItem value="BROADCAST">Pengumuman Siaran</SelectItem>
                <SelectItem value="WARNING">Peringatan / Ditolak</SelectItem>
                <SelectItem value="ATTENDANCE">Absensi & Presensi</SelectItem>
                <SelectItem value="APPLICATION">Pengajuan & Magang</SelectItem>
                <SelectItem value="CERTIFICATE">Sertifikat</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || activeTab !== 'all' || typeFilter !== 'ALL') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setTypeFilter('ALL');
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-muted-foreground font-medium">Urutan:</span>
            <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as SortOrder)}>
              <SelectTrigger className="h-7 text-xs w-44 bg-background">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru Terlebih Dahulu</SelectItem>
                <SelectItem value="unread_first">Belum Dibaca Teratas</SelectItem>
                <SelectItem value="oldest">Terlama Terlebih Dahulu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Notification Feed / List ─────────────────────────────── */}
      {isPending ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="h-20 w-full animate-pulse rounded-xl border border-border/50 bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal Memuat Notifikasi</p>
            <p className="text-xs text-destructive/80">
              Terjadi kesalahan saat mengambil daftar notifikasi dari server.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-fit h-7 text-xs border-destructive/30 bg-background text-destructive hover:bg-destructive/10"
              onClick={onRefresh}
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : processedNotifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-4 text-center border-dashed">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
            <BellOff className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tidak Ada Notifikasi Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchQuery || activeTab !== 'all' || typeFilter !== 'ALL'
              ? 'Tidak ada notifikasi yang sesuai dengan kriteria pencarian dan filter Anda.'
              : 'Anda belum memiliki notifikasi saat ini.'}
          </p>
          {(searchQuery || activeTab !== 'all' || typeFilter !== 'ALL') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 h-8 text-xs"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
                setTypeFilter('ALL');
              }}
            >
              Hapus Semua Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Menampilkan <strong>{processedNotifications.length}</strong> dari {totalCount} notifikasi
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {processedNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onSelect={(notif) => {
                  setSelectedDetail(notif);
                  if (!notif.isRead) {
                    onMarkAsRead(notif.id);
                  }
                }}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Detail Dialog ────────────────────────────────────────── */}
      <NotificationDetailDialog
        notification={selectedDetail}
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        onMarkAsRead={(id) => {
          onMarkAsRead(id);
          if (selectedDetail && selectedDetail.id === id) {
            setSelectedDetail({ ...selectedDetail, isRead: true });
          }
        }}
        onDelete={(id) => {
          onDelete(id);
          setSelectedDetail(null);
        }}
      />

      {/* ─── Send Broadcast Notification Modal (HR Admin) ─────────── */}
      {isHrAdmin && onSendBroadcast && (
        <SendNotificationModal
          open={isSendModalOpen}
          isPending={isSendingBroadcast}
          onClose={() => setIsSendModalOpen(false)}
          onSubmit={onSendBroadcast}
        />
      )}
    </section>
  );
}

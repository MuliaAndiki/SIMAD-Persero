import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';

/**
 * Skeleton daftar (notifikasi / pengajuan) di NotificationDropdown —
 * memakai web component `<phantom-ui>` dari @aejkatappaja/phantom-ui
 * melalui atom PhantomSkeleton.
 */
export function NotificationListSkeleton() {
  return (
    <PhantomSkeleton loading>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="h-11 w-full rounded-lg bg-muted" />
        <div className="h-11 w-full rounded-lg bg-muted" />
        <div className="h-11 w-3/4 rounded-lg bg-muted" />
      </div>
    </PhantomSkeleton>
  );
}

import type { ApplicationResponse } from '@/types/api/application.types';
import { ApplicationCompactList } from './ApplicationCompactList';

export interface ApplicationHistoryListProps {
  applications: ApplicationResponse[];
  getHref?: (application: ApplicationResponse) => string;
}

/**
 * "Riwayat Pengajuan" — daftar pengajuan milik INTERN yang sedang login.
 * Ditampilkan di dalam NotificationDropdown.
 */
export function ApplicationHistoryList({ applications, getHref }: ApplicationHistoryListProps) {
  return (
    <ApplicationCompactList
      applications={applications}
      emptyMessage="Belum ada pengajuan. Buat pengajuan pertama Anda."
      getHref={getHref}
    />
  );
}

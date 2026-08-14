import type { ApplicationResponse } from '@/types/api/application.types';
import { Inbox } from 'lucide-react';
import { ApplicationCompactItem } from './ApplicationCompactItem';

export interface ApplicationCompactListProps {
  applications: ApplicationResponse[];
  showApplicant?: boolean;
  emptyMessage?: string;
  getHref?: (application: ApplicationResponse) => string;
}

/**
 * Daftar kompak aplikasi magang untuk area sempit (NotificationDropdown).
 * `getHref` dipakai untuk membuat tiap baris menuju halaman detail `[id]`.
 */
export function ApplicationCompactList({
  applications,
  showApplicant = false,
  emptyMessage = 'Belum ada pengajuan.',
  getHref,
}: ApplicationCompactListProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
        <Inbox className="size-6 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border/60">
      {applications.map((application) => (
        <ApplicationCompactItem
          key={application.id}
          application={application}
          showApplicant={showApplicant}
          href={getHref?.(application)}
        />
      ))}
    </div>
  );
}

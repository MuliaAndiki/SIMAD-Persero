'use client';

import { ApplicationStatusBadge } from '@/components/organisms/application/ApplicationStatusBadge';
import type { ApplicationResponse } from '@/types/api/application.types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/string.format';
import Link from 'next/link';

export interface ApplicationCompactItemProps {
  application: ApplicationResponse;
  showApplicant?: boolean;
  href?: string;
}

/**
 * Satu baris aplikasi magang — dipakai di dalam NotificationDropdown.
 * Jika `href` diberikan, baris dirender sebagai Link menuju halaman detail
 * dynamic route `[id]`.
 */
export function ApplicationCompactItem({
  application,
  showApplicant = false,
  href,
}: ApplicationCompactItemProps) {
  const title = showApplicant
    ? (application.internProfile?.user.fullName ?? 'Intern')
    : (application.applicationNumber ?? 'Draft');

  const subtitle = showApplicant
    ? [application.applicationNumber ?? 'Draft', formatDate(application.requestedStartDate)]
        .filter(Boolean)
        .join(' · ')
    : `${formatDate(application.requestedStartDate)} — ${formatDate(application.requestedEndDate)}`;

  const content = (
    <>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{title}</span>
        <span
          className={cn(
            'truncate text-xs text-muted-foreground',
            showApplicant && application.applicationNumber && 'font-medium',
          )}
        >
          {subtitle}
        </span>
      </div>
      <ApplicationStatusBadge status={application.status} />
    </>
  );

  const rowClass = 'flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left';

  if (href) {
    return (
      <Link href={href} className={cn(rowClass, 'transition-colors hover:bg-accent/60')}>
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}

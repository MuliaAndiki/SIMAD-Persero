'use client';

export interface ApplicationDetailFieldProps {
  label: string;
  value?: string | null;
}

/**
 * ApplicationDetailField — organism field detail (label + nilai).
 * Dipakai di dalam dialog review pengajuan.
 */
export function ApplicationDetailField({ label, value }: ApplicationDetailFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}

import { Badge } from '@/components/atoms/badge';
import { cn } from '@/utils/classname';
import { CheckCircle2, FileText, Send, XCircle } from 'lucide-react';

function applicationStatusLabel(status: string | null): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Diajukan';
    case 'UNDER_REVIEW':
      return 'Sedang Direview';
    case 'RESUBMITTED':
      return 'Diajukan Ulang';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return status ?? '-';
  }
}

/**
 * ApplicationStatusBadge — badge status pengajuan magang
 * (DRAFT / SUBMITTED / UNDER_REVIEW / RESUBMITTED / APPROVED / REJECTED).
 */
export function ApplicationStatusBadge({ status }: { status: string | null }) {
  const approved = status === 'APPROVED';
  const rejected = status === 'REJECTED';
  const reviewed = status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'RESUBMITTED';
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : reviewed ? Send : FileText;

  return (
    <Badge
      variant={approved ? 'default' : rejected ? 'destructive' : reviewed ? 'secondary' : 'outline'}
      className={cn(approved && 'bg-green-600 hover:bg-green-700')}
    >
      <Icon className="size-3" />
      {applicationStatusLabel(status)}
    </Badge>
  );
}

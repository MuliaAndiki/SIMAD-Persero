import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { useApi } from '@/hooks/useService/useApi';
import { formatDate } from '@/utils/string.format';
import { Activity, History, Loader2, ShieldAlert } from 'lucide-react';

export interface UserAuditLogModalProps {
  open: boolean;
  userId: string | null;
  userName?: string;
  onClose: () => void;
}

export function UserAuditLogModal({ open, userId, userName, onClose }: UserAuditLogModalProps) {
  const api = useApi();
  const userActivity = api.auditLog.query.userActivity(
    { userId: userId ?? '' },
    undefined,
    { enabled: Boolean(open && userId) },
  );

  const logs = userActivity.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Log Aktivitas Pengguna
          </DialogTitle>
          <DialogDescription>
            Riwayat jejak aktivitas pengguna{' '}
            <span className="font-semibold text-foreground">{userName ?? 'Pengguna'}</span> pada
            sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto py-2">
          {userActivity.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0 text-amber-500" />
              Belum ada riwayat aktivitas tercatat untuk pengguna ini.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.module}
                      </Badge>
                      <span className="font-semibold text-foreground">{log.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  {log.tableName && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="size-3 text-primary" />
                      Tabel: {log.tableName} (ID: {log.recordId})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

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
import type { AuditLogResponse } from '@/types/api/auditLog.types';
import { formatDate } from '@/utils/string.format';

export interface AuditLogDetailDialogProps {
  log: AuditLogResponse | null;
  onClose: () => void;
}

/**
 * AuditLogDetailDialog — organism dialog detail audit log (JSON lama/baru).
 */
export function AuditLogDetailDialog({ log, onClose }: AuditLogDetailDialogProps) {
  return (
    <Dialog
      open={Boolean(log)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {!log ? (
          <DialogHeader>
            <DialogTitle>Memuat detail…</DialogTitle>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Detail Audit Log</DialogTitle>
              <DialogDescription>
                {formatDate(log.createdAt)} · {log.user?.fullName ?? 'Sistem'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Modul</span>
                  <Badge variant="secondary" className="w-fit">
                    {log.module}
                  </Badge>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Aksi</span>
                  <span className="font-medium">{log.action}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Tabel</span>
                  <span className="font-medium">{log.tableName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Record ID</span>
                  <span className="break-all font-mono text-xs">{log.recordId}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">IP Address</span>
                  <span className="font-medium">{log.ipAddress ?? '-'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">User Agent</span>
                  <span className="line-clamp-2 text-xs">{log.userAgent ?? '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Data Lama</span>
                  <pre className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                    {log.oldData ? JSON.stringify(log.oldData, null, 2) : '(kosong)'}
                  </pre>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Data Baru</span>
                  <pre className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                    {log.newData ? JSON.stringify(log.newData, null, 2) : '(kosong)'}
                  </pre>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

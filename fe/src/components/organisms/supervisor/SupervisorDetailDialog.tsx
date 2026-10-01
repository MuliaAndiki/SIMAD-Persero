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
import { SupervisorAssignmentsTable } from '@/components/organisms/table/SupervisorAssignmentsTable';
import type { SupervisorDetailResponse } from '@/types/api/supervisor.types';
import { UserPlus, Users } from 'lucide-react';

export interface SupervisorDetailDialogProps {
  open: boolean;
  supervisor: SupervisorDetailResponse | null;
  isDetailPending: boolean;
  isRemoving: boolean;
  onOpenAssign: () => void;
  onClose: () => void;
  onRemoveAssignment: (assignmentId: string) => void | Promise<void>;
}

/**
 * SupervisorDetailDialog — organism dialog detail supervisor + daftar
 * penugasan intern. Presentasi murni; state & handler dari container.
 */
export function SupervisorDetailDialog({
  open,
  supervisor,
  isDetailPending,
  isRemoving,
  onOpenAssign,
  onClose,
  onRemoveAssignment,
}: SupervisorDetailDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isRemoving) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {!supervisor || isDetailPending ? (
          <DialogHeader>
            <DialogTitle>Memuat detail…</DialogTitle>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Detail Supervisor</DialogTitle>
              <DialogDescription>
                {supervisor.fullName} · {supervisor.email}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={supervisor.isActive ? 'default' : 'secondary'} className="w-fit">
                    {supervisor.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Bimbingan Aktif</span>
                  <span className="font-medium">{supervisor.activeAssignmentsCount}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Total Penugasan</span>
                  <span className="font-medium">{supervisor.assignments.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Intern Bimbingan</h3>
                  <Button size="sm" onClick={onOpenAssign}>
                    <UserPlus className="size-4" />
                    Assign Intern
                  </Button>
                </div>

                {supervisor.assignments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center">
                    <Users className="size-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada intern yang dibimbing supervisor ini.
                    </p>
                  </div>
                ) : (
                  <SupervisorAssignmentsTable
                    assignments={supervisor.assignments}
                    isRemoving={isRemoving}
                    onRemoveAssignment={onRemoveAssignment}
                  />
                )}
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

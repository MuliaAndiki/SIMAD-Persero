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
import type { SupervisorDetailResponse } from '@/types/api/supervisor.types';
import { formatDate } from '@/utils/string.format';
import { UserPlus, Users, XCircle } from 'lucide-react';

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
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Intern</th>
                          <th className="px-4 py-3 font-medium">Departemen</th>
                          <th className="px-4 py-3 font-medium">Periode</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supervisor.assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {assignment.internship?.intern?.fullName ?? '-'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {assignment.internship?.intern?.studentNumber ?? ''}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {assignment.internship?.department?.name ?? '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span>
                                  {formatDate(assignment.internship?.actualStartDate ?? null)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  s.d. {formatDate(assignment.internship?.actualEndDate ?? null)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{assignment.internship?.status ?? '-'}</td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={isRemoving}
                                onClick={() => onRemoveAssignment(assignment.id)}
                              >
                                <XCircle className="size-4" />
                                Lepas
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

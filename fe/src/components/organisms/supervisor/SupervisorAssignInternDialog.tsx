'use client';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { ApplicationResponse } from '@/types/api/application.types';
import type { FormEvent } from 'react';

export interface SupervisorAssignInternDialogProps {
  open: boolean;
  internshipId: string;
  approvedApplications: ApplicationResponse[];
  assignedInternshipIds: string[];
  isAssigning: boolean;
  onInternshipIdChange: (internshipId: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * SupervisorAssignInternDialog — organism dialog assign intern ke supervisor.
 * Pilihan peserta (derivasi murni dari props) difilter dari aplikasi APPROVED
 * yang belum ter-assign. Nilai `internshipId` dikontrol penuh container (§19.4).
 */
export function SupervisorAssignInternDialog({
  open,
  internshipId,
  approvedApplications,
  assignedInternshipIds,
  isAssigning,
  onInternshipIdChange,
  onClose,
  onSubmit,
}: SupervisorAssignInternDialogProps) {
  const available = approvedApplications.filter(
    (app) =>
      app.internship?.id &&
      !assignedInternshipIds.includes(app.internship.id) &&
      app.internProfile?.user.fullName,
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!internshipId) return;
    void onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isAssigning) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Intern</DialogTitle>
          <DialogDescription>
            Pilih peserta magang yang disetujui untuk dibimbing supervisor ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="assignIntern" className="text-sm font-medium">
              Peserta Magang
            </label>
            <Select value={internshipId} onValueChange={onInternshipIdChange}>
              <SelectTrigger id="assignIntern">
                <SelectValue placeholder="Pilih peserta" />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Tidak ada peserta yang dapat di-assign.
                  </div>
                ) : (
                  available.map((app) => (
                    <SelectItem key={app.internship!.id} value={app.internship!.id}>
                      {app.internProfile?.user.fullName} (
                      {app.internProfile?.studentNumber || 'tanpa NIM'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isAssigning}>
              Batal
            </Button>
            <Button type="submit" disabled={isAssigning || !internshipId}>
              {isAssigning ? 'Menyimpan…' : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

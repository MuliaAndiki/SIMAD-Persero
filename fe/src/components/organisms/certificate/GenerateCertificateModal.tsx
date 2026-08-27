import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import type { InternshipResponse } from '@/types/api/internship.types';
import { Award, Loader2 } from 'lucide-react';

export interface GenerateCertificateModalProps {
  open: boolean;
  isPending: boolean;
  internship: InternshipResponse | null;
  onClose: () => void;
  onSubmit: (internshipId: string) => Promise<void>;
}

export function GenerateCertificateModal({
  open,
  isPending,
  internship,
  onClose,
  onSubmit,
}: GenerateCertificateModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;
    await onSubmit(internship.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            Terbitkan Sertifikat Magang
          </DialogTitle>
          <DialogDescription>
            Terbitkan sertifikat digital resmi untuk peserta magang{' '}
            <span className="font-semibold text-foreground">
              {internship?.internProfile?.user.fullName}
            </span>
            . File PDF sertifikat akan dibuat otomatis dan dapat diunduh oleh peserta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peserta:</span>
              <span className="font-medium">{internship?.internProfile?.user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Departemen:</span>
              <span className="font-medium">{internship?.department?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instansi:</span>
              <span className="font-medium">
                {internship?.internProfile?.institution?.name ?? '-'}
              </span>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !internship}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Terbitkan Sertifikat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

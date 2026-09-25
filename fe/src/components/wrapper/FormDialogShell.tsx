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
import { Loader2 } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

export interface FormDialogShellProps {
  open: boolean;
  title: string;
  description?: string;
  isEdit?: boolean;
  isSaving?: boolean;
  canSubmit?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
  maxWidthClass?: string;
}

/**
 * FormDialogShell — wrapper reusable untuk komponen dialog form di SIMAD.
 * Menstandarisasi dialog header, accessibility, button loading states, dan footer actions.
 */
export function FormDialogShell({
  open,
  title,
  description,
  isEdit = false,
  isSaving = false,
  canSubmit = true,
  submitLabel,
  cancelLabel = 'Batal',
  onClose,
  onSubmit,
  children,
  maxWidthClass = 'sm:max-w-md',
}: FormDialogShellProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSaving) return;
    void onSubmit();
  };

  const defaultSubmitLabel = isEdit ? 'Simpan Perubahan' : 'Simpan';
  const effectiveSubmitLabel = isSaving ? 'Menyimpan…' : (submitLabel ?? defaultSubmitLabel);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSaving) onClose();
      }}
    >
      <DialogContent className={maxWidthClass}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {children}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSaving || !canSubmit}>
              {isSaving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {effectiveSubmitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

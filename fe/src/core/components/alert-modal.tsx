'use client';

import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import type { ModalProps } from '@/types/ui';

const iconMap = {
  success: '/images/succes.webp',
  error: '/images/error.webp',
  warning: '/images/warning.webp',
  info: '/images/info.webp',
  question: '/images/question.webp',
} as const;

interface AlertModalInternalProps extends ModalProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  cancelText?: string;
  onCancel?: () => void;
}

export function AlertModal({
  open,
  setOpen,
  title,
  deskripsi,
  icon = 'info',
  confirmButtonText = 'OK',
  confirmButtonColor = 'bg-primary',
  cancelText,
  onConfirm,
  onCancel,
}: AlertModalInternalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm text-center [&>button]:hidden">
        <DialogHeader>
          <Image src={iconMap[icon]} alt={icon} width={100} height={100} className="mx-auto" />

          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text- dark:text-gray-300 text-center justify-center">
            {deskripsi}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 pt-4">
          {cancelText && (
            <button
              onClick={() => {
                onCancel?.();
                setOpen(false);
              }}
              className="px-4 py-2 text-sm rounded border border-gray-300 bg-destructive dark:border-gray-600"
            >
              <span className="text-white font-semibold">{cancelText}</span>
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              setOpen(false);
            }}
            className={`${confirmButtonColor} text-white font-semibold px-4 py-2 rounded text-sm`}
          >
            {confirmButtonText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

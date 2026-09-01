"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import type { ModalProps } from "@/types/ui";

const iconMap = {
  success: "/images/artis/succes.webp",
  error: "/images/artis/error.webp",
  warning: "/images/artis/warning.webp",
  info: "/images/artis/info.webp",
  question: "/images/artis/question.webp",
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
  icon = "info",
  confirmButtonText = "OK",
  confirmButtonColor = "bg-primary",
  cancelText,
  onConfirm,
  onCancel,
}: AlertModalInternalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm text-center [&>button]:hidden">
        <DialogHeader className="gap-2">
          <Image
            src={iconMap[icon]}
            alt={icon}
            width={100}
            height={100}
            className="mx-auto rounded-full"
          />

          <DialogTitle className="text-center text-lg font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center justify-center font-semibold text-foreground/90 dark:text-gray-200">
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

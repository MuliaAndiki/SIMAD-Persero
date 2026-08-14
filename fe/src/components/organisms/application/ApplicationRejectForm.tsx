"use client";

import { Button } from "@/components/atoms/button";
import { XCircle } from "lucide-react";
import type { FormEvent } from "react";

export type RejectApplicationFormField = "reason";

/** Object state form tolak — dimiliki container (§19.4). */
export interface RejectApplicationFormState {
  reason: string;
}

export interface ApplicationRejectFormProps {
  form: RejectApplicationFormState;
  isSubmitting: boolean;
  onFieldChange: (field: RejectApplicationFormField, value: string) => void;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * ApplicationRejectForm — organism form tolak pengajuan.
 * Field dikontrol penuh container via `form` + `onFieldChange` (§19.5).
 */
export function ApplicationRejectForm({
  form,
  isSubmitting,
  onFieldChange,
  onBack,
  onSubmit,
}: ApplicationRejectFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) return;
    void onSubmit();
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
        <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
          <XCircle className="size-5 text-destructive" />
          Tolak Pengajuan
        </h2>
        <p className="text-sm text-muted-foreground">
          Pengajuan akan ditolak. Alasan ini akan terlihat oleh peserta magang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Alasan Penolakan *
          </span>
          <textarea
            value={form.reason}
            onChange={(e) => onFieldChange("reason", e.target.value)}
            rows={4}
            placeholder="Tuliskan alasan penolakan…"
            className="border-input placeholder:text-muted-foreground flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Kembali
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={!form.reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Menolak…" : "Tolak Pengajuan"}
          </Button>
        </div>
      </form>
    </>
  );
}

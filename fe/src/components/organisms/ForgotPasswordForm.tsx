import { Button } from "@/components/atoms/button";
import TextField from "@/core/components/text-field";
import type { ForgotPasswordBody } from "@/types/api/auth.types";
import { MailCheck } from "lucide-react";
import type React from "react";

export interface ForgotPasswordFormProps {
  formForgot: ForgotPasswordBody;
  isPending: boolean;
  isSuccess: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<ForgotPasswordBody>) => void;
}

export function ForgotPasswordForm({
  formForgot,
  isPending,
  isSuccess,
  onSubmit,
  onChange,
}: ForgotPasswordFormProps) {
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Email Terkirim
        </h3>
        <p className="text-sm text-foreground/70">
          Silakan cek <span className="font-bold">Kotak Masuk</span> email atau{" "}
          {""}
          <span className="font-bold">Folder Spam</span> Anda dan ikuti
          instruksi untuk mengatur ulang password Anda.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <TextField
        label="Email Terdaftar"
        id="email"
        name="email"
        type="email"
        placeholder="Masukkan email Anda"
        value={formForgot.email}
        onChange={(e) => onChange({ email: e.target.value })}
        disabled={isPending}
        required
      />

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        variant="default"
        disabled={isPending}
      >
        {isPending ? "Mengirim..." : "Kirim Link Reset"}
      </Button>
    </form>
  );
}

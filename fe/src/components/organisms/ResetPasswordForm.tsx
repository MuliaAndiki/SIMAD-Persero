import { Button } from '@/components/atoms/button';
import TextField from '@/core/components/text-field';
import type { ResetPasswordBody } from '@/types/api/auth.types';
import { AlertCircle } from 'lucide-react';
import type React from 'react';

export interface ResetPasswordFormProps {
  formReset: ResetPasswordBody;
  isPending: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<ResetPasswordBody>) => void;
}

export function ResetPasswordForm({
  formReset,
  isPending,
  onSubmit,
  onChange,
}: ResetPasswordFormProps) {
  if (!formReset.token) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start space-x-3 mb-6">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Link reset password tidak valid atau tidak menyertakan token yang diperlukan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <TextField
        label="Password Baru"
        id="password"
        name="password"
        type="password"
        placeholder="Masukkan password baru"
        value={formReset.password}
        onChange={(e) => onChange({ password: e.target.value })}
        disabled={isPending}
        required
      />

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        variant="default"
        disabled={isPending}
      >
        {isPending ? 'Menyimpan...' : 'Simpan Password'}
      </Button>
    </form>
  );
}

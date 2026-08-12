import { Button } from '@/components/atoms/button';
import TextField from '@/core/components/text-field';
import type { RegisterBody } from '@/types/api/auth.types';
import type React from 'react';

export interface RegisterFormProps {
  formRegister: RegisterBody;
  isPending: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<RegisterBody>) => void;
}

export function RegisterForm({ formRegister, isPending, onSubmit, onChange }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <TextField
        label="Nama Lengkap"
        id="fullName"
        name="fullName"
        type="text"
        placeholder="Masukkan nama lengkap Anda"
        value={formRegister.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        disabled={isPending}
        required
      />

      <TextField
        label="Email"
        id="email"
        name="email"
        type="email"
        placeholder="Masukkan email Anda"
        value={formRegister.email}
        onChange={(e) => onChange({ email: e.target.value })}
        disabled={isPending}
        required
      />

      <TextField
        label="Password"
        id="password"
        name="password"
        type="password"
        placeholder="Buat password baru"
        value={formRegister.password}
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
        {isPending ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>
    </form>
  );
}

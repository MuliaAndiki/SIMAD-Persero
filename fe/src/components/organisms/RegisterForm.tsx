import { Button } from '@/components/atoms/button';
import TextField from '@/core/components/text-field';
import type { RegisterBody } from '@/types/api/auth.types';
import { checkPasswordCriteria } from '@/utils/password-validation';
import { Icon } from '@iconify/react';
import type React from 'react';

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface RegisterFormProps {
  formRegister: RegisterBody;
  isPending: boolean;
  errors?: RegisterFormErrors;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<RegisterBody>) => void;
}

function CriteriaItem({ fulfilled, text }: { fulfilled: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors ${
        fulfilled ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
      }`}
    >
      <Icon
        icon={fulfilled ? 'lucide:check-circle-2' : 'lucide:circle'}
        className={`size-3.5 shrink-0 ${
          fulfilled ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'
        }`}
      />
      <span>{text}</span>
    </div>
  );
}

export function RegisterForm({
  formRegister,
  isPending,
  errors,
  onSubmit,
  onChange,
}: RegisterFormProps) {
  const criteria = checkPasswordCriteria(formRegister.password);

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
        error={errors?.fullName}
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
        error={errors?.email}
        required
      />

      <div className="space-y-2">
        <TextField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="Buat password baru"
          value={formRegister.password}
          onChange={(e) => onChange({ password: e.target.value })}
          disabled={isPending}
          error={errors?.password}
          required
        />

        <div className="rounded-lg bg-muted/50 p-3 border border-border/50 text-xs space-y-1.5">
          <p className="font-medium text-foreground/80 mb-1">Ketentuan password:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <CriteriaItem fulfilled={criteria.minLength} text="Minimal 8 karakter" />
            <CriteriaItem fulfilled={criteria.hasUpper} text="Huruf besar (A-Z)" />
            <CriteriaItem fulfilled={criteria.hasLower} text="Huruf kecil (a-z)" />
            <CriteriaItem fulfilled={criteria.hasNumber} text="Angka (0-9)" />
            <CriteriaItem
              fulfilled={criteria.hasSpecial}
              text="Karakter khusus / simbol (!@#$...)"
            />
          </div>
        </div>
      </div>

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

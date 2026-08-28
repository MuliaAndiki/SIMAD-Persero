import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { AlertCircle, KeyRound, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';

/** State yang disuplai container — section murni presentasi. */
export interface ChangePasswordSectionState {
  isChangingPassword: boolean;
  /** Path halaman profil sesuai role — dipakai tombol Batal. */
  backPath?: string;
}

/** Aksi dari container (mutation) — section hanya memanggil. */
export interface ChangePasswordSectionService {
  onChangePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => void | Promise<void>;
}

export interface ChangePasswordSectionProps {
  state: ChangePasswordSectionState;
  service: ChangePasswordSectionService;
}

export function ChangePasswordSection({ state, service }: ChangePasswordSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Ganti Password</h1>
        <p className="text-sm text-muted-foreground">
          Ganti password secara berkala untuk menjaga keamanan akun Anda.
        </p>
      </header>

      <ChangePasswordForm
        isChangingPassword={state.isChangingPassword}
        backPath={state.backPath ?? '/intern/profile'}
        onChangePassword={service.onChangePassword}
      />
    </section>
  );
}

/** Form ganti password (old + new + konfirmasi). */
function ChangePasswordForm({
  isChangingPassword,
  backPath,
  onChangePassword,
}: {
  isChangingPassword: boolean;
  backPath: string;
  onChangePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => void | Promise<void>;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!oldPassword) {
      setLocalError('Password lama wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('Password baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Konfirmasi password baru tidak cocok.');
      return;
    }

    onChangePassword({ oldPassword, newPassword });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          Keamanan Akun
        </CardTitle>
        <CardDescription>Password baru minimal 8 karakter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="oldPassword" className="text-sm font-medium">
              Password Lama
            </label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              Password Baru
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Konfirmasi Password Baru
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />
          </div>

          {localError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {localError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button asChild type="button" variant="outline">
              <Link href={backPath}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isChangingPassword ? 'Menyimpan…' : 'Ganti Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

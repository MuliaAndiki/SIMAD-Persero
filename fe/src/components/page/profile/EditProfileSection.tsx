import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import type { ProfileResponse } from '@/types/api/user.types';
import { AlertCircle, Loader2, Save, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';

/** State yang disuplai container — section murni presentasi. */
export interface EditProfileSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  profile: ProfileResponse | null;
  isUpdating: boolean;
}

/** Aksi dari container (mutation) — section hanya memanggil. */
export interface EditProfileSectionService {
  onUpdateProfile: (data: {
    fullName: string;
    phone: string;
  }) => void | Promise<void>;
}

export interface EditProfileSectionProps {
  state: EditProfileSectionState;
  service: EditProfileSectionService;
}

export function EditProfileSection({ state, service }: EditProfileSectionProps) {
  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <Card className="h-72" />
      </PhantomSkeleton>
    );
  }

  if (state.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">Gagal memuat profil</span>
          <span className="text-muted-foreground">
            {state.errorMessage || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
          </span>
        </div>
      </div>
    );
  }

  const profile = state.profile;
  if (!profile) return null;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Ubah Profil</h1>
        <p className="text-sm text-muted-foreground">
          Perbarui nama lengkap dan nomor telepon yang terhubung dengan akun Anda.
        </p>
      </header>

      <EditProfileForm
        profile={profile}
        isUpdating={state.isUpdating}
        onUpdateProfile={service.onUpdateProfile}
      />
    </section>
  );
}

/** Form edit nama lengkap & nomor telepon. */
function EditProfileForm({
  profile,
  isUpdating,
  onUpdateProfile,
}: {
  profile: ProfileResponse;
  isUpdating: boolean;
  onUpdateProfile: (data: {
    fullName: string;
    phone: string;
  }) => void | Promise<void>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const name = fullName.trim();
    const phoneValue = phone.trim();
    if (!name) {
      setLocalError('Nama lengkap wajib diisi.');
      return;
    }
    if (!phoneValue) {
      setLocalError('Nomor telepon wajib diisi.');
      return;
    }

    onUpdateProfile({ fullName: name, phone: phoneValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" />
          Informasi Pribadi
        </CardTitle>
        <CardDescription>Hanya nama lengkap dan nomor telepon yang dapat diubah.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Nama Lengkap
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap Anda"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" value={profile.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah dari halaman ini.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Nomor Telepon
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
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
              <Link href="/INTERN/dashboard/profile">Batal</Link>
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isUpdating ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

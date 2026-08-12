import { PhantomSkeleton } from "@/components/atoms/PhantomSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import type { ProfileResponse } from "@/types/api/user.types";
import { AlertContexType } from "@/types/ui";
import {
  AlertCircle,
  Camera,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  PenLine,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

/** State yang disuplai container — section murni presentasi. */
export interface ProfileSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  profile: ProfileResponse | null;
  isUploading: boolean;
  alert: AlertContexType;
}

/** Aksi dari container (mutation) — section hanya memanggil. */
export interface ProfileSectionService {
  onUploadPhoto: (file: File) => void | Promise<void>;
  onLogout: () => void;
}

export interface ProfileSectionProps {
  state: ProfileSectionState;
  service: ProfileSectionService;
}

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

/** Inisial nama untuk fallback avatar. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Label role dalam Bahasa Indonesia. */
function roleLabel(role: string | null): string {
  switch (role) {
    case "INTERN":
      return "Peserta Magang";
    case "HR_ADMIN":
      return "HR Admin";
    case "SUPERVISOR":
      return "Supervisor";
    default:
      return role ?? "-";
  }
}

export function ProfileSection({ state, service }: ProfileSectionProps) {
  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <div className="flex flex-col gap-6">
          <Card className="h-40" />
          <Card className="h-64" />
        </div>
      </PhantomSkeleton>
    );
  }

  if (state.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">
            Gagal memuat profil
          </span>
          <span className="text-muted-foreground">
            {state.errorMessage ||
              "Terjadi kesalahan saat mengambil data. Silakan coba lagi."}
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
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Lihat informasi akun Anda dan kelola data profil.
        </p>
      </header>

      <ProfileIdentityCard
        profile={profile}
        isUploading={state.isUploading}
        onUploadPhoto={service.onUploadPhoto}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-primary" />
            Detail Profil
          </CardTitle>
          <CardDescription>
            Informasi akun yang terdaftar pada sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
              <dt className="text-xs text-muted-foreground">Nama Lengkap</dt>
              <dd className="text-sm font-medium">{profile.fullName}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="size-3.5 shrink-0 text-primary" />
                {profile.email}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
              <dt className="text-xs text-muted-foreground">Nomor Telepon</dt>
              <dd className="flex items-center gap-1.5 text-sm font-medium">
                <Phone className="size-3.5 shrink-0 text-primary" />
                {profile.phone || "-"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
              <dt className="text-xs text-muted-foreground">Peran</dt>
              <dd className="text-sm font-medium">{roleLabel(profile.role)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/INTERN/dashboard/profile/intern">
            <GraduationCap className="size-4" />
            Profil Magang
          </Link>
        </Button>
        <Button asChild>
          <Link href="/INTERN/dashboard/profile/edit">
            <PenLine className="size-4" />
            Ubah Profil
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/INTERN/dashboard/profile/password">
            <KeyRound className="size-4" />
            Ganti Password
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            state.alert.modal({
              title: "Keluar ?",
              deskripsi: "Apakah Anda Ingin Keluar",
              icon: "question",
              onConfirm: () => {
                service.onLogout();
              },
            })
          }
          disabled={state.isPending}
        >
          {state.isPending ? "Loading..." : "Keluar"}
        </Button>
      </div>
    </section>
  );
}

/** Kartu identitas: foto profil + informasi dasar. */
function ProfileIdentityCard({
  profile,
  isUploading,
  onUploadPhoto,
}: {
  profile: ProfileResponse;
  isUploading: boolean;
  onUploadPhoto: (file: File) => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setLocalError("Format foto harus JPG, JPEG, atau PNG.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setLocalError("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    setLocalError(null);
    onUploadPhoto(file);
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-24 text-2xl font-semibold">
          {profile.profilePhoto ? (
            <AvatarImage src={profile.profilePhoto} alt={profile.fullName} />
          ) : null}
          <AvatarFallback>
            {getInitials(profile.fullName) || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {profile.fullName}
            </h2>
            <Badge variant="secondary">{roleLabel(profile.role)}</Badge>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            {profile.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            {profile.phone || "-"}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_PHOTO_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {isUploading ? "Mengunggah…" : "Ganti Foto"}
          </Button>
          {localError && (
            <p className="text-sm text-destructive">{localError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

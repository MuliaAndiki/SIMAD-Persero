import { Button } from "@/components/atoms/button";
import TextField from "@/core/components/text-field";
import type { LoginBody, RememberedAccount } from "@/types/api/auth.types";
import Image from "next/image";
import { useState } from "react";
import type React from "react";

export interface LoginFormProps {
  formLogin: LoginBody;
  isPending: boolean;
  rememberedAccount?: RememberedAccount | null;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<LoginBody>) => void;
  onClearSavedEmail?: () => void;
}

export function LoginForm({
  formLogin,
  isPending,
  rememberedAccount,
  onSubmit,
  onChange,
  onClearSavedEmail,
}: LoginFormProps) {
  const [imageError, setImageError] = useState(false);

  const getInitial = (nameOrEmail?: string): string => {
    if (!nameOrEmail) return "U";
    const clean = nameOrEmail.trim();
    return clean.length > 0 ? clean[0].toUpperCase() : "U";
  };

  const getDisplayName = (): string => {
    if (rememberedAccount?.fullName?.trim()) {
      return rememberedAccount.fullName;
    }
    if (formLogin.email) {
      return formLogin.email.split("@")[0];
    }
    return "Pengguna";
  };

  const hasRemembered = Boolean(rememberedAccount?.email);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {hasRemembered ? (
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-card via-muted/60 to-muted/30 border border-border/80 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {rememberedAccount?.avatarUrl && !imageError ? (
              <Image
                src={rememberedAccount.avatarUrl}
                alt={getDisplayName()}
                width={48}
                height={48}
                onError={() => setImageError(true)}
                className="size-12 rounded-full object-cover border-2 border-primary/30 shadow-sm shrink-0"
              />
            ) : (
              <div className="size-12 rounded-full bg-gradient-to-br from-primary via-primary/85 to-blue-600 text-primary-foreground font-bold text-lg flex items-center justify-center shadow-md shadow-primary/20 shrink-0 border border-white/20">
                {getInitial(rememberedAccount?.fullName || formLogin.email)}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {getDisplayName()}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {rememberedAccount?.email || formLogin.email}
              </span>
            </div>
          </div>

          {onClearSavedEmail && (
            <button
              type="button"
              onClick={onClearSavedEmail}
              className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-all shrink-0 ml-1"
            >
              Ganti akun
            </button>
          )}
        </div>
      ) : (
        <TextField
          label="Email"
          id="email"
          name="email"
          type="email"
          placeholder="Masukkan email Anda"
          value={formLogin.email}
          onChange={(e) => onChange({ email: e.target.value })}
          disabled={isPending}
          required
        />
      )}

      <TextField
        label="Password"
        id="password"
        name="password"
        type="password"
        placeholder="Masukkan password Anda"
        value={formLogin.password}
        onChange={(e) => onChange({ password: e.target.value })}
        disabled={isPending}
        required
        forgotPassword
      />

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        variant="default"
        disabled={isPending}
      >
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}

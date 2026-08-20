import { Button } from "@/components/atoms/button";
import TextField from "@/core/components/text-field";
import type { LoginBody } from "@/types/api/auth.types";
import type React from "react";
import Link from "next/link";

export interface LoginFormProps {
  formLogin: LoginBody;
  isPending: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (newForm: Partial<LoginBody>) => void;
}

export function LoginForm({
  formLogin,
  isPending,
  onSubmit,
  onChange,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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

import { ResetPasswordForm } from "@/components/organisms/ResetPasswordForm";
import type { ResetPasswordBody } from "@/types/api/auth.types";
import type React from "react";
import Image from "next/image";

export interface ResetPasswordSectionProps {
  state: {
    formReset: ResetPasswordBody;
    showPassword?: boolean;
    confirmPassword: string;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
    isPending: boolean;
  };
  service: {
    handleSubmit: (event: React.FormEvent) => void;
    onFormChange: (newForm: Partial<ResetPasswordBody>) => void;
    setShowPassword?: (show: boolean) => void;
  };
}

export function ResetPasswordSection({
  state,
  service,
}: ResetPasswordSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden card-glass">
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <div className="w-full flex justify-center ">
              <Image
                alt="logo"
                src={"/images/logos.png"}
                height={86}
                width={86}
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Daftar Akun
            </h1>
            <p className="text-sm text-foreground/60">SIMAD PLN Persero</p>
          </div>

          <ResetPasswordForm
            formReset={state.formReset}
            isPending={state.isPending}
            onSubmit={service.handleSubmit}
            onChange={service.onFormChange}
            confirmPassword={state.confirmPassword}
            setConfirmPassword={state.setConfirmPassword}
          />
        </div>
      </div>
    </section>
  );
}

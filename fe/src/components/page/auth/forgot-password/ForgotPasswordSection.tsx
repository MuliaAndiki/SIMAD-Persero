import { ForgotPasswordForm } from '@/components/organisms/ForgotPasswordForm';
import type { ForgotPasswordBody } from '@/types/api/auth.types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

export interface ForgotPasswordSectionProps {
  state: {
    formForgot: ForgotPasswordBody;
    isPending: boolean;
    isSuccess: boolean;
  };
  service: {
    handleSubmit: (event: React.FormEvent) => void;
    onFormChange: (newForm: Partial<ForgotPasswordBody>) => void;
  };
}

export function ForgotPasswordSection({ state, service }: ForgotPasswordSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden card-glass">
        <div className="px-8 py-10">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-foreground/60 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Lupa Password</h1>
            <p className="text-sm text-foreground/60">
              Masukkan email Anda dan kami akan mengirimkan instruksi untuk reset password.
            </p>
          </div>

          <ForgotPasswordForm
            formForgot={state.formForgot}
            isPending={state.isPending}
            isSuccess={state.isSuccess}
            onSubmit={service.handleSubmit}
            onChange={service.onFormChange}
          />
        </div>
      </div>
    </section>
  );
}

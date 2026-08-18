import { RegisterForm } from '@/components/organisms/RegisterForm';
import type { RegisterBody } from '@/types/api/auth.types';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
export interface RegisterSectionProps {
  state: {
    formRegister: RegisterBody;
    showPassword?: boolean;
    isPending: boolean;
  };
  service: {
    handleSubmit: (event: React.FormEvent) => void;
    onFormChange: (newForm: Partial<RegisterBody>) => void;
    setShowPassword?: (show: boolean) => void;
  };
}

export function RegisterSection({ state, service }: RegisterSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden card-glass">
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <div className="w-full flex justify-center ">
              <Image alt="logo" src={'/images/logos.png'} height={86} width={86} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Daftar Akun</h1>
            <p className="text-sm text-foreground/60">SIMAD PLN Persero</p>
          </div>

          <RegisterForm
            formRegister={state.formRegister}
            isPending={state.isPending}
            onSubmit={service.handleSubmit}
            onChange={service.onFormChange}
          />

          <div className="mt-6 text-center text-sm text-foreground/70">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

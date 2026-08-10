import { LoginForm } from '@/components/organisms/LoginForm';
import type { LoginBody } from '@/types/api/auth.types';
import type React from 'react';

export interface LoginSectionProps {
  state: {
    formLogin: LoginBody;
    showPassword?: boolean;
    isPending: boolean;
  };
  service: {
    handleSubmit: (event: React.FormEvent) => void;
    onFormChange: (newForm: Partial<LoginBody>) => void;
    setShowPassword?: (show: boolean) => void;
  };
}

export function LoginSection({ state, service }: LoginSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden card-glass">
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Login</h1>
            <p className="text-sm text-foreground/60">SIMAD PLN Persero</p>
          </div>

          <LoginForm
            formLogin={state.formLogin}
            isPending={state.isPending}
            onSubmit={service.handleSubmit}
            onChange={service.onFormChange}
          />
        </div>
      </div>
    </section>
  );
}

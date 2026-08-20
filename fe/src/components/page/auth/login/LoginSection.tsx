import { Button } from "@/components/atoms/button";
import { Separator } from "@/components/atoms/separator";
import { LoginForm } from "@/components/organisms/LoginForm";
import type { LoginBody } from "@/types/api/auth.types";
import { GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import type React from "react";

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
    handleGoogleLogin: (credential: string) => void;
    handleGoogleError?: () => void;
  };
}

export function LoginSection({ state, service }: LoginSectionProps) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Login</h1>
            <p className="text-sm text-foreground/60">SIMAD PLN Persero</p>
          </div>

          <LoginForm
            formLogin={state.formLogin}
            isPending={state.isPending}
            onSubmit={service.handleSubmit}
            onChange={service.onFormChange}
          />

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">atau</span>
            <Separator className="flex-1" />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              type="button"
              className="w-full h-10 pointer-events-none select-none"
              tabIndex={-1}
              aria-hidden="true"
              disabled={state.isPending}
            >
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.667s3.773-8.667 8.6-8.667c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
              </svg>
              Login with Google
            </Button>

            {!state.isPending && (
              <div className="absolute inset-0 opacity-0" aria-hidden="true">
                <GoogleLogin
                  onSuccess={({ credential }) => {
                    if (credential) service.handleGoogleLogin(credential);
                  }}
                  onError={service.handleGoogleError}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  width="100%"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

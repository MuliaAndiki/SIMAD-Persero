'use client';

import { SidebarProvider } from '@/components/atoms';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { env } from '@/configs/env.config';
import { AuthProvider } from '@/core/providers/auth.provider';
import { HealthPingProvider } from '@/core/providers/health-ping.provider';
import { LenisProvider } from '@/core/providers/lenis.provinder';
import { ThemeProvider } from '@/core/providers/theme.provider';
import { AlertProvinder } from '@/hooks/useAlert/costum-alert';
import { ReactQueryClientProvider } from '@/pkg/react-query/query-client.pkg';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { composeProviders } from './composeProvinders';
import { StyledComponentsRegistry } from './styled-registry';

const Providers = composeProviders([
  StyledComponentsRegistry,
  ({ children }) => <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>,
  ({ children }) => (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  ),
  AuthProvider,
  ThemeProvider,
  AlertProvinder,
  LenisProvider,
  ReactQueryClientProvider,
]);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <HealthPingProvider>
        <PWAUpdatePrompt />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </HealthPingProvider>
    </Providers>
  );
}

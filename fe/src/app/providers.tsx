'use client';

import { SidebarProvider } from '@/components/atoms';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { AuthProvider } from '@/core/providers/auth.provider';
import { LenisProvider } from '@/core/providers/lenis.provinder';
import { ThemeProvider } from '@/core/providers/theme.provider';
import { AlertProvinder } from '@/hooks/useAlert/costum-alert';
import { ReactQueryClientProvider } from '@/pkg/react-query/query-client.pkg';
import { persistor, store } from '@/stores/store';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { composeProviders } from './composeProvinders';

const Providers = composeProviders([
  ({ children }) => <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>,
  ({ children }) => <Provider store={store}>{children}</Provider>,
  ({ children }) => <PersistGate persistor={persistor}>{children}</PersistGate>,
  AuthProvider,
  ThemeProvider,
  AlertProvinder,
  LenisProvider,
  ReactQueryClientProvider,
]);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <PWAUpdatePrompt />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 900,
        }}
      />
    </Providers>
  );
}

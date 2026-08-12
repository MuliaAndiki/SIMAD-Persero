import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { APP_SESSION_COOKIE_KEY } from '@/configs/cookies.config';
import { AppShell } from '@/core/layouts/app-shell.layout';
import PrivateProviders from '@/core/providers/private.provider';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard autentikasi server-side: tanpa cookie sesi, arahkan ke /login.
  const store = await cookies();
  const accessToken = store.get(APP_SESSION_COOKIE_KEY)?.value;

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <PrivateProviders>
      <AppShell>{children}</AppShell>
    </PrivateProviders>
  );
}

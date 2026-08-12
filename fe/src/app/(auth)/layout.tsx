import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { APP_SESSION_COOKIE_KEY } from '@/configs/cookies.config';
import BlankLayout from '@/core/layouts/blank.layout';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sudah login? Jangan biarkan membuka halaman auth — arahkan ke dashboard role.
  const store = await cookies();
  const accessToken = store.get(APP_SESSION_COOKIE_KEY)?.value;

  if (accessToken) {
    redirect('/dashboard');
  }

  return (
    <main className="w-full">
      <BlankLayout>{children}</BlankLayout>
    </main>
  );
}

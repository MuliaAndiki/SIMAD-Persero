'use server';

import { NextResponse } from 'next/server';

import {
  APP_SESSION_COOKIE_KEY,
  APP_SESSION_COOKIE_REFRESH,
  APP_SESSION_COOKIE_ROLE,
} from '@/configs/cookies.config';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Hapus seluruh cookie sesi (access token, refresh token, role).
  cookieStore.delete(APP_SESSION_COOKIE_KEY);
  cookieStore.delete(APP_SESSION_COOKIE_REFRESH);
  cookieStore.delete(APP_SESSION_COOKIE_ROLE);

  return NextResponse.json({ message: 'Session deleted' });
}

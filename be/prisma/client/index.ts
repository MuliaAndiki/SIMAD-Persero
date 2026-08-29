import { PrismaClient } from '@prisma/client';
import { env } from '../../src/config/env.config';

function formatDatabaseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    // Increase pool timeout from 10s to 30s to prevent P2024 timeouts under load / cold starts
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '30');
    }
    // Set appropriate connection limit for Prisma client pool
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '20');
    }
    // Enable pgbouncer mode if using Neon pooler endpoint
    if (rawUrl.includes('-pooler.') && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: formatDatabaseUrl(env.DATABASE_URL),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;

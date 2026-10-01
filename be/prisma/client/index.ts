import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
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

const connectionString = formatDatabaseUrl(env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export { pool, adapter, prisma };
export default prisma;

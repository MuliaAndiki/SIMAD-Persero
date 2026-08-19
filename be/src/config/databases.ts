import prisma from 'prisma/client';
import { getLogger } from '../telemetry/otel.config';

export async function connectWithRetry(retries = 30, delay = 3000): Promise<typeof prisma> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      getLogger().info(`Database connected successfully! (attempt ${attempt}/${retries})`);
      return prisma;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      getLogger().error(
        { err: error },
        `Failed to connect to database (attempt ${attempt}/${retries}): ${message}`,
      );
      if (attempt === retries) {
        getLogger().error('All retry attempts failed. Giving up.');
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('connectWithRetry loop exited unexpectedly.');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  getLogger().info('Database disconnected.');
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export { prisma };

import { PrismaClient } from '@prisma/client';
import { env } from '../../src/config/env.config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

export default prisma;

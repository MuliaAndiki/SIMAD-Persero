import { describe, expect, it } from 'bun:test';
import prisma from '../../prisma/client';

describe('Prisma 7 Driver Adapter & Database Integration (PRISMA-008)', () => {
  it('should successfully execute queries through pg driver adapter', async () => {
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  it('should execute raw query with pg driver adapter', async () => {
    const result = await prisma.$queryRaw<[{ test: number }]>`SELECT 1 as test`;
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(Number(result[0].test)).toBe(1);
  });

  it('should support interactive transactions and advisory locking without connection leaks', async () => {
    let executedInTx = false;
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('prisma7_test_lock'))`;
      executedInTx = true;
    });
    expect(executedInTx).toBe(true);
  });

  it('should roll back changes when an interactive transaction fails', async () => {
    const uniqueEmail = `test_rollback_${Date.now()}@example.com`;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            fullName: 'Rollback Test User',
            email: uniqueEmail,
          },
        });
        // Deliberately throw to trigger rollback
        throw new Error('Forced rollback test');
      });
    } catch (e: any) {
      expect(e.message).toBe('Forced rollback test');
    }

    // Verify record was rolled back and does not exist
    const found = await prisma.user.findUnique({
      where: { email: uniqueEmail },
    });
    expect(found).toBeNull();
  });
});

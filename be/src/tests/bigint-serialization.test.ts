import { describe, expect, it } from 'bun:test';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';
import app from '../app';
import { HttpResponse, stringifyJson } from '../http';
import applicationService from '../services/application.service';

describe('BigInt JSON serialization safety', () => {
  it('should serialize file.size from BigInt to number in applicationService.list', async () => {
    const result = await applicationService.list({ limit: 10 });

    expect(() => JSON.stringify(result)).not.toThrow();

    for (const application of result.data) {
      if (!application) continue;
      for (const doc of application.documents ?? []) {
        if (doc.file && doc.file.size !== null && doc.file.size !== undefined) {
          expect(typeof doc.file.size).toBe('number');
        }
      }
    }
  });

  it('should return 200 without BigInt serialization error for GET /api/v1/applications?limit=10', async () => {
    const hrRole = await prisma.userRole.findFirst({
      where: { role: { code: { in: ['hr_admin', 'HR_ADMIN', 'receptionist', 'RECEPTIONIST'] } } },
      include: { user: true },
    });

    if (!hrRole?.user) {
      return;
    }

    const token = jwt.sign(
      { id: hrRole.user.id, email: hrRole.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' },
    );

    const res = await app.handle(
      new Request('http://localhost/api/v1/applications?limit=10', {
        headers: {
          'x-internal-api-key': process.env.INTERNAL_API_SECRET!,
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: number; data: unknown[] };
    expect(body.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should safely serialize BigInt values passed through stringifyJson and HttpResponse', async () => {
    class WrapperWithBigInt {
      size = BigInt(4096);
    }

    const fakeContext: any = {
      request: new Request('http://localhost/api/v1/test'),
      store: { startedAt: performance.now() },
      set: { headers: {} },
      json(data: unknown, status = 200) {
        return new Response(stringifyJson(data), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    };

    const response = HttpResponse(fakeContext).ok({
      fileSize: BigInt(91158),
      wrapped: new WrapperWithBigInt(),
    });

    expect(response?.status).toBe(200);
    const parsed = (await response?.json()) as {
      data: { fileSize: number; wrapped: { size: number } };
    };
    expect(parsed.data.fileSize).toBe(91158);
    expect(parsed.data.wrapped.size).toBe(4096);
  });
});

import { Type } from '@sinclair/typebox';

// ── Params ─────────────────────────────────────────────────────────────

export const CertificateIdParam = Type.Object({
  certificateId: Type.String({ format: 'uuid' }),
});

export const CertificateVerifyParam = Type.Object({
  verificationCode: Type.String({ minLength: 1 }),
});

// ── Generate body ──────────────────────────────────────────────────────

export const GenerateCertificateDto = Type.Object({
  internshipId: Type.String({ format: 'uuid' }),
});

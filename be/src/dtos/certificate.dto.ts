import { t } from 'elysia';

// ── Params ─────────────────────────────────────────────────────────────

export const CertificateIdParam = t.Object({
  certificateId: t.String({ format: 'uuid' }),
});

export const CertificateParamId = t.Object({
  id: t.String({ format: 'uuid' }),
});

export const OfficeLocationIdParam = t.Object({
  officeLocationId: t.String({ format: 'uuid' }),
});

export const CertificateVerifyParam = t.Object({
  verificationCode: t.String({ minLength: 1 }),
});

// ── Body Schemas ───────────────────────────────────────────────────────

export const GenerateCertificateDto = t.Object({
  internshipId: t.String({ format: 'uuid' }),
});

export const ApproveCertificateDto = t.Object({
  notes: t.Optional(t.String()),
});

export const RejectCertificateDto = t.Object({
  reason: t.String({ minLength: 3 }),
});

export const UpsertCertificateSettingDto = t.Object({
  officeLocationId: t.String({ format: 'uuid' }),
  signerName: t.String({ minLength: 2 }),
  signerRole: t.String({ minLength: 2 }),
  signatureFileId: t.Optional(t.String({ format: 'uuid' })),
  stampFileId: t.Optional(t.String({ format: 'uuid' })),
  templateFileId: t.Optional(t.String({ format: 'uuid' })),
  certificateNumberFormat: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateCertificateSettingsDto = t.Object({
  signerName: t.Optional(t.String()),
  signerRole: t.Optional(t.String()),
  signatureUrl: t.Optional(t.String()),
  templateUrl: t.Optional(t.String()),
});

// ── Query Schemas ──────────────────────────────────────────────────────

export const CertificateListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  approvalStatus: t.Optional(t.String()),
  officeLocationId: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  keyword: t.Optional(t.String()),
});

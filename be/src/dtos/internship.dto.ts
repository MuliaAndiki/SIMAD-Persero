import { t } from "elysia";

// ─── Path Params ─────────────────────────────────────────────────
export const InternshipIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

// ─── Body Schemas ────────────────────────────────────────────────

/** PATCH /internships/:id/extend */
export const ExtendInternshipDto = t.Object({
  newEndDate: t.String({ format: "date" }),
  reason: t.Optional(t.String()),
});

/** PATCH /internships/:id/assign-supervisor */
export const AssignSupervisorDto = t.Object({
  supervisorId: t.String({ format: "uuid" }),
});

/** PATCH /internships/:id/change-department */
export const ChangeDepartmentDto = t.Object({
  departmentId: t.String({ format: "uuid" }),
  officeLocationId: t.Optional(t.String({ format: "uuid" })),
});

/** Post /internships/Profile */
export const CreateProfileInternDto = t.Object({
  name: t.String({ error: "Nama jurusan wajib diisi" }),
  institutionId: t.String({ error: "Institution ID wajib diisi" }),
  address: t.String({ error: "Alamat wajib diisi" }),
  bio: t.Optional(t.String()),
  birthDate: t.Union([t.Date(), t.String()]),
  birthPlace: t.String({ error: "Tempat lahir wajib diisi" }),
  emergencyContact: t.String({ error: "Kontak darurat wajib diisi" }),
  gender: t.String({ error: "Jenis kelamin wajib diisi" }),
  phone: t.String({ error: "Nomor telepon wajib diisi" }),
  studentNumber: t.String({ error: "NIM/NPM wajib diisi" }),
  userId: t.String({ error: "User ID wajib diisi" }),
  majorId: t.Optional(t.String()),
  id: t.Optional(t.String()),
});

/** POST /internships/skill */
export const CreateSkillDto = t.Object({
  name: t.String({ minLength: 1, error: "Nama skill wajib diisi" }),
  category: t.String({ minLength: 1, error: "Kategori skill wajib diisi" }),
});

/** PUT /internships/skill/:id */
export const UpdateSkillDto = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  category: t.Optional(t.String({ minLength: 1 })),
});

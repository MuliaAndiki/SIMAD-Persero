import { t } from 'elysia';

/**
 * DTO (Data Transfer Object) modul Department.
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih
 * dan skema bisa dipakai ulang / diuji secara terpisah.
 * Sumber aturan: docs/07-api-specification.md §22.
 */

// GET /departments
export const DepartmentQueryDto = t.Object({
  page: t.Optional(t.Number({ minimum: 1, description: 'Halaman' })),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      description: 'Jumlah data per halaman',
    }),
  ),
  keyword: t.Optional(t.String({ description: 'Kata kunci pencarian (code/name)' })),
  status: t.Optional(t.Union([t.Literal('ACTIVE'), t.Literal('INACTIVE')])),
});

// GET /departments/:departmentId, PATCH /departments/:departmentId, DELETE /departments/:departmentId
export const DepartmentParamsDto = t.Object({
  departmentId: t.String({ description: 'ID departemen' }),
});

// POST /departments
export const CreateDepartmentDto = t.Object({
  code: t.String({
    minLength: 1,
    maxLength: 50,
    description: 'Kode departemen',
  }),
  name: t.Optional(t.String({ minLength: 1, maxLength: 150, description: 'Nama departemen' })),
  description: t.Optional(t.String({ description: 'Deskripsi departemen' })),
});

// PATCH /departments/:departmentId
export const UpdateDepartmentDto = t.Partial(
  t.Object({
    code: t.String({
      minLength: 1,
      maxLength: 50,
      description: 'Kode departemen',
    }),
    name: t.String({
      minLength: 1,
      maxLength: 150,
      description: 'Nama departemen',
    }),
    description: t.String({ description: 'Deskripsi departemen' }),
    isActive: t.Boolean({ description: 'Status aktif' }),
  }),
);

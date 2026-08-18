import { t } from "elysia";

/**
 * DTO (Data Transfer Object) modul Office (Office Location).
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih
 * dan skema bisa dipakai ulang / diuji secara terpisah.
 * Sumber aturan: docs/07-api-specification.md §23.
 */

// GET /offices
export const OfficeQueryDto = t.Object({
  page: t.Optional(t.Number({ minimum: 1, description: "Halaman" })),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      description: "Jumlah data per halaman",
    }),
  ),
  keyword: t.Optional(
    t.String({ description: "Kata kunci pencarian (name/address)" }),
  ),
  departmentId: t.Optional(
    t.String({ description: "Filter berdasarkan departemen" }),
  ),
});

// GET /offices/:officeId, PATCH /offices/:officeId, DELETE /offices/:officeId
export const OfficeParamsDto = t.Object({
  officeId: t.String({ description: "ID lokasi kantor" }),
});

// POST /offices
export const CreateOfficeDto = t.Object({
  departmentIds: t.Optional(
    t.Array(t.String({ description: "ID departemen (banyak-ke-banyak)" })),
  ),
  name: t.String({
    minLength: 1,
    maxLength: 150,
    description: "Nama lokasi kantor",
  }),
  address: t.Optional(t.String({ description: "Alamat kantor" })),
  latitude: t.Number({ description: "Garis lintang" }),
  longitude: t.Number({ description: "Garis bujur" }),
  radiusMeter: t.Number({ minimum: 1, description: "Radius geofence (meter)" }),
});

// PATCH /offices/:officeId
export const UpdateOfficeDto = t.Partial(
  t.Object({
    departmentIds: t.Array(
      t.String({ description: "ID departemen (banyak-ke-banyak)" }),
    ),
    name: t.String({
      minLength: 1,
      maxLength: 150,
      description: "Nama lokasi kantor",
    }),
    address: t.String({ description: "Alamat kantor" }),
    latitude: t.Number({ description: "Garis lintang" }),
    longitude: t.Number({ description: "Garis bujur" }),
    radiusMeter: t.Number({
      minimum: 1,
      description: "Radius geofence (meter)",
    }),
  }),
);

import { t } from "elysia";

/**
 * DTO (Data Transfer Object) modul Institution.
 * Skema validasi TypeBox dipisah dari routes agar route handler tetap bersih.
 */

// GET /institutions
export const InstitutionQueryDto = t.Object({
  page: t.Optional(t.Number({ minimum: 1, description: "Halaman" })),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      description: "Jumlah data per halaman",
    }),
  ),
  keyword: t.Optional(
    t.String({
      description: "Kata kunci pencarian (name/shortName/province/city)",
    }),
  ),
});

// GET /institutions/:institutionId
export const InstitutionParamsDto = t.Object({
  institutionId: t.String({ description: "ID institusi" }),
});

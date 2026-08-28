import { t } from 'elysia';

// GET /institutions
export const InstitutionQueryDto = t.Object({
  page: t.Optional(t.Number({ minimum: 1, description: 'Halaman' })),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      description: 'Jumlah data per halaman',
    }),
  ),
  keyword: t.Optional(t.String({ description: 'Kata kunci pencarian' })),
  educationLevelId: t.Optional(t.String({ description: 'Filter ID Tingkat Pendidikan' })),
});

// GET /institutions/:institutionId
export const InstitutionParamsDto = t.Object({
  institutionId: t.String({ description: 'ID institusi' }),
});

// POST /institutions
export const CreateInstitutionDto = t.Object({
  name: t.String({ minLength: 2, description: 'Nama universitas / sekolah' }),
  shortName: t.Optional(t.String({ description: 'Singkatan / akronim' })),
  educationLevelId: t.Optional(t.String({ description: 'ID Tingkat Pendidikan' })),
  province: t.Optional(t.String({ description: 'Provinsi' })),
  city: t.Optional(t.String({ description: 'Kota / Kabupaten' })),
  logo: t.Optional(t.String({ description: 'URL Logo Institusi' })),
});

// PUT /institutions/:institutionId
export const UpdateInstitutionDto = t.Partial(CreateInstitutionDto);

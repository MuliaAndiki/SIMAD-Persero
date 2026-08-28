import type { AppContext } from '@/contex';
import InstitutionController from '@/controllers/InstitutionController';
import {
  CreateInstitutionDto,
  InstitutionParamsDto,
  InstitutionQueryDto,
  UpdateInstitutionDto,
} from '@/dtos/institution.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Institution.
 * Base URL: /institutions
 * - GET (list/detail) : semua role terautentikasi (dipakai INTERN untuk form profil)
 * - POST / PUT / DELETE : role hr_admin
 */
class InstitutionRouter {
  public institutionRouter;

  constructor() {
    this.institutionRouter = new Elysia({ prefix: '/institutions' });
    this.routes();
  }

  private routes() {
    // GET /institutions
    this.institutionRouter.get('/', (c: AppContext) => InstitutionController.list(c), {
      query: InstitutionQueryDto,
      beforeHandle: [verifyToken().beforeHandle],
      detail: {
        summary: 'Daftar institusi',
        description:
          'Mengembalikan daftar institusi (kampus/sekolah) dengan dukungan pagination dan pencarian.',
        tags: ['Institution'],
      },
    });

    // GET /institutions/education-levels
    this.institutionRouter.get(
      '/education-levels',
      (c: AppContext) => InstitutionController.getEducationLevels(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
        detail: {
          summary: 'Daftar tingkat pendidikan',
          tags: ['Institution'],
        },
      },
    );

    // GET /institutions/:institutionId
    this.institutionRouter.get(
      '/:institutionId',
      (c: AppContext) => InstitutionController.detail(c),
      {
        params: InstitutionParamsDto,
        beforeHandle: [verifyToken().beforeHandle],
        detail: {
          summary: 'Detail institusi',
          description: 'Mengembalikan detail satu institusi berdasarkan ID.',
          tags: ['Institution'],
        },
      },
    );

    // POST /institutions (HR_ADMIN)
    this.institutionRouter.post('/', (c: AppContext) => InstitutionController.create(c), {
      body: CreateInstitutionDto,
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      detail: {
        summary: 'Tambah institusi',
        tags: ['Institution'],
      },
    });

    // PUT /institutions/:institutionId (HR_ADMIN)
    this.institutionRouter.put(
      '/:institutionId',
      (c: AppContext) => InstitutionController.update(c),
      {
        params: InstitutionParamsDto,
        body: UpdateInstitutionDto,
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        detail: {
          summary: 'Update institusi',
          tags: ['Institution'],
        },
      },
    );

    // DELETE /institutions/:institutionId (HR_ADMIN)
    this.institutionRouter.delete(
      '/:institutionId',
      (c: AppContext) => InstitutionController.delete(c),
      {
        params: InstitutionParamsDto,
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        detail: {
          summary: 'Hapus institusi',
          tags: ['Institution'],
        },
      },
    );
  }
}

export default new InstitutionRouter().institutionRouter;

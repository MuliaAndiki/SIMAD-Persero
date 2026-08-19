import type { AppContext } from '@/contex';
import InstitutionController from '@/controllers/InstitutionController';
import { InstitutionParamsDto, InstitutionQueryDto } from '@/dtos/institution.dto';
import { verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Institution.
 * Base URL: /institutions
 * - GET (list/detail) : semua role terautentikasi (dipakai INTERN untuk form profil)
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
  }
}

export default new InstitutionRouter().institutionRouter;

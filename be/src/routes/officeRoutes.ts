import type { AppContext } from '@/contex';
import OfficeController from '@/controllers/OfficeController';
import {
  CreateOfficeDto,
  OfficeParamsDto,
  OfficeQueryDto,
  UpdateOfficeDto,
} from '@/dtos/office.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Office (Office Location).
 * Base URL: /offices
 * Sumber aturan: docs/07-api-specification.md §23.
 * - GET (list/detail)      : HR_ADMIN, SUPERVISOR
 * - POST / PATCH / DELETE  : HR_ADMIN
 */
class OfficeRouter {
  public officeRouter;

  constructor() {
    this.officeRouter = new Elysia({ prefix: '/offices' });
    this.routes();
  }

  private routes() {
    // GET /offices
    this.officeRouter.get('/', (c: AppContext) => OfficeController.list(c), {
      query: OfficeQueryDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['hr_admin', 'supervisor', 'receptionist']).beforeHandle,
      ],
      detail: {
        summary: 'Daftar lokasi kantor',
        description:
          'Mengembalikan daftar lokasi kantor dengan dukungan pagination, pencarian, dan filter departemen.',
        tags: ['Office'],
      },
    });

    // GET /offices/:officeId
    this.officeRouter.get('/:officeId', (c: AppContext) => OfficeController.detail(c), {
      params: OfficeParamsDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['hr_admin', 'supervisor', 'receptionist']).beforeHandle,
      ],
      detail: {
        summary: 'Detail lokasi kantor',
        description: 'Mengembalikan detail satu lokasi kantor berdasarkan ID.',
        tags: ['Office'],
      },
    });

    // POST /offices
    this.officeRouter.post('/', (c: AppContext) => OfficeController.create(c), {
      body: CreateOfficeDto,
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      detail: {
        summary: 'Buat lokasi kantor',
        description:
          'Membuat lokasi kantor baru beserta koordinat geofence (latitude, longitude, radius).',
        tags: ['Office'],
      },
    });

    // PATCH /offices/:officeId
    this.officeRouter.patch('/:officeId', (c: AppContext) => OfficeController.update(c), {
      params: OfficeParamsDto,
      body: UpdateOfficeDto,
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      detail: {
        summary: 'Ubah lokasi kantor',
        description: 'Memperbarui data lokasi kantor berdasarkan ID.',
        tags: ['Office'],
      },
    });

    // DELETE /offices/:officeId
    this.officeRouter.delete('/:officeId', (c: AppContext) => OfficeController.remove(c), {
      params: OfficeParamsDto,
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      detail: {
        summary: 'Hapus lokasi kantor',
        description: 'Menghapus lokasi kantor berdasarkan ID.',
        tags: ['Office'],
      },
    });
  }
}

export default new OfficeRouter().officeRouter;

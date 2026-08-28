import type { AppContext } from '@/contex';
import DepartmentController from '@/controllers/DepartmentController';
import {
  CreateDepartmentDto,
  DepartmentParamsDto,
  DepartmentQueryDto,
  UpdateDepartmentDto,
} from '@/dtos/department.dto';
import { requireRole, verifyToken } from '@/middlewares/auth';
import Elysia from 'elysia';

/**
 * Routes modul Department.
 * Base URL: /departments
 * Sumber aturan: docs/07-api-specification.md §22.
 * - GET (list/detail)      : HR_ADMIN, SUPERVISOR
 * - POST / PATCH / DELETE  : HR_ADMIN
 */
class DepartmentRouter {
  public departmentRouter;

  constructor() {
    this.departmentRouter = new Elysia({ prefix: '/departments' });
    this.routes();
  }

  private routes() {
    // GET /departments
    this.departmentRouter.get('/', (c: AppContext) => DepartmentController.list(c), {
      query: DepartmentQueryDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['hr_admin', 'supervisor']).beforeHandle,
      ],
      detail: {
        summary: 'Daftar departemen',
        description:
          'Mengembalikan daftar departemen dengan dukungan pagination, pencarian, dan filter status.',
        tags: ['Department'],
      },
    });

    // GET /departments/:departmentId
    this.departmentRouter.get('/:departmentId', (c: AppContext) => DepartmentController.detail(c), {
      params: DepartmentParamsDto,
      beforeHandle: [
        verifyToken().beforeHandle,
        requireRole(['hr_admin', 'supervisor']).beforeHandle,
      ],
      detail: {
        summary: 'Detail departemen',
        description: 'Mengembalikan detail satu departemen berdasarkan ID.',
        tags: ['Department'],
      },
    });

    // POST /departments
    this.departmentRouter.post('/', (c: AppContext) => DepartmentController.create(c), {
      body: CreateDepartmentDto,
      beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
      detail: {
        summary: 'Buat departemen',
        description: 'Membuat departemen baru. Kode departemen harus unik.',
        tags: ['Department'],
      },
    });

    // PATCH /departments/:departmentId
    this.departmentRouter.patch(
      '/:departmentId',
      (c: AppContext) => DepartmentController.update(c),
      {
        params: DepartmentParamsDto,
        body: UpdateDepartmentDto,
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        detail: {
          summary: 'Ubah departemen',
          description: 'Memperbarui data departemen berdasarkan ID.',
          tags: ['Department'],
        },
      },
    );

    // DELETE /departments/:departmentId
    this.departmentRouter.delete(
      '/:departmentId',
      (c: AppContext) => DepartmentController.remove(c),
      {
        params: DepartmentParamsDto,
        beforeHandle: [verifyToken().beforeHandle, requireRole(['hr_admin']).beforeHandle],
        detail: {
          summary: 'Hapus departemen',
          description: 'Menonaktifkan departemen (soft delete via is_active = false).',
          tags: ['Department'],
        },
      },
    );
  }
}

export default new DepartmentRouter().departmentRouter;

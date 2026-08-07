import type { AppContext } from '@/contex';
import { HttpResponse, handleAppError } from '@/http';
import DepartmentService from '@/services/department.service';
import type {
  CreateDepartmentBody,
  DepartmentParams,
  DepartmentQuery,
  UpdateDepartmentBody,
} from '@/types/department.types';

/**
 * Controller modul Department — tipis.
 * Mengekstrak input dari context (body/params/query/user), memanggil
 * `DepartmentService`, lalu memetakan hasil ke respons HTTP menggunakan
 * helper resmi `HttpResponse` dari `@/http`.
 * Sumber aturan: docs/07-api-specification.md §22.
 */
class DepartmentController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /departments
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as DepartmentQuery;
      const result = await DepartmentService.list(query);
      return HttpResponse(c).ok(result.data, result.meta, 'Departments retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /departments/:departmentId
  public async detail(c: AppContext) {
    try {
      const { departmentId } = c.params as unknown as DepartmentParams;
      const data = await DepartmentService.getById(departmentId);
      return HttpResponse(c).ok(data, undefined, 'Department retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /departments
  public async create(c: AppContext) {
    try {
      const body = c.body as CreateDepartmentBody;
      const data = await DepartmentService.create(body);
      return HttpResponse(c).created(data, 'Department created successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /departments/:departmentId
  public async update(c: AppContext) {
    try {
      const { departmentId } = c.params as unknown as DepartmentParams;
      const body = c.body as UpdateDepartmentBody;
      const data = await DepartmentService.update(departmentId, body);
      return HttpResponse(c).ok(data, undefined, 'Department updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /departments/:departmentId
  public async remove(c: AppContext) {
    try {
      const { departmentId } = c.params as unknown as DepartmentParams;
      await DepartmentService.remove(departmentId);
      return HttpResponse(c).ok(undefined, undefined, 'Department deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new DepartmentController();

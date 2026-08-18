import type { AppContext } from "@/contex";
import { HttpResponse, handleAppError } from "@/http";
import supervisorService from "@/services/supervisor.service";
import type {
  AssignInternBody,
  SupervisorQuery,
  CreateSupervisorBody,
  UpdateSupervisorBody,
} from "@/types/supervisor.types";

/**
 * Thin controller modul Supervisor.
 * Seluruh logika bisnis didelegasikan ke SupervisorService.
 * Sumber aturan: docs/07-api-specification.md §24.
 */
class SupervisorController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /supervisors
  public async list(c: AppContext) {
    try {
      const query = c.query as unknown as SupervisorQuery;
      const result = await supervisorService.list(query);
      return HttpResponse(c).ok(result.data, result.meta);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /supervisors/dashboard
  public async dashboard(c: AppContext) {
    try {
      const data = await supervisorService.getDashboard(c.user!.id);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // GET /supervisors/:supervisorId
  public async detail(c: AppContext) {
    try {
      const data = await supervisorService.getById(c.params.supervisorId);
      return HttpResponse(c).ok(data);
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /supervisors/:supervisorId/assign
  public async assign(c: AppContext) {
    try {
      const body = c.body as unknown as AssignInternBody;
      const data = await supervisorService.assignIntern(
        c.params.supervisorId,
        c.user!.id,
        body,
      );
      return HttpResponse(c).created(data, "Intern berhasil ditugaskan.");
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /supervisors/:supervisorId/assignments/:assignmentId
  public async removeAssignment(c: AppContext) {
    try {
      const data = await supervisorService.removeAssignment(
        c.params.supervisorId,
        c.params.assignmentId,
        c.user!.id,
      );
      return HttpResponse(c).ok(
        data,
        undefined,
        "Penugasan supervisor berhasil dihapus.",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /supervisors
  public async createAccount(c: AppContext) {
    try {
      const body = c.body as unknown as CreateSupervisorBody;
      const data = await supervisorService.createAccount(c.user!.id, body);
      return HttpResponse(c).created(data, "Akun supervisor berhasil dibuat.");
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /supervisors/:supervisorId
  public async updateAccount(c: AppContext) {
    try {
      const body = c.body as unknown as UpdateSupervisorBody;
      const data = await supervisorService.updateAccount(
        c.user!.id,
        c.params.supervisorId,
        body,
      );
      return HttpResponse(c).ok(
        data,
        undefined,
        "Akun supervisor berhasil diperbarui.",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // DELETE /supervisors/:supervisorId
  public async deleteAccount(c: AppContext) {
    try {
      await supervisorService.deleteAccount(c.user!.id, c.params.supervisorId);
      return HttpResponse(c).ok(
        null,
        undefined,
        "Akun supervisor berhasil dihapus.",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new SupervisorController();

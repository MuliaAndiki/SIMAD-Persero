/**
 * Tipe payload & respons modul Department.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/department.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/DepartmentController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateDepartmentBody {
  code: string;
  name?: string;
  description?: string;
}

export interface UpdateDepartmentBody {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentParams {
  departmentId: string;
}

// ---------- Response (data dari backend) ----------

/** Data satu departemen (GET /departments, GET /departments/:departmentId). */
export interface DepartmentResponse {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Tipe payload & respons modul Department.
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/department.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/DepartmentController.ts).
 */

import type { IDepartment } from './model.type';

// ---------- Payload (request body / query / path params) ----------

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateDepartmentBody extends Pick<IDepartment, 'code' | 'name' | 'description'> {}

export type UpdateDepartmentBody = Partial<
  Pick<IDepartment, 'code' | 'name' | 'description' | 'isActive'>
>;

export interface DepartmentParams {
  departmentId: string;
}

// ---------- Response (data dari backend) ----------

/** Data satu departemen (GET /departments, GET /departments/:departmentId). */
export interface DepartmentResponse
  extends Pick<
    IDepartment,
    'id' | 'code' | 'name' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'
  > {}

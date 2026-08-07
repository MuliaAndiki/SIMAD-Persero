/**
 * Types modul Department.
 * Menjaga kontrak data antara controller, service, dan routes.
 * Diturunkan dari base model `IDepartment` (models.types.ts) memakai Utility Types.
 * Sumber aturan: docs/07-api-specification.md §22.
 */
import type { IDepartment } from './models.types';

export type DepartmentQuery = Partial<{
  page: number;
  limit: number;
  keyword: string;
  status: 'ACTIVE' | 'INACTIVE';
}>;

export type CreateDepartmentBody = Pick<IDepartment, 'code'> & {
  name?: string;
  description?: string;
};

export type UpdateDepartmentBody = Partial<Pick<IDepartment, 'code' | 'isActive'>> & {
  name?: string;
  description?: string;
};

export type DepartmentParams = {
  departmentId: IDepartment['id'];
};

/**
 * Types modul Office (Office Location).
 * Menjaga kontrak data antara controller, service, dan routes.
 * Diturunkan dari base model (models.types.ts) memakai Utility Types.
 * Sumber aturan: docs/07-api-specification.md §23.
 */
import type { IDepartment, IOfficeLocation } from "./models.types";

export interface AttendanceSettingInput {
  checkInStart?: string | null;
  checkInEnd?: string | null;
  checkOutStart?: string | null;
  checkOutEnd?: string | null;
  lateAfter?: string | null;
  allowWeekend?: boolean;
}

export type OfficeQuery = Partial<{
  page: number;
  limit: number;
  keyword: string;
  departmentId: IDepartment["id"];
}>;

export type CreateOfficeBody = {
  /** Banyak-ke-banyak: kantor dapat melayani beberapa departemen sekaligus. */
  departmentIds?: IDepartment["id"][];
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
  attendanceSetting?: AttendanceSettingInput;
};

export type UpdateOfficeBody = Partial<CreateOfficeBody>;

export type OfficeParams = {
  officeId: IOfficeLocation["id"];
};

/**
 * Tipe payload & respons modul Office (Office Location).
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/office.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/OfficeController.ts).
 */

import type { IOfficeLocation } from "./model.type";

// ---------- Payload (request body / query / path params) ----------

export interface OfficeQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  departmentId?: string;
}

export interface CreateOfficeBody extends Pick<
  IOfficeLocation,
  "departmentId" | "name" | "address" | "radiusMeter"
> {
  latitude: number;
  longitude: number;
}

export type UpdateOfficeBody = Partial<CreateOfficeBody>;

export interface OfficeParams {
  officeId: string;
}

// ---------- Response (data dari backend) ----------

/** Data satu lokasi kantor (GET /offices, GET /offices/:officeId). */
export interface OfficeResponse extends Omit<
  IOfficeLocation,
  "latitude" | "longitude" | "radiusMeter"
> {
  latitude: number | null;
  longitude: number | null;
  radiusMeter: number;
  isActive: boolean;
}

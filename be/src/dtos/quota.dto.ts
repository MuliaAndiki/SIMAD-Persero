import { t } from 'elysia';

export const QuotaIdParam = t.Object({
  id: t.String({ minLength: 1 }),
});

export const DepartmentAllocationItemDto = t.Object({
  departmentId: t.String({ format: 'uuid' }),
  capacity: t.Numeric({ minimum: 0 }),
  notes: t.Optional(t.String()),
});

export const CreateQuotaDto = t.Object({
  officeLocationId: t.String({ format: 'uuid' }),
  totalCapacity: t.Numeric({ minimum: 1 }),
  notes: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  allocations: t.Optional(t.Array(DepartmentAllocationItemDto)),
});

export const UpdateQuotaDto = t.Object({
  totalCapacity: t.Optional(t.Numeric({ minimum: 1 })),
  notes: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  allocations: t.Optional(t.Array(DepartmentAllocationItemDto)),
});

export const QuotaListQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  officeLocationId: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export const QuotaAvailabilityQueryDto = t.Object({
  officeLocationId: t.Optional(t.String()),
  departmentId: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
});

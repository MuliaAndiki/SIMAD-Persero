export interface DepartmentAllocationInput {
  departmentId: string;
  capacity: number;
  notes?: string;
}

export interface CreateQuotaBody {
  officeLocationId: string;
  totalCapacity: number;
  notes?: string;
  isActive?: boolean;
  allocations?: DepartmentAllocationInput[];
}

export interface UpdateQuotaBody {
  totalCapacity?: number;
  notes?: string;
  isActive?: boolean;
  allocations?: DepartmentAllocationInput[];
}

export interface QuotaQuery {
  page?: number;
  limit?: number;
  officeLocationId?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface QuotaAvailabilityQuery {
  officeLocationId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DepartmentAvailabilityInfo {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  allocatedCapacity: number;
  occupied: number;
  available: number;
}

export interface OfficeAvailabilityItem {
  officeLocationId: string;
  officeName: string;
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  isAvailable: boolean;
  departments: DepartmentAvailabilityInfo[];
}

export interface QuotaAvailabilityResult {
  officeLocationId?: string;
  officeName?: string;
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  isAvailable: boolean;
  quotaId?: string;
  departmentId?: string;
  departmentCapacity?: number;
  departmentOccupied?: number;
  departmentAvailable?: number;
  departments?: DepartmentAvailabilityInfo[];
  offices?: OfficeAvailabilityItem[];
}

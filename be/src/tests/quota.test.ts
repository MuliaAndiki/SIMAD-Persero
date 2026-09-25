import { describe, expect, it } from 'bun:test';

interface DepartmentAllocation {
  departmentId: string;
  capacity: number;
}

interface OfficeMasterQuota {
  officeLocationId: string;
  totalCapacity: number;
  allocations: DepartmentAllocation[];
}

interface ActiveInternship {
  officeLocationId: string;
  departmentId: string;
  startDate: Date;
  endDate: Date;
}

function validateDepartmentAllocations(
  totalCapacity: number,
  allocations: DepartmentAllocation[],
): { isValid: boolean; totalAllocated: number; errorMessage?: string } {
  let totalAllocated = 0;
  const seenDeptIds = new Set<string>();

  for (const a of allocations) {
    if (seenDeptIds.has(a.departmentId)) {
      return {
        isValid: false,
        totalAllocated,
        errorMessage: 'Terdapat departemen ganda dalam alokasi kuota',
      };
    }
    seenDeptIds.add(a.departmentId);
    if (a.capacity < 0) {
      return {
        isValid: false,
        totalAllocated,
        errorMessage: 'Kapasitas alokasi tidak boleh negatif',
      };
    }
    totalAllocated += a.capacity;
  }

  if (totalAllocated > totalCapacity) {
    return {
      isValid: false,
      totalAllocated,
      errorMessage: `Total alokasi departemen (${totalAllocated}) melebihi total kapasitas kantor (${totalCapacity})`,
    };
  }

  return { isValid: true, totalAllocated };
}

function calculateOfficeAndDeptAvailability(
  quota: OfficeMasterQuota,
  internships: ActiveInternship[],
  targetDeptId: string,
  targetDate: Date = new Date(),
): {
  officeTotalCapacity: number;
  officeTotalOccupied: number;
  officeAvailable: number;
  deptCapacity: number;
  deptOccupied: number;
  deptAvailable: number;
  finalAllowed: number;
} {
  // Interns currently in the office (between their startDate and endDate)
  const officeOccupied = internships.filter(
    (i) =>
      i.officeLocationId === quota.officeLocationId &&
      i.startDate <= targetDate &&
      i.endDate >= targetDate,
  ).length;

  const officeAvailable = Math.max(0, quota.totalCapacity - officeOccupied);

  // Department specific allocation
  const alloc = quota.allocations.find((a) => a.departmentId === targetDeptId);
  const deptCapacity = alloc ? alloc.capacity : 0;

  const deptOccupied = internships.filter(
    (i) =>
      i.officeLocationId === quota.officeLocationId &&
      i.departmentId === targetDeptId &&
      i.startDate <= targetDate &&
      i.endDate >= targetDate,
  ).length;

  const deptAvailable = Math.max(0, deptCapacity - deptOccupied);
  const finalAllowed = Math.min(deptAvailable, officeAvailable);

  return {
    officeTotalCapacity: quota.totalCapacity,
    officeTotalOccupied: officeOccupied,
    officeAvailable,
    deptCapacity,
    deptOccupied,
    deptAvailable,
    finalAllowed,
  };
}

describe('Office Master Quota & Embedded Department Allocations (STATIC QUOTA)', () => {
  it('should validate that department allocations sum does not exceed office total capacity', () => {
    const totalCapacity = 20;

    const validAllocations: DepartmentAllocation[] = [
      { departmentId: 'dept-it', capacity: 10 },
      { departmentId: 'dept-hr', capacity: 5 },
      { departmentId: 'dept-finance', capacity: 5 },
    ];

    const validResult = validateDepartmentAllocations(totalCapacity, validAllocations);
    expect(validResult.isValid).toBe(true);
    expect(validResult.totalAllocated).toBe(20);

    const invalidAllocations: DepartmentAllocation[] = [
      { departmentId: 'dept-it', capacity: 12 },
      { departmentId: 'dept-hr', capacity: 6 },
      { departmentId: 'dept-finance', capacity: 5 }, // Sum = 23 > 20
    ];

    const invalidResult = validateDepartmentAllocations(totalCapacity, invalidAllocations);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errorMessage).toContain('melebihi total kapasitas kantor');
  });

  it('should reject duplicate departments in quota allocations', () => {
    const allocations: DepartmentAllocation[] = [
      { departmentId: 'dept-it', capacity: 5 },
      { departmentId: 'dept-it', capacity: 5 },
    ];

    const result = validateDepartmentAllocations(20, allocations);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Terdapat departemen ganda');
  });

  it('should calculate slot availability dynamically based on intern start & end dates', () => {
    const quota: OfficeMasterQuota = {
      officeLocationId: 'office-uid-lampung',
      totalCapacity: 15,
      allocations: [
        { departmentId: 'dept-it', capacity: 8 },
        { departmentId: 'dept-sdm', capacity: 7 },
      ],
    };

    const internships: ActiveInternship[] = [
      // 2 interns in IT from Jan to June
      {
        officeLocationId: 'office-uid-lampung',
        departmentId: 'dept-it',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
      },
      {
        officeLocationId: 'office-uid-lampung',
        departmentId: 'dept-it',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
      },
      // 1 intern in SDM from Jan to June
      {
        officeLocationId: 'office-uid-lampung',
        departmentId: 'dept-sdm',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
      },
      // 1 intern in IT who already completed in March
      {
        officeLocationId: 'office-uid-lampung',
        departmentId: 'dept-it',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
      },
    ];

    // Check availability in May 2026 (the March intern has exited, 2 IT interns active)
    const checkMay = calculateOfficeAndDeptAvailability(
      quota,
      internships,
      'dept-it',
      new Date('2026-05-15'),
    );

    expect(checkMay.officeTotalCapacity).toBe(15);
    expect(checkMay.officeTotalOccupied).toBe(3); // 2 in IT + 1 in SDM
    expect(checkMay.officeAvailable).toBe(12);
    expect(checkMay.deptCapacity).toBe(8);
    expect(checkMay.deptOccupied).toBe(2);
    expect(checkMay.deptAvailable).toBe(6);
    expect(checkMay.finalAllowed).toBe(6);

    // Check availability in August 2026 (all current interns have exited!)
    const checkAugust = calculateOfficeAndDeptAvailability(
      quota,
      internships,
      'dept-it',
      new Date('2026-08-01'),
    );

    expect(checkAugust.officeTotalOccupied).toBe(0);
    expect(checkAugust.deptOccupied).toBe(0);
    expect(checkAugust.deptAvailable).toBe(8); // Full slot available again!
  });
});

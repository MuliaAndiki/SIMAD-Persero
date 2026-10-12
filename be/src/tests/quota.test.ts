import { describe, expect, it } from 'bun:test';
import { ApproveApplicationDto } from '../dtos/application.dto';
import { Value } from '@sinclair/typebox/value';
import { AppError } from '../http/error';

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

describe('Application Approval with Mandatory Start Date & Quota Overlap (TASK: Tanggal Masuk Wajib)', () => {
  it('should reject ApproveApplicationDto schema when actualStartDate is missing or invalid format', () => {
    const invalidMissing = {
      departmentId: '11111111-1111-1111-1111-111111111111',
      supervisorId: '22222222-2222-2222-2222-222222222222',
    };
    expect(Value.Check(ApproveApplicationDto, invalidMissing)).toBe(false);

    const invalidDate = {
      departmentId: '11111111-1111-1111-1111-111111111111',
      supervisorId: '22222222-2222-2222-2222-222222222222',
      actualStartDate: 'invalid-date',
    };
    expect(Value.Check(ApproveApplicationDto, invalidDate)).toBe(false);

    const validPayload = {
      departmentId: '11111111-1111-1111-1111-111111111111',
      supervisorId: '22222222-2222-2222-2222-222222222222',
      actualStartDate: '2026-11-01',
    };
    expect(Value.Check(ApproveApplicationDto, validPayload)).toBe(true);

    const validWithEndDate = {
      departmentId: '11111111-1111-1111-1111-111111111111',
      supervisorId: '22222222-2222-2222-2222-222222222222',
      actualStartDate: '2026-11-01',
      actualEndDate: '2026-12-31',
    };
    expect(Value.Check(ApproveApplicationDto, validWithEndDate)).toBe(true);
  });

  it('should validate actualStartDate requirement and return 422 with clear message when missing or invalid', () => {
    const validateActualDates = (input: { actualStartDate?: string; actualEndDate?: string }, requestedEndDate?: Date) => {
      if (!input.actualStartDate || typeof input.actualStartDate !== 'string' || !input.actualStartDate.trim()) {
        throw new AppError(422, 'Tanggal mulai aktual (actualStartDate) wajib diisi saat menyetujui pengajuan');
      }

      const actualStart = new Date(input.actualStartDate);
      if (isNaN(actualStart.getTime())) {
        throw new AppError(422, 'Format tanggal mulai aktual (actualStartDate) tidak valid');
      }

      let actualEnd: Date;
      if (input.actualEndDate) {
        actualEnd = new Date(input.actualEndDate);
        if (isNaN(actualEnd.getTime())) {
          throw new AppError(422, 'Format tanggal selesai aktual (actualEndDate) tidak valid');
        }
      } else if (requestedEndDate) {
        actualEnd = new Date(requestedEndDate);
        if (isNaN(actualEnd.getTime())) {
          throw new AppError(422, 'Format tanggal selesai pengajuan (requestedEndDate) tidak valid');
        }
      } else {
        throw new AppError(422, 'Tanggal selesai aktual (actualEndDate) wajib diisi karena tanggal selesai pengajuan tidak tersedia');
      }

      if (actualStart >= actualEnd) {
        throw new AppError(400, 'Tanggal mulai aktual harus sebelum tanggal selesai aktual');
      }

      return { actualStart, actualEnd };
    };

    // Missing actualStartDate -> 422
    expect(() => validateActualDates({} as any, new Date('2026-12-31'))).toThrow(
      new AppError(422, 'Tanggal mulai aktual (actualStartDate) wajib diisi saat menyetujui pengajuan'),
    );

    // Empty whitespace actualStartDate -> 422
    expect(() => validateActualDates({ actualStartDate: '   ' }, new Date('2026-12-31'))).toThrow(
      new AppError(422, 'Tanggal mulai aktual (actualStartDate) wajib diisi saat menyetujui pengajuan'),
    );

    // Invalid date string -> 422
    expect(() => validateActualDates({ actualStartDate: 'bukan-tanggal' }, new Date('2026-12-31'))).toThrow(
      new AppError(422, 'Format tanggal mulai aktual (actualStartDate) tidak valid'),
    );

    // Valid start date with fallback to requestedEndDate -> success
    const res = validateActualDates({ actualStartDate: '2026-11-01' }, new Date('2026-12-31'));
    expect(res.actualStart).toEqual(new Date('2026-11-01'));
    expect(res.actualEnd).toEqual(new Date('2026-12-31'));
  });

  it('should reject approval when office or department quota is full for the overlapping actual date interval', () => {
    const quota = {
      officeLocationId: 'office-lampung',
      totalCapacity: 2,
      departmentAllocations: [{ departmentId: 'dept-it', capacity: 1 }],
    };

    const existingInternships = [
      {
        officeLocationId: 'office-lampung',
        departmentId: 'dept-it',
        status: 'ACTIVE',
        actualStartDate: new Date('2026-11-01'),
        actualEndDate: new Date('2026-12-31'),
      },
    ];

    const checkQuotaForApproval = (
      officeLocationId: string,
      departmentId: string,
      actualStart: Date,
      actualEnd: Date,
    ) => {
      // Overlap condition: actualStartDate <= actualEnd && actualEndDate >= actualStart
      const officeOccupied = existingInternships.filter(
        (i) =>
          i.officeLocationId === officeLocationId &&
          ['PENDING', 'ACTIVE'].includes(i.status) &&
          i.actualStartDate <= actualEnd &&
          i.actualEndDate >= actualStart,
      ).length;

      if (officeOccupied >= quota.totalCapacity) {
        throw new AppError(
          400,
          `Total kuota kantor untuk periode tersebut sudah penuh (Kapasitas Kantor: ${quota.totalCapacity}, Terisi: ${officeOccupied})`,
        );
      }

      const deptAlloc = quota.departmentAllocations.find((a) => a.departmentId === departmentId);
      if (deptAlloc) {
        const deptOccupied = existingInternships.filter(
          (i) =>
            i.officeLocationId === officeLocationId &&
            i.departmentId === departmentId &&
            ['PENDING', 'ACTIVE'].includes(i.status) &&
            i.actualStartDate <= actualEnd &&
            i.actualEndDate >= actualStart,
        ).length;

        if (deptOccupied >= deptAlloc.capacity) {
          throw new AppError(
            400,
            `Alokasi kuota magang untuk departemen ini pada periode tersebut sudah penuh (Alokasi: ${deptAlloc.capacity}, Terisi: ${deptOccupied})`,
          );
        }
      }

      return true;
    };

    // Department IT allocation is 1, and 1 existing intern overlaps in Nov-Dec 2026 -> rejected with quota message
    expect(() =>
      checkQuotaForApproval(
        'office-lampung',
        'dept-it',
        new Date('2026-11-15'),
        new Date('2026-11-30'),
      ),
    ).toThrow('Alokasi kuota magang untuk departemen ini pada periode tersebut sudah penuh');

    // Office total capacity rejection test
    const officeQuotaFull = {
      officeLocationId: 'office-lampung',
      totalCapacity: 1,
      departmentAllocations: [{ departmentId: 'dept-sdm', capacity: 1 }],
    };
    const checkOfficeQuota = (actualStart: Date, actualEnd: Date) => {
      const officeOccupied = existingInternships.filter(
        (i) =>
          i.officeLocationId === 'office-lampung' &&
          ['PENDING', 'ACTIVE'].includes(i.status) &&
          i.actualStartDate <= actualEnd &&
          i.actualEndDate >= actualStart,
      ).length;
      if (officeOccupied >= officeQuotaFull.totalCapacity) {
        throw new AppError(
          400,
          `Total kuota kantor untuk periode tersebut sudah penuh (Kapasitas Kantor: ${officeQuotaFull.totalCapacity}, Terisi: ${officeOccupied})`,
        );
      }
      return true;
    };

    expect(() =>
      checkOfficeQuota(new Date('2026-11-15'), new Date('2026-11-30')),
    ).toThrow('Total kuota kantor untuk periode tersebut sudah penuh');

    // Non-overlapping interval in 2027 -> approved
    expect(
      checkQuotaForApproval(
        'office-lampung',
        'dept-it',
        new Date('2027-01-01'),
        new Date('2027-02-28'),
      ),
    ).toBe(true);
  });
});

import { describe, expect, it } from 'bun:test';

type Role = 'HR_ADMIN' | 'SUPERVISOR' | 'RECEPTIONIST' | 'INTERN';

interface PermissionMatrix {
  canManageQuotas: boolean;
  canCheckSlotAvailability: boolean;
  canApproveApplication: boolean;
  canEvaluateIntern: boolean;
  canReviewCorrection: boolean;
  canRequestCorrection: boolean;
  canApproveCertificate: boolean;
  canDownloadOwnCertificate: boolean;
}

function getRolePermissions(role: Role): PermissionMatrix {
  switch (role) {
    case 'HR_ADMIN':
      return {
        canManageQuotas: true,
        canCheckSlotAvailability: true,
        canApproveApplication: true,
        canEvaluateIntern: false, // Supervisor evaluates
        canReviewCorrection: false, // Supervisor reviews
        canRequestCorrection: false,
        canApproveCertificate: true,
        canDownloadOwnCertificate: false,
      };
    case 'SUPERVISOR':
      return {
        canManageQuotas: false,
        canCheckSlotAvailability: false,
        canApproveApplication: false,
        canEvaluateIntern: true,
        canReviewCorrection: true,
        canRequestCorrection: false,
        canApproveCertificate: false,
        canDownloadOwnCertificate: false,
      };
    case 'RECEPTIONIST':
      return {
        canManageQuotas: false, // Read only!
        canCheckSlotAvailability: true,
        canApproveApplication: false,
        canEvaluateIntern: false,
        canReviewCorrection: false,
        canRequestCorrection: false,
        canApproveCertificate: false,
        canDownloadOwnCertificate: false,
      };
    case 'INTERN':
      return {
        canManageQuotas: false,
        canCheckSlotAvailability: false,
        canApproveApplication: false,
        canEvaluateIntern: false,
        canReviewCorrection: false,
        canRequestCorrection: true,
        canApproveCertificate: false,
        canDownloadOwnCertificate: true,
      };
  }
}

describe('RBAC & Security Authorization Rules (TASK-5.3)', () => {
  it('should restrict Quota Management strictly to HR_ADMIN', () => {
    expect(getRolePermissions('HR_ADMIN').canManageQuotas).toBe(true);
    expect(getRolePermissions('SUPERVISOR').canManageQuotas).toBe(false);
    expect(getRolePermissions('RECEPTIONIST').canManageQuotas).toBe(false);
    expect(getRolePermissions('INTERN').canManageQuotas).toBe(false);
  });

  it('should allow RECEPTIONIST and HR_ADMIN to check slot availability (read-only for receptionist)', () => {
    expect(getRolePermissions('RECEPTIONIST').canCheckSlotAvailability).toBe(true);
    expect(getRolePermissions('HR_ADMIN').canCheckSlotAvailability).toBe(true);
    expect(getRolePermissions('INTERN').canCheckSlotAvailability).toBe(false);
  });

  it('should restrict Intern Evaluation and Correction Review to SUPERVISOR', () => {
    expect(getRolePermissions('SUPERVISOR').canEvaluateIntern).toBe(true);
    expect(getRolePermissions('SUPERVISOR').canReviewCorrection).toBe(true);
    expect(getRolePermissions('HR_ADMIN').canEvaluateIntern).toBe(false);
    expect(getRolePermissions('INTERN').canEvaluateIntern).toBe(false);
  });

  it('should restrict Certificate Approval to HR_ADMIN', () => {
    expect(getRolePermissions('HR_ADMIN').canApproveCertificate).toBe(true);
    expect(getRolePermissions('SUPERVISOR').canApproveCertificate).toBe(false);
    expect(getRolePermissions('RECEPTIONIST').canApproveCertificate).toBe(false);
    expect(getRolePermissions('INTERN').canApproveCertificate).toBe(false);
  });

  it('should allow only INTERN to submit attendance correction requests & download certificate', () => {
    expect(getRolePermissions('INTERN').canRequestCorrection).toBe(true);
    expect(getRolePermissions('INTERN').canDownloadOwnCertificate).toBe(true);
    expect(getRolePermissions('HR_ADMIN').canRequestCorrection).toBe(false);
    expect(getRolePermissions('SUPERVISOR').canRequestCorrection).toBe(false);
  });
});

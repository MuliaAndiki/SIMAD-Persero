/**
 * BASE MODEL TYPES — pemetaan 1:1 dari skema Prisma (be/prisma/schema.prisma).
 *
 * Di-copy/diderive dari be/src/types/models.types.ts untuk menjadi sumber
 * kebenaran di frontend (single source of truth).
 * Tipe response pada frontend akan diturunkan dari sini memakai
 * TypeScript Utility Types (Pick, Omit, Partial, Dll.)
 */

/** Tipe Decimal dari database dikonversi ke string | number di JSON. */
type Decimal = string | number;

/** Tipe Json dari database dikonversi ke any di JSON. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

// ── Auth & Access ────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  avatarFileId: string;
  emailVerified: boolean;
  emailVerifiedAt: string;
  lastLoginAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  departmentId: string | null;
  officeId: string | null;
}

export interface IRole {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedById: string;
}

export interface IPermission {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface IRolePermission {
  roleId: string;
  permissionId: string;
}

export interface IRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  revokedAt: string;
  createdAt: string;
}

// ── Master Data ──────────────────────────────────────────────────────────

export interface IEducationLevel {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface IInstitution {
  id: string;
  educationLevelId: string;
  name: string;
  shortName: string;
  province: string;
  city: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInstitutionMajor {
  id: string;
  institutionId: string;
  name: string;
  createdAt: string;
}

export interface ISkill {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}

export interface IDepartment {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOfficeLocation {
  id: string;
  name: string;
  address: string;
  latitude: Decimal;
  longitude: Decimal;
  radiusMeter: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceSetting {
  id: string;
  officeLocationId: string;
  checkInStart: string;
  checkInEnd: string;
  checkOutStart: string;
  checkOutEnd: string;
  lateAfter: string;
  allowWeekend: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICertificateTemplate {
  id: string;
  name: string;
  templateFileId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Internship ───────────────────────────────────────────────────────────

export interface IInternProfile {
  id: string;
  userId: string;
  studentNumber: string;
  institutionId: string;
  majorId: string;
  phone: string;
  emergencyContact: string;
  address: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IInternProfileSkill {
  internProfileId: string;
  skillId: string;
  proficiency: string;
  createdAt: string;
  skill?: ISkill;
}

export interface IInternshipApplication {
  id: string;
  internProfileId: string;
  applicationNumber: string;
  introductionLetterFileId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  motivation: string;
  status: string;
  reviewedById: string;
  reviewedAt: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInternship {
  id: string;
  applicationId: string;
  internProfileId: string;
  departmentId: string;
  officeLocationId: string;
  actualStartDate: string;
  actualEndDate: string;
  status: string;
  onboardingCompleted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISupervisorAssignment {
  id: string;
  internshipId: string;
  supervisorId: string;
  assignedById: string;
  assignedAt: string;
  endedAt: string;
  isActive: boolean;
}

export interface IOnboardingHistory {
  id: string;
  internshipId: string;
  accepted: boolean;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface IInternshipStatusHistory {
  id: string;
  internshipId: string;
  oldStatus: string;
  newStatus: string;
  changedById: string;
  notes: string;
  createdAt: string;
}

// ── Attendance ───────────────────────────────────────────────────────────

export interface IAttendance {
  id: string;
  internshipId: string;
  attendanceDate: string;
  checkInAt: string;
  checkOutAt: string;
  checkInStatus: string;
  checkOutStatus: string;
  attendanceStatus: string;
  totalWorkMinutes: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceLog {
  id: string;
  attendanceId: string;
  action: string;
  latitude: Decimal;
  longitude: Decimal;
  accuracyMeter: Decimal;
  distanceMeter: Decimal;
  insideGeofence: boolean;
  deviceName: string;
  platform: string;
  browser: string;
  ipAddress: string;
  userAgent: string;
  fakeGpsDetected: boolean;
  photoFileId: string;
  createdAt: string;
}

export interface IAttendanceOverride {
  id: string;
  attendanceId: string;
  supervisorId: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  createdAt: string;
}

export interface IAttendanceDevice {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  platform: string;
  fingerprint: string;
  firstLoginAt: string;
  lastLoginAt: string;
  isTrusted: boolean;
  createdAt: string;
}

export interface IAttendanceViolation {
  id: string;
  attendanceId: string;
  violationType: string;
  severity: string;
  description: string;
  resolved: boolean;
  resolvedById: string;
  resolvedAt: string;
  createdAt: string;
}

export interface IAttendanceReminder {
  id: string;
  internshipId: string;
  reminderType: string;
  scheduledAt: string;
  sentAt: string;
  status: string;
  createdAt: string;
}

// ── File & Certificate ───────────────────────────────────────────────────

export interface IFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  size: number | string; // as biginit from db
  storageProvider: string;
  publicId: string;
  url: string;
  uploadedById: string;
  createdAt: string;
  deletedAt: string;
}

export interface ICertificate {
  id: string;
  internshipId: string;
  templateId: string;
  certificateNumber: string;
  fileId: string;
  generatedById: string;
  generatedAt: string;
  verificationToken: string;
  createdAt: string;
}

// ── Notification ─────────────────────────────────────────────────────────

export interface INotificationType {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface INotification {
  id: string;
  typeId: string;
  title: string;
  message: string;
  isBroadcast: boolean;
  senderId: string;
  createdAt: string;
}

export interface INotificationRead {
  notificationId: string;
  userId: string;
  readAt: string;
}

// ── Logging ──────────────────────────────────────────────────────────────

export interface IAuditLog {
  id: string;
  userId: string;
  module: string;
  action: string;
  tableName: string;
  recordId: string;
  oldData: Json;
  newData: Json;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface IActivityLog {
  id: string;
  userId: string;
  activity: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

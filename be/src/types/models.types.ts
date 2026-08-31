/**
 * BASE MODEL TYPES — pemetaan 1:1 dari skema Prisma (be/prisma/schema.prisma).
 *
 * Setiap interface `I<Model>` merepresentasikan kolom (scalar fields) dari tabel
 * terkait dan menjadi sumber kebenaran (source of truth) untuk seluruh tipe API.
 * Tipe request/response pada modul lain diturunkan dari sini memakai
 * TypeScript Utility Types (Pick, Omit, Partial, Required, Extract, dsb.)
 * agar tidak tumpang tindih dan selalu selaras dengan skema database.
 *
 * Catatan:
 * - Kolom `Decimal` dipetakan ke `Prisma.Decimal` (runtime: decimal.js).
 * - Kolom `Json` dipetakan ke `Prisma.JsonValue`.
 * - Kolom `BigInt` dipetakan ke `bigint`.
 * - Relasi antar tabel TIDAK disertakan (fokus: kontrak scalar field per tabel).
 */
import type { Prisma } from '@prisma/client';

/** Tipe Prisma untuk kolom Decimal. */
type Decimal = Prisma.Decimal;

/** Tipe Prisma untuk kolom Json. */
type Json = Prisma.JsonValue;

// ── Auth & Access ────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string | null;
  avatarFileId: string | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  departmentId: string | null;
  officeId: string | null;
}

export interface IRole {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IUserRole {
  userId: string;
  roleId: string;
  assignedAt: Date | null;
  assignedById: string | null;
}

export interface IPermission {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  createdAt: Date | null;
}

export interface IRolePermission {
  roleId: string;
  permissionId: string;
}

export interface IRefreshToken {
  id: string;
  userId: string | null;
  token: string | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date | null;
}

// ── Master Data ──────────────────────────────────────────────────────────

export interface IEducationLevel {
  id: string;
  code: string | null;
  name: string | null;
  createdAt: Date | null;
}

export interface IInstitution {
  id: string;
  educationLevelId: string | null;
  name: string | null;
  shortName: string | null;
  province: string | null;
  city: string | null;
  logo: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IInstitutionMajor {
  id: string;
  institutionId: string | null;
  name: string | null;
  createdAt: Date | null;
}

export interface ISkill {
  id: string;
  name: string | null;
  category: string | null;
  createdAt: Date | null;
}

export interface IDepartment {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IOfficeLocation {
  id: string;
  name: string | null;
  address: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  radiusMeter: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IAttendanceSetting {
  id: string;
  officeLocationId: string | null;
  checkInStart: Date | null;
  checkInEnd: Date | null;
  checkOutStart: Date | null;
  checkOutEnd: Date | null;
  lateAfter: Date | null;
  allowWeekend: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ICertificateTemplate {
  id: string;
  name: string | null;
  templateFileId: string | null;
  isDefault: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ── Internship ───────────────────────────────────────────────────────────

export interface IInternProfile {
  id: string;
  userId: string;
  studentNumber: string;
  institutionId: string;
  majorId: string;
  phone: string;
  emergencyContact: string | null;
  address: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  gender: string | null;
  bio: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  departmentId: string | null;
}

export interface IInternProfileSkill {
  internProfileId: string;
  skillId: string;
  proficiency: string | null;
  createdAt: Date | null;
}

export interface IInternshipApplication {
  id: string;
  internProfileId: string;
  applicationNumber: string | null;
  introductionLetterFileId: string;
  requestedStartDate: Date | null;
  requestedEndDate: Date | null;
  motivation: string | null;
  status: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IInternship {
  id: string;
  applicationId: string | null;
  internProfileId: string | null;
  departmentId: string | null;
  officeLocationId: string | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  status: string | null;
  onboardingCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ISupervisorAssignment {
  id: string;
  internshipId: string | null;
  supervisorId: string | null;
  assignedById: string | null;
  assignedAt: Date | null;
  endedAt: Date | null;
  isActive: boolean;
}

export interface IOnboardingHistory {
  id: string;
  internshipId: string | null;
  accepted: boolean | null;
  acceptedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface IInternshipStatusHistory {
  id: string;
  internshipId: string | null;
  oldStatus: string | null;
  newStatus: string | null;
  changedById: string | null;
  notes: string | null;
  createdAt: Date | null;
}

// ── Attendance ───────────────────────────────────────────────────────────

export interface IAttendance {
  id: string;
  internshipId: string;
  attendanceDate: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInStatus: string | null;
  checkOutStatus: string | null;
  attendanceStatus: string | null;
  totalWorkMinutes: number | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IAttendanceLog {
  id: string;
  attendanceId: string;
  action: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  accuracyMeter: Decimal | null;
  distanceMeter: Decimal | null;
  insideGeofence: boolean | null;
  deviceName: string | null;
  platform: string | null;
  browser: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  fakeGpsDetected: boolean;
  photoFileId: string | null;
  createdAt: Date | null;
}

export interface IAttendanceOverride {
  id: string;
  attendanceId: string;
  supervisorId: string;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string | null;
  createdAt: Date | null;
}

export interface IAttendanceDevice {
  id: string;
  userId: string;
  deviceName: string | null;
  browser: string | null;
  platform: string | null;
  fingerprint: string | null;
  firstLoginAt: Date | null;
  lastLoginAt: Date | null;
  isTrusted: boolean;
  createdAt: Date | null;
}

export interface IAttendanceViolation {
  id: string;
  attendanceId: string;
  violationType: string | null;
  severity: string | null;
  description: string | null;
  resolved: boolean;
  resolvedById: string | null;
  resolvedAt: Date | null;
  createdAt: Date | null;
}

export interface IAttendanceReminder {
  id: string;
  internshipId: string;
  reminderType: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  status: string | null;
  createdAt: Date | null;
}

// ── File & Certificate ───────────────────────────────────────────────────

export interface IFile {
  id: string;
  originalName: string | null;
  fileName: string | null;
  mimeType: string | null;
  extension: string | null;
  size: bigint | null;
  storageProvider: string | null;
  publicId: string | null;
  url: string | null;
  uploadedById: string | null;
  createdAt: Date | null;
  deletedAt: Date | null;
}

export interface ICertificate {
  id: string;
  internshipId: string | null;
  templateId: string | null;
  certificateNumber: string | null;
  fileId: string | null;
  generatedById: string | null;
  generatedAt: Date | null;
  verificationToken: string | null;
  createdAt: Date | null;
}

// ── Notification ─────────────────────────────────────────────────────────

export interface INotificationType {
  id: string;
  code: string;
  name: string | null;
  createdAt: Date | null;
}

export interface INotification {
  id: string;
  typeId: string | null;
  title: string | null;
  message: string | null;
  isBroadcast: boolean;
  senderId: string | null;
  createdAt: Date | null;
}

export interface INotificationRead {
  notificationId: string;
  userId: string;
  readAt: Date | null;
}

// ── Logging ──────────────────────────────────────────────────────────────

export interface IAuditLog {
  id: string;
  userId: string | null;
  module: string | null;
  action: string | null;
  tableName: string | null;
  recordId: string | null;
  oldData: Json | null;
  newData: Json | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | null;
}

export interface IActivityLog {
  id: string;
  userId: string | null;
  activity: string | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: Date | null;
}

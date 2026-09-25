/**
 * SIMAD — Database Seed (Cross-Cutting §4: Seed Data)
 * ---------------------------------------------------------------
 * Mengisi data master wajib sebelum aplikasi berjalan:
 *   - Role (INTERN, HR_ADMIN, SUPERVISOR, RECEPTIONIST)
 *   - Permission + RolePermission
 *   - EducationLevel, Institution, InstitutionMajor
 *   - Skill
 *   - NotificationType
 *   - CertificateTemplate
 *   - Department + OfficeLocation + AttendanceSetting
 *   - User admin (HR_ADMIN) — email/password dari env (fallback bawaan)
 *
 * Idempotent: aman dijalankan berulang (upsert / findFirst + create).
 * Memakai PrismaClient mentah (bukan `be/prisma/client`) agar tidak
 * terikat validasi env ketat dari `src/config/env.config.ts`.
 *
 * Jalankan: `bun run prisma:seed` (dari direktori be/).
 * Referensi: docs/08-implementation-plan-missing-modules.md §4,
 *            docs/03. erd.sql, docs/07-api-specification.md §33.
 */
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helper idempoten ─────────────────────────────────────────────
async function findOrCreate<T extends { id: string }>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
): Promise<T> {
  const existing = await find();
  if (existing) {
    return existing;
  }
  return create();
}

// ─── 1. Roles ─────────────────────────────────────────────────────
const ROLES = [
  {
    code: "intern",
    name: "Intern",
    description:
      "Mahasiswa magang yang mengajukan lamaran dan melakukan aktivitas harian.",
  },
  {
    code: "hr_admin",
    name: "HR Admin",
    description:
      "Admin HR yang menyetujui lamaran, mengelola internship, dan master data.",
  },
  {
    code: "supervisor",
    name: "Supervisor",
    description:
      "Pembimbing lapangan yang memantau kehadiran dan menilai intern.",
  },
  {
    code: "receptionist",
    name: "Receptionist",
    description:
      "Petugas resepsionis yang dapat melihat kehadiran harian intern.",
  },
] as const;

// ─── 2. Permissions ───────────────────────────────────────────────
const PERMISSIONS = [
  {
    code: "APPLICATION_CREATE",
    name: "Buat Lamaran",
    description: "Membuat lamaran magang.",
  },
  {
    code: "APPLICATION_VIEW",
    name: "Lihat Lamaran",
    description: "Melihat data lamaran magang.",
  },
  {
    code: "APPLICATION_APPROVE",
    name: "Setujui Lamaran",
    description: "Menyetujui lamaran magang.",
  },
  {
    code: "APPLICATION_REJECT",
    name: "Tolak Lamaran",
    description: "Menolak lamaran magang.",
  },
  {
    code: "ATTENDANCE_CHECK_IN",
    name: "Check-in",
    description: "Melakukan absen masuk.",
  },
  {
    code: "ATTENDANCE_CHECK_OUT",
    name: "Check-out",
    description: "Melakukan absen keluar.",
  },
  {
    code: "ATTENDANCE_VIEW",
    name: "Lihat Kehadiran",
    description: "Melihat data kehadiran.",
  },
  {
    code: "ATTENDANCE_OVERRIDE",
    name: "Override Kehadiran",
    description: "Mengubah status kehadiran.",
  },
  {
    code: "ATTENDANCE_EXPORT",
    name: "Ekspor Kehadiran",
    description: "Mengekspor laporan kehadiran.",
  },
  {
    code: "INTERNSHIP_VIEW",
    name: "Lihat Internship",
    description: "Melihat data internship.",
  },
  {
    code: "INTERNSHIP_MANAGE",
    name: "Kelola Internship",
    description: "Mengelola lifecycle internship.",
  },
  {
    code: "SUPERVISOR_VIEW",
    name: "Lihat Supervisor",
    description: "Melihat data supervisor.",
  },
  {
    code: "SUPERVISOR_ASSIGN",
    name: "Assign Supervisor",
    description: "Menugaskan supervisor ke intern.",
  },
  {
    code: "DEPARTMENT_MANAGE",
    name: "Kelola Departemen",
    description: "CRUD master departemen.",
  },
  {
    code: "OFFICE_MANAGE",
    name: "Kelola Kantor",
    description: "CRUD master lokasi kantor.",
  },
  {
    code: "CERTIFICATE_VIEW",
    name: "Lihat Sertifikat",
    description: "Melihat data sertifikat.",
  },
  {
    code: "CERTIFICATE_GENERATE",
    name: "Generate Sertifikat",
    description: "Menerbitkan sertifikat.",
  },
  {
    code: "CERTIFICATE_REGENERATE",
    name: "Regenerate Sertifikat",
    description: "Menerbitkan ulang sertifikat.",
  },
  {
    code: "NOTIFICATION_SEND",
    name: "Kirim Notifikasi",
    description: "Mengirim notifikasi ke pengguna.",
  },
  {
    code: "REPORT_VIEW",
    name: "Lihat Laporan",
    description: "Mengakses modul reporting.",
  },
  {
    code: "AUDIT_LOG_VIEW",
    name: "Lihat Audit Log",
    description: "Mengakses modul audit log.",
  },
  {
    code: "USER_MANAGE",
    name: "Kelola Pengguna",
    description: "Mengelola data pengguna.",
  },
  {
    code: "DASHBOARD_VIEW",
    name: "Lihat Dashboard",
    description: "Mengakses dashboard.",
  },
  {
    code: "FILE_UPLOAD",
    name: "Upload File",
    description: "Mengunggah berkas.",
  },
  {
    code: "QUOTA_MANAGE",
    name: "Kelola Kuota",
    description: "CRUD alokasi kuota magang.",
  },
  {
    code: "QUOTA_VIEW",
    name: "Lihat Kuota",
    description: "Melihat data ketersediaan kuota magang.",
  },
  {
    code: "CORRECTION_SUBMIT",
    name: "Ajukan Koreksi Absen",
    description: "Mengajukan permohonan koreksi absensi.",
  },
  {
    code: "CORRECTION_REVIEW",
    name: "Review Koreksi Absen",
    description: "Menyetujui atau menolak koreksi absensi.",
  },
  {
    code: "EVALUATION_SUBMIT",
    name: "Beri Nilai Magang",
    description: "Memberikan evaluasi dan penilaian magang.",
  },
  {
    code: "EVALUATION_VIEW",
    name: "Lihat Nilai Magang",
    description: "Melihat evaluasi dan nilai magang peserta.",
  },
  {
    code: "CERTIFICATE_APPROVE",
    name: "Approve Sertifikat",
    description: "Menyetujui penerbitan sertifikat magang.",
  },
  {
    code: "GUIDE_MANAGE",
    name: "Kelola Panduan",
    description: "Mengelola materi panduan dan video tutorial.",
  },
] as const;

// Role → permission codes
const ROLE_PERMISSIONS: Record<string, string[]> = {
  intern: [
    "APPLICATION_CREATE",
    "APPLICATION_VIEW",
    "ATTENDANCE_CHECK_IN",
    "ATTENDANCE_CHECK_OUT",
    "ATTENDANCE_VIEW",
    "CORRECTION_SUBMIT",
    "INTERNSHIP_VIEW",
    "EVALUATION_VIEW",
    "CERTIFICATE_VIEW",
    "DASHBOARD_VIEW",
    "FILE_UPLOAD",
  ],
  hr_admin: PERMISSIONS.map((p) => p.code),
  supervisor: [
    "APPLICATION_VIEW",
    "ATTENDANCE_VIEW",
    "ATTENDANCE_OVERRIDE",
    "CORRECTION_REVIEW",
    "INTERNSHIP_VIEW",
    "SUPERVISOR_VIEW",
    "SUPERVISOR_ASSIGN",
    "EVALUATION_SUBMIT",
    "EVALUATION_VIEW",
    "QUOTA_VIEW",
    "DEPARTMENT_MANAGE",
    "OFFICE_MANAGE",
    "CERTIFICATE_VIEW",
    "DASHBOARD_VIEW",
  ],
  receptionist: [
    "APPLICATION_VIEW",
    "ATTENDANCE_VIEW",
    "INTERNSHIP_VIEW",
    "QUOTA_VIEW",
    "DASHBOARD_VIEW",
  ],
};

// ─── 3. Master data lain ──────────────────────────────────────────
const EDUCATION_LEVELS = [
  { code: "SMA", name: "Sekolah Menengah Atas" },
  { code: "SMK", name: "Sekolah Menengah Kejuruan" },
  { code: "UNIVERSITAS", name: "Universitas" },
] as const;

// { name, shortName, province, city, educationCode, majors[] }
const INSTITUTIONS = [
  // UNIVERSITAS
  {
    name: "Universitas Syiah Kuala",
    shortName: "USK",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "UNIVERSITAS",
    majors: [],
  },
  {
    name: "Universitas Islam Negeri Ar-Raniry",
    shortName: "UIN Ar-Raniry",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "UNIVERSITAS",
    majors: [],
  },

  // Madrasah Aliyah Negeri
  {
    name: "MA Negeri 2 Banda Aceh",
    shortName: "MAN 2 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "MA Negeri Model",
    shortName: "MAN Model",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "MA Negeri Rukoh Banda Aceh",
    shortName: "MAN Rukoh Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },

  // Madrasah Aliyah Swasta
  {
    name: "MA Swasta Babun Najah Banda Aceh",
    shortName: "MAS Babun Najah Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "MA Swasta Darul 'Ulum Banda Aceh",
    shortName: "MAS Darul 'Ulum Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "MA Swasta Darussyari'ah Banda Aceh",
    shortName: "MAS Darussyari'ah Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "MA Swasta Ulumul Qur'an Banda Aceh",
    shortName: "MAS Ulumul Qur'an Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },

  // SMA Negeri
  {
    name: "SMA Negeri 1 Banda Aceh",
    shortName: "SMAN 1 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 2 Banda Aceh",
    shortName: "SMAN 2 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 3 Banda Aceh",
    shortName: "SMAN 3 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 4 Banda Aceh",
    shortName: "SMAN 4 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 5 Banda Aceh",
    shortName: "SMAN 5 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 6 Banda Aceh",
    shortName: "SMAN 6 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 7 Banda Aceh",
    shortName: "SMAN 7 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 8 Banda Aceh",
    shortName: "SMAN 8 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 9 Banda Aceh",
    shortName: "SMAN 9 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 10 Fajar Harapan",
    shortName: "SMAN 10 Fajar Harapan",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 11 Banda Aceh",
    shortName: "SMAN 11 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 12 Banda Aceh",
    shortName: "SMAN 12 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 13 Banda Aceh",
    shortName: "SMAN 13 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 14 Banda Aceh",
    shortName: "SMAN 14 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMA Negeri 15 Adidarma Banda Aceh",
    shortName: "SMAN 15 Adidarma Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAN 16 Banda Aceh",
    shortName: "SMAN 16 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },

  // SMA Swasta
  {
    name: "SMAS Al-Mishbah",
    shortName: "SMAS Al-Mishbah",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Cut Mutia Banda Aceh",
    shortName: "SMAS Cut Mutia Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Fatih Bilingual School",
    shortName: "SMAS Fatih Bilingual School",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Granada PGRI Banda Aceh",
    shortName: "SMAS Granada PGRI Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Inshafuddin",
    shortName: "SMAS Inshafuddin",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Kartika XIV Banda Aceh",
    shortName: "SMAS Kartika XIV Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Katolik",
    shortName: "SMAS Katolik",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Laboratorium Unsyiah",
    shortName: "SMAS Laboratorium Unsyiah",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Methodist",
    shortName: "SMAS Methodist",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Muhammadiyah 1 Banda Aceh",
    shortName: "SMAS Muhammadiyah 1 Banda Aceh",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Safiafuddin",
    shortName: "SMAS Safiafuddin",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Teuku Nyak Arief",
    shortName: "SMAS Teuku Nyak Arief",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
  {
    name: "SMAS Teuku Nyak Arif Fatih Bilingual School",
    shortName: "SMAS Teuku Nyak Arif Fatih Bilingual School",
    province: "Aceh",
    city: "Banda Aceh",
    educationCode: "SMA",
    majors: [],
  },
] as const;

const SKILLS = [
  { name: "JavaScript", category: "Programming" },
  { name: "TypeScript", category: "Programming" },
  { name: "Python", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "PHP", category: "Programming" },
  { name: "React", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Laravel", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MySQL", category: "Database" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Figma", category: "Design" },
  { name: "Microsoft Office", category: "Office" },
  { name: "Data Analysis", category: "Data" },
  { name: "Komunikasi", category: "Soft Skill" },
  { name: "Kerja Sama Tim", category: "Soft Skill" },
  { name: "Manajemen Waktu", category: "Soft Skill" },
] as const;

const NOTIFICATION_TYPES = [
  { code: "APPLICATION_STATUS_CHANGED", name: "Perubahan Status Lamaran" },
  { code: "INTERNSHIP_STARTED", name: "Internship Dimulai" },
  { code: "INTERNSHIP_EXTENDED", name: "Internship Diperpanjang" },
  { code: "INTERNSHIP_FINISHED", name: "Internship Selesai" },
  { code: "SUPERVISOR_ASSIGNED", name: "Supervisor Ditugaskan" },
  { code: "ATTENDANCE_OVERRIDDEN", name: "Kehadiran Diubah" },
  { code: "CERTIFICATE_ISSUED", name: "Sertifikat Terbit" },
  { code: "BROADCAST", name: "Pengumuman" },
] as const;

const DEPARTMENTS = [
  {
    code: "IT",
    name: "Teknologi Informasi",
    description: "Pengembangan & operasional sistem informasi.",
  },
  {
    code: "HR",
    name: "Sumber Daya Manusia",
    description: "Pengelolaan SDM dan program magang.",
  },
  {
    code: "FINANCE",
    name: "Keuangan",
    description: "Pengelolaan keuangan perusahaan.",
  },
  {
    code: "OPS",
    name: "Operasional",
    description: "Operasional harian perusahaan.",
  },
] as const;

const OFFICES = [
  {
    name: "Kantor Pusat — Menara SIMAD",
    address: "Jl. Sudirman No. 1, Jakarta Selatan",
    latitude: -6.2088,
    longitude: 106.8456,
    radiusMeter: 200,
    // Banyak-ke-banyak: satu kantor melayani beberapa departemen.
    departmentCodes: ["IT", "HR", "FINANCE"],
  },
  {
    name: "Cabang Surabaya",
    address: "Jl. Tunjungan No. 15, Surabaya",
    latitude: -7.2575,
    longitude: 112.7521,
    radiusMeter: 150,
    departmentCodes: ["OPS"],
  },
] as const;

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding master data SIMAD...");

  // 1. Roles
  const roleIds = new Map<string, string>();
  for (const role of ROLES) {
    const saved = await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
      },
    });
    roleIds.set(role.code, saved.id);
  }
  console.log(
    `  ✓ Role: ${ROLES.length} (INTERN, HR_ADMIN, SUPERVISOR, RECEPTIONIST)`,
  );

  // 2. Permissions
  const permissionIds = new Map<string, string>();
  for (const permission of PERMISSIONS) {
    const saved = await prisma.permission.upsert({
      where: { code: permission.code },
      update: { name: permission.name, description: permission.description },
      create: {
        code: permission.code,
        name: permission.name,
        description: permission.description,
      },
    });
    permissionIds.set(permission.code, saved.id);
  }
  console.log(`  ✓ Permission: ${PERMISSIONS.length}`);

  // 3. RolePermissions
  let rpCount = 0;
  for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleIds.get(roleCode);
    if (!roleId) {
      continue;
    }
    for (const permissionCode of permissionCodes) {
      const permissionId = permissionIds.get(permissionCode);
      if (!permissionId) {
        continue;
      }
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
      rpCount += 1;
    }
  }
  console.log(`  ✓ RolePermission: ${rpCount}`);

  // 4. EducationLevels
  const educationIds = new Map<string, string>();
  for (const level of EDUCATION_LEVELS) {
    const saved = await prisma.educationLevel.upsert({
      where: { code: level.code },
      update: { name: level.name },
      create: { code: level.code, name: level.name },
    });
    educationIds.set(level.code, saved.id);
  }
  console.log(`  ✓ EducationLevel: ${EDUCATION_LEVELS.length}`);

  // 5. Institutions + InstitutionMajors
  let institutionCount = 0;
  let majorCount = 0;
  for (const institution of INSTITUTIONS) {
    const savedInstitution = await findOrCreate(
      () => prisma.institution.findFirst({ where: { name: institution.name } }),
      () =>
        prisma.institution.create({
          data: {
            name: institution.name,
            shortName: institution.shortName,
            province: institution.province,
            city: institution.city,
            educationLevelId:
              educationIds.get(institution.educationCode) ?? null,
          },
        }),
    );
    institutionCount += 1;

    for (const majorName of institution.majors) {
      await findOrCreate(
        () =>
          prisma.institutionMajor.findFirst({
            where: { institutionId: savedInstitution.id, name: majorName },
          }),
        () =>
          prisma.institutionMajor.create({
            data: { institutionId: savedInstitution.id, name: majorName },
          }),
      );
      majorCount += 1;
    }
  }
  console.log(
    `  ✓ Institution: ${institutionCount}, InstitutionMajor: ${majorCount}`,
  );

  // 6. Skills
  for (const skill of SKILLS) {
    await findOrCreate(
      () => prisma.skill.findFirst({ where: { name: skill.name } }),
      () =>
        prisma.skill.create({
          data: { name: skill.name, category: skill.category },
        }),
    );
  }
  console.log(`  ✓ Skill: ${SKILLS.length}`);

  // 7. NotificationTypes
  for (const type of NOTIFICATION_TYPES) {
    await prisma.notificationType.upsert({
      where: { code: type.code },
      update: { name: type.name },
      create: { code: type.code, name: type.name },
    });
  }
  console.log(`  ✓ NotificationType: ${NOTIFICATION_TYPES.length}`);

  // 8. CertificateTemplate
  const template = await findOrCreate(
    () =>
      prisma.certificateTemplate.findFirst({
        where: { name: "Template Sertifikat SIMAD" },
      }),
    () =>
      prisma.certificateTemplate.create({
        data: { name: "Template Sertifikat SIMAD", isDefault: true },
      }),
  );
  if (template.isDefault !== true) {
    await prisma.certificateTemplate.update({
      where: { id: template.id },
      data: { isDefault: true },
    });
  }
  console.log("  ✓ CertificateTemplate: Template Sertifikat SIMAD");

  // 9. Department + OfficeLocation + AttendanceSetting
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: {
        name: department.name,
        description: department.description,
        isActive: true,
      },
      create: {
        code: department.code,
        name: department.name,
        description: department.description,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ Department: ${DEPARTMENTS.length}`);

  for (const office of OFFICES) {
    const departments = await prisma.department.findMany({
      where: { code: { in: [...office.departmentCodes] } },
    });
    const savedOffice = await findOrCreate(
      () => prisma.officeLocation.findFirst({ where: { name: office.name } }),
      () =>
        prisma.officeLocation.create({
          data: {
            name: office.name,
            address: office.address,
            latitude: office.latitude,
            longitude: office.longitude,
            radiusMeter: office.radiusMeter,
            departments: {
              connect: departments.map((department) => ({ id: department.id })),
            },
          },
        }),
    );

    // Idempotent: pastikan relasi m2m selalu sinkron walau kantor sudah ada
    // dari seed / migrate sebelumnya (set = replace seluruh relasi).
    await prisma.officeLocation.update({
      where: { id: savedOffice.id },
      data: {
        departments: {
          set: departments.map((department) => ({ id: department.id })),
        },
      },
    });

    // AttendanceSetting (WIB wall-clock disimpan sebagai nilai time mentah,
    // dibaca via getUTCHours() di AttendanceService.validateTimeWindow).
    const time = (hour: number, minute = 0) =>
      new Date(
        `1970-01-01T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`,
      );
    await findOrCreate(
      () =>
        prisma.attendanceSetting.findFirst({
          where: { officeLocationId: savedOffice.id },
        }),
      () =>
        prisma.attendanceSetting.create({
          data: {
            officeLocationId: savedOffice.id,
            checkInStart: time(8, 0),
            checkInEnd: time(10, 0),
            checkOutStart: time(17, 0),
            checkOutEnd: time(20, 0),
            lateAfter: time(8, 30),
            allowWeekend: false,
          },
        }),
    );
  }
  console.log(
    `  ✓ OfficeLocation: ${OFFICES.length}, AttendanceSetting: ${OFFICES.length}`,
  );

  // 10. Admin user (HR_ADMIN)
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@simad.com")
    .toLowerCase()
    .trim();

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const hashedPassword = await bcryptjs.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isActive: true, emailVerified: true },
    create: {
      fullName: "Admin SIMAD",
      email: adminEmail,
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  const hrAdminRoleId = roleIds.get("hr_admin");
  if (hrAdminRoleId) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: hrAdminRoleId } },
      update: {},
      create: {
        userId: admin.id,
        roleId: hrAdminRoleId,
        assignedAt: new Date(),
      },
    });
  }
  console.log(`  ✓ Admin user: ${adminEmail} (HR_ADMIN)`);

  // 11. Internship Quotas (v1.0.1)
  const allOffices = await prisma.officeLocation.findMany();
  const allDepartments = await prisma.department.findMany();
  let seededQuotasCount = 0;
  for (const office of allOffices) {
    const totalOfficeCap = allDepartments.length * 5; // e.g. 5 slot per department
    const existing = await prisma.internshipQuota.findUnique({
      where: {
        officeLocationId: office.id,
      },
      include: { departmentAllocations: true },
    });

    if (!existing) {
      await prisma.internshipQuota.create({
        data: {
          officeLocationId: office.id,
          totalCapacity: totalOfficeCap,
          isActive: true,
          notes: `Kapasitas kuota kantor ${office.name}`,
          createdBy: admin.id,
          departmentAllocations: {
            create: allDepartments.map((dept) => ({
              departmentId: dept.id,
              capacity: 5,
              notes: `Alokasi bidang ${dept.name}`,
            })),
          },
        },
      });
      seededQuotasCount++;
    }
  }
  console.log(`  ✓ InternshipQuota: ${seededQuotasCount} master kuota kantor & alokasi departemen`);

  // 12. Multi-Office Certificate Settings (v1.0.1)
  for (const office of allOffices) {
    const officeCode = (office.name ?? "OFFICE")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();

    await findOrCreate(
      () =>
        prisma.certificateSetting.findFirst({
          where: { officeLocationId: office.id },
        }),
      () =>
        prisma.certificateSetting.create({
          data: {
            officeLocationId: office.id,
            signerName: `Pimpinan ${office.name ?? "Kantor"}`,
            signerRole: `Kepala ${office.name ?? "Kantor Cabang"}`,
            certificateNumberFormat: `SIMAD/${officeCode}/{YEAR}/{NUM}`,
            isActive: true,
          },
        }),
    );
  }
  console.log(`  ✓ CertificateSetting: ${allOffices.length} setting kantor`);

  // 13. Guide & Tutorial Contents (v1.0.1)
  const GUIDES = [
    {
      title: "Panduan Alur Pendaftaran & Dokumen Wajib",
      slug: "panduan-pendaftaran-magang",
      description: "Tata cara mendaftar magang di SIMAD dan melampirkan berkas wajib CV serta Surat Permohonan Fakultas.",
      category: "REGISTRATION",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: `# Panduan Pendaftaran Magang SIMAD\n\n1. Registrasi akun dan lengkapi data profil mahasiswa.\n2. Wajib mengunggah **Curriculum Vitae (CV)** dan **Surat Permohonan dari Fakultas**.\n3. Pilih kantor dan departemen peminatan.\n4. Kirim pengajuan dan pantau status review oleh tim HR.`,
      displayOrder: 1,
      isPublished: true,
    },
    {
      title: "Tata Tertib & Batas Waktu Absensi Masuk (Maks 08:00 WIB)",
      slug: "tata-tertib-jam-absensi",
      description: "Ketentuan jam masuk tepat waktu dan geofence lokasi kantor.",
      category: "ATTENDANCE",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: `# Tata Tertib Absensi Harian\n\n- Absensi masuk tepat waktu maksimal adalah pukul **08:00 WIB**.\n- Check-in setelah pukul 08:00 WIB akan otomatis tercatat sebagai **Terlambat (LATE)**.\n- Pastikan izin GPS aktif dan berada di dalam radius kantor saat absen masuk dan pulang.`,
      displayOrder: 2,
      isPublished: true,
    },
    {
      title: "Prosedur Pengajuan Koreksi Absensi",
      slug: "prosedur-koreksi-absensi",
      description: "Cara mengajukan permohonan koreksi absensi yang terkendala ke Supervisor.",
      category: "CORRECTION",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: `# Prosedur Koreksi Absensi\n\n1. Buka menu Riwayat Absensi dan klik tombol **Ajukan Koreksi** pada tanggal terkait.\n2. Pilih jenis koreksi (Check-in / Check-out) dan sertakan alasan serta file bukti foto kendala.\n3. Supervisor Anda akan meninjau dan memberikan persetujuan jika permohonan valid.`,
      displayOrder: 3,
      isPublished: true,
    },
    {
      title: "Ketentuan Penilaian & Penerbitan Sertifikat Magang",
      slug: "penilaian-dan-sertifikat-magang",
      description: "Syarat penerbitan sertifikat magang resmi SIMAD.",
      category: "CERTIFICATE",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: `# Sertifikat Magang Digital\n\n- Sertifikat resmi hanya dapat diterbitkan setelah status magang **Selesai (COMPLETED)**.\n- Supervisor wajib memberikan **Nilai Akhir Evaluasi (FINAL)** terlebih dahulu.\n- Tim HR Admin akan melakukan persetujuan akhir sebelum PDF Sertifikat ber-QR Code dapat diunduh.`,
      displayOrder: 4,
      isPublished: true,
    },
  ];

  for (const guide of GUIDES) {
    await prisma.guideContent.upsert({
      where: { slug: guide.slug },
      update: {
        title: guide.title,
        description: guide.description,
        category: guide.category,
        videoUrl: guide.videoUrl,
        content: guide.content,
        displayOrder: guide.displayOrder,
        isPublished: guide.isPublished,
      },
      create: {
        ...guide,
        createdById: admin.id,
      },
    });
  }
  console.log(`  ✓ GuideContent: ${GUIDES.length} materi panduan & tutorial`);

  console.log("✅ Seed selesai.");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

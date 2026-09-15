import { randomUUID } from "node:crypto";
import * as bcryptjs from "bcryptjs";
import prisma from "./client";

/**
 * Seeder untuk 1 User Intern dengan data lengkap dan status COMPLETED.
 * Memenuhi seluruh syarat bisnis penerbitan sertifikat (BR-CERT-001/002/003/004):
 * - Status internship: COMPLETED
 * - actualEndDate berada di masa lampau (kemarin)
 * - Belum diterbitkan sertifikat (siap di-generate oleh HR Admin)
 * - Riwayat onboarding, supervisor assignment, dan absensi terisi lengkap.
 */
async function seedCompletedIntern() {
  console.log("🚀 Menjalankan seeder user magang selesai (COMPLETED)...");

  const email = "dimas.intern@simad.com";
  const rawPassword = "Password@123";
  const fullName = "Dimas Wicaksono";
  const studentNumber = "2108107010099";

  // 1. Ambil role INTERN
  const internRole = await prisma.role.findFirst({
    where: { code: "intern" },
  });
  if (!internRole) {
    throw new Error("Role 'intern' tidak ditemukan di database!");
  }

  // 2. Ambil master data pendukung
  const institution =
    (await prisma.institution.findFirst({
      where: { shortName: "USK" },
      include: { institutionMajors: true },
    })) ??
    (await prisma.institution.findFirst({
      include: { institutionMajors: true },
    }));

  if (!institution || !institution.institutionMajors.length) {
    throw new Error("Data institusi atau jurusan belum tersedia!");
  }
  const major = institution.institutionMajors[0];

  const department =
    (await prisma.department.findFirst({
      where: { code: "IT", isActive: true },
    })) ??
    (await prisma.department.findFirst({
      where: { isActive: true },
    }));

  if (!department) {
    throw new Error("Data departemen aktif tidak ditemukan!");
  }

  const office =
    (await prisma.officeLocation.findFirst({
      where: { departments: { some: { id: department.id } } },
    })) ?? (await prisma.officeLocation.findFirst());

  if (!office) {
    throw new Error("Data kantor tidak ditemukan!");
  }

  const supervisor =
    (await prisma.user.findFirst({
      where: {
        userRoles: { some: { role: { code: "supervisor" } } },
        departmentId: department.id,
      },
    })) ??
    (await prisma.user.findFirst({
      where: {
        userRoles: { some: { role: { code: "supervisor" } } },
      },
    }));

  if (!supervisor) {
    throw new Error("Supervisor tidak ditemukan!");
  }

  const hrAdmin = await prisma.user.findFirst({
    where: {
      userRoles: { some: { role: { code: "hr_admin" } } },
    },
  });

  if (!hrAdmin) {
    throw new Error("HR Admin tidak ditemukan!");
  }

  // File surat rekomendasi / pengantar
  let sampleFile = await prisma.file.findFirst({
    where: { mimeType: "application/pdf" },
  });

  if (!sampleFile) {
    sampleFile = await prisma.file.create({
      data: {
        originalName: "Surat_Pengantar_Magang_USK.pdf",
        fileName: "surat-pengantar.pdf",
        mimeType: "application/pdf",
        extension: "pdf",
        size: BigInt(102400),
        storageProvider: "r2",
        publicId: "sample-surat-pengantar",
        url: "https://pub-2f811af54c344a96ad45cb28d7493156.r2.dev/sample-surat-pengantar.pdf",
        uploadedById: hrAdmin.id,
      },
    });
  }

  // Ambil beberapa skill untuk profil
  const skills = await prisma.skill.findMany({ take: 3 });

  // 3. Bersihkan data user lama jika sudah ada (idempotent)
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      internProfile: {
        include: {
          internships: {
            include: {
              attendances: { include: { attendanceLogs: true } },
              supervisorAssignments: true,
              onboardingHistories: true,
              statusHistories: true,
              certificate: true,
            },
          },
          applications: true,
          profileSkills: true,
        },
      },
      userRoles: true,
    },
  });

  if (existingUser) {
    console.log("  ℹ️ Menghapus data user lama untuk pembaruan idempotent...");
    if (existingUser.internProfile) {
      for (const internship of existingUser.internProfile.internships) {
        if (internship.certificate) {
          await prisma.certificate.delete({ where: { id: internship.certificate.id } });
        }
        for (const att of internship.attendances) {
          await prisma.attendanceLog.deleteMany({ where: { attendanceId: att.id } });
        }
        await prisma.attendance.deleteMany({ where: { internshipId: internship.id } });
        await prisma.supervisorAssignment.deleteMany({ where: { internshipId: internship.id } });
        await prisma.onboardingHistory.deleteMany({ where: { internshipId: internship.id } });
        await prisma.internshipStatusHistory.deleteMany({ where: { internshipId: internship.id } });
        await prisma.internship.delete({ where: { id: internship.id } });
      }
      await prisma.internshipApplication.deleteMany({ where: { internProfileId: existingUser.internProfile.id } });
      await prisma.internProfileSkill.deleteMany({ where: { internProfileId: existingUser.internProfile.id } });
      await prisma.internProfile.delete({ where: { id: existingUser.internProfile.id } });
    }
    await prisma.userRole.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 4. Buat User baru
  const hashedPassword = await bcryptjs.hash(rawPassword, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      departmentId: department.id,
      officeId: office.id,
      userRoles: {
        create: {
          roleId: internRole.id,
          assignedById: hrAdmin.id,
          assignedAt: new Date(),
        },
      },
    },
  });

  // 5. Buat InternProfile
  const internProfile = await prisma.internProfile.create({
    data: {
      userId: user.id,
      studentNumber,
      institutionId: institution.id,
      majorId: major.id,
      phone: "081234567899",
      emergencyContact: "081298765432",
      address: "Jl. Teuku Nyak Arief No. 108, Syiah Kuala, Banda Aceh",
      birthPlace: "Banda Aceh",
      birthDate: new Date("2002-05-18"),
      gender: "LAKI-LAKI",
      bio: "Mahasiswa tingkat akhir Teknik Informatika yang telah menyelesaikan seluruh program kerja magang industri di PLN.",
      profileSkills: {
        create: skills.map((s) => ({
          skillId: s.id,
          proficiency: "ADVANCED",
        })),
      },
    },
  });

  // 6. Buat InternshipApplication (Status: APPROVED)
  const applicationStartDate = new Date("2026-06-01");
  const applicationEndDate = new Date("2026-09-14"); // Kemarin (sudah lampau)

  const application = await prisma.internshipApplication.create({
    data: {
      internProfileId: internProfile.id,
      applicationNumber: `APP-PLN-${Date.now().toString().slice(-6)}`,
      introductionLetterFileId: sampleFile.id,
      requestedStartDate: applicationStartDate,
      requestedEndDate: applicationEndDate,
      motivation: "Ingin berkontribusi nyata pada sistem informasi dan otomatisasi digital di PT PLN (Persero).",
      status: "APPROVED",
      reviewedById: hrAdmin.id,
      reviewedAt: new Date("2026-05-28"),
    },
  });

  // 7. Buat Internship (Status: COMPLETED, siap generate sertifikat)
  const actualStartDate = new Date("2026-06-01");
  const actualEndDate = new Date("2026-09-14"); // Selesai kemarin
  const completedAt = new Date("2026-09-14T17:00:00.000Z");

  const internship = await prisma.internship.create({
    data: {
      applicationId: application.id,
      internProfileId: internProfile.id,
      departmentId: department.id,
      officeLocationId: office.id,
      actualStartDate,
      actualEndDate,
      status: "COMPLETED",
      onboardingCompleted: true,
      completedAt,
    },
  });

  // 8. Buat SupervisorAssignment
  await prisma.supervisorAssignment.create({
    data: {
      internshipId: internship.id,
      supervisorId: supervisor.id,
      assignedById: hrAdmin.id,
      assignedAt: new Date("2026-05-29"),
      isActive: true,
    },
  });

  // 9. Buat OnboardingHistory (tata tertib diterima)
  await prisma.onboardingHistory.create({
    data: {
      internshipId: internship.id,
      accepted: true,
      acceptedAt: new Date("2026-06-01T08:00:00.000Z"),
    },
  });

  // 10. Buat Status Histories
  const statusTransitions = [
    { oldStatus: "SUBMITTED", newStatus: "APPROVED", date: "2026-05-28T10:00:00.000Z", notes: "Pengajuan disetujui HR" },
    { oldStatus: "APPROVED", newStatus: "ONBOARDING_PENDING", date: "2026-05-29T09:00:00.000Z", notes: "Menunggu onboarding tata tertib" },
    { oldStatus: "ONBOARDING_PENDING", newStatus: "ONBOARDING_COMPLETED", date: "2026-06-01T08:00:00.000Z", notes: "Peserta menyetujui tata tertib" },
    { oldStatus: "ONBOARDING_COMPLETED", newStatus: "ACTIVE", date: "2026-06-01T08:30:00.000Z", notes: "Peserta aktif magang" },
    { oldStatus: "ACTIVE", newStatus: "COMPLETED", date: "2026-09-14T17:00:00.000Z", notes: "Masa magang berakhir dan selesai dengan memuaskan" },
  ];

  for (const trans of statusTransitions) {
    await prisma.internshipStatusHistory.create({
      data: {
        internshipId: internship.id,
        oldStatus: trans.oldStatus,
        newStatus: trans.newStatus,
        changedById: hrAdmin.id,
        notes: trans.notes,
        createdAt: new Date(trans.date),
      },
    });
  }

  // 11. Buat Rekap Absensi (contoh 15 hari kerja terakhir)
  console.log("  📅 Membuat histori absensi peserta...");
  const baseDate = new Date("2026-08-25");
  for (let i = 0; i < 15; i++) {
    const curDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    // Lewati akhir pekan (Sabtu=6, Minggu=0)
    if (curDate.getDay() === 0 || curDate.getDay() === 6) continue;

    const checkIn = new Date(curDate);
    checkIn.setHours(8, 10 + (i % 15), 0, 0);

    const checkOut = new Date(curDate);
    checkOut.setHours(17, 5 + (i % 25), 0, 0);

    const att = await prisma.attendance.create({
      data: {
        internshipId: internship.id,
        attendanceDate: curDate,
        checkInAt: checkIn,
        checkOutAt: checkOut,
        checkInStatus: "PRESENT",
        checkOutStatus: "COMPLETED",
        attendanceStatus: "PRESENT",
        totalWorkMinutes: 520,
        notes: "Hadir tepat waktu dan melaksanakan tugas divisi IT.",
      },
    });

    await prisma.attendanceLog.createMany({
      data: [
        {
          attendanceId: att.id,
          action: "CHECK_IN",
          latitude: office.latitude,
          longitude: office.longitude,
          insideGeofence: true,
          deviceName: "Chrome on macOS",
          accuracyMeter: 12.5,
          createdAt: checkIn,
        },
        {
          attendanceId: att.id,
          action: "CHECK_OUT",
          latitude: office.latitude,
          longitude: office.longitude,
          insideGeofence: true,
          deviceName: "Chrome on macOS",
          accuracyMeter: 14.2,
          createdAt: checkOut,
        },
      ],
    });
  }

  console.log("\n============================================================");
  console.log("✅ SEEDER BERHASIL! User magang selesai siap diuji:");
  console.log("------------------------------------------------------------");
  console.log("Akun Intern (Peserta Magang Selesai):");
  console.log(`  📧 Email    : ${email}`);
  console.log(`  🔑 Password : ${rawPassword}`);
  console.log(`  👤 Nama     : ${fullName}`);
  console.log(`  🎓 NIM      : ${studentNumber} (${institution.shortName} - ${major.name})`);
  console.log(`  🏢 Dept     : ${department.name}`);
  console.log(`  📍 Kantor   : ${office.name}`);
  console.log(`  👨‍🏫 Pembimbing: ${supervisor.fullName}`);
  console.log(`  🎯 Status   : COMPLETED (Selesai pada 14 September 2026)`);
  console.log(`  📜 Sertifikat : Belum terbit (Siap di-generate!)`);
  console.log("------------------------------------------------------------");
  console.log("Akun HR Admin (Untuk Men-generate Sertifikat):");
  console.log(`  📧 Email    : admin@simad.com`);
  console.log(`  🔑 Password : Admin@12345`);
  console.log("============================================================\n");
}

seedCompletedIntern()
  .catch((e) => {
    console.error("❌ Seeder gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

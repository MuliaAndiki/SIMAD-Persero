import { AppError } from '@/http/error';
import { createAuditLog } from '@/utils/audit.util';
import prisma from '../../prisma/client';

/**
 * Service untuk cleanup/maintenance data.
 * Menangani penghapusan permanen user yang sudah soft-deleted.
 * 
 * IMPORTANT: Service ini akan menghapus data secara permanen!
 * Hanya dijalankan melalui cron job dengan proper authorization.
 */
class CleanupService {
  /**
   * Hapus user yang sudah dinonaktifkan (isActive = false atau deletedAt != null)
   * dan sudah melewati grace period (default 30 hari).
   * 
   * @param gracePeriodDays - Jumlah hari sebelum user benar-benar dihapus
   * @param systemUserId - ID user sistem yang menjalankan cleanup (untuk audit log)
   */
  public async deleteInactiveUsers(
    gracePeriodDays = 30,
    systemUserId?: string,
  ): Promise<{
    deletedCount: number;
    deletedUsers: Array<{ id: string; email: string; deletedAt: Date | null }>;
  }> {
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Find users yang eligible untuk dihapus:
    // 1. isActive = false ATAU deletedAt != null
    // 2. deletedAt/updatedAt sudah melewati grace period
    const eligibleUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { isActive: false },
              { deletedAt: { not: null } },
            ],
          },
          {
            OR: [
              { deletedAt: { lte: gracePeriodDate } },
              {
                AND: [
                  { isActive: false },
                  { updatedAt: { lte: gracePeriodDate } },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        deletedAt: true,
        isActive: true,
        // Check relations
        internProfile: { select: { id: true } },
        userRoles: { select: { roleId: true } },
        uploadedFiles: { select: { id: true } },
        avatarFileId: true,
      },
    });

    if (eligibleUsers.length === 0) {
      return { deletedCount: 0, deletedUsers: [] };
    }

    const deletedUsers: Array<{ id: string; email: string; deletedAt: Date | null }> = [];
    let successCount = 0;

    // Process each user dalam transaction
    for (const user of eligibleUsers) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Delete InternProfile dan relations (jika ada)
          if (user.internProfile) {
            const internProfileId = user.internProfile.id;

            // Delete applications dulu (karena ada FK ke files)
            const applications = await tx.internshipApplication.findMany({
              where: { internProfileId },
              select: { 
                id: true, 
                introductionLetterFileId: true,
                internship: { select: { id: true } }
              },
            });

            for (const app of applications) {
              // Delete internship related data jika ada
              if (app.internship) {
                const internshipId = app.internship.id;

                // Delete attendance violations
                await tx.attendanceViolation.deleteMany({
                  where: {
                    attendance: { internshipId },
                  },
                });

                // Delete attendance overrides
                await tx.attendanceOverride.deleteMany({
                  where: {
                    attendance: { internshipId },
                  },
                });

                // Delete attendance logs
                await tx.attendanceLog.deleteMany({
                  where: {
                    attendance: { internshipId },
                  },
                });

                // Delete attendances
                await tx.attendance.deleteMany({
                  where: { internshipId },
                });

                // Delete attendance reminders
                await tx.attendanceReminder.deleteMany({
                  where: { internshipId },
                });

                // Delete supervisor assignments
                await tx.supervisorAssignment.deleteMany({
                  where: { internshipId },
                });

                // Delete onboarding histories
                await tx.onboardingHistory.deleteMany({
                  where: { internshipId },
                });

                // Delete internship status histories
                await tx.internshipStatusHistory.deleteMany({
                  where: { internshipId },
                });

                // Delete certificate (will cascade to file relation)
                await tx.certificate.deleteMany({
                  where: { internshipId },
                });

                // Delete internship
                await tx.internship.delete({
                  where: { id: internshipId },
                });
              }

              // Delete application
              await tx.internshipApplication.delete({
                where: { id: app.id },
              });

              // Soft delete introduction letter file
              if (app.introductionLetterFileId) {
                await tx.file.update({
                  where: { id: app.introductionLetterFileId },
                  data: { deletedAt: new Date() },
                });
              }
            }

            // Delete intern profile skills
            await tx.internProfileSkill.deleteMany({
              where: { internProfileId },
            });

            // Delete intern profile
            await tx.internProfile.delete({
              where: { id: internProfileId },
            });
          }

          // 2. Delete user relations yang bukan owner
          // Notification reads
          await tx.notificationRead.deleteMany({
            where: { userId: user.id },
          });

          // Activity logs (keep untuk audit)
          // Skip - biarkan untuk audit trail

          // Audit logs (keep untuk audit)
          // Skip - biarkan untuk audit trail

          // Attendance devices
          await tx.attendanceDevice.deleteMany({
            where: { userId: user.id },
          });

          // Refresh tokens
          await tx.refreshToken.deleteMany({
            where: { userId: user.id },
          });

          // User roles
          await tx.userRole.deleteMany({
            where: { userId: user.id },
          });

          // 3. Soft delete uploaded files (keep untuk audit)
          if (user.uploadedFiles.length > 0) {
            await tx.file.updateMany({
              where: { uploadedById: user.id },
              data: { deletedAt: new Date() },
            });
          }

          // 4. Soft delete avatar file if exists
          if (user.avatarFileId) {
            await tx.file.update({
              where: { id: user.avatarFileId },
              data: { deletedAt: new Date() },
            }).catch(() => {
              // Avatar might be shared or already deleted
            });
          }

          // 5. Create audit log sebelum delete user
          if (systemUserId) {
            await createAuditLog(tx, {
              userId: systemUserId,
              module: 'CLEANUP',
              action: 'DELETE_INACTIVE_USER',
              tableName: 'users',
              recordId: user.id,
              oldData: {
                email: user.email,
                fullName: user.fullName,
                isActive: user.isActive,
                deletedAt: user.deletedAt,
              },
            });
          }

          // 6. Finally, delete the user
          await tx.user.delete({
            where: { id: user.id },
          });

          deletedUsers.push({
            id: user.id,
            email: user.email,
            deletedAt: user.deletedAt,
          });
          successCount++;
        });
      } catch (error) {
        console.error(`Failed to delete user ${user.email}:`, error);
        // Continue dengan user lainnya
      }
    }

    return {
      deletedCount: successCount,
      deletedUsers,
    };
  }

  /**
   * Get summary of users eligible for deletion
   * (untuk preview sebelum actual delete)
   */
  public async getInactiveUsersCount(gracePeriodDays = 30): Promise<{
    count: number;
    users: Array<{
      id: string;
      email: string;
      fullName: string;
      isActive: boolean;
      deletedAt: Date | null;
      daysSinceInactive: number;
    }>;
  }> {
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { isActive: false },
              { deletedAt: { not: null } },
            ],
          },
          {
            OR: [
              { deletedAt: { lte: gracePeriodDate } },
              {
                AND: [
                  { isActive: false },
                  { updatedAt: { lte: gracePeriodDate } },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    const now = new Date();
    const usersWithDays = users.map((user) => {
      const inactiveDate = user.deletedAt || user.updatedAt || new Date();
      const daysSinceInactive = Math.floor(
        (now.getTime() - new Date(inactiveDate).getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
        deletedAt: user.deletedAt,
        daysSinceInactive,
      };
    });

    return {
      count: users.length,
      users: usersWithDays,
    };
  }

  /**
   * Delete orphaned files (files yang tidak terkait dengan user/entity manapun)
   */
  public async deleteOrphanedFiles(gracePeriodDays = 60): Promise<{
    deletedCount: number;
    deletedFileIds: string[];
  }> {
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Find files yang sudah soft deleted dan melewati grace period
    const orphanedFiles = await prisma.file.findMany({
      where: {
        deletedAt: {
          not: null,
          lte: gracePeriodDate,
        },
      },
      select: {
        id: true,
        url: true,
        originalName: true,
      },
    });

    if (orphanedFiles.length === 0) {
      return { deletedCount: 0, deletedFileIds: [] };
    }

    const deletedFileIds: string[] = [];

    // Delete files dari database
    // Note: Actual deletion dari R2 harus dilakukan terpisah
    for (const file of orphanedFiles) {
      try {
        await prisma.file.delete({
          where: { id: file.id },
        });
        deletedFileIds.push(file.id);
      } catch (error) {
        console.error(`Failed to delete file ${file.id}:`, error);
      }
    }

    return {
      deletedCount: deletedFileIds.length,
      deletedFileIds,
    };
  }
}

export default new CleanupService();

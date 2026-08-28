import { AppError } from "@/http/error";
import FileService from "@/services/file.service";
import type { AuthUser } from "@/types/auth.types";
import type { UploadFileInput } from "@/types/file.types";
import type {
  ChangePasswordBody,
  ProfileResponse,
  UpdateProfileBody,
} from "@/types/user.types";
import { DEFAULT_ROLE_CODE, validatePasswordPolicy } from "@/utils/auth.util";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_FILE_SIZE } from "@/utils/storage.util";
import bcryptjs from "bcryptjs";
import prisma from "../../prisma/client";

/**
 * Service layer modul User.
 * Seluruh logika bisnis (validasi, query DB, password, foto profil) di sini.
 * Kegagalan bisnis dilempar sebagai `AppError(status, message)`.
 * Sumber aturan: docs/07-api-specification.md §13.
 */
class UserService {
  private async loadProfile(userId: string): Promise<ProfileResponse> {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        internProfile: true,
        avatarFile: true,
      },
    });

    if (!dbUser || dbUser.deletedAt) {
      throw new AppError(404, "Account not found");
    }

    const role = (dbUser.userRoles[0]?.role.code ?? DEFAULT_ROLE_CODE).toLowerCase();

    return {
      id: dbUser.id,
      fullName: dbUser.fullName,
      email: dbUser.email,
      phone: dbUser.internProfile?.phone ?? null,
      role,
      profilePhoto: dbUser.avatarFile?.url ?? null,
    };
  }

  // GET /users/profile
  public getProfile(user: AuthUser) {
    return this.loadProfile(user.id);
  }

  // PATCH /users/profile
  public async updateProfile(userId: string, input: UpdateProfileBody) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new AppError(404, "Account not found");
    }

    const data: Record<string, unknown> = {};

    if (input.fullName !== undefined) {
      const fullName = input.fullName.trim();
      if (!fullName) {
        throw new AppError(400, "Full name is required");
      }
      data.fullName = fullName;
    }

    if (input.phone !== undefined) {
      const phone = input.phone.trim();
      if (!phone) {
        throw new AppError(400, "Phone is required");
      }

      // Nomor telepon disimpan di tabel intern_profiles (hanya milik intern).
      const profile = await prisma.internProfile.findUnique({
        where: { userId },
      });
      if (!profile) {
        throw new AppError(422, "User profile not found");
      }

      // Aturan bisnis: nomor telepon harus unik.
      const existingPhone = await prisma.internProfile.findFirst({
        where: { phone, userId: { not: userId } },
      });
      if (existingPhone) {
        throw new AppError(409, "Phone number already used");
      }

      await prisma.internProfile.update({ where: { userId }, data: { phone } });
    }

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: userId }, data });
    }

    return this.loadProfile(userId);
  }

  // POST /users/profile/photo
  public async uploadPhoto(user: AuthUser, file: UploadFileInput) {
    if (
      !ALLOWED_PHOTO_MIME_TYPES.includes(
        file.mimeType as (typeof ALLOWED_PHOTO_MIME_TYPES)[number],
      )
    ) {
      throw new AppError(422, "Invalid photo type. Allowed: JPG, JPEG, PNG");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(422, "Photo size exceeds the 5 MB limit");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { avatarFile: true },
    });
    if (!dbUser || dbUser.deletedAt) {
      throw new AppError(404, "Account not found");
    }

    const uploaded = await FileService.upload(user.id, file);

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarFileId: uploaded.id },
    });

    // Foto lama diganti (soft delete) — kecuali ID file sama dengan yang baru.
    if (dbUser.avatarFileId && dbUser.avatarFileId !== uploaded.id) {
      await FileService.remove(dbUser.avatarFileId, user).catch(() => {});
    }

    return this.loadProfile(user.id);
  }

  // Register avatar photo using R2 URL uploaded directly from FE
  public async savePhotoUrl(user: AuthUser, url: string, originalName?: string) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { avatarFile: true },
    });
    if (!dbUser || dbUser.deletedAt) {
      throw new AppError(404, "Account not found");
    }

    const file = await FileService.saveUrl(user.id, {
      url,
      originalName: originalName || "avatar.jpg",
      mimeType: "image/jpeg",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarFileId: file.id },
    });

    if (dbUser.avatarFileId && dbUser.avatarFileId !== file.id) {
      await FileService.remove(dbUser.avatarFileId, user).catch(() => {});
    }

    return this.loadProfile(user.id);
  }

  // PATCH /users/change-password
  public async changePassword(userId: string, body: ChangePasswordBody) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new AppError(404, "Account not found");
    }
    if (!user.password) {
      throw new AppError(400, "Password is not set for this account");
    }

    const validPassword = await bcryptjs.compare(
      body.oldPassword,
      user.password,
    );
    if (!validPassword) {
      throw new AppError(400, "Old password is incorrect");
    }

    const policyError = validatePasswordPolicy(body.newPassword);
    if (policyError) {
      throw new AppError(400, policyError);
    }

    if (body.oldPassword === body.newPassword) {
      throw new AppError(
        400,
        "New password must be different from the old password",
      );
    }

    const hashedPassword = await bcryptjs.hash(body.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}

export default new UserService();

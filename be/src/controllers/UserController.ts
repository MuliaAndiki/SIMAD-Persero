import type { AppContext } from "@/contex";
import { HttpResponse, handleAppError } from "@/http";
import userService from "@/services/user.service";
import UserService from "@/services/user.service";
import { JwtPayload } from "@/types/auth.types";
import type { ChangePasswordBody, UpdateProfileBody } from "@/types/user.types";

/**
 * Controller modul User — tipis.
 * Mengekstrak input dari context (body/params/user), memanggil
 * `UserService`, lalu memetakan hasil ke respons HTTP menggunakan
 * helper resmi `HttpResponse` dari `@/http`.
 * Sumber aturan: docs/07-api-specification.md §13.
 */
class UserController {
  private handleError(c: AppContext, error: unknown) {
    return handleAppError(c, error);
  }

  // GET /users/profile
  public async getProfile(c: AppContext) {
    try {
      const user = c.user!;
      const data = await UserService.getProfile(user);
      return HttpResponse(c).ok(
        data,
        undefined,
        "Profile retrieved successfully",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /users/profile
  public async updateProfile(c: AppContext) {
    try {
      const user = c.user!;
      const body = c.body as UpdateProfileBody;
      const data = await UserService.updateProfile(user.id, body);
      return HttpResponse(c).ok(
        data,
        undefined,
        "Profile updated successfully",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // POST /users/profile/photo
  public async uploadPhoto(c: AppContext) {
    try {
      const user = c.user!;
      const body = (c.body || {}) as {
        photo?: File;
        url?: string;
        originalName?: string;
      };

      if (body.url) {
        const data = await UserService.savePhotoUrl(
          user,
          body.url,
          body.originalName,
        );
        return HttpResponse(c).ok(
          data,
          undefined,
          "Profile photo updated successfully",
        );
      }

      const photo = body.photo;
      if (!photo) {
        return HttpResponse(c).unprocessable("Photo or URL is required");
      }

      const buffer = Buffer.from(await photo.arrayBuffer());
      const data = await UserService.uploadPhoto(user, {
        originalName: photo.name,
        mimeType: photo.type,
        size: photo.size,
        buffer,
      });

      return HttpResponse(c).ok(
        data,
        undefined,
        "Profile photo updated successfully",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // PATCH /users/change-password
  public async changePassword(c: AppContext) {
    try {
      const user = c.user!;
      const body = c.body as ChangePasswordBody;
      await UserService.changePassword(user.id, body);
      return HttpResponse(c).ok(
        undefined,
        undefined,
        "Password changed successfully",
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }
  public async deleteAccount(c: AppContext) {
    try {
      const user = c.user as JwtPayload;

      if (!user) {
        return HttpResponse(c).unauthorized();
      }

      const queryService = await userService.deleteAccount(user.id);

      if (!queryService) {
        return HttpResponse(c).badGateway();
      }

      return HttpResponse(c).ok(queryService);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}

export default new UserController();

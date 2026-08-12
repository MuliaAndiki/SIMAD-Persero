import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { USER_ENDPOINTS } from '@/configs/endpoints/user.endpoints';
import type {
  ChangePasswordBody,
  ProfileResponse,
  UpdateProfileBody,
} from '@/types/api/user.types';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul User — 4 method, satu method per endpoint backend
 * (be/src/routes/userRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class UserService {
  /**
   * GET /users/profile
   * Mengambil profil pengguna saat ini.
   */
  public async GetProfile(): Promise<TResponse<ProfileResponse>> {
    const res = await client.GetResponse<ProfileResponse>(USER_ENDPOINTS.PROFILE);
    return toServiceResponse(res, { message: 'Profil berhasil dimuat' });
  }

  /**
   * PATCH /users/profile
   * Memperbarui profil pengguna.
   */
  public async UpdateProfile(body: UpdateProfileBody): Promise<TResponse<ProfileResponse>> {
    const res = await client.PatchResponse<ProfileResponse>(USER_ENDPOINTS.UPDATE_PROFILE, body);
    return toServiceResponse(res, { message: 'Profil berhasil diperbarui' });
  }

  /**
   * POST /users/profile/photo
   * Mengunggah foto profil (FormData dengan field 'photo').
   */
  public async UploadPhoto(formData: FormData): Promise<TResponse<ProfileResponse>> {
    const res = await client.PostFormDataResponse<ProfileResponse>(
      USER_ENDPOINTS.UPLOAD_PHOTO,
      formData,
    );
    return toServiceResponse(res, { message: 'Foto profil berhasil diunggah' });
  }

  /**
   * PATCH /users/change-password
   * Mengubah password pengguna.
   */
  public async ChangePassword(
    body: Pick<ChangePasswordBody, 'oldPassword' | 'newPassword'>,
  ): Promise<TResponse<null>> {
    const res = await client.PatchResponse<null>(USER_ENDPOINTS.CHANGE_PASSWORD, body);
    return toServiceResponse(res, { message: 'Password berhasil diubah' });
  }
}

export default new UserService();

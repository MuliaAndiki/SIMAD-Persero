import authService from '@/services/api/auth.service';
import { WrapApi } from '@/utils/wrapApi';

/**
 * Entry list endpoint service.
 *
 * Seluruh service modul (fe/src/services/api/*) digabung di sini dan
 * dibungkus `WrapApi` (fe/src/utils/wrapApi.ts) sehingga setiap method yang
 * mengembalikan `status: 'error'` otomatis melempar Error.
 *
 * Pemakaian:
 *   const res = await Api.Auth.Login(body); // sudah ter-wrap
 */
// biome-ignore lint/complexity/noStaticOnlyClass: entry service package
class Api {
  static Auth = WrapApi(authService);

  // Service modul lain ditambahkan di sini, contoh:
  // static Post = WrapApi(postService);
  // static Attendance = WrapApi(attendanceService);
}

export default Api;

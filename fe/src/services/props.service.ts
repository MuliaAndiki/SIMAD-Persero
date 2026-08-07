import authService from "@/services/api/auth.service";
import { WrapApi } from "@/utils/wrapApi";
class Api {
  static Auth = WrapApi(authService);
}

export default Api;

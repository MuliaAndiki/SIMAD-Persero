import type { AppContext } from '@/contex';
import { HttpResponse } from '@/http';
import type { JwtPayload } from '@/types/auth.types';
export async function unauthorizedValidate(user: JwtPayload, c: AppContext) {
  if (!user) {
    return HttpResponse(c).unauthorized();
  }
}

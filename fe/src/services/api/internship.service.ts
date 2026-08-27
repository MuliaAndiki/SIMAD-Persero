import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { INTERNSHIP_ENDPOINTS } from '@/configs/endpoints/internship.endpoints';
import type {
  AddSkillBody,
  AddSkillResponse,
  AssignSupervisorBody,
  ChangeDepartmentBody,
  CreateInternProfileResponse,
  CreateSkillBody,
  ExtendInternshipBody,
  InternshipParams,
  InternshipResponse,
  MyInternProfileResponse,
  PickMergeInternship,
  RemoveSkillParams,
  RemoveSkillResponse,
  SkillQuery,
  SkillResponse,
  UpdateSkillBody,
} from '@/types/api/internship.types';
import { buildQueryString } from '@/utils/query-string';
import { toServiceResponse } from '@/utils/service-response';

/**
 * Service modul Internship — satu method per endpoint backend
 * (be/src/routes/internshipRoutes.ts).
 *
 * Semua method menggunakan `Api().client` (dieksekusi di browser).
 */
const { client } = Api();

class InternshipService {
  /**
   * GET /internships
   * Mengambil daftar semua magang (HR_ADMIN).
   */
  public async List(): Promise<TResponse<InternshipResponse[]>> {
    const res = await client.GetResponse<InternshipResponse[]>(INTERNSHIP_ENDPOINTS.BASE);
    return toServiceResponse(res, { message: 'Daftar magang berhasil dimuat' });
  }

  /**
   * GET /internships/me
   * Mengambil data magang milik sendiri (INTERN).
   */
  public async My(): Promise<TResponse<InternshipResponse>> {
    const res = await client.GetResponse<InternshipResponse>(INTERNSHIP_ENDPOINTS.MY);
    return toServiceResponse(res, { message: 'Data magang berhasil dimuat' });
  }

  /**
   * PATCH /internships/:id/onboarding
   * Menyelesaikan onboarding magang (INTERN).
   */
  public async CompleteOnboarding(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.ONBOARDING(params.id),
      {},
    );
    return toServiceResponse(res, {
      message: 'Onboarding berhasil diselesaikan',
    });
  }

  /**
   * GET /internships/:id
   * Mengambil detail magang (HR_ADMIN, SUPERVISOR).
   */
  public async Detail(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.GetResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.DETAIL(params.id),
    );
    return toServiceResponse(res, { message: 'Detail magang berhasil dimuat' });
  }

  /**
   * PATCH /internships/:id/start
   * Memulai magang (HR_ADMIN).
   */
  public async Start(params: Pick<InternshipParams, 'id'>): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.START(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil dimulai' });
  }

  /**
   * PATCH /internships/:id/finish
   * Menyelesaikan magang (HR_ADMIN).
   */
  public async Finish(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.FINISH(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil diselesaikan' });
  }

  /**
   * PATCH /internships/:id/extend
   * Memperpanjang magang (HR_ADMIN).
   */
  public async Extend(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<ExtendInternshipBody, 'newEndDate' | 'reason'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.EXTEND(params.id),
      body,
    );
    return toServiceResponse(res, { message: 'Magang berhasil diperpanjang' });
  }

  /**
   * PATCH /internships/:id/assign-supervisor
   * Menugaskan supervisor ke magang (HR_ADMIN).
   */
  public async AssignSupervisor(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<AssignSupervisorBody, 'supervisorId'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.ASSIGN_SUPERVISOR(params.id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Supervisor berhasil ditugaskan',
    });
  }

  /**
   * PATCH /internships/:id/change-department
   * Memindahkan departemen magang (HR_ADMIN).
   */
  public async ChangeDepartment(
    params: Pick<InternshipParams, 'id'>,
    body: Pick<ChangeDepartmentBody, 'departmentId' | 'officeLocationId'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.CHANGE_DEPARTMENT(params.id),
      body,
    );
    return toServiceResponse(res, {
      message: 'Departemen berhasil dipindahkan',
    });
  }

  /**
   * PATCH /internships/:id/archive
   * Mengarsipkan magang (HR_ADMIN).
   */
  public async Archive(
    params: Pick<InternshipParams, 'id'>,
  ): Promise<TResponse<InternshipResponse>> {
    const res = await client.PatchResponse<InternshipResponse>(
      INTERNSHIP_ENDPOINTS.ARCHIVE(params.id),
      {},
    );
    return toServiceResponse(res, { message: 'Magang berhasil diarsipkan' });
  }

  /**
   * POST /internships/profile
   * Membuat/update profil magang (INTERN).
   */
  public async CreateProfile(
    body: PickMergeInternship,
  ): Promise<TResponse<CreateInternProfileResponse>> {
    const res = await client.PostResponse<CreateInternProfileResponse>(
      INTERNSHIP_ENDPOINTS.PROFILE,
      body,
    );
    return toServiceResponse(res, {
      message: 'Profil magang berhasil disimpan',
      statusCode: 201,
    });
  }
  /**
   * GET /internships/profile
   * Mengambil profil magang milik sendiri (INTERN).
   */
  public async MyProfile(): Promise<TResponse<MyInternProfileResponse>> {
    const res = await client.GetResponse<MyInternProfileResponse>(INTERNSHIP_ENDPOINTS.MY_PROFILE);
    return toServiceResponse(res, { message: 'Profil magang berhasil dimuat' });
  }

  /**
   * GET /internships/skill
   * Mengambil daftar skill (INTERN) — mendukung pencarian & paginasi.
   */
  public async GetSkills(query?: SkillQuery): Promise<TResponse<SkillResponse[]>> {
    const qs = buildQueryString(
      query as Record<string, string | number | boolean | null | undefined>,
    );
    const res = await client.GetResponse<SkillResponse[]>(`${INTERNSHIP_ENDPOINTS.SKILLS}${qs}`);
    return toServiceResponse(res, { message: 'Daftar skill berhasil dimuat' });
  }

  public async CreateSkill(body: CreateSkillBody): Promise<TResponse<SkillResponse>> {
    const res = await client.PostResponse<SkillResponse>(INTERNSHIP_ENDPOINTS.CREATE_SKILL, body);
    return toServiceResponse(res, {
      message: 'Skill berhasil dibuat',
      statusCode: 201,
    });
  }

  public async UpdateSkill(
    params: { id: string },
    body: UpdateSkillBody,
  ): Promise<TResponse<SkillResponse>> {
    const res = await client.PutResponse<SkillResponse>(
      INTERNSHIP_ENDPOINTS.UPDATE_SKILL(params.id),
      body,
    );
    return toServiceResponse(res, { message: 'Skill berhasil diperbarui' });
  }

  public async DeleteSkill(params: { id: string }): Promise<TResponse<null>> {
    const res = await client.DeleteResponse<null>(INTERNSHIP_ENDPOINTS.DELETE_SKILL(params.id));
    return toServiceResponse(res, { message: 'Skill berhasil dihapus' });
  }

  /**
   * POST /internships/add-skills
   * Menambahkan skill ke profil magang (INTERN).
   */
  public async AddSkill(body: AddSkillBody): Promise<TResponse<AddSkillResponse>> {
    const res = await client.PostResponse<AddSkillResponse>(INTERNSHIP_ENDPOINTS.ADD_SKILLS, body);
    return toServiceResponse(res, { message: 'Skill berhasil ditambahkan' });
  }

  /**
   * DELETE /internships/remove-skill/:skillId
   * Menghapus skill dari profil magang (INTERN).
   */
  public async RemoveSkill(params: RemoveSkillParams): Promise<TResponse<RemoveSkillResponse>> {
    const res = await client.DeleteResponse<RemoveSkillResponse>(
      INTERNSHIP_ENDPOINTS.REMOVE_SKILL(params.skillId),
    );
    return toServiceResponse(res, {
      message: 'Skill berhasil dihapus dari profil',
    });
  }
}

export default new InternshipService();

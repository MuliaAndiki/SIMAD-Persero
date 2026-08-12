import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import type { InternshipParams, SkillQuery } from '@/types/api/internship.types';
import { useQuery } from '@tanstack/react-query';

export function useMyInternship() {
  return useQuery({
    queryKey: queryKey.internship.my(),
    queryFn: async () => {
      const res = await Api.Internship.My();
      return res.data;
    },
  });
}

export function useInternshipDetail(
  params: Pick<InternshipParams, 'id'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKey.internship.detail(params.id),
    queryFn: async () => {
      const res = await Api.Internship.Detail(params);
      return res.data;
    },
    enabled: options?.enabled,
  });
}

export function useMyInternProfile() {
  return useQuery({
    queryKey: queryKey.internship.profile(),
    queryFn: async () => {
      const res = await Api.Internship.MyProfile();
      return res.data;
    },
  });
}

export function useSkills(query: SkillQuery = {}) {
  return useQuery({
    queryKey: queryKey.internship.skills(query),
    queryFn: async () => {
      const res = await Api.Internship.GetSkills(query);
      return res.data ?? [];
    },
  });
}

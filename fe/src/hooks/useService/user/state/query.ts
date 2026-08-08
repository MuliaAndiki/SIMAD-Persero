import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';

import { useQuery } from '@tanstack/react-query';

export function useProfile() {
  return useQuery({
    queryKey: queryKey.user.profile(),
    queryFn: async () => {
      const res = await Api.User.GetProfile();
      return res.data;
    },
  });
}

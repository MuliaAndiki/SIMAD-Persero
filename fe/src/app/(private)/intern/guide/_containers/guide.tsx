'use client';

import { InternGuideSection } from '@/components/page/guide/InternGuideSection';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';

export default function InternGuideContainer() {
  const api = useApi();
  const guideQuery = api.guide.query.list();

  const guides: GuideItem[] = Array.isArray(guideQuery.data)
    ? guideQuery.data
    : ((guideQuery.data as any)?.data ?? []);

  return <InternGuideSection guides={guides} isLoading={guideQuery.isPending} />;
}

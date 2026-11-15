'use client';

import { InternGuideSection } from '@/components/page/guide/InternGuideSection';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function InternGuideContainer() {
  const api = useApi();
  const router = useRouter();
  const guideQuery = api.guide.query.list();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allGuides: GuideItem[] = Array.isArray(guideQuery.data)
    ? guideQuery.data
    : ((guideQuery.data as any)?.data ?? []);

  const guides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allGuides
      .filter((g) => g.isPublished !== false)
      .filter((g) => {
        if (selectedCategory !== 'ALL' && g.category !== selectedCategory) return false;
        if (!q) return true;
        return (
          g.title.toLowerCase().includes(q) ||
          (g.description?.toLowerCase().includes(q) ?? false) ||
          g.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [allGuides, selectedCategory, searchQuery]);

  const handleSelectGuide = (guide: GuideItem) => {
    router.push(`/intern/guide/${guide.slug}`);
  };

  const handleResetFilter = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
  };

  return (
    <InternGuideSection
      guides={guides}
      isLoading={guideQuery.isPending}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      onSearchChange={setSearchQuery}
      onCategoryChange={setSelectedCategory}
      onResetFilter={handleResetFilter}
      onSelectGuide={handleSelectGuide}
    />
  );
}

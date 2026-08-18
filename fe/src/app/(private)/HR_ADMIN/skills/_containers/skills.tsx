'use client';

import { SkillsSection } from '@/components/page/hr/SkillsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { SkillResponse } from '@/types/api/internship.types';
import { useCallback, useState } from 'react';

export default function SkillsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceSearchQuery = useDebounce(searchQuery, 500);

  const skillsQuery = api.internship.query.skills({
    search: debounceSearchQuery,
    limit: 50,
  });

  const createSkill = api.internship.mutate.createSkill();
  const updateSkill = api.internship.mutate.updateSkill();
  const deleteSkill = api.internship.mutate.deleteSkill();

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchQuery(keyword);
  }, [keyword]);

  const handleAddSkill = useCallback(
    async (data: { name: string; category: string }) => {
      await createSkill.mutateAsync(data);
    },
    [createSkill],
  );

  const handleUpdateSkill = useCallback(
    async (skill: SkillResponse, data: { name: string; category: string }) => {
      await updateSkill.mutateAsync({ params: { id: skill.id }, body: data });
    },
    [updateSkill],
  );

  const handleDeleteSkill = useCallback(
    async (skill: SkillResponse) => {
      await deleteSkill.mutateAsync({ id: skill.id });
    },
    [deleteSkill],
  );

  return (
    <SkillsSection
      state={{
        isPending: skillsQuery.isPending,
        isError: skillsQuery.isError,
        errorMessage: skillsQuery.error?.message,
        skills: skillsQuery.data ?? [],
        keyword,
        alert: ns.alert,
        isSaving: createSkill.isPending || updateSkill.isPending,
        isDeleting: deleteSkill.isPending,
      }}
      actions={{
        onKeywordChange: handleKeywordChange,
        onSearch: handleSearch,
        onAddSkill: handleAddSkill,
        onUpdateSkill: handleUpdateSkill,
        onDeleteSkill: handleDeleteSkill,
      }}
    />
  );
}

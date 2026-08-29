"use client";

import {
  type ProficiencyValue,
  ProfileSkillsSection,
  type SelectedSkill,
} from "@/components/page/profile/ProfileSkillsSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useDebounce } from "@/hooks/useDebounce";
import { useApi } from "@/hooks/useService/useApi";
import { useMemo, useState } from "react";

/**
 * Container halaman "Kelola Skill" (profile intern).
 *
 * - Pencarian skill dengan debounce → GET /internships/skill (useSkills).
 * - Skill yang dipilih ditampung dulu di `selectedSkills` (array lokal),
 *   baru dikirim sekali lewat POST /internships/add-skills (useAddSkillToIntern)
 *   saat tombol "Simpan" ditekan.
 * - Skill yang sudah tersimpan (profileSkills) ditandai & bisa dihapus
 *   lewat DELETE /internships/remove-skill/:skillId (useRemoveSkillFromIntern).
 */
export default function ProfileSkillsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();
  const [search, setSearch] = useState("");
  const [proficiency, setProficiency] = useState<ProficiencyValue>("BEGINNER");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const debouncedSearch = useDebounce(search, 400);

  const myProfile = api.internship.query.myProfile();
  const skills = api.internship.query.skills({
    search: debouncedSearch.trim() || undefined,
    limit: 20,
  });
  const addSkill = api.internship.mutate.addSkill();
  const removeSkill = api.internship.mutate.removeSkill();

  const addedSkillIds = useMemo(
    () =>
      new Set((myProfile.data?.profileSkills ?? []).map((ps) => ps.skillId)),
    [myProfile.data],
  );

  const removingSkillIds = useMemo(() => {
    if (!removeSkill.isPending || !removeSkill.variables)
      return new Set<string>();
    return new Set([removeSkill.variables.skillId]);
  }, [removeSkill.isPending, removeSkill.variables]);

  const handleToggleSelect = (skill: SelectedSkill["skill"]) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((item) => item.skill.id === skill.id);
      if (exists) {
        return prev.filter((item) => item.skill.id !== skill.id);
      }
      return [...prev, { skill, proficiency }];
    });
  };

  const handleRemoveSelected = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.filter((item) => item.skill.id !== skillId),
    );
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill.mutate({ skillId });
  };

  const handleSubmit = () => {
    if (!myProfile.data?.id || selectedSkills.length === 0) return;
    addSkill.mutate(
      {
        internProfileId: myProfile.data.id,
        skills: selectedSkills.map(({ skill, proficiency: level }) => ({
          skillId: skill.id,
          proficiency: level,
        })),
      },
      { onSuccess: () => setSelectedSkills([]) },
    );
  };

  return (
    <ProfileSkillsSection
      state={{
        search,
        proficiency,
        skills: skills.data ?? [],
        isLoading: skills.isLoading,
        isError: skills.isError,
        errorMessage: (skills.error as Error | undefined)?.message,
        addedSkillIds,
        removingSkillIds,
        isProfileLoading: myProfile.isLoading,
        hasProfile: Boolean(myProfile.data?.id),
        selectedSkills,
        isSubmitting: addSkill.isPending,
        router: ns.router,
      }}
      service={{
        onSearchChange: setSearch,
        onProficiencyChange: (value) => setProficiency(value),
        onToggleSelect: handleToggleSelect,
        onRemoveSelected: handleRemoveSelected,
        onRemoveSkill: handleRemoveSkill,
        onSubmit: handleSubmit,
      }}
    />
  );
}

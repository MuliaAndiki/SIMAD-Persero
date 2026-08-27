import {
  useAddSkillToIntern,
  useArchiveInternship,
  useAssignSupervisorInternship,
  useChangeDepartmentInternship,
  useCompleteOnboarding,
  useCreateInternProfile,
  useCreateSkill,
  useDeleteSkill,
  useExtendInternship,
  useFinishInternship,
  useRemoveSkillFromIntern,
  useStartInternship,
  useUpdateSkill,
} from './state/mutate';
import {
  useInternshipDetail,
  useInternshipList,
  useMyInternProfile,
  useMyInternship,
  useSkills,
} from './state/query';

export const useInternship = () => {
  return {
    query: {
      my: useMyInternship,
      list: useInternshipList,
      myProfile: useMyInternProfile,
      skills: useSkills,
      detail: useInternshipDetail,
    },
    mutate: {
      start: useStartInternship,
      finish: useFinishInternship,
      extend: useExtendInternship,
      assignSupervisor: useAssignSupervisorInternship,
      changeDepartment: useChangeDepartmentInternship,
      completeOnboarding: useCompleteOnboarding,
      archive: useArchiveInternship,
      createProfile: useCreateInternProfile,
      addSkill: useAddSkillToIntern,
      removeSkill: useRemoveSkillFromIntern,
      createSkill: useCreateSkill,
      updateSkill: useUpdateSkill,
      deleteSkill: useDeleteSkill,
    },
  };
};

import {
  useAddSkillToIntern,
  useArchiveInternship,
  useAssignSupervisorInternship,
  useChangeDepartmentInternship,
  useCreateInternProfile,
  useExtendInternship,
  useFinishInternship,
  useRemoveSkillFromIntern,
  useStartInternship,
} from './state/mutate';
import { useInternshipDetail, useMyInternProfile, useMyInternship, useSkills } from './state/query';

export const useInternship = () => {
  return {
    query: {
      my: useMyInternship,
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
      archive: useArchiveInternship,
      createProfile: useCreateInternProfile,
      addSkill: useAddSkillToIntern,
      removeSkill: useRemoveSkillFromIntern,
    },
  };
};

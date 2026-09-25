import {
  useSaveEvaluationDraft,
  useSubmitFinalEvaluation,
  useUpdateEvaluationDraft,
} from './state/mutate';
import {
  useEvaluationByInternship,
  useHrEvaluationList,
} from './state/query';

export const useEvaluation = () => {
  return {
    query: {
      byInternship: useEvaluationByInternship,
      hrList: useHrEvaluationList,
    },
    mutate: {
      saveDraft: useSaveEvaluationDraft,
      updateDraft: useUpdateEvaluationDraft,
      submitFinal: useSubmitFinalEvaluation,
    },
  };
};

import {
  useApproveCorrection,
  useCancelCorrection,
  useRejectCorrection,
  useSubmitCorrection,
} from './state/mutate';
import {
  useCorrectionDetail,
  useMyCorrectionList,
  useSupervisorCorrectionList,
} from './state/query';

export const useCorrection = () => {
  return {
    query: {
      myList: useMyCorrectionList,
      supervisorList: useSupervisorCorrectionList,
      detail: useCorrectionDetail,
    },
    mutate: {
      submit: useSubmitCorrection,
      approve: useApproveCorrection,
      reject: useRejectCorrection,
      cancel: useCancelCorrection,
    },
  };
};

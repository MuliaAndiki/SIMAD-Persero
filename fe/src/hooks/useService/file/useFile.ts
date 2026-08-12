import { useDeleteFile, useDownloadFile, useUploadFile } from './state/mutate';
import { useFileDetail } from './state/query';

export const useFile = () => {
  return {
    query: {
      detail: useFileDetail,
    },
    mutate: {
      upload: useUploadFile,
      delete: useDeleteFile,
      download: useDownloadFile,
    },
  };
};

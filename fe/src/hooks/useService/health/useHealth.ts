import { useHealthPing } from './state/query';

export const useHealth = () => {
  return {
    query: {
      ping: useHealthPing,
    },
  };
};

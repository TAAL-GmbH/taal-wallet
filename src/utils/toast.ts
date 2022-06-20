import toast from 'react-hot-toast';
import { getErrorMessage } from './generic';

export const createToast = (
  loadingMessage: string,
  { duration = 1000 } = {}
) => {
  const tLoading = toast.loading(loadingMessage, { duration });

  return {
    success: (...args: Parameters<typeof toast.success>) => {
      toast.dismiss(tLoading);
      toast.success(...args);
    },
    error: (
      e: unknown | string,
      options?: Parameters<typeof toast.error>[1]
    ) => {
      toast.dismiss(tLoading);
      const errorMessage =
        typeof e === 'string' ? e : getErrorMessage(e, 'Unknown error');
      toast.error(errorMessage, options);
    },
    dismiss: () => {
      toast.dismiss(tLoading);
    },
  };
};

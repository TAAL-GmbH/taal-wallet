import { useAppSelector } from '.';
import * as wocApi from '@/features/woc-api';
import { isNull } from '@/utils/generic';
import { createToast } from '@/utils/toast';

let lastRequestTime = 0;

export const useBlockchain = () => {
  const { activePk } = useAppSelector(state => state.pk);

  const getBalance = async ({ showToast = true }: { showToast?: boolean } = {}) => {
    const now = Date.now();

    if (now - lastRequestTime < 1000) {
      // Prevent spamming the API
      return;
    }

    lastRequestTime = now;

    const toast = showToast && createToast('Fetching balance...');
    if (!activePk?.address) {
      toast?.error('Please select an address');
      return;
    }
    const result = await wocApi.getBalance([activePk.address]).catch(err => {
      toast?.error(err);
      return null;
    });
    if (!isNull(result) && showToast) {
      toast?.success('Balance fetched successfully');
    }
  };

  const airdrop = async () => {
    const toast = createToast('Requesting Airdrop...');
    const success = await wocApi.airdrop(activePk.address).catch(toast.error);

    if (success) {
      setTimeout(getBalance, 5000);
      toast.success('Airdrop was successful!');
    }
  };

  return {
    getBalance,
    airdrop,
  };
};

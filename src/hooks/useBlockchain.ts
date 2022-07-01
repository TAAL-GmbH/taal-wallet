import { useAppSelector } from '.';
import * as woc from '../features/wocApiSlice';
import { isNull } from '../utils/generic';
import { createToast } from '../utils/toast';

export const useBlockchain = () => {
  const { activePk } = useAppSelector(state => state.pk);

  const getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!activePk?.address) {
      toast.error('Please select an address');
      return;
    }
    const result = await woc.getBalance([activePk.address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
    }
  };

  const airdrop = async () => {
    const toast = createToast('Requesting Airdrop...');
    const success = await woc.airdrop(activePk.address).catch(toast.error);

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

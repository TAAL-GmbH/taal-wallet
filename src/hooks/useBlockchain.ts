import { useAppSelector } from '.';
import { db } from '../db';
import * as wocApi from '../features/wocApi';
import { store } from '../store';
import { isNull } from '../utils/generic';
import { createToast } from '../utils/toast';
import * as accountSlice from '../features/accountSlice';

export const useBlockchain = () => {
  const { activePk } = useAppSelector(state => state.pk);

  const getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!activePk?.address) {
      toast.error('Please select an address');
      return;
    }
    const result = await wocApi.getBalance([activePk.address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
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

  const setActiveAccountId = async (accountId: string) => {
    await db.useAccount(accountId);
    store.dispatch(accountSlice.setActiveAccountId(accountId));
  };

  return {
    getBalance,
    airdrop,
    setActiveAccountId,
  };
};

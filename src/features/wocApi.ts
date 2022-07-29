import { store } from '../store';
import { WocApiError } from '../utils/errors/wocApiError';
import { setBatchBalance } from './pkSlice';
import { wocApiSlice } from './wocApiSlice';

export const getBalance = async (...args: Parameters<typeof wocApiSlice.endpoints.getBalance.initiate>) => {
  const resp = await store.dispatch(wocApiSlice.endpoints.getBalance.initiate(...args));
  if ('error' in resp) {
    console.error(resp.error);
    throw new WocApiError(resp.error);
  }
  const total = resp.data.reduce((acc, { balance }) => acc + balance.confirmed + balance.unconfirmed, 0);
  const preparedData = resp.data.map(({ address, balance: { confirmed, unconfirmed } }) => ({
    address,
    amount: confirmed + unconfirmed,
  }));
  store.dispatch(setBatchBalance(preparedData));
  return {
    data: resp.data,
    total,
  };
};

export const getUnspent = async (...args: Parameters<typeof wocApiSlice.endpoints.getUnspent.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.getUnspent.initiate(...args));

export const getHistory = async (...args: Parameters<typeof wocApiSlice.endpoints.getHistory.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.getHistory.initiate(...args));

export const getTokensUnspent = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getTokensUnspent.initiate>
) => store.dispatch(wocApiSlice.endpoints.getTokensUnspent.initiate(...args));

export const getTx = async (...args: Parameters<typeof wocApiSlice.endpoints.getTx.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.getTx.initiate(...args));

export const airdrop = async (...args: Parameters<typeof wocApiSlice.endpoints.airdrop.initiate>) => {
  // ignore error as response is a plain text
  const { error } = await store.dispatch(wocApiSlice.endpoints.airdrop.initiate(...args));
  const txId = 'data' in error ? (error.data as string) : '';

  if (!txId.match(/^[0-9a-fA-F]{64}$/)) {
    throw new Error(`Failed to get funds: ${txId}`);
  }
  return true;
};

export const broadcast = async (...args: Parameters<typeof wocApiSlice.endpoints.broadcast.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.broadcast.initiate(...args));

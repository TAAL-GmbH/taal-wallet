import { store } from '../store';
import { WocApiError } from '../utils/errors/wocApiError';
import { isString } from '../utils/generic';
import { setBatchBalance } from './pkSlice';
import { wocApiSlice } from './wocApiSlice';

export const getBalance = async (...args: Parameters<typeof wocApiSlice.endpoints.getBalance.initiate>) => {
  const resp = await store.dispatch(wocApiSlice.endpoints.getBalance.initiate(...args));
  if ('error' in resp) {
    console.error(resp.error);
    throw new WocApiError(resp.error);
  }
  // const total = resp.data.reduce((acc, { balance }) => acc + balance.confirmed + balance.unconfirmed, 0);
  const total = resp.data.reduce((acc, { balance }) => {
    return acc + (balance?.confirmed || 0) + (balance?.unconfirmed || 0);
  }, 0);

  const preparedData = resp.data.map(({ address, balance }) => {
    return {
      address,
      satoshis: (balance?.confirmed || 0) + (balance?.unconfirmed || 0),
    };
  });

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

export const getTokens = async (...args: Parameters<typeof wocApiSlice.endpoints.getTokens.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.getTokens.initiate(...args));

export const getTokensUnspent = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getTokensUnspent.initiate>
) => store.dispatch(wocApiSlice.endpoints.getTokensUnspent.initiate(...args));

export const getTx = async (...args: Parameters<typeof wocApiSlice.endpoints.getTx.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.getTx.initiate(...args));

export const getRawTransactionData = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getRawTransactionData.initiate>
) => {
  const { error } = await store.dispatch(wocApiSlice.endpoints.getRawTransactionData.initiate(...args));
  const txId = 'data' in error ? (error.data as string) : '';

  console.log({ txId });
  return txId;
};

export const airdrop = async (...args: Parameters<typeof wocApiSlice.endpoints.airdrop.initiate>) => {
  type AirdropData = string | { message: string };

  // ignore error as response is a plain text
  const { error } = await store.dispatch(wocApiSlice.endpoints.airdrop.initiate(...args));
  const txId = 'data' in error ? (error.data as AirdropData) : '';

  if (!isString(txId)) {
    throw new Error(txId.message || 'AirDrop error');
  }

  if (!txId.match(/^[0-9a-fA-F]{64}$/)) {
    throw new Error(`Failed to get funds: ${txId}`);
  }
  return true;
};

export const broadcast = async (...args: Parameters<typeof wocApiSlice.endpoints.broadcast.initiate>) =>
  store.dispatch(wocApiSlice.endpoints.broadcast.initiate(...args));

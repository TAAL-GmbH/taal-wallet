import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState, store } from '../store';
import { WocApiError } from '../utils/errors/wocApiError';
import { setBatchBalance } from './pkSlice';

const ORIGIN = 'https://taalnet.whatsonchain.com';
const BASE_PATH = '/v1/bsv';
const AUTH_HEADER = `Basic ${btoa('taal_private:dotheT@@l007')}`;

const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const { wocNetwork } = (api.getState() as RootState).pk.network;

  let baseUrl: string;
  // console.log({ args, api, extraOptions, endpoint: api.endpoint });
  if (api.endpoint === 'airdrop') {
    baseUrl = `${ORIGIN}`;
  } else {
    baseUrl = `${ORIGIN}${BASE_PATH}/${wocNetwork}`;
  }
  const rawBaseQuery = fetchBaseQuery({ baseUrl });
  return rawBaseQuery(args, api, extraOptions);
};

type Balance = {
  address: string;
  balance: {
    confirmed: number;
    unconfirmed: number;
  };
  error: string;
};

type Unspent = {
  height: number;
  tx_hash: string;
  tx_pos: number;
  value: number;
};

type TokensUnspent = {
  address: string;
  utxos: {
    redeemAddr: string;
    symbol: string;
    txid: string;
    index: number;
    amount: number;
  }[];
};

type TxInput = {
  coinbase: string;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txid: string;
  vout: number;
};

type TxOutput = {
  n: number;
  scriptPubKey: {
    address: string[];
    asm: string;
    hex: string;
    isTruncated: boolean;
    reqSigs: number;
    type: string;
  };
  value: number;
};

type Tx = {
  blockhash: string;
  blockheight: number;
  blocktime: number;
  confirmations: number;
  hash: string;
  locktime: number;
  size: number;
  time: number;
  txid: string;
  version: number;
  vin: TxInput[];
  vout: TxOutput[];
};

type History = {
  height: number;
  tx_hash: string;
};

export const wocApiSlice = createApi({
  reducerPath: 'wocApi',
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getBalance: builder.mutation<Balance[], string[]>({
      query: addressList => ({
        url: `/addresses/balance`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: { addresses: addressList },
      }),
    }),
    getUnspent: builder.query<Unspent[], string>({
      query: address => `/address/${address}/unspent`,
    }),
    getHistory: builder.query<History[], string>({
      query: address => `/address/${address}/history`,
    }),
    getTokensUnspent: builder.query<TokensUnspent, string>({
      query: address => `/address/${address}/tokens/unspent`,
    }),
    getTx: builder.query<Tx, string>({
      query: txId => `/tx/hash/${txId}`,
    }),
    airdrop: builder.query<string, string>({
      query: address => ({
        // url: `${ORIGIN}/faucet/send/${address}`,
        url: `/faucet/send/${address}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      }),
    }),
    broadcast: builder.mutation<string, string>({
      query: txhex => ({
        url: `/tx/raw?dontcheckfee=true`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: { txhex },
      }),
    }),
  }),
});

export const { useGetTxQuery } = wocApiSlice;

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

// react hooks
export const { useGetHistoryQuery } = wocApiSlice;

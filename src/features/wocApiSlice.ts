import { StartQueryActionCreatorOptions } from '@reduxjs/toolkit/dist/query/core/buildInitiate';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { store } from '../store';

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

export const wocApiSlice = createApi({
  reducerPath: 'wocApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://taalnet.whatsonchain.com/v1/bsv/taalnet',
  }),
  endpoints: builder => ({
    getUnspent: builder.query<Unspent[], string>({
      query: address => `/address/${address}/unspent`,
    }),
    getTokensUnspent: builder.query<TokensUnspent, string>({
      query: address => `/address/${address}/tokens/unspent`,
    }),
    getTx: builder.query<Tx, string>({
      query: txId => `/tx/hash/${txId}`,
    }),
    broadcast: builder.mutation<string, string>({
      query: txhex => ({
        url: '/tx/raw?dontcheckfee=true',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa('taal_private:dotheT@@l007')}`,
        },
        body: { txhex },
      }),
    }),
  }),
});

export const { useGetTxQuery } = wocApiSlice;

export const getBalance = async (
  address: string,
  options?: StartQueryActionCreatorOptions | undefined
) => {
  const optionsCombined = {
    forceRefetch: true,
    ...options,
  };

  const [{ data: unspentData }, { data: tokensUnspentData }] =
    await Promise.all([
      getUnspent(address, optionsCombined),
      getTokensUnspent(address, optionsCombined),
    ]);

  const tokensUnspentTotal =
    tokensUnspentData?.utxos?.reduce((acc, item) => acc + item.amount, 0) || 0;
  const unspentTotal =
    unspentData?.reduce((acc, item) => acc + item.value, 0) || 0;

  const total = tokensUnspentTotal + unspentTotal;

  store.dispatch({
    type: 'pk/setBalance',
    payload: {
      address,
      amount: total,
    },
  });

  return total;
};

export const getUnspent = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getUnspent.initiate>
) => store.dispatch(wocApiSlice.endpoints.getUnspent.initiate(...args));

export const getTokensUnspent = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getTokensUnspent.initiate>
) => store.dispatch(wocApiSlice.endpoints.getTokensUnspent.initiate(...args));

export const getTx = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.getTx.initiate>
) => store.dispatch(wocApiSlice.endpoints.getTx.initiate(...args));

export const broadcast = async (
  ...args: Parameters<typeof wocApiSlice.endpoints.broadcast.initiate>
) => store.dispatch(wocApiSlice.endpoints.broadcast.initiate(...args));

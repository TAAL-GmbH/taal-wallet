import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { networkList } from '../constants/networkList';
import { RootState } from '../store';
import { isObject } from '../utils/generic';

const ORIGIN = 'https://api.whatsonchain.com';
const ORIGIN_TALLNET = 'https://taalnet.whatsonchain.com';
const BASE_PATH = '/v1/bsv';
const AUTH_HEADER = 'Basic dGFhbF9wcml2YXRlOmRvdGhlVEBAbDAwNw';

const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const networkIdFromParams = isObject(args) && 'params' in args && args.params.__networkId;
  const networkIdFromState = (api.getState() as RootState)?.pk?.network?.id;
  const networkId = networkIdFromParams || networkIdFromState;

  const { wocNetwork } = networkList.find(({ id }) => id === networkId);
  const origin = networkId === 'taalnet' ? ORIGIN_TALLNET : ORIGIN;

  let baseUrl: string;
  if (api.endpoint === 'airdrop' && networkId === 'taalnet') {
    baseUrl = `${origin}`;
  } else {
    baseUrl = `${origin}${BASE_PATH}/${wocNetwork}`;
  }

  // TODO: remove authentication from createApi
  if (isObject(args) && 'headers' in args && networkId !== 'taalnet') {
    if ('Authorization' in args.headers) {
      delete args.headers.Authorization;
    }
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

export type Token = {
  protocol: string;
  redeemAddr: string;
  symbol: string;
  image: string;
  balance: number;
  tokenBalance?: number;
  name?: string;
  description?: string;
};

export type TokenDetails = {
  token: {
    token_id: string;
    symbol: string;
    name: string;
    description: string;
    schema_id: string;
    protocol: string;
    image: string;
    total_supply: number;
    sats_per_token: number;
    properties: {
      legal: unknown;
      issuer: unknown;
      meta: unknown;
    };
    contract_txs: string[];
    issuance_txs: string[];
  };
};

export type Unspent = {
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

export type History = {
  height: number;
  fee: number;
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
    getHistory: builder.query<History[], { address: string; networkId?: string }>({
      query: ({ address, networkId }) => {
        return {
          url: `/address/${address}/history`,
          params: { __networkId: networkId },
        };
      },
    }),
    getTokens: builder.query<{ address: string; tokens: Token[] }, string>({
      query: address => `/address/${address}/tokens`,
    }),
    getTokenDetails: builder.query<TokenDetails, { tokenId: string; symbol: string }>({
      query: ({ tokenId, symbol }) => `/token/${tokenId}/${symbol}`,
    }),
    getTokensUnspent: builder.query<TokensUnspent, string>({
      query: address => `/address/${address}/tokens/unspent`,
    }),
    getTx: builder.query<Tx, string>({
      query: txId => `/tx/hash/${txId}`,
    }),
    airdrop: builder.query<string, string>({
      query: address => ({
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

// react hooks
export const { useGetHistoryQuery, useGetTokensQuery, useGetTokenDetailsQuery } = wocApiSlice;
